export interface Product {
  id: number;
  name: string;
  stock_qty: number;
  selling_price: number;
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  id: number;
  vehicle_number: string;
  vehicle_model: string;
  km_driven: number;
  customer_name: string;
  mobile_number: string;
  created_at?: string;
  updated_at?: string;
}

export interface BillItem {
  id?: number;
  bill_id?: number;
  s_no: number;
  product_name: string;
  qty: number | '';
  amount: number | '';
}

export interface Bill {
  id?: number;
  bill_no: number;
  customer_id?: number | null;
  vehicle_number: string;
  vehicle_model: string;
  customer_name: string;
  mobile_number: string;
  km_driven: number | '';
  bill_date: string;
  total_amount: number;
  advance_amount: number;
  balance_amount: number;
  complaint?: string;
  items?: BillItem[];
  created_at?: string;
}

export interface Expense {
  id?: number;
  remarks: string;
  amount: number;
  date: string;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardStats {
  todayBillsCount: number;
  todayRevenue: number;
  todayExpenses: number;
  totalCustomers: number;
  totalProducts: number;
  recentBills: Bill[];
}
