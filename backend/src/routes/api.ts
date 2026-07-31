import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController';
import {
  getCustomers,
  getCustomerByVehicle,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../controllers/customerController';
import {
  getNextBillNo,
  getBills,
  getBillById,
  createBill,
  updateBill,
  deleteBill,
  getDashboardStats,
  generatePdf
} from '../controllers/billController';
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary
} from '../controllers/expenseController';

import authRoutes from './authRoutes';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Public routes
router.use('/auth', authRoutes);

// Protect all following routes
router.use(authMiddleware);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Products
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Customers
router.get('/customers', getCustomers);
router.get('/customers/vehicle/:vehicle_number', getCustomerByVehicle);
router.post('/customers', createCustomer);
router.put('/customers/:id', updateCustomer);
router.delete('/customers/:id', deleteCustomer);

// Bills
router.get('/bills/next-no', getNextBillNo);
router.get('/bills', getBills);
router.get('/bills/:id', getBillById);
router.post('/bills', createBill);
router.post('/bills/generate-pdf', generatePdf);
router.put('/bills/:id', updateBill);
router.delete('/bills/:id', deleteBill);

// Expenses
router.get('/expenses', getExpenses);
router.get('/expenses/summary', getExpenseSummary);
router.get('/expenses/:id', getExpenseById);
router.post('/expenses', createExpense);
router.put('/expenses/:id', updateExpense);
router.delete('/expenses/:id', deleteExpense);

// Server Date Util
router.get('/server-date', (req, res) => {
  res.json({ success: true, date: new Date().toISOString().split('T')[0] });
});

export default router;
