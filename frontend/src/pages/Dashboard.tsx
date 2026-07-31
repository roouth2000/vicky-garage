import React, { useState, useEffect } from 'react';
import { fetchDashboardStats, fetchBillById } from '../services/api';
import { DashboardStats, Bill } from '../types';
import { FileText, DollarSign, Users, PlusCircle, Eye, ArrowUpRight, Package } from 'lucide-react';
import { formatBillNo } from '../utils/format';

interface DashboardProps {
  onNewBill: () => void;
  onViewBill: (bill: Bill) => void;
  onViewAllHistory: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNewBill, onViewBill, onViewAllHistory }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewBillClick = async (billId: number) => {
    try {
      const fullBill = await fetchBillById(billId);
      onViewBill(fullBill);
    } catch (err) {
      console.error('Failed to load bill details:', err);
      alert('Failed to load bill details');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            Garage Overview & Dashboard
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Real-time sales, master data metrics, and recent billing activity for Vicky's Garage.
          </p>
        </div>
        <button
          onClick={onNewBill}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold px-5 py-3 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 w-full sm:w-auto"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Create New Bill</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Today's Revenue */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Today's Revenue</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
                {loading ? '...' : formatCurrency(stats?.todayRevenue || 0)}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Today's Bills */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Today's Bills</p>
              <h3 className="text-2xl font-extrabold text-indigo-600 mt-1">
                {loading ? '...' : stats?.todayBillsCount || 0}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Customers</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {loading ? '...' : stats?.totalCustomers || 0}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Product Master */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Product Master</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {loading ? '...' : stats?.totalProducts || 0}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </div>

      </div>

      {/* Recent Bills Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Billing Activity</h2>
            <p className="text-xs text-slate-500">Latest invoices saved in the system</p>
          </div>
          <button
            onClick={onViewAllHistory}
            className="flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <span>View All History</span>
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Bill No</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Vehicle Number</th>
                <th className="px-6 py-3">Customer Name</th>
                <th className="px-6 py-3 text-right">Total Amount</th>
                <th className="px-6 py-3 text-right">Balance</th>
                <th className="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">Loading recent bills...</td>
                </tr>
              ) : !stats?.recentBills || stats.recentBills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">No bills generated yet.</td>
                </tr>
              ) : (
                stats.recentBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-indigo-900">#{formatBillNo(bill.bill_no)}</td>
                    <td className="px-6 py-4">{bill.bill_date}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 uppercase">{bill.vehicle_number}</td>
                    <td className="px-6 py-4 uppercase">{bill.customer_name}</td>
                    <td className="px-6 py-4 text-right font-extrabold text-slate-900">
                      ₹ {bill.total_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-blue-800">
                      ₹ {bill.balance_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleViewBillClick(bill.id!)}
                        className="inline-flex items-center space-x-1 text-xs bg-slate-100 hover:bg-indigo-50 text-slate-800 hover:text-indigo-700 font-bold px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Print / View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
