const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(verifyToken);
router.get('/me', ctrl.getMe);
router.put('/me', ctrl.updateMe);
router.post('/me/change-password', ctrl.changePassword);
router.patch('/me/avatar', upload.single('avatar'), ctrl.updateAvatar);
router.get('/me/notifications', ctrl.getNotifications);
router.patch('/me/notifications/read-all', ctrl.markAllNotificationsRead);
router.get('/:id/profile', ctrl.getUserPublicProfile);

module.exports = router;
