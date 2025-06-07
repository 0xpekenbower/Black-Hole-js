import Fastify from 'fastify';
import cors from '@fastify/cors';
import { cors as corsConfig } from './config/index.js';
import logger from './logger/index.js';
import { registerLoggerHooks } from './logger/hooks.js';

export async function createApp() {
  const app = Fastify({ 
    logger: logger
  });  
  registerLoggerHooks(app);  
  await app.register(cors, corsConfig);
  return app;
}
