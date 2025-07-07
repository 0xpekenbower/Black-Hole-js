import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Server } from 'socket.io';
import { cors as corsConfig } from './config/index.js';
import { registerLifecycleHooks } from './logger/lifecycle.js';
import { registerApmHooks } from './logger/apm.js';
import { initializeRedis } from './config/redisClient.js';
import { registerRoutes } from './routes/index.js';
import logger from './logger/index.js';
import jwt from 'jsonwebtoken';
import { storeUserSocket, removeUserSocket } from './utils/socketManager.js';

export async function createApp() {
  const app = Fastify({ 
    logger: false, 
    disableRequestLogging: true,
  });  
      
  registerLifecycleHooks(app);
  registerApmHooks(app);
  
  await app.register(cors, corsConfig);
  
  // Initialize Redis client
  const redisClient = await initializeRedis();
  if (redisClient) {
    app.decorate('redis', redisClient);
  }
        
  await registerRoutes(app);
  
  return app;
}

function extractUserIdFromToken(token) {
  try {
    if (!token) return null;    
    if (token.startsWith('Bearer ')) {
      token = token.substring(7);
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    return decoded.id;
  } catch (err) {
    logger.error(`Error extracting user ID from token: ${err.message}`);
    return null;
  }
}

export function setupSocketIO(server) {
  const io = new Server(server, {
    cors: corsConfig,
    path: '/socket.io',
    serveClient: false,
    pingTimeout: 30000,
    pingInterval: 10000,
    connectTimeout: 30000,
    transports: ['websocket', 'polling'],
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || 
                   socket.handshake.headers.authorization;
      
      const userId = extractUserIdFromToken(token);
      
      if (userId) {
        socket.userId = userId;
        logger.info(`Socket authenticated for user: ${userId}`);
        return next();
      }      
      logger.info(`Anonymous socket connection: ${socket.id}`);
      next();
    } catch (err) {
      logger.error(`Socket authentication error: ${err.message}`);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    logger.info(`Client connected to gateway socket: ${socket.id}`);    
    if (socket.userId) {
      await storeUserSocket(socket.userId, socket.id);
    }
    socket.on('disconnect', async (reason) => {
      logger.info(`Client disconnected from gateway socket: ${socket.id}, Reason: ${reason}`);      
      if (socket.userId) {
        await removeUserSocket(socket.userId);
      }
    });
    socket.on('gateway:message', (data) => {
      logger.info(`Received message from ${socket.id}: ${JSON.stringify(data)}`);
      socket.emit('gateway:response', { message: 'Message received', data });
    });

    socket.emit('gateway:welcome', { message: 'Connected to gateway socket' });
  });

  return io;
}
