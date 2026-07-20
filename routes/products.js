const express = require('express');
const router = express.Router();
const { dbAll, dbGet } = require('../db');

// @route   GET /api/products
// @desc    Get products with searching, filtering, and sorting
router.get('/', async (req, res) => {
    try {
        const { search, category, priceMin, priceMax, rating, sort, limit } = req.query;

        let query = 'SELECT * FROM products WHERE 1=1';
        const params = [];

        // Search filter
        if (search) {
            query += ' AND (name LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        // Category filter (can be comma-separated or single)
        if (category) {
            const categories = category.split(',');
            const placeholders = categories.map(() => '?').join(',');
            query += ` AND category IN (${placeholders})`;
            params.push(...categories);
        }

        // Price range filters
        if (priceMin) {
            query += ' AND price >= ?';
            params.push(parseFloat(priceMin));
        }
        if (priceMax) {
            query += ' AND price <= ?';
            params.push(parseFloat(priceMax));
        }

        // Rating filter (e.g. 4 stars and up)
        if (rating && rating !== 'all') {
            query += ' AND rating >= ?';
            params.push(parseFloat(rating));
        }

        // Sorting
        if (sort) {
            if (sort === 'price-asc') {
                query += ' ORDER BY price ASC';
            } else if (sort === 'price-desc') {
                query += ' ORDER BY price DESC';
            } else if (sort === 'newest') {
                query += ' ORDER BY created_at DESC';
            } else {
                // Default / featured (we can sort by rating or order created)
                query += ' ORDER BY rating DESC';
            }
        } else {
            query += ' ORDER BY rating DESC';
        }

        if (limit) {
            query += ' LIMIT ?';
            params.push(parseInt(limit));
        }
        const products = await dbAll(query, params);
        res.json({ products, total: products.length });
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ message: 'Server error fetching products.' });
    }
});

// @route   GET /api/products/featured
// @desc    Get top rated featured products
router.get('/featured', async (req, res) => {
    try {
        // Just return top 4 rated products
        const products = await dbAll('SELECT * FROM products ORDER BY rating DESC LIMIT 4');
        res.json(products);
    } catch (err) {
        console.error('Error fetching featured products:', err);
        res.status(500).json({ message: 'Server error fetching featured products.' });
    }
});

// @route   GET /api/products/:id
// @desc    Get a single product details by id
router.get('/:id', async (req, res) => {
    try {
        const product = await dbGet('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        res.json(product);
    } catch (err) {
        console.error('Error fetching product details:', err);
        res.status(500).json({ message: 'Server error fetching product.' });
    }
});

module.exports = router;
