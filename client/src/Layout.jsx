import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Layers, LogOut, CreditCard, Menu, X } from 'lucide-react';
import { useAuth } from './AuthContext';
import { Toaster } from 'react-hot-toast';

export default function Layout() {
  const { logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        onClick={() => setIsMobileMenuOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          isActive ? 'bg-brand-primary/10 text-brand-primary font-bold' : 'text-brand-gray hover:bg-gray-100 hover:text-brand-black'
        }`}
      >
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-brand-light font-sans">
      <Toaster position="top-center" toastOptions={{ style: { background: '#333', color: '#fff', fontSize: '14px' } }} />
      
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 w-full bg-white border-b border-gray-200 z-30 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white">
            <CreditCard size={18} />
          </div>
          <h1 className="text-lg font-extrabold text-brand-primary tracking-tight">SubTracker</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* SIDEBAR */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 flex flex-col p-6 transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} 
        md:translate-x-0 md:static md:shadow-none
      `}>
        <div className="hidden md:flex items-center gap-2 mb-10 px-2">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white">
            <CreditCard size={18} />
          </div>
          <h1 className="text-xl font-extrabold text-brand-primary tracking-tight">SubTracker</h1>
        </div>
        <nav className="space-y-2 flex-1 mt-14 md:mt-0">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/inventory" icon={Layers} label="Contracts & Licenses" />
        </nav>
        <div className="border-t pt-6 mt-auto">
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 text-brand-gray hover:text-red-600 hover:bg-red-50 w-full rounded-lg transition-colors">
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto w-full">
        <div className="max-w-7xl mx-auto p-4 md:p-8 pt-20 md:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}