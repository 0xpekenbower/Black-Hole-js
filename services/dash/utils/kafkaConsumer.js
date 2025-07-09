import kafka from '../config/kafkaClient.js'
import pool from '../config/pooling.js'


const newGameConsumer = async (message) => {
    console.log("TRYING TO UPDATE EXP")

    const {id1, id2, points1, points2} = JSON.parse(message.value)

    let winnerID = id1;

    if (points2 > points1)
        winnerID = id2;

    const {rank, level, exp} = (await pool.query('SELECT rank, level, exp FROM player WHERE id = $1', [winnerID])).rows[0]
    let {min_exp, max_exp, reward} = (await pool.query('SELECT min_exp, max_exp, reward FROM levels WHERE id = $1', [level])).rows[0]
    
    const calculatedXP = (max_exp - min_exp) / 3 + Math.abs(points1 - points2) * (level * 3)
    

    if (exp + calculatedXP >= max_exp)
    {
        await pool.query('UPDATE player \
            SET level = level + 1, budget = budget + $1 \
            WHERE id = $2', [reward, winnerID])
    }

    let rankResult = (await pool.query('SELECT min_exp, max_exp, reward FROM ranks WHERE id = $1', [rank])).rows[0]

    if (exp + calculatedXP >= rankResult.max_exp)
    {
        await pool.query('UPDATE player \
            SET rank = rank + 1, budget = budget + $1 \
            WHERE id = $2', [rankResult.reward, winnerID])
    }

    await pool.query('UPDATE player \
        SET exp =  exp + $1, budget = budget + $3 \
        WHERE id = $2', [Math.round(calculatedXP), winnerID, Math.abs(points1 - points2) * (level * rank * 3)])
}


const newUserConsumer = async (message) => {
    const {id, username, email, first_name, last_name, is_oauth, otp_secret, avatar} = JSON.parse(message.value)
    
    await pool.query('INSERT INTO player(id, username, email, first_name, last_name, is_oauth, otp_secret, avatar)  \
        VALUES($1, $2, $3, $4, $5, $6, $7, $8);', [id, username, email, first_name, last_name, is_oauth, otp_secret, avatar])
}

const kafkaConsumer = async (fastify) => {
    try
    {   // Keep this name for the groupId 
        const consumer = kafka.consumer({ groupId: 'dash-grp' })

        await consumer.connect()
        await consumer.subscribe({ topic: 'newUser', fromBeginning: false})
        await consumer.subscribe({ topic: 'newGame', fromBeginning: false})

        consumer.run({
            eachMessage: async ({ topic, message }) => {
                
                if (topic == 'newUser')
                {
                    await newUserConsumer(message)
                }
                else if (topic == 'newGame')
                {
                    await newGameConsumer(message)
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