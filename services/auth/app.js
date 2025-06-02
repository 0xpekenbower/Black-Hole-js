import Fastify from 'fastify'
import setupdb from './config/setupDB.js';

const appBuilder = async () => {

    // Initialize the database
    await setupdb()

    const fastify = Fastify({
        logger: {
            transport: { target: 'pino-pretty',
            options: { translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname,reqId',
                messageFormat: '{msg} {req.method} {req.url}',
                levelFirst: true, colorize: true,singleLine: true,}}}})

    fastify.register(import ('@fastify/swagger'))
    fastify.register(import ('@fastify/swagger-ui'), {routePrefix: '/docs',})
    fastify.register(import ('./routes/login_verify.js'))
    fastify.register(import ('./routes/registerR.js'))
    fastify.register(import ('./routes/loginR.js'))
    fastify.register(import ('./routes/intraR.js'))
    fastify.register(import ('./routes/googleR.js'))
    fastify.register(import ('./routes/passwordR.js'))
    fastify.register(import ('./routes/forgetPassR.js'))

    return fastify
}

export default appBuilder