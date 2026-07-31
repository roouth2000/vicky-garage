"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomer = exports.updateCustomer = exports.createCustomer = exports.getCustomerByVehicle = exports.getCustomers = void 0;
const database_1 = require("../db/database");
const getCustomers = async (req, res) => {
    try {
        const search = req.query.search || '';
        let sql = 'SELECT * FROM customers';
        let params = [];
        if (search) {
            sql += ' WHERE vehicle_number LIKE ? OR customer_name LIKE ? OR mobile_number LIKE ? OR vehicle_model LIKE ?';
            const term = `%${search}%`;
            params.push(term, term, term, term);
        }
        sql += ' ORDER BY created_at DESC';
        const customers = await (0, database_1.dbAll)(sql, params);
        res.json({ success: true, data: customers });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCustomers = getCustomers;
const getCustomerByVehicle = async (req, res) => {
    try {
        const { vehicle_number } = req.params;
        const customer = await (0, database_1.dbGet)('SELECT * FROM customers WHERE vehicle_number = ?', [vehicle_number.toUpperCase().trim()]);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }
        res.json({ success: true, data: customer });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCustomerByVehicle = getCustomerByVehicle;
const createCustomer = async (req, res) => {
    try {
        const { vehicle_number, vehicle_model, km_driven, customer_name, mobile_number } = req.body;
        if (!vehicle_number || !vehicle_model || !customer_name || !mobile_number) {
            return res.status(400).json({ success: false, message: 'Vehicle Number, Model, Customer Name, and Mobile are required' });
        }
        const cleanVehicle = vehicle_number.trim().toUpperCase();
        const existing = await (0, database_1.dbGet)('SELECT id FROM customers WHERE vehicle_number = ?', [cleanVehicle]);
        if (existing) {
            return res.status(400).json({ success: false, message: 'Customer vehicle number already exists' });
        }
        const result = await (0, database_1.dbRun)('INSERT INTO customers (vehicle_number, vehicle_model, km_driven, customer_name, mobile_number) VALUES (?, ?, ?, ?, ?)', [cleanVehicle, vehicle_model.trim(), Number(km_driven) || 0, customer_name.trim(), mobile_number.trim()]);
        const newCust = await (0, database_1.dbGet)('SELECT * FROM customers WHERE id = ?', [result.lastID]);
        res.status(201).json({ success: true, data: newCust });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createCustomer = createCustomer;
const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { vehicle_number, vehicle_model, km_driven, customer_name, mobile_number } = req.body;
        const existing = await (0, database_1.dbGet)('SELECT * FROM customers WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        const cleanVehicle = vehicle_number ? vehicle_number.trim().toUpperCase() : existing.vehicle_number;
        if (cleanVehicle !== existing.vehicle_number) {
            const dup = await (0, database_1.dbGet)('SELECT id FROM customers WHERE vehicle_number = ? AND id != ?', [cleanVehicle, id]);
            if (dup) {
                return res.status(400).json({ success: false, message: 'Another customer with this vehicle number exists' });
            }
        }
        await (0, database_1.dbRun)(`UPDATE customers SET vehicle_number = ?, vehicle_model = ?, km_driven = ?, customer_name = ?, mobile_number = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [
            cleanVehicle,
            vehicle_model ? vehicle_model.trim() : existing.vehicle_model,
            km_driven !== undefined ? Number(km_driven) : existing.km_driven,
            customer_name ? customer_name.trim() : existing.customer_name,
            mobile_number ? mobile_number.trim() : existing.mobile_number,
            id
        ]);
        const updated = await (0, database_1.dbGet)('SELECT * FROM customers WHERE id = ?', [id]);
        res.json({ success: true, data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateCustomer = updateCustomer;
const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await (0, database_1.dbGet)('SELECT * FROM customers WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        await (0, database_1.dbRun)('DELETE FROM customers WHERE id = ?', [id]);
        res.json({ success: true, message: 'Customer deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteCustomer = deleteCustomer;
