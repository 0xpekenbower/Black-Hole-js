'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    return {
      gateway: 'BlackHoleJs API Gateway',
      version: '1.0.0',
      message: 'API Gateway is running',
      docs: '/services',
      health: '/health',
      ping: '/ping',
      timestamp: new Date().toISOString()
    }
  })
}
