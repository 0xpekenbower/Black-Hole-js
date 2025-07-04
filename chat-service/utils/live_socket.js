import {Server} from 'socket.io'
import pool from '../config/pooling.js'

const online_state = (fastify, options, done) => {
    const io = new Server(fastify.server, {connectionStateRecovery: {}})
    let online_users = new Map()

    try{
        io.use(async (socket, next) => { //middleware
            if (!socket.handshake.query || !socket.handshake.query.token)
                next(new Error('Auth err'))

            socket.decoded = await fastify.jwt.verify(socket.handshake.query.token, process.env.JWT_SECRET)

            online_users.set(socket.decoded.id, socket.id)
            next()
        })

        io.on('connection', async (socket) => {
            console.log(online_users)


            socket.on('msg', async (json_data) => {
                const data = json_data.data
                const receiver = Number(json_data.receiver)
                if (data && receiver != socket.decoded.id)
                {
                    const check_receiver = await pool.query('SELECT EXISTS(SELECT 1 FROM chatter WHERE id = $1)', [receiver])
                    if (check_receiver.rows[0].exists)
                    {

                        const user1 = Math.max(socket.decoded.id, receiver)
                        const user2 = Math.min(socket.decoded.id, receiver)
                        
                        io.to(online_users.get(receiver)).emit("msg", data)
                        await pool.query('INSERT INTO msg(user1, user2, sender, data) \
                            VALUES($1, $2, $3, $4)', [user1, user2, socket.decoded.id, data])
                    }
                    else{
                        console.log('user does not exists')
                    }
                }
            })

            socket.on('disconnect', async () => {
                online_users.delete(socket.decoded.id)
            })
        })
    }
    catch(err)
    {
        console.log(err)
    }
    
    done()
}

export default online_state