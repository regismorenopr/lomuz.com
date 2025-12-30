
/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // A) Subscriptions
  pgm.createTable('subscriptions', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    company_id: { type: 'uuid', notNull: true, references: '"companies"', onDelete: 'CASCADE' },
    stream_id: { type: 'uuid', notNull: true, references: '"streams"', onDelete: 'CASCADE' },
    
    // Status do ciclo de vida financeiro
    status: { 
      type: 'text', 
      notNull: true, 
      default: 'trialing',
      check: "status IN ('trialing', 'active', 'past_due', 'canceled')" 
    },
    
    // Detalhes do Plano
    plan_code: { type: 'text', notNull: true, default: 'TRIAL' },
    currency: { type: 'text', notNull: true, default: 'BRL' },
    price_cents: { type: 'integer', notNull: true, default: 0 },
    contracted_accesses: { type: 'integer', notNull: true, default: 50 }, // Default do trial
    
    // Datas Críticas
    trial_ends_at: { type: 'timestamp with time zone', notNull: true },
    current_period_end: { type: 'timestamp with time zone' }, // Nullable durante trial puro
    
    // Integração Gateway
    gateway: { type: 'text', notNull: true, default: 'INTERNAL' }, // INTERNAL, ASAAS, STRIPE
    gateway_subscription_id: { type: 'text' },
    
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // Garante uma assinatura por stream
  pgm.createIndex('subscriptions', 'stream_id', { unique: true });
  pgm.createIndex('subscriptions', 'company_id');

  // B) Billing Events (Audit Trail Financeiro)
  pgm.createTable('billing_events', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    subscription_id: { type: 'uuid', references: '"subscriptions"', onDelete: 'SET NULL' },
    event_type: { type: 'text', notNull: true }, // TRIAL_STARTED, PAYMENT_SUCCESS, etc.
    payload: { type: 'jsonb' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
  
  pgm.createIndex('billing_events', 'subscription_id');
};

exports.down = (pgm) => {
  pgm.dropTable('billing_events');
  pgm.dropTable('subscriptions');
};
