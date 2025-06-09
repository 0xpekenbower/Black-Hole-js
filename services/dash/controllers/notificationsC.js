import notifsS from '../services/notificationsS.js'

export default {
    async limit4(req, res) {
        try
        {
            res.status(200).send(await notifsS.limit4S(req.user.id))
        }
        catch(err)
        {
            res.status(400).send({Error:err.message})
        }
    },

    async detail(req, res) {
        try
        {
            res.status(200).send(await notifsS.detailS(req.user.id))
        }
        catch(err)
        {
            res.status(400).send({Error:err.message})
        }
    },

    async seen(req, res) {
        try
        {
            await notifsS.seenS(req.user.id)
            res.status(200)
        }
        catch(err)
        {
            res.status(400).send({Error:err.message})
        }
    },
}
