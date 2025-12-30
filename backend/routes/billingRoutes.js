
const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { requireAuth } = require('../middleware/authMiddleware');

// Rotas protegidas (apenas admin/sistema deveria chamar activate, ou usuário logado pagando)
router.post('/activate', requireAuth, billingController.activatePlan);

// Rota pública para Webhook (Gateway chama aqui)
// Em produção, verificar assinatura do webhook no header
router.post('/webhook', billingController.handleWebhook);

module.exports = router;
