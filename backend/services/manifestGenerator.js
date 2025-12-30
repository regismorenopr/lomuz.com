
const streamRepo = require('../repositories/streamRepository');
const mediaRepo = require('../repositories/mediaRepository');
const storageService = require('./storageService');
const db = require('../db');

/**
 * Motor de Geração de Manifesto Determinístico (Grupo 5 & 8)
 * Cria uma projeção de reprodução baseada em regras lógicas.
 */
exports.generate = async (streamId) => {
    const stream = await streamRepo.findStreamWithSubscription(streamId);
    if (!stream) throw new Error('Stream not found');

    const step3Configs = await streamRepo.getStep3Configs(streamId);
    const activePlaylist = await streamRepo.getActivePlaylistLink(streamId);
    
    let playlistItems = [];
    if (activePlaylist) {
        playlistItems = await mediaRepo.getPlaylistItems(activePlaylist.id);
    }

    // Fallback: Se não houver músicas, usa uma lista de segurança (Grupo 14)
    if (playlistItems.length === 0) {
        playlistItems = await mediaRepo.findMediaByTags(['SAFE_FALLBACK'], 10);
    }

    const queue = [];
    const filesMap = new Map();

    const addToFiles = (media) => {
        if (!media || filesMap.has(media.id)) return;
        filesMap.set(media.id, {
            id: media.id,
            url: storageService.resolvePublicUrl(media),
            hash: media.file_hash,
            version: media.version || 1
        });
    };

    /**
     * Lógica Determinística:
     * Usamos o "Unix Timestamp / 3600" para garantir que a cada hora
     * o player tenha um ponto de sincronia natural.
     */
    const now = new Date();
    const startOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours()).getTime();
    
    // 1. Inserção de Atração de Hora Certa (Grupo 6)
    if (step3Configs.horaCerta?.active) {
        const hcMedia = await mediaRepo.findMediaByTags(['horaCerta'], 1);
        if (hcMedia[0]) {
            queue.push({ type: 'VIGNETTE', media_file_id: hcMedia[0].id, title: 'Hora Certa', policy: 'INTERRUPT' });
            addToFiles(hcMedia[0]);
        }
    }

    // 2. Projeção de Playlist com Intervenções (Grupo 8)
    let musicIdx = 0;
    const itemsToProject = 30; // Gera 30 faixas (~1.5h a 2h de áudio)
    
    for (let i = 0; i < itemsToProject; i++) {
        // Seleção circular determinística
        const item = playlistItems[i % playlistItems.length];
        
        queue.push({
            type: 'MUSIC',
            media_file_id: item.id,
            title: item.title,
            duration: item.duration_seconds
        });
        addToFiles(item);

        // Intervenção por recorrência (ex: Spot a cada 4 músicas)
        if (step3Configs.varejo?.active && (i + 1) % (step3Configs.varejo.interval || 4) === 0) {
            const spots = await mediaRepo.findMediaByTags(['varejo'], 1);
            if (spots[0]) {
                queue.push({ type: 'AD', media_file_id: spots[0].id, title: '[AUTO] Varejo', policy: 'NORMAL' });
                addToFiles(spots[0]);
            }
        }
    }

    return {
        stream_id: stream.id,
        manifest_id: `${streamId}-${startOfHour}`, // ID único por janela de tempo
        config: {
            crossfade: stream.crossfade || 4,
            normalization_lufs: -14,
            offline_mode: true
        },
        files: Array.from(filesMap.values()),
        queue: queue
    };
};
