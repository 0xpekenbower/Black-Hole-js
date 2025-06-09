import appBuilder from '../app.js'
import request from 'supertest'
import pool from '../config/pooling.js';

const USER1 = 'buddha'
const EMAIL1 = 'buddha@hotmail.com'

const USER2 = 'buddha2'
const EMAIL2 = 'buddha2@hotmail.com'

const USER3 = 'buddha3'
const EMAIL3 = 'buddha3@hotmail.com'

describe ('Checking Profile features', () => {

    let fastify, token1, token2, token3, id1, id2, id3;

    beforeAll( async() => {
        fastify = await appBuilder()
        await fastify.ready()

        await pool.query('DELETE FROM friends;')
        await pool.query('DELETE FROM player;')

        const user1 = await pool.query('INSERT INTO player(username, email) \
            VALUES($1, $2) RETURNING id', [USER1, EMAIL1])

        const user2 = await pool.query('INSERT INTO player(username, email) \
            VALUES($1, $2) RETURNING id', [USER2, EMAIL2])

        const user3 = await pool.query('INSERT INTO player(username, email) \
            VALUES($1, $2) RETURNING id', [USER3, EMAIL3])

        id1 = user1.rows[0].id
        id2 = user2.rows[0].id
        id3 = user3.rows[0].id

        token1 = fastify.jwt.sign({id: id1})
        token2 = fastify.jwt.sign({id: id2})
        token3 = fastify.jwt.sign({id: id3})
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


    // fastify.get('/api/dash/get-card/', PC.profilesC)
    // fastify.get('/api/dash/search/', PC.searchC)
    // fastify.post('/api/dash/change-password/', PC.changePassC)
    // fastify.post('/api/dash/edit/', PC.editC)


    describe('Checking get-card', () => {

        test('user request card of his friend', async () => {
            await pool.query('INSERT INTO friends(sender, receiver, status) \
                VALUES($1, $2, $3);', [id2, id1, 1])

            const resp = await request(fastify.server)
            .get('/api/dash/get-card/')
            .set('Authorization', `Bearer ${token1}`)
            .query({ id: id2 })


            expect(resp.statusCode).toBe(200)
            expect(resp.body).toMatchObject({
                User: {
                    id: id2,
                    username: USER2
                },
                Level: {
                    id: 1,
                    reward: 100
                },
                Rank: {
                    name: 'Iron',
                    min_exp: 0,
                    max_exp: 999
                },
                Friends: [id1],
                is_self: false,
                Friendship: 2
              });
        })




        test('user request his card', async () => {
            await pool.query('INSERT INTO friends(sender, receiver, status) \
                VALUES($1, $2, $3);', [id2, id1, 1])

            const resp = await request(fastify.server)
            .get('/api/dash/get-card/')
            .set('Authorization', `Bearer ${token1}`)
            .query({ id: id1 })


            expect(resp.statusCode).toBe(200)
            expect(resp.body).toMatchObject({
                User: {
                    id: id1,
                    username: USER1
                },
                Level: {
                    id: 1,
                    reward: 100
                },
                Rank: {
                    name: 'Iron',
                    min_exp: 0,
                    max_exp: 999
                },
                Friends: [id2],
                is_self: true,
                Friendship: 0
              });
        })


        test('user request card of user who has friend', async () => {
            await pool.query('INSERT INTO friends(sender, receiver, status) \
                VALUES($1, $2, $3);', [id2, id1, 1])

            const resp = await request(fastify.server)
            .get('/api/dash/get-card/')
            .set('Authorization', `Bearer ${token3}`)
            .query({ id: id1 })


            expect(resp.statusCode).toBe(200)
            expect(resp.body).toMatchObject({
                User: {
                    id: id1,
                    username: USER1
                },
                Level: {
                    id: 1,
                    reward: 100
                },
                Rank: {
                    name: 'Iron',
                    min_exp: 0,
                    max_exp: 999
                },
                Friends: [id2],
                is_self: false,
                Friendship: 0
              });
        })


        test('get_card without id', async () => {

            const resp = await request(fastify.server)
            .get('/api/dash/get-card/')
            .set('Authorization', `Bearer ${token3}`)

            expect(resp.statusCode).toBe(200)
            expect(resp.body).toMatchObject({
                User: {
                    id: id3,
                    username: USER3
                },
                Level: {
                    id: 1,
                    reward: 100
                },
                Rank: {
                    name: 'Iron',
                    min_exp: 0,
                    max_exp: 999
                },
                is_self: true,
                Friendship: 0
              });


            expect(resp.statusCode).toBe(200)
        })



        test('invalid id', async () => {

            const resp = await request(fastify.server)
            .get('/api/dash/get-card/')
            .set('Authorization', `Bearer ${token3}`)
            .query({ id: 561 })

            expect(resp.statusCode).toBe(400)
        })

        test('without authorization', async () => {

            const resp = await request(fastify.server)
            .get('/api/dash/get-card/')

            expect(resp.statusCode).toBe(401)
        })
    })






    describe('Checking search', () => {

        test('valid users', async () => {

            const resp = await request(fastify.server)
            .get('/api/dash/search/')
            .set('Authorization', `Bearer ${token3}`)
            .query({ q: 'budd' })

            expect(resp.statusCode).toBe(200)
            expect(resp.body).toMatchObject([
                {id:id1, username:USER1},
                {id:id2, username:USER2},
                {id:id3, username:USER3}
            ])
        })

        test('valid users', async () => {

            const resp = await request(fastify.server)
            .get('/api/dash/search/')
            .set('Authorization', `Bearer ${token3}`)
            .query({ q: 'busdadas5dd' })

            expect(resp.statusCode).toBe(200)
            expect(resp.body).toMatchObject([])
        })

        test('no auth token', async () => {

            const resp = await request(fastify.server)
            .get('/api/dash/search/')
            .query({ q: 'busdadas5dd' })

            expect(resp.statusCode).toBe(401)
        })

    })



    describe('Checking change-password', () => {
        
    })


    describe('Checking edit', () => {


        test('update first_name', async () => {

            const resp = await request(fastify.server)
            .post('/api/dash/edit/')
            .set('Authorization', `Bearer ${token3}`)
            .send({
                first_name: "anyuser"
            })

            const check = await pool.query('SELECT first_name, last_name, bio, \
                background, avatar FROM player WHERE id = $1;', [id3])

            expect(resp.statusCode).toBe(200)
            expect(check.rows[0].first_name).toBe('anyuser')
        })

        test('change everything', async () => {

            const resp = await request(fastify.server)
            .post('/api/dash/edit/')
            .set('Authorization', `Bearer ${token3}`)
            .send({
                first_name: "anyuser",
                last_name: "last",
                bio: "biobiobio",
                avatar: "/ava/tar/by/buddha",
                background: "anyusbackgroundbackgroundbackgrounder",
            })

            const check = await pool.query('SELECT first_name, last_name, bio, \
                background, avatar FROM player WHERE id = $1;', [id3])

            expect(resp.statusCode).toBe(200)
            expect(check.rows[0].first_name).toBe('anyuser')
            expect(check.rows[0].last_name).toBe('last')
            expect(check.rows[0].bio).toBe('biobiobio')
            expect(check.rows[0].avatar).toBe('/ava/tar/by/buddha')
            expect(check.rows[0].background).toBe('anyusbackgroundbackgroundbackgrounder')
        })

        test('update first_name', async () => {

            const resp = await request(fastify.server)
            .post('/api/dash/edit/')
            .set('Authorization', `Bearer ${token3}`)

            expect(resp.statusCode).toBe(400)
        })
    })
})
