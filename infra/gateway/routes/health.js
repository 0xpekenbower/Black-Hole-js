import { getRedisClient } from '../config/redisClient.js';

export async function registerHealthRoutes(app) {
  app.get('/health', async (request, reply) => {
    const redisClient = getRedisClient();
    const redisStatus = redisClient && redisClient.isOpen ? 'connected' : 'disconnected';
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        redis: redisStatus
      }
    };
  });
} 