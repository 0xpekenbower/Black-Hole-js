import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ignore: 'pid,hostname,reqId',
  // options: {
  //   translateTime: 'HH:MM:ss Z',
  //   // ignore: 'pid,hostname,reqId',
  //   levelFirst: true,
  //   colorize: true,
  // },
  // transport: {
  //   target: 'pino-pretty',
  //   // options: {
  //   //   mode: 'tcp',
  //   //   address: process.env.VECTOR_HOST || 'vector',
  //   //   port: parseInt(process.env.VECTOR_PORT || '9000', 10),
  //   //   reconnect: true,
  //   //   reconnectDelay: 5000
  //   // }
  // },
  // logger: {
  //   level: 'info',
  //   options: {
  //       translateTime: 'HH:MM:ss Z',
  //       ignore: 'pid,hostname,reqId',
  //       messageFormat: '{message} {req.method} {req.url}',
  //       levelFirst: true,
  //       colorize: true,
  //   },
  //   serializers: {
  //     req: (req) => ({
  //       method: req.method,
  //       url: req.url,
  //       remoteAddress: req.ip,
  //     }),
  //     res: (res) => ({
  //       statusCode: res.statusCode
  //     })
  //   },
  //   formatters: {
  //     level(label) {
  //       return { level: label.toUpperCase() };
  //     },
  //     bindings() {
  //       return { logger: 'dash' }; // add your app name here
  //     },
  //     log(object) {
  //       return {
  //         timestamp: new Date().toISOString(),
  //         message: object.msg,
  //         ...object
  //       };
  //     }
  //   }
  // }
  formatters: {
    level: (label) => ({ level: label }),
    bindings: () => ({})
  },
  base: undefined,
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
  hostname: false
});

// Override log methods to stringify objects into message field
['info', 'error', 'debug', 'warn'].forEach(level => {
  const originalMethod = logger[level].bind(logger);
  logger[level] = (obj, ...args) => {
    if (obj && typeof obj === 'object') {
      const { host, port, source_type, time, ...rest } = obj;
      // Convert the object to a JSON string in the message field
      originalMethod({ message: JSON.stringify(rest) }, ...args);
    } else {
      originalMethod(obj, ...args);
    }
  };
});

export default logger; 