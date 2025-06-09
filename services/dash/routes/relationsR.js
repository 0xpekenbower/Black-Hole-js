import URController from '../controllers/relationsC.js'

const createFriend = (fastify, options, done) => {

    const Schema = {
        schema:
        {
            querystring:
            {
                type: 'object',
                required: ['id'],
                properties: { id: {type:'string'} }
            },
            response:
            {
                '200': { type : 'null' },
                '4xx': { type:'object', properties: { Error: {type:'string'} } }
            }
        },
    }
 
    fastify.get('/api/dash/send-req/' , Schema ,URController.SendReqC)
    fastify.get('/api/dash/cancel/', Schema ,URController.cancelMyReqC)
    fastify.get('/api/dash/accept-req/' ,Schema ,URController.AcceptReqC)
    fastify.get('/api/dash/deny-req/', Schema ,URController.DenyReqC)
    fastify.get('/api/dash/unfriend/', Schema ,URController.unfriendC)
    
    fastify.get('/api/dash/all-relations/', URController.AllRelationsC)
    
    fastify.get('/api/dash/block/', Schema ,URController.blockUserC)
    fastify.get('/api/dash/unblock/', Schema ,URController.unblockUserC)
    
    done()
}

export default createFriend