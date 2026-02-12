import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await login(formData.email, formData.password);

        if (result.success) {
            toast.success('Login successful!');
            navigate('/dashboard');
        } else {
            toast.error(result.message || 'Invalid credentials');
        }

        setLoading(false);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-red-500 mb-2">Atlas Fitness Elite</h1>
                        <p className="text-gray-400">Billing & Management System</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="admin@gym.com"
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            loading={loading}
                        >
                            Login
                        </Button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                        <p className="text-xs text-gray-300 mb-2 font-semibold">Demo Credentials:</p>
                        <div className="text-xs text-gray-400 space-y-1">
                            <p>Admin: admin@gym.com / admin123</p>
                            <p>Staff: staff@gym.com / staff123</p>
                            <p>Trainer: trainer@gym.com / trainer123</p>
                        </div>
                    </div>
                </div>

                <p className="text-center text-gray-500 text-xs mt-6">
                    © 2026 Atlas Fitness Elite. All rights reserved.
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
