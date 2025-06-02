import intraS from '../services/intraS.js'

const intraC = (fastify) => async(req, res) => {
    try
    {
        const code = req.query['code']

        const token = await intraS(fastify.jwt, code)
        res.status(200).send({Success: 'true', token:token})
    }
    catch(err)
    {
        res.status(400).send({Error: err.message})
    }
}

export default intraC