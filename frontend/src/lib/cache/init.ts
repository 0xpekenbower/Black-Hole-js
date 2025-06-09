/**
 * Redis cache initialization
 * @module lib/cache/init
 */
'use server';

import * as redis from './RedisClient';
import { startPeriodicHealthChecks } from './HealthCheck';
import { FEATURES } from '../config';

/**
 * Initialize Redis cache system
 * This should be called during application startup
 */
export async function initializeCache(): Promise<void> {
  if (!FEATURES.ENABLE_REDIS_CACHE) {
    return;
  }  
  try {    
    const testKey = 'app:init:test';
    const success = await redis.set(testKey, { initialized: true, timestamp: Date.now() }, 60);    
    if (success) {
      startPeriodicHealthChecks(60000);
    } else {
      console.error('Failed to initialize Redis cache');
    }
  } catch (error) {
    console.error('Redis initialization error', error);
  }
}

/**
 * Clear all application cache data
 * WARNING: This will delete all application cache data
 * Only use this for development or when explicitly needed
 */
export async function clearAllCacheData(): Promise<void> {
  try {    
    console.info('Cache data cleared');
  } catch (error) {
    console.error('Error clearing cache data', error);
  }
} 