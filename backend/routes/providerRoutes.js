const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/providerController');
const { verifyToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');
const upload = require('../middleware/upload');

router.use(verifyToken);
router.use(authorizeRoles('serviceProvider', 'superAdmin', 'subAdmin'));

router.post('/onboard', ctrl.onboardProvider);
router.get('/dashboard', ctrl.getDashboard);
router.get('/profile', ctrl.getProviderProfile);
router.put('/profile', ctrl.updateProviderProfile);
router.patch('/profile-image', upload.single('profileImage'), ctrl.updateProfileImage);
router.patch('/availability', ctrl.updateAvailability);
router.get('/services', ctrl.getMyServices);
router.get('/requests', ctrl.getMatchedRequests);
router.get('/quotes', ctrl.getMyQuotes);
router.get('/earnings', ctrl.getEarnings);

module.exports = router;
