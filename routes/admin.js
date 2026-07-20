const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { dbRun, dbAll, dbGet } = require('../db');

// Middleware to check for Admin role
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
    }
};

// Apply protection to all admin routes
router.use(protect);
router.use(adminOnly);

// @route   GET /api/admin/stats
// @desc    Get dashboard summary statistics
router.get('/stats', async (req, res) => {
    try {
        const sales = await dbGet('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders');
        const orders = await dbGet('SELECT COUNT(*) as count FROM orders');
        const users = await dbGet('SELECT COUNT(*) as count FROM users');
        const products = await dbGet('SELECT COUNT(*) as count FROM products');

        res.json({
            total_revenue:   sales.total || 0,
            total_orders:    orders.count || 0,
            total_users:     users.count || 0,
            total_products:  products.count || 0
        });
    } catch (err) {
        console.error('Error fetching admin stats:', err);
        res.status(500).json({ message: 'Server error retrieving statistics.' });
    }
});

// @route   GET /api/admin/orders
// @desc    Get all orders with customer details (limit optional)
router.get('/orders', async (req, res) => {
    try {
        const { limit } = req.query;
        let query = `SELECT o.*, u.name as customer_name, u.email as customer_email 
             FROM orders o
             JOIN users u ON o.user_id = u.id
             ORDER BY o.created_at DESC`;
        if (limit) query += ` LIMIT ${parseInt(limit)}`;

        const orders = await dbAll(query);
        res.json(orders);
    } catch (err) {
        console.error('Error fetching admin orders:', err);
        res.status(500).json({ message: 'Server error retrieving orders.' });
    }
});

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status
router.put('/orders/:id/status', async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }
    try {
        const order = await dbGet('SELECT * FROM orders WHERE id = ?', [req.params.id]);
        if (!order) return res.status(404).json({ error: 'Order not found.' });
        await dbRun('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
        const updated = await dbGet('SELECT * FROM orders WHERE id = ?', [req.params.id]);
        res.json(updated);
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).json({ error: 'Server error updating order status.' });
    }
});

// @route   POST /api/admin/products
// @desc    Create a new product
router.post('/products', async (req, res) => {
    const { name, description, price, category, image_url, stock, rating } = req.body;

    if (!name || !price || !category) {
        return res.status(400).json({ error: 'Please provide name, price, and category.' });
    }

    try {
        const result = await dbRun(
            `INSERT INTO products (name, description, price, category, image_url, rating, stock)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                description || '',
                parseFloat(price),
                category,
                image_url || '',
                rating ? parseFloat(rating) : 0.0,
                stock !== undefined ? parseInt(stock) : 10
            ]
        );

        const newProduct = await dbGet('SELECT * FROM products WHERE id = ?', [result.lastID]);
        res.status(201).json(newProduct);
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ error: 'Server error creating product.' });
    }
});

// @route   PUT /api/admin/products/:id
// @desc    Update an existing product
router.put('/products/:id', async (req, res) => {
    const { name, description, price, category, image_url, stock, rating } = req.body;

    try {
        const product = await dbGet('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        await dbRun(
            `UPDATE products 
             SET name = ?, description = ?, price = ?, category = ?, image_url = ?, rating = ?, stock = ?
             WHERE id = ?`,
            [
                name || product.name,
                description !== undefined ? description : product.description,
                price !== undefined ? parseFloat(price) : product.price,
                category || product.category,
                image_url !== undefined ? image_url : product.image_url,
                rating !== undefined ? parseFloat(rating) : product.rating,
                stock !== undefined ? parseInt(stock) : product.stock,
                req.params.id
            ]
        );

        const updatedProduct = await dbGet('SELECT * FROM products WHERE id = ?', [req.params.id]);
        res.json(updatedProduct);
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Server error updating product.' });
    }
});

// @route   DELETE /api/admin/products/:id
// @desc    Delete a product
router.delete('/products/:id', async (req, res) => {
    try {
        const product = await dbGet('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        await dbRun('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: 'Product deleted successfully.' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ message: 'Server error deleting product.' });
    }
});

module.exports = router;
