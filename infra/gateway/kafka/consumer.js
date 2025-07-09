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
    const consumer = kafka.consumer({ groupId: 'gateway-grp' }) 
    
    await consumer.connect();
    logger.info('Kafka consumer connected successfully');
    // Subscribe to topics
    await consumer.subscribe({ topic: 'newRelation', fromBeginning: false });
    await consumer.subscribe({ topic: 'newMsg', fromBeginning: false });
    
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const messageValue = JSON.parse(message.value.toString());
          logger.info(`Received Kafka message on topic: ${topic}`);          
          switch (topic) {
            case 'newRelation':
              await handleRelationEvent(messageValue);
              break;
              
            case 'newMsg':
              await handleNewMessage(messageValue);
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
    // app.addHook('onClose', async () => {
    //   logger.info('Disconnecting Kafka consumer');
    //   await consumer.disconnect();
    // });
    
  } catch (error) {
    logger.error(`Failed to initialize Kafka consumer: ${error.message}`);
  }
};

/**
 * Handle relationship events from Kafka
 * @param {Object} relationEvent - The relationship event object
 */
async function handleRelationEvent(relationEvent) {
  try {
    const { sender, receiver, requestType, created_at } = relationEvent;
    
    logger.info(`Processing relation event: ${requestType} from ${sender} to ${receiver}`);
    
    // Map request types to human-readable notifications
    let notificationType;
    let notificationContent;
    
    switch (requestType) {
      case 1:
        notificationType = 'friend_request';
        notificationContent = 'sent you a friend request';
        break;
      case 2:
        notificationType = 'friend_accept';
        notificationContent = 'accepted your friend request';
        break;
      case 3:
        notificationType = 'friend_deny';
        notificationContent = 'denied your friend request';
        break;
      case 4:
        notificationType = 'friend_cancel';
        notificationContent = 'canceled their friend request';
        break;
      case -1:
        notificationType = 'user_block';
        notificationContent = 'blocked you';
        break;
      case -2:
        notificationType = 'user_unblock';
        notificationContent = 'unblocked you';
        break;
      default:
        notificationType = 'relation_update';
        notificationContent = 'updated their relationship with you';
    }
    
    // For friend requests (type 1), notify the receiver
    // For other types, notify based on the action
    const recipientId = requestType === 1 ? receiver : sender;
    const senderId = requestType === 1 ? sender : receiver;
    
    // Check if the recipient is online
    const isOnline = await isUserOnline(recipientId);
    
    if (isOnline) {
      // Send notification via socket
      await sendNotificationToUser(recipientId, 'relation', {
        type: notificationType,
        senderId,
        content: notificationContent,
        timestamp: created_at || new Date().toISOString()
      });
      
      logger.info(`Relation notification sent to online user ${recipientId}`);
    } else {
      logger.info(`User ${recipientId} is offline, relation notification will be stored`);
      // Here you could implement storing offline notifications
    }
    
  } catch (error) {
    logger.error(`Error handling relation event: ${error.message}`);
  }
}

/**
 * Handle new message events from Kafka
 * @param {Object} messageEvent - The message event object
 */
async function handleNewMessage(messageEvent) {
  try {
    const { sender, receiver, msg, created_at } = messageEvent;
    
    logger.info(`Processing new message from ${sender} to ${receiver}`);
    
    // Check if the receiver is online
    const isOnline = await isUserOnline(receiver);
    
    if (isOnline) {
      // Send notification via socket
      await sendNotificationToUser(receiver, 'message', {
        type: 'new_message',
        senderId: parseInt(sender),
        content: msg,
        timestamp: created_at || new Date().toISOString()
      });
      
      logger.info(`Message notification sent to online user ${receiver}`);
    } else {
      logger.info(`User ${receiver} is offline, message notification will be stored`);
      // Here you could implement storing offline notifications
    }
    
    // Also notify the sender about message delivery
    const senderIsOnline = await isUserOnline(sender);
    if (senderIsOnline) {
      await sendNotificationToUser(sender, 'message_sent', {
        type: 'message_sent',
        receiverId: parseInt(receiver),
        content: msg,
        timestamp: created_at || new Date().toISOString()
      });
      logger.info(`Message delivery notification sent to sender ${sender}`);
    }
    
  } catch (error) {
    logger.error(`Error handling new message: ${error.message}`);
  }
}

export default initKafkaConsumer; 