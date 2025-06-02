import googleS from '../services/googleS.js'

const googleC = (fastify) => async(req, res) => {
    try
    {
        const code = req.query['code']

        const token = await googleS(fastify.jwt, code)
        res.status(200).send({Success: 'true', token:token})
    }
    catch(err)
    {
        res.status(400).send({Error: err.message})
    }
}

export default googleC