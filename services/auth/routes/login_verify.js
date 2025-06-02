import fp from 'fastify-plugin'

export default fp((fastify, opts, done) => {
    fastify.register(import ('@fastify/jwt'),
    {secret: process.env.JWT_SECRET,
        sign: {expiresIn:'4h'}})

    fastify.decorate("authenticate", async function(request, res) {
        try
        {
            await request.jwtVerify()
        }
        catch (err)
        {
            res.send(err)
        }
    })
    done()
})