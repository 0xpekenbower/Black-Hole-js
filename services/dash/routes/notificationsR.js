import notifsC from '../controllers/notificationsC.js'

const notifs = (fastify, options, done) => {

    const Schema = {
        schema:
        {
            response:
            {
                '200': { type: 'array', items: {
                     sender: {type:'string'}, notif_type: {type: 'string'},
                     is_readen: {type:'string'}, created_at: {type: 'string'}}
                    },
                '4xx': { type:'object', properties: { Error: {type:'string'} } }
            }
        }
    }

    const seenSchema = {
        schema:
        {
            response:
            {
                '200': { type: 'null'},
                '4xx': { type:'object', properties: { Error: {type:'string'} } }
            }
        }
    }

    fastify.get('/api/dash/notif/limit4/', Schema, notifsC.limit4)
    fastify.get('/api/dash/notif/detail/', Schema, notifsC.detail)
    fastify.get('/api/dash/notif/seen/', seenSchema, notifsC.seen)

    done()
}

export default notifs