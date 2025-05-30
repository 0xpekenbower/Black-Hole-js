import pool from '../config/pooling.js'
import registerC from '../controllers/registerC.js'

const RegisterRoute = (fastify, options, done) =>
{
    const registerSchema = {
        schema:
        {
            body:
            {
                type:'object',
                required : ['username', 'email', 'password', 'repassword'],
                properties:
                {
                    username: {type: 'string', maxLength: 15},
                    email: {type: 'string', maxLength: 35},
                    password: {type: 'string', minLength: 8 ,maxLength: 25},
                    repassword: {type: 'string', minLength: 8 ,maxLength: 25},
                    first_name: {type: 'string', maxLength: 15},
                    last_name: {type: 'string', maxLength: 15},
                }
            },
            response:
            {
                '201':
                {
                    type : 'object',
                    properties:
                    {
                        Success: {type: 'string'}
                    }
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
        handler: registerC
    }
    
    fastify.post('/register/', registerSchema)

    fastify.get('/all', async (req, res) => {
        const users = await pool.query('SELECT * FROM account')
        res.send(JSON.stringify(users.rows, null, 2))
    })

    done()
}

export default RegisterRoute
