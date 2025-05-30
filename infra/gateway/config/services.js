'use strict'

module.exports = [
  {
    name: 'Auth Service',
    prefix: '/auth',
    target: 'http://auth:8002',
    description: 'Authentication and authorization service'
  },
  {
    name: 'Dashboard Service',
    prefix: '/dashboard',
    target: 'http://dashboard:8003',
    description: 'Dashboard service'
  },
  {
    name: 'Chat Service',
    prefix: '/chat',
    target: 'http://chat:8004',
    description: 'Real-time chat service'
  },
  {
    name: 'Game Service',
    prefix: '/game',
    target: 'http://game:8005',
    description: 'Game management service'
  },
  {
    name: 'Frontend Service',
    prefix: '/frontend',
    target: 'http://frontend:3000',
    description: 'Frontend service'
  }
] 