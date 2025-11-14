const request = require('supertest');

// Mock firebase config module before loading the app so middleware uses mocks
jest.mock('../src/config/firebase', () => ({
  getAuth: jest.fn(),
  getFirestore: jest.fn(),
  initializeFirebaseAdmin: jest.fn(),
  admin: {},
}));

const firebase = require('../src/config/firebase');
const app = require('../src/index');

beforeEach(() => {
  // Ensure getAuth is a jest mock function so we can control returned mock methods
  if (!jest.isMockFunction(firebase.getAuth)) {
    firebase.getAuth = jest.fn();
  }
  firebase.getAuth.mockReturnValue({
    verifyIdToken: jest.fn(),
    getUser: jest.fn(),
  });
});

describe('Auth Routes', () => {
  describe('POST /api/auth/verify', () => {
    it('should verify a valid token', async () => {
      // Mock successful token verification
      const auth = firebase.getAuth();
      auth.verifyIdToken.mockResolvedValue({
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
  const auth = firebase.getAuth();
  auth.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

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
      const auth = firebase.getAuth();
      auth.verifyIdToken.mockResolvedValue({
        uid: 'test-user-123',
        email: 'test@example.com',
      });

      // Mock user info retrieval
      const auth2 = firebase.getAuth();
      auth2.getUser.mockResolvedValue({
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
