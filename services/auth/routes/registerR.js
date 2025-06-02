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
                required : ['email', 'password', 'repassword', 'first_name', 'last_name'],
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
        preHandler: async (request, reply) => {
            const firstInitial = request.body.first_name.charAt(0).toLowerCase();            
            // Handle case where last_name might be empty
            let lastNamePart = "";
            if (request.body.last_name && request.body.last_name.trim() !== "") {
                lastNamePart = request.body.last_name.toLowerCase().replace(/\s+/g, '').slice(0, 7);
            } else {
                // If no last name, use more characters from first name
                lastNamePart = request.body.first_name.toLowerCase().slice(1, 8);
            }
            
            request.body.username = (firstInitial + lastNamePart).slice(0, 8);
        },
        handler: registerC
    }
    
    fastify.post('/api/auth/register/', registerSchema)

    fastify.get('/all', async (req, res) => {
        const users = await pool.query('SELECT * FROM account')
        res.send(JSON.stringify(users.rows, null, 2))
    })

    done()
}

export default RegisterRoute
