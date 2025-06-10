import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: undefined,
  serializers: {
    req: () => undefined, 
    res: () => undefined  
  },
  formatters: {
    level: (label) => {
      return { level: label }; 
    }
  },
  messageKey: 'message',
  base: undefined, 
  timestamp: () => `,"time":"${new Date().toISOString()}"` 
});

const originalLogger = {
  info: logger.info.bind(logger),
  error: logger.error.bind(logger),
  debug: logger.debug.bind(logger),
  warn: logger.warn.bind(logger)
};

['info', 'error', 'debug', 'warn'].forEach(level => {
  logger[level] = (obj, ...args) => {
    if (obj && typeof obj === 'object' && obj.event === 'request_lifecycle') {
      originalLogger[level](obj, ...args);
    }
  };
});

export default logger; 