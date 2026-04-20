const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/requestController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);
router.get('/open', ctrl.getOpenRequests);
router.post('/', ctrl.createRequest);
router.get('/', ctrl.getRequests);
router.get('/:id', ctrl.getRequestById);
router.put('/:id', ctrl.updateRequest);
router.patch('/:id/status', ctrl.updateRequestStatus);
router.delete('/:id', ctrl.deleteRequest);

module.exports = router;
