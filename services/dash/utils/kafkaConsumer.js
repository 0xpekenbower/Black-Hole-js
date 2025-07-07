import kafka from '../config/kafkaClient.js'
import pool from '../config/pooling.js'


const newGameConsumer = async (message) => {

    const {id1, id2, points1, points2} = JSON.parse(message.value)

    let winnerID = id1;

    if (points2 > points1)
        winnerID = id2;

    const {level, exp} = await pool.query('SELECT level, exp FROM player WHERE id = $1', [winnerID]).rows[0]
    let {minExp, maxExp, rewardLevel} = await pool.query('SELECT min_exp, max_exp, reward FROM levels WHERE id = $1', [winnerID]).rows[0]
    let {maxExpRank, rewardRank} = await pool.query('SELECT min_exp, max_exp, reward FROM levels WHERE id = $1', [winnerID]).rows[0]
    
    const calculatedXP = (maxExp - minExp) / 4 + Math.abs(points1 - points2) * (level * 3)

    if (exp + calculatedXP >= maxExp)
    {
        await pool.query('UPDATE player \
            SET level = level + 1, budget = budget + $1 \
            WHERE id = $2', [rewardLevel, winnerID])
    }

    if (exp + calculatedXP >= maxExpRank)
    {
        await pool.query('UPDATE player \
            SET rank = rank + 1, budget = budget + $1 \
            WHERE id = $2', [rewardRank, winnerID])
    }

    await pool.query('UPDATE player \
        SET exp =  exp + $1 \
        WHERE id = $2', [calculatedXP, winnerID])
}


const newUserConsumer = async (message) => {
    const {id, username, email, first_name, last_name, is_oauth} = JSON.parse(message.value)
                    
    await pool.query('INSERT INTO player(id, username, email, first_name, last_name, is_oauth)  \
            VALUES($1, $2, $3, $4, $5, $6);', [id, username, email, first_name, last_name, is_oauth])
}

const kafkaConsumer = async (fastify) => {
    try
    {
        const consumer = kafka.consumer({ groupId: 'dashboard-grp' })

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