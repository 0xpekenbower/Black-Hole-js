import sendMsgS from '../services/sendMsgS.js'

const sendMsgC = async (req, res) => {
    try
    {
        const {id, msg} = req.body
        await sendMsgS(req.user.id, id, msg)
        res.status(200)
    }
    catch(err)
    {
        res.status(400).send({Error: err.message})
    }
}

export default sendMsgC