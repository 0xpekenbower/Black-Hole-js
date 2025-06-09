import appBuilder from '../app.js'
import request from 'supertest'
import pool from '../config/pooling.js';

const USER1 = 'buddha'
const EMAIL1 = 'buddha@hotmail.com'

const USER2 = 'buddha2'
const EMAIL2 = 'buddha2@hotmail.com'

describe ('Checking Friends features', () => {

    let fastify, token1, token2, id1, id2;

    beforeAll( async() => {
        fastify = await appBuilder()
        await fastify.ready()

        await pool.query('DELETE FROM notifs;')
        await pool.query('DELETE FROM friends;')
        await pool.query('DELETE FROM player;')

        const user1 = await pool.query('INSERT INTO player(username, email) \
            VALUES($1, $2) RETURNING id', [USER1, EMAIL1])

        const user2 = await pool.query('INSERT INTO player(username, email) \
            VALUES($1, $2) RETURNING id', [USER2, EMAIL2])

        id1 = user1.rows[0].id
        id2 = user2.rows[0].id

        token1 = fastify.jwt.sign({id: id1})
        token2 = fastify.jwt.sign({id: id2})
    })

    afterAll( async() => {
        await fastify.close()
        
        await pool.query('DELETE FROM friends;')
        await pool.query('DELETE FROM notifs;')
        await pool.query('DELETE FROM player;')
        
        await pool.end()
    })

    afterEach(async() => {
        await pool.query('DELETE FROM friends;')
    })


    // fastify.get('/api/dash/send-req/' ,URController.SendReqC)
    // fastify.get('/api/dash/cancel/', URController.cancelMyReqC)
    // fastify.get('/api/dash/accept-req/' ,URController.AcceptReqC)
    // fastify.get('/api/dash/deny-req/', URController.DenyReqC)
    // fastify.get('/api/dash/unfriend/', URController.unfriendC)


    describe ('testing /send-req/', () => {

        test('valid friend req', async () => {

            const resp = await request(fastify.server)
            .get('/api/dash/send-req/')
            .set('Authorization', `Bearer ${token1}`)
            .query({ id: id2 })

            const check = await pool.query('SELECT status FROM friends  \
                WHERE sender = $1 AND receiver = $2;', [id1, id2])

            expect(resp.statusCode).toBe(200)
            expect(check.rows[0].status).toBe(0)
        })


        test('self friend req', async () => {

            const resp = await request(fastify.server)
            .get('/api/dash/send-req/')
            .set('Authorization', `Bearer ${token1}`)
            .query({ id: id1 })

            expect(resp.statusCode).toBe(400)
        })


        test('invalid id', async () => {

            const resp = await request(fastify.server)
            .get('/api/dash/send-req/')
            .set('Authorization', `Bearer ${token1}`)
            .query({ id: 1651 })

            expect(resp.statusCode).toBe(400)
        })
    })

    describe ('testing /send-req/ + /cancel/', () => {

        test('valid cancel', async () => {

            await request(fastify.server)
            .get('/api/dash/send-req/')
            .set('Authorization', `Bearer ${token1}`)
            .query({ id: id2 })


            const resp = await request(fastify.server)
            .get('/api/dash/cancel/')
            .set('Authorization', `Bearer ${token1}`)
            .query({ id: id2 })

            expect(resp.statusCode).toBe(200)
        })

        test('without id cancel', async () => {

            await request(fastify.server)
            .get('/api/dash/send-req/')
            .set('Authorization', `Bearer ${token1}`)
            .query({ id: id2 })


            const resp = await request(fastify.server)
            .get('/api/dash/cancel/')
            .set('Authorization', `Bearer ${token1}`)

            expect(resp.statusCode).toBe(400)
        })

        test('invalid id', async () => {

            const resp = await request(fastify.server)
            .get('/api/dash/cancel/')
            .set('Authorization', `Bearer ${token1}`)
            .query({ id: 651 })

            expect(resp.statusCode).toBe(400)
        })

        test('cancel self id', async () => {

            const resp = await request(fastify.server)
            .get('/api/dash/cancel/')
            .set('Authorization', `Bearer ${token1}`)
            .query({ id: id1 })

            expect(resp.statusCode).toBe(400)
        })

    })

    describe ('testing /accept-req/', () => {

        test('valid friend process', async () => {

            await request(fastify.server)
            .get('/api/dash/send-req/')
            .set('Authorization', `Bearer ${token1}`)
            .query({ id: id2 })


            const resp = await request(fastify.server)
            .get('/api/dash/accept-req/')
            .set('Authorization', `Bearer ${token2}`)
            .query({ id: id1 })

            const check = await pool.query('SELECT EXISTS(SELECT 1 FROM friends \
                WHERE sender = $1 AND receiver = $2 AND status = $3)', [id1, id2, 1])

            expect(check.rows[0].exists).toBeTruthy()
            expect(resp.statusCode).toBe(200)
        })

        test('accept a user didnt sent a friend req', async () => {

            const resp = await request(fastify.server)
            .get('/api/dash/accept-req/')
            .set('Authorization', `Bearer ${token2}`)
            .query({ id: id1 })

            const check = await pool.query('SELECT EXISTS(SELECT 1 FROM friends \
                WHERE sender = $1 AND receiver = $2 AND status = $3)', [id1, id2, 1])

            expect(check.rows[0].exists).toBeFalsy()
            expect(resp.text).toContain('The relation does not exist')
            expect(resp.statusCode).toBe(400)
        })


        test('accept a friend', async () => {
            await request(fastify.server)
            .get('/api/dash/send-req/')
            .set('Authorization', `Bearer ${token1}`)
            .query({ id: id2 })

            await request(fastify.server)
            .get('/api/dash/accept-req/')
            .set('Authorization', `Bearer ${token2}`)
            .query({ id: id1 })

            const resp = await request(fastify.server)
            .get('/api/dash/accept-req/')
            .set('Authorization', `Bearer ${token2}`)
            .query({ id: id1 })

            const check = await pool.query('SELECT EXISTS(SELECT 1 FROM friends \
                WHERE sender = $1 AND receiver = $2 AND status = $3)', [id1, id2, 1])

            expect(check.rows[0].exists).toBeTruthy()
            expect(resp.text).toContain('The relation does not exist')
            expect(resp.statusCode).toBe(400)
        })


        test('invalid friend id', async () => {

            const resp = await request(fastify.server)
            .get('/api/dash/accept-req/')
            .set('Authorization', `Bearer ${token2}`)
            .query({ id: 65122 })

            const check = await pool.query('SELECT EXISTS(SELECT 1 FROM friends \
                WHERE sender = $1 AND receiver = $2 AND status = $3)', [id1, id2, 1])

            expect(check.rows[0].exists).toBeFalsy()
            expect(resp.text).toContain('Account not found')
            expect(resp.statusCode).toBe(400)
        })


    })

    describe ('testing /deny-req/', () => {

        test('valid deny process', async () => {

            await request(fastify.server)
            .get('/api/dash/send-req/')
            .set('Authorization', `Bearer ${token1}`)
            .query({ id: id2 })


            const resp = await request(fastify.server)
            .get('/api/dash/deny-req/')
            .set('Authorization', `Bearer ${token2}`)
            .query({ id: id1 })

            const check = await pool.query('SELECT EXISTS(SELECT 1 FROM friends \
                WHERE sender = $1 AND receiver = $2)', [id1, id2])

            expect(check.rows[0].exists).toBeFalsy()
            expect(resp.statusCode).toBe(200)
        })

        test('invalid deny process', async () => {

            const resp = await request(fastify.server)
            .get('/api/dash/deny-req/')
            .set('Authorization', `Bearer ${token2}`)
            .query({ id: id1 })

            const check = await pool.query('SELECT EXISTS(SELECT 1 FROM friends \
                WHERE sender = $1 AND receiver = $2)', [id1, id2])

            expect(check.rows[0].exists).toBeFalsy()
            expect(resp.statusCode).toBe(400)
        })

    })

    describe ('testing /unfriend/', () => {

        test('testing send-req + accept-req + unfiend-req by id1', async() => {

            await request(fastify.server)
            .get('/api/dash/send-req/')
            .set('Authorization', `Bearer ${token1}`)
            .query({ id: id2 })

            await request(fastify.server)
            .get('/api/dash/accept-req/')
            .set('Authorization', `Bearer ${token2}`)
            .query({ id: id1 })

            const resp = await request(fastify.server)
            .get('/api/dash/unfriend/')
            .set('Authorization', `Bearer ${token2}`)
            .query({ id: id1 })

            const check = await pool.query('SELECT EXISTS(SELECT 1 FROM friends \
                WHERE sender = $1 AND receiver = $2)', [id1, id2])

            expect(check.rows[0].exists).toBeFalsy()
            expect(resp.statusCode).toBe(200)
        })


        test('testing send-req + accept-req + unfiend-req by id2', async() => {

            await request(fastify.server)
            .get('/api/dash/send-req/')
            .set('Authorization', `Bearer ${token1}`)
            .query({ id: id2 })

            await request(fastify.server)
            .get('/api/dash/accept-req/')
            .set('Authorization', `Bearer ${token2}`)
            .query({ id: id1 })

            const resp = await request(fastify.server)
            .get('/api/dash/unfriend/')
            .set('Authorization', `Bearer ${token1}`)
            .query({ id: id2 })

            const check = await pool.query('SELECT EXISTS(SELECT 1 FROM friends \
                WHERE sender = $1 AND receiver = $2)', [id1, id2])

            expect(check.rows[0].exists).toBeFalsy()
            expect(resp.statusCode).toBe(200)
        })
    })
})