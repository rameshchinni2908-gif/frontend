import axios from 'axios';
import {
    clearAuthSession,
    getAccessToken,
    persistAuthSession
} from '../utils/authStorage';

const api = axios.create({
    baseURL:
        'http://localhost:5000/api',
    withCredentials: true
});

export const getApiError = (error) => {
    const payload = error?.response?.data;

    return {
        code: payload?.code || 'UNKNOWN_ERROR',
        message: payload?.message || payload?.msg || error?.message || 'Something went wrong.',
        details: payload?.details || [],
        requestId: payload?.requestId || null
    };
};

export const getApiErrorMessage = (error) => getApiError(error).message;

let refreshPromise;

const refreshAccessToken = async () => {
    const response = await api.post('/auth/refresh-token', undefined, {
        skipAuthRefresh: true
    });

    persistAuthSession({
        user: response.data.user,
        accessToken: response.data.accessToken
    });

    return response.data.accessToken;
};

api.interceptors.request.use(
    config => {
        const token = getAccessToken();

        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    }
);

api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config || {};
        const status = error?.response?.status;

        if (
            status !== 401 ||
            originalRequest._retry ||
            originalRequest.skipAuthRefresh ||
            originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/forgot-password') ||
            originalRequest.url?.includes('/auth/reset-password')
        ) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            refreshPromise = refreshPromise || refreshAccessToken();
            const newAccessToken = await refreshPromise;
            refreshPromise = null;

            originalRequest.headers = {
                ...(originalRequest.headers || {}),
                Authorization: `Bearer ${newAccessToken}`
            };

            return api(originalRequest);
        } catch (refreshError) {
            refreshPromise = null;
            clearAuthSession();
            return Promise.reject(refreshError);
        }
    }
);

export default api;