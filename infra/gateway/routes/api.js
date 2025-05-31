'use strict'

const services = require('../config/services')

module.exports = async function (fastify, opts) {
  fastify.get('/services', async function (request, reply) {
    const serviceInfo = services.map(service => ({
      name: service.name,
      prefix: service.prefix,
      description: service.description
    }))
    
    return {
      gateway: 'BlackHoleJs API Gateway',
      version: '1.0.0',
      services: serviceInfo,
      timestamp: new Date().toISOString()
    }
  })

  fastify.get('/api/services', async function (request, reply) {
    const serviceInfo = services.map(service => ({
      name: service.name,
      prefix: service.prefix,
      description: service.description
    }))
    
    return {
      gateway: 'BlackHoleJs API Gateway',
      version: '1.0.0',
      services: serviceInfo,
      timestamp: new Date().toISOString()
    }
  })
} 