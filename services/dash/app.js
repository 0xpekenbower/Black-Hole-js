import Fastify from 'fastify'
import setupdb from './config/setupDB.js';

const appBuilder = async () => {

    await setupdb(process.env.db_name)

    const fastify = Fastify({
        logger: {
            transport: { target: 'pino-pretty',
            options: { translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname,reqId',
            messageFormat: '{msg} {req.method} {req.url}',
            levelFirst: true, colorize: true, singleLine: true,}}}})


    fastify.register(import ('@fastify/jwt'),
    {secret: process.env.JWT_SECRET, sign: {expiresIn:'4h'}})
    
    fastify.addHook('onRequest', async (req) => { 
        if (req.url.startsWith('/docs') || req.url.startsWith('/documentation')) {
            return
          }
        await req.jwtVerify() })
            
    fastify.register(import ('@fastify/swagger'))
    fastify.register(import ('@fastify/swagger-ui'), {routePrefix: '/docs',})
    fastify.register(import ('./routes/relationsR.js'))
    fastify.register(import ('./routes/profilesR.js'))
    fastify.register(import ('./routes/achievementsR.js'))
    fastify.register(import ('./routes/storeR.js'))
    fastify.register(import ('./routes/notificationsR.js'))

    // if (process.env.db_name.search('test') == -1) //FIXME TO SEPARATE THE UNIT TESTING
        fastify.register(import ('./utils/kafkaConsumer.js'))

    return fastify
}

export default appBuilder