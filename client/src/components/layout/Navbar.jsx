import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = ({ toggleSidebar }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-30 bg-light-bg-primary dark:bg-dark-bg-secondary border-b border-light-bg-accent dark:border-dark-bg-accent backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
            <div className="flex items-center justify-between px-6 py-4">
                {/* Left: Menu Button */}
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden p-2 rounded-lg hover:bg-light-bg-accent dark:hover:bg-dark-bg-accent transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Center: Search (placeholder) */}
                <div className="flex-1 max-w-lg mx-4 hidden md:block">
                    <input
                        type="text"
                        placeholder="Search members, invoices..."
                        className="w-full px-4 py-2 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-accent border border-light-bg-accent dark:border-dark-bg-accent focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                    />
                </div>

                {/* Right: Theme Toggle & User Menu */}
                <div className="flex items-center gap-4">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg hover:bg-light-bg-accent dark:hover:bg-dark-bg-accent transition-colors"
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {theme === 'dark' ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                            </svg>
                        )}
                    </button>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-light-bg-accent dark:hover:bg-dark-bg-accent transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-semibold">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                                    {user?.name}
                                </p>
                                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary capitalize">
                                    {user?.role}
                                </p>
                            </div>
                        </button>

                        {/* Dropdown */}
                        {showDropdown && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowDropdown(false)}
                                />
                                <div className="absolute right-0 mt-2 w-48 bg-light-bg-primary dark:bg-dark-bg-secondary rounded-lg shadow-premium border border-light-bg-accent dark:border-dark-bg-accent z-20">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-3 text-sm text-danger hover:bg-light-bg-accent dark:hover:bg-dark-bg-accent rounded-lg transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
