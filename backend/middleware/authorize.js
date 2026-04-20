const { StatusCodes } = require('http-status-codes');
const { roleRights } = require('../config/roles');
const ApiError = require('../utils/ApiError');

/**
 * Role-based authorization middleware.
 *
 * Usage: authorize('manageUsers', 'getUsers')
 *   — passes if the user's role has AT LEAST ONE of the required rights.
 *
 * Usage: authorize() with no args
 *   — only checks that the user is authenticated (any role passes).
 *
 * Usage: authorizeRoles('superAdmin', 'subAdmin')
 *   — checks role name directly (for simple role guards).
 */
const authorize = (...requiredRights) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required'));
        }

        if (requiredRights.length === 0) return next(); // Any authenticated user

        const userRights = roleRights.get(req.user.role) || [];
        const hasRight = requiredRights.some((right) => userRights.includes(right));

        if (!hasRight) {
            return next(
                new ApiError(
                    StatusCodes.FORBIDDEN,
                    `You do not have permission to perform this action. Required: ${requiredRights.join(' or ')}`
                )
            );
        }
        next();
    };
};

/**
 * Direct role-name guard (use when you need exact role checks).
 * authorize() checks rights (granular), authorizeRoles() checks role names (coarse).
 */
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required'));
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(
                new ApiError(
                    StatusCodes.FORBIDDEN,
                    `Access denied. Allowed roles: ${allowedRoles.join(', ')}`
                )
            );
        }
        next();
    };
};

module.exports = { authorize, authorizeRoles };
