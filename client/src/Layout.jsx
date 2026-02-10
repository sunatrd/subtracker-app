import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Layers, LogOut, CreditCard } from 'lucide-react';
import { useAuth } from './AuthContext';
import { Toaster } from 'react-hot-toast';

export default function Layout() {
  const { logout } = useAuth();
  const location = useLocation();

  const NavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive ? 'bg-brand-light text-brand-primary font-bold' : 'text-brand-gray hover:bg-gray-50 hover:text-brand-black'
      }`}>
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-brand-light font-sans">
      <Toaster position="top-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
      
      {/* Elegant Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white">
            <CreditCard size={18} />
          </div>
          <h1 className="text-xl font-extrabold text-brand-primary tracking-tight">SubTracker</h1>
        </div>

        <nav className="space-y-2 flex-1">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/inventory" icon={Layers} label="Inventory" />
        </nav>

        <div className="border-t pt-6">
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 text-brand-gray hover:text-red-500 hover:bg-red-50 w-full rounded-lg transition-colors">
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}