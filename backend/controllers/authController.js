const { StatusCodes } = require('http-status-codes');
const { userService, tokenService, authService, emailService } = require('../services');
const { Token } = require('../models');
const { tokenTypes } = require('../config/tokens');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

/** POST /api/auth/signup */
const register = catchAsync(async (req, res) => {
    const user = await userService.createUser(req.body);
    const tokens = await tokenService.generateAuthToken(user);

    // Send verification email (non-blocking)
    try {
        const verifyToken = await tokenService.generateVerifyEmailToken(user.id);
        await emailService.sendVerificationEmail(user, verifyToken);
    } catch (emailErr) {
        console.warn('[Auth] Failed to send verification email:', emailErr.message);
    }

    res.status(StatusCodes.CREATED).send({
        user: sanitizeUser(user),
        tokens,
        message: 'Registration successful. Please check your email to verify your account.',
    });
});

/** POST /api/auth/login */
const login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Email and password are required');
    }
    const user = await authService.loginUserWithEmailAndPassword(email, password);
    const tokens = await tokenService.generateAuthToken(user);

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    res.status(StatusCodes.OK).send({
        user: sanitizeUser(user),
        tokens,
    });
});

/** POST /api/auth/refresh-token */
const refreshToken = catchAsync(async (req, res) => {
    const { refreshToken: rToken } = req.body;
    if (!rToken) throw new ApiError(StatusCodes.BAD_REQUEST, 'Refresh token required');

    const tokenDoc = await Token.findOne({
        token: rToken,
        type: tokenTypes.REFRESH,
        blacklisted: false,
    });
    if (!tokenDoc) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid refresh token');

    // Check expiry
    if (new Date(tokenDoc.expires) < new Date()) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Refresh token has expired. Please log in again.');
    }

    const user = await userService.getUserById(tokenDoc.user);
    if (!user || !user.isActive) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not found or deactivated');
    }

    // Rotate: blacklist old refresh token
    tokenDoc.blacklisted = true;
    await tokenDoc.save();

    const tokens = await tokenService.generateAuthToken(user);
    res.status(StatusCodes.OK).send({ tokens });
});

/** POST /api/auth/logout */
const logout = catchAsync(async (req, res) => {
    const { refreshToken: rToken } = req.body;
    if (rToken) {
        await Token.findOneAndUpdate(
            { token: rToken, type: tokenTypes.REFRESH },
            { blacklisted: true }
        );
    }
    res.status(StatusCodes.NO_CONTENT).send();
});

/** POST /api/auth/forgot-password */
const forgotPassword = catchAsync(async (req, res) => {
    const { email } = req.body;
    if (!email) throw new ApiError(StatusCodes.BAD_REQUEST, 'Email is required');

    const user = await userService.getUserByEmail(email);
    // Always respond 200 to prevent email enumeration
    if (user) {
        try {
            const resetToken = await tokenService.generateResetPasswordToken(user.id);
            await emailService.sendPasswordResetEmail(user, resetToken);
        } catch (err) {
            console.warn('[Auth] Failed to send password reset email:', err.message);
        }
    }

    res.status(StatusCodes.OK).send({
        message: 'If that email is registered, a password reset link has been sent.',
    });
});

/** POST /api/auth/reset-password */
const resetPassword = catchAsync(async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Token and new password are required');
    }

    const tokenDoc = await tokenService.verifyOpaqueToken(token, tokenTypes.RESET_PASSWORD);
    const user = await userService.getUserById(tokenDoc.user);
    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');

    user.password = password;
    await user.save();

    // Invalidate reset token and all refresh tokens for this user
    await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
    await Token.deleteMany({ user: user.id, type: tokenTypes.REFRESH });

    res.status(StatusCodes.OK).send({ message: 'Password reset successfully. Please log in again.' });
});

/** POST /api/auth/verify-email */
const verifyEmail = catchAsync(async (req, res) => {
    const { token } = req.body;
    if (!token) throw new ApiError(StatusCodes.BAD_REQUEST, 'Verification token required');

    const tokenDoc = await tokenService.verifyOpaqueToken(token, tokenTypes.VERIFY_EMAIL);
    const user = await userService.getUserById(tokenDoc.user);
    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');

    user.isVerified = true;
    await user.save({ validateBeforeSave: false });

    await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });

    // Send welcome email (non-blocking)
    emailService.sendWelcomeEmail(user).catch((e) => console.warn('[Auth] Welcome email error:', e.message));

    res.status(StatusCodes.OK).send({ message: 'Email verified successfully!' });
});

/** POST /api/auth/resend-verification */
const resendVerification = catchAsync(async (req, res) => {
    const { email } = req.body;
    if (!email) throw new ApiError(StatusCodes.BAD_REQUEST, 'Email required');

    const user = await userService.getUserByEmail(email);
    if (user && !user.isVerified) {
        const verifyToken = await tokenService.generateVerifyEmailToken(user.id);
        await emailService.sendVerificationEmail(user, verifyToken);
    }

    res.status(StatusCodes.OK).send({
        message: 'If your email is registered and unverified, a new verification link has been sent.',
    });
});

/** GET /api/auth/me — get current user */
const getMe = catchAsync(async (req, res) => {
    res.status(StatusCodes.OK).send({ user: sanitizeUser(req.user) });
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sanitizeUser(user) {
    const obj = user.toObject ? user.toObject() : { ...user };
    delete obj.password;
    delete obj.passwordResetToken;
    delete obj.passwordResetExpires;
    delete obj.__v;
    return obj;
}

module.exports = {
    register,
    login,
    logout,
    refreshToken,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    getMe,
};