export const services = {
  AUTH_SERVICE_URL: 'http://auth:8002',
  DASHBOARD_SERVICE_URL: 'http://dash:8003',
  CHAT_SERVICE_URL: 'http://chat:8004',
  GAME_SERVICE_URL: 'http://game:8005',
};

export const cors = {
  origin: [
    'http://localhost:3000',
    'http://frontend:3000',
    'https://blackholejs.art',
    'http://blackholejs.art'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Upgrade',
    'Connection'
  ],
  credentials: true,
  preflightContinue: true
};

export const server = {
  port: 8000,
  host: '0.0.0.0'
};

export const vector = {
  host: process.env.VECTOR_HOST || 'vector',
  port: parseInt(process.env.VECTOR_PORT || '9000', 10)
}; 

export const kafka = {
  clientId: 'gateway',
  brokers: ['kafka:9092']
};

export const redis = {
  host: 'redis',
  port: 6379,
  password: process.env.REDIS_PASSWORD || 'redispassword'
};