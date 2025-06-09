import appBuilder from "./app.js"

const start = async () => {
    try
    {
        const fastify = await appBuilder()
        // await fastify.listen({ port:8002 })
        // bind to all interfaces
        await fastify.listen({ port:8002, host: '0.0.0.0' })
    }
    catch (err)
    {
        console.log(err)
        process.exit(1)
    }
}

start()