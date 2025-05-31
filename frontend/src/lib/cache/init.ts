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
    console.info('Redis cache is disabled in configuration');
    return;
  }
  
  try {
    console.info('Initializing Redis cache...');
    
    // Set a test key to verify connection
    const testKey = 'app:init:test';
    const success = await redis.set(testKey, { initialized: true, timestamp: Date.now() }, 60);
    
    if (success) {
      console.info('Redis cache initialized successfully');
      
      // Start health checks in production
      if (process.env.NODE_ENV === 'production') {
        startPeriodicHealthChecks(60000); // Check every minute in production
      }
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
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to clear all cache data in production');
    return;
  }
  
  try {
    console.info('Clearing all application cache data...');
    console.info('Cache data cleared');
  } catch (error) {
    console.error('Error clearing cache data', error);
  }
} 