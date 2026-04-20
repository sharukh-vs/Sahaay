const { DateTime } = require('luxon');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Token } = require('../models');
const { tokenTypes } = require('../config/tokens');

const saveToken = async (token, userId, tokenType, expireDate, blacklisted = false) => {
    return Token.create({ token, user: userId, type: tokenType, expires: expireDate, blacklisted });
};

const generateToken = (userId, expires, secret = process.env.ACCESS_TOKEN_SECRET) => {
    const payload = {
        sub: userId,
        iat: Math.floor(DateTime.now().toSeconds()),
        exp: Math.floor(expires.toSeconds()),
    };
    return jwt.sign(payload, secret);
};

const generateAuthToken = async (user) => {
    const accessTokenExpiresInMinutes = Number(process.env.ACCESS_TOKEN_EXPIRES) || 30;
    const accessTokenExpires = DateTime.now().plus({ minutes: accessTokenExpiresInMinutes });
    const accessToken = generateToken(user.id, accessTokenExpires);

    const refreshTokenExpiresInDays = Number(process.env.REFRESH_TOKEN_EXPIRES) || 15;
    const refreshTokenExpires = DateTime.now().plus({ days: refreshTokenExpiresInDays });
    const refreshToken = generateToken(user.id, refreshTokenExpires);
    await saveToken(refreshToken, user.id, tokenTypes.REFRESH, refreshTokenExpires);

    return {
        access: {
            token: accessToken,
            expires: accessTokenExpires.toISO({ includeOffset: false }),
        },
        refresh: {
            token: refreshToken,
            expires: refreshTokenExpires.toISO({ includeOffset: false }),
        },
    };
};

/** Generate a cryptographically random hex token for email/password resets */
const generateOpaqueToken = () => crypto.randomBytes(32).toString('hex');

/**
 * Generate and save a reset-password token (1 hour expiry).
 */
const generateResetPasswordToken = async (userId) => {
    // Invalidate previous reset tokens for this user
    await Token.deleteMany({ user: userId, type: tokenTypes.RESET_PASSWORD });

    const token = generateOpaqueToken();
    const expires = DateTime.now().plus({ hours: 1 });
    await saveToken(token, userId, tokenTypes.RESET_PASSWORD, expires);
    return token;
};

/**
 * Generate and save an email-verification token (24 hour expiry).
 */
const generateVerifyEmailToken = async (userId) => {
    await Token.deleteMany({ user: userId, type: tokenTypes.VERIFY_EMAIL });

    const token = generateOpaqueToken();
    const expires = DateTime.now().plus({ hours: 24 });
    await saveToken(token, userId, tokenTypes.VERIFY_EMAIL, expires);
    return token;
};

/**
 * Verify and return a token document; throws if invalid or expired.
 */
const verifyOpaqueToken = async (token, type) => {
    const tokenDoc = await Token.findOne({ token, type, blacklisted: false });
    if (!tokenDoc) throw new Error('Invalid or expired token');
    if (DateTime.fromJSDate(tokenDoc.expires) < DateTime.now()) {
        await tokenDoc.deleteOne();
        throw new Error('Token has expired');
    }
    return tokenDoc;
};

module.exports = {
    generateAuthToken,
    generateResetPasswordToken,
    generateVerifyEmailToken,
    verifyOpaqueToken,
};