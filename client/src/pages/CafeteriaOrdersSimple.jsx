import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getAllOrders, getAllProducts, createOrder, deleteOrder } from '../services/cafeteriaService';
import { Eye, Trash2 } from 'lucide-react';

const CafeteriaOrdersSimple = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showCart, setShowCart] = useState(false);

    // Cart state
    const [cart, setCart] = useState([]);
    const [customerInfo, setCustomerInfo] = useState({
        customerName: '',
        customerPhone: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [discount, setDiscount] = useState(0);

    useEffect(() => {
        fetchOrders();
        fetchProducts();
    }, [statusFilter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const filters = { status: statusFilter, search: searchTerm };
            const data = await getAllOrders(filters);
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const data = await getAllProducts({ available: 'true' });
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const addToCart = (product) => {
        const existing = cart.find(item => item.productId === product.id);
        if (existing) {
            setCart(cart.map(item =>
                item.productId === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, {
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            }]);
        }
        setShowCart(true);
        toast.success(`${product.name} added to cart`);
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            setCart(cart.filter(item => item.productId !== productId));
        } else {
            setCart(cart.map(item =>
                item.productId === productId
                    ? { ...item, quantity: newQuantity }
                    : item
            ));
        }
    };

    const calculateTotal = () => {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountedSubtotal = subtotal - discount;
        const gst = (discountedSubtotal * 18) / 100;
        return discountedSubtotal + gst;
    };

    const handleCreateOrder = async () => {
        if (!customerInfo.customerName || !customerInfo.customerPhone) {
            toast.error('Please enter customer details');
            return;
        }
        if (cart.length === 0) {
            toast.error('Please add items to cart');
            return;
        }

        try {
            const orderData = {
                customerName: customerInfo.customerName,
                customerPhone: customerInfo.customerPhone,
                items: cart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                })),
                discount,
                discountType: 'AMOUNT',
                paymentMethod
            };

            const order = await createOrder(orderData);
            toast.success('Order created successfully');

            // Reset cart and customer info
            setCart([]);
            setCustomerInfo({ customerName: '', customerPhone: '' });
            setDiscount(0);
            setShowCart(false);

            // Refresh orders
            fetchOrders();

            // Navigate to invoice
            navigate(`/cafeteria/orders/${order.id}`);
        } catch (error) {
            console.error('Error creating order:', error);
            toast.error('Failed to create order');
        }
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
            {/* Navigation Tabs */}
            <div className="flex gap-4 border-b border-light-bg-accent dark:border-dark-bg-accent">
                <Link
                    to="/cafeteria/products"
                    className="px-6 py-3 font-medium border-b-2 border-transparent text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
                >
                    Products
                </Link>
                <Link
                    to="/cafeteria/create-order"
                    className="px-6 py-3 font-medium border-b-2 border-transparent text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
                >
                    Create Order
                </Link>
                <Link
                    to="/cafeteria/orders"
                    className="px-6 py-3 font-medium border-b-2 border-accent text-accent"
                >
                    Orders
                </Link>
            </div>

            {/* Orders List */}
            <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                    Recent Orders
                </h2>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-light-bg-accent dark:border-dark-bg-accent bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-light-bg-accent dark:border-dark-bg-accent bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary"
                    >
                        <option value="">All Status</option>
                        <option value="PAID">Paid</option>
                        <option value="PENDING">Pending</option>
                    </select>
                    <button
                        onClick={fetchOrders}
                        className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                    >
                        Search
                    </button>
                </div>

                {/* Orders Table */}
                {orders.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-light-text-muted dark:text-dark-text-muted">
                            No orders found. Create your first order to get started!
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-light-bg-accent dark:border-dark-bg-accent">
                                    <th className="text-left py-3 px-4 text-light-text-primary dark:text-dark-text-primary">Order #</th>
                                    <th className="text-left py-3 px-4 text-light-text-primary dark:text-dark-text-primary">Customer</th>
                                    <th className="text-left py-3 px-4 text-light-text-primary dark:text-dark-text-primary">Total</th>
                                    <th className="text-left py-3 px-4 text-light-text-primary dark:text-dark-text-primary">Payment</th>
                                    <th className="text-left py-3 px-4 text-light-text-primary dark:text-dark-text-primary">Status</th>
                                    <th className="text-left py-3 px-4 text-light-text-primary dark:text-dark-text-primary">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id} className="border-b border-light-bg-accent dark:border-dark-bg-accent hover:bg-light-bg-accent dark:hover:bg-dark-bg-accent">
                                        <td className="py-3 px-4 text-light-text-primary dark:text-dark-text-primary font-mono text-sm">
                                            {order.orderNumber}
                                        </td>
                                        <td className="py-3 px-4 text-light-text-primary dark:text-dark-text-primary">
                                            {order.customerName}
                                        </td>
                                        <td className="py-3 px-4 text-accent font-bold">
                                            ₹{order.totalAmount.toFixed(2)}
                                        </td>
                                        <td className="py-3 px-4 text-light-text-muted dark:text-dark-text-muted text-sm">
                                            {order.paymentMethod}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.paymentStatus === 'PAID'
                                                ? 'bg-green-500 text-white'
                                                : 'bg-orange-500 text-white'
                                                }`}>
                                                {order.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => navigate(`/cafeteria/orders/${order.id}`)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toast((t) => (
                                                            <div className="flex flex-col gap-3 min-w-[200px]">
                                                                <p className="font-medium text-sm text-gray-800">
                                                                    Are you sure you want to delete this order?
                                                                </p>
                                                                <div className="flex gap-2 justify-end">
                                                                    <button
                                                                        onClick={() => toast.dismiss(t.id)}
                                                                        className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            toast.dismiss(t.id);
                                                                            deleteOrder(order.id)
                                                                                .then(() => {
                                                                                    toast.success('Order deleted successfully');
                                                                                    fetchOrders();
                                                                                })
                                                                                .catch((error) => {
                                                                                    console.error('Error deleting order:', error);
                                                                                    toast.error('Failed to delete order: ' + (error.response?.data?.error || error.message));
                                                                                });
                                                                        }}
                                                                        className="px-3 py-1.5 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ), {
                                                            duration: 8000,
                                                            position: 'top-center',
                                                            style: {
                                                                background: '#fff',
                                                                padding: '16px',
                                                                borderRadius: '8px',
                                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                                            },
                                                        });
                                                    }}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Delete Order"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div >
    );
};

export default CafeteriaOrdersSimple;
