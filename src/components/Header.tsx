import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, ChevronDown, Globe } from 'lucide-react';

export default function Header() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-2">
          <span>XANTAM</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/" 
            className={`font-medium ${isActive('/') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Trade
          </Link>
          <Link 
            to="/loans" 
            className={`font-medium ${isActive('/loans') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Loans
          </Link>
          <span className="text-gray-500 cursor-not-allowed">Bridge</span>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span>Base</span>
          <ChevronDown size={16} className="text-gray-500" />
        </div>
        
        <button className="bg-primary hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-full transition-colors flex items-center gap-2">
          Connect
        </button>
      </div>
    </header>
  );
}
