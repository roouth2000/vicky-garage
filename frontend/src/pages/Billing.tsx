import React, { useState, useEffect } from 'react';
import { fetchNextBillNo, fetchCustomers, fetchProducts, createBill, updateBill, fetchBillById } from '../services/api';
import { Bill, BillItem, Customer, Product } from '../types';
import { AutocompleteSelect } from '../components/AutocompleteSelect';
import { InvoicePrintModal } from '../components/InvoicePrintModal';
import { Save, Printer, Plus, Trash2, RotateCcw, AlertCircle } from 'lucide-react';
import { formatBillNo } from '../utils/format';

interface BillingProps {
  editBillId?: number | null;
  onFinishSave?: () => void;
}

export const Billing: React.FC<BillingProps> = ({ editBillId, onFinishSave }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Form State
  const [billNo, setBillNo] = useState<number>(1);
  const [billDate, setBillDate] = useState<string>(todayStr);
  const [vehicleNumber, setVehicleNumber] = useState<string>('');
  const [vehicleModel, setVehicleModel] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [kmDriven, setKmDriven] = useState<number | ''>('');
  const [advanceAmount, setAdvanceAmount] = useState<number | ''>(0);
  const [complaint, setComplaint] = useState<string>('');

  // Master lists for autocomplete
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Product Grid (Initially 30 rows)
  const createEmptyRows = (count: number, startSNo: number = 1): BillItem[] => {
    return Array.from({ length: count }, (_, idx) => ({
      s_no: startSNo + idx,
      product_name: '',
      qty: '',
      amount: ''
    }));
  };

  const [items, setItems] = useState<BillItem[]>(createEmptyRows(30));

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [savedBillForPrint, setSavedBillForPrint] = useState<Bill | null>(null);

  useEffect(() => {
    loadMasters();
    if (editBillId) {
      loadBillToEdit(editBillId);
    } else {
      loadNextBillNo();
    }
  }, [editBillId]);

  const loadMasters = async () => {
    try {
      const [custs, prods] = await Promise.all([fetchCustomers(), fetchProducts()]);
      setCustomers(custs);
      setProducts(prods);
    } catch (err) {
      console.error('Error loading master data:', err);
    }
  };

  const loadNextBillNo = async () => {
    try {
      const nextNo = await fetchNextBillNo();
      setBillNo(nextNo);
    } catch (err) {
      console.error('Error fetching next bill no:', err);
    }
  };

  const loadBillToEdit = async (id: number) => {
    try {
      setLoading(true);
      const bill = await fetchBillById(id);
      setBillNo(bill.bill_no);
      setBillDate(bill.bill_date);
      setVehicleNumber(bill.vehicle_number);
      setVehicleModel(bill.vehicle_model || '');
      setCustomerName(bill.customer_name || '');
      setMobileNumber(bill.mobile_number || '');
      setKmDriven(bill.km_driven !== '' ? bill.km_driven : '');
      setAdvanceAmount(bill.advance_amount);
      setComplaint(bill.complaint || '');

      // Load items & pad to 30 rows
      const loadedItems = bill.items || [];
      const paddedItems = [...loadedItems];
      if (paddedItems.length < 30) {
        const remaining = 30 - paddedItems.length;
        for (let i = 0; i < remaining; i++) {
          paddedItems.push({
            s_no: paddedItems.length + 1,
            product_name: '',
            qty: '',
            amount: ''
          });
        }
      }
      setItems(paddedItems);
    } catch (err) {
      setErrorMsg('Failed to load bill for editing');
    } finally {
      setLoading(false);
    }
  };

  // Handle Vehicle Selection Autocomplete
  const handleVehicleChange = (val: string, option?: any) => {
    setVehicleNumber(val);
    if (option && option.meta) {
      const cust = customers.find((c) => c.vehicle_number === option.label);
      if (cust) {
        setCustomerName(cust.customer_name);
        setMobileNumber(cust.mobile_number);
        setVehicleModel(cust.vehicle_model);
        if (cust.km_driven) setKmDriven(cust.km_driven);
      }
    }
  };

  // Handle Item Row Updates
  const handleItemChange = (index: number, field: keyof BillItem, val: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: val };

    // Auto-calculate amount if product selected from master
    if (field === 'product_name') {
      const selectedProd = products.find((p) => p.name.toUpperCase() === String(val).toUpperCase());
      if (selectedProd) {
        if (newItems[index].qty === '' || newItems[index].qty === 0) {
          newItems[index].qty = 1;
        }
        const qtyNum = Number(newItems[index].qty) || 1;
        newItems[index].amount = selectedProd.selling_price * qtyNum;
      }
    }

    // Recalculate amount if Qty changed and we have a unit price
    if (field === 'qty') {
      const selectedProd = products.find((p) => p.name.toUpperCase() === String(newItems[index].product_name).toUpperCase());
      if (selectedProd) {
        const qtyNum = Number(val) || 0;
        newItems[index].amount = selectedProd.selling_price * qtyNum;
      }
    }

    // Check if user is filling the last row - if so, auto-append 5 more blank rows!
    if (index === newItems.length - 1 && (field === 'product_name' || field === 'amount')) {
      if (String(val).trim() !== '') {
        const extraRows = createEmptyRows(5, newItems.length + 1);
        newItems.push(...extraRows);
      }
    }

    setItems(newItems);
  };

  // Append single blank row manually if needed
  const handleAddRow = () => {
    setItems((prev) => [
      ...prev,
      { s_no: prev.length + 1, product_name: '', qty: '', amount: '' }
    ]);
  };

  // Delete row
  const handleDeleteRow = (index: number) => {
    if (items.length <= 1) return;
    const filtered = items.filter((_, i) => i !== index);
    const reindexed = filtered.map((item, idx) => ({ ...item, s_no: idx + 1 }));
    setItems(reindexed);
  };

  // Total Calculations
  const calculatedTotal = items.reduce((acc, item) => {
    const amt = Number(item.amount) || 0;
    return acc + amt;
  }, 0);

  const advanceNum = Number(advanceAmount) || 0;
  const calculatedBalance = Math.max(0, calculatedTotal - advanceNum);

  // Form Validation
  const validateForm = (): boolean => {
    setErrorMsg('');

    if (!vehicleNumber || vehicleNumber.trim() === '') {
      setErrorMsg('Vehicle Number is required');
      return false;
    }


    // Filter non-empty items
    const validItems = items.filter((item) => item.product_name.trim() !== '');
    if (validItems.length === 0) {
      setErrorMsg('Please enter at least one product line in the bill table');
      return false;
    }

    for (const item of validItems) {
      if (Number(item.amount) < 0) {
        setErrorMsg(`Negative amount found for product "${item.product_name}"`);
        return false;
      }
    }

    return true;
  };

  // Save Bill Handler
  const handleSaveBill = async (shouldPrintAfterSave: boolean = false) => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setErrorMsg('');

      const validItems = items
        .filter((item) => item.product_name.trim() !== '')
        .map((item, idx) => ({
          s_no: idx + 1,
          product_name: item.product_name.trim().toUpperCase(),
          qty: Number(item.qty) || 1,
          amount: Number(item.amount) || 0
        }));

      const payload: Partial<Bill> = {
        bill_no: billNo,
        vehicle_number: vehicleNumber.trim().toUpperCase(),
        vehicle_model: vehicleModel.trim(),
        customer_name: customerName.trim(),
        mobile_number: mobileNumber.trim(),
        km_driven: kmDriven !== '' ? Number(kmDriven) : 0,
        bill_date: billDate,
        total_amount: calculatedTotal,
        advance_amount: advanceNum,
        balance_amount: calculatedBalance,
        complaint: complaint.trim(),
        items: validItems
      };

      let saved: Bill;
      if (editBillId) {
        saved = await updateBill(editBillId, payload);
        setSuccessMsg(`Bill #${formatBillNo(billNo)} updated successfully! Masters auto-synced.`);
      } else {
        saved = await createBill(payload);
        setSuccessMsg(`Bill #${formatBillNo(saved.bill_no)} saved successfully! Master records updated.`);
      }

      await loadMasters();

      if (shouldPrintAfterSave) {
        setSavedBillForPrint(saved);
      } else {
        setTimeout(() => {
          if (onFinishSave) onFinishSave();
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to save bill');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    loadNextBillNo();
    setBillDate(todayStr);
    setVehicleNumber('');
    setVehicleModel('');
    setCustomerName('');
    setMobileNumber('');
    setKmDriven('');
    setAdvanceAmount(0);
    setComplaint('');
    setItems(createEmptyRows(30));
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <div className="space-y-6">

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            {editBillId ? `Edit Invoice #${formatBillNo(billNo)}` : `Create New Invoice - Bill #${formatBillNo(billNo)}`}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Fill in vehicle & product details. Non-existing items or vehicles are automatically saved to Master.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors w-full sm:w-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveBill(false)}
            disabled={loading}
            className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50 w-full sm:w-auto"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Bill'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveBill(true)}
            disabled={loading}
            className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50 w-full sm:w-auto"
          >
            <Printer className="w-4 h-4" />
            <span>Save & Print</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-medium">
          {successMsg}
        </div>
      )}

      {/* Form Container */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">

        {/* Section 1: Customer & Vehicle Information */}
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2 mb-4">
            Customer & Vehicle Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

            {/* Bill Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Billing Date</label>
              <input
                type="date"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-sm font-medium focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Vehicle Number (Autocomplete) */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Vehicle Number *</label>
              <AutocompleteSelect
                value={vehicleNumber}
                onChange={handleVehicleChange}
                placeholder="e.g. TN 02 BV 7500"
                options={customers.map((c) => ({
                  label: c.vehicle_number,
                  value: c.vehicle_number,
                  sublabel: `${c.customer_name} (${c.vehicle_model})`,
                  meta: `KM: ${c.km_driven}`
                }))}
              />
            </div>

            {/* Vehicle Model */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Vehicle Model</label>
              <input
                type="text"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                placeholder="e.g. HIMALAYAN"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-sm font-medium focus:ring-2 focus:ring-indigo-500 uppercase"
              />
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Vignesh"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-sm font-medium focus:ring-2 focus:ring-indigo-500 uppercase"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mobile Number</label>
              <input
                type="text"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="e.g. 1234567890"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-sm font-medium focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* KM Driven */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">KM Driven</label>
              <input
                type="number"
                value={kmDriven}
                onChange={(e) => setKmDriven(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 18047"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-sm font-medium focus:ring-2 focus:ring-indigo-500"
              />
            </div>

          </div>
        </div>

        {/* Section 2: Product Entry Grid */}
        <div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
              Product & Labour Items ({items.filter(i => i.product_name.trim() !== '').length} filled)
            </h2>
            <span className="text-xs text-slate-500 font-medium">Auto-expands on last row</span>
          </div>

          <div className="overflow-x-auto border border-slate-300 rounded-lg max-h-[500px]">
            <table className="w-full min-w-[700px] text-left text-xs border-collapse">
              <thead className="bg-slate-800 text-white font-bold uppercase sticky top-0 z-20">
                <tr>
                  <th className="w-12 px-3 py-2 text-center">S.No</th>
                  <th className="px-4 py-2">Product Description / Particular</th>
                  <th className="w-24 px-3 py-2 text-center">Qty</th>
                  <th className="w-36 px-3 py-2 text-right">Amount (₹)</th>
                  <th className="w-12 px-2 py-2 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-indigo-50/40 transition-colors">
                    <td className="px-3 py-1 text-center font-bold text-slate-500">{item.s_no}</td>

                    {/* Searchable Product Autocomplete */}
                    <td className="px-2 py-1">
                      <AutocompleteSelect
                        value={item.product_name}
                        onChange={(val) => handleItemChange(idx, 'product_name', val)}
                        placeholder="Search or type product name..."
                        options={products.map((p) => ({
                          label: p.name,
                          value: p.name,
                          sublabel: `Price: ₹${p.selling_price.toLocaleString('en-IN')}`
                        }))}
                      />
                    </td>

                    {/* Quantity */}
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.qty}
                        onChange={(e) => handleItemChange(idx, 'qty', e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="1"
                        className="w-full text-center px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>

                    {/* Amount */}
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.amount}
                        onChange={(e) => handleItemChange(idx, 'amount', e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="0.00"
                        className="w-full text-right px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-slate-900 focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>

                    {/* Delete Action */}
                    <td className="px-2 py-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Remove row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-2 flex justify-start">
            <button
              type="button"
              onClick={handleAddRow}
              className="flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md border border-indigo-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Blank Row</span>
            </button>
          </div>
        </div>

        {/* Section 3: Bill Summary & Complaint Block */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-slate-200">

          {/* Complaint Text Area */}
          <div className="md:col-span-7 space-y-2">
            <label className="block text-xs font-extrabold uppercase text-slate-800">
              Complaint / Work Notes (Multi-line)
            </label>
            <textarea
              rows={4}
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="e.g. General Service, Front & Rear brake noise check, Chain adjustment."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
            ></textarea>
            <p className="text-[11px] font-semibold text-slate-400 italic">
              Appears on the printed invoice under COMPLAINT block.
            </p>
          </div>

          {/* Totals Summary */}
          <div className="md:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">

            {/* Total Bill Amount */}
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-slate-700 uppercase">Total Bill Amount</span>
              <span className="text-lg font-black text-slate-900">
                ₹ {calculatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Advance Received */}
            <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200">
              <span className="font-bold text-slate-700 uppercase">Advance Received</span>
              <div className="w-36">
                <input
                  type="number"
                  min="0"
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full text-right px-3 py-1 bg-white border border-slate-300 rounded text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Balance Amount */}
            <div className="flex items-center justify-between text-base pt-3 border-t-2 border-slate-900">
              <span className="font-black text-blue-900 uppercase">Balance Amount</span>
              <span className="text-xl font-black text-blue-900">
                ₹ {calculatedBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Footer Signature Notice */}
            <div className="pt-2 text-right">
              <span className="text-xs font-black tracking-wider text-slate-500 uppercase">
                For VICKY'S GARAGE
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* Invoice PDF Print Modal */}
      {savedBillForPrint && (
        <InvoicePrintModal
          bill={savedBillForPrint}
          onClose={() => {
            setSavedBillForPrint(null);
            if (onFinishSave) onFinishSave();
          }}
        />
      )}

    </div>
  );
};
