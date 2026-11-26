import { expect } from 'chai';
import request from 'supertest';
import { app } from '../dist/app.js';
describe('API foundation', () => {
  it('reports a healthy API', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({ status: 'ok', service: 'notes-api' });
  });
  it('returns a JSON response for missing routes', async () => {
    const response = await request(app).get('/api/missing');
    expect(response.status).to.equal(404);
    expect(response.body.error).to.equal('Route not found');
  });
  it('rejects malformed JSON without exposing internals', async () => {
    const response = await request(app).post('/api/missing').set('Content-Type', 'application/json').send('{');
    expect(response.status).to.equal(400);
    expect(response.body).to.deep.equal({ error: 'Invalid JSON body' });
  });
});
