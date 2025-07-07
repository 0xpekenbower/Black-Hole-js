import { getUserSocket } from './socketManager.js';
import logger from '../logger/index.js';

let io = null;

/**
 * Initialize the notification sender with Socket.IO instance
 * @param {Object} socketIO - Socket.IO instance
 */
export function initializeNotificationSender(socketIO) {
  io = socketIO;
  logger.info('Notification sender initialized with Socket.IO instance');
}

/**
 * Send a notification to a specific user
 * @param {string} userId - The user ID
 * @param {string} event - The event name
 * @param {Object} data - The notification data
 * @returns {Promise<boolean>} - Success status
 */
export async function sendNotificationToUser(userId, event, data) {
  try {
    if (!io) {
      logger.error('Socket.IO instance not initialized for notification sender');
      return false;
    }

    const socketId = await getUserSocket(userId);
    if (!socketId) {
      logger.warn(`Cannot send notification to user ${userId}: User is offline`);
      return false;
    }

    const socket = io.sockets.sockets.get(socketId);
    if (!socket) {
      logger.warn(`Cannot send notification to user ${userId}: Socket not found`);
      return false;
    }

    socket.emit(event, data);
    logger.info(`Notification sent to user ${userId} on event ${event}`);
    return true;
  } catch (err) {
    logger.error(`Failed to send notification to user ${userId}: ${err.message}`);
    return false;
  }
}

/**
 * Broadcast a notification to all connected users
 * @param {string} event - The event name
 * @param {Object} data - The notification data
 * @returns {boolean} - Success status
 */
export function broadcastNotification(event, data) {
  try {
    if (!io) {
      logger.error('Socket.IO instance not initialized for notification sender');
      return false;
    }

    io.emit(event, data);
    logger.info(`Broadcast notification sent on event ${event}`);
    return true;
  } catch (err) {
    logger.error(`Failed to broadcast notification: ${err.message}`);
    return false;
  }
}

/**
 * Send a notification to multiple users
 * @param {Array<string>} userIds - Array of user IDs
 * @param {string} event - The event name
 * @param {Object} data - The notification data
 * @returns {Promise<Object>} - Result with success and failure counts
 */
export async function sendNotificationToMultipleUsers(userIds, event, data) {
  const results = {
    total: userIds.length,
    success: 0,
    failed: 0,
    offlineUsers: 0
  };

  for (const userId of userIds) {
    const success = await sendNotificationToUser(userId, event, data);
    if (success) {
      results.success++;
    } else {
      results.failed++;
      const isOnline = await getUserSocket(userId);
      if (!isOnline) {
        results.offlineUsers++;
      }
    }
  }

  return results;
} 