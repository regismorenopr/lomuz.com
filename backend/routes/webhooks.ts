import { Hono } from 'hono';
import { db } from '../db';

export const webhooks = new Hono();

/**
 * Hook de Autenticação para MediaMTX
 * Chamado quando um encoder tenta publicar (on_publish)
 */
webhooks.post('/mtx/auth', async (c) => {
  // O MediaMTX envia o path via POST body (conforme configurado no yml)
  const body = await c.req.parseBody();
  const streamKey = body.path as string; 

  if (!streamKey) {
    return c.text('Forbidden', 403);
  }

  try {
    // Query SQL: Verifica a existência da chave e o status da rádio pai
    const query = `
      SELECT s.id, r.name 
      FROM streams s
      JOIN radios r ON s.radio_id = r.id
      WHERE s.stream_key = $1 
      AND r.is_active = true
      LIMIT 1
    `;

    const { rows } = await db.query(query, [streamKey]);

    if (rows.length > 0) {
      // Opcional: Log de sucesso no audit_events ou atualização de status para ONLINE
      await db.query("UPDATE streams SET status = 'ONLINE' WHERE stream_key = $1", [streamKey]);
      
      console.log(`[AUTH] Transmissão autorizada: ${rows[0].name}`);
      return c.text('OK', 200);
    }

    console.warn(`[AUTH] Tentativa de transmissão não autorizada com a chave: ${streamKey}`);
    return c.text('Unauthorized', 403);

  } catch (error) {
    console.error('[AUTH ERROR]', error);
    return c.text('Internal Server Error', 500);
  }
});

/**
 * Hook de encerramento (on_unpublish)
 */
webhooks.post('/mtx/offline', async (c) => {
  const body = await c.req.parseBody();
  const streamKey = body.path as string;

  if (streamKey) {
    await db.query("UPDATE streams SET status = 'OFFLINE' WHERE stream_key = $1", [streamKey]);
  }
  
  return c.text('OK', 200);
});