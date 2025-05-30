'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/ping', async function (request, reply) {
    return { ping: 'pong' }
  })
}
