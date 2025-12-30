
const db = require('../db');

const isBillingEnabled = () => process.env.BILLING_ENABLED === 'true';

// Helper para logar eventos
const logBillingEvent = async (client, subId, type, payload) => {
  await client.query(
    'INSERT INTO billing_events (subscription_id, event_type, payload) VALUES ($1, $2, $3)',
    [subId, type, payload]
  );
};

// POST /api/v1/billing/activate
exports.activatePlan = async (req, res) => {
  if (!isBillingEnabled()) return res.json({ message: 'Billing disabled' });

  const { stream_id, plan_code, contracted_accesses, currency, gateway, price_cents } = req.body;

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Busca Subscription Atual
    const subRes = await client.query('SELECT id FROM subscriptions WHERE stream_id = $1', [stream_id]);
    
    if (subRes.rows.length === 0) {
      throw new Error('Subscription not found for this stream.');
    }
    
    const subId = subRes.rows[0].id;

    // 2. Simula criação no Gateway (Aqui entraria a chamada real ao Stripe/Asaas)
    const mockGatewayId = `sub_${gateway}_${Date.now()}`;
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + 30); // +30 dias

    // 3. Atualiza Subscription para ACTIVE
    await client.query(
      `UPDATE subscriptions SET 
       status = 'active',
       plan_code = $1,
       contracted_accesses = $2,
       currency = $3,
       price_cents = $4,
       gateway = $5,
       gateway_subscription_id = $6,
       current_period_end = $7,
       updated_at = NOW()
       WHERE id = $8`,
      [plan_code, contracted_accesses, currency, price_cents, gateway, mockGatewayId, periodEnd, subId]
    );

    // 4. Atualiza limite contratado na tabela streams também (cache rápido)
    await client.query(
      'UPDATE streams SET contracted_accesses = $1 WHERE id = $2',
      [contracted_accesses, stream_id]
    );

    // 5. Log Event
    await logBillingEvent(client, subId, 'PAYMENT_SUCCESS', { 
        amount: price_cents, 
        gateway_id: mockGatewayId,
        plan: plan_code 
    });

    await logBillingEvent(client, subId, 'SUBSCRIPTION_ACTIVATED', { method: 'API' });

    await client.query('COMMIT');
    res.json({ success: true, status: 'active', gateway_id: mockGatewayId });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Activation Error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

// POST /api/v1/billing/webhook
// Simula recebimento de webhook do Asaas/Stripe
exports.handleWebhook = async (req, res) => {
  if (!isBillingEnabled()) return res.json({ ignored: true });

  const { event, gateway_subscription_id, payload } = req.body;
  
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Busca subscription pelo ID do gateway
    const subRes = await client.query(
        'SELECT id, stream_id FROM subscriptions WHERE gateway_subscription_id = $1',
        [gateway_subscription_id]
    );

    if (subRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Subscription not found' });
    }

    const subId = subRes.rows[0].id;
    const streamId = subRes.rows[0].stream_id;

    // Lógica simples de mudança de estado
    if (event === 'PAYMENT_FAILED') {
        await client.query("UPDATE subscriptions SET status = 'past_due' WHERE id = $1", [subId]);
        await logBillingEvent(client, subId, 'PAYMENT_FAILED', payload);
        
        // Opcional: Audit no stream
        await client.query(
            "INSERT INTO audit_events (stream_id, event_type, payload) VALUES ($1, 'SUBSCRIPTION_PAST_DUE', $2)",
            [streamId, { reason: 'Webhook Payment Failed' }]
        );
    } else if (event === 'SUBSCRIPTION_CANCELED') {
        await client.query("UPDATE subscriptions SET status = 'canceled' WHERE id = $1", [subId]);
        await logBillingEvent(client, subId, 'CANCELED', payload);
    } else if (event === 'PAYMENT_SUCCESS') {
        // Renova período
        const newEnd = new Date();
        newEnd.setDate(newEnd.getDate() + 30);
        await client.query(
            "UPDATE subscriptions SET status = 'active', current_period_end = $1 WHERE id = $2",
            [newEnd, subId]
        );
        await logBillingEvent(client, subId, 'PAYMENT_SUCCESS', payload);
    }

    await client.query('COMMIT');
    res.json({ received: true });

  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};
