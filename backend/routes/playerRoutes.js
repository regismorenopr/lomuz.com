
const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

// Rota pública consumida pelo Player Web
router.get('/streams/:streamId/next', playerController.getNextTrack);

module.exports = router;
