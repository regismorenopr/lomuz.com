
const db = require('../db');

/**
 * Busca dados completos do Stream + Status da Assinatura
 */
exports.findStreamWithSubscription = async (streamId) => {
    const query = `
        SELECT 
            s.*,
            sub.status as sub_status,
            sub.plan_code
        FROM streams s
        LEFT JOIN subscriptions sub ON s.id = sub.stream_id
        WHERE s.id = $1
    `;
    const res = await db.query(query, [streamId]);
    return res.rows[0];
};

/**
 * Busca configurações do Passo 3 (Atrações e Horários)
 * Consolida o JSONB armazenado
 */
exports.getStep3Configs = async (streamId) => {
    const query = `
        SELECT content_key, schedule_json
        FROM stream_step3_schedules
        WHERE stream_id = $1
    `;
    const res = await db.query(query, [streamId]);
    
    // Converte array de rows para Objeto { key: config }
    const configs = {};
    res.rows.forEach(row => {
        configs[row.content_key] = row.schedule_json;
    });
    return configs;
};

/**
 * Salva ou Atualiza uma configuração do Passo 3 (Upsert)
 */
exports.upsertStep3Config = async (client, streamId, key, config) => {
    // client é passado para permitir transação
    const query = `
        INSERT INTO stream_step3_schedules (stream_id, content_key, schedule_json, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (stream_id, content_key)
        DO UPDATE SET 
            schedule_json = EXCLUDED.schedule_json,
            updated_at = NOW()
    `;
    await client.query(query, [streamId, key, config]);
};

/**
 * Busca a Playlist ativa vinculada ao stream
 */
exports.getActivePlaylistLink = async (streamId) => {
    const query = `
        SELECT p.id, p.name 
        FROM stream_playlists sp
        JOIN playlists p ON sp.playlist_id = p.id
        WHERE sp.stream_id = $1 AND sp.is_primary = true
        LIMIT 1
    `;
    const res = await db.query(query, [streamId]);
    return res.rows[0];
};
