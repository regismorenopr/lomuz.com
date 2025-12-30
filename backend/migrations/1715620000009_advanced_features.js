
/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // 1. Permissions Table (1:1 with Streams)
  pgm.createTable('radio_permissions', {
    id: { type: 'uuid', primaryKey: true, references: '"streams"', onDelete: 'CASCADE' }, // Share ID with stream
    can_access_settings: { type: 'boolean', default: true },
    can_adjust_music_volume: { type: 'boolean', default: true },
    can_adjust_media_volume: { type: 'boolean', default: true },
    can_change_city_temperature: { type: 'boolean', default: true },
    can_request_ads: { type: 'boolean', default: true },
    can_use_virtual_voice: { type: 'boolean', default: true },
    can_use_pro_voice: { type: 'boolean', default: true },
    can_upload_music_without_genre: { type: 'boolean', default: false },
    can_manage_playlists: { type: 'boolean', default: false },
    can_use_audio_processing: { type: 'boolean', default: true },
    can_use_volume_normalizer: { type: 'boolean', default: true },
    can_change_bitrate: { type: 'boolean', default: false },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
  });

  // 2. Radio Settings Table (1:1 with Streams)
  pgm.createTable('radio_settings', {
    id: { type: 'uuid', primaryKey: true, references: '"streams"', onDelete: 'CASCADE' },
    crossfade_duration: { type: 'integer', default: 1500 },
    overlap_duration: { type: 'integer', default: 800 },
    music_volume: { type: 'integer', default: 85 },
    media_volume: { type: 'integer', default: 95 },
    audio_processing_preset: { type: 'text', default: 'OFF' },
    volume_normalizer_enabled: { type: 'boolean', default: false },
    target_loudness: { type: 'integer', default: -14 },
    bitrate: { type: 'integer', default: 48 },
    weather_city: { type: 'text' },
    weather_city_id: { type: 'text' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
  });

  // 3. Ad Requests Table
  pgm.createTable('ad_requests', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    stream_id: { type: 'uuid', notNull: true, references: '"streams"', onDelete: 'CASCADE' },
    type: { type: 'text', notNull: true }, // VIRTUAL, PRO
    voice_id: { type: 'text' },
    text_original: { type: 'text', notNull: true },
    text_final: { type: 'text', notNull: true },
    status: { type: 'text', default: 'REQUESTED' },
    ai_feedback: { type: 'text' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
  });
  pgm.createIndex('ad_requests', 'stream_id');

  // 4. Update Genres for Hidden Flag
  // Create table only if it doesn't exist (mock compatibility)
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS genres (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name text NOT NULL,
        color text,
        created_at timestamp DEFAULT now()
    );
  `);
  
  // Safe add columns
  pgm.addColumns('genres', {
    hidden_for_client: { type: 'boolean', default: false, ifNotExists: true },
    system_generated: { type: 'boolean', default: false, ifNotExists: true }
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('genres', ['hidden_for_client', 'system_generated']);
  pgm.dropTable('ad_requests');
  pgm.dropTable('radio_settings');
  pgm.dropTable('radio_permissions');
};
