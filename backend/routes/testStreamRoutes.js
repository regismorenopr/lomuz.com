
const express = require('express');
const router = express.Router();
const testStreamController = require('../controllers/testStreamController');
const { requireAuth } = require('../middleware/authMiddleware');

// Rotas protegidas (apenas admin/diretor pode criar)
router.post('/test-streams', requireAuth, testStreamController.createTestStream);
router.get('/test-streams', requireAuth, testStreamController.listTestStreams);

// Rota pública (player consome)
router.get('/test-streams/:id/manifest', testStreamController.getTestManifest);

module.exports = router;
