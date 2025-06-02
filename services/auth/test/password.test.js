import appBuilder from '../app.js'
import request from 'supertest'
import pool from '../config/pooling.js';

describe ('Checking /api/auth/change-password/', () => {

    let fastify, token;

    beforeAll(async() => {
        fastify = await appBuilder()
        await fastify.ready()

        await pool.query('INSERT INTO account(username, email, password) \
            VALUES($1, $2, $3)', ['buddha', 'buddha@hotmail.com', '$2b$10$trWPY854fHa9lAb0Vcic3uQTzqHmZFp2O1XeK6B5IX56FZ5I6giNK'])
        //pass -> buddha01@A

        const login_res = await request(fastify.server).post('/api/auth/login/').send({
            username: 'buddha',
            password: 'buddha01@A'
        })
        token = login_res.body.token
    })

    afterAll( async() => {
        await fastify.close()
        await pool.query('DELETE FROM account;')
        await pool.end()
    })

    test('valid change-password', async() => {
        const resp = await request(fastify.server).post('/api/auth/change-password/')
        .set('Authorization', `Bearer ${token}`).send({
            old_pass: 'buddha01@A',
            new_pass: 'buddha01@A2'
        })
        expect(resp.statusCode).toBe(200)
    })

    test('reject wrong current password', async () => {
        const res = await request(fastify.server)
          .post('/api/auth/change-password/')
          .set('Authorization', `Bearer ${token}`)
          .send({ old_pass: 'WRONGPASS', new_pass: 'irrelevant01@A' });
    
        expect(res.statusCode).toBe(400);
        // expect(res.body.message).toMatch(/old.*password/i);
      });

      test('reject weak new password', async () => {
        const res = await request(fastify.server)
          .post('/api/auth/change-password/')
          .set('Authorization', `Bearer ${token}`)
          .send({ old_pass: 'buddha01@A', new_pass: 'short' });
    
        expect(res.statusCode).toBe(400);
      });

      test('new password same as old password', async () => {
        const res = await request(fastify.server)
          .post('/api/auth/change-password/')
          .set('Authorization', `Bearer ${token}`)
          .send({ old_pass: 'buddha01@A', new_pass: 'buddha01@A' });
    
        expect(res.statusCode).toBe(400);
      });


      test('reject when required fields are missing', async () => {
        const res = await request(fastify.server)
          .post('/api/auth/change-password/')
          .set('Authorization', `Bearer ${token}`)
          .send({ });         
    
        expect(res.statusCode).toBe(400);
      });


      test('reject with missing Authorization header', async () => {
        const res = await request(fastify.server)
          .post('/api/auth/change-password/')
          .send({ old_pass: 'buddha01@A', new_pass: 'buddha01@A2' });
    
        expect(res.statusCode).toBe(401);          
      });

      test('reject with malformed / expired token', async () => {
        const res = await request(fastify.server)
          .post('/api/auth/change-password/')
          .set('Authorization', 'Bearer NOT.A.VALID.TOKEN')
          .send({ old_pass: 'buddha01@A', new_pass: 'buddha01@A2' });
    
        expect(res.statusCode).toBe(401);
      });
})