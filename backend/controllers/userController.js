const { StatusCodes } = require('http-status-codes');
const { User } = require('../models');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

/** GET /api/users/me */
const getMe = catchAsync(async (req, res) => {
    res.status(StatusCodes.OK).json({ user: sanitize(req.user) });
});

/** PUT /api/users/me */
const updateMe = catchAsync(async (req, res) => {
    const forbidden = ['password', 'role', 'isVerified', 'isActive', 'email'];
    forbidden.forEach((f) => delete req.body[f]);

    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
        new: true,
        runValidators: true,
    });
    res.status(StatusCodes.OK).json({ user: sanitize(user) });
});

/** POST /api/users/me/change-password */
const changePassword = catchAsync(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Current and new password required');
    }
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.isPasswordMatch(currentPassword))) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Current password is incorrect');
    }
    if (newPassword.length < 8 || !/\d/.test(newPassword) || !/[a-zA-Z]/.test(newPassword)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'New password must be 8+ chars with letters and numbers');
    }
    user.password = newPassword;
    await user.save();
    res.status(StatusCodes.OK).json({ message: 'Password updated successfully' });
});

/** GET /api/users/:id/profile — public limited profile */
const getUserPublicProfile = catchAsync(async (req, res) => {
    const user = await User.findById(req.params.id).select('name photo bio address.city address.state');
    if (!user || !user.isActive) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    res.status(StatusCodes.OK).json({ user });
});

/** PATCH /api/users/me/avatar */
const updateAvatar = catchAsync(async (req, res) => {
    if (!req.file) throw new ApiError(StatusCodes.BAD_REQUEST, 'No file uploaded');
    const photoUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user.id, { photo: photoUrl }, { new: true });
    res.status(StatusCodes.OK).json({ photo: photoUrl, user: sanitize(user) });
});

/** GET /api/users/me/notifications */
const getNotifications = catchAsync(async (req, res) => {
    const { Notification } = require('../models');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const notifications = await Notification.find({ recipient: req.user.id })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    const unreadCount = await Notification.countDocuments({ recipient: req.user.id, isRead: false });
    res.status(StatusCodes.OK).json({ notifications, unreadCount, page });
});

/** PATCH /api/users/me/notifications/read-all */
const markAllNotificationsRead = catchAsync(async (req, res) => {
    const { Notification } = require('../models');
    await Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true, readAt: new Date() });
    res.status(StatusCodes.OK).json({ message: 'All notifications marked as read' });
});

function sanitize(user) {
    const obj = user.toObject ? user.toObject() : { ...user };
    delete obj.password;
    delete obj.passwordResetToken;
    delete obj.passwordResetExpires;
    delete obj.__v;
    return obj;
}

module.exports = { getMe, updateMe, changePassword, getUserPublicProfile, updateAvatar, getNotifications, markAllNotificationsRead };
