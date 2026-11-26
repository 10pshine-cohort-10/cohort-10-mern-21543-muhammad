import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)), quiet: true });
try {
  const { app, logger } = await import('./app.js');
  const port = Number(process.env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer from 1 to 65535');
  const server = app.listen(port, () => { logger.info({ port }, 'Notes API started'); });
  server.on('error', (error) => { logger.fatal({ err: error }, 'Server failed'); process.exitCode = 1; });
  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => {
      logger.info({ signal }, 'Stopping server');
      const timeout = setTimeout(() => process.exit(1), 10000).unref();
      server.close(() => { clearTimeout(timeout); process.exit(0); });
    });
  }
} catch (error) {
  const { default: pino } = await import('pino');
  pino().fatal({ err: error }, 'Unable to start server');
  process.exitCode = 1;
}
