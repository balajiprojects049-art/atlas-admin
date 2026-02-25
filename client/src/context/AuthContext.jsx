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

    // On mount: restore session from localStorage
    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
                setUser(parsedUser);
                setLoading(false);
                // Quietly verify token is still valid in background
                authAPI.getCurrentUser()
                    .then(res => {
                        if (res.data?.user) {
                            setUser(res.data.user);
                            localStorage.setItem('user', JSON.stringify(res.data.user));
                        }
                    })
                    .catch(() => {
                        // Token expired or invalid — log out silently
                        _clearSession();
                    });
            } catch {
                _clearSession();
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    const _clearSession = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const login = async (email, password) => {
        try {
            const response = await authAPI.login({ email, password });
            const { token, user } = response.data;

            // Persist to localStorage (survives page refresh)
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            // Set axios default header
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setUser(user);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed',
            };
        }
    };

    const logout = () => {
        _clearSession();
    };

    const value = {
        user,
        token: localStorage.getItem('token'),
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN' || user?.role === 'admin',
        isStaff: user?.role === 'STAFF' || user?.role === 'staff' || user?.role === 'ADMIN' || user?.role === 'admin',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
