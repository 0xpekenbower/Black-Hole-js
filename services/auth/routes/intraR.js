import intraC from '../controllers/intraC.js'


const oauth42 = (fastify, options, done) => {

    // fastify.register(import ('@fastify/jwt'),
    // {secret: process.env.JWT_SECRET,
    // sign: {expiresIn:'4h'}})
    
    const oauth42Schema = {
        schema:
        {
            querystring:
            {
                type: 'object',
                required: ['code'],
                properties: { code: {type:'string'} }
            },
            response:
            {
                '200':
                {
                    type : 'object',
                    properties: { Success: {type: 'string'}, token: {type : 'string'} }
                },
                '4xx':
                {
                    type:'object',
                    properties:
                    {
                        Success:{type:'string'},
                        Error:{type:'string'}
                    }
                }
            }
        },
        handler: intraC(fastify)
    }

    fastify.get('/oauth/', oauth42Schema)

    fastify.get('/42', (_, res) => {
        res.redirect(process.env.API_42)
    })

    done()
}

export default oauth42