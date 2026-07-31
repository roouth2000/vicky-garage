"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const customerController_1 = require("../controllers/customerController");
const billController_1 = require("../controllers/billController");
const expenseController_1 = require("../controllers/expenseController");
const router = (0, express_1.Router)();
// Dashboard
router.get('/dashboard/stats', billController_1.getDashboardStats);
// Products
router.get('/products', productController_1.getProducts);
router.get('/products/:id', productController_1.getProductById);
router.post('/products', productController_1.createProduct);
router.put('/products/:id', productController_1.updateProduct);
router.delete('/products/:id', productController_1.deleteProduct);
// Customers
router.get('/customers', customerController_1.getCustomers);
router.get('/customers/vehicle/:vehicle_number', customerController_1.getCustomerByVehicle);
router.post('/customers', customerController_1.createCustomer);
router.put('/customers/:id', customerController_1.updateCustomer);
router.delete('/customers/:id', customerController_1.deleteCustomer);
// Bills
router.get('/bills/next-no', billController_1.getNextBillNo);
router.get('/bills', billController_1.getBills);
router.get('/bills/:id', billController_1.getBillById);
router.post('/bills', billController_1.createBill);
router.post('/bills/generate-pdf', billController_1.generatePdf);
router.put('/bills/:id', billController_1.updateBill);
router.delete('/bills/:id', billController_1.deleteBill);
// Expenses
router.get('/expenses', expenseController_1.getExpenses);
router.get('/expenses/summary', expenseController_1.getExpenseSummary);
router.get('/expenses/:id', expenseController_1.getExpenseById);
router.post('/expenses', expenseController_1.createExpense);
router.put('/expenses/:id', expenseController_1.updateExpense);
router.delete('/expenses/:id', expenseController_1.deleteExpense);
// Server Date Util
router.get('/server-date', (req, res) => {
    res.json({ success: true, date: new Date().toISOString().split('T')[0] });
});
exports.default = router;
