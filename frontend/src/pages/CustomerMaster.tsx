import React, { useState, useEffect } from 'react';
import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer } from '../services/api';
import { Customer } from '../types';
import { Plus, Search, Edit, Trash2, Users, X, AlertCircle } from 'lucide-react';

export const CustomerMaster: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [kmDriven, setKmDriven] = useState<number | ''>('');
  const [errorMsg, setErrorMsg] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await fetchCustomers(search);
      setCustomers(data);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    fetchCustomers(e.target.value).then(setCustomers);
  };

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setVehicleNumber('');
    setVehicleModel('');
    setCustomerName('');
    setMobileNumber('');
    setKmDriven('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setVehicleNumber(cust.vehicle_number);
    setVehicleModel(cust.vehicle_model);
    setCustomerName(cust.customer_name);
    setMobileNumber(cust.mobile_number);
    setKmDriven(cust.km_driven);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleNumber || vehicleNumber.trim() === '') {
      setErrorMsg('Vehicle Number is required');
      return;
    }
    if (!customerName || customerName.trim() === '') {
      setErrorMsg('Customer Name is required');
      return;
    }
    if (!mobileNumber || mobileNumber.trim() === '') {
      setErrorMsg('Mobile Number is required');
      return;
    }

    try {
      setErrorMsg('');
      const payload = {
        vehicle_number: vehicleNumber.trim().toUpperCase(),
        vehicle_model: vehicleModel.trim() || 'GENERAL',
        customer_name: customerName.trim(),
        mobile_number: mobileNumber.trim(),
        km_driven: Number(kmDriven) || 0
      };

      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, payload);
      } else {
        await createCustomer(payload);
      }

      setIsModalOpen(false);
      loadCustomers();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to save customer');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      alert('Failed to delete customer record');
    }
  };

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>Customer & Vehicle Master</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered vehicle history, model details, and customer contacts. Auto-updated during invoice creation.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search vehicle number, name, or phone..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 uppercase"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <span className="text-xs font-semibold text-slate-500">
          Total Vehicles: {customers.length}
        </span>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-800 text-white font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Vehicle Number</th>
                <th className="px-6 py-3">Model</th>
                <th className="px-6 py-3">Customer Name</th>
                <th className="px-6 py-3">Mobile Number</th>
                <th className="px-6 py-3 text-center">Last KM</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading customers master...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">No customer records found.</td>
                </tr>
              ) : (
                customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-black text-indigo-950 uppercase tracking-wide">
                      {cust.vehicle_number}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700 uppercase text-xs">
                      {cust.vehicle_model}
                    </td>
                    <td className="px-6 py-4 uppercase font-bold text-slate-900">
                      {cust.customer_name}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {cust.mobile_number}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-600">
                      {cust.km_driven ? `${cust.km_driven} km` : '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(cust)}
                          className="p-1.5 text-amber-600 hover:text-amber-900 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit Customer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(cust.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Customer"
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

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingCustomer ? 'Edit Customer Master' : 'Add New Customer'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 bg-rose-50 text-rose-700 text-xs p-3 rounded-lg border border-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Vehicle Number *</label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="e.g. TN 02 BV 7500"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium uppercase focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Vehicle Model</label>
                <input
                  type="text"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="e.g. HIMALAYAN"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium uppercase focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Customer Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Vignesh Kumar"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium uppercase focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mobile Number *</label>
                <input
                  type="text"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="e.g. 12345 00000"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">KM Driven</label>
                <input
                  type="number"
                  min="0"
                  value={kmDriven}
                  onChange={(e) => setKmDriven(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="8047"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Delete Customer Record</h3>
            <p className="text-sm text-slate-600 mt-2">
              Are you sure you want to remove this vehicle & customer from the master records?
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
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
