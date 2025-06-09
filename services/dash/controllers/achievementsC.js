import achievementsS from "../services/achievementsS.js";

export default {
    async update_achievementsC(req, res) {
        try
        {
            const {achievID, parts} = req.body

            if (achievID > 12 || achievID <= 0)
                throw new Error('achievID does not exists on the db')

            if (parts <= 0)
                throw new Error('Parts cannot be negative')
            
            await achievementsS.update_achievementsS(req.user.id, achievID, parts)
            res.status(200)
        }
        catch(err)
        {
            res.status(400).send({Error:err.message})
        }
    },

    async add_achievementsC(req, res) {
        try
        {
            const {achievID, parts} = req.body

            if (achievID > 12 || achievID <= 0)
                throw new Error('achievID does not exists on the db')
            if (parts <= 0)
                throw new Error('Parts cannot be negative')
            await achievementsS.add_achievementsS(req.user.id, achievID, parts)
            res.status(200)
        }
        catch(err)
        {
            res.status(400).send({Error:err.message})
        }
    },
    async list_achievementsC(req, res) {
        try
        {
            const all_achiev = await achievementsS.list_achievementsS(req.user.id)
            res.status(200).send({msg:all_achiev})
        }
        catch(err)
        {
            res.status(400).send({Error:err.message})
        }
    }

}