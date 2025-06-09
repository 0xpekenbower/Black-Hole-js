import { registerAuthRoutes } from './auth.js';
import { registerGameRoutes } from './game.js';
import { registerChatRoutes } from './chat.js';
import { registerDashboardRoutes } from './dash.js';

export async function registerProxyRoutes(gateway, fastifyHttpProxy) {
  await registerAuthRoutes(gateway, fastifyHttpProxy);
  await registerGameRoutes(gateway, fastifyHttpProxy);
  await registerChatRoutes(gateway, fastifyHttpProxy);
  await registerDashboardRoutes(gateway, fastifyHttpProxy);
} 