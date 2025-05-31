/**
 * Authentication cache service for managing auth-related data in Redis
 * @module lib/cache/AuthCache
 */
'use server';

import { v4 as uuidv4 } from 'uuid';
import * as redis from './RedisClient';

/**
 * Cache key prefixes for different types of data
 */
const CACHE_KEYS = {
  OTP_TOKEN: 'auth:otp:token:',
  OTP_EMAIL: 'auth:otp:email:',
  OTP_ATTEMPTS: 'auth:otp:attempts:',
  PASSWORD_RESET_TOKEN: 'auth:pwd:token:',
  USER_SESSION: 'auth:session:',
};

/**
 * OTP token data structure
 */
interface OTPTokenData {
  email: string;
  code: number;
  retry: number;
  expiresAt: Date;
}

/**
 * Store an OTP token with associated email and code
 * @param email - User email
 * @param code - OTP code
 * @param expiryInSeconds - Token expiration time in seconds
 * @returns Token and expiration date
 */
export async function storeOTPToken(
  email: string,
  code: number,
  expiryInSeconds: number = 300 // 5 minutes default
): Promise<{ token: string; expiresAt: Date }> {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + expiryInSeconds * 1000);
  
  const tokenData: OTPTokenData = {
    email,
    code,
    retry: 3, // Default 3 retry attempts
    expiresAt,
  };
  
  // Store token data
  await redis.set(
    CACHE_KEYS.OTP_TOKEN + token,
    tokenData,
    expiryInSeconds
  );
  
  // Store email reference to prevent multiple tokens for same email
  await redis.set(
    CACHE_KEYS.OTP_EMAIL + email,
    { token },
    expiryInSeconds
  );
  
  return { token, expiresAt };
}

/**
 * Verify an OTP code against a stored token
 * @param token - OTP token
 * @param code - OTP code to verify
 * @returns Token data if valid, null if invalid
 */
export async function verifyOTP(
  token: string,
  code: number
): Promise<{ token: string; retry: number; expiresAt: Date } | null> {
  // Get token data from cache
  const tokenData = await redis.get<OTPTokenData>(CACHE_KEYS.OTP_TOKEN + token);
  
  if (!tokenData) {
    return null; // Token not found
  }
  
  // Check if token is expired
  if (new Date() > new Date(tokenData.expiresAt)) {
    await redis.del(CACHE_KEYS.OTP_TOKEN + token);
    await redis.del(CACHE_KEYS.OTP_EMAIL + tokenData.email);
    return null;
  }
  
  // Check if code matches
  if (tokenData.code !== code) {
    // Decrement retry count
    tokenData.retry -= 1;
    
    // If no retries left, invalidate token
    if (tokenData.retry <= 0) {
      await redis.del(CACHE_KEYS.OTP_TOKEN + token);
      await redis.del(CACHE_KEYS.OTP_EMAIL + tokenData.email);
      return null;
    }
    
    // Update token data with decremented retry count
    const ttl = await redis.ttl(CACHE_KEYS.OTP_TOKEN + token);
    await redis.set(
      CACHE_KEYS.OTP_TOKEN + token,
      tokenData,
      ttl > 0 ? ttl : 300
    );
    
    return {
      token,
      retry: tokenData.retry,
      expiresAt: new Date(tokenData.expiresAt),
    };
  }
  
  // Code matches, extend token expiration for password reset
  const newExpiryInSeconds = 180; // 3 minutes to complete password reset
  const expiresAt = new Date(Date.now() + newExpiryInSeconds * 1000);
  
  // Update token data with new expiration
  tokenData.expiresAt = expiresAt;
  await redis.set(
    CACHE_KEYS.OTP_TOKEN + token,
    tokenData,
    newExpiryInSeconds
  );
  
  // Return success with token and expiration
  return {
    token,
    retry: tokenData.retry,
    expiresAt,
  };
}

/**
 * Store a password reset token
 * @param token - Password reset token
 * @param email - User email
 * @param expiryInSeconds - Token expiration time in seconds
 * @returns Expiration date
 */
export async function storePasswordResetToken(
  token: string,
  email: string,
  expiryInSeconds: number = 180 // 3 minutes default
): Promise<Date> {
  const expiresAt = new Date(Date.now() + expiryInSeconds * 1000);
  
  await redis.set(
    CACHE_KEYS.PASSWORD_RESET_TOKEN + token,
    { email, expiresAt },
    expiryInSeconds
  );
  
  return expiresAt;
}

/**
 * Verify a password reset token
 * @param token - Password reset token
 * @returns Email associated with token if valid, null if invalid
 */
export async function verifyPasswordResetToken(token: string): Promise<string | null> {
  const data = await redis.get<{ email: string; expiresAt: Date }>(
    CACHE_KEYS.PASSWORD_RESET_TOKEN + token
  );
  
  if (!data) {
    return null;
  }
  
  // Check if token is expired
  if (new Date() > new Date(data.expiresAt)) {
    await redis.del(CACHE_KEYS.PASSWORD_RESET_TOKEN + token);
    return null;
  }
  
  return data.email;
}

/**
 * Invalidate a password reset token
 * @param token - Password reset token to invalidate
 */
export async function invalidatePasswordResetToken(token: string): Promise<void> {
  await redis.del(CACHE_KEYS.PASSWORD_RESET_TOKEN + token);
}

/**
 * Store user session data
 * @param userId - User ID
 * @param sessionData - Session data to store
 * @param expiryInSeconds - Session expiration time in seconds
 */
export async function storeUserSession(
  userId: string,
  sessionData: any,
  expiryInSeconds: number = 86400 // 24 hours default
): Promise<void> {
  await redis.set(
    CACHE_KEYS.USER_SESSION + userId,
    {
      ...sessionData,
      lastUpdated: new Date(),
    },
    expiryInSeconds
  );
}

/**
 * Get user session data
 * @param userId - User ID
 * @returns Session data if found, null if not found
 */
export async function getUserSession<T>(userId: string): Promise<T | null> {
  return redis.get<T>(CACHE_KEYS.USER_SESSION + userId);
}

/**
 * Invalidate a user session
 * @param userId - User ID
 */
export async function invalidateUserSession(userId: string): Promise<void> {
  await redis.del(CACHE_KEYS.USER_SESSION + userId);
} 