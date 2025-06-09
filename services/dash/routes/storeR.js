import StoreC from '../controllers/storeC.js'

const storeR = (fastify, options, done) => {

    const buySchema = {
        schema:
        {
            body:
            {
                type: 'object',
                properties: {item_id: {type:'string'}, item_type: {type:'string'}}
            },
            response:
            {
                '200': { type : 'null' },
                '4xx': { type:'object', properties: { Error: {type:'string'} } }
            }
        },
        handler: StoreC.buyC
    }

    const inventorySchema = {
        schema:
        {
            response:
            {
                '200': { type : 'array', items: {item_id: {type:'string'}, item_type: {type:'string'}} },
                '4xx': { type:'object', properties: { Error: {type:'string'} } }
            }
        },
        handler: StoreC.list_inventoryC
    }


    fastify.post('/api/dash/store/buy/', buySchema)
    fastify.get('/api/dash/inventory/', inventorySchema)
    done()
}

export default storeR