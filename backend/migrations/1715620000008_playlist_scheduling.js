
/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // Adiciona suporte para agendamento de Playlists (Múltiplos itens)
  pgm.addColumns('schedules', {
    content_type: { type: 'text', default: 'MEDIA' }, // 'MEDIA' ou 'PLAYLIST'
    playlist_ids: { type: 'jsonb' }, // Array de UUIDs das playlists
    
    // Regras de execução da Playlist
    playback_mode: { type: 'text', default: 'SEQUENCE' }, // 'SEQUENCE' ou 'SHUFFLE'
    stop_condition_type: { type: 'text', default: 'NONE' }, // 'NONE', 'TIME', 'COUNT'
    stop_condition_value: { type: 'integer', default: 0 } // Minutos ou Nº Faixas
  });

  // Torna media_id opcional pois agora pode ser playlist
  pgm.alterColumn('schedules', 'media_id', {
    notNull: false
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('schedules', ['content_type', 'playlist_ids', 'playback_mode', 'stop_condition_type', 'stop_condition_value']);
  // Nota: Não é possível restaurar o notNull do media_id facilmente se houver dados nulos
};
