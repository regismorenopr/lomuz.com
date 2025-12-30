
const db = require('../db');
const { getActivePlaylist } = require('../services/automationEngine');

/**
 * Endpoint principal do Player.
 * Decide o que tocar agora baseado na automação.
 */
exports.getNextTrack = async (req, res) => {
    const { streamId } = req.params;

    try {
        // 1. Automação: Qual playlist está ativa agora?
        const playlistId = await getActivePlaylist(streamId);

        if (!playlistId) {
            return res.status(404).json({ message: "Nenhuma programação ativa para este horário." });
        }

        // 2. Curadoria: Selecionar a próxima música da playlist (Sequencial Simples)
        // Nota: Em um sistema real do dia 16, usaríamos um ponteiro 'last_played_idx' 
        // mas para esta restauração usaremos seleção aleatória dentro da playlist ativa 
        // para garantir que o player sempre tenha conteúdo sem precisar de estado complexo.
        const mediaQuery = `
            SELECT m.id, m.title, m.file_path as src, m.duration_seconds as duration, m.type
            FROM playlist_items pi
            JOIN media_files m ON pi.media_id = m.id
            WHERE pi.playlist_id = $1
            ORDER BY RANDOM()
            LIMIT 1
        `;

        const mediaResult = await db.query(mediaQuery, [playlistId]);
        const track = mediaResult.rows[0];

        if (!track) {
            return res.status(404).json({ message: "Playlist ativa mas sem mídias cadastradas." });
        }

        res.json({
            track: {
                id: track.id,
                title: track.title,
                src: track.src,
                duration: track.duration,
                type: track.type
            }
        });

    } catch (error) {
        console.error("Erro no Player Controller:", error);
        res.status(500).json({ error: "Erro ao processar próxima faixa." });
    }
};
