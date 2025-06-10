import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ignore: 'pid,hostname,reqId',
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
  formatters: {
    level: (label) => ({ level: label }),
    bindings: () => ({})
  },
  base: undefined,
  timestamp: false,
  hostname: false
});

['info', 'error', 'debug', 'warn'].forEach(level => {
  const originalMethod = logger[level].bind(logger);
  logger[level] = (obj, ...args) => {
    if (obj && typeof obj === 'object') {
      const { host, port, source_type, time, ...rest } = obj;
      originalMethod(rest, ...args);
    } else {
      originalMethod(obj, ...args);
    }
  };
});

export default logger; 