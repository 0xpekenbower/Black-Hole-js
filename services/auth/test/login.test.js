import appBuilder from '../app.js'
import request from 'supertest'
import pool from '../config/pooling.js';

describe ('Checking /api/auth/login/', () => {

    //TODO add in db a user with is_oauth and try login with it
    let fastify;

    beforeAll(async() => {

        await pool.query('INSERT INTO account(username, email, password) \
            VALUES($1, $2, $3)', ['buddha', 'buddha@hotmail.com', '$2b$10$trWPY854fHa9lAb0Vcic3uQTzqHmZFp2O1XeK6B5IX56FZ5I6giNK'])
        //pass -> buddha01@A
        fastify = await appBuilder()
        await fastify.ready()
    })

    afterAll( async() => {
        await fastify.close()
        
        await pool.query('DELETE FROM account;')
        await pool.end()
    })

    test("no username", async () => {
        const resp = await request(fastify.server).post("/api/auth/login/").send({
            password: 'dadsa'
        })

        expect(resp.statusCode).toBe(400)
    })

    test("no password", async () => {
        const resp = await request(fastify.server).post("/api/auth/login/").send({
            username: 'buddha'
        })

        expect(resp.statusCode).toBe(400)
    })

    test("no body", async () => {
        const resp = await request(fastify.server).post("/api/auth/login/").send({
        })

        expect(resp.statusCode).toBe(400)
    })


    test("valid user", async () => {
        const resp = await request(fastify.server).post("/api/auth/login/").send({
            username: "buddha",
            password: "buddha01@A"
        })

        expect(resp.statusCode).toBe(200)
    })


    test("valid user", async () => {
        const resp = await request(fastify.server).post("/api/auth/login/").send({
            username: 12356,
            password: "buddha01@A"
        })

        expect(resp.statusCode).toBe(400)
    })
    

    test('valid user returns 200 and a token', async () => {
        const resp = await request(fastify.server).post('/api/auth/login/').send({
            username: 'buddha',
            password: 'buddha01@A',
        });

        expect(resp.statusCode).toBe(200);
        expect(resp.body).toHaveProperty('token');
        expect(typeof resp.body.token).toBe('string');
    });


    test("SQL injection in username", async () => {
        const resp = await request(fastify.server).post("/api/auth/login/").send({
            username: "admin' OR '1'='1",
            password: "password"
        })

        expect(resp.statusCode).toBe(400)
    })



    test("SQL injection in password", async () => {
        const resp = await request(fastify.server).post("/api/auth/login/").send({
            username: "root6119",
            password: "' OR '1'='1"
        })

        expect(resp.statusCode).toBe(400)
    })



    test("null", async () => {
        const resp = await request(fastify.server).post("/api/auth/login/").send({
            username: null,
            password: null
        })

        expect(resp.statusCode).toBe(400)
    })

    test("extremely long username", async () => {
        const resp = await request(fastify.server).post("/api/auth/login/").send({
            username: "a".repeat(1000),
            password: "password"
        })

        expect(resp.statusCode).toBe(400)
    })

    test("extremely long password", async () => {
        const resp = await request(fastify.server).post("/api/auth/login/").send({
            username: "root6119",
            password: "a".repeat(1000)
        })

        expect(resp.statusCode).toBe(400)
    })

    test("whitespace only username", async () => {
        const resp = await request(fastify.server).post("/api/auth/login/").send({
            username: "   ",
            password: "password"
        })

        expect(resp.statusCode).toBe(400)
    })

})