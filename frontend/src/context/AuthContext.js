import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../axios/axiosInstance';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const TOKEN_KEY = 'sahaay_access_token';
const REFRESH_KEY = 'sahaay_refresh_token';
const USER_KEY = 'sahaay_user';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem(USER_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });
    const [accessToken, setAccessToken] = useState(() => localStorage.getItem(TOKEN_KEY));
    const [loading, setLoading] = useState(true);

    // ── Helpers ──────────────────────────────────────────────────────────────

    const persistSession = useCallback((userData, tokens) => {
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        localStorage.setItem(TOKEN_KEY, tokens.access.token);
        if (tokens.refresh?.token) {
            localStorage.setItem(REFRESH_KEY, tokens.refresh.token);
        }
        setUser(userData);
        setAccessToken(tokens.access.token);
    }, []);

    const clearSession = useCallback(() => {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
        setUser(null);
        setAccessToken(null);
    }, []);

    // ── Auth Actions ─────────────────────────────────────────────────────────

    const login = useCallback(async (email, password) => {
        const res = await axiosInstance.post('/auth/login', { email, password });
        persistSession(res.data.user, res.data.tokens);
        return res.data;
    }, [persistSession]);

    const register = useCallback(async (formData) => {
        const res = await axiosInstance.post('/auth/signup', formData);
        persistSession(res.data.user, res.data.tokens);
        return res.data;
    }, [persistSession]);

    const logout = useCallback(async () => {
        const refreshToken = localStorage.getItem(REFRESH_KEY);
        try {
            await axiosInstance.post('/auth/logout', { refreshToken });
        } catch {
            // Ignore logout errors
        }
        clearSession();
        toast.success('Logged out successfully');
    }, [clearSession]);

    const refreshTokens = useCallback(async () => {
        const refreshToken = localStorage.getItem(REFRESH_KEY);
        if (!refreshToken) {
            clearSession();
            return null;
        }
        try {
            const res = await axiosInstance.post('/auth/refresh-token', { refreshToken });
            const newTokens = res.data.tokens;
            localStorage.setItem(TOKEN_KEY, newTokens.access.token);
            if (newTokens.refresh?.token) {
                localStorage.setItem(REFRESH_KEY, newTokens.refresh.token);
            }
            setAccessToken(newTokens.access.token);
            return newTokens.access.token;
        } catch {
            clearSession();
            return null;
        }
    }, [clearSession]);

    const updateUser = useCallback((updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    }, []);

    // ── Verify session on mount ───────────────────────────────────────────────

    useEffect(() => {
        const verifySession = async () => {
            const token = localStorage.getItem(TOKEN_KEY);
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const res = await axiosInstance.get('/auth/me');
                setUser(res.data.user);
                localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
            } catch {
                // Token might be expired — try refresh
                const newToken = await refreshTokens();
                if (newToken) {
                    try {
                        const res = await axiosInstance.get('/auth/me');
                        setUser(res.data.user);
                        localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
                    } catch {
                        clearSession();
                    }
                }
            } finally {
                setLoading(false);
            }
        };
        verifySession();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Role Helpers ──────────────────────────────────────────────────────────

    const isRole = useCallback((...roles) => {
        return roles.includes(user?.role);
    }, [user]);

    const isAdmin = useCallback(() => {
        return ['superAdmin', 'subAdmin', 'contentManager', 'contentCreator',
                'staff', 'helpSupport', 'accountant', 'inventoryManager', 'hrManager']
            .includes(user?.role);
    }, [user]);

    const isProvider = useCallback(() => user?.role === 'serviceProvider', [user]);
    const isUser = useCallback(() => user?.role === 'user', [user]);

    const value = {
        user,
        accessToken,
        loading,
        isAuthenticated: !!user,
        isAdmin,
        isProvider,
        isUser,
        isRole,
        login,
        register,
        logout,
        refreshTokens,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export default AuthContext;
