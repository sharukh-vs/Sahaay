const express = require('express');
const router = express.Router();
const dCtrl = require('../controllers/disputeController');
const fCtrl = require('../controllers/feedbackController');
const tCtrl = require('../controllers/ticketController');
const { verifyToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

router.use(verifyToken);

// Disputes
router.post('/disputes', dCtrl.createDispute);
router.get('/disputes', dCtrl.getDisputes);
router.get('/disputes/:id', dCtrl.getDisputeById);
router.patch('/disputes/:id/comment', dCtrl.addComment);
router.patch('/disputes/:id/resolve', authorizeRoles('superAdmin', 'subAdmin', 'staff', 'helpSupport'), dCtrl.resolveDispute);

// Feedback
router.post('/feedback', authorizeRoles('user'), fCtrl.createFeedback);
router.get('/feedback/me', fCtrl.getMyFeedback);
router.get('/feedback/provider/:providerId', fCtrl.getProviderFeedback);
router.patch('/feedback/:id/respond', authorizeRoles('serviceProvider'), fCtrl.providerRespond);

// Support Tickets
router.post('/tickets', tCtrl.createTicket);
router.get('/tickets', tCtrl.getTickets);
router.get('/tickets/:id', tCtrl.getTicketById);
router.post('/tickets/:id/messages', tCtrl.addMessage);
router.patch('/tickets/:id/status', tCtrl.updateTicketStatus);

module.exports = router;
