import { getApm } from '../config/apm.js';
import logger from './index.js';

// Get service name from URL path
const getServiceFromPath = (path) => {
  if (path.startsWith('/api/auth')) return 'auth-service';
  if (path.startsWith('/api/dash')) return 'dashboard-service';
  if (path.startsWith('/api/chat')) return 'chat-service';
  if (path.startsWith('/api/game')) return 'game-service';
  return 'unknown';
};

// Register APM hooks for request lifecycle
export function registerApmHooks(fastify) {
  const apm = getApm();
  if (!apm) {
    logger.warn('APM not initialized, skipping APM hooks');
    return;
  }

  // Start transaction on request
  fastify.addHook('onRequest', (request, reply, done) => {
    const url = request.raw.url;
    const method = request.raw.method;
    const path = request.routerPath || url.split('?')[0];
    const service = getServiceFromPath(path);
    
    // Start a transaction
    const transaction = apm.startTransaction(`${method} ${path}`, 'request');
    
    if (transaction) {
      // Store transaction in request for later use
      request.apmTransaction = transaction;
      
      // // Add useful context to the transaction
      // transaction.setLabel('service.target', service);
      // transaction.setLabel('http.method', method);
      // transaction.setLabel('http.url', url);
      
      // Set user context if available
      const userId = extractUserId(request);
      if (userId) {
        transaction.setUserContext({ id: userId });
      }
    }
    
    done();
  });

  // End transaction on response
  fastify.addHook('onResponse', (request, reply, done) => {
    if (request.apmTransaction) {
      const transaction = request.apmTransaction;
      
      // Add response information
      transaction.setLabel('http.status_code', reply.statusCode);
      transaction.result = `HTTP ${reply.statusCode}`;
      
      // End the transaction
      transaction.end();
    }
    
    done();
  });

  // Capture errors
  fastify.addHook('onError', (request, reply, error, done) => {
    if (request.apmTransaction) {
      apm.captureError(error, { 
        request: request.raw,
        response: reply.raw,
        user: { id: extractUserId(request) || 'anonymous' }
      });
    }
    
    done();
  });
}

function extractUserId(request) {
  try {
    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.substring(7);
    const payload = Buffer.from(token.split('.')[1], 'base64').toString();
    const decoded = JSON.parse(payload);
    
    return decoded.id || null;
  } catch (err) {
    return null;
  }
}

export function createProxySpan(apm, request, serviceName) {
  if (!apm || !request.apmTransaction) return null;
  
  const transaction = request.apmTransaction;
  const url = request.raw.url;
  const method = request.raw.method;
  const span = transaction.startSpan(`${method} ${serviceName}`, 'external', 'http');
  
  return span;
}

// Helper to end spans
export function endProxySpan(span, statusCode) {
  if (!span) return;
  
  span.setLabel('http.status_code', statusCode);
  span.end();
} 