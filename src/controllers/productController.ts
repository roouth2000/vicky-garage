import { Request, Response } from 'express';
import { dbAll, dbGet, dbRun } from '../db/database';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const search = (req.query.search as string) || '';
    let sql = 'SELECT * FROM products';
    let params: any[] = [];
    if (search) {
      sql += ' WHERE name LIKE ?';
      params.push(`%${search}%`);
    }
    sql += ' ORDER BY name ASC';
    const products = await dbAll(sql, params);
    res.json({ success: true, data: products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await dbGet('SELECT * FROM products WHERE id = ?', [id]);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, stock_qty, selling_price } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }

    const cleanName = name.trim().toUpperCase();
    const existing = await dbGet('SELECT id FROM products WHERE name = ?', [cleanName]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Product already exists' });
    }

    const result = await dbRun(
      'INSERT INTO products (name, stock_qty, selling_price) VALUES (?, ?, ?)',
      [cleanName, Number(stock_qty) || 0, Number(selling_price) || 0]
    );

    const newProduct = await dbGet('SELECT * FROM products WHERE id = ?', [result.lastID]);
    res.status(201).json({ success: true, data: newProduct });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, stock_qty, selling_price } = req.body;

    const existing = await dbGet('SELECT * FROM products WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const cleanName = name ? name.trim().toUpperCase() : existing.name;

    // Check duplicate if name changed
    if (cleanName !== existing.name) {
      const dup = await dbGet('SELECT id FROM products WHERE name = ? AND id != ?', [cleanName, id]);
      if (dup) {
        return res.status(400).json({ success: false, message: 'Another product with this name exists' });
      }
    }

    await dbRun(
      'UPDATE products SET name = ?, stock_qty = ?, selling_price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [cleanName, Number(stock_qty) ?? existing.stock_qty, Number(selling_price) ?? existing.selling_price, id]
    );

    const updated = await dbGet('SELECT * FROM products WHERE id = ?', [id]);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await dbGet('SELECT * FROM products WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await dbRun('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
