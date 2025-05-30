'use strict'

const fp = require('fastify-plugin')
const pino = require('pino')

module.exports = fp(async function (fastify, opts) {
  const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
    messageKey: 'message',
    base: {
      service: 'gateway'
    },
    formatters: {
      level: (label) => {
        return { level: label }
      }
    }
  })

  fastify.decorate('logger', logger)

  fastify.addHook('onRequest', (request, reply, done) => {
    request.startTime = process.hrtime()
    done()
  })

  fastify.addHook('onResponse', (request, reply, done) => {
    const diff = process.hrtime(request.startTime)
    const responseTime = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2)
    
    const logLevel = reply.statusCode >= 500 ? 'error' : 
                     reply.statusCode >= 400 ? 'warn' : 'info'
    
    const logData = {
      '@timestamp': new Date().toISOString(),
      time: new Date().toISOString(),
      level: logLevel,
      service: 'gateway',
      message: reply.statusCode >= 400 ? 'Error response' : 'Success response',
      req: {
        method: request.raw.method,
        url: request.raw.url,
        source: 'gateway',
        user_id: request.headers['x-user-id'] || 'anonymous',
        ip: request.ip
      },
      res: {
        statusCode: reply.statusCode,
        source: 'gateway',
        response_time: parseFloat(responseTime),
        message: reply.statusCode >= 400 ? 'Error response' : 'Success response'
      }
    }

    logger[logLevel](logData)
    done()
  })

  fastify.setErrorHandler((error, request, reply) => {
    const errorData = {
      '@timestamp': new Date().toISOString(),
      time: new Date().toISOString(),
      level: 'error',
      service: 'gateway',
      message: 'Error occurred',
      req: {
        method: request.raw.method,
        url: request.raw.url,
        source: 'gateway',
        user_id: request.headers['x-user-id'] || 'anonymous',
        ip: request.ip
      },
      res: {
        statusCode: reply.statusCode,
        source: 'gateway',
        message: 'Error occurred'
      },
      error: {
        message: error.message,
        stack: error.stack ? error.stack.split('\n')[0] : undefined
      }
    }

    logger.error(errorData)
    reply.send(error)
  })
}) 