import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getAllOrders, deleteOrder } from '../services/cafeteriaService';

const CafeteriaOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const filters = {
                status: statusFilter,
                search: searchTerm
            };
            const data = await getAllOrders(filters);
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchOrders();
    };

    const handleDelete = async (id, orderNumber) => {
        if (window.confirm(`Are you sure you want to delete order ${orderNumber}?`)) {
            try {
                await deleteOrder(id);
                toast.success('Order deleted successfully');
                fetchOrders();
            } catch (error) {
                console.error('Error deleting order:', error);
                toast.error('Failed to delete order');
            }
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            PAID: 'bg-green-500',
            PENDING: 'bg-yellow-500',
            OVERDUE: 'bg-red-500',
            PARTIAL: 'bg-orange-500'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${styles[status]}`}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
                        Cafeteria Orders
                    </h1>
                    <p className="text-light-text-muted dark:text-dark-text-muted mt-1">
                        Manage cafeteria orders and invoices
                    </p>
                </div>
                <Link
                    to="/cafeteria/orders/create"
                    className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium"
                >
                    + Create Order
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg p-6 shadow-sm">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Search by order number, customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-light-bg-accent dark:border-dark-bg-accent bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-light-bg-accent dark:border-dark-bg-accent bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                            <option value="">All Status</option>
                            <option value="PAID">Paid</option>
                            <option value="PENDING">Pending</option>
                            <option value="OVERDUE">Overdue</option>
                            <option value="PARTIAL">Partial</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Orders Table */}
            {orders.length === 0 ? (
                <div className="text-center py-12 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
                    <p className="text-light-text-muted dark:text-dark-text-muted text-lg">
                        No orders found. Create your first order to get started!
                    </p>
                </div>
            ) : (
                <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-light-bg-accent dark:bg-dark-bg-accent">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider">
                                        Order #
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider">
                                        Items
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-light-bg-accent dark:divide-dark-bg-accent">
                                {orders.map((order) => (
                                    <motion.tr
                                        key={order.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-light-bg-accent dark:hover:bg-dark-bg-accent transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-accent">
                                                {order.orderNumber}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-light-text-primary dark:text-dark-text-primary">
                                                {order.customerName}
                                            </div>
                                            <div className="text-xs text-light-text-muted dark:text-dark-text-muted">
                                                {order.customerPhone}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-light-text-primary dark:text-dark-text-primary">
                                                {order.items?.length || 0} items
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
                                                ₹{order.totalAmount.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(order.paymentStatus)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-light-text-muted dark:text-dark-text-muted">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => navigate(`/cafeteria/orders/${order.id}`)}
                                                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(order.id, order.orderNumber)}
                                                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CafeteriaOrders;
