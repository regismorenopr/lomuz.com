
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const db = require('../db');

// Diretórios
const UPLOAD_DIR = path.join(__dirname, '../uploads/raw');
const PROCESSED_DIR = path.join(__dirname, '../uploads/aac');

// Garante que pastas existam
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(PROCESSED_DIR)) fs.mkdirSync(PROCESSED_DIR, { recursive: true });

// Simula FFmpeg se não estiver instalado
const MOCK_FFMPEG = true; 

const calculateHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
};

const processMedia = async (mediaId, tempPath, originalName) => {
  console.log(`[MediaPipeline] Iniciando processamento: ${mediaId}`);
  
  try {
    // 1. Atualiza status para PROCESSING
    await db.query("UPDATE media_files SET status = 'PROCESSING' WHERE id = $1", [mediaId]);

    // 2. Define caminhos
    const safeName = `${mediaId}.aac`; // Padroniza nome
    const outputPath = path.join(PROCESSED_DIR, safeName);

    // 3. Conversão (Simulada ou Real)
    if (MOCK_FFMPEG) {
      // Simula tempo de conversão
      await new Promise(r => setTimeout(r, 2000));
      // Apenas copia o arquivo renomeando (em prod, aqui entraria o fluent-ffmpeg)
      fs.copyFileSync(tempPath, outputPath);
    } else {
      // TODO: Implementar fluent-ffmpeg aqui para converter MP3 -> AAC-HE v2
    }

    // 4. Calcular Hash e Metadados
    const hash = await calculateHash(outputPath);
    const stats = fs.statSync(outputPath);
    
    // 5. Finaliza: Atualiza DB e remove temp
    const publicUrl = `/uploads/aac/${safeName}`; // Rota estática
    
    await db.query(
      `UPDATE media_files SET 
       status = 'READY', 
       file_path = $1, 
       file_hash = $2, 
       size_bytes = $3,
       duration_seconds = 180 
       WHERE id = $4`,
      [publicUrl, hash, stats.size, mediaId]
    );

    // Limpa arquivo temporário de upload
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

    console.log(`[MediaPipeline] Sucesso: ${mediaId}`);

  } catch (error) {
    console.error(`[MediaPipeline] Falha:`, error);
    await db.query("UPDATE media_files SET status = 'FAILED' WHERE id = $1", [mediaId]);
  }
};

module.exports = { processMedia, UPLOAD_DIR };
