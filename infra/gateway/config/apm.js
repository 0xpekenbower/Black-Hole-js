import logger from '../logger/index.js';

// APM configuration
export const apmConfig = {
  serviceName: 'gateway',
  serverUrl: process.env.APM_SERVER_URL || 'http://apm-server:8200',
  environment: process.env.NODE_ENV || 'development',
  active: process.env.APM_ACTIVE !== 'false',
  logLevel: process.env.APM_LOG_LEVEL || 'info',
  captureBody: 'off', // Don't capture request bodies
  captureErrorLogStackTraces: 'always',
  transactionSampleRate: 1.0, // Sample all transactions
};

let apm = null;

export async function initializeApm() {
  try {
    const apmModule = await import('elastic-apm-node');
    apm = apmModule.default.start(apmConfig);
    logger.info('APM initialized successfully');
    return apm;
  } catch (err) {
    logger.error(`Failed to initialize APM: ${err.message}`);
    return null;
  }
}

export function getApm() {
  return apm;
} 