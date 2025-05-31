'use strict'

const fp = require('fastify-plugin')
const httpProxy = require('@fastify/http-proxy')
const services = require('../config/services')

module.exports = fp(async function (fastify, opts) {
  fastify.setNotFoundHandler((request, reply) => {
    if (request.url.startsWith('/')) {
      reply.code(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: `Route ${request.method}:${request.url} not found`,
        timestamp: new Date().toISOString()
      })
    } else {
      reply.callNotFound()
    }
  })

  for (const service of services) {
    fastify.register(httpProxy, {
      upstream: service.target,
      prefix: service.prefix,
      rewritePrefix: '',
      httpMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      proxyPayloads: true,
      replyOptions: {
        rewriteRequestHeaders: (req, headers) => {
          return {
            ...headers,
            'x-forwarded-host': req.headers.host,
            'x-service-name': service.name,
            'x-original-url': req.url,
            'x-request-id': req.id || '',
            'x-real-ip': req.ip || ''
          }
        },
        onResponse: (request, reply, res) => {
          reply.header('Access-Control-Allow-Origin', '*')
          reply.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
          reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
          reply.send(res)
        }
      },
      onError: (reply, error) => {
        fastify.log.error({ 
          error: error.message,
          service: service.name,
          path: reply.request.url
        })
        
        reply.code(502).send({
          statusCode: 502,
          error: 'Bad Gateway',
          message: `Service ${service.name} is unavailable`,
          timestamp: new Date().toISOString()
        })
      }
    })

    fastify.register(httpProxy, {
      upstream: service.target,
      prefix: `/api${service.prefix}`,
      rewritePrefix: '',
      httpMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      proxyPayloads: true,
      replyOptions: {
        rewriteRequestHeaders: (req, headers) => {
          return {
            ...headers,
            'x-forwarded-host': req.headers.host,
            'x-service-name': service.name,
            'x-original-url': req.url,
            'x-request-id': req.id || '',
            'x-real-ip': req.ip || ''
          }
        },
        onResponse: (request, reply, res) => {
          reply.header('Access-Control-Allow-Origin', '*')
          reply.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
          reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
          
          reply.send(res)
        }
      },
      onError: (reply, error) => {
        fastify.log.error({ 
          error: error.message,
          service: service.name,
          path: reply.request.url
        })
        
        reply.code(502).send({
          statusCode: 502,
          error: 'Bad Gateway',
          message: `Service ${service.name} is unavailable`,
          timestamp: new Date().toISOString()
        })
      }
    })
  }
}) 