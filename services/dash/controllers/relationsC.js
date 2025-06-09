import URServices from '../services/relationsS.js'

export default 
{
    async SendReqC(req, res){
        try
        {
            if (req.user.id == req.query['id'])
                throw new Error('You cannot send a req to yoursef')

            await URServices.SendReq(req.user.id, req.query['id'])
            res.status(200)
        }
        catch(err)
        {
            res.status(400).send({Error:err.message})
        }
    },

    async AcceptReqC(req, res){
        try
        {
            if (req.user.id == req.query['id'])
                throw new Error('You cannot accept yoursef')

            await URServices.AcceptReq(req.user.id, req.query['id'])
            res.status(200)
        }
        catch(err)
        {
            res.status(400).send({Error:err.message})
        }
    },

    async DenyReqC(req, res){
        try
        {
            if (req.user.id == req.query['id'])
                throw new Error('You cannot deny your own req')

            await URServices.DenyReq(req.user.id, req.query['id'])
            res.status(200)
        }
        catch(err)
        {
            res.status(400).send({Error:err.message})
        }
    },

    async cancelMyReqC(req, res){
        try
        {
            if (req.user.id == req.query['id'])
                throw new Error('You cannot cancel your own req')

            const rowCount = await URServices.cancelMyReqS(req.user.id, req.query['id'])

            if (!rowCount)
                throw new Error('The relation does not exist')
            
            res.status(200)
        }
        catch(err)
        {
            res.status(400).send({Error:err.message})
        }
    },

    async blockUserC(req, res){
        try
        {
            if (req.user.id == req.query['id'])
                throw new Error('You cannot cancel your own req')

            await URServices.blockUser(req.user.id, req.query['id'])

            res.status(200)
        }
        catch(err)
        {
            res.status(400).send({Error:err.message})
        }
    },

    async unblockUserC(req, res){
        try
        {
            if (req.user.id == req.query['id'])
                throw new Error('You cannot cancel your own req')

            const rowCount = await URServices.unblockUser(req.user.id, req.query['id'])

            if (!rowCount)
                throw new Error('The relation does not exist')
            
            res.status(200)
        }
        catch(err)
        {
            res.status(400).send({Error:err.message})
        }
    },

    async unfriendC(req, res){
        try
        {
            if (req.user.id == req.query['id'])
                throw new Error('You cannot unfriend yoursef')

            const rowCount = await URServices.unfriendReq(req.user.id, req.query['id'])
            
            if (!rowCount)
                throw new Error('The relation does not exist')
            
            res.status(200)
        }
        catch(err)
        {
            res.status(400).send({Error:err.message})
        }
    },

    async AllRelationsC(req, res){
        try
        {
            const relations =  await URServices.AllRelations(req.user.id)
            res.status(200).send(relations)
        }
        catch(err)
        {
            res.status(400).send({Error:err.message})
        }
    },
}