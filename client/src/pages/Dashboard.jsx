import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { StatCard } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { PaymentStatusBadge } from '../components/ui/Badge';
import { analyticsAPI, invoiceAPI } from '../services/api';
import { getCafeteriaAnalytics, getAllOrders } from '../services/cafeteriaService';
import { formatCurrency, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('gym');
    const [stats, setStats] = useState(null);
    const [recentInvoices, setRecentInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    // Cafeteria State
    const [cafeteriaStats, setCafeteriaStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch gym data
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

            // Fetch cafeteria data
            const [cafeteriaStatsData, recentOrdersData] = await Promise.all([
                getCafeteriaAnalytics(),
                getAllOrders({ limit: 5 }) // Assuming getAllOrders supports limit, if not it fetches all, likely OK for now or I should check service
            ]);

            setCafeteriaStats(cafeteriaStatsData);
            setRecentOrders(recentOrdersData.slice(0, 5)); // Client side slice if API doesn't support limit

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // toast.error('Failed to load dashboard data');
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

    const cafeteriaOrderColumns = [
        {
            header: 'Order #',
            accessor: 'orderNumber',
        },
        {
            header: 'Customer',
            accessor: 'customerName',
        },
        {
            header: 'Amount',
            render: (row) => formatCurrency(row.subtotal), // Show Net Amount (Excl. GST)
        },
        {
            header: 'Time',
            render: (row) => formatDate(row.createdAt), // Assuming helper handles date
        },
        {
            header: 'Status',
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {row.paymentStatus}
                </span>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
                        Dashboard
                    </h1>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
                        Welcome back! Here's what's happening today.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg border border-light-bg-accent dark:border-dark-bg-accent">
                    <button
                        onClick={() => setActiveTab('gym')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'gym'
                            ? 'bg-accent text-white shadow-sm'
                            : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'
                            }`}
                    >
                        Gym Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('cafeteria')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'cafeteria'
                            ? 'bg-accent text-white shadow-sm'
                            : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'
                            }`}
                    >
                        Cafeteria
                    </button>
                </div>
            </div>

            {/* Content */}
            {activeTab === 'gym' ? (
                <>
                    {/* Gym Stats Grid */}
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
                            Recent Gym Transactions
                        </h2>
                        <Table
                            columns={invoiceColumns}
                            data={recentInvoices}
                            loading={loading}
                            emptyMessage="No recent invoices"
                        />
                    </motion.div>
                </>
            ) : (
                <>
                    {/* Cafeteria Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <StatCard
                                title="Cafeteria Revenue"
                                value={formatCurrency(cafeteriaStats?.totalRevenue || 0)}
                                color="success"
                            />
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <StatCard
                                title="Total Orders"
                                value={cafeteriaStats?.totalOrders || 0}
                                color="info"
                            />
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                            <StatCard
                                title="Paid Orders"
                                value={cafeteriaStats?.paidOrders || 0}
                                color="accent"
                            />
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                            <StatCard
                                title="Pending Orders"
                                value={cafeteriaStats?.pendingOrders || 0}
                                color="warning"
                            />
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Recent Cafeteria Orders */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="card lg:col-span-2"
                        >
                            <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                                Recent Cafeteria Orders
                            </h2>
                            <Table
                                columns={cafeteriaOrderColumns}
                                data={recentOrders}
                                loading={loading}
                                emptyMessage="No recent orders"
                            />
                        </motion.div>

                        {/* Top Products */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="card"
                        >
                            <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                                Top Selling Items
                            </h2>
                            <div className="space-y-4">
                                {loading ? (
                                    <p className="text-center text-sm text-gray-500">Loading...</p>
                                ) : cafeteriaStats?.topProducts?.length > 0 ? (
                                    cafeteriaStats.topProducts.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div>
                                                <p className="font-medium text-light-text-primary dark:text-dark-text-primary">
                                                    {item.productName}
                                                </p>
                                                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                                    {item.quantity} sold
                                                </p>
                                            </div>
                                            <p className="font-semibold text-accent">
                                                {formatCurrency(item.revenue)}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-sm text-gray-500">No sales data yet</p>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
