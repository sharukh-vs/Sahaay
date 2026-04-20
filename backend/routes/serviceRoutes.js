const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/serviceController');
const { verifyToken } = require('../middleware/auth');
const { authorize, authorizeRoles } = require('../middleware/authorize');

// Public routes
router.get('/', ctrl.getServices);
router.get('/categories', ctrl.getCategories);
router.get('/providers/search', ctrl.searchProviders);
router.get('/providers/:id', ctrl.getProviderProfile);
router.get('/:id', ctrl.getServiceById);

// Provider-only routes
router.post('/', verifyToken, authorizeRoles('serviceProvider'), ctrl.createService);
router.put('/:id', verifyToken, authorizeRoles('serviceProvider'), ctrl.updateService);
router.patch('/:id/status', verifyToken, authorizeRoles('serviceProvider', 'superAdmin', 'subAdmin'), ctrl.updateServiceStatus);
router.delete('/:id', verifyToken, authorizeRoles('serviceProvider'), ctrl.deleteService);

module.exports = router;
