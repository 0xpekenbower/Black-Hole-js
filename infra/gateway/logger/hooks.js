import logger from './index.js';

export function registerLoggerHooks(fastify) {
  
  fastify.addHook('onRoute', (routeOptions) => {
  });

  fastify.addHook('onRequest', (request, reply, done) => {
    done();
  });

  fastify.addHook('onResponse', (request, reply, done) => {
    done();
  });

  fastify.addHook('onError', (request, reply, error, done) => {
    done();
  });
} 