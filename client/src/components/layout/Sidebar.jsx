import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const { isAdmin, isStaff } = useAuth();

    const navigation = [
        {
            name: 'Dashboard',
            path: '/dashboard',
            icon: '📊',
            allowedRoles: ['admin', 'staff', 'trainer'],
        },
        {
            name: 'Members',
            path: '/members',
            icon: '👥',
            allowedRoles: ['admin', 'staff', 'trainer'],
        },
        {
            name: 'Billing & Invoices',
            path: '/invoices',
            icon: '🧾',
            allowedRoles: ['admin', 'staff'],
        },
        {
            name: 'Reports',
            path: '/reports',
            icon: '📈',
            allowedRoles: ['admin', 'staff', 'trainer'],
        },
        {
            name: 'Settings',
            path: '/settings',
            icon: '⚙️',
            allowedRoles: ['admin'],
        },
    ];

    const filteredNav = navigation.filter(item => {
        if (isAdmin) return true;
        if (isStaff && item.allowedRoles.includes('staff')) return true;
        return item.allowedRoles.includes('trainer');
    });

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ x: isOpen ? 0 : -280 }}
                className={`
          fixed top-0 left-0 z-50 h-full w-72
          bg-light-bg-secondary dark:bg-dark-bg-secondary
          border-r border-light-bg-accent dark:border-dark-bg-accent
          flex flex-col
          transition-transform duration-300
          lg:!translate-x-0
        `}
            >
                {/* Logo/Brand */}
                <div className="p-6 border-b border-light-bg-accent dark:border-dark-bg-accent">
                    <h1 className="text-2xl font-bold text-accent">GymBill Pro</h1>
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                        Billing & Management
                    </p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 overflow-y-auto">
                    <ul className="space-y-2">
                        {filteredNav.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg
                      transition-all duration-200
                      ${isActive
                                                ? 'bg-accent text-white shadow-lg'
                                                : 'text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-accent dark:hover:bg-dark-bg-accent'
                                            }
                    `}
                                    >
                                        <span className="text-xl">{item.icon}</span>
                                        <span className="font-medium">{item.name}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-light-bg-accent dark:border-dark-bg-accent">
                    <p className="text-xs text-center text-light-text-muted dark:text-dark-text-muted">
                        © 2026 GymBill Pro
                    </p>
                </div>
            </motion.aside>
        </>
    );
};

export default Sidebar;
