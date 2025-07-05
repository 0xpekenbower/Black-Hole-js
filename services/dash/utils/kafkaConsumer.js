import kafka from '../config/kafkaClient.js'
import pool from '../config/pooling.js'

const kafkaConsumer = async (fastify) => {
    try
    {
        const consumer = kafka.consumer({ groupId: 'dashboard-grp' })

        await consumer.connect()
        await consumer.subscribe({ topic: 'newUser', fromBeginning: false})

        consumer.run({
            eachMessage: async ({ topic, message }) => {
                
                if (topic == 'newUser')
                {
                    const {id, username, email, first_name, last_name, is_oauth, avatar, background } = JSON.parse(message.value)
                    
                    await pool.query('INSERT INTO player(id, username, email, first_name, last_name, is_oauth, avatar, background)  \
                            VALUES($1, $2, $3, $4, $5, $6, $7, $8);', [id, username, email, first_name, last_name, is_oauth, avatar, background])
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