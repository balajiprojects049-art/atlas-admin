import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getAllProducts, deleteProduct } from '../services/cafeteriaService';
import { BASE_URL } from '../services/api';

const CafeteriaProducts = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [availableFilter, setAvailableFilter] = useState('');

    const categories = ['Beverages', 'Snacks', 'Meals', 'Supplements', 'Others'];

    useEffect(() => {
        fetchProducts();
    }, [categoryFilter, availableFilter]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const filters = {
                category: categoryFilter,
                available: availableFilter,
                search: searchTerm
            };
            console.log('🔍 Fetching products with filters:', filters);
            const data = await getAllProducts(filters);
            console.log('📦 Products received:', data);
            console.log('📊 Products count:', data.length);
            setProducts(data);
        } catch (error) {
            console.error('❌ Error fetching products:', error);
            console.error('Error response:', error.response);
            toast.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProducts();
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                await deleteProduct(id);
                toast.success('Product deleted successfully');
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
                toast.error('Failed to delete product');
            }
        }
    };

    const getImageUrl = (images) => {
        if (!images || images.length === 0) return '/placeholder-product.png';
        const imageUrl = images[0];
        return imageUrl.startsWith('http') || imageUrl.startsWith('data:') ? imageUrl : `${BASE_URL}${imageUrl}`;
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
                    className="px-6 py-3 font-medium border-b-2 border-accent text-accent"
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
                    className="px-6 py-3 font-medium border-b-2 border-transparent text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
                >
                    Orders
                </Link>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
                        Cafeteria Products
                    </h1>
                    <p className="text-light-text-muted dark:text-dark-text-muted mt-1">
                        Manage your cafeteria product inventory
                    </p>
                </div>
                <Link
                    to="/cafeteria/products/add"
                    className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium"
                >
                    + Add Product
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg p-6 shadow-sm">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-light-bg-accent dark:border-dark-bg-accent bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                    <div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-light-bg-accent dark:border-dark-bg-accent bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <select
                            value={availableFilter}
                            onChange={(e) => setAvailableFilter(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-light-bg-accent dark:border-dark-bg-accent bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                            <option value="">All Status</option>
                            <option value="true">Available</option>
                            <option value="false">Unavailable</option>
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

            {/* Products Grid */}
            {products.length === 0 ? (
                <div className="text-center py-12 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
                    <p className="text-light-text-muted dark:text-dark-text-muted text-lg">
                        No products found. Add your first product to get started!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                            {/* Product Image */}
                            <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                                <img
                                    src={getImageUrl(product.images)}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = '/placeholder-product.png';
                                    }}
                                />
                                {!product.isAvailable && (
                                    <div className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                                        Unavailable
                                    </div>
                                )}
                                {product.stock <= 0 && product.isAvailable && (
                                    <div className="absolute top-2 right-2 px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                                        Out of Stock
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="p-4">
                                <div className="mb-2">
                                    <span className="text-xs font-semibold text-accent uppercase">
                                        {product.category}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                                    {product.name}
                                </h3>
                                <p className="text-sm text-light-text-muted dark:text-dark-text-muted mb-3 line-clamp-2">
                                    {product.description || 'No description'}
                                </p>
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <p className="text-2xl font-bold text-accent">
                                            ₹{product.price.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
                                            + {product.gstRate}% GST
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
                                            Stock: {product.stock}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/cafeteria/products/edit/${product.id}`)}
                                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id, product.name)}
                                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CafeteriaProducts;
