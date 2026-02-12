import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

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
    create: (data) => api.post('/members', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    update: (id, data) => api.put(`/members/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    delete: (id) => api.delete(`/members/${id}`),
};

// Invoice APIs
export const invoiceAPI = {
    getAll: (params) => api.get('/invoices', { params }),
    getById: (id) => api.get(`/invoices/${id}`),
    create: (data) => api.post('/invoices', data),
    update: (id, data) => api.put(`/invoices/${id}`, data),
    delete: (id) => api.delete(`/invoices/${id}`),
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

export default api;
