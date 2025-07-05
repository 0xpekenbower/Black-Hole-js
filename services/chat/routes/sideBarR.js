import sideBarC from '../controllers/sideBarC.js'

const sideBarR = (fastify, options, done) => {

    fastify.get('/api/chat/sidebar/', sideBarC)

    done()
}

export default sideBarR