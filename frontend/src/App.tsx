import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Billing } from './pages/Billing';
import { BillHistory } from './pages/BillHistory';
import { ProductMaster } from './pages/ProductMaster';
import { CustomerMaster } from './pages/CustomerMaster';
import { Expenses } from './pages/Expenses';
import { Bill } from './types';
import { InvoicePrintModal } from './components/InvoicePrintModal';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [editingBillId, setEditingBillId] = useState<number | null>(null);
  const [viewingBill, setViewingBill] = useState<Bill | null>(null);

  const handleQuickNewBill = () => {
    setEditingBillId(null);
    setActiveTab('billing');
  };

  const handleEditBill = (billId: number) => {
    setEditingBillId(billId);
    setActiveTab('billing');
  };

  const handleFinishSave = () => {
    setEditingBillId(null);
    setActiveTab('history');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'billing') setEditingBillId(null);
          setActiveTab(tab);
        }}
        onQuickNewBill={handleQuickNewBill}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            onNewBill={handleQuickNewBill}
            onViewBill={(bill) => setViewingBill(bill)}
            onViewAllHistory={() => setActiveTab('history')}
          />
        )}

        {activeTab === 'billing' && (
          <Billing
            editBillId={editingBillId}
            onFinishSave={handleFinishSave}
          />
        )}

        {activeTab === 'history' && (
          <BillHistory
            onEditBill={handleEditBill}
          />
        )}

        {activeTab === 'expenses' && <Expenses />}

        {activeTab === 'customers' && <CustomerMaster />}

        {activeTab === 'products' && <ProductMaster />}
      </main>

      {/* Viewing / Reprinting Modal from Dashboard */}
      {viewingBill && (
        <InvoicePrintModal
          bill={viewingBill}
          onClose={() => setViewingBill(null)}
        />
      )}

      {/* Application Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-4 text-xs">
        <div className="max-w-7xl mx-auto px-4 text-center flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-bold text-slate-200">VICKY'S GARAGE</span> - Specialized in Royal Enfield | Old No: 22/2, New No: 53/2, Gangaiamman Koil Street, Choolaimedu, Chennai - 600094
          </div>
          <div>
            System Version 1.0.0 | High Fidelity Print & Master Auto-Sync
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
