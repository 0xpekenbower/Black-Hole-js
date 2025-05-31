/**
 * Redis client for caching and session management
 * @module lib/cache/RedisClient
 */
'use server';

import { createClient } from 'redis';
import { REDIS_CONFIG } from '../config';

// Create a Redis client instance
const client = createClient({
  socket: {
    host: 'localhost',
    port: 6379,
    connectTimeout: REDIS_CONFIG.CONNECT_TIMEOUT,
    reconnectStrategy: (retries) => {
      // Exponential backoff with max 10 second delay
      return Math.min(Math.pow(2, retries) * 100, 10000);
    }
  },
  password: REDIS_CONFIG.PASSWORD
});

// Initialize connection
let connectionPromise: Promise<void> | null = null;

/**
 * Ensures Redis client is connected
 */
async function ensureConnection() {
  if (!connectionPromise) {
    connectionPromise = (async () => {
      try {
        await client.connect();
      } catch (err) {
        connectionPromise = null;
        throw err;
      }
    })();
  }
  return connectionPromise;
}

/**
 * Get a value from Redis
 * @param key - The key to retrieve
 * @returns The value or null if not found
 */
export async function get<T>(key: string): Promise<T | null> {
  try {
    await ensureConnection();
    const value = await client.get(key);
    return value ? JSON.parse(value) as T : null;
  } catch (error) {
    return null;
  }
}

/**
 * Set a value in Redis
 * @param key - The key to set
 * @param value - The value to store
 * @param expiryInSeconds - Optional expiry time in seconds
 * @returns Success status
 */
export async function set<T>(key: string, value: T, expiryInSeconds?: number): Promise<boolean> {
  try {
    await ensureConnection();
    const serialized = JSON.stringify(value);
    
    if (expiryInSeconds) {
      await client.setEx(key, expiryInSeconds, serialized);
    } else {
      await client.set(key, serialized);
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Delete a key from Redis
 * @param key - The key to delete
 * @returns Success status
 */
export async function del(key: string): Promise<boolean> {
  try {
    await ensureConnection();
    await client.del(key);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if a key exists in Redis
 * @param key - The key to check
 * @returns Whether the key exists
 */
export async function exists(key: string): Promise<boolean> {
  try {
    await ensureConnection();
    const result = await client.exists(key);
    return result === 1;
  } catch (error) {
    return false;
  }
}

/**
 * Set an expiry time on a key
 * @param key - The key to set expiry on
 * @param expiryInSeconds - Expiry time in seconds
 * @returns Success status
 */
export async function expire(key: string, expiryInSeconds: number): Promise<boolean> {
  try {
    await ensureConnection();
    await client.expire(key, expiryInSeconds);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get the remaining time to live for a key
 * @param key - The key to check
 * @returns Remaining time in seconds, -1 if no expiry, -2 if key doesn't exist
 */
export async function ttl(key: string): Promise<number> {
  try {
    await ensureConnection();
    return await client.ttl(key);
  } catch (error) {
    return -2;
  }
}

/**
 * Increment a key's value
 * @param key - The key to increment
 * @param increment - Amount to increment by (default: 1)
 * @returns New value after increment, or null on error
 */
export async function increment(key: string, increment: number = 1): Promise<number | null> {
  try {
    await ensureConnection();
    return await client.incrBy(key, increment);
  } catch (error) {
    return null;
  }
}

/**
 * Shutdown the Redis client
 */
export async function shutdown(): Promise<void> {
  if (client.isOpen) {
    await client.quit();
  }
} 