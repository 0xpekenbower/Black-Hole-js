import kafka from '../config/kafkaClient.js'
import pool from '../config/pooling.js'

const kafkaConsumer = async (fastify) => {
    try
    {
        const consumer = kafka.consumer({ groupId: 'chat-grp' })

        await consumer.connect()
        await consumer.subscribe({ topic: 'newUser', fromBeginning: false})

        consumer.run({
            eachMessage: async ({ topic, message }) => {
                
                if (topic == 'newUser')
                {
                    const {id, username, first_name, last_name, avatar, background} = JSON.parse(message.value)
                    
                    await pool.query('INSERT INTO chatter(id, username, first_name, last_name, avatar, background)  \
                        VALUES($1, $2, $3, $4, $5, $6);', [id, username, first_name, last_name, avatar, background])
                    console.log(`consumed new user ${username}`)
                }
            },
        })

        fastify.addHook('onClose', async() => {
            await consumer.disconnect()
        })
    }
    catch(err)
    {
        console.log(`[KAFKA] ${err}`)
    }
}

export default kafkaConsumer