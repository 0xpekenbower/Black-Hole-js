import Fastify from 'fastify'
import setupdb from './config/setupDB.js';

const appBuilder = async () => {

    // await setupdb(process.env.DB_AUTH)
    await setupdb(process.env.db_name)
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
    fastify.register(import ('./routes/twofaR.js'))
        fastify.register(import('@fastify/cors'), {
        origin: ['http://localhost:6969','http://gateway:8000'],
        methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
        maxAge: 86400
    });
    
    // if (process.env.db_name.search('test') == -1)
    // {
        fastify.register(import ('./routes/forgetPassR.js'))
        fastify.register(import ('./services/kafkaConsumer.js'))
    // }

    return fastify
}

export default appBuilder