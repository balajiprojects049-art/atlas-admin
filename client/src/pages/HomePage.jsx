import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="flex flex-col items-center">
                    {/* Logo - assuming it's in public folder as gym_logo.png based on previous context */}
                    <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center mb-6 p-2 overflow-hidden">
                        <img src="/gym_logo.png" alt="Logo" className="h-full w-full object-contain" />
                    </div>

                    <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
                        Atlas Fitness <span className="text-red-600">Elite</span>
                    </h1>
                    <p className="text-lg text-gray-400 font-medium uppercase tracking-widest mb-6">
                        Billing & Management System
                    </p>

                    <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full border border-gray-700">
                        <p className="text-gray-300 mb-6 leading-relaxed">
                            Welcome to the official administrative portal for Atlas Fitness Elite.
                            This system is for authorized personnel only to manage members, billing, and inventory.
                        </p>

                        <Link
                            to="/login"
                            className="w-full flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-base font-semibold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all transform hover:scale-105"
                        >
                            Login to Dashboard
                        </Link>
                    </div>
                </div>

                <footer className="mt-12 text-sm text-gray-600">
                    <p>&copy; {new Date().getFullYear()} Atlas Fitness Elite. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
};

export default HomePage;
