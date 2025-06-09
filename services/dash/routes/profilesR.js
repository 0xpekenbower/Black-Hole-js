import PC from "../controllers/profilesC.js"

const profilesR = (fastify, options, done) => {

    const getCardSchema = {
        schema:
        {
            headers: {
                type: 'object',
                required: ['authorization'],
                properties: {
                    authorization: { type: 'string' },
                },
            },
            querystring:{
                type: 'object',
                properties: { id: {type:'string'} }
            },
            response:
            {
                200: {
                    type: 'object',
                    properties: {
                      User: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer' },
                          username: { type: 'string' },
                          first_name: { type: ['string', 'null'] },
                          last_name: { type: ['string', 'null'] },
                          avatar: { type: ['string', 'null'] },
                          background: { type: ['string', 'null'] },
                          bio: { type: ['string', 'null'] },
                          is_online: { type: 'boolean' },
                          is_oauth: { type: 'boolean' },
                          exp: { type: 'integer' },
                          rank: { type: 'integer' },
                          level: { type: 'integer' }
                        }
                      },
                      Level: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer' },
                          min_exp: { type: 'integer' },
                          max_exp: { type: 'integer' },
                          reward: { type: 'integer' }
                        }
                      },
                      Rank: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          min_exp: { type: 'integer' },
                          max_exp: { type: 'integer' },
                          reward: { type: 'integer' },
                          icon_path: { type: 'string' }
                        }
                      },
                      Friends: { type: 'array' },
                      is_self: { type: 'boolean' },
                      Friendship: { type: 'integer' }
                    }
                  },
                '4xx': { type:'object', properties: { Error: {type:'string'} } }
            }
        },
        handler: PC.profilesC
    }

    const searchSchema = {
        schema:
        {
            headers: {
                type: 'object',
                required: ['authorization'],
                properties: {
                    authorization: { type: 'string' },
                },
            },
            querystring:
            {
                type: 'object',
                required: ['q'],
                properties: { q: {type:'string'} }
            },
            response:
            {
                '200': { type: 'array', items: { id: {type:'string'}, username: {type: 'string'}} },
                '4xx': { type:'object', properties: { Error: {type:'string'} } }
            }
        },
        handler: PC.searchC
    }

    const changePassSchema = {
        schema:
        {
            headers: {
                type: 'object',
                required: ['authorization'],
                properties: {
                    authorization: { type: 'string' },
                },
            },
            body:
            {
                type: 'object',
                required: ['old_pass', 'new_pass', 're_pass'],
                properties: {old_pass: {type:'string'}, new_pass: {type:'string'}, re_pass: {type:'string'}}
            },
            response:
            {
                '200': { type : 'null' },
                '4xx': { type:'object', properties: { Error: {type:'string'} } }
            }
        },
        handler: PC.changePassC
    }

    const editSchema = {
        schema:
        {
            headers: {
                type: 'object',
                required: ['authorization'],
                properties: {
                    authorization: { type: 'string' },
                },
            },
            body:
            {
                type: 'object',
                properties: {first_name: {type:'string'}, last_name: {type:'string'}, bio: {type:'string'}, avatar: {type:'string'}, background: {type:'string'}}
            },
            response:
            {
                '200': { type : 'null' },
                '4xx': { type:'object', properties: { Error: {type:'string'} } }
            }
        },
        handler: PC.editC
    }

    fastify.get('/api/dash/get-card/', getCardSchema)
    fastify.get('/api/dash/search/', searchSchema)
    fastify.post('/api/dash/change-password/', changePassSchema)
    fastify.post('/api/dash/edit/', editSchema)
    
    done()
}

export default profilesR