import { Request, Response } from 'express';
import { Customer } from '../models';
import { Op } from 'sequelize';

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const search = (req.query.search as string) || '';
    let whereClause = {};
    if (search) {
      whereClause = {
        [Op.or]: [
          { vehicle_number: { [Op.like]: `%${search}%` } },
          { customer_name: { [Op.like]: `%${search}%` } },
          { mobile_number: { [Op.like]: `%${search}%` } },
          { vehicle_model: { [Op.like]: `%${search}%` } },
        ]
      };
    }
    
    const customers = await Customer.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, data: customers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomerByVehicle = async (req: Request, res: Response) => {
  try {
    const { vehicle_number } = req.params;
    const customer = await Customer.findOne({ where: { vehicle_number: vehicle_number.toUpperCase().trim() } });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.json({ success: true, data: customer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { vehicle_number, vehicle_model, km_driven, customer_name, mobile_number } = req.body;
    if (!vehicle_number || !vehicle_model || !customer_name || !mobile_number) {
      return res.status(400).json({ success: false, message: 'Vehicle Number, Model, Customer Name, and Mobile are required' });
    }

    const cleanVehicle = vehicle_number.trim().toUpperCase();
    const existing = await Customer.findOne({ where: { vehicle_number: cleanVehicle } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Customer vehicle number already exists' });
    }

    const newCust = await Customer.create({
      vehicle_number: cleanVehicle,
      vehicle_model: vehicle_model.trim(),
      km_driven: Number(km_driven) || 0,
      customer_name: customer_name.trim(),
      mobile_number: mobile_number.trim(),
    });

    res.status(201).json({ success: true, data: newCust });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { vehicle_number, vehicle_model, km_driven, customer_name, mobile_number } = req.body;

    const existing = await Customer.findByPk(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const cleanVehicle = vehicle_number ? vehicle_number.trim().toUpperCase() : existing.vehicle_number;

    if (cleanVehicle !== existing.vehicle_number) {
      const dup = await Customer.findOne({ where: { vehicle_number: cleanVehicle, id: { [Op.ne]: id } } });
      if (dup) {
        return res.status(400).json({ success: false, message: 'Another customer with this vehicle number exists' });
      }
    }

    existing.vehicle_number = cleanVehicle;
    if (vehicle_model) existing.vehicle_model = vehicle_model.trim();
    if (km_driven !== undefined) existing.km_driven = Number(km_driven);
    if (customer_name) existing.customer_name = customer_name.trim();
    if (mobile_number) existing.mobile_number = mobile_number.trim();

    await existing.save();

    res.json({ success: true, data: existing });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await Customer.findByPk(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    await existing.destroy();
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
