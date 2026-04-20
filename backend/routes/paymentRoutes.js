const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);
router.post('/initiate', ctrl.initiatePayment);
router.post('/verify', ctrl.verifyPayment);
router.get('/history', ctrl.getPaymentHistory);

// Subscriptions sub-routes
router.get('/subscriptions/plans', ctrl.getSubscriptionPlans);
router.post('/subscriptions', ctrl.createSubscription);
router.get('/subscriptions/me', ctrl.getMySubscription);

module.exports = router;
