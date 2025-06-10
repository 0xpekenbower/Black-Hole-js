import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-socket',
    options: {
      mode: 'tcp',
      address: process.env.VECTOR_HOST || 'vector',
      port: parseInt(process.env.VECTOR_PORT || '9000', 10),
      reconnect: true,
      reconnectDelay: 5000
    }
  },
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

// TODO: implement vector processing for the logs and config logstash index , kibana view
// TODO: remove nginx logs from vector and logstash use only gateway logs it's cleaner and track all logs in one place
['info', 'error', 'debug', 'warn'].forEach(level => {
  logger[level] = (obj, ...args) => {
    if (obj && typeof obj === 'object' && obj.event === 'request_lifecycle') {
      const enhancedObj = {
        ...obj,
        log_type: 'gateway',
        log_category: level,
        component: 'gateway',
        source: 'nodejs'
      };
      originalLogger[level](enhancedObj, ...args);
    }
  };
});

export default logger; 