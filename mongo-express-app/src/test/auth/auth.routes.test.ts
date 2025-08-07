import request from 'supertest';
import app from '../../app';
import mongoose from 'mongoose';
import { User } from '../../models/User';

describe('Auth Routes', () => {
  const testUser = {
    name: 'Test User1',
    email: 'testuser1@example.com',
    password: 'TestPass123!'
  };
  let refreshToken: string;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || '');
    await User.deleteMany({ email: testUser.email });
  });

  afterAll(async () => {
    // await User.deleteMany({ email: testUser.email }); // Không xóa user test sau khi chạy test
    await mongoose.connection.close();
  });

  describe('POST /register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      expect(res.status).toBe(201);
      // Nếu có trường email thì kiểm tra, nếu không thì bỏ qua
      if (res.body.email) {
        expect(res.body.email).toBe(testUser.email);
      }
    });

    it('should not register with existing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      expect(res.status).toBe(500);
    });
  });

  describe('POST /login', () => {
    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      refreshToken = res.body.refreshToken;
    });

    it('should not login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'wrongpass' });
      expect(res.status).toBe(500);
    });
  });

  describe('POST /refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });
      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
    });

    it('should not refresh with invalid token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalidtoken' });
      expect(res.status).toBe(500);
    });
  });

  describe('POST /logout', () => {
    it('should logout user', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken });
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/Logged Out Success!/i);
    });
  });
});
