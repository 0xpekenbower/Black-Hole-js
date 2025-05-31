'use strict'

const services = require('../config/services')
const { promisify } = require('node:util')
const http = require('node:http')

const request = (url) => {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        resolve({ status: 'up', code: res.statusCode })
      })
    })
    
    req.on('error', () => {
      resolve({ status: 'down', code: 500 })
    })
    
    req.setTimeout(2000, () => {
      req.destroy()
      resolve({ status: 'timeout', code: 408 })
    })
  })
}

module.exports = async function (fastify, opts) {
  fastify.get('/ping', async function (request, reply) {
    const serviceStatuses = {}
    const pingPromises = services.map(async (service) => {
      const url = `${service.target}/ping`
      const status = await request(url)
      serviceStatuses[service.name] = status
    })
    
    try {
      await Promise.all(pingPromises)
      return {
        gateway: { status: 'up', code: 200 },
        services: serviceStatuses,
        timestamp: new Date().toISOString()
      }
    } catch (err) {
      request.log.error({ error: err })
      return {
        gateway: { status: 'up', code: 200 },
        services: serviceStatuses,
        timestamp: new Date().toISOString(),
        error: 'Some services could not be reached'
      }
    }
  })

  fastify.get('/api/ping', async function (request, reply) {
    const serviceStatuses = {}
    const pingPromises = services.map(async (service) => {
      const url = `${service.target}/ping`
      const status = await request(url)
      serviceStatuses[service.name] = status
    })
    
    try {
      await Promise.all(pingPromises)
      return {
        gateway: { status: 'up', code: 200 },
        services: serviceStatuses,
        timestamp: new Date().toISOString()
      }
    } catch (err) {
      request.log.error({ error: err })
      return {
        gateway: { status: 'up', code: 200 },
        services: serviceStatuses,
        timestamp: new Date().toISOString(),
        error: 'Some services could not be reached'
      }
    }
  })
}
