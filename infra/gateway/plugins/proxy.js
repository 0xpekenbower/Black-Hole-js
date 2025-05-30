'use strict'

const fp = require('fastify-plugin')
const httpProxy = require('@fastify/http-proxy')
const services = require('../config/services')

module.exports = fp(async function (fastify, opts) {
  for (const service of services) {
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
            'x-original-url': req.url
          }
        }
      }
    })
  }
}) 