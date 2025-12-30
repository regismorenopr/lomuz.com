
/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // 1. Cloudflare R2 & CDN Readiness
  // Adiciona suporte para diferenciar armazenamento local de nuvem
  pgm.addColumn('media_files', {
    storage_provider: { type: 'text', notNull: true, default: 'LOCAL', check: "storage_provider IN ('LOCAL', 'R2', 'S3')" },
    cdn_url: { type: 'text' }, // URL absoluta se servido via CDN
    bucket_key: { type: 'text' }, // Caminho dentro do bucket
  });

  // 2. Performance Tuning (Indices baseados no relatório de arquitetura)
  pgm.createIndex('streams', 'company_id'); // Já criado, garantindo
  pgm.createIndex('media_files', ['status', 'type']); // Para buscas rápidas de 'READY' e 'MUSIC'
  pgm.createIndex('subscriptions', 'status'); // Para billing check rápido
  pgm.createIndex('devices', 'last_seen_at'); // Para métricas de tempo real

  // 3. Consolidação do Step 3 (Garantia de Integridade)
  // Adiciona coluna para saber se o stream está "publicado" (config aplicada)
  pgm.addColumn('streams', {
    config_version: { type: 'integer', default: 1 },
    last_published_at: { type: 'timestamp' }
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('streams', ['config_version', 'last_published_at']);
  pgm.dropColumn('media_files', ['storage_provider', 'cdn_url', 'bucket_key']);
};
