
const express = require('express');
const router = express.Router();
const streamController = require('../controllers/streamController');
const playbackController = require('../controllers/playbackController');
const { requireAuth, requireStreamAccess } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validationMiddleware');

// Rotas Publicas ou de Criação (Internas)
router.post('/streams', validate(schemas.createStream), streamController.createStream);

// Fix: Remove requireAuth para permitir que o Player liste rádios publicamente
router.get('/radios', streamController.listStreams);

// Rotas de Programação e Configuração (Protegidas)
router.get('/streams/:id/step3', requireAuth, requireStreamAccess, streamController.getStep3);
router.put('/streams/:id/step3', requireAuth, requireStreamAccess, streamController.saveStep3);
router.post('/streams/:id/step3/restore-default', requireAuth, requireStreamAccess, streamController.restoreDefault);

// Rotas de Player / Métricas (Publicas ou Tokenizadas)
router.post('/streams/:id/devices/heartbeat', streamController.heartbeat);
router.get('/streams/:id/devices/online', streamController.getOnlineDevices);
router.get('/streams/:id/access/check', streamController.checkAccess);
router.get('/streams/:id/player-config', streamController.getPlayerConfig); // NEW: Config Endpoint

// NOVO: Reportar execução (Comprovante)
router.post('/streams/:id/playback', playbackController.reportPlayback);

// NOVO: Dashboard Operacional (Diretor)
router.get('/dashboard/operational', requireAuth, streamController.getOperationalDashboard);

module.exports = router;
