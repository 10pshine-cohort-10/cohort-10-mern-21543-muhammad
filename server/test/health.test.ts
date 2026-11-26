import { expect } from 'chai';
import { describe, it } from 'mocha';
import request from 'supertest';
import express from 'express';
import pino from 'pino';
import { Writable } from 'node:stream';
import { createApp, handleError } from '../src/app.js';

// Mocha handles rejected promises; contextual rethrows also satisfy the repo rule.
function scenario(name: string, run: () => Promise<void>): void {
  it(name, async (): Promise<void> => {
    try { await run(); }
    catch (error: unknown) { throw new Error(name, { cause: error }); }
  });
}
const app = createApp(pino({ level: 'silent' }));
describe('API foundation', (): void => {
  scenario('reports a healthy API', () => request(app).get('/api/health')
    .expect(200).expect({ status: 'ok', service: 'notes-api' }).then(() => {}));
  scenario('returns JSON for missing routes', () => request(app).get('/api/missing')
    .expect(404).expect({ error: 'Route not found' }).then(() => {}));
  scenario('rejects malformed JSON', () => request(app).post('/api/missing')
    .set('Content-Type', 'application/json').send('{')
    .expect(400).expect({ error: 'Invalid JSON body' }).then(() => {}));
  scenario('preserves status 413 for oversized JSON', () => request(app).post('/api/missing')
    .send({ text: 'x'.repeat(110000) }).expect(413)
    .expect({ error: 'Request body is too large' }).then(() => {}));
  scenario('preserves status 415 for unsupported charset', () => request(app).post('/api/missing')
    .set('Content-Type', 'application/json; charset=iso-8859-1').send('{}')
    .expect(415).expect({ error: 'Unsupported request charset' }).then(() => {}));
  scenario('does not include malformed request text in logs', () => {
    const logs: string[] = [];
    const stream = new Writable({ write(chunk, _encoding, done): void {
      logs.push(String(chunk)); done();
    } });
    const loggedApp = createApp(pino({}, stream));
    const secret = 'private-test-password-123';
    return request(loggedApp).post('/api/missing').set('Content-Type', 'application/json')
      .send(secret).expect(400).then((): void => {
        const output = logs.join('');
        expect(output).to.include('entity.parse.failed');
        expect(output).not.to.include(secret);
        expect(output).not.to.include('SyntaxError');
        expect(output).not.to.include('"stack"');
      });
  });
  scenario('keeps unexpected errors generic', () => {
    const failingApp = express();
    failingApp.get('/fail', (req, _res, next): void => {
      req.log = pino({ level: 'silent' });
      next(new Error('internal database details'));
    });
    failingApp.use(handleError);
    return request(failingApp).get('/fail').expect(500)
      .expect({ error: 'Something went wrong. Please try again.' }).then(() => {});
  });
});
