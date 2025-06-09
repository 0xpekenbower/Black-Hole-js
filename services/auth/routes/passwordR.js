import changePassC from '../controllers/passwordC.js'

const passR = (fastify, options, done) => {



    const changePassSchema = {
        schema:
        {
            headers:
            {
                type: 'object',
                properties: {
                    'Authorization': {type: 'string'}
                },
                required: ['Authorization']
            },
            body:
            {
                type:'object',
                required : ['old_pass', 'new_pass'],
                properties:
                {
                    old_pass: {type: 'string', minLength: 8 ,maxLength: 25},
                    new_pass: {type: 'string', minLength: 8 ,maxLength: 25},
                }
            },
            response:
            {
                '200':
                {
                    type : 'null',
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
        handler: changePassC(fastify),
        onRequest : fastify.authenticate
    }


    fastify.post('/api/auth/change-password/', changePassSchema)

    done()
}

export default passR