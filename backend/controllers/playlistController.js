
const db = require('../db');

// Listar Playlists da Empresa
exports.listPlaylists = async (req, res) => {
    const companyId = req.user.company_id; 
    // Em dev mode sem auth forte, fallback
    if(!companyId) return res.status(400).json({error: 'Company ID missing'});

    try {
        const result = await db.query(
            'SELECT id, name, created_at FROM playlists WHERE company_id = $1 ORDER BY name',
            [companyId]
        );
        res.json(result.rows);
    } catch(e) {
        res.status(500).json({error: e.message});
    }
};

// Criar Playlist
exports.createPlaylist = async (req, res) => {
    const { name } = req.body;
    const companyId = req.user.company_id;

    try {
        const resDb = await db.query(
            'INSERT INTO playlists (company_id, name) VALUES ($1, $2) RETURNING id, name',
            [companyId, name]
        );
        res.json(resDb.rows[0]);
    } catch(e) {
        res.status(500).json({error: e.message});
    }
};

// Adicionar Item à Playlist
exports.addPlaylistItem = async (req, res) => {
    const { playlistId } = req.params;
    const { mediaId } = req.body;

    try {
        // Pega última posição
        const posRes = await db.query('SELECT MAX(order_idx) as max_idx FROM playlist_items WHERE playlist_id = $1', [playlistId]);
        const nextPos = (posRes.rows[0].max_idx || 0) + 1;

        await db.query(
            'INSERT INTO playlist_items (playlist_id, media_id, order_idx) VALUES ($1, $2, $3)',
            [playlistId, mediaId, nextPos]
        );
        res.json({success: true});
    } catch(e) {
        res.status(500).json({error: e.message});
    }
};

// Vincular Playlist ao Stream (Define o que toca)
exports.setStreamPlaylist = async (req, res) => {
    const { streamId } = req.params;
    const { playlistId } = req.body;

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        
        // Remove anterior (simplificação: 1 playlist por vez por stream para MVP)
        await client.query('DELETE FROM stream_playlists WHERE stream_id = $1', [streamId]);
        
        // Adiciona nova
        await client.query(
            'INSERT INTO stream_playlists (stream_id, playlist_id, is_primary) VALUES ($1, $2, true)',
            [streamId, playlistId]
        );

        // Audit
        await client.query(
            "INSERT INTO audit_events (stream_id, event_type, payload) VALUES ($1, 'PLAYLIST_CHANGED', $2)",
            [streamId, { playlistId }]
        );

        await client.query('COMMIT');
        res.json({success: true, message: 'Playlist ativa atualizada'});
    } catch(e) {
        await client.query('ROLLBACK');
        res.status(500).json({error: e.message});
    } finally {
        client.release();
    }
};
