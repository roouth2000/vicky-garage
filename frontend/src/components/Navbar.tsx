import React from 'react';
import { LayoutDashboard, FileText, History, Package, Users, PlusCircle, Wrench, Coins, LogOut } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onQuickNewBill: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onQuickNewBill, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'billing', label: 'New Bill', icon: FileText },
    { id: 'history', label: 'Bill History', icon: History },
    { id: 'expenses', label: 'Expenses', icon: Coins },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'products', label: 'Products', icon: Package },
  ];

  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40 border-b border-slate-800">
      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20 gap-3 lg:gap-6">
          
          {/* Left Section: Logo, Two-Line Title & Specialist Badge */}
          <div 
            className="flex items-center space-x-3 shrink-0 cursor-pointer select-none" 
            onClick={() => setActiveTab('dashboard')}
          >
            {/* Garage Wrench Icon Box */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30 shrink-0">
              <Wrench className="w-5.5 h-5.5 text-white" />
            </div>

            {/* Two-Line Title with Badge */}
            <div className="flex flex-col justify-center">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                <span className="text-sm sm:text-lg font-extrabold tracking-wide text-white whitespace-nowrap">
                  VICKY'S GARAGE
                </span>
                {/* Royal Enfield Specialist Badge */}
                <span className="w-fit mt-1 sm:mt-0 px-2.5 py-0.5 text-[9px] sm:text-[11px] font-semibold text-indigo-300 bg-indigo-950/80 rounded-full border border-indigo-700/60 whitespace-nowrap shadow-xs">
                  Royal Enfield Specialist
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium tracking-normal whitespace-nowrap">
                Billing & Management System
              </span>
            </div>
          </div>

          {/* Center Section: Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5 shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Section: Primary Action Button & Logout */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={onQuickNewBill}
              className="hidden sm:flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>Create Bill</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center justify-center p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-red-500 hover:text-white transition-all shadow-sm group"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex overflow-x-auto py-2 border-t border-slate-800 space-x-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
