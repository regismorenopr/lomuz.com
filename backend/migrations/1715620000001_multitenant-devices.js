
/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // 1. Atualizar Users para Multi-Tenant
  // Adiciona company_id e role se não existirem
  pgm.addColumn('users', {
    company_id: { type: 'uuid', references: '"companies"', onDelete: 'SET NULL' },
    role: { type: 'text', notNull: true, default: 'CLIENT', check: "role IN ('DIRECTOR', 'CLIENT')" },
  });
  pgm.createIndex('users', 'company_id');

  // 2. Tabela Devices (Ouvintes Conectados)
  pgm.createTable('devices', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    company_id: { type: 'uuid', notNull: true, references: '"companies"', onDelete: 'CASCADE' },
    stream_id: { type: 'uuid', notNull: true, references: '"streams"', onDelete: 'CASCADE' },
    device_key: { type: 'text', notNull: true }, // Fingerprint ou ID do player
    device_name: { type: 'text' },
    ip: { type: 'text' },
    user_agent: { type: 'text' },
    last_seen_at: { type: 'timestamp with time zone', notNull: true, default: pgm.func('current_timestamp') },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // Garante unicidade do device por stream (Upsert key)
  pgm.addConstraint('devices', 'unique_stream_device', {
    unique: ['stream_id', 'device_key'],
  });

  // Índices para performance de contagem em tempo real
  pgm.createIndex('devices', 'stream_id');
  pgm.createIndex('devices', 'last_seen_at');
  
  // 3. Atualizar Audit Events se necessário (já criado na migration 000, apenas garantindo compatibilidade)
  // O campo user_id já existe como uuid nullable na migration anterior.
};

exports.down = (pgm) => {
  pgm.dropTable('devices');
  pgm.dropColumn('users', ['company_id', 'role']);
};
