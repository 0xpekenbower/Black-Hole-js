import convS from '../services/convS.js'

const convC = async (req, res) => {
    try
    {
        const otherID = req.query['id']

        const data = await convS(req.user.id, otherID)
        res.status(200).send(data)
    }
    catch(err)
    {
        res.status(400).send({Error: err.message})
    }
}

export default convC