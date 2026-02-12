import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { StatCard } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { PaymentStatusBadge } from '../components/ui/Badge';
import { analyticsAPI, invoiceAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentInvoices, setRecentInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch real dashboard data
            const [statsResponse, invoicesResponse] = await Promise.all([
                analyticsAPI.getDashboard(),
                invoiceAPI.getAll({ limit: 5 })
            ]);

            if (statsResponse.data.success) {
                setStats(statsResponse.data.stats || {});
            }

            if (invoicesResponse.data.success) {
                setRecentInvoices(invoicesResponse.data.invoices || []);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // toast.error('Failed to load dashboard data'); // Silently fail or show warning
        } finally {
            setLoading(false);
        }
    };

    const invoiceColumns = [
        {
            header: 'Invoice #',
            accessor: 'invoiceNumber',
        },
        {
            header: 'Member',
            render: (row) => row.member?.name || 'Unknown',
        },
        {
            header: 'Amount',
            render: (row) => formatCurrency(row.amount),
        },
        {
            header: 'Due Date',
            render: (row) => formatDate(row.dueDate),
        },
        {
            header: 'Status',
            render: (row) => <PaymentStatusBadge status={row.paymentStatus} />,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
                    Dashboard
                </h1>
                <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
                    Welcome back! Here's what's happening with your gym today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <StatCard
                        title="Total Revenue"
                        value={formatCurrency(stats?.totalRevenue || 0)}
                        trend={stats?.revenueGrowth}
                        color="success"
                    />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <StatCard
                        title="Active Members"
                        value={stats?.activeMembers || 0}
                        trend={stats?.membersGrowth}
                        color="info"
                    />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <StatCard
                        title="Today's Collections"
                        value={formatCurrency(stats?.todayCollections || 0)}
                        color="accent"
                    />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <StatCard
                        title="Overdue Payments"
                        value={stats?.overduePayments || 0}
                        color="danger"
                    />
                </motion.div>
            </div>

            {/* Recent Invoices */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="card"
            >
                <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                    Recent Transactions
                </h2>
                <Table
                    columns={invoiceColumns}
                    data={recentInvoices}
                    loading={loading}
                    emptyMessage="No recent invoices"
                />
            </motion.div>
        </div>
    );
};

export default Dashboard;
