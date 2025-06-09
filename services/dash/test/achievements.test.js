import appBuilder from '../app.js'
import request from 'supertest'
import pool from '../config/pooling.js';

const TEST_USER = 'buddha'
const TEST_EMAIL = 'buddha@hotmail.com'

describe ('Checking achievements feature', () => {

    let fastify, token, user_id;

    beforeAll( async() => {
        fastify = await appBuilder()
        await fastify.ready()

        await pool.query('DELETE FROM user_achiev;')
        await pool.query('DELETE FROM player;')

        const user = await pool.query('INSERT INTO player(username, email) \
            VALUES($1, $2) RETURNING id', [TEST_USER, TEST_EMAIL])
        
        user_id = user.rows[0].id

        token = fastify.jwt.sign({id: user_id})
    })

    afterAll( async() => {
        await pool.query('DELETE FROM user_achiev;')
        await pool.query('DELETE FROM player;')

        await fastify.close()
        await pool.end()
    })

    afterEach(async() => {
        await pool.query('DELETE FROM user_achiev;')
    })

    // describe ('testing /add-achievements/', () => {
    //     test('Add a valid achievement', async () => {

    //         const res = await request(fastify.server).post('/api/dash/add-achievements/')
    //         .set('Authorization', `Bearer ${token}`)
    //         .send({
    //             achievID: 2,
    //             parts:1
    //         })

    //         expect(res.statusCode).toBe(200)
    //     })

    //     test('Add a valid achievement with part != 1', async () => {

    //         const res = await request(fastify.server).post('/api/dash/add-achievements/')
    //         .set('Authorization', `Bearer ${token}`)
    //         .send({
    //             achievID: 6,
    //             parts: 3
    //         })

    //         expect(res.statusCode).toBe(200)
    //     })


    //     test('Add an invalid achievement_id', async () => {

    //         const res = await request(fastify.server).post('/api/dash/add-achievements/')
    //         .set('Authorization', `Bearer ${token}`)
    //         .send({
    //             achievID: 2215,
    //             parts:1
    //         })

    //         expect(res.statusCode).toBe(400)
    //     })



    //     test('Add a negative achievement_part', async () => {

    //         const res = await request(fastify.server).post('/api/dash/add-achievements/')
    //         .set('Authorization', `Bearer ${token}`)
    //         .send({
    //             achievID: 2,
    //             parts: -1
    //         })

    //         expect(res.statusCode).toBe(400)
    //     })

    //     test('Add an invalid achievement_part', async () => {

    //         const res = await request(fastify.server).post('/api/dash/add-achievements/')
    //         .set('Authorization', `Bearer ${token}`)
    //         .send({
    //             achievID: 4,
    //             parts: 5
    //         })

    //         expect(res.statusCode).toBe(400)
    //     })


    //     test('duplicate achievement', async () => {

    //         await request(fastify.server).post('/api/dash/add-achievements/')
    //         .set('Authorization', `Bearer ${token}`)
    //         .send({
    //             achievID: 12,
    //             parts:1
    //         })

    //         const res = await request(fastify.server).post('/api/dash/add-achievements/')
    //         .set('Authorization', `Bearer ${token}`)
    //         .send({
    //             achievID: 12,
    //             parts:1
    //         })

    //         expect(res.statusCode).toBe(400)
    //     })
    // })

    // describe ('testing /update-achievements/', () => {

    // })


    describe ('testing /my-achievements/', () => {
        
        test('a valid user_achievements', async () => {

            await pool.query('INSERT INTO user_achiev(user_id, achievement_id, parts) \
                VALUES($1, $2, $3)', [user_id, 2, 1])

            const resp = await request(fastify.server)
            .get('/api/dash/my-achievements/')
            .set('Authorization', `Bearer ${token}`)
            

            expect(resp.statusCode).toBe(200)
            expect(resp.text).toContain('FriendlyCircleI')
        })


        test('a valid user_achievements, empty achievements', async () => {

            const resp = await request(fastify.server)
            .get('/api/dash/my-achievements/')
            .set('Authorization', `Bearer ${token}`)
            

            expect(resp.statusCode).toBe(200)
            expect(resp.text).toContain('[]')
        })


        test('achievements without authorizations', async () => {

            const resp = await request(fastify.server)
            .get('/api/dash/my-achievements/')
            

            expect(resp.statusCode).toBe(401)
        })

    })
})