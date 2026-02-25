import axios from 'axios';

// ============================================
// PRODUCTION-SAFE API CONFIGURATION
// ============================================

/**
 * API Base URL Configuration
 * - Production (Vercel): Uses /api (relative path)
 * - Development (Local): Uses http://localhost:5000/api
 * 
 * This ensures NO localhost URLs in production builds
 */
const getApiUrl = () => {
    // Check if running in production mode (Vite sets this during build)
    if (import.meta.env.PROD) {
        return '/api';
    }

    // Development mode: use environment variable or default to localhost
    return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

export const API_URL = getApiUrl();
export const BASE_URL = API_URL.replace('/api', '');

// Debug logging (only in development)
if (import.meta.env.DEV) {
    console.log('🔧 API Configuration:', {
        mode: import.meta.env.MODE,
        isDev: import.meta.env.DEV,
        isProd: import.meta.env.PROD,
        apiUrl: API_URL,
        envApiUrl: import.meta.env.VITE_API_URL
    });
}

// Create axios instance with production-safe configuration
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000, // 60 second timeout (PDFs can take time)
});

// Request interceptor - Add JWT token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // If the response is a blob (e.g. PDF download), read it as text first
            if (error.request?.responseType === 'blob' || error.config?.responseType === 'blob') {
                // Don't redirect immediately for blob requests, just reject
                return Promise.reject(error);
            }
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ============================================
// API ENDPOINTS - Production Ready
// ============================================

export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    getCurrentUser: () => api.get('/auth/me'),
    changePassword: (data) => api.post('/auth/change-password', data),
};

export const memberAPI = {
    getAll: () => api.get('/members'),
    getById: (id) => api.get(`/members/${id}`),
    create: (data) => api.post('/members', data),
    update: (id, data) => api.put(`/members/${id}`, data),
    delete: (id) => api.delete(`/members/${id}`),
    uploadPhoto: (id, formData) => api.post(`/members/${id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export const invoiceAPI = {
    getAll: () => api.get('/invoices'),
    getById: (id) => api.get(`/invoices/${id}`),
    create: (data) => api.post('/invoices', data),
    update: (id, data) => api.put(`/invoices/${id}`, data),
    delete: (id) => api.delete(`/invoices/${id}`),
    downloadPDF: (id) => api.get(`/invoices/${id}/download`, { responseType: 'blob' }),
};

export const paymentAPI = {
    createOrder: (data) => api.post('/payments/create', data),
    verifyPayment: (data) => api.post('/payments/verify', data),
    getHistory: (memberId) => api.get(`/payments/history/${memberId}`),
    recordCashPayment: (data) => api.post('/payments/cash', data),
};

export const analyticsAPI = {
    getDashboard: () => api.get('/analytics/dashboard'),
    getRevenue: (params) => api.get('/analytics/revenue', { params }),
    getMemberStats: () => api.get('/analytics/members'),
    exportCSV: () => api.get('/analytics/export/csv', { responseType: 'blob' }),
    exportPDF: () => api.get('/analytics/export/pdf', { responseType: 'blob' }),
};

export const settingsAPI = {
    get: () => api.get('/settings'),
    update: (data) => api.put('/settings', data),
};

export const planAPI = {
    getAll: () => api.get('/plans'),
    getById: (id) => api.get(`/plans/${id}`),
    create: (data) => api.post('/plans', data),
    update: (id, data) => api.put(`/plans/${id}`, data),
    delete: (id) => api.delete(`/plans/${id}`),
};

// Export the configured axios instance
export default api;
