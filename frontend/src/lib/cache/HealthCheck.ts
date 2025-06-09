/**
 * Redis health check utilities
 * @module lib/cache/HealthCheck
 */
'use server';

import * as redis from './RedisClient';

/**
 * Redis health status
 */
export interface RedisHealthStatus {
  isConnected: boolean;
  lastChecked: Date;
  responseTimeMs?: number;
}

/**
 * Check Redis connection health
 * @returns Promise with health status
 */
export async function checkRedisHealth(): Promise<RedisHealthStatus> {
  const startTime = Date.now();
  let isConnected = false;
  
  try {
    const testKey = 'health:check:ping';
    await redis.set(testKey, { timestamp: startTime }, 10); // 10 seconds TTL
    const result = await redis.get(testKey);
    
    isConnected = result !== null && typeof result === 'object' && 'timestamp' in result;
    
    await redis.del(testKey);
  } catch (error) {
    console.error('Redis health check failed', error);
    isConnected = false;
  }
  
  const responseTimeMs = Date.now() - startTime;
  
  if (isConnected) {
    console.info(`Redis health check: OK (${responseTimeMs}ms)`);
  } else {
    console.warn(`Redis health check: FAILED (${responseTimeMs}ms)`);
  }
  
  return {
    isConnected,
    lastChecked: new Date(),
    responseTimeMs,
  };
}

/**
 * Start periodic health checks
 * @param intervalMs - Check interval in milliseconds
 * @param callback - Optional callback function to handle health status
 * @returns Interval ID for stopping checks
 */
export function startPeriodicHealthChecks(
  intervalMs = 30000, // 30 seconds default
  callback?: (status: RedisHealthStatus) => void
): NodeJS.Timeout {
  console.info(`Starting periodic Redis health checks (interval: ${intervalMs}ms)`);
  
  return setInterval(async () => {
    const status = await checkRedisHealth();
    
    if (callback) {
      callback(status);
    }
  }, intervalMs);
}

/**
 * Stop periodic health checks
 * @param intervalId - Interval ID from startPeriodicHealthChecks
 */
export function stopPeriodicHealthChecks(intervalId: NodeJS.Timeout): void {
  clearInterval(intervalId);
  console.info('Stopped periodic Redis health checks');
} 