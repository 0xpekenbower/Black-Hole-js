import { registerAuthRoutes } from './auth.js';
import { registerGameRoutes } from './game.js';
import { registerChatRoutes } from './chat.js';
import { registerDashboardRoutes } from './dash.js';

const proxyOptions = {
  replyOptions: {
    rewriteRequestHeaders: (req, headers) => {
      return {
        ...headers,
        'x-gateway-timestamp': new Date().toISOString()
      };
    },
    timeout: 10000 
  }
};

export async function registerProxyRoutes(gateway, fastifyHttpProxy) {
  await registerAuthRoutes(gateway, fastifyHttpProxy, proxyOptions);
  await registerGameRoutes(gateway, fastifyHttpProxy, proxyOptions);
  await registerChatRoutes(gateway, fastifyHttpProxy, proxyOptions);
  await registerDashboardRoutes(gateway, fastifyHttpProxy, proxyOptions);
} 