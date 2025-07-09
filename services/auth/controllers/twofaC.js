import twofaS from '../services/twofaS.js'

const twofaC = async(req, res) => {
    try
    {
        const {code, username} = req.body
        const token = await twofaS(code, username)

        res.status(200).send({token: token})
    }
    catch(err)
    {
        res.status(401).send({Error: err.message})
    }
}

export default twofaC