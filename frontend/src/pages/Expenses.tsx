import React, { useState, useEffect } from 'react';
import { fetchExpenses, createExpense, updateExpense, deleteExpense, fetchServerDate } from '../services/api';
import { Expense } from '../types';
import { Search, PlusCircle, Edit, Trash2, Eye, Calendar, DollarSign, FileText, AlertCircle, RefreshCw, X } from 'lucide-react';

export const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals / Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  
  // Form fields
  const [amount, setAmount] = useState<number | ''>('');
  const [remarks, setRemarks] = useState('');
  const [date, setDate] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Errors / Success
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadExpenses('', '', '');
  }, []);

  const loadExpenses = async (searchVal = search, startVal = startDate, endVal = endDate) => {
    try {
      setLoading(true);
      const data = await fetchExpenses(searchVal, startVal, endVal);
      setExpenses(data);
    } catch (err: any) {
      console.error('Failed to load expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadExpenses(search, startDate, endDate);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    loadExpenses('', '', '');
  };

  const handleOpenAdd = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setAmount('');
    setRemarks('');
    setIsEditing(false);
    setIsFormOpen(true);
    try {
      const serverDate = await fetchServerDate();
      setDate(serverDate);
    } catch (err) {
      // Fallback to local date if API fails
      setDate(new Date().toISOString().split('T')[0]);
    }
  };

  const handleOpenEdit = (expense: Expense) => {
    setErrorMsg('');
    setSuccessMsg('');
    setSelectedExpense(expense);
    setAmount(expense.amount);
    setRemarks(expense.remarks);
    setDate(expense.date);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleOpenDetails = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDetailsOpen(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount === '' || Number(amount) < 0) {
      setErrorMsg('Amount must be a non-negative number');
      return;
    }
    if (!date) {
      setErrorMsg('Date is required');
      return;
    }

    try {
      setErrorMsg('');
      setSuccessMsg('');
      
      const payload = {
        remarks,
        amount: Number(amount),
        date
      };

      if (isEditing && selectedExpense?.id) {
        await updateExpense(selectedExpense.id, payload);
        setSuccessMsg('Expense updated successfully!');
      } else {
        await createExpense(payload);
        setSuccessMsg('Expense added successfully!');
      }

      setIsFormOpen(false);
      loadExpenses();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to save expense');
    }
  };

  const handleDeleteExpense = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await deleteExpense(id);
      setSuccessMsg('Expense deleted successfully!');
      loadExpenses();
    } catch (err) {
      alert('Failed to delete expense');
    }
  };

  const totalExpenseAmount = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Expense Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track, search, sort, and log daily garage operations expenses.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <button
            onClick={() => loadExpenses()}
            className="flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors w-full sm:w-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm w-full sm:w-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-medium">
          {successMsg}
        </div>
      )}

      {/* Filter / Search Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* Text Search */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Search Remarks / Amount
          </label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search expenses by remarks or amount..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* From Date */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> From Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>

        {/* To Date */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> To Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>

        {/* Filter buttons */}
        <div className="md:col-span-4 flex flex-col sm:flex-row flex-wrap gap-2 justify-end mt-2">
          {(search || startDate || endDate) && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-sm font-bold transition-colors"
            >
              Clear Filters
            </button>
          )}
          <button
            type="submit"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Apply Filters</span>
          </button>
        </div>
      </form>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Total Count */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Entries</p>
            <h3 className="text-2xl font-extrabold text-indigo-600 mt-1">
              {loading ? '...' : expenses.length}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Total Expense Amount */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Expense Amount</p>
            <h3 className="text-2xl font-extrabold text-rose-600 mt-1">
              {loading ? '...' : `₹ ${totalExpenseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Expense List Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-800 text-white font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Remarks</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">Loading expenses...</td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">No expenses recorded yet.</td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">{exp.date}</td>
                    <td className="px-6 py-4 max-w-md truncate">{exp.remarks || '-'}</td>
                    <td className="px-6 py-4 text-right font-extrabold text-slate-950">
                      ₹ {Number(exp.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => handleOpenDetails(exp)}
                          className="p-1.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(exp)}
                          className="p-1.5 text-amber-600 hover:text-amber-900 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => exp.id && handleDeleteExpense(exp.id)}
                          className="p-1.5 text-rose-600 hover:text-rose-900 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete"
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

      {/* Add / Edit Expense Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-slate-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-400" />
                <span>{isEditing ? 'Edit Expense Record' : 'Record New Expense'}</span>
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="p-6 space-y-4">
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-2.5 rounded-lg text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                  required
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Amount (INR) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 1500.00"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                  required
                />
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" /> Remarks (Multi-line)
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={4}
                  placeholder="Enter details of this expense..."
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-sm"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Details Modal */}
      {isDetailsOpen && selectedExpense && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-slate-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Expense Details</h3>
              <button onClick={() => setIsDetailsOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm font-medium">
              <div className="grid grid-cols-3 border-b border-slate-100 pb-2">
                <span className="text-slate-400 font-bold uppercase text-xs col-span-1">Date:</span>
                <span className="col-span-2 text-slate-900">{selectedExpense.date}</span>
              </div>

              <div className="grid grid-cols-3 border-b border-slate-100 pb-2">
                <span className="text-slate-400 font-bold uppercase text-xs col-span-1">Amount:</span>
                <span className="col-span-2 text-indigo-600 font-extrabold">
                  ₹ {Number(selectedExpense.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-bold uppercase text-xs block">Remarks:</span>
                <div className="p-3 bg-slate-50 rounded-lg text-slate-700 whitespace-pre-wrap leading-relaxed text-xs border border-slate-100">
                  {selectedExpense.remarks || 'NIL'}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end pt-2">
                <button
                  onClick={() => setIsDetailsOpen(false)}
                  className="w-full sm:w-auto px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
