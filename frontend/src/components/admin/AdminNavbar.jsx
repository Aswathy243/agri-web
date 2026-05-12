import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const AdminNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminRole');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-green-900 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="font-extrabold text-lg tracking-wide">🌿 AgriWeb</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            to="/admin_dashboard"
            className={`px-4 py-2 rounded transition font-medium ${
              isActive('/admin_dashboard')
                ? 'bg-green-600 shadow-md'
                : 'hover:bg-green-700'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/Expert_Forum"
            className={`px-4 py-2 rounded transition font-medium ${
              isActive('/forum')
                ? 'bg-green-600 shadow-md'
                : 'hover:bg-green-700'
            }`}
          >
            Community Forum
          </Link>
          <Link
            to="/admin/alerts"
            className={`px-4 py-2 rounded transition font-medium ${
              isActive('/admin/alerts')
                ? 'bg-green-600 shadow-md'
                : 'hover:bg-green-700'
            }`}
          >
            Alerts
          </Link>
          <button
            onClick={handleLogout}
            className="ml-4 bg-transparent border-2 border-green-400 text-green-100 hover:bg-green-400 hover:text-green-900 px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;