
const db = require('../db');

// POST /api/v1/streams/:id/playback
// Recebe um array de logs do player (batch)
exports.reportPlayback = async (req, res) => {
  const { id } = req.params; // Stream ID
  const logs = req.body; // Array de objetos

  if (!Array.isArray(logs) || logs.length === 0) {
    return res.json({ success: true, message: 'No logs to process' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    for (const log of logs) {
      await client.query(
        `INSERT INTO playback_logs 
         (stream_id, device_id, media_id, played_at, duration_ms, status, offline_sync)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          id,
          log.device_id,
          log.media_id || null,
          log.played_at, // ISO String
          log.duration_ms || 0,
          log.status || 'COMPLETED',
          log.offline_sync || false
        ]
      );
    }

    await client.query('COMMIT');
    res.json({ success: true, processed: logs.length });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Playback Log Error:', error);
    res.status(500).json({ error: 'Failed to process logs' });
  } finally {
    client.release();
  }
};
