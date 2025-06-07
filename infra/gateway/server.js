import fastifyHttpProxy from '@fastify/http-proxy';
import { createApp } from './app.js';
import { registerProxyRoutes } from './proxy/index.js';
import { server as serverConfig } from './config/index.js';
import logger from './logger/index.js';

async function start() {
  try {
    const app = await createApp();
    await registerProxyRoutes(app, fastifyHttpProxy);    
    await app.listen(serverConfig);
    logger.info(`Gateway listening on ${app.server.address().port}`);
  } catch (err) {
    logger.error('Error starting server:', err);
    process.exit(1);
  }
}

start();
