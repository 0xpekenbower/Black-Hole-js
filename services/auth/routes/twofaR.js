import twofaC from '../controllers/twofaC.js'

const twofa = (fastify, options, done) => {

    fastify.post('/api/auth/login/2fa/', twofaC)

    done()
}

export default twofa