import sideBarS from '../services/sideBarS.js'

const sideBarC = async (req, res) => {
    try
    {
        const data = await sideBarS(req.user.id)
        res.status(200).send(data)
    }
    catch(err)
    {
        res.status(400).send({Error: err.message})
    }
}

export default sideBarC