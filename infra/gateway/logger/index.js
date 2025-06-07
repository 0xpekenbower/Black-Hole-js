import pino from 'pino';

const levels = {
  emerg: 80,
  alert: 70,
  crit: 60,
  error: 50,
  warn: 40,
  notice: 30,
  info: 20,
  debug: 10,
};

const requestSerializer = (req) => {
  return {
    method: req.method,
    url: req.url,
    path: req.path,
    parameters: req.params,
    headers: {
      host: req.headers.host,
      'user-agent': req.headers['user-agent'],
      referer: req.headers.referer
    }
  };
};

export const formatError = (err) => {
  const now = new Date();
  
  return {
    timestamp: now.toISOString(),
    error: {
      name: err.name,
      message: err.message,
      code: err.code || 'UNKNOWN',
      stack: err.stack,
      type: err.constructor.name
    },
    process: {
      pid: process.pid,
      ppid: process.ppid,
      title: process.title,
      argv: process.argv,
      versions: process.versions,
      platform: process.platform,
      arch: process.arch,
      memoryUsage: process.memoryUsage()
    },
    os: {
      hostname: require('os').hostname(),
      type: require('os').type(),
      platform: require('os').platform(),
      release: require('os').release(),
      uptime: require('os').uptime(),
      loadavg: require('os').loadavg(),
      totalmem: require('os').totalmem(),
      freemem: require('os').freemem()
    }
  };
};

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  serializers: {
    req: requestSerializer,
    err: pino.stdSerializers.err
  },
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

export default logger; 