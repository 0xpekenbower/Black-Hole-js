'use strict'

const services = require('../config/services')
const http = require('node:http')

const checkServiceHealth = (serviceUrl) => {
  return new Promise((resolve) => {
    const req = http.get(`${serviceUrl}/health`, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        let status = { status: 'healthy', code: res.statusCode }
        if (res.statusCode >= 400) {
          status.status = 'unhealthy'
        }
        resolve(status)
      })
    })
    
    req.on('error', () => {
      resolve({ status: 'down', code: 500 })
    })
    
    req.setTimeout(3000, () => {
      req.destroy()
      resolve({ status: 'timeout', code: 408 })
    })
  })
}

module.exports = async function (fastify, opts) {
  fastify.get('/health', async function (request, reply) {
    const serviceStatuses = {}
    const checkPromises = services.map(async (service) => {
      const status = await checkServiceHealth(service.target)
      serviceStatuses[service.name] = status
    })
    
    try {
      await Promise.all(checkPromises)
      
      const isHealthy = Object.values(serviceStatuses)
        .every(status => status.status === 'healthy')
      
      const response = {
        status: isHealthy ? 'healthy' : 'degraded',
        gateway: { status: 'healthy', code: 200 },
        services: serviceStatuses,
        timestamp: new Date().toISOString()
      }
      
      reply.code(isHealthy ? 200 : 207)
      return response
    } catch (err) {
      request.log.error({ error: err })
      reply.code(500)
      return {
        status: 'error',
        gateway: { status: 'error', code: 500 },
        services: serviceStatuses,
        timestamp: new Date().toISOString(),
        error: 'Failed to check service health'
      }
    }
  })

  fastify.get('/api/health', async function (request, reply) {
    const serviceStatuses = {}
    const checkPromises = services.map(async (service) => {
      const status = await checkServiceHealth(service.target)
      serviceStatuses[service.name] = status
    })
    
    try {
      await Promise.all(checkPromises)
      
      const isHealthy = Object.values(serviceStatuses)
        .every(status => status.status === 'healthy')
      
      const response = {
        status: isHealthy ? 'healthy' : 'degraded',
        gateway: { status: 'healthy', code: 200 },
        services: serviceStatuses,
        timestamp: new Date().toISOString()
      }
      
      reply.code(isHealthy ? 200 : 207)
      return response
    } catch (err) {
      request.log.error({ error: err })
      reply.code(500)
      return {
        status: 'error',
        gateway: { status: 'error', code: 500 },
        services: serviceStatuses,
        timestamp: new Date().toISOString(),
        error: 'Failed to check service health'
      }
    }
  })
} 