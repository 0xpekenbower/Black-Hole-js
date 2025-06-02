import changePassC from '../controllers/passwordC.js'

const passR = (fastify, options, done) => {

    fastify.post('/api/auth/change-password/',
        {onRequest : fastify.authenticate},
        changePassC(fastify))

    done()
}

export default passR