export const services = {
  AUTH_SERVICE_URL: 'http://auth:8002',
  DASHBOARD_SERVICE_URL: 'http://dash:8003',
  CHAT_SERVICE_URL: 'http://chat:8004',
  GAME_SERVICE_URL: 'http://game:8005',
};

export const cors = {
  origin: ['http://localhost:3000', 'http://frontend:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
};

export const server = {
  port: 8000,
  host: '0.0.0.0'
}; 