import fastifyHttpProxy from '@fastify/http-proxy';
import { createApp, setupSocketIO } from './app.js';
import { registerProxyRoutes } from './proxy/index.js';
import { server as serverConfig, cors, redis as redisConfig } from './config/index.js';
import logger from './logger/index.js';
import { initializeApm } from './config/apm.js';
import kafka from './config/kafkaClient.js';

const serviceUnavailableHandler = (service) => {
  return (request, reply) => {
    logger.error(`Service unavailable: ${service}`);

    reply.code(503).send({
      Error: 'Service unavailable',
      code: 'SERVICE_UNAVAILABLE',
      message: `The ${service} is currently unavailable. Please try again later.`
    });
  };
};

// Initialize APM
let apm;
initializeApm().then(apmInstance => {
  apm = apmInstance;
}).catch(err => {
  logger.error(`Failed to initialize APM: ${err.message}`);
});

async function start() {
  try {
    const app = await createApp();
    
    app.addHook('onRequest', async (request, reply) => {
      if (!apm) return;
      
      const transaction = apm.startTransaction(request.raw.url, 'request');
      request.apmTransaction = transaction;
      
      const span = transaction.startSpan('gateway', 'request');
      request.apmSpan = span;
    });
    
    app.addHook('onResponse', async (request, reply) => {
      if (!apm || !request.apmTransaction) return;
      
      if (request.apmSpan) {
        request.apmSpan.end();
      }
      
      request.apmTransaction.result = reply.statusCode < 400 ? 'success' : 'failure';
      request.apmTransaction.end();
    });
    
    app.setErrorHandler((error, request, reply) => {
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        const path = request.raw.url;
        let service = 'Unknown service';

        if (path.startsWith('/api/auth')) service = 'Auth service';
        else if (path.startsWith('/api/dash')) service = 'Dashboard service';
        else if (path.startsWith('/api/chat')) service = 'Chat service';
        else if (path.startsWith('/api/game')) service = 'Game service';

        return serviceUnavailableHandler(service)(request, reply);
      }
      
      if (apm && request.apmTransaction) {
        apm.captureError(error, {
          request
        });
      }

      reply.send(error);
    });

    await registerProxyRoutes(app, fastifyHttpProxy);
    
    // Pre-decorate the app with an empty io property that will be populated later
    app.decorate('io', null);
    
    // Start the server
    await app.listen(serverConfig);
    
    // Setup Socket.IO with the raw HTTP server and update the io decorator
    const io = setupSocketIO(app.server);
    app.io = io;

    logger.info(`Server started on port ${app.server.address().port}`);
    logger.info(`Gateway Socket.IO initialized on path: /api/gateway/socket.io`);
  } catch (err) {
    logger.error(`Server error: ${err.message}`);
    process.exit(1);
  }
}

start();
