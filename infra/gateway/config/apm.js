import logger from '../logger/index.js';

export const apmConfig = {
  serviceName: 'gateway',
  serverUrl: process.env.APM_SERVER_URL || 'http://apm-server:8200',
  environment: process.env.NODE_ENV || 'development',
  
  logUncaughtExceptions: true,
  captureExceptions: true,
  logLevel: 'info',
  useElasticTraceparentHeader: true,
  disableInstrumentations: [],
  transactionSampleRate: 1.0,
  centralConfig: false,
  cloudProvider: 'none',
  
  // Fix for tag warnings
  sanitizeFieldNames: [
    'service.name',
    'http.method', 
    'http.url'
  ],
  
  // Custom logger that handles special characters
  logger: {
    info(msg) {
      logger.info(msg.replace(/[^\x20-\x7E]/g, ''));
    },
    warn(msg) {
      logger.warn(msg.replace(/[^\x20-\x7E]/g, ''));
    },
    error(msg) {
      logger.error(msg.replace(/[^\x20-\x7E]/g, ''));
    },
    fatal(msg) {
      logger.error(msg.replace(/[^\x20-\x7E]/g, ''));
    },
    debug(msg) {
      logger.debug(msg.replace(/[^\x20-\x7E]/g, ''));
    },
    trace(msg) {
      logger.trace(msg.replace(/[^\x20-\x7E]/g, ''));
    }
  }
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