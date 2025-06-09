import twofaS from '../services/twofaS.js'

const twofaC = (fastify) => async(req, res) => {
    try
    {
        const {code, id} = req.body
        const token = await twofaS(fastify.jwt, code, id)

        res.status(200).send({token: token})
    }
    catch(err)
    {
        res.status(401).send({Error: err.message})
    }
}

export default twofaC