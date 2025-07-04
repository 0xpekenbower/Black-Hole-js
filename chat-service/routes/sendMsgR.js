import sendMsgC from '../controllers/sendMsgC.js'

const sendMsgR = (fastify, options, done) => {

    fastify.post('/api/chat/msg/', sendMsgC)

    done()
}

export default sendMsgR