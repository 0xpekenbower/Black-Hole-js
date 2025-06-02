import appBuilder from "./app.js"

const start = async () => {
    try
    {
        const fastify = await appBuilder()
        await fastify.listen({ 
            port: process.env.PORT || 8002,
            host: '0.0.0.0' // Listen on all interfaces to be accessible from other containers
        })
    }
    catch (err)
    {
        console.log(err)
        process.exit(1)
    }
}

start()