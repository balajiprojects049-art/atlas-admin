import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { createProduct } from '../services/cafeteriaService';

const AddCafeteriaProduct = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'Beverages',
        price: '',
        gstRate: '0',
        stock: '0',
        isAvailable: true
    });

    const categories = ['Beverages', 'Snacks', 'Meals', 'Supplements', 'Others'];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        if (images.length + files.length > 10) {
            toast.error('Maximum 10 images allowed');
            return;
        }

        // Add new images
        setImages(prev => [...prev, ...files]);

        // Create previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.price) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);

            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('category', formData.category);
            data.append('price', formData.price);
            data.append('gstRate', formData.gstRate);
            data.append('stock', formData.stock);
            data.append('isAvailable', formData.isAvailable);

            // Append all images
            images.forEach(image => {
                data.append('images', image);
            });

            await createProduct(data);
            toast.success('Product created successfully');
            navigate('/cafeteria/products');
        } catch (error) {
            console.error('Error creating product:', error);
            toast.error('Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg shadow-sm p-6"
            >
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
                        Add New Product
                    </h1>
                    <p className="text-light-text-muted dark:text-dark-text-muted mt-1">
                        Add a new product to your cafeteria inventory
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Product Images */}
                    <div>
                        <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                            Product Images (Max 10)
                        </label>

                        {/* Image Previews */}
                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-lg border-2 border-light-bg-accent dark:border-dark-bg-accent"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Upload Button */}
                        {images.length < 10 && (
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-light-bg-accent dark:border-dark-bg-accent rounded-lg cursor-pointer hover:bg-light-bg-accent dark:hover:bg-dark-bg-accent transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg className="w-8 h-8 mb-2 text-light-text-muted dark:text-dark-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                        </svg>
                                        <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
                                            PNG, JPG, GIF, WEBP (MAX. 5MB each)
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                    />
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Product Name */}
                    <div>
                        <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                            Product Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-light-bg-accent dark:border-dark-bg-accent bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                            placeholder="Enter product name"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-2 rounded-lg border border-light-bg-accent dark:border-dark-bg-accent bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                            placeholder="Enter product description"
                        />
                    </div>

                    {/* Category and Price */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                                Category *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 rounded-lg border border-light-bg-accent dark:border-dark-bg-accent bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                                Price (₹) *
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-2 rounded-lg border border-light-bg-accent dark:border-dark-bg-accent bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* GST Rate and Stock */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                                GST Rate (%) <span className="text-light-text-muted dark:text-dark-text-muted text-xs">(Optional)</span>
                            </label>
                            <input
                                type="number"
                                name="gstRate"
                                value={formData.gstRate}
                                onChange={handleChange}
                                min="0"
                                max="100"
                                step="0.01"
                                className="w-full px-4 py-2 rounded-lg border border-light-bg-accent dark:border-dark-bg-accent bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                                Stock Quantity
                            </label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-4 py-2 rounded-lg border border-light-bg-accent dark:border-dark-bg-accent bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                        </div>
                    </div>

                    {/* Availability */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="isAvailable"
                            checked={formData.isAvailable}
                            onChange={handleChange}
                            className="w-4 h-4 text-accent bg-light-bg-primary dark:bg-dark-bg-primary border-light-bg-accent dark:border-dark-bg-accent rounded focus:ring-accent"
                        />
                        <label className="ml-2 text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                            Product is available for sale
                        </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Product'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/cafeteria/products')}
                            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default AddCafeteriaProduct;
