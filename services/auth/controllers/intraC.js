import intraS from '../services/intraS.js'

const intraC = (fastify) => async(req, res) => {
    try
    {
        const code = req.query['code']
        console.log(code);
        const token = await intraS(fastify.jwt, code)
        
        // Redirect to frontend with token instead of returning JSON
        const frontendUrl = 'http://blackholejs.art'
        const redirectUrl = `${frontendUrl}/login?token=${token}`
        res.redirect(redirectUrl)
    }
    catch(err)
    {
        console.error(`Error in intraC: ${err}`)
        res.status(400).send({Error: err.message})
    }
}

export default intraC