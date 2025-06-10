import logger from './index.js';
import jwt from 'jsonwebtoken';

const requestStore = new Map();
const processedRequests = new Set();
const pendingLogs = new Map();

const getServiceFromPath = (path) => {
  if (path.startsWith('/api/auth')) return 'AUTH_SERVICE';
  if (path.startsWith('/api/dash')) return 'DASHBOARD_SERVICE';
  if (path.startsWith('/api/chat')) return 'CHAT_SERVICE';
  if (path.startsWith('/api/game')) return 'GAME_SERVICE';
  return 'UNKNOWN_SERVICE';
};

const getRewritePrefix = (path) => {
  if (path.startsWith('/api/auth')) return '/api/auth';
  if (path.startsWith('/api/dash')) return '/api/dash';
  if (path.startsWith('/api/chat')) return '/api/chat';
  if (path.startsWith('/api/game')) return '/api/game';
  return '';
};

const extractUserId = (request) => {
  try {
    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.substring(7); 
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');    
    if (decoded && decoded.id) {
      return decoded.id;
    }
    
    return null;
  } catch (err) {
    return null;
  }
};

const getSessionId = (request) => {
  return `session-${request.id.substring(0, 3)}`;
};

const getRequestId = (request) => {
  const requestId = request.headers['x-request-id'];
  if (requestId) {
    return requestId;
  }
  
  return request.id || `req-${Math.random().toString(36).substring(2, 10)}`;
};

export function captureRequest(request) {
  const timestamp = new Date().toISOString();
  const url = request.raw.url;
  const method = request.raw.method;
  const userAgent = request.headers['user-agent'] || '';
  const clientIp = request.ip;
  const referrer = request.headers['referer'] || '';
  const service = getServiceFromPath(url);
  const rewritePrefix = getRewritePrefix(url);
  const requestId = getRequestId(request);
  
  requestStore.set(request.id, {
    timestamp,
    url,
    method,
    userAgent,
    clientIp,
    referrer,
    service,
    rewritePrefix,
    requestId
  });
}

export function createLifecycleLog(request, reply, error = null) {
  const requestData = requestStore.get(request.id);
  if (!requestData) return null;
  
  if (processedRequests.has(request.id)) {
    requestStore.delete(request.id);
    return null;
  }
  
  const statusCode = error ? (reply.statusCode || 500) : reply.statusCode;
  const userId = extractUserId(request);
  const sessionId = getSessionId(request);

  const lifecycleLog = {
    event: "request_lifecycle",
    requestId: requestData.requestId,
    frontend: {
      userAgent: requestData.userAgent,
      clientIp: requestData.clientIp,
      request: {
        url: requestData.url,
        method: requestData.method,
        referrer: requestData.referrer
      }
    },
    gateway: {
      forwarded: {
        service: requestData.service,
        rewritePrefix: requestData.rewritePrefix
      },
      response: {
        service: error ? "GATEWAY" : requestData.service,
        statusCode: statusCode,
        ...(error && { error: error.message })
      }
    },
    context: {
      userId: userId || 0,
      sessionId: sessionId
    }
  };
  
  processedRequests.add(request.id);
  
  setTimeout(() => {
    processedRequests.delete(request.id);
  }, 5000);
  
  pendingLogs.set(request.id, { log: lifecycleLog, isError: !!error });
  
  requestStore.delete(request.id);
  
  return lifecycleLog;
}

setInterval(() => {
  if (pendingLogs.size === 0) return;
  
  pendingLogs.forEach((entry, requestId) => {
    if (entry.isError) {
      logger.error(entry.log);
    } else {
      logger.info(entry.log);
    }
    pendingLogs.delete(requestId);
  });
}, 1000); 

export function logLifecycle(request, reply) {
  createLifecycleLog(request, reply);
}

export function logErrorLifecycle(request, reply, error) {
  createLifecycleLog(request, reply, error);
}

export function registerLifecycleHooks(fastify) {
  fastify.addHook('onRequest', (request, reply, done) => {
    captureRequest(request);
    done();
  });
  
  fastify.addHook('onResponse', (request, reply, done) => {
    logLifecycle(request, reply);
    done();
  });
  
  fastify.addHook('onError', (request, reply, error, done) => {
    logErrorLifecycle(request, reply, error);
    done();
  });
} 