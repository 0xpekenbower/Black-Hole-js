import twofaC from '../controllers/twofaC.js'

const twofa = (fastify, options, done) => {

    fastify.post('/api/auth/login/2fa/', twofaC(fastify))

    done()
}

export default twofa