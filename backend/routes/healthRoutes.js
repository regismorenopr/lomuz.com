
const express = require('express');
const router = express.Router();
const db = require('../db');
const fs = require('fs');
const path = require('path');

// GET /api/health/full
router.get('/full', async (req, res) => {
  const health = {
    status: 'UP',
    timestamp: new Date(),
    services: {
        db: 'UNKNOWN',
        storage: 'UNKNOWN',
        billing: process.env.BILLING_ENABLED === 'true' ? 'ENABLED' : 'DISABLED'
    }
  };

  // 1. Check DB
  try {
    const start = Date.now();
    await db.query('SELECT 1');
    health.services.db = { status: 'UP', latency_ms: Date.now() - start };
  } catch (error) {
    health.status = 'DOWN';
    health.services.db = { status: 'DOWN', error: error.message };
  }

  // 2. Check Storage Write Permission
  try {
    const testFile = path.join(__dirname, '../uploads/health_check.tmp');
    fs.writeFileSync(testFile, 'OK');
    fs.unlinkSync(testFile);
    health.services.storage = { status: 'UP', type: process.env.STORAGE_PROVIDER || 'LOCAL' };
  } catch (error) {
    health.status = 'DEGRADED';
    health.services.storage = { status: 'DOWN', error: error.message };
  }

  const statusCode = health.status === 'UP' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Legacy simple check
router.get('/db', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.json({ ok: true });
    } catch(e) {
        res.status(500).json({ ok: false });
    }
});

module.exports = router;
