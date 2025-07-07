import kafka from '../config/kafkaClient.js';
import logger from '../logger/index.js';
import { kafka as kafkaConfig } from '../config/index.js';
import { sendNotificationToUser, broadcastNotification } from '../utils/notificationSender.js';
import { isUserOnline } from '../utils/socketManager.js';

/**
 * Initialize Kafka consumer for the gateway service
 * This consumer will listen for events from various services
 * and process them accordingly
 * 
 * @param {Object} app - Fastify app instance
 * @returns {Promise<void>}
 */
const initKafkaConsumer = async (app) => {
  try {
    const consumer = kafka.consumer({ groupId: 'gateway-group' });
    
    // Store the consumer instance on the app for later use
    app.decorate('kafkaConsumer', consumer);
    
    await consumer.connect();
    logger.info('Kafka consumer connected successfully');
    // Subscribe to topics
    await consumer.subscribe({ topic: 'notifications', fromBeginning: false });
    await consumer.subscribe({ topic: 'user-events', fromBeginning: false });
    
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const messageValue = JSON.parse(message.value.toString());
          logger.info(`Received Kafka message on topic: ${topic}`);          
          switch (topic) {
            case 'notifications':
              await handleNotification(messageValue);
              break;
              
            case 'user-events':
              await handleUserEvent(messageValue);
              break;
              
            default:
              logger.info(`Received message on unhandled topic ${topic}`);
          }
        } catch (error) {
          logger.error(`Error processing Kafka message: ${error.message}`);
        }
      },
    });
    
    // Add a hook to disconnect Kafka when the app is shutting down
    app.addHook('onClose', async () => {
      logger.info('Disconnecting Kafka consumer');
      await consumer.disconnect();
    });
    
  } catch (error) {
    logger.error(`Failed to initialize Kafka consumer: ${error.message}`);
  }
};

/**
 * Handle notification messages from Kafka
 * @param {Object} notification - The notification object
 */
async function handleNotification(notification) {
  try {
    const { notifType, senderId, receiverId, content } = notification;
    
    logger.info(`Processing notification: ${notifType} for user ${receiverId}`);
    
    // Check if the receiver is online
    const isOnline = await isUserOnline(receiverId);
    
    if (isOnline) {
      // Send notification via socket
      await sendNotificationToUser(receiverId, 'notification', {
        type: notifType,
        senderId,
        content,
        timestamp: new Date().toISOString()
      });
      
      logger.info(`Notification sent to online user ${receiverId}`);
    } else {
      logger.info(`User ${receiverId} is offline, notification will be stored`);
    }
    
  } catch (error) {
    logger.error(`Error handling notification: ${error.message}`);
  }
}

/**
 * Handle user events from Kafka
 * @param {Object} event - The user event object
 */
async function handleUserEvent(event) {
  try {
    const { eventType, userId, data } = event;
    
    logger.info(`Processing user event: ${eventType} for user ${userId}`);
    
    switch (eventType) {
      case 'user_login':
        logger.info(`User ${userId} logged in`);
        break;
        
      case 'user_logout':
        logger.info(`User ${userId} logged out`);
        break;
        
      case 'status_change':
        logger.info(`User ${userId} changed status to ${data.status}`);
        break;
        
      default:
        logger.info(`Unhandled user event type: ${eventType}`);
    }
    
  } catch (error) {
    logger.error(`Error handling user event: ${error.message}`);
  }
}

export default initKafkaConsumer; 