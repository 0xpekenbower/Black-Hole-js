import appBuilder from '../app.js'
import request from 'supertest'
import pool from '../config/pooling.js';

const tmp_email = 'buddha123@hotmail.com'




describe ('Checking /api/auth/send-mail/', () => {
    let fastify;

    beforeAll(async() => {
        fastify = await appBuilder()
        await fastify.ready()
    
        await pool.query('DELETE FROM change_pass;')
        await pool.query('DELETE FROM account;')
    
        await pool.query('INSERT INTO account(username, email, password) \
            VALUES($1, $2, $3)', ['buddha', tmp_email, '$2b$10$trWPY854fHa9lAb0Vcic3uQTzqHmZFp2O1XeK6B5IX56FZ5I6giNK'])
        //pass -> buddha01@A
    })
    
    afterAll( async() => {
        await fastify.close()
    
        await pool.query('DELETE FROM change_pass;')
        await pool.query('DELETE FROM account;')
        
        await pool.end()
    })





    test('valid email', async () =>{
        const resp = await request(fastify.server).post('/api/auth/send-mail/').send({
            email: tmp_email
        })

        const otp = await pool.query('SELECT EXISTS(SELECT 1 FROM change_pass \
            WHERE email = $1)', [tmp_email])

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


// describe ('Checking /api/auth/forget-pass/', () => {

//     beforeAll(async() => {
//         await pool.query('DELETE FROM change_pass')

//         await pool.query('INSERT INTO account(username, email, password) \
//             VALUES($1, $2, $3)', ['buddha', tmp_email, '$2b$10$trWPY854fHa9lAb0Vcic3uQTzqHmZFp2O1XeK6B5IX56FZ5I6giNK'])

//         await pool.query('INSERT INTO change_pass(email, otp_code)  \
//             VALUES($1, $2);', [tmp_email, 777777])
//     })


//     test('valid otp-code', async() => {

//         const resp = await request(fastify.server).post('/api/auth/forget-pass/').send({
//             email: tmp_email,
//             code: 777777,
//             password: 'dsa44EKOO@@',
//             repassword: 'dsa44EKOO@@'
//         })
        
//         expect(resp.statusCode).toBe(200)
//     })

//     test('invalid otp-code', async() => {

//         const resp = await request(fastify.server).post('/api/auth/forget-pass/').send({
//             email: tmp_email,
//             code: 'dsadas',
//             password: 'dsa44EKOO@@',
//             repassword: 'dsa44EKOO@@'
//         })
        
//         expect(resp.statusCode).toBe(400)
//     })
// })