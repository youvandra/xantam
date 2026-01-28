import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, ChevronDown, Globe, Check } from 'lucide-react';

export default function Header() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  
  const [currentNetwork, setCurrentNetwork] = useState('Base Mainnet');
  const [isNetworkOpen, setIsNetworkOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const networks = ['Base Mainnet', 'Base Testnet'];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNetworkOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 relative z-50">
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
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setIsNetworkOpen(!isNetworkOpen)}
            className="hidden md:flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors"
          >
            <div className={`w-2 h-2 rounded-full ${currentNetwork === 'Base Mainnet' ? 'bg-blue-500' : 'bg-yellow-500'}`}></div>
            <span>{currentNetwork}</span>
            <ChevronDown size={16} className={`text-gray-500 transition-transform ${isNetworkOpen ? 'rotate-180' : ''}`} />
          </div>

          {isNetworkOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 overflow-hidden">
              {networks.map((network) => (
                <button
                  key={network}
                  onClick={() => {
                    setCurrentNetwork(network);
                    setIsNetworkOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${network === 'Base Mainnet' ? 'bg-blue-500' : 'bg-yellow-500'}`}></div>
                    <span className={`font-medium ${currentNetwork === network ? 'text-gray-900' : 'text-gray-600'}`}>
                      {network}
                    </span>
                  </div>
                  {currentNetwork === network && <Check size={14} className="text-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <button className="bg-primary hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-full transition-colors flex items-center gap-2">
          Connect Wallet
        </button>
      </div>
    </header>
  );
}
