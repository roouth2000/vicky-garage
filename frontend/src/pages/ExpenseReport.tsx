import React, { useState } from 'react';
import { fetchExpenses } from '../services/api';
import { Expense } from '../types';
import { Calendar, DollarSign, List, Download, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';

export const ExpenseReport: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Sorting
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      alert('Please select both Date From and Date To');
      return;
    }
    await loadReport();
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await fetchExpenses('', startDate, endDate);
      setExpenses(data);
      setHasSearched(true);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sort local state
  const handleToggleSort = () => {
    const nextOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(nextOrder);
    
    // Sort array
    const sorted = [...expenses].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return nextOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
    setExpenses(sorted);
  };

  // Total calculations
  const totalAmount = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const totalCount = expenses.length;

  // Export to CSV helper
  const handleExportCSV = () => {
    if (expenses.length === 0) return;
    
    // CSV headers
    const headers = ['Date', 'Remarks', 'Amount (INR)'];
    
    // Map rows
    const rows = expenses.map(exp => [
      exp.date,
      `"${(exp.remarks || '').replace(/"/g, '""')}"`,
      exp.amount
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');
    
    // Create download element
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Expense_Report_${startDate}_to_${endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Expense Report</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Query financial logs by date range and analyze total operational cost.
          </p>
        </div>
      </div>

      {/* Date Query Form */}
      <form onSubmit={handleSearch} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date From
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date To
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            required
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50 h-[38px] flex items-center justify-center"
          >
            {loading ? 'Generating...' : 'Search Report'}
          </button>
        </div>
      </form>

      {/* Summary KPI Block */}
      {hasSearched && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Total Expense entries count */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Entries</p>
              <h3 className="text-2xl font-extrabold text-indigo-600 mt-1">{totalCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <List className="w-6 h-6" />
            </div>
          </div>

          {/* Total Expense amount sum */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Expense Amount</p>
              <h3 className="text-2xl font-extrabold text-rose-600 mt-1">
                ₹ {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Result list table */}
      {hasSearched && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <span className="text-xs font-bold text-slate-700">Filtered Expense Entries</span>
            <button
              onClick={handleExportCSV}
              disabled={expenses.length === 0}
              className="flex items-center space-x-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm disabled:opacity-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-800 text-white font-bold uppercase text-xs select-none">
                <tr>
                  <th className="px-6 py-3 cursor-pointer hover:bg-slate-900" onClick={handleToggleSort}>
                    <div className="flex items-center space-x-1">
                      <span>Date</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      {sortOrder === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                    </div>
                  </th>
                  <th className="px-6 py-3">Remarks</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400">No expenses recorded for this period.</td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{exp.date}</td>
                      <td className="px-6 py-4">{exp.remarks || '-'}</td>
                      <td className="px-6 py-4 text-right font-extrabold text-slate-950">
                        ₹ {Number(exp.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
