const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

// Mock MongoDB connection for testing
beforeAll(async () => {
  // Use a test database
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/urlshortener_test';
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  // Clean up test database
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe('URL Shortener API', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('POST /api/create', () => {
    it('should create a new short URL', async () => {
      const longUrl = 'https://www.example.com';
      const response = await request(app)
        .post('/api/create')
        .send({ longUrl })
        .expect(201);

      expect(response.body).toHaveProperty('shortUrl');
      expect(response.body).toHaveProperty('longUrl', longUrl);
      expect(response.body).toHaveProperty('qrCode');
      expect(response.body).toHaveProperty('clickCount', 0);
      expect(response.body.shortUrl).toHaveLength(8);
    });

    it('should return existing URL if already exists', async () => {
      const longUrl = 'https://www.example.com';
      
      // Create first URL
      const firstResponse = await request(app)
        .post('/api/create')
        .send({ longUrl })
        .expect(201);

      // Try to create same URL again
      const secondResponse = await request(app)
        .post('/api/create')
        .send({ longUrl })
        .expect(201);

      expect(firstResponse.body.shortUrl).toBe(secondResponse.body.shortUrl);
    });

    it('should reject invalid URLs', async () => {
      const response = await request(app)
        .post('/api/create')
        .send({ longUrl: 'not-a-valid-url' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid URL format');
    });

    it('should reject missing URL', async () => {
      const response = await request(app)
        .post('/api/create')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Long URL is required');
    });
  });

  describe('GET /:shortUrl', () => {
    let shortUrl;

    beforeEach(async () => {
      // Create a test URL
      const response = await request(app)
        .post('/api/create')
        .send({ longUrl: 'https://www.test-redirect.com' });
      
      shortUrl = response.body.shortUrl;
    });

    it('should redirect to original URL', async () => {
      const response = await request(app)
        .get(`/${shortUrl}`)
        .expect(302);

      expect(response.headers.location).toBe('https://www.test-redirect.com');
    });

    it('should return 404 for non-existent short URL', async () => {
      await request(app)
        .get('/nonexist')
        .expect(404);
    });

    it('should only accept 8-character alphanumeric short URLs', async () => {
      await request(app)
        .get('/invalid')
        .expect(404);
    });
  });

  describe('GET /api/analytics/:shortUrl', () => {
    let shortUrl;

    beforeEach(async () => {
      // Create a test URL
      const response = await request(app)
        .post('/api/create')
        .send({ longUrl: 'https://www.test-analytics.com' });
      
      shortUrl = response.body.shortUrl;
    });

    it('should return analytics for existing short URL', async () => {
      const response = await request(app)
        .get(`/api/analytics/${shortUrl}`)
        .expect(200);

      expect(response.body).toHaveProperty('shortUrl', shortUrl);
      expect(response.body).toHaveProperty('longUrl', 'https://www.test-analytics.com');
      expect(response.body).toHaveProperty('totalClicks');
      expect(response.body).toHaveProperty('avgRedirectTime');
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should return 404 for non-existent short URL', async () => {
      await request(app)
        .get('/api/analytics/nonexist')
        .expect(404);
    });
  });

  describe('GET /api/stats', () => {
    it('should return overall statistics', async () => {
      const response = await request(app)
        .get('/api/stats')
        .expect(200);

      expect(response.body).toHaveProperty('totalUrls');
      expect(response.body).toHaveProperty('totalClicks');
      expect(response.body).toHaveProperty('cacheSize');
    });
  });

  describe('GET /api/urls', () => {
    it('should return list of URLs', async () => {
      const response = await request(app)
        .get('/api/urls')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
