import forgetPassC from "../controllers/forgetPassC.js"

const forgetPassR = (fastify, options, done) => {

    const send_mail_schema = {
        schema:
        {
            body:
            {
                type: 'object',
                required: ['email'],
                properties: { email: {type:'string'} }
            },
            response:
            {
                '200':
                {
                    type : 'object',
                    properties: { token: {type : 'string'} }
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
        handler: forgetPassC.send_mail
    }

    const forgetPassSchema = {
        schema:
        {
            body:
            {
                type: 'object',
                required: ['email', 'code', 'password', 'repassword'],
                properties: { 
                    email: {type:'string'},
                    code: { type:'string',
                        maxLength: 6,
                        minLength: 6
                    },
                    password: {type: 'string',
                        maxLength: 25,
                        minLength: 8
                    },
                    repassword: {type: 'string',
                        maxLength: 25,
                        minLength: 8
                    },
                }
            },
            response:
            {
                '200':
                {
                    type : 'object',
                    properties: { token: {type : 'string'} }
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
        handler: forgetPassC.forget_passC
    }


    const checkCodeSchema = {
        schema:
        {
            body:
            {
                type: 'object',
                required: ['email', 'code'],
                properties: { 
                    email: {type:'string'},
                    code: { type:'string',
                        maxLength: 6,
                        minLength: 6
                    }
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
        handler: forgetPassC.checkCodeC
    }




    fastify.post('/api/auth/send-mail/', send_mail_schema)
    fastify.post('/api/auth/forget-pass/', forgetPassSchema)
    fastify.post('/api/auth/check/', checkCodeSchema)

    done()
}

export default forgetPassR