"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateCustomer = exports.getCustomers = exports.getCustomerByVehicle = exports.deleteCustomer = exports.createCustomer = void 0;
var _express = require("express");
var _models = require("../models");
var _sequelize = require("sequelize");
const getCustomers = async (req, res) => {
  try {
    const search = req.query.search || '';
    let whereClause = {};
    if (search) {
      whereClause = {
        [_sequelize.Op.or]: [{
          vehicle_number: {
            [_sequelize.Op.like]: `%${search}%`
          }
        }, {
          customer_name: {
            [_sequelize.Op.like]: `%${search}%`
          }
        }, {
          mobile_number: {
            [_sequelize.Op.like]: `%${search}%`
          }
        }, {
          vehicle_model: {
            [_sequelize.Op.like]: `%${search}%`
          }
        }]
      };
    }
    const customers = await _models.Customer.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']]
    });
    res.json({
      success: true,
      data: customers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.getCustomers = getCustomers;
const getCustomerByVehicle = async (req, res) => {
  try {
    const {
      vehicle_number
    } = req.params;
    const customer = await _models.Customer.findOne({
      where: {
        vehicle_number: vehicle_number.toUpperCase().trim()
      }
    });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.getCustomerByVehicle = getCustomerByVehicle;
const createCustomer = async (req, res) => {
  try {
    const {
      vehicle_number,
      vehicle_model,
      km_driven,
      customer_name,
      mobile_number
    } = req.body;
    if (!vehicle_number || !vehicle_model || !customer_name || !mobile_number) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle Number, Model, Customer Name, and Mobile are required'
      });
    }
    const cleanVehicle = vehicle_number.trim().toUpperCase();
    const existing = await _models.Customer.findOne({
      where: {
        vehicle_number: cleanVehicle
      }
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Customer vehicle number already exists'
      });
    }
    const newCust = await _models.Customer.create({
      vehicle_number: cleanVehicle,
      vehicle_model: vehicle_model.trim(),
      km_driven: Number(km_driven) || 0,
      customer_name: customer_name.trim(),
      mobile_number: mobile_number.trim()
    });
    res.status(201).json({
      success: true,
      data: newCust
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.createCustomer = createCustomer;
const updateCustomer = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const {
      vehicle_number,
      vehicle_model,
      km_driven,
      customer_name,
      mobile_number
    } = req.body;
    const existing = await _models.Customer.findByPk(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    const cleanVehicle = vehicle_number ? vehicle_number.trim().toUpperCase() : existing.vehicle_number;
    if (cleanVehicle !== existing.vehicle_number) {
      const dup = await _models.Customer.findOne({
        where: {
          vehicle_number: cleanVehicle,
          id: {
            [_sequelize.Op.ne]: id
          }
        }
      });
      if (dup) {
        return res.status(400).json({
          success: false,
          message: 'Another customer with this vehicle number exists'
        });
      }
    }
    existing.vehicle_number = cleanVehicle;
    if (vehicle_model) existing.vehicle_model = vehicle_model.trim();
    if (km_driven !== undefined) existing.km_driven = Number(km_driven);
    if (customer_name) existing.customer_name = customer_name.trim();
    if (mobile_number) existing.mobile_number = mobile_number.trim();
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
exports.updateCustomer = updateCustomer;
const deleteCustomer = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const existing = await _models.Customer.findByPk(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    await existing.destroy();
    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.deleteCustomer = deleteCustomer;