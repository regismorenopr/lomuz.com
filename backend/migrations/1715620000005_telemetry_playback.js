
/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // 1. Tabela de Logs de Reprodução (Comprovante)
  pgm.createTable('playback_logs', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    stream_id: { type: 'uuid', notNull: true, references: '"streams"', onDelete: 'CASCADE' },
    device_id: { type: 'text', notNull: true }, // ID do device/fingerprint
    media_id: { type: 'uuid' }, // Pode ser null se for live ou desconhecido
    played_at: { type: 'timestamp with time zone', notNull: true },
    duration_ms: { type: 'integer', default: 0 },
    status: { type: 'text', default: 'COMPLETED' }, // COMPLETED, SKIPPED, FAILED
    offline_sync: { type: 'boolean', default: false }, // Se foi sincronizado post-facto
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
  
  pgm.createIndex('playback_logs', ['stream_id', 'played_at']);
  pgm.createIndex('playback_logs', 'device_id');

  // 2. Atualizar tabela Devices com Telemetria
  pgm.addColumns('devices', {
    app_version: { type: 'text' },
    disk_usage_mb: { type: 'integer', default: 0 },
    cache_health_percent: { type: 'integer', default: 0 },
    last_error: { type: 'text' },
    status: { type: 'text', default: 'ONLINE' } // ONLINE, OFFLINE, SYNCING
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('devices', ['app_version', 'disk_usage_mb', 'cache_health_percent', 'last_error', 'status']);
  pgm.dropTable('playback_logs');
};
