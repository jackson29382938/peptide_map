const request = require('supertest');
const app = require('../server.js'); // Adjust path as needed

describe('Body Peptide Map API', () => {
  describe('GET /', () => {
    it('should return the main page', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /analytics', () => {
    it('should return the analytics dashboard', async () => {
      const res = await request(app).get('/analytics');
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/analytics/click', () => {
    it('should log a click event', async () => {
      const clickData = {
        elementId: 'test-element',
        elementType: 'button',
        elementText: 'Test Button',
        pageUrl: '/test-page',
        sessionId: 'test-session-123',
        userAgent: 'test-agent',
        screenWidth: 1920,
        screenHeight: 1080,
        clickX: 100,
        clickY: 200,
        flowLabel: 'test-flow'
      };

      const res = await request(app)
        .post('/api/analytics/click')
        .send(clickData);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/analytics/pageview', () => {
    it('should log a page view event', async () => {
      const pageViewData = {
        pageUrl: '/test-page',
        sessionId: 'test-session-123',
        userAgent: 'test-agent',
        referrer: 'https://example.com',
        flowLabel: 'test-flow'
      };

      const res = await request(app)
        .post('/api/analytics/pageview')
        .send(pageViewData);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/analytics/summary', () => {
    it('should return analytics summary', async () => {
      const res = await request(app).get('/api/analytics/summary');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalClicks');
      expect(res.body).toHaveProperty('totalPageViews');
      expect(res.body).toHaveProperty('totalSearches');
    });
  });
});