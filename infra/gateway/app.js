import Fastify from 'fastify';
import cors from '@fastify/cors';
import { cors as corsConfig } from './config/index.js';
import { registerLifecycleHooks } from './logger/lifecycle.js';

export async function createApp() {
  const app = Fastify({ 
    logger: false, 
    disableRequestLogging: true,
  });  
      
  registerLifecycleHooks(app);
  
  await app.register(cors, corsConfig);
  
  return app;
}
