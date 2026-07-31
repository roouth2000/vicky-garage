"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const database_1 = require("../db/database");
const getProducts = async (req, res) => {
    try {
        const search = req.query.search || '';
        let sql = 'SELECT * FROM products';
        let params = [];
        if (search) {
            sql += ' WHERE name LIKE ?';
            params.push(`%${search}%`);
        }
        sql += ' ORDER BY name ASC';
        const products = await (0, database_1.dbAll)(sql, params);
        res.json({ success: true, data: products });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getProducts = getProducts;
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await (0, database_1.dbGet)('SELECT * FROM products WHERE id = ?', [id]);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, data: product });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getProductById = getProductById;
const createProduct = async (req, res) => {
    try {
        const { name, stock_qty, selling_price } = req.body;
        if (!name || name.trim() === '') {
            return res.status(400).json({ success: false, message: 'Product name is required' });
        }
        const cleanName = name.trim().toUpperCase();
        const existing = await (0, database_1.dbGet)('SELECT id FROM products WHERE name = ?', [cleanName]);
        if (existing) {
            return res.status(400).json({ success: false, message: 'Product already exists' });
        }
        const result = await (0, database_1.dbRun)('INSERT INTO products (name, stock_qty, selling_price) VALUES (?, ?, ?)', [cleanName, Number(stock_qty) || 0, Number(selling_price) || 0]);
        const newProduct = await (0, database_1.dbGet)('SELECT * FROM products WHERE id = ?', [result.lastID]);
        res.status(201).json({ success: true, data: newProduct });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, stock_qty, selling_price } = req.body;
        const existing = await (0, database_1.dbGet)('SELECT * FROM products WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        const cleanName = name ? name.trim().toUpperCase() : existing.name;
        // Check duplicate if name changed
        if (cleanName !== existing.name) {
            const dup = await (0, database_1.dbGet)('SELECT id FROM products WHERE name = ? AND id != ?', [cleanName, id]);
            if (dup) {
                return res.status(400).json({ success: false, message: 'Another product with this name exists' });
            }
        }
        await (0, database_1.dbRun)('UPDATE products SET name = ?, stock_qty = ?, selling_price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [cleanName, Number(stock_qty) ?? existing.stock_qty, Number(selling_price) ?? existing.selling_price, id]);
        const updated = await (0, database_1.dbGet)('SELECT * FROM products WHERE id = ?', [id]);
        res.json({ success: true, data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await (0, database_1.dbGet)('SELECT * FROM products WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        await (0, database_1.dbRun)('DELETE FROM products WHERE id = ?', [id]);
        res.json({ success: true, message: 'Product deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteProduct = deleteProduct;
