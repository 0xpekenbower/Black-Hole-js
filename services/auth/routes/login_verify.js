import fp from 'fastify-plugin'

export default fp((fastify, opts, done) => {
    fastify.register(import ('@fastify/jwt'),
    {secret: '71821d592d349c450834bab1178d681d13f5937bdd35fc60bf41ae5a0bc394fda1ba230206c983129e0c4f0ee919d09b6e9989e0d157645b4d727103a0a03a10',
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