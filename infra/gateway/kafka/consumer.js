import kafka from '../config/kafkaClient.js';
import logger from '../logger/index.js';
import { kafka as kafkaConfig } from '../config/index.js';

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
    const consumer = kafka.consumer({ groupId: kafkaConfig.groupId });
    
    // Store the consumer instance on the app for later use
    app.decorate('kafkaConsumer', consumer);
    
    await consumer.connect();
    logger.info('Kafka consumer connected successfully');
    
    // Subscribe to topics
    await consumer.subscribe({ topic: kafkaConfig.topics.notifications, fromBeginning: false });
    await consumer.subscribe({ topic: kafkaConfig.topics.userEvents, fromBeginning: false });
    
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const messageValue = JSON.parse(message.value.toString());
          logger.info(`Received Kafka message on topic: ${topic}`);
          
          // Process different message types based on the topic
          switch (topic) {
            case kafkaConfig.topics.notifications:
              // Here you would process notification events
              // Example: Send to connected WebSocket clients
              logger.info(`Notification received: ${JSON.stringify(messageValue)}`);
              break;
              
            case kafkaConfig.topics.userEvents:
              // Process user-related events
              logger.info(`User event received: ${JSON.stringify(messageValue)}`);
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

export default initKafkaConsumer; 