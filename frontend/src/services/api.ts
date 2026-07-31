import axios from 'axios';
import { Product, Customer, Bill, DashboardStats, Expense } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Auth
export const loginUser = async (credentials: any): Promise<{ token: string, user: any }> => {
  const res = await api.post('/auth/login', credentials);
  return res.data;
};

// Dashboard
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const res = await api.get('/dashboard/stats');
  return res.data.stats;
};

// Products
export const fetchProducts = async (search = ''): Promise<Product[]> => {
  const res = await api.get('/products', { params: { search } });
  return res.data.data;
};

export const createProduct = async (productData: Partial<Product>): Promise<Product> => {
  const res = await api.post('/products', productData);
  return res.data.data;
};

export const updateProduct = async (id: number, productData: Partial<Product>): Promise<Product> => {
  const res = await api.put(`/products/${id}`, productData);
  return res.data.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await api.delete(`/products/${id}`);
};

// Customers
export const fetchCustomers = async (search = ''): Promise<Customer[]> => {
  const res = await api.get('/customers', { params: { search } });
  return res.data.data;
};

export const fetchCustomerByVehicle = async (vehicleNo: string): Promise<Customer | null> => {
  try {
    const res = await api.get(`/customers/vehicle/${encodeURIComponent(vehicleNo)}`);
    return res.data.data;
  } catch (err: any) {
    if (err.response && err.response.status === 404) return null;
    throw err;
  }
};

export const createCustomer = async (customerData: Partial<Customer>): Promise<Customer> => {
  const res = await api.post('/customers', customerData);
  return res.data.data;
};

export const updateCustomer = async (id: number, customerData: Partial<Customer>): Promise<Customer> => {
  const res = await api.put(`/customers/${id}`, customerData);
  return res.data.data;
};

export const deleteCustomer = async (id: number): Promise<void> => {
  await api.delete(`/customers/${id}`);
};

// Bills
export const fetchNextBillNo = async (): Promise<number> => {
  const res = await api.get('/bills/next-no');
  return res.data.nextBillNo;
};

export const fetchBills = async (search = '', startDate = '', endDate = ''): Promise<Bill[]> => {
  const res = await api.get('/bills', { params: { search, startDate, endDate } });
  return res.data.data;
};

export const fetchBillById = async (id: number): Promise<Bill> => {
  const res = await api.get(`/bills/${id}`);
  return res.data.data;
};

export const createBill = async (billData: Partial<Bill>): Promise<Bill> => {
  const res = await api.post('/bills', billData);
  return res.data.data;
};

export const updateBill = async (id: number, billData: Partial<Bill>): Promise<Bill> => {
  const res = await api.put(`/bills/${id}`, billData);
  return res.data.data;
};

export const deleteBill = async (id: number): Promise<void> => {
  await api.delete(`/bills/${id}`);
};

// Expenses
export const fetchExpenses = async (search = '', startDate = '', endDate = ''): Promise<Expense[]> => {
  const res = await api.get('/expenses', { params: { search, startDate, endDate } });
  return res.data.data;
};

export const fetchExpenseById = async (id: number): Promise<Expense> => {
  const res = await api.get(`/expenses/${id}`);
  return res.data.data;
};

export const createExpense = async (expenseData: Partial<Expense>): Promise<Expense> => {
  const res = await api.post('/expenses', expenseData);
  return res.data.data;
};

export const updateExpense = async (id: number, expenseData: Partial<Expense>): Promise<Expense> => {
  const res = await api.put(`/expenses/${id}`, expenseData);
  return res.data.data;
};

export const deleteExpense = async (id: number): Promise<void> => {
  await api.delete(`/expenses/${id}`);
};

export const fetchServerDate = async (): Promise<string> => {
  const res = await api.get('/server-date');
  return res.data.date;
};

// PDF Generation
export const generateInvoicePdf = async (html: string): Promise<Blob> => {
  const res = await api.post('/bills/generate-pdf', { html }, {
    responseType: 'blob',
  });
  return res.data;
};
