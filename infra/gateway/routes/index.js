import { registerHealthRoutes } from './health.js';
import { registerSocketRoutes } from './socket.js';

export async function registerRoutes(app) {
  await registerHealthRoutes(app);
  await registerSocketRoutes(app);
} 