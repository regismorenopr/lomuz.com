
const db = require('../db');

/**
 * Busca itens de uma playlist ordenados
 */
exports.getPlaylistItems = async (playlistId) => {
    const query = `
        SELECT 
            m.id, m.title, m.file_path, m.file_hash, 
            m.version, m.duration_seconds, m.storage_provider, m.cdn_url, m.bucket_key,
            m.type
        FROM playlist_items pi
        JOIN media_files m ON pi.media_id = m.id
        WHERE pi.playlist_id = $1 AND m.status = 'READY'
        ORDER BY pi.order_idx ASC
    `;
    const res = await db.query(query, [playlistId]);
    return res.rows;
};

/**
 * Busca mídias específicas para inserção (Comerciais/Atrações)
 * Útil para resolver o Step 3 para arquivos reais
 */
exports.findMediaByTags = async (tags, limit = 1) => {
    // Implementação simples: busca por tipo ou título aproximado para mock
    // Em produção, usaríamos uma tabela de tags real
    const query = `
        SELECT * FROM media_files 
        WHERE status = 'READY' 
        AND (title ILIKE $1 OR type = ANY($2))
        ORDER BY RANDOM()
        LIMIT $3
    `;
    // Mock logic: se tag for 'horaCerta', busca vinheta ou usa qualquer comercial
    const search = `%${tags[0]}%`;
    const types = ['COMMERCIAL', 'VIGNETTE', 'JINGLE'];
    
    const res = await db.query(query, [search, types, limit]);
    return res.rows;
};

exports.getMediaById = async (mediaId) => {
    const res = await db.query('SELECT * FROM media_files WHERE id = $1', [mediaId]);
    return res.rows[0];
}
