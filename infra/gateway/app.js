import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Server } from 'socket.io';
import { cors as corsConfig } from './config/index.js';
import { registerLifecycleHooks } from './logger/lifecycle.js';
import { registerApmHooks } from './logger/apm.js';

export async function createApp() {
  const app = Fastify({ 
    logger: false, 
    disableRequestLogging: true,
  });  
      
  registerLifecycleHooks(app);
  registerApmHooks(app);
  
  await app.register(cors, corsConfig);
  
  return app;
}

export function setupSocketIO(server) {
  const io = new Server(server, {
    cors: corsConfig,
    path: '/api/gateway/socket.io',
  });

  io.on('connection', (socket) => {
    console.log('Client connected to gateway socket');
    
    socket.on('disconnect', () => {
      console.log('Client disconnected from gateway socket');
    });
    
    socket.on('gateway:message', (data) => {
      console.log('Received message:', data);
      socket.emit('gateway:response', { message: 'Message received', data });
    });
  });

  return io;
}
