import React, { useState, useEffect } from 'react';
import { fetchBills, deleteBill, fetchBillById } from '../services/api';
import { Bill } from '../types';
import { InvoicePrintModal } from '../components/InvoicePrintModal';
import { Search, Edit, Trash2, Printer, RefreshCw } from 'lucide-react';
import { formatBillNo } from '../utils/format';

interface BillHistoryProps {
  onEditBill: (billId: number) => void;
}

export const BillHistory: React.FC<BillHistoryProps> = ({ onEditBill }) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Selected bill for print modal
  const [selectedBillForPrint, setSelectedBillForPrint] = useState<Bill | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      setLoading(true);
      const data = await fetchBills(search, startDate, endDate);
      setBills(data);
    } catch (err) {
      console.error('Error fetching bills history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadBills();
  };

  const handleResetFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    fetchBills('', '', '').then(setBills);
  };

  const handleOpenPrintModal = async (id: number) => {
    try {
      const bill = await fetchBillById(id);
      setSelectedBillForPrint(bill);
    } catch (err) {
      alert('Failed to load bill details');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteBill(id);
      setBills((prev) => prev.filter((b) => b.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      alert('Failed to delete bill');
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Billing History & Invoice Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Search, filter, view, edit, print, or re-export bills created in Vicky's Garage.
          </p>
        </div>

        <button
          onClick={loadBills}
          className="flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors w-full sm:w-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Search Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Search</label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Bill No / Vehicle / Customer"
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">From Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">To Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filter Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            type="submit"
            className="flex-1 w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={handleResetFilters}
            className="w-full sm:w-auto px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
          >
            Reset
          </button>
        </div>

      </form>

      {/* History Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-800 text-white font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Bill No</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Vehicle No</th>
                <th className="px-6 py-3">Model</th>
                <th className="px-6 py-3">Customer Name</th>
                <th className="px-6 py-3">Mobile</th>
                <th className="px-6 py-3 text-right">Total Amount</th>
                <th className="px-6 py-3 text-right">Balance</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-slate-400">Loading bills history...</td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-slate-400">No invoices match your search criteria.</td>
                </tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-indigo-900">#{formatBillNo(bill.bill_no)}</td>
                    <td className="px-6 py-4">{bill.bill_date}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 uppercase">{bill.vehicle_number}</td>
                    <td className="px-6 py-4 uppercase text-xs">{bill.vehicle_model || '-'}</td>
                    <td className="px-6 py-4 uppercase">{bill.customer_name}</td>
                    <td className="px-6 py-4 text-xs">{bill.mobile_number}</td>
                    <td className="px-6 py-4 text-right font-extrabold text-slate-900">
                      ₹ {bill.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-blue-900">
                      ₹ {bill.balance_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-1">

                        {/* View & Print Modal */}
                        <button
                          onClick={() => handleOpenPrintModal(bill.id!)}
                          className="p-1.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View / Print PDF"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Edit Bill */}
                        <button
                          onClick={() => onEditBill(bill.id!)}
                          className="p-1.5 text-amber-600 hover:text-amber-900 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit Bill"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete Bill */}
                        <button
                          onClick={() => setDeleteConfirmId(bill.id!)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Bill"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Invoice Modal */}
      {selectedBillForPrint && (
        <InvoicePrintModal
          bill={selectedBillForPrint}
          onClose={() => setSelectedBillForPrint(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Confirm Bill Deletion</h3>
            <p className="text-sm text-slate-600 mt-2">
              Are you sure you want to permanently delete this invoice? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
              >
                Delete Invoice
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
