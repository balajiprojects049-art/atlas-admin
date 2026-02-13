import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ==================== PRODUCT API ====================

export const getAllProducts = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.available !== undefined && filters.available !== '') params.append('available', filters.available);
    if (filters.search) params.append('search', filters.search);

    console.log('🌐 API Request URL:', `${API_URL}/cafeteria/products?${params}`);
    const response = await axios.get(`${API_URL}/cafeteria/products?${params}`);
    console.log('🌐 API Response:', response.data);
    return response.data;
};

export const getProductById = async (id) => {
    const response = await axios.get(`${API_URL}/cafeteria/products/${id}`);
    return response.data;
};

export const createProduct = async (formData) => {
    const response = await axios.post(`${API_URL}/cafeteria/products`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const updateProduct = async (id, formData) => {
    const response = await axios.put(`${API_URL}/cafeteria/products/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const deleteProduct = async (id) => {
    const response = await axios.delete(`${API_URL}/cafeteria/products/${id}`);
    return response.data;
};

// ==================== ORDER API ====================

export const getAllOrders = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await axios.get(`${API_URL}/cafeteria/orders?${params}`);
    return response.data;
};

export const getOrderById = async (id) => {
    const response = await axios.get(`${API_URL}/cafeteria/orders/${id}`);
    return response.data;
};

export const createOrder = async (orderData) => {
    const response = await axios.post(`${API_URL}/cafeteria/orders`, orderData);
    return response.data;
};

export const updateOrderPayment = async (id, paymentData) => {
    const response = await axios.put(`${API_URL}/cafeteria/orders/${id}/payment`, paymentData);
    return response.data;
};

export const initiateRazorpayPayment = async (orderId) => {
    const response = await axios.post(`${API_URL}/cafeteria/orders/${orderId}/initiate-payment`);
    return response.data;
};

export const deleteOrder = async (id) => {
    const response = await axios.delete(`${API_URL}/cafeteria/orders/${id}`);
    return response.data;
};

// ==================== ANALYTICS API ====================

export const getCafeteriaAnalytics = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await axios.get(`${API_URL}/cafeteria/analytics?${params}`);
    return response.data;
};
