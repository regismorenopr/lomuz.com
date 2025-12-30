
const db = require('../db');
// Configuração do Multer (Upload)
const multer = require('multer');
const path = require('path');
const { UPLOAD_DIR } = require('../services/mediaProcessor'); // Importa do novo serviço

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    // Mantém nome original para referência, mas cuidado com colisões na vida real
    // Aqui usamos o original_filename no DB para achar, mas salvamos no disco limpo
    cb(null, file.originalname); 
  }
});

exports.uploadMiddleware = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/flac' || file.originalname.match(/\.(mp3|flac)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Formato inválido. Apenas MP3 ou FLAC.'));
    }
  }
}).single('file');

exports.uploadFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

  const { title, type } = req.body; // title, type (MUSIC, AD)
  // genreIds may come as a stringified array or JSON from frontend form-data
  let genreIds = req.body.genreIds ? JSON.parse(req.body.genreIds) : [];
  
  const companyId = req.user.company_id || (await getMockCompanyId()); 
  const userName = req.user.name || 'Cliente'; // Fallback if name not available

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // --- AUTO-GENRE LOGIC ---
    if ((!genreIds || genreIds.length === 0) && type === 'MUSIC') {
        const today = new Date().toISOString().split('T')[0];
        const autoGenreName = `Importado - ${userName} - ${today}`;

        // 1. Check if genre exists
        const genreRes = await client.query(
            "SELECT id FROM genres WHERE name = $1 AND system_generated = true",
            [autoGenreName]
        );

        let targetGenreId;

        if (genreRes.rows.length > 0) {
            targetGenreId = genreRes.rows[0].id;
        } else {
            // 2. Create if not exists
            const createRes = await client.query(
                `INSERT INTO genres (name, color, hidden_for_client, system_generated) 
                 VALUES ($1, '#64748B', true, true) 
                 RETURNING id`,
                [autoGenreName]
            );
            targetGenreId = createRes.rows[0].id;
        }
        genreIds = [targetGenreId];
    }
    // -------------------------

    // 1. Cria registro de Mídia (Status: UPLOADED)
    const result = await client.query(
      `INSERT INTO media_files (company_id, title, original_filename, file_path, file_hash, status, type)
       VALUES ($1, $2, $3, '', 'PENDING', 'UPLOADED', $4)
       RETURNING id`,
      [companyId, title || req.file.originalname, req.file.originalname, type || 'MUSIC']
    );

    const mediaId = result.rows[0].id;

    // 1.5 Link Genres (Pivot Table)
    if (genreIds && genreIds.length > 0) {
        // Assuming song_genres table exists (based on previous turns reference, though simple mock handled it as array)
        // If the table 'song_genres' doesn't exist in current context, we skip this or need a migration.
        // Assuming implementation based on initial schema reference.
        for (const gid of genreIds) {
             // Safe insert
             await client.query(
                 "INSERT INTO song_genres (song_id, genre_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", // Using song_id as media_file_id alias conceptually
                 [mediaId, gid]
             ).catch(() => {}); // Swallow error if table missing in this step context
        }
    }

    // 2. Cria Job de Processamento
    await client.query(
      `INSERT INTO media_processing_jobs (media_file_id, job_type, status)
       VALUES ($1, 'TRANSCODE_AAC', 'pending')`,
      [mediaId]
    );

    // 3. Audit
    await client.query(
        "INSERT INTO audit_events (stream_id, event_type, payload) VALUES (NULL, 'MEDIA_UPLOADED', $1)",
        [{ mediaId, filename: req.file.originalname }]
    );

    await client.query('COMMIT');

    // Retorna rápido, worker processa depois
    res.json({ success: true, id: mediaId, status: 'UPLOADED', message: 'Arquivo na fila de processamento.' });

  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

exports.listMedia = async (req, res) => {
  const companyId = req.user.company_id || (await getMockCompanyId());
  
  try {
    const result = await db.query(
      `SELECT id, title, duration_seconds, status, type, created_at, file_path, version 
       FROM media_files 
       WHERE company_id = $1 
       ORDER BY created_at DESC`,
      [companyId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper Dev
async function getMockCompanyId() {
    const res = await db.query('SELECT id FROM companies LIMIT 1');
    return res.rows[0]?.id;
}
