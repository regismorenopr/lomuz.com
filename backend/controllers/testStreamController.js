
const db = require('../db');

// POST /api/v1/test-streams
exports.createTestStream = async (req, res) => {
  const { name, test_audio_url } = req.body;

  if (!name || !test_audio_url) {
    return res.status(400).json({ error: 'Name and audio URL are required' });
  }

  try {
    const result = await db.query(
      `INSERT INTO test_streams (name, test_audio_url, active)
       VALUES ($1, $2, true)
       RETURNING id, name, test_audio_url, created_at`,
      [name, test_audio_url]
    );

    // Audit Event para rastreio
    await db.query(
        "INSERT INTO audit_events (stream_id, event_type, payload) VALUES ($1, 'TEST_STREAM_CREATED', $2)",
        [result.rows[0].id, { url: test_audio_url }]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create Test Stream Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/v1/test-streams
exports.listTestStreams = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM test_streams ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/v1/test-streams/:id/manifest
exports.getTestManifest = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('SELECT * FROM test_streams WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test Stream not found' });
    }

    const stream = result.rows[0];

    // Gera um manifesto compatível com o PlayerEngine, mas simplificado para loop
    // Cria 5 itens na fila repetindo o mesmo áudio para simular continuidade
    const queue = Array.from({ length: 5 }).map((_, i) => ({
        type: 'MUSIC',
        media_file_id: `test-media-${i}`,
        title: `[TEST] ${stream.name} - Loop ${i + 1}`,
        duration_seconds: 180, // Fake duration
        force_play: false
    }));

    const manifest = {
        is_test_stream: true, // FLAG CRÍTICA PARA O PLAYER
        stream_id: stream.id,
        stream_name: `[BETA] ${stream.name}`,
        manifest_version: Date.now(),
        generated_at: new Date().toISOString(),
        valid_for_seconds: 3600,
        config: {
            crossfade: 0, 
            volume_normalization: false
        },
        files: [
            {
                id: `test-media-0`,
                url: stream.test_audio_url,
                hash: 'test-hash-md5',
                version: 1,
                size: 1024000
            },
            {
                id: `test-media-1`,
                url: stream.test_audio_url,
                hash: 'test-hash-md5',
                version: 1,
                size: 1024000
            },
            {
                id: `test-media-2`,
                url: stream.test_audio_url,
                hash: 'test-hash-md5',
                version: 1,
                size: 1024000
            },
            {
                id: `test-media-3`,
                url: stream.test_audio_url,
                hash: 'test-hash-md5',
                version: 1,
                size: 1024000
            },
            {
                id: `test-media-4`,
                url: stream.test_audio_url,
                hash: 'test-hash-md5',
                version: 1,
                size: 1024000
            }
        ],
        queue: queue
    };

    res.json(manifest);

  } catch (error) {
    console.error('Manifest Test Error:', error);
    res.status(500).json({ error: 'Failed to generate test manifest' });
  }
};
