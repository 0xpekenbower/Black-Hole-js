import pool from '../config/pooling.js'
import loginC from '../controllers/loginC.js'


const auth = (fastify, options, done) => {

    const loginSchema = {
        schema:
        {
            body:
            {
                type:'object',
                required : ['username', 'password'],
                properties:
                {
                    username: {type: 'string', maxLength: 15},
                    password: {type: 'string', minLength: 8 ,maxLength: 25},
                }
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
        handler: loginC(fastify)
    }

    fastify.post('/api/auth/login/', loginSchema)

    fastify.get('/list', async (req, res) => {
        res.send(await pool.query())
    })

    done()
}

export default auth