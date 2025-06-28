import { registerAuthRoutes } from './auth.js';
import { registerGameRoutes } from './game.js';
import { registerChatRoutes } from './chat.js';
import { registerDashboardRoutes } from './dash.js';
import { getApm } from '../config/apm.js';
import { createProxySpan, endProxySpan } from '../logger/apm.js';

const proxyOptions = {
  replyOptions: {
    rewriteRequestHeaders: (req, headers) => {
      return {
        ...headers,
        'x-gateway-timestamp': new Date().toISOString()
      };
    },
    timeout: 10000 
  },
  preHandler: (request, reply, next) => {
    // Get the service name from the request URL
    const path = request.raw.url;
    let serviceName = 'unknown';
    
    if (path.startsWith('/api/auth')) serviceName = 'auth-service';
    else if (path.startsWith('/api/dash')) serviceName = 'dashboard-service';
    else if (path.startsWith('/api/chat')) serviceName = 'chat-service';
    else if (path.startsWith('/api/game')) serviceName = 'game-service';
    
    // Create a span for the proxy request
    const apm = getApm();
    if (apm) {
      const span = createProxySpan(apm, request, serviceName);
      if (span) {
        // Store the span in the request for later use
        request.apmProxySpan = span;
      }
    }
    
    next();
  },
  onResponse: (request, reply, res) => {
    // End the span when the response is received
    if (request.apmProxySpan) {
      endProxySpan(request.apmProxySpan, res.statusCode);
    }
  }
};

export async function registerProxyRoutes(gateway, fastifyHttpProxy) {
  await registerAuthRoutes(gateway, fastifyHttpProxy, proxyOptions);
  await registerGameRoutes(gateway, fastifyHttpProxy, proxyOptions);
  await registerChatRoutes(gateway, fastifyHttpProxy, proxyOptions);
  await registerDashboardRoutes(gateway, fastifyHttpProxy, proxyOptions);
} 