
/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // A) Tabela de Jobs de Processamento (Pipeline Assíncrono)
  pgm.createTable('media_processing_jobs', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    media_file_id: { type: 'uuid', notNull: true, references: '"media_files"', onDelete: 'CASCADE' },
    job_type: { type: 'text', notNull: true, default: 'TRANSCODE_AAC' },
    status: { 
      type: 'text', 
      notNull: true, 
      default: 'pending',
      check: "status IN ('pending', 'running', 'done', 'error')" 
    },
    error_message: { type: 'text' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
  pgm.createIndex('media_processing_jobs', 'status');

  // B) Tabela de Vínculo Stream <-> Playlist (Qual playlist toca em qual rádio)
  pgm.createTable('stream_playlists', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    stream_id: { type: 'uuid', notNull: true, references: '"streams"', onDelete: 'CASCADE' },
    playlist_id: { type: 'uuid', notNull: true, references: '"playlists"', onDelete: 'CASCADE' },
    is_primary: { type: 'boolean', default: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
  // Garante que uma playlist só é vinculada uma vez por stream
  pgm.addConstraint('stream_playlists', 'unique_stream_playlist_link', {
    unique: ['stream_id', 'playlist_id'],
  });

  // C) Versionamento para Offline (Incrementa se o arquivo mudar)
  pgm.addColumn('media_files', {
    version: { type: 'integer', default: 1, notNull: true },
    bitrate: { type: 'integer', default: 128 },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('media_files', ['version', 'bitrate']);
  pgm.dropTable('stream_playlists');
  pgm.dropTable('media_processing_jobs');
};
