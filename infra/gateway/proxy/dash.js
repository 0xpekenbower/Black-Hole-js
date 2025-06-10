import { services } from '../config/index.js';

export async function registerDashboardRoutes(gateway, fastifyHttpProxy, proxyOptions = {}) {
  await gateway.register(fastifyHttpProxy, {
    upstream: services.DASHBOARD_SERVICE_URL,
    prefix: '/api/dash',
    rewritePrefix: '/api/dash',
    ...proxyOptions
  });
}

