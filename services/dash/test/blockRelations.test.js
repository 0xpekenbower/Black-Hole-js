import appBuilder from '../app.js'
import request from 'supertest'
import pool from '../config/pooling.js';

const USER1 = 'buddha'
const EMAIL1 = 'buddha@hotmail.com'

const USER2 = 'buddha2'
const EMAIL2 = 'buddha2@hotmail.com'

describe ('Checking Block feature', () => {

    let fastify, token1, token2, id1, id2;

    beforeAll( async() => {
        fastify = await appBuilder()
        await fastify.ready()

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
        await pool.query('DELETE FROM player;')
        
        await pool.end()
    })

    afterEach(async() => {
        await pool.query('DELETE FROM friends;')
    })
    

    describe('Checking Block Features', () => {

        test('valid block a friend', async() => {
            await pool.query('INSERT INTO friends(sender, receiver, status) \
                VALUES($1, $2, $3);', [id1, id2, 1])
            
            const resp = await request(fastify.server)
            .get('/api/dash/block/')
            .set('Authorization', `Bearer ${token1}`)
            .query({id: id2})

            const check = await pool.query('SELECT EXISTS(SELECT 1 FROM friends WHERE \
                sender = $1 AND receiver = $2 AND status = $3);', [id1, id2, -1])

            expect(check.rows[0].exists).toBeTruthy()
            expect(resp.statusCode).toBe(200)
        })

        test('change sender and receiver', async() => {
            await pool.query('INSERT INTO friends(sender, receiver, status) \
                VALUES($1, $2, $3);', [id2, id1, 1])
            
            const resp = await request(fastify.server)
            .get('/api/dash/block/')
            .set('Authorization', `Bearer ${token1}`)
            .query({id: id2})

            const check = await pool.query('SELECT EXISTS(SELECT 1 FROM friends WHERE \
                sender = $1 AND receiver = $2 AND status = $3);', [id2, id1, -1])

            expect(check.rows[0].exists).toBeTruthy()
            expect(resp.statusCode).toBe(200)
        })


        test('block another user', async() => {
            const resp = await request(fastify.server)
            .get('/api/dash/block/')
            .set('Authorization', `Bearer ${token1}`)
            .query({id: id2})

            const check = await pool.query('SELECT EXISTS(SELECT 1 FROM friends WHERE \
                sender = $1 AND receiver = $2 AND status = $3);', [id1, id2, -1])

            expect(check.rows[0].exists).toBeTruthy()
            expect(resp.statusCode).toBe(200)
        })


        test('block a user does not exists', async() => {
            const resp = await request(fastify.server)
            .get('/api/dash/block/')
            .set('Authorization', `Bearer ${token1}`)
            .query({id: 651})

            const check = await pool.query('SELECT EXISTS(SELECT 1 FROM friends WHERE \
                sender = $1 AND receiver = $2);', [id1, 651])

            expect(check.rows[0].exists).toBeFalsy()
            expect(resp.statusCode).toBe(400)
        })
    })



    describe('Checking unBlock Features', () => {

        test('valid unblock', async() => {
            await pool.query('INSERT INTO friends(sender, receiver, status)  \
                VALUES($1, $2, $3);', [id1, id2, -1])

            const resp = await request(fastify.server)
            .get('/api/dash/unblock/')
            .set('Authorization', `Bearer ${token1}`)
            .query({id: id2})

            const check = await pool.query('SELECT EXISTS(SELECT 1 FROM friends WHERE \
                sender = $1 AND receiver = $2);', [id1, id2])

            expect(resp.statusCode).toBe(200)
            expect(check.rows[0].exists).toBeFalsy()
        })


        test('try unblock by the blocked user', async() => {
            await pool.query('INSERT INTO friends(sender, receiver, status)  \
                VALUES($1, $2, $3);', [id1, id2, -1])

            const resp = await request(fastify.server)
            .get('/api/dash/unblock/')
            .set('Authorization', `Bearer ${token2}`)
            .query({id: id1})

            const check = await pool.query('SELECT EXISTS(SELECT 1 FROM friends WHERE \
                sender = $1 AND receiver = $2 AND status = $3);', [id1, id2, -1])

            expect(resp.statusCode).toBe(400)
            expect(check.rows[0].exists).toBeTruthy()
        })

        test('unblock a friend', async() => {
            await pool.query('INSERT INTO friends(sender, receiver, status)  \
                VALUES($1, $2, $3);', [id1, id2, 1])

            const resp = await request(fastify.server)
            .get('/api/dash/unblock/')
            .set('Authorization', `Bearer ${token1}`)
            .query({id: id2})

            const check = await pool.query('SELECT EXISTS(SELECT 1 FROM friends WHERE \
                sender = $1 AND receiver = $2);', [id1, id2])

            expect(resp.statusCode).toBe(400)
            expect(check.rows[0].exists).toBeTruthy()
        })

        test('unblock a user does not exists', async() => {
            const resp = await request(fastify.server)
            .get('/api/dash/unblock/')
            .set('Authorization', `Bearer ${token1}`)
            .query({id: 651})

            expect(resp.statusCode).toBe(400)
            expect(resp.text).toContain('The relation does not exist')
        })

    })
})