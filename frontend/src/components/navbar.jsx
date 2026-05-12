import React from 'react';
import { Link } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  return (
    <nav className="bg-green-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img src="/images/logo.png" alt="Idukki Agri Companion" className="h-10" />
          <Link to="/" className="text-xl font-bold">Digital Agricultural Companion</Link>
        </div>
        
        <div className="hidden md:flex space-x-6 items-center">
          <Link to="/" className="hover:text-green-200">Home</Link>
          <Link to="/crop-loss" className="hover:text-green-200">Crop Loss Report</Link>
          <Link to="/WelcomePage"  className="hover:text-green-200">Farmer Forum</Link>
          <Link to="/dashboard" className="hover:text-green-200">Dashboard</Link>

          {/* Official Login Button - Added with professional styling */}
          <Link 
            to="/LoginExpert" 
            className="flex items-center space-x-1 bg-white text-green-800 px-3 py-1 rounded-md hover:bg-green-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Officials</span>
          </Link>

          {/* Language Switcher */}
          <LanguageSwitcher />
        </div>

        {/* Mobile menu toggle button */}
        <button className="md:hidden focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>

      {/* Mobile menu (simplified version) */}
      <div className="md:hidden bg-green-700 px-4 py-2">
        <div className="flex flex-col space-y-2">
          <Link to="/" className="hover:text-green-200">Home</Link>
          <Link to="/crop-loss" className="hover:text-green-200">Crop Loss Report</Link>
          <Link to="/forum" className="hover:text-green-200">Farmer Forum</Link>
          <Link to="/dashboard" className="hover:text-green-200">Dashboard</Link>
          <Link 
            to="/official-login" 
            className="flex items-center space-x-1 text-white hover:text-green-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
            <span>Officials Login</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;