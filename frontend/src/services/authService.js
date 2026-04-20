import axiosInstance from '../axios/axiosInstance';

/**
 * Direct API calls for auth (outside of AuthContext).
 * AuthContext handles session state; these are for one-off API calls.
 */

export const login = (credentials) =>
    axiosInstance.post('/auth/login', credentials);

export const register = (data) =>
    axiosInstance.post('/auth/signup', data);

export const logout = (refreshToken) =>
    axiosInstance.post('/auth/logout', { refreshToken });

export const refreshToken = (refreshToken) =>
    axiosInstance.post('/auth/refresh-token', { refreshToken });

export const forgotPassword = (email) =>
    axiosInstance.post('/auth/forgot-password', { email });

export const resetPassword = (token, password) =>
    axiosInstance.post('/auth/reset-password', { token, password });

export const verifyEmail = (token) =>
    axiosInstance.post('/auth/verify-email', { token });

export const resendVerification = (email) =>
    axiosInstance.post('/auth/resend-verification', { email });

export const getMe = () =>
    axiosInstance.get('/auth/me');