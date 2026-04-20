const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const ApiError = require('../utils/ApiError');
const { User } = require('../models');

/**
 * Verifies the JWT access token from Authorization header.
 * Attaches the full user object to req.user.
 */
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication token required');
        }

        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                throw new ApiError(StatusCodes.UNAUTHORIZED, 'Token expired. Please log in again.');
            }
            throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token');
        }

        const user = await User.findById(decoded.sub);
        if (!user) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not found');
        }
        if (!user.isActive) {
            throw new ApiError(StatusCodes.FORBIDDEN, 'Your account has been deactivated');
        }

        req.user = user;
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = { verifyToken };
