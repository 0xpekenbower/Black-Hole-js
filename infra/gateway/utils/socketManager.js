import { getRedisClient } from '../config/redisClient.js';
import logger from '../logger/index.js';

/**
 * Store user socket mapping in Redis
 * @param {string} userId - The user ID
 * @param {string} socketId - The socket ID
 * @returns {Promise<boolean>} - Success status
 */
export async function storeUserSocket(userId, socketId) {
  try {
    const redisClient = getRedisClient();
    if (!redisClient || !redisClient.isOpen) {
      logger.error('Redis client not available for storing user socket');
      return false;
    }
    
    await redisClient.set(`user:${userId}`, socketId);
    logger.info(`Stored socket mapping for user ${userId} -> ${socketId}`);
    return true;
  } catch (err) {
    logger.error(`Failed to store socket mapping in Redis: ${err.message}`);
    return false;
  }
}

/**
 * Remove user socket mapping from Redis
 * @param {string} userId - The user ID
 * @returns {Promise<boolean>} - Success status
 */
export async function removeUserSocket(userId) {
  try {
    const redisClient = getRedisClient();
    if (!redisClient || !redisClient.isOpen) {
      logger.error('Redis client not available for removing user socket');
      return false;
    }
    
    await redisClient.del(`user:${userId}`);
    logger.info(`Removed socket mapping for user ${userId}`);
    return true;
  } catch (err) {
    logger.error(`Failed to remove socket mapping from Redis: ${err.message}`);
    return false;
  }
}

/**
 * Get socket ID for a user
 * @param {string} userId - The user ID
 * @returns {Promise<string|null>} - Socket ID or null if not found
 */
export async function getUserSocket(userId) {
  try {
    const redisClient = getRedisClient();
    if (!redisClient || !redisClient.isOpen) {
      logger.error('Redis client not available for getting user socket');
      return null;
    }
    
    const socketId = await redisClient.get(`user:${userId}`);
    return socketId;
  } catch (err) {
    logger.error(`Failed to get socket mapping from Redis: ${err.message}`);
    return null;
  }
}

/**
 * Check if a user is online (has an active socket connection)
 * @param {string} userId - The user ID
 * @returns {Promise<boolean>} - Whether the user is online
 */
export async function isUserOnline(userId) {
  const socketId = await getUserSocket(userId);
  return !!socketId;
}

/**
 * Get all online users
 * @returns {Promise<Array<string>>} - Array of user IDs
 */
export async function getOnlineUsers() {
  try {
    const redisClient = getRedisClient();
    if (!redisClient || !redisClient.isOpen) {
      logger.error('Redis client not available for getting online users');
      return [];
    }
    
    // Get all keys matching the pattern user:*
    const keys = await redisClient.keys('user:*');
    
    // Extract user IDs from keys
    return keys.map(key => key.replace('user:', ''));
  } catch (err) {
    logger.error(`Failed to get online users from Redis: ${err.message}`);
    return [];
  }
} 