import appBuilder from '../app.js'
import request from 'supertest'
import pool from '../config/pooling.js';

const TEST_USER = 'buddha'
const TEST_EMAIL = 'buddha@hotmail.com'
const TEST_BUDGET = 100

describe ('Checking achievements feature', () => {

    let fastify, token;

    beforeAll( async() => {
        fastify = await appBuilder()
        await fastify.ready()

        await pool.query('DELETE FROM inventory;')
        await pool.query('DELETE FROM player;')
    })

    afterAll( async() => {
        await fastify.close()

        await pool.end()
    })

    afterEach( async() => {
        await pool.query('DELETE FROM inventory;')
        await pool.query('DELETE FROM player;')

    })

    beforeEach( async() => {
        const user = await pool.query('INSERT INTO player(username, email, budget) \
            VALUES($1, $2, $3) RETURNING id', [TEST_USER, TEST_EMAIL, TEST_BUDGET])

        token = fastify.jwt.sign({id: user.rows[0].id})
    })

    describe ('testing /store/buy/', () => {

        test('test a valid item', async () => {

            const resp = await request(fastify.server)
            .post('/api/dash/store/buy/')
            .set('Authorization', `Bearer ${token}`)
            .send({
                item_id: 1,
                item_type: 1
            })

            expect(resp.statusCode).toBe(200)

        })

        test('test an invalid item', async () => {
            const resp = await request(fastify.server)
            .post('/api/dash/store/buy/')
            .set('Authorization', `Bearer ${token}`)
            .send({
                item_id: 1999,
                item_type: 1
            })

            expect(resp.statusCode).toBe(400)

        })

        test('test insifficient budget', async () => {
            const resp = await request(fastify.server)
            .post('/api/dash/store/buy/')
            .set('Authorization', `Bearer ${token}`)
            .send({
                item_id: 1,
                item_type: 2
            })

            expect(resp.statusCode).toBe(400)
        })
    })

    describe ('testing /buy/ + /inventory/', () => {

        test('valid budget', async () => {

            await request(fastify.server)
            .post('/api/dash/store/buy/')
            .set('Authorization', `Bearer ${token}`)
            .send({
                item_id: 1,
                item_type: 1
            })

            await request(fastify.server)
            .post('/api/dash/store/buy/')
            .set('Authorization', `Bearer ${token}`)
            .send({
                item_id: 1,
                item_type: 2
            })

            const resp = await request(fastify.server)
            .get('/api/dash/inventory/')
            .set('Authorization', `Bearer ${token}`)

            const budget = await pool.query('SELECT budget FROM player WHERE username = $1', [TEST_USER])

            expect(resp.statusCode).toBe(200)
            expect(resp.body).toMatchObject([{item_id: 1, item_type:1}])
            expect(budget.rows[0].budget).toBe(TEST_BUDGET - 100)
        })


        test('test insifficient budget', async () => {

            await request(fastify.server)
            .post('/api/dash/store/buy/')
            .set('Authorization', `Bearer ${token}`)
            .send({ item_id: 1, item_type: 2})


            await request(fastify.server)
            .post('/api/dash/store/buy/')
            .set('Authorization', `Bearer ${token}`)
            .send({ item_id: 1, item_type: 2})

            const resp = await request(fastify.server)
            .get('/api/dash/inventory/')
            .set('Authorization', `Bearer ${token}`)

            const budget = await pool.query('SELECT budget FROM player WHERE username = $1', [TEST_USER])

            expect(resp.statusCode).toBe(200)
            expect(resp.text).toContain('[]')
            expect(budget.rows[0].budget).toBe(TEST_BUDGET)
        })
    })
})



