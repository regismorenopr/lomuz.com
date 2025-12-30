
/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

  // 1. Users & Companies (Tenancy)
  pgm.createTable('companies', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    company_name: { type: 'text', notNull: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('users', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    email: { type: 'text', notNull: true, unique: true },
    password_hash: { type: 'text' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // 2. Streams (Rádios)
  pgm.createTable('streams', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    company_id: { type: 'uuid', references: '"companies"' },
    stream_name: { type: 'text', notNull: true },
    kbps: { type: 'integer', default: 128 },
    contracted_accesses: { type: 'integer', default: 100 },
    status: { type: 'text', default: 'OFFLINE' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // 3. Step 3 Schedules (Programação)
  pgm.createTable('stream_step3_schedules', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    stream_id: { type: 'uuid', notNull: true, references: '"streams"', onDelete: 'CASCADE' },
    content_key: { type: 'text', notNull: true }, // ex: 'conexaoNews', 'horaCerta'
    schedule_json: { type: 'jsonb', notNull: true }, // Armazena config completa { mode, fixedTimes... }
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
  
  // Garante uma única config por tipo de conteúdo por stream
  pgm.addConstraint('stream_step3_schedules', 'unique_stream_content_key', {
    unique: ['stream_id', 'content_key'],
  });
  
  pgm.createIndex('stream_step3_schedules', 'stream_id');

  // 4. Audit (Segurança)
  pgm.createTable('audit_events', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    stream_id: { type: 'uuid' },
    event_type: { type: 'text', notNull: true },
    ip: { type: 'text' },
    user_agent: { type: 'text' },
    payload: { type: 'jsonb' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
  pgm.createIndex('audit_events', 'stream_id');
};

exports.down = (pgm) => {
  pgm.dropTable('audit_events');
  pgm.dropTable('stream_step3_schedules');
  pgm.dropTable('streams');
  pgm.dropTable('users');
  pgm.dropTable('companies');
};
