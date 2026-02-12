import React from 'react';

export const Badge = ({ children, variant = 'info', className = '' }) => {
    const variants = {
        success: 'badge-success',
        warning: 'badge-warning',
        danger: 'badge-danger',
        info: 'badge-info',
    };

    return (
        <span className={`badge ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

export const PaymentStatusBadge = ({ status }) => {
    const statusConfig = {
        paid: { variant: 'success', label: 'Paid' },
        pending: { variant: 'warning', label: 'Pending' },
        overdue: { variant: 'danger', label: 'Overdue' },
    };

    const config = statusConfig[status] || { variant: 'info', label: status };

    return (
        <Badge variant={config.variant}>
            {config.label}
        </Badge>
    );
};

export const MembershipStatusBadge = ({ status }) => {
    const statusConfig = {
        active: { variant: 'success', label: 'Active' },
        expiring: { variant: 'warning', label: 'Expiring Soon' },
        expired: { variant: 'danger', label: 'Expired' },
    };

    const config = statusConfig[status] || { variant: 'info', label: status };

    return (
        <Badge variant={config.variant}>
            {config.label}
        </Badge>
    );
};

export default Badge;
