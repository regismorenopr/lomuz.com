
/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // Tabela isolada para testes, sem FKs complexas para não impactar produção
  pgm.createTable('test_streams', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    name: { type: 'text', notNull: true },
    test_audio_url: { type: 'text', notNull: true },
    active: { type: 'boolean', default: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    created_by: { type: 'text', default: 'ADMIN' }
  });
};

exports.down = (pgm) => {
  pgm.dropTable('test_streams');
};
