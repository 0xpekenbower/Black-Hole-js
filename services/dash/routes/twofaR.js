import twofaC from '../controllers/twofaC.js'

const achievements = (fastify, options, done) => {

    fastify.get('/api/dash/update-2fa/', twofaC)

    done()
}

export default achievements


//TODO npm ii