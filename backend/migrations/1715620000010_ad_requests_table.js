
/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('ad_requests', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    stream_id: { type: 'uuid', notNull: true, references: '"streams"', onDelete: 'CASCADE' },
    type: { type: 'text', notNull: true }, // 'VIRTUAL', 'PRO'
    voice_id: { type: 'text' }, // 'male_1', 'female_1', etc. Nullable for PRO
    text_original: { type: 'text', notNull: true },
    text_final: { type: 'text', notNull: true },
    status: { 
      type: 'text', 
      default: 'REQUESTED',
      check: "status IN ('REQUESTED', 'APPROVED', 'PRODUCED', 'DELIVERED', 'REJECTED')"
    },
    ai_feedback: { type: 'text' }, // Stores the suggestion if used
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
  });

  pgm.createIndex('ad_requests', 'stream_id');
  pgm.createIndex('ad_requests', 'status');
};

exports.down = (pgm) => {
  pgm.dropTable('ad_requests');
};
