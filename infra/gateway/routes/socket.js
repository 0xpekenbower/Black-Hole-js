import { getUserSocket, isUserOnline, getOnlineUsers } from '../utils/socketManager.js';

export async function registerSocketRoutes(app) {
  app.get('/api/socket/online-users', async (request, reply) => {
    const onlineUsers = await getOnlineUsers();
    return { 
      count: onlineUsers.length,
      users: onlineUsers 
    };
  });

  app.get('/api/socket/user/:userId/status', async (request, reply) => {
    const { userId } = request.params;
    const isOnline = await isUserOnline(userId);
    
    return {
      userId,
      online: isOnline
    };
  });

  app.get('/api/socket/user/:userId/socket', async (request, reply) => {
    const { userId } = request.params;
    const socketId = await getUserSocket(userId);
    
    if (!socketId) {
      return reply.code(404).send({
        error: 'User socket not found',
        message: 'The user is not currently online'
      });
    }
    
    return {
      userId,
      socketId
    };
  });
} 