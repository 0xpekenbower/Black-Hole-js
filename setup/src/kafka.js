const { Kafka } = require('kafkajs');
const pino = require('pino');

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
      levelFirst: true,
      colorize: true,
      singleLine: true,
    }
  }
});

const kafka = new Kafka({
  clientId: 'blackholejs-setup',
  brokers: ['kafka:9092'],
  retry: {
    initialRetryTime: 1000,
    retries: 10
  }
});

const topics = [
  {
    topic: 'newUser',
    numPartitions: 3,
    replicationFactor: 1,
    configEntries: [
      { name: 'cleanup.policy', value: 'delete' },
      { name: 'retention.ms', value: '604800000' }, // 7 days
      { name: 'segment.bytes', value: '1073741824' } // 1GB
    ]
  },
  {
    topic: 'OTP',
    numPartitions: 3,
    replicationFactor: 1,
    configEntries: [
      { name: 'cleanup.policy', value: 'delete' },
      { name: 'retention.ms', value: '86400000' }, // 1 day
      { name: 'segment.bytes', value: '536870912' } // 512MB
    ]
  }
];

const waitForKafka = async (maxRetries = 30, retryInterval = 2000) => {
  const admin = kafka.admin();
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      logger.info(`Attempting to connect to Kafka (attempt ${i + 1}/${maxRetries})...`);
      await admin.connect();
      await admin.listTopics();
      await admin.disconnect();
      logger.info('Successfully connected to Kafka');
      return true;
    } catch (error) {
      logger.warn(`Kafka not ready yet: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, retryInterval));
    }
  }
  
  throw new Error('Failed to connect to Kafka after maximum retries');
};

const setupKafkaTopics = async () => {
  logger.info('Starting Kafka setup...');
  
  try {
    await waitForKafka();
    
    const admin = kafka.admin();
    await admin.connect();
    
    const existingTopics = await admin.listTopics();
    logger.info(`Existing topics: ${existingTopics.join(', ') || 'none'}`);
    
    const topicsToCreate = topics.filter(topic => !existingTopics.includes(topic.topic));
    
    if (topicsToCreate.length === 0) {
      logger.info('All required topics already exist. No new topics created.');
    } else {
      logger.info(`Creating topics: ${topicsToCreate.map(t => t.topic).join(', ')}`);
      await admin.createTopics({
        topics: topicsToCreate,
        waitForLeaders: true
      });
      logger.info('Topics created successfully');
    }
    
    const updatedTopics = await admin.listTopics();
    const allTopicsExist = topics.every(topic => updatedTopics.includes(topic.topic));
    
    if (allTopicsExist) {
      logger.info('All required Kafka topics are available:');
      topics.forEach(topic => {
        logger.info(`- ${topic.topic} (${topic.numPartitions} partitions, RF: ${topic.replicationFactor})`);
      });
    } else {
      const missingTopics = topics
        .filter(topic => !updatedTopics.includes(topic.topic))
        .map(topic => topic.topic);
      throw new Error(`Some topics are missing: ${missingTopics.join(', ')}`);
    }
    
    await admin.disconnect();
    logger.info('Kafka setup completed successfully');
    return true;
  } catch (error) {
    logger.error(`Failed to set up Kafka topics: ${error.message}`);
    return false;
  }
};

if (require.main === module) {
  setupKafkaTopics()
    .then(success => {
      if (!success) {
        process.exit(1);
      }
    })
    .catch(error => {
      logger.error(`Unhandled error: ${error.message}`);
      process.exit(1);
    });
}

module.exports = setupKafkaTopics;
