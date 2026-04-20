const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const { verifyToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

const ADMIN_ROLES = ['superAdmin', 'subAdmin', 'staff', 'helpSupport', 'contentManager', 'accountant'];

router.use(verifyToken);
router.use(authorizeRoles(...ADMIN_ROLES));

router.get('/dashboard', ctrl.getDashboardStats);

router.get('/users', ctrl.getUsers);
router.patch('/users/:id', ctrl.updateUser);

router.get('/providers', ctrl.getProviders);
router.patch('/providers/:id/verify', ctrl.verifyProvider);

router.get('/disputes', ctrl.getDisputes);
router.get('/payments', ctrl.getPayments);

router.get('/ads', ctrl.getAds);
router.post('/ads', ctrl.createAd);
router.patch('/ads/:id', ctrl.updateAd);
router.delete('/ads/:id', ctrl.deleteAd);

module.exports = router;
