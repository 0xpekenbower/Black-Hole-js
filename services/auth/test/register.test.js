import appBuilder from '../app.js'
import request from 'supertest'
import pool from '../config/pooling.js';

describe ('Checking /api/auth/register/', () => {

    let fastify;

    beforeAll(async() => {
        fastify = await appBuilder()
        await fastify.ready()
    })

    afterAll( async() => {
        await fastify.close()
        await pool.query('DELETE FROM account;')
        await pool.end()
    })

    test("valid registration", async () => {
        const resp = await request(fastify.server).post('/api/auth/register/').send({
            email: "anything@anything.com",
            username: "user1651",
            password: "buddha01@A",
            repassword: 'buddha01@A',
            first_name: "my name",
            last_name: "das",
        })
        expect(resp.statusCode).toBe(201)
    })

    test("extremely large payload", async () => {
        const resp = await request(fastify.server).post('/api/auth/register/').send({
            email: "test@example.com",
            username: "testuser",
            password: "ValidPass123!",
            repassword: "ValidPass123!",
            first_name: "A".repeat(10000),
            last_name: "B".repeat(10000)
        });
        expect(resp.statusCode).toBe(400)

    });


    test("diff passwords", async () => {
        const resp = await request(fastify.server).post('/api/auth/register/').send({
            email: "test@example.com",
            username: "testuser",
            password: "ValidPass123!",
            repassword: "ValidPass12s3!",
            first_name: "A".repeat(10000),
            last_name: "B".repeat(10000)
        });
        expect(resp.statusCode).toBe(400)

    });

    test("no repassword", async () => {
        const resp = await request(fastify.server).post('/api/auth/register/').send({
            email: "test@example.com",
            username: "testuser",
            password: "ValidPass123!",
            first_name: "A".repeat(10000),
            last_name: "B".repeat(10000)
        });
        expect(resp.statusCode).toBe(400)

    });

    test("no firstname", async () => {
        const resp = await request(fastify.server).post('/api/auth/register/').send({
            email: "test@example.com",
            username: "testuser",
            password: "ValidPass123!",
            repassword: "ValidPass12s3!",
            last_name: "B".repeat(10000)
        });
        expect(resp.statusCode).toBe(400)

    });

    test("wrong content type", async () => {
        const resp = await request(fastify.server)
            .post('/api/auth/register/')
            .set('Content-Type', 'text/plain')
            .send(JSON.stringify({
                email: "test12@example.com",
                username: "test12user",
                password: "ValidPass123!",
                repassword: "ValidPass123!",
                first_name: "John",
                last_name: "Doe"
            }));
            expect(resp.statusCode).toBe(400)

    });

    test("special characters in names", async () => {
        const resp = await request(fastify.server).post('/api/auth/register/').send({
            email: "test@example.com",
            username: "testuser",
            password: "ValidPass123!",
            repassword: "ValidPass123!",
            first_name: "John<script>",
            last_name: "Doe'); DROP TABLE users;--"
        });
        expect(resp.statusCode).toBe(400)

    });


    test("empty string values", async () => {
        const resp = await request(fastify.server).post('/api/auth/register/').send({
            email: "",
            username: "",
            password: "",
            repassword: "",
            first_name: "",
            last_name: ""
        });
        expect(resp.statusCode).toBe(400)
    });


    test("unicode characters counting", async () => {
        const resp = await request(fastify.server).post('/api/auth/register/').send({
            username: "👨‍👩‍👧‍👦",
            email: "👨‍👩‍👧‍👦@hotmail.com",
            password: "🔐🔐🔐🔐🔐🔐🔐🔐1a@A",
            repassword: "🔐🔐🔐🔐🔐🔐🔐🔐1a@A",
            first_name: "José".repeat(3), 
            last_name: "北京市海"
        });

        expect(resp.statusCode).toBe(201)
    });


    test("missing optional fields", async () => {
        const resp = await request(fastify.server).post('/api/auth/register/').send({
            username: `user44`,
            email: `test44@example.com`,
            password: "ValidPass1!",
            repassword: "ValidPass1!"
        });
        expect(resp.statusCode).toBe(201);
    });

})