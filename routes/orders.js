const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { dbRun, dbAll, dbGet } = require('../db');

// @route   POST /api/orders
// @desc    Place a new order
// @access  Private (Requires Token)
router.post('/', protect, async (req, res) => {
    const { shippingAddress, paymentMethod, items } = req.body;

    if (!shippingAddress || !paymentMethod || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Order details are incomplete.' });
    }

    try {
        let totalPrice = 0;
        const verifiedItems = [];

        // Verify product existence and stocks
        for (const item of items) {
            const product = await dbGet('SELECT * FROM products WHERE id = ?', [item.productId]);
            if (!product) {
                return res.status(404).json({ message: `Product not found: ID ${item.productId}` });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for: ${product.name}. Available: ${product.stock}` });
            }

            totalPrice += product.price * item.quantity;
            verifiedItems.push({
                productId: product.id,
                quantity: item.quantity,
                price: product.price
            });
        }

        // Insert Order into orders table
        const orderResult = await dbRun(
            'INSERT INTO orders (user_id, shipping_address, payment_method, total_amount, status) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, shippingAddress, paymentMethod, totalPrice, 'processing']
        );

        const orderId = orderResult.lastID;

        // Insert items into order_items and update product stock
        for (const item of verifiedItems) {
            await dbRun(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.productId, item.quantity, item.price]
            );

            await dbRun(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.productId]
            );
        }

        res.status(201).json({
            message: 'Order placed successfully.',
            orderId,
            totalPrice
        });
    } catch (err) {
        console.error('Error placing order:', err);
        res.status(500).json({ message: 'Server error placing order.' });
    }
});

// @route   GET /api/orders/my-orders
// @desc    Get order history for current logged-in user
// @access  Private (Requires Token)
router.get('/my-orders', protect, async (req, res) => {
    try {
        // Fetch all orders for the user
        const orders = await dbAll('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
        
        // Fetch items for each order
        const ordersWithItems = [];
        for (const order of orders) {
            const items = await dbAll(
                `SELECT oi.*, p.name as product_name, p.image_url 
                 FROM order_items oi
                 JOIN products p ON oi.product_id = p.id
                 WHERE oi.order_id = ?`,
                [order.id]
            );
            ordersWithItems.push({
                ...order,
                items
            });
        }

        res.json(ordersWithItems);
    } catch (err) {
        console.error('Error fetching user orders:', err);
        res.status(500).json({ message: 'Server error retrieving order history.' });
    }
});

module.exports = router;
