import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
    baseURL: API_BASE,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('sahaay_access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return axiosInstance(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('sahaay_refresh_token');
            if (!refreshToken) {
                isRefreshing = false;
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                const res = await axios.post(`${API_BASE}/auth/refresh-token`, { refreshToken });
                const newToken = res.data.tokens.access.token;
                localStorage.setItem('sahaay_access_token', newToken);
                if (res.data.tokens.refresh?.token) {
                    localStorage.setItem('sahaay_refresh_token', res.data.tokens.refresh.token);
                }
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                processQueue(null, newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;