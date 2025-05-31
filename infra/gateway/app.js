'use strict'

const path = require('node:path')
const AutoLoad = require('@fastify/autoload')

// Pass --options via CLI arguments in command to enable these options.
const options = {}

module.exports = async function (fastify, opts) {
  fastify.get('/api', async function (request, reply) {
    return {
      gateway: 'BlackHoleJs API Gateway',
      version: '1.0.0',
      message: 'API Gateway is running',
      docs: '/api/services',
      health: '/api/health',
      ping: '/api/ping',
      timestamp: new Date().toISOString()
    }
  })

  fastify.get('/api/', async function (request, reply) {
    return {
      gateway: 'BlackHoleJs API Gateway',
      version: '1.0.0',
      message: 'API Gateway is running',
      docs: '/api/services',
      health: '/api/health',
      ping: '/api/ping',
      timestamp: new Date().toISOString()
    }
  })
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  })
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, opts),
    routeParams: true  // Enable route parameters
  })
}

module.exports.options = options
