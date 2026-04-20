import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ADMIN_ROLES = [
    'superAdmin', 'subAdmin', 'contentManager', 'contentCreator',
    'staff', 'helpSupport', 'accountant', 'inventoryManager', 'hrManager',
];

/**
 * ProtectedRoute — role-aware route guard.
 *
 * @param {string|string[]} allowedRoles — if provided, user must have one of these roles.
 * @param {string} redirectTo — where to redirect if unauthorized.
 */
const ProtectedRoute = ({
    children,
    allowedRoles = null,
    redirectTo = '/login',
}) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-full border-2 border-slate-700 border-t-indigo-500 animate-spin" />
                    <p className="text-slate-400 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
    }

    if (allowedRoles) {
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        if (!roles.includes(user.role)) {
            // Redirect to the correct platform
            if (user.role === 'user') return <Navigate to="/home" replace />;
            if (user.role === 'serviceProvider') return <Navigate to="/provider/dashboard" replace />;
            if (ADMIN_ROLES.includes(user.role)) return <Navigate to="/admin/dashboard" replace />;
            return <Navigate to="/login" replace />;
        }
    }

    return children;
};

/** Redirects authenticated users away from auth pages */
export const PublicOnlyRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-slate-700 border-t-indigo-500 animate-spin" />
            </div>
        );
    }

    if (user) {
        const from = location.state?.from;
        if (from) return <Navigate to={from} replace />;

        if (user.role === 'user') return <Navigate to="/home" replace />;
        if (user.role === 'serviceProvider') return <Navigate to="/provider/dashboard" replace />;
        if (ADMIN_ROLES.includes(user.role)) return <Navigate to="/admin/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
