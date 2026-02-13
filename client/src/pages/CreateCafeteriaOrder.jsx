import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getAllProducts } from '../services/cafeteriaService';
import { createOrder } from '../services/cafeteriaService';

const CreateCafeteriaOrder = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [customerInfo, setCustomerInfo] = useState({
        customerName: '',
        customerPhone: '',
        customerId: ''
    });
    const [discount, setDiscount] = useState(0);
    const [discountType, setDiscountType] = useState('AMOUNT');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await getAllProducts({ available: 'true' });
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to fetch products');
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
                gstRate: product.gstRate,
                quantity: 1
            }]);
        }
        toast.success(`${product.name} added to cart`);
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            setCart(cart.map(item =>
                item.productId === productId
                    ? { ...item, quantity: newQuantity }
                    : item
            ));
        }
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.productId !== productId));
    };

    const calculateTotals = () => {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        let discountAmount = 0;
        if (discount > 0) {
            if (discountType === 'PERCENTAGE') {
                discountAmount = (subtotal * discount) / 100;
            } else {
                discountAmount = discount;
            }
        }

        const discountedSubtotal = subtotal - discountAmount;
        const gstAmount = (discountedSubtotal * 18) / 100;
        const cgst = gstAmount / 2;
        const sgst = gstAmount / 2;
        const total = discountedSubtotal + gstAmount;

        return { subtotal, discountAmount, discountedSubtotal, gstAmount, cgst, sgst, total };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!customerInfo.customerName || !customerInfo.customerPhone) {
            toast.error('Please enter customer details');
            return;
        }

        if (cart.length === 0) {
            toast.error('Please add items to cart');
            return;
        }

        try {
            setLoading(true);

            const orderData = {
                customerName: customerInfo.customerName,
                customerPhone: customerInfo.customerPhone,
                customerId: customerInfo.customerId || null,
                items: cart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                })),
                discount: discountType === 'PERCENTAGE' ? discount : calculateTotals().discountAmount,
                discountType,
                paymentMethod
            };

            const order = await createOrder(orderData);
            toast.success('Order created successfully');
            navigate(`/cafeteria/orders/${order.id}`);
        } catch (error) {
            console.error('Error creating order:', error);
            toast.error('Failed to create order');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totals = calculateTotals();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
                    Create Order
                </h1>
                <p className="text-light-text-muted dark:text-dark-text-muted mt-1">
                    Create a new cafeteria order
                </p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Customer Info & Products */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer Information */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg p-6 shadow-sm"
                    >
                        <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                            Customer Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                                    Customer Name *
                                </label>
                                <input
                                    type="text"
                                    value={customerInfo.customerName}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, customerName: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-light-bg-accent dark:border-dark-bg-accent bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                                    placeholder="Enter customer name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    value={customerInfo.customerPhone}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, customerPhone: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-light-bg-accent dark:border-dark-bg-accent bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                                    placeholder="Enter phone number"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Product Selection */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg p-6 shadow-sm"
                    >
                        <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                            Select Products
                        </h2>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-light-bg-accent dark:border-dark-bg-accent bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent mb-4"
                        />
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                            {filteredProducts.map(product => (
                                <div
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className="p-4 border border-light-bg-accent dark:border-dark-bg-accent rounded-lg cursor-pointer hover:bg-light-bg-accent dark:hover:bg-dark-bg-accent transition-colors"
                                >
                                    <h3 className="font-semibold text-light-text-primary dark:text-dark-text-primary text-sm mb-1">
                                        {product.name}
                                    </h3>
                                    <p className="text-accent font-bold">₹{product.price.toFixed(2)}</p>
                                    <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
                                        Stock: {product.stock}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Right Column - Cart & Summary */}
                <div className="space-y-6">
                    {/* Cart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg p-6 shadow-sm"
                    >
                        <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                            Cart ({cart.length})
                        </h2>
                        {cart.length === 0 ? (
                            <p className="text-light-text-muted dark:text-dark-text-muted text-center py-4">
                                No items in cart
                            </p>
                        ) : (
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {cart.map(item => (
                                    <div key={item.productId} className="flex justify-between items-center p-3 bg-light-bg-accent dark:bg-dark-bg-accent rounded-lg">
                                        <div className="flex-1">
                                            <p className="font-semibold text-light-text-primary dark:text-dark-text-primary text-sm">
                                                {item.name}
                                            </p>
                                            <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
                                                ₹{item.price} × {item.quantity}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                className="w-6 h-6 bg-red-500 text-white rounded flex items-center justify-center"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center font-semibold text-light-text-primary dark:text-dark-text-primary">
                                                {item.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                className="w-6 h-6 bg-green-500 text-white rounded flex items-center justify-center"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Discount */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg p-6 shadow-sm"
                    >
                        <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                            Discount
                        </h2>
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={discount}
                                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                    min="0"
                                    step="0.01"
                                    className="flex-1 px-4 py-2 rounded-lg border border-light-bg-accent dark:border-dark-bg-accent bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                                    placeholder="0"
                                />
                                <select
                                    value={discountType}
                                    onChange={(e) => setDiscountType(e.target.value)}
                                    className="px-4 py-2 rounded-lg border border-light-bg-accent dark:border-dark-bg-accent bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                                >
                                    <option value="AMOUNT">₹</option>
                                    <option value="PERCENTAGE">%</option>
                                </select>
                            </div>
                        </div>
                    </motion.div>

                    {/* Order Summary */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg p-6 shadow-sm"
                    >
                        <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                            Order Summary
                        </h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-light-text-muted dark:text-dark-text-muted">Subtotal:</span>
                                <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                                    ₹{totals.subtotal.toFixed(2)}
                                </span>
                            </div>
                            {totals.discountAmount > 0 && (
                                <div className="flex justify-between text-red-500">
                                    <span>Discount:</span>
                                    <span>-₹{totals.discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-light-text-muted dark:text-dark-text-muted">CGST (9%):</span>
                                <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                                    ₹{totals.cgst.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-light-text-muted dark:text-dark-text-muted">SGST (9%):</span>
                                <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                                    ₹{totals.sgst.toFixed(2)}
                                </span>
                            </div>
                            <div className="border-t border-light-bg-accent dark:border-dark-bg-accent pt-2 mt-2">
                                <div className="flex justify-between text-lg font-bold">
                                    <span className="text-light-text-primary dark:text-dark-text-primary">Total:</span>
                                    <span className="text-accent">₹{totals.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                                Payment Method
                            </label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-light-bg-accent dark:border-dark-bg-accent bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                            >
                                <option value="Cash">Cash</option>
                                <option value="UPI">UPI</option>
                                <option value="Card">Card</option>
                            </select>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || cart.length === 0}
                            className="w-full mt-4 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating Order...' : 'Create Order'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/cafeteria/orders')}
                            className="w-full mt-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                    </motion.div>
                </div>
            </form>
        </div>
    );
};

export default CreateCafeteriaOrder;
