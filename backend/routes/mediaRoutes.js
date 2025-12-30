
const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const playlistController = require('../controllers/playlistController');
const manifestController = require('../controllers/manifestController');
const { requireAuth, requireStreamAccess } = require('../middleware/authMiddleware');

// === MEDIA ===
router.post('/media/upload', requireAuth, mediaController.uploadMiddleware, mediaController.uploadFile);
router.get('/media', requireAuth, mediaController.listMedia);

// === PLAYLISTS ===
router.get('/playlists', requireAuth, playlistController.listPlaylists);
router.post('/playlists', requireAuth, playlistController.createPlaylist);
router.post('/playlists/:playlistId/items', requireAuth, playlistController.addPlaylistItem);

// === STREAM LINKING ===
// Define qual playlist toca na rádio
router.post('/streams/:id/playlists', requireAuth, requireStreamAccess, playlistController.setStreamPlaylist);

// === PLAYER (PUBLIC / TOKEN) ===
router.get('/streams/:id/manifest', manifestController.getManifest);
router.post('/streams/:id/logs', manifestController.reportExecution);

module.exports = router;
