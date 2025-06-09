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
                    type: 'null'
                },
                '4xx':
                {
                    type:'object',
                    properties:
                    {
                        Error:{type:'string'}
                    }
                }
            }
        },
        handler: registerC
    }
    
    fastify.post('/api/auth/register/', registerSchema)

    done()
}

export default RegisterRoute
