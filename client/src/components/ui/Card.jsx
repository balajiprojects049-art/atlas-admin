import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({ children, className = '', onClick, hover = true }) => {
    return (
        <motion.div
            className={`card ${className}`}
            onClick={onClick}
            whileHover={hover ? { y: -2 } : {}}
            transition={{ duration: 0.2 }}
        >
            {children}
        </motion.div>
    );
};

export const StatCard = ({ title, value, subtitle, trend, color = 'accent' }) => {
    const colorClasses = {
        accent: 'text-accent',
        success: 'text-success',
        warning: 'text-warning',
        danger: 'text-danger',
        info: 'text-info',
    };

    return (
        <Card className="relative overflow-hidden">
            <div className="space-y-2">
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary font-medium">
                    {title}
                </p>
                <h3 className={`text-3xl font-bold ${colorClasses[color]}`}>
                    {value}
                </h3>
                {subtitle && (
                    <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
                        {subtitle}
                    </p>
                )}
                {trend && (
                    <div className={`text-xs flex items-center gap-1 ${trend > 0 ? 'text-success' : 'text-danger'}`}>
                        <span>{trend > 0 ? '↑' : '↓'}</span>
                        <span>{Math.abs(trend)}% from last month</span>
                    </div>
                )}
            </div>
            <div className={`absolute top-0 right-0 w-20 h-20 ${colorClasses[color]} opacity-10 blur-3xl`}></div>
        </Card>
    );
};

export default Card;
