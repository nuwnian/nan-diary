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

describe('Projects Routes', () => {
  const mockToken = 'test-valid-token-000';
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    // Ensure getAuth and getFirestore are mock functions
    if (!jest.isMockFunction(firebase.getAuth)) {
      firebase.getAuth = jest.fn();
    }
    if (!jest.isMockFunction(firebase.getFirestore)) {
      firebase.getFirestore = jest.fn();
    }

    // Mock authentication
    const authMock = {
      verifyIdToken: jest.fn(),
      getUser: jest.fn(),
    };
    firebase.getAuth.mockReturnValue(authMock);
    authMock.verifyIdToken.mockResolvedValue({
      uid: mockUserId,
      email: 'test@example.com',
    });

    // Mock Firestore object chain: collection().doc().get/set
    const docMock = {
      get: jest.fn(),
      set: jest.fn(),
    };
    const collectionMock = jest.fn(() => ({ doc: jest.fn(() => docMock) }));
    const firestoreMock = {
      collection: collectionMock,
    };
    firebase.getFirestore.mockReturnValue(firestoreMock);
  });

  describe('GET /api/projects', () => {
    it('should return user projects', async () => {
      const mockProjects = [
        {
          title: 'Test Project',
          emoji: '🌸',
          date: '2024-01-01',
          notes: 'Test notes',
        },
      ];

      // Mock Firestore get
      const mockDocSnap = {
        exists: true,
        data: () => ({ projects: mockProjects }),
      };
  firebase.getFirestore().collection().doc().get.mockResolvedValue(mockDocSnap);

      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('projects');
      expect(response.body.projects).toHaveLength(1);
      expect(response.body).toHaveProperty('count', 1);
    });

    it('should return empty array for new user', async () => {
      // Mock Firestore get - no document
      const mockDocSnap = {
        exists: false,
      };
  firebase.getFirestore().collection().doc().get.mockResolvedValue(mockDocSnap);

      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.projects).toEqual([]);
      expect(response.body).toHaveProperty('count', 0);
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/projects')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/projects', () => {
    it('should save projects successfully', async () => {
      const projects = [
        {
          title: 'New Project',
          emoji: '🌸',
          date: '2024-01-01',
          notes: 'Test notes',
        },
      ];

      // Mock Firestore set
  firebase.getFirestore().collection().doc().set.mockResolvedValue();

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ projects })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('projects');
      expect(response.body.projects).toHaveLength(1);
    });

    it('should reject invalid project data', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          projects: [
            { title: '', emoji: '🌸' }, // Empty title
          ],
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/projects/add', () => {
    it('should add a new project', async () => {
      // Mock existing projects
      const mockDocSnap = {
        exists: true,
        data: () => ({ projects: [] }),
      };
  firebase.getFirestore().collection().doc().get.mockResolvedValue(mockDocSnap);
  firebase.getFirestore().collection().doc().set.mockResolvedValue();

      const response = await request(app)
        .post('/api/projects/add')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          title: 'New Project',
          emoji: '🌸',
          notes: 'Test notes',
        })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('project');
      expect(response.body.project).toHaveProperty('title', 'New Project');
    });
  });

  describe('DELETE /api/projects/:index', () => {
    it('should delete a project', async () => {
      // Mock existing projects
      const mockProjects = [
        { title: 'Project 1', emoji: '🌸', date: '2024-01-01', notes: '' },
        { title: 'Project 2', emoji: '🍂', date: '2024-01-02', notes: '' },
      ];
      const mockDocSnap = {
        exists: true,
        data: () => ({ projects: mockProjects }),
      };
  firebase.getFirestore().collection().doc().get.mockResolvedValue(mockDocSnap);
  firebase.getFirestore().collection().doc().set.mockResolvedValue();

      const response = await request(app)
        .delete('/api/projects/0')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 for invalid index', async () => {
      // Mock existing projects
      const mockDocSnap = {
        exists: true,
        data: () => ({ projects: [] }),
      };
  firebase.getFirestore().collection().doc().get.mockResolvedValue(mockDocSnap);

      const response = await request(app)
        .delete('/api/projects/0')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'NotFound');
    });
  });
});
