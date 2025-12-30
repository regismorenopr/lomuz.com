
/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // 1. Media Files (Armazém de Arquivos)
  pgm.createTable('media_files', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    company_id: { type: 'uuid', notNull: true, references: '"companies"', onDelete: 'CASCADE' },
    title: { type: 'text', notNull: true },
    original_filename: { type: 'text', notNull: true },
    file_path: { type: 'text', notNull: true }, // Caminho relativo (ex: /uploads/aac/file.aac)
    file_hash: { type: 'text', notNull: true }, // MD5/SHA256 para integridade offline
    duration_seconds: { type: 'integer', default: 0 },
    size_bytes: { type: 'bigint', default: 0 },
    mime_type: { type: 'text', default: 'audio/aac' },
    type: { type: 'text', default: 'MUSIC' }, // MUSIC, AD, VIGNETTE
    status: { type: 'text', default: 'PROCESSING' }, // UPLOADING, PROCESSING, READY, FAILED
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
  pgm.createIndex('media_files', 'company_id');

  // 2. Playlists (Agrupadores)
  pgm.createTable('playlists', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    company_id: { type: 'uuid', notNull: true, references: '"companies"', onDelete: 'CASCADE' },
    name: { type: 'text', notNull: true },
    description: { type: 'text' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // 3. Playlist Items (Vínculo Mídia <-> Playlist)
  pgm.createTable('playlist_items', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    playlist_id: { type: 'uuid', notNull: true, references: '"playlists"', onDelete: 'CASCADE' },
    media_id: { type: 'uuid', notNull: true, references: '"media_files"', onDelete: 'CASCADE' },
    order_idx: { type: 'integer', default: 0 },
  });
  pgm.createIndex('playlist_items', 'playlist_id');

  // 4. Stream Schedules (Agendamentos / Regras)
  pgm.createTable('schedules', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    stream_id: { type: 'uuid', notNull: true, references: '"streams"', onDelete: 'CASCADE' },
    playlist_id: { type: 'uuid', references: '"playlists"' }, // Se for tocar uma playlist inteira
    media_id: { type: 'uuid', references: '"media_files"' }, // Se for um arquivo solto (comercial)
    
    schedule_type: { type: 'text', notNull: true }, // FIXED_TIME, INTERVAL, FILLER
    
    // Regras de Tempo
    start_time: { type: 'time' }, // HH:MM:SS
    end_time: { type: 'time' },
    days_of_week: { type: 'jsonb' }, // [0,1,2,3,4,5,6]
    priority: { type: 'integer', default: 1 }, // 10=Emergência, 5=Comercial, 1=Música
    
    active: { type: 'boolean', default: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
  pgm.createIndex('schedules', 'stream_id');

  // 5. Execution Logs (Observabilidade do Player)
  pgm.createTable('execution_logs', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    stream_id: { type: 'uuid', notNull: true },
    media_id: { type: 'uuid' },
    device_key: { type: 'text' }, // Quem tocou
    played_at: { type: 'timestamp', notNull: true },
    duration_played: { type: 'integer' },
    status: { type: 'text' }, // SUCCESS, SKIPPED, ERROR
    error_message: { type: 'text' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
  pgm.createIndex('execution_logs', ['stream_id', 'played_at']);
};

exports.down = (pgm) => {
  pgm.dropTable('execution_logs');
  pgm.dropTable('schedules');
  pgm.dropTable('playlist_items');
  pgm.dropTable('playlists');
  pgm.dropTable('media_files');
};
