// Build timestamp: 2026-02-12T20:47:55 - Force rebuild
import axios from 'axios';

// Production-safe API URL configuration
// In production (Vercel), always use /api
// In development, use environment variable or localhost
const API_URL = import.meta.env.PROD
    ? '/api'
    : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

console.log('🔧 API Configuration:', {
    mode: import.meta.env.MODE,
    isProd: import.meta.env.PROD,
    apiUrl: API_URL
});

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth APIs
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    logout: () => api.post('/auth/logout'),
    getCurrentUser: () => api.get('/auth/me'),
};

// Member APIs
export const memberAPI = {
    getAll: (params) => api.get('/members', { params }),
    getById: (id) => api.get(`/members/${id}`),
    create: (data) => {
        const config = data instanceof FormData
            ? { headers: { 'Content-Type': 'multipart/form-data' } }
            : {};
        return api.post('/members', data, config);
    },
    update: (id, data) => {
        const config = data instanceof FormData
            ? { headers: { 'Content-Type': 'multipart/form-data' } }
            : {};
        return api.put(`/members/${id}`, data, config);
    },
    delete: (id) => api.delete(`/members/${id}`),
};

// Invoice APIs
export const invoiceAPI = {
    getAll: (params) => api.get('/invoices', { params }),
    getById: (id) => api.get(`/invoices/${id}`),
    create: (data) => api.post('/invoices', data),
    update: (id, data) => api.put(`/invoices/${id}`, data),
    delete: (id) => api.delete(`/invoices/${id}`),
    downloadPDF: (id) => api.get(`/invoices/${id}/download`, { responseType: 'blob' }),
};

// Payment APIs
export const paymentAPI = {
    createOrder: (invoiceId) => api.post('/payments/create', { invoiceId }),
    verifyPayment: (data) => api.post('/payments/verify', data),
    getHistory: (memberId) => api.get(`/payments/history/${memberId}`),
};

// Analytics APIs
export const analyticsAPI = {
    getDashboard: () => api.get('/analytics/dashboard'),
    getRevenue: (params) => api.get('/analytics/revenue', { params }),
    getMembers: (params) => api.get('/analytics/members', { params }),
    exportCSV: () => api.get('/analytics/export/csv', { responseType: 'blob' }),
    exportPDF: () => api.get('/analytics/export/pdf', { responseType: 'blob' }),
};

// Settings APIs
export const settingsAPI = {
    get: () => api.get('/settings'),
    update: (data) => api.put('/settings', data),
    uploadLogo: (file) => {
        const formData = new FormData();
        formData.append('logo', file);
        return api.post('/settings/logo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

// Plan APIs
export const planAPI = {
    getAll: (params) => api.get('/plans', { params }),
    getById: (id) => api.get(`/plans/${id}`),
};

export default api;
