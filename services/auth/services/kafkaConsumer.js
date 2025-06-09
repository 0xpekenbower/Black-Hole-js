import kafka from '../config/kafkaClient.js'
import pool from '../config/pooling.js'

const kafkaConsumer = async (fastify) => {
    try
    {
        const consumer = kafka.consumer({ groupId: 'auth-grp' })

        await consumer.connect()
        await consumer.subscribe({ topic: 'OTP', fromBeginning: false})

        consumer.run({
            eachMessage: async ({ topic, message }) => {
                
                if (topic == 'OTP')
                {
                    const {id, is_otp} = JSON.parse(message.value)
                    
                    await pool.query('UPDATE account SET is_otp = $2   \
                         WHERE id = $1;', [id, is_otp])
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