import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, ChevronDown, Globe, Check, AlertCircle, LogOut } from 'lucide-react';
import { useWallet, BASE_MAINNET_ID, BASE_TESTNET_ID } from '../hooks/useWallet';

export default function Header() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  
  const { account, chainId, connect, disconnect, switchNetwork, error, isConnecting } = useWallet();
  const [isNetworkOpen, setIsNetworkOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const networks = [
    { name: 'Base Mainnet', id: BASE_MAINNET_ID },
    { name: 'Base Testnet', id: BASE_TESTNET_ID },
  ];

  const currentNetworkName = networks.find(n => n.id === chainId)?.name || 'Wrong Network';
  const isWrongNetwork = !networks.find(n => n.id === chainId);

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

  const handleNetworkSelect = async (networkId: string) => {
    await switchNetwork(networkId);
    setIsNetworkOpen(false);
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 relative z-50">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-2">
          <span>EMASX</span>
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
          <Link 
            to="/claim" 
            className={`font-medium ${isActive('/claim') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Claim
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {error && (
          <div className="hidden lg:flex items-center gap-2 text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded-full">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setIsNetworkOpen(!isNetworkOpen)}
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors ${
              isWrongNetwork && account 
                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {account && isWrongNetwork ? (
              <AlertCircle size={14} />
            ) : (
              <div className={`w-2 h-2 rounded-full ${chainId === BASE_MAINNET_ID ? 'bg-blue-500' : chainId === BASE_TESTNET_ID ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
            )}
            <span>{account ? (isWrongNetwork ? 'Wrong Network' : currentNetworkName) : 'Base Mainnet'}</span>
            <ChevronDown size={16} className={`text-gray-500 transition-transform ${isNetworkOpen ? 'rotate-180' : ''}`} />
          </div>

          {isNetworkOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 overflow-hidden">
              {networks.map((network) => (
                <button
                  key={network.id}
                  onClick={() => handleNetworkSelect(network.id)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${network.id === BASE_MAINNET_ID ? 'bg-blue-500' : 'bg-yellow-500'}`}></div>
                    <span className={`font-medium ${chainId === network.id ? 'text-gray-900' : 'text-gray-600'}`}>
                      {network.name}
                    </span>
                  </div>
                  {chainId === network.id && <Check size={14} className="text-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {account ? (
          <div className="flex items-center gap-2">
            <div className="bg-gray-100 text-gray-900 font-medium px-4 py-2 rounded-full flex items-center gap-2">
              <Wallet size={16} className="text-gray-500" />
              <span>{formatAddress(account)}</span>
            </div>
            <button 
              onClick={disconnect}
              className="bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 p-2 rounded-full transition-colors cursor-pointer"
              title="Disconnect"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button 
            onClick={connect}
            disabled={isConnecting}
            className="bg-primary hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-full transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
      </div>
    </header>
  );
}
