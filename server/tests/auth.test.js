const request = require('supertest');
const app = require('../src/index');
const { getAuth } = require('../src/config/firebase');

describe('Auth Routes', () => {
  describe('POST /api/auth/verify', () => {
    it('should verify a valid token', async () => {
      // Mock successful token verification
      getAuth().verifyIdToken.mockResolvedValue({
        uid: 'test-user-123',
        email: 'test@example.com',
        email_verified: true,
        name: 'Test User',
      });

      const mockToken = 'test-valid-token-000';
      const response = await request(app)
        .post('/api/auth/verify')
        .send({ idToken: mockToken })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.user).toHaveProperty('uid', 'test-user-123');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should reject invalid token', async () => {
      // Mock failed token verification
      getAuth().verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      const response = await request(app)
        .post('/api/auth/verify')
        .send({ idToken: 'invalid-token' })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'InvalidToken');
    });

    it('should reject missing token', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'ValidationError');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user info with valid authentication', async () => {
      // Mock token verification
      getAuth().verifyIdToken.mockResolvedValue({
        uid: 'test-user-123',
        email: 'test@example.com',
      });

      // Mock user info retrieval
      getAuth().getUser.mockResolvedValue({
        uid: 'test-user-123',
        email: 'test@example.com',
        emailVerified: true,
        displayName: 'Test User',
        metadata: {
          creationTime: '2024-01-01',
          lastSignInTime: '2024-01-02',
        },
      });

      const mockToken = 'test-valid-token-000';
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.user).toHaveProperty('uid', 'test-user-123');
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });
  });
});
