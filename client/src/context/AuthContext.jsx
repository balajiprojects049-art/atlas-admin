import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    // Configure axios defaults
    useEffect(() => {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // Fetch user data
            fetchUserData();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUserData = async () => {
        try {
            const response = await authAPI.getCurrentUser();
            setUser(response.data.user);
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await authAPI.login({ email, password });

            const { token, user } = response.data;

            localStorage.setItem('token', token);
            setToken(token);
            setUser(user);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
    };

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isStaff: user?.role === 'staff' || user?.role === 'admin',
        isTrainer: user?.role === 'trainer',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
