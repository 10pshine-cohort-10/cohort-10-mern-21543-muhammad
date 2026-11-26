import express, { type ErrorRequestHandler } from 'express';
import pino, { type Logger } from 'pino';
import { pinoHttp } from 'pino-http';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  redact: ['err.body', 'req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
});

const parserErrors: Readonly<Record<string, { status: number; message: string }>> = {
  'entity.parse.failed': { status: 400, message: 'Invalid JSON body' },
  'entity.too.large': { status: 413, message: 'Request body is too large' },
  'charset.unsupported': { status: 415, message: 'Unsupported request charset' },
  'encoding.unsupported': { status: 415, message: 'Unsupported content encoding' },
  'request.aborted': { status: 400, message: 'Request was aborted' },
  'request.size.invalid': { status: 400, message: 'Invalid request size' },
};

export const handleError: ErrorRequestHandler = (error: unknown, req, res, next): void => {
  if (res.headersSent) {
    next(error);
    return;
  }
  if (error instanceof Error && 'type' in error && typeof error.type === 'string'
      && Object.hasOwn(parserErrors, error.type)) {
    const response = parserErrors[error.type];
    // Parser messages and stacks can contain request text. Log only safe metadata.
    req.log.warn({ status: response.status, errorType: error.type }, 'Request rejected');
    res.status(response.status).json({ error: response.message });
    return;
  }
  req.log.error({ err: error }, 'Request failed');
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
};

export function createApp(appLogger: Logger = logger): express.Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(pinoHttp({ logger: appLogger }));
  app.use(express.json({ limit: '100kb' }));
  app.get('/api/health', (_req, res): void => {
    res.json({ status: 'ok', service: 'notes-api' });
  });
  app.use((_req, res): void => { res.status(404).json({ error: 'Route not found' }); });
  app.use(handleError);
  return app;
}

export const app = createApp();
