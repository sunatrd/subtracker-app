import { Link, Outlet } from 'react-router-dom';
import { LayoutDashboard, FileText, LogOut } from 'lucide-react';
import { useAuth } from './AuthContext';

export default function Layout() {
  const { logout } = useAuth();
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-6 flex flex-col">
        <h1 className="text-2xl font-bold mb-8">🚀 SubTracker</h1>
        <nav className="flex-1 space-y-4">
          <Link to="/" className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/inventory" className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded">
            <FileText size={20} /> All Items
          </Link>
        </nav>
        <button onClick={logout} className="flex items-center gap-2 p-2 hover:bg-red-800 rounded text-red-300 mt-auto">
          <LogOut size={20} /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}