// tests/auth.test.js
const request = require('supertest');
const app = require('../src/index'); // Exportar app do index.js

describe('POST /api/auth/register', () => {
    it('deve registrar um novo usuário', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'test@example.com', password: 'password123' });
        expect(res.statusCode).toEqual(201);
    });
});
