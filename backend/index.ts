import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import { db } from './db';
import { streams } from './routes/streams';
import { auth } from './routes/auth';
import { webhooks } from './routes/webhooks';

const app = new Hono();

// Middleware de Segurança e CORS Global
app.use('*', cors({
  origin: ['https://lomuz.com', 'https://www.lomuz.com', 'http://localhost:5173'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Lomuz-Secret'],
  exposeHeaders: ['Content-Length', 'X-Cache-Status'],
  maxAge: 600,
}));

// Headers de Cache Estratégico para CDN (Cloudflare)
app.use('/api/v1/streams/*/status', async (c, next) => {
  await next();
  // Status de rádio muda rápido, cache curto na borda (1s)
  c.header('Cache-Control', 'public, s-maxage=1, stale-while-revalidate=5');
});

// Rotas
app.route('/api/auth', auth);
app.route('/api/webhooks', webhooks);

// Proteção JWT para API de Gestão
app.use('/api/v1/*', async (c, next) => {
  const secret = process.env.JWT_SECRET || 'lomuz-global-secret';
  const jwtMiddleware = jwt({ secret });
  return jwtMiddleware(c, next);
});

app.route('/api/v1/streams', streams);

app.get('/health', (c) => c.json({ status: 'healthy', region: process.env.REGION || 'global' }));

export default {
  port: 3001,
  fetch: app.fetch,
};