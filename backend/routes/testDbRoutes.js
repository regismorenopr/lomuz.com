
const express = require('express');
const router = express.Router();
const db = require('../db');

// Rota de teste de conexão: GET /api/test-db
router.get('/test-db', async (req, res) => {
  try {
    const start = Date.now();
    const result = await db.query('SELECT NOW() as now');
    const duration = Date.now() - start;
    
    res.json({
      status: 'success',
      message: 'Conexão com PostgreSQL estabelecida com sucesso!',
      timestamp: result.rows[0].now,
      latency_ms: duration
    });
  } catch (error) {
    console.error('Erro na rota de teste de DB:', error);
    res.status(500).json({
      status: 'error',
      message: 'Falha ao conectar no banco de dados',
      error: error.message
    });
  }
});

module.exports = router;
