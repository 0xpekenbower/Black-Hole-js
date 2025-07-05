import pino from 'pino';
import apm from 'elastic-apm-node';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ignore: 'pid,hostname,reqId',
  
  formatters: {
    level: (label) => ({ level: label }),
    bindings: () => {
      const transaction = apm?.currentTransaction;
      if (!transaction) return {};
      
      return {
        'transaction_id': transaction.id,
        'trace_id': transaction.traceId,
        'span_id': apm.currentSpan?.id,
      };
    }
  },
  
  messageKey: 'message',
  
  timestamp: pino.stdTimeFunctions.isoTime,
  
  base: null,
  hostname: false
});

['info', 'error', 'warn', 'debug'].forEach(level => {
  const originalMethod = logger[level].bind(logger);
  logger[level] = (obj, ...args) => {
    if (obj && typeof obj === 'object' && apm) {
      const logContext = {
        message: obj.message || JSON.stringify(obj),
        level: level,
        transactionId: apm.currentTransaction?.ids['transaction.id'],
        traceId: apm.currentTransaction?.ids['trace.id'],
        spanId: apm.currentSpan?.ids['span.id'],
        serviceName: 'gateway',
        serviceEnvironment: process.env.NODE_ENV || 'development',
        custom: obj
      };      
      if (level === 'error') {
        apm.captureError(logContext.message, {
          custom: logContext,
          handled: true
        });
      } else {
        apm.setCustomContext(logContext);
      }
    }
    originalMethod(obj, ...args);
  };
});

export default logger;