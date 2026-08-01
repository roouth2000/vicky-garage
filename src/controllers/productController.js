"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateProduct = exports.getProducts = exports.getProductById = exports.deleteProduct = exports.createProduct = void 0;
var _express = require("express");
var _models = require("../models");
var _sequelize = require("sequelize");
const getProducts = async (req, res) => {
  try {
    const search = req.query.search || '';
    const whereClause = search ? {
      name: {
        [_sequelize.Op.like]: `%${search}%`
      }
    } : {};
    const products = await _models.Product.findAll({
      where: whereClause,
      order: [['name', 'ASC']]
    });
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.getProducts = getProducts;
const getProductById = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const product = await _models.Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.getProductById = getProductById;
const createProduct = async (req, res) => {
  try {
    const {
      name,
      stock_qty,
      selling_price
    } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Product name is required'
      });
    }
    const cleanName = name.trim().toUpperCase();
    const existing = await _models.Product.findOne({
      where: {
        name: cleanName
      }
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Product already exists'
      });
    }
    const newProduct = await _models.Product.create({
      name: cleanName,
      stock_qty: Number(stock_qty) || 0,
      selling_price: Number(selling_price) || 0
    });
    res.status(201).json({
      success: true,
      data: newProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const {
      name,
      stock_qty,
      selling_price
    } = req.body;
    const existing = await _models.Product.findByPk(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    const cleanName = name ? name.trim().toUpperCase() : existing.name;
    if (cleanName !== existing.name) {
      const dup = await _models.Product.findOne({
        where: {
          name: cleanName,
          id: {
            [_sequelize.Op.ne]: id
          }
        }
      });
      if (dup) {
        return res.status(400).json({
          success: false,
          message: 'Another product with this name exists'
        });
      }
    }
    existing.name = cleanName;
    if (stock_qty !== undefined) existing.stock_qty = Number(stock_qty);
    if (selling_price !== undefined) existing.selling_price = Number(selling_price);
    await existing.save();
    res.json({
      success: true,
      data: existing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const existing = await _models.Product.findByPk(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    await existing.destroy();
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.deleteProduct = deleteProduct;