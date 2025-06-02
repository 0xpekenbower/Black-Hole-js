import forgetPassC from "../controllers/forgetPassC.js"

const forgetPassR = (fastify, options, done) => {

    fastify.post('/api/auth/send-mail/', forgetPassC.send_mail)
    fastify.post('/api/auth/forget-pass/', forgetPassC.forget_passC)

    done()
}

export default forgetPassR