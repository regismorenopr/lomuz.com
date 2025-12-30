
const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');

// Endpoint interno - Idealmente proteger por IP ou Header secreto em produção
router.get('/readiness', systemController.getReadiness);

module.exports = router;
