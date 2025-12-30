
const express = require('express');
const router = express.Router();
const adRequestController = require('../controllers/adRequestController');
const { requireAuth, requireStreamAccess } = require('../middleware/authMiddleware');

router.post('/ad-requests', requireAuth, requireStreamAccess, adRequestController.createRequest);
router.post('/ad-requests/ai-review', requireAuth, adRequestController.reviewScript);
router.get('/ad-requests/:streamId', requireAuth, requireStreamAccess, adRequestController.listRequests);

module.exports = router;
