import { Hono } from 'hono';
import { db } from '../db';
import { nanoid } from 'nanoid';

export const streams = new Hono();

// Buscar streaming (usado pelo player)
// GET /api/v1/streams/:id
streams.get('/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    const { rows } = await db.query(
      'SELECT id, status, stream_name as name FROM streams WHERE id = $1',
      [id]
    );

    if (rows.length === 0) return c.json({ error: 'Streaming não encontrado' }, 404);
    
    const stream = rows[0];

    return c.json({
      id: stream.id,
      status: stream.status.toLowerCase(), // ready | online | offline
      hls_url: `https://stream.lomuz.com/hls/${stream.id}.m3u8`,
      name: stream.name
    });
  } catch (e) {
    return c.json({ error: 'Erro interno ao buscar streaming' }, 500);
  }
});

// Criar streaming (inicializa como DRAFT)
// POST /api/v1/streams
streams.post('/', async (c) => {
  try {
    const payload = c.get('jwtPayload') || { orgId: 'demo-org' };
    const { name, segment } = await c.req.json();

    const streamId = nanoid(6).toLowerCase();
    const streamKey = `lomuz_${nanoid(8)}`;

    await db.query(
      `INSERT INTO streams (id, stream_name, company_id, stream_key, segment, status, kbps)
       VALUES ($1, $2, $3, $4, $5, 'DRAFT', 128)
       RETURNING id`,
      [streamId, name, payload.orgId, streamKey, segment]
    );

    return c.json({ id: streamId });
  } catch (e: any) {
    return c.json({ error: 'Erro ao criar streaming' }, 500);
  }
});

// Lançar Streaming
// POST /api/v1/streams/:id/launch
streams.post('/:id/launch', async (c) => {
  const id = c.req.param('id');
  // Em um sistema real, aqui verificaríamos a propriedade via jwtPayload.orgId
  
  try {
    const { rows } = await db.query(
      "UPDATE streams SET status = 'READY' WHERE id = $1 RETURNING id, stream_key",
      [id]
    );

    if (rows.length === 0) return c.json({ error: 'Streaming não encontrado' }, 404);

    return c.json({
      playerUrl: `https://lomuz.com/player/${id}`,
      rtmp_url: "rtmp://stream.lomuz.com/live",
      stream_key: rows[0].stream_key
    });
  } catch (e) {
    return c.json({ error: 'Erro ao lançar streaming' }, 500);
  }
});

// Atualização Interna: ONLINE (chamado pelo streaming server/webhook)
streams.post('/:id/online', async (c) => {
  const id = c.req.param('id');
  await db.query("UPDATE streams SET status = 'ONLINE' WHERE id = $1", [id]);
  return c.json({ success: true });
});

// Atualização Interna: OFFLINE (chamado pelo streaming server/webhook)
streams.post('/:id/offline', async (c) => {
  const id = c.req.param('id');
  await db.query("UPDATE streams SET status = 'OFFLINE' WHERE id = $1", [id]);
  return c.json({ success: true });
});

// Status em tempo real (dashboard)
streams.get('/:slug/status', async (c) => {
  const slug = c.req.param('slug');
  const { rows } = await db.query('SELECT status, stream_name, kbps FROM streams WHERE id = $1', [slug]);
  if (rows.length === 0) return c.json({ error: 'Not Found' }, 404);
  return c.json({ name: rows[0].stream_name, status: rows[0].status, online: rows[0].status === 'ONLINE' });
});
