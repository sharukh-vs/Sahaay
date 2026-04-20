const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/quotationController');
const { verifyToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

router.use(verifyToken);
router.post('/', authorizeRoles('serviceProvider'), ctrl.createQuotation);
router.get('/me', authorizeRoles('serviceProvider'), ctrl.getMyQuotations);
router.get('/my', authorizeRoles('user'), ctrl.getMyUserQuotations);
router.get('/request/:requestId', ctrl.getQuotationsByRequest);
router.patch('/:id/accept', authorizeRoles('user'), ctrl.acceptQuotation);
router.patch('/:id/reject', authorizeRoles('user'), ctrl.rejectQuotation);


module.exports = router;
