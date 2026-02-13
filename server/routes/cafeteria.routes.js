const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for multiple image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/cafeteria';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// ==================== PRODUCT ROUTES ====================

// Get all products
router.get('/products', async (req, res) => {
    try {
        const { category, available, search } = req.query;

        const where = {};
        if (category) where.category = category;
        if (available !== undefined) where.isAvailable = available === 'true';
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        const products = await prisma.cafeteriaProduct.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get single product
router.get('/products/:id', async (req, res) => {
    try {
        const product = await prisma.cafeteriaProduct.findUnique({
            where: { id: req.params.id }
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// Create product with multiple images
router.post('/products', upload.array('images', 10), async (req, res) => {
    try {
        const { name, description, category, price, gstRate, stock, isAvailable } = req.body;

        // Get uploaded image paths
        const images = req.files ? req.files.map(file => `/uploads/cafeteria/${file.filename}`) : [];

        const product = await prisma.cafeteriaProduct.create({
            data: {
                name,
                description,
                category,
                price: parseFloat(price),
                gstRate: gstRate ? parseFloat(gstRate) : 18,
                images,
                stock: stock ? parseInt(stock) : 0,
                isAvailable: isAvailable === 'true' || isAvailable === true
            }
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// Update product
router.put('/products/:id', upload.array('images', 10), async (req, res) => {
    try {
        const { name, description, category, price, gstRate, stock, isAvailable, existingImages } = req.body;

        // Parse existing images (sent as JSON string)
        let images = existingImages ? JSON.parse(existingImages) : [];

        // Add new uploaded images
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => `/uploads/cafeteria/${file.filename}`);
            images = [...images, ...newImages];
        }

        const product = await prisma.cafeteriaProduct.update({
            where: { id: req.params.id },
            data: {
                name,
                description,
                category,
                price: parseFloat(price),
                gstRate: parseFloat(gstRate),
                images,
                stock: parseInt(stock),
                isAvailable: isAvailable === 'true' || isAvailable === true
            }
        });

        res.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
    try {
        await prisma.cafeteriaProduct.delete({
            where: { id: req.params.id }
        });

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// ==================== ORDER ROUTES ====================

// Generate order number
async function generateOrderNumber() {
    const year = new Date().getFullYear();
    const lastOrder = await prisma.cafeteriaOrder.findFirst({
        where: {
            orderNumber: {
                startsWith: `CAF-${year}-`
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    let nextNumber = 1;
    if (lastOrder) {
        const lastNumber = parseInt(lastOrder.orderNumber.split('-')[2]);
        nextNumber = lastNumber + 1;
    }

    return `CAF-${year}-${String(nextNumber).padStart(4, '0')}`;
}

// Get all orders
router.get('/orders', async (req, res) => {
    try {
        const { status, search, startDate, endDate } = req.query;

        const where = {};
        if (status) where.paymentStatus = status;
        if (search) {
            where.OR = [
                { orderNumber: { contains: search, mode: 'insensitive' } },
                { customerName: { contains: search, mode: 'insensitive' } },
                { customerPhone: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }

        const orders = await prisma.cafeteriaOrder.findMany({
            where,
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Get single order
router.get('/orders/:id', async (req, res) => {
    try {
        const order = await prisma.cafeteriaOrder.findUnique({
            where: { id: req.params.id },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

// Create order
router.post('/orders', async (req, res) => {
    try {
        const { customerName, customerPhone, customerId, items, discount, discountType, paymentMethod } = req.body;

        // Calculate totals
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await prisma.cafeteriaProduct.findUnique({
                where: { id: item.productId }
            });

            if (!product) {
                return res.status(404).json({ error: `Product not found: ${item.productId}` });
            }

            const itemAmount = product.price * item.quantity;
            subtotal += itemAmount;

            orderItems.push({
                productId: product.id,
                productName: product.name,
                quantity: item.quantity,
                price: product.price,
                gstRate: product.gstRate,
                amount: itemAmount
            });
        }

        // Apply discount
        let discountAmount = 0;
        if (discount && discount > 0) {
            if (discountType === 'PERCENTAGE') {
                discountAmount = (subtotal * discount) / 100;
            } else {
                discountAmount = discount;
            }
        }

        const discountedSubtotal = subtotal - discountAmount;

        // Calculate GST (CGST + SGST = 18%)
        const gstAmount = (discountedSubtotal * 18) / 100;
        const cgst = gstAmount / 2;
        const sgst = gstAmount / 2;
        const totalAmount = discountedSubtotal + gstAmount;

        // Generate order number
        const orderNumber = await generateOrderNumber();

        // Determine payment status
        const paymentStatus = paymentMethod === 'Cash' ? 'PAID' : 'PENDING';
        const paidAmount = paymentMethod === 'Cash' ? totalAmount : 0;

        // Create order with items
        const order = await prisma.cafeteriaOrder.create({
            data: {
                orderNumber,
                customerId,
                customerName,
                customerPhone,
                subtotal,
                gstAmount,
                cgst,
                sgst,
                totalAmount,
                paidAmount,
                paymentStatus,
                paymentMethod,
                discount: discountAmount,
                discountType,
                items: {
                    create: orderItems
                }
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        res.status(201).json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Update order payment status
router.put('/orders/:id/payment', async (req, res) => {
    try {
        const { paymentStatus, paymentMethod, razorpayOrderId, razorpayPaymentId, paidAmount } = req.body;

        const order = await prisma.cafeteriaOrder.update({
            where: { id: req.params.id },
            data: {
                paymentStatus,
                paymentMethod,
                razorpayOrderId,
                razorpayPaymentId,
                paidAmount: paidAmount || 0
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        res.json(order);
    } catch (error) {
        console.error('Error updating payment:', error);
        res.status(500).json({ error: 'Failed to update payment' });
    }
});

// Delete order
router.delete('/orders/:id', async (req, res) => {
    try {
        await prisma.cafeteriaOrder.delete({
            where: { id: req.params.id }
        });

        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ error: 'Failed to delete order' });
    }
});

// ==================== ANALYTICS ROUTES ====================

// Get cafeteria analytics
router.get('/analytics', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const where = {};
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }

        // Total revenue
        const orders = await prisma.cafeteriaOrder.findMany({ where });
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const totalPaid = orders.reduce((sum, order) => sum + order.paidAmount, 0);

        // Order statistics
        const totalOrders = orders.length;
        const paidOrders = orders.filter(o => o.paymentStatus === 'PAID').length;
        const pendingOrders = orders.filter(o => o.paymentStatus === 'PENDING').length;

        // Top products
        const orderItems = await prisma.cafeteriaOrderItem.findMany({
            where: {
                order: where
            },
            include: {
                product: true
            }
        });

        const productSales = {};
        orderItems.forEach(item => {
            if (!productSales[item.productId]) {
                productSales[item.productId] = {
                    productName: item.productName,
                    quantity: 0,
                    revenue: 0
                };
            }
            productSales[item.productId].quantity += item.quantity;
            productSales[item.productId].revenue += item.amount;
        });

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        res.json({
            totalRevenue,
            totalPaid,
            totalOrders,
            paidOrders,
            pendingOrders,
            topProducts
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

module.exports = router;
