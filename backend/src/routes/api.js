"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = require("express");
var _productController = require("../controllers/productController");
var _customerController = require("../controllers/customerController");
var _billController = require("../controllers/billController");
var _expenseController = require("../controllers/expenseController");
var _authRoutes = _interopRequireDefault(require("./authRoutes"));
var _authMiddleware = require("../middlewares/authMiddleware");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = (0, _express.Router)();

// Public routes
router.use('/auth', _authRoutes.default);

// Protect all following routes
router.use(_authMiddleware.authMiddleware);

// Dashboard
router.get('/dashboard/stats', _billController.getDashboardStats);

// Products
router.get('/products', _productController.getProducts);
router.get('/products/:id', _productController.getProductById);
router.post('/products', _productController.createProduct);
router.put('/products/:id', _productController.updateProduct);
router.delete('/products/:id', _productController.deleteProduct);

// Customers
router.get('/customers', _customerController.getCustomers);
router.get('/customers/vehicle/:vehicle_number', _customerController.getCustomerByVehicle);
router.post('/customers', _customerController.createCustomer);
router.put('/customers/:id', _customerController.updateCustomer);
router.delete('/customers/:id', _customerController.deleteCustomer);

// Bills
router.get('/bills/next-no', _billController.getNextBillNo);
router.get('/bills', _billController.getBills);
router.get('/bills/:id', _billController.getBillById);
router.post('/bills', _billController.createBill);
router.put('/bills/:id', _billController.updateBill);
router.delete('/bills/:id', _billController.deleteBill);

// Expenses
router.get('/expenses', _expenseController.getExpenses);
router.get('/expenses/summary', _expenseController.getExpenseSummary);
router.get('/expenses/:id', _expenseController.getExpenseById);
router.post('/expenses', _expenseController.createExpense);
router.put('/expenses/:id', _expenseController.updateExpense);
router.delete('/expenses/:id', _expenseController.deleteExpense);

// Server Date Util
router.get('/server-date', (req, res) => {
  res.json({
    success: true,
    date: new Date().toISOString().split('T')[0]
  });
});
var _default = exports.default = router;