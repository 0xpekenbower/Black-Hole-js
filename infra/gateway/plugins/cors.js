'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) {
  fastify.addHook('onRequest', (request, reply, done) => {
    reply.header('Access-Control-Allow-Origin', '*')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-User-Id')
    reply.header('Access-Control-Allow-Credentials', 'true')
    if (request.method === 'OPTIONS') {
      reply.code(204).send()
      return
    }

    done()
  })
}) 