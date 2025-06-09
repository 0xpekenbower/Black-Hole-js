import appBuilder from '../app.js'
import request from 'supertest'
import pool from '../config/pooling.js';

const TEST_EMAIL = 'buddha123@hotmail.com'
const TEST_USERNAME = 'buddha'
const TEST_PASSWORD_HASH = '$2b$10$trWPY854fHa9lAb0Vcic3uQTzqHmZFp2O1XeK6B5IX56FZ5I6giNK' // buddha01@A
const TEST_OTP = 777777


describe('Forget pass feature', () => {

    let fastify

    beforeAll(async () => {
        fastify = await appBuilder()
        await fastify.ready()
    })

    afterAll(async () => {
        await fastify.close()

        await pool.query('DELETE FROM change_pass')
        await pool.query('DELETE FROM account')

        await pool.end()
    })


    describe ('Checking /api/auth/send-mail/', () => {

        beforeEach(async () => {
            await pool.query('DELETE FROM change_pass')
            await pool.query('DELETE FROM account')
            
            await pool.query(
                'INSERT INTO account(username, email, password) VALUES($1, $2, $3)',
                [TEST_USERNAME, TEST_EMAIL, TEST_PASSWORD_HASH]
            )
        })

        afterEach(async () => {
            await pool.query('DELETE FROM change_pass')
            await pool.query('DELETE FROM account')
        })


        test('valid email', async () =>{
            const resp = await request(fastify.server).post('/api/auth/send-mail/').send({
                email: TEST_EMAIL
            })

            const otp = await pool.query('SELECT EXISTS(SELECT 1 FROM change_pass \
                WHERE email = $1)', [TEST_EMAIL])

            expect(otp.rows[0].exists).toBe(true)
            expect(resp.statusCode).toBe(200)
        })

        test('empty email', async () =>{
            const resp = await request(fastify.server).post('/api/auth/send-mail/').send({
                email: ''
            })

            expect(resp.statusCode).toBe(400)
        })

        test('no email', async () =>{
            const resp = await request(fastify.server).post('/api/auth/send-mail/').send({})

            expect(resp.statusCode).toBe(400)
        })
    })


    describe ('Checking /api/auth/forget-pass/', () => {

        beforeEach(async () => {
            await pool.query('DELETE FROM change_pass')
            await pool.query('DELETE FROM account')
            
            await pool.query(
                'INSERT INTO account(username, email, password) VALUES($1, $2, $3)',
                [TEST_USERNAME, TEST_EMAIL, TEST_PASSWORD_HASH]
            )

            await pool.query(
                'INSERT INTO change_pass(email, otp_code) VALUES($1, $2)',
                [TEST_EMAIL, TEST_OTP]
            )
        })

        afterEach(async () => {
            await pool.query('DELETE FROM change_pass')
            await pool.query('DELETE FROM account')
        })


        test('valid otp-code', async() => {

            const resp = await request(fastify.server).post('/api/auth/forget-pass/').send({
                email: TEST_EMAIL,
                code: TEST_OTP,
                password: 'dsa44EKOO@@',
                repassword: 'dsa44EKOO@@'
            })
            
            expect(resp.statusCode).toBe(200)
        })

        test('passwords does not match', async() => {

            const resp = await request(fastify.server).post('/api/auth/forget-pass/').send({
                email: TEST_EMAIL,
                code: TEST_OTP,
                password: 'dsa44EKO6516O@@',
                repassword: 'dsa44EKOO@@'
            })
            
            expect(resp.statusCode).toBe(400)
        })

        test('invalid otp-code', async() => {

            const resp = await request(fastify.server).post('/api/auth/forget-pass/').send({
                email: TEST_EMAIL,
                code: 'dsadas',
                password: 'dsa44EKOO@@',
                repassword: 'dsa44EKOO@@'
            })
            
            expect(resp.statusCode).toBe(400)
        })
    })

})

