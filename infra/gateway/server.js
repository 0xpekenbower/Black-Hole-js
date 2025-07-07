import fastifyHttpProxy from '@fastify/http-proxy';
import { createApp, setupSocketIO } from './app.js';
import { registerProxyRoutes } from './proxy/index.js';
import { server as serverConfig, cors, redis as redisConfig } from './config/index.js';
import logger from './logger/index.js';
import { initializeApm } from './config/apm.js';
import kafka from './config/kafkaClient.js';
import { getRedisClient } from './config/redisClient.js';
import { initializeNotificationSender } from './utils/notificationSender.js';
import initKafkaConsumer from './kafka/consumer.js';

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

async function start() {
  try {
    const app = await createApp();    
    let apm;
    initializeApm().then(apmInstance => {
      apm = apmInstance;
    }).catch(err => {
      logger.error(`Failed to initialize APM: ${err.message}`);
    });
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
    
    app.decorate('io', null);    
    await app.listen(serverConfig);
    const io = setupSocketIO(app.server);
    app.io = io;
    
    initializeNotificationSender(io);
    await initKafkaConsumer(app);
    logger.info(`Server started on port ${app.server.address().port}`);
    logger.info(`Gateway Socket.IO initialized on path: /socket.io`);
    const closeGracefully = async () => {
      logger.info('Shutting down server...');
      const redisClient = getRedisClient();
      if (redisClient && redisClient.isOpen) {
        logger.info('Closing Redis connection...');
        await redisClient.quit();
      }
      await app.close();
      process.exit(0);
    };
    process.on('SIGINT', closeGracefully);
    process.on('SIGTERM', closeGracefully);
  } catch (err) {
    logger.error(`Server error: ${err.message}`);
    process.exit(1);
  }
}

start();
