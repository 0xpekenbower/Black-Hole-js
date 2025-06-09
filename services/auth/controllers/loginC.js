import loginS from '../services/loginS.js'

const loginC = (fastify) => async(req, res) => {
    try
    {
        const {username, password} = req.body
        const token = await loginS.loginS(fastify.jwt, username, password)
        res.status(200).send({token:token})
    }
    catch(err)
    {
        res.status(400).send({Error: err.message})
    }
}

export default loginC