import fastifyHttpProxy from '@fastify/http-proxy';
import { createApp } from './app.js';
import { registerProxyRoutes } from './proxy/index.js';
import { server as serverConfig } from './config/index.js';
import logger from './logger/index.js';
import { initializeApm } from './config/apm.js';


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

      reply.send(error);
    });

    await registerProxyRoutes(app, fastifyHttpProxy);
    await app.listen(serverConfig);

    logger.info(`Server started on port ${app.server.address().port}`);
  } catch (err) {
    logger.error(`Server error: ${err.message}`);
    process.exit(1);
  }
}

start();
