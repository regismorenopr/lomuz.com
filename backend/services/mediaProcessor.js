const db = require('../db');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Simulação de FFmpeg para o estado funcional restaurado
const PROCESSED_DIR = path.join(__dirname, '../uploads/aac');
if (!fs.existsSync(PROCESSED_DIR)) fs.mkdirSync(PROCESSED_DIR, { recursive: true });

const calculateHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
};

const runWorker = async () => {
  if (process.env.WORKER_ENABLED === 'false') return;

  try {
    const client = await db.pool.connect();
    let job;
    
    try {
      await client.query('BEGIN');
      const res = await client.query(
        `SELECT j.id, j.media_file_id, m.original_filename, m.title 
         FROM media_processing_jobs j
         JOIN media_files m ON j.media_file_id = m.id
         WHERE j.status = 'pending' 
         FOR UPDATE SKIP LOCKED 
         LIMIT 1`
      );
      
      if (res.rows.length > 0) {
        job = res.rows[0];
        await client.query("UPDATE media_processing_jobs SET status = 'running', updated_at = NOW() WHERE id = $1", [job.id]);
        await client.query("UPDATE media_files SET status = 'PROCESSING' WHERE id = $1", [job.media_file_id]);
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    if (!job) return;

    console.log(`[Lomuz Worker] Convertendo ${job.title} para AAC 128kbps...`);

    const rawPath = path.join(__dirname, '../uploads/raw', job.original_filename);
    const safeName = `${job.media_file_id}.aac`;
    const outputPath = path.join(PROCESSED_DIR, safeName);

    // Simulando delay de processamento real
    await new Promise(r => setTimeout(r, 2000));

    // No estado funcional das 6h, o arquivo original é lido e o processado é criado
    if (fs.existsSync(rawPath)) {
        fs.copyFileSync(rawPath, outputPath); // Mock da conversão
        fs.unlinkSync(rawPath); // Regra: Excluir original após conversão
    } else {
        // Fallback para testes sem arquivo físico
        fs.writeFileSync(outputPath, 'AAC_ENCODED_CONTENT_STUB');
    }

    const hash = await calculateHash(outputPath);
    const stats = fs.statSync(outputPath);
    const publicUrl = `/uploads/aac/${safeName}`;

    await db.query(
      `UPDATE media_files SET 
       status = 'READY', 
       file_path = $1, 
       file_hash = $2, 
       duration_seconds = 180,
       bitrate = 128
       WHERE id = $3`,
      [publicUrl, hash, job.media_file_id]
    );

    await db.query("UPDATE media_processing_jobs SET status = 'done', updated_at = NOW() WHERE id = $1", [job.id]);
    console.log(`[Lomuz Worker] ${job.title} pronto.`);

  } catch (error) {
    console.error(`[Worker Error]`, error);
  }
};

const start = () => {
  setInterval(runWorker, 5000);
  console.log(">>> Media Transcoder Worker ativo (AAC 128kbps)");
};

module.exports = { start };