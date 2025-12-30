
const db = require('../db');

/**
 * Resolve qual playlist deve estar tocando agora para uma determinada rádio (stream).
 * Lógica baseada estritamente em horário e dia da semana.
 */
async function getActivePlaylist(streamId) {
    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS
    const currentDay = now.getDay(); // 0-6

    const query = `
        SELECT playlist_id 
        FROM schedules 
        WHERE stream_id = $1 
        AND active = true 
        AND start_date <= CURRENT_DATE 
        AND (end_date IS NULL OR end_date >= CURRENT_DATE)
        AND start_time <= $2 
        AND end_time >= $2
        AND days_of_week @> $3::jsonb
        LIMIT 1
    `;

    const result = await db.query(query, [streamId, currentTime, JSON.stringify([currentDay])]);
    return result.rows[0] ? result.rows[0].playlist_id : null;
}

module.exports = { getActivePlaylist };
