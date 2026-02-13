import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getOrderById } from '../services/cafeteriaService';

const CafeteriaOrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const printRef = useRef();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const data = await getOrderById(id);
            setOrder(data);
        } catch (error) {
            console.error('Error fetching order:', error);
            toast.error('Failed to fetch order details');
            navigate('/cafeteria/orders');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
        );
    }

    if (!order) {
        return null;
    }

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

    return (
        <div className="space-y-6">
            {/* Header - Print Hidden */}
            <div className="print:hidden flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
                        Order Details
                    </h1>
                    <p className="text-light-text-muted dark:text-dark-text-muted mt-1">
                        Order #{order.orderNumber}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                        Print Invoice
                    </button>
                    <button
                        onClick={() => navigate('/cafeteria/orders')}
                        className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                    >
                        Back to Orders
                    </button>
                </div>
            </div>

            {/* Invoice */}
            <motion.div
                ref={printRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-sm p-8 print:shadow-none"
            >
                {/* Invoice Header */}
                <div className="border-b-2 border-gray-300 pb-6 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tighter">
                                <span className="text-gray-900 dark:text-white">Atlas Fitness</span>
                                <span className="text-red-600 ml-1.5">Elite</span>
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Cafeteria Invoice</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-accent">{order.orderNumber}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                            <div className="mt-2 print:hidden">
                                {getStatusBadge(order.paymentStatus)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer Information */}
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Customer Information</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{order.customerName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{order.customerPhone}</p>
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Order Items</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100 dark:bg-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                                        Item
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                                        Price
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                                        Qty
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                                        GST
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                                        Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {order.items.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-3 text-gray-900 dark:text-white">
                                            {item.productName}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                                            ₹{item.price.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-900 dark:text-white">
                                            {item.quantity}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                                            {item.gstRate}%
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                                            ₹{item.amount.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                    <div className="w-full md:w-1/2 lg:w-1/3">
                        <div className="space-y-2">
                            <div className="flex justify-between text-gray-700 dark:text-gray-300">
                                <span>Subtotal:</span>
                                <span className="font-semibold">₹{order.subtotal.toFixed(2)}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-red-600">
                                    <span>Discount:</span>
                                    <span>-₹{order.discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-gray-700 dark:text-gray-300">
                                <span>CGST (9%):</span>
                                <span className="font-semibold">₹{order.cgst.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-700 dark:text-gray-300">
                                <span>SGST (9%):</span>
                                <span className="font-semibold">₹{order.sgst.toFixed(2)}</span>
                            </div>
                            <div className="border-t-2 border-gray-300 pt-2 mt-2">
                                <div className="flex justify-between text-xl font-bold">
                                    <span className="text-gray-900 dark:text-white">Total:</span>
                                    <span className="text-accent">₹{order.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Information */}
                <div className="mt-6 pt-6 border-t border-gray-300">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Payment Method</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {order.paymentMethod || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Payment Status</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {order.paymentStatus}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-300 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Thank you for your purchase!
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        © 2026 Atlas Fitness Elite - Cafeteria
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default CafeteriaOrderDetails;
