import logger from './index.js';

export function registerLoggerHooks(fastify) {
  fastify.addHook('onRoute', (routeOptions) => {
    const { method, url } = routeOptions;
    logger.debug(`Route registered: ${method} ${url}`);
  });

  fastify.addHook('onRequest', (request, reply, done) => {
    request.log.info({
      url: request.raw.url,
      method: request.raw.method,
      ip: request.ip,
      userAgent: request.headers['user-agent']
    }, 'Incoming request');
    done();
  });

  fastify.addHook('onResponse', (request, reply, done) => {
    request.log.info({
      url: request.raw.url,
      method: request.raw.method,
      statusCode: reply.statusCode,
      responseTime: reply.getResponseTime()
    }, 'Request completed');
    done();
  });

  fastify.addHook('onError', (request, reply, error, done) => {
    request.log.error({
      url: request.raw.url,
      method: request.raw.method,
      error: {
        message: error.message,
        stack: error.stack
      }
    }, 'Request error');
    done();
  });
} 