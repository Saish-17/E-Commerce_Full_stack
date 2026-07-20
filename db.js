const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir);
}

const dbPath = path.join(dbDir, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to SQLite database at:', dbPath);
    }
});

// Helper for wrapping db runs/gets into Promises
const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

const dbAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const initializeDatabase = async () => {
    // Enable Foreign Keys support
    await dbRun('PRAGMA foreign_keys = ON;');

    // Users table
    await dbRun(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'customer',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Products table
    await dbRun(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            category TEXT NOT NULL,
            image_url TEXT,
            rating REAL DEFAULT 0.0,
            num_reviews INTEGER DEFAULT 0,
            stock INTEGER DEFAULT 10,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Orders table
    await dbRun(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            shipping_address TEXT NOT NULL,
            payment_method TEXT NOT NULL,
            total_amount REAL NOT NULL,
            status TEXT NOT NULL DEFAULT 'processing',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Order Items table
    await dbRun(`
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
        )
    `);

    console.log('Database tables successfully verified/created.');

    // Seed default users if empty
    const userCount = await dbGet('SELECT COUNT(*) as count FROM users');
    if (userCount.count === 0) {
        console.log('Seeding default users...');
        const adminHash = await bcrypt.hash('admin123', 10);
        const customerHash = await bcrypt.hash('customer123', 10);

        await dbRun(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            ['Luxe Admin', 'admin@luxe.com', adminHash, 'admin']
        );
        await dbRun(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            ['John Doe', 'customer@luxe.com', customerHash, 'customer']
        );
        console.log('Default users seeded.');
    }

    // Seed default products if empty
    const productCount = await dbGet('SELECT COUNT(*) as count FROM products');
    if (productCount.count === 0) {
        console.log('Seeding products...');
        const defaultProducts = [
            {
                name: 'Structured Wool Coat',
                description: 'A structured minimalist double-breasted winter coat tailored from fine Italian wool. Designed for warmth and elegance.',
                price: 495.00,
                category: 'Apparel',
                image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBopCMcIbl8NLDri4YUjwvLhdFcmSFhfH6NZTPlMDpEDrVvA1NISLsmHPFqj_YjkXPKRoSdjcLTQRSsbwX7kY8AR0jGE10w2du_aKzESNfZh9Iuz4EwussZwM1cTDIeVX5oj9zJSFYL2UxBGxtyScDmQR_RvfGv1jt4g4X1-nDoT37rrZwYkuWnKQ3KCt1BHoe0EMGN-BuVeT44VRlwJvmg9XngLnD5PsSNUKzHmgGf_xF4krvIKSLyUA',
                rating: 4.8,
                num_reviews: 124,
                count_in_stock: 15
            },
            {
                name: 'Classic Leather Tote',
                description: 'Crafted from full-grain Italian leather, this versatile tote offers uncompromised durability and a minimalist silhouette perfect for the modern professional. Features a spacious interior and subtle silver-tone hardware.',
                price: 350.00,
                category: 'Accessories',
                image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTAAvXrrbWnGBqngI3hFTqvMmq8b1lo8-zDM5NQjVvwe0Z-KEsMh9rk1OOSroMIm52WNXSGV_ckBoEap5qxqkpzzkvbRGO80BETj-U0s_v7InW4wAqJYbYaGuE9acdyWJmb26GfAvqdikuMudjB6slaqxo6kBbcaigpSPMt_N9m7Hd2P6zLm35VR89iEoPxu8sVkfCuUwmVmjoBM4S921nwmJrLhK23hLiO8O7dLsEmP7zh9Z1K1zWcw',
                rating: 5.0,
                num_reviews: 89,
                count_in_stock: 22
            },
            {
                name: 'Minimalist Sneaker',
                description: 'Clean-cut leather sneakers featuring a vulcanized rubber sole and soft calfskin lining. An everyday essential.',
                price: 185.00,
                category: 'Footwear',
                image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGuLtWIx5_Y0sZ4tsFzl1Z9Cd_3O-uNs_gxEmAkLE5obU_llOOsEcXhTJBXg09KF_2xHtb_FeeyO5sKv5oEmaunlRmW3bLlEjwgpTTEiqzLpfQopmacesFSh2bKujf9TAndzDceakvXdHpU04DV1Rlf3KMQ8T9L7FcZxFL0ssGqfzNY6efyWUcpEgkXGSt6QpEHCSs6Rx8seoeexxdDjqrWgS7scpTxFHfk63Ee-6x288lhmD62jWJmw',
                rating: 4.5,
                num_reviews: 210,
                count_in_stock: 8
            },
            {
                name: 'Cashmere Blend Turtleneck',
                description: 'A luxurious knit sweater spun from a blend of premium cashmere and organic wool. Features a relaxed mock neck.',
                price: 220.00,
                category: 'Apparel',
                image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAndKFvsjQn1RWFYzTQ4yvFWkC_8B3GxbG80fiMJkZTtK6Q9FsgtchvpVCHqU9M4Z2ScQuOm9S0TZIpc-Wl_diaL69H07Kd_pbEsHudv5jB-Yjhade2lEudbP8wQh6jArQGukI3hxtnzjeNT7ivjxe-utd-6T_1WLTaFDe36ssxxYB1Walj2t4NAtyOBiXZAI2t7y614inj4ebVeC3YxrA3Hy_8b_20nUPoG0AGQt4xehocmEQ-xOBeaQ',
                rating: 4.9,
                num_reviews: 56,
                count_in_stock: 12
            },
            {
                name: 'Tailored Linen Blazer',
                description: 'A lightweight summer blazer crafted from 100% Belgian linen. Slim-fit silhouette with natural horn buttons.',
                price: 295.00,
                category: 'Apparel',
                image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpQ2HnqW6pYl97COvKjsbg_JO-_QQvscllGhGBn0koaq6gfDN4en4AQTxXXlJ9Vij9FcRbZJUsljQLpbCIPczegllEEaxUR4Rk0StwakANP0NCSaNqTrPLnpPY7eYNkl3CdrbD7rO31s5wjE33nZ3wQuADrWEXLMUhNg6m-eW4f2JZypxhtyBq2LFqRkl7aKCxDulpb4pZ7Qu5RkbsljYvgMWVMm0mUDw9yg35EitJyPGAOT8rZ8mfug',
                rating: 4.6,
                num_reviews: 42,
                count_in_stock: 6
            },
            {
                name: 'Leather Cardholder',
                description: 'Sleek, low-profile leather cardholder with 4 slots and a center cash compartment. Hand-painted edges.',
                price: 75.00,
                category: 'Accessories',
                image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaVbkT_N6pwbpNg-byKA8IN0eG9UDXQ0aM3Ey7i4NMOU0Bbp-pk2uRE_YtUKAcm16WvSraoWTPyUvdP_j9sYH7hpYzHW5Gg8Xxmzg9qlvUrBO3nzfjfpzO7Rx5RKfsSapybAfYjf_P5UcrXfn-RtpAtf-zpeX9Xv2o_4Jx3skKr2st79zkOUJp-YEbkHtoESRItzIIva7PhBK9rFMih69nABtXKPZt6sTAG2YjSWygeccSHjXdqs_GVw',
                rating: 4.7,
                num_reviews: 73,
                count_in_stock: 30
            },
            {
                name: 'Suede Chelsea Boots',
                description: 'Classic Chelsea boot profile crafted in Spain from premium calf suede. Features elastic side gussets and pull tabs.',
                price: 320.00,
                category: 'Footwear',
                image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAI0Yo2pZpO7iLGOEA9Hzl7cYOjg82MH6F6u_Dks6bcLe6OoxFsSyhOBIO5zsKZHZPSudsPOiv09DCpi8o8eaWla6WijEh-Y103PWzsNohPc8qDaKOWCDbZ5c7vljUir_s6fVhi40O0T5omd_WPDqSWISdcocrRDFO8a14dtTjIk96zy7iQLlnsb7XuCZwr3EH77GJ4QFYa79Vk5GMtR_45wFj99OLfXz_rIzxWRDgL7mrwpdC8GvBGrA',
                rating: 4.8,
                num_reviews: 65,
                count_in_stock: 14
            },
            {
                name: 'Minimalist Chronograph',
                description: 'A modern wrist watch featuring a clean white face, high-quality Japanese quartz movement, and a tan leather strap.',
                price: 250.00,
                category: 'Accessories',
                image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaVbkT_N6pwbpNg-byKA8IN0eG9UDXQ0aM3Ey7i4NMOU0Bbp-pk2uRE_YtUKAcm16WvSraoWTPyUvdP_j9sYH7hpYzHW5Gg8Xxmzg9qlvUrBO3nzfjfpzO7Rx5RKfsSapybAfYjf_P5UcrXfn-RtpAtf-zpeX9Xv2o_4Jx3skKr2st79zkOUJp-YEbkHtoESRItzIIva7PhBK9rFMih69nABtXKPZt6sTAG2YjSWygeccSHjXdqs_GVw',
                rating: 4.4,
                num_reviews: 18,
                count_in_stock: 5
            }
        ];

        for (const p of defaultProducts) {
            await dbRun(
                `INSERT INTO products (name, description, price, category, image_url, rating, num_reviews, stock)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [p.name, p.description, p.price, p.category, p.image_url, p.rating, p.num_reviews, p.count_in_stock]
            );
        }
        console.log('Default products seeded.');
    }
};

module.exports = {
    db,
    dbRun,
    dbAll,
    dbGet,
    initializeDatabase
};
