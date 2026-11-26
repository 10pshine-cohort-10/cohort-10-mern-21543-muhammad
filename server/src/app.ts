import express, { type ErrorRequestHandler } from 'express';
import pino from 'pino';
import { pinoHttp } from 'pino-http';

export const logger = pino({ level: process.env.LOG_LEVEL ?? 'info', redact: ['err.body', 'req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'] });
export const app = express();
app.disable('x-powered-by');
app.use(pinoHttp({ logger }));
app.use(express.json({ limit: '100kb' }));
app.get('/api/health', (_req, res) => { res.json({ status: 'ok', service: 'notes-api' }); });
app.use((_req, res) => { res.status(404).json({ error: 'Route not found' }); });
const handleError: ErrorRequestHandler = (error: unknown, req, res, _next) => {
  req.log.error({ err: error }, 'Request failed');
  if (error instanceof SyntaxError && 'status' in error && error.status === 400) {
    res.status(400).json({ error: 'Invalid JSON body' });
    return;
  }
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
};
app.use(handleError);
