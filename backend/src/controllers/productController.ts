import { Request, Response } from 'express';
import { Product } from '../models';
import { Op } from 'sequelize';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const search = (req.query.search as string) || '';
    const whereClause = search ? { name: { [Op.like]: `%${search}%` } } : {};
    
    const products = await Product.findAll({
      where: whereClause,
      order: [['name', 'ASC']],
    });
    res.json({ success: true, data: products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
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
    const existing = await Product.findOne({ where: { name: cleanName } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Product already exists' });
    }

    const newProduct = await Product.create({
      name: cleanName,
      stock_qty: Number(stock_qty) || 0,
      selling_price: Number(selling_price) || 0,
    });

    res.status(201).json({ success: true, data: newProduct });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, stock_qty, selling_price } = req.body;

    const existing = await Product.findByPk(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const cleanName = name ? name.trim().toUpperCase() : existing.name;

    if (cleanName !== existing.name) {
      const dup = await Product.findOne({ where: { name: cleanName, id: { [Op.ne]: id } } });
      if (dup) {
        return res.status(400).json({ success: false, message: 'Another product with this name exists' });
      }
    }

    existing.name = cleanName;
    if (stock_qty !== undefined) existing.stock_qty = Number(stock_qty);
    if (selling_price !== undefined) existing.selling_price = Number(selling_price);

    await existing.save();

    res.json({ success: true, data: existing });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await Product.findByPk(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await existing.destroy();
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
