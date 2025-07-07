import { createClient } from 'redis';
import { redis as redisConfig } from './index.js';
import logger from '../logger/index.js';

let redisClient = null;

export async function initializeRedis() {
  try {
    redisClient = createClient({
      url: `redis://${redisConfig.host}:${redisConfig.port}`,
      password: redisConfig.password
    });

    redisClient.on('error', (err) => {
      logger.error(`Redis client error: ${err.message}`);
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected successfully');
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis client reconnecting');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    await redisClient.connect();
    return redisClient;
  } catch (err) {
    logger.error(`Failed to initialize Redis client: ${err.message}`);
    return null;
  }
}

export function getRedisClient() {
  return redisClient;
} 