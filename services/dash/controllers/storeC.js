import storeS from '../services/storeS.js'

export default 
{
    async buyC(req, res){
        try
        {
            const {item_id, item_type} = req.body
            let table_name = ''

            if (item_type == 1)
                table_name = 'avatars' 
            else if (item_type == 2)
                table_name = 'backgrounds' 
            else if (item_type == 3)
                table_name = 'emotes_packs' 
            else
                throw new Error('Unknown type')


            const is_success = await storeS.buyS(req.user.id, item_id, item_type, table_name)
            if (!is_success)
                throw new Error('Operation Failed')
            res.status(200)
        }
        catch(err)
        {
            res.status(400).send({ Error:err.message})
        }
    },

    async list_inventoryC(req, res)
    {
        try
        {
            const listed = await storeS.list_inventoryS(req.user.id)
            res.status(200).send(listed)
        }
        catch(err)
        {
            res.status(400).send({Error:err.message})
        }
    }
}
