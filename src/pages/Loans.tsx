import React, { useState } from 'react';
import { ShieldCheck, TrendingUp, Info, HandCoins } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

export default function Loans() {
  const { account, connect } = useWallet();
  const [collateralAmount, setCollateralAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Instant IDRX Loans</h1>
        <p className="text-gray-500">Use your tokenized gold or crypto as collateral to borrow IDRX instantly.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Borrow Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="text-primary" />
            Borrow
          </h2>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-4 hover:ring-1 hover:ring-primary/20 transition-all">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500 font-medium">Deposit Collateral</span>
                <span className="text-sm text-gray-500">Balance: 0.00</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-full shadow-sm">
                  <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-white text-xs">E</div>
                  <span className="font-semibold text-gray-900">EMASX</span>
                </div>
                <input 
                  type="text" 
                  value={collateralAmount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d*\.?\d*$/.test(val)) {
                      setCollateralAmount(val);
                    }
                  }}
                  className="text-right text-3xl font-bold bg-transparent border-none focus:outline-none w-full text-gray-900 placeholder-gray-300"
                  placeholder="0"
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="flex gap-2">
                  {['0', 'Half', 'Max'].map((label) => (
                    <button key={label} className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-md text-gray-600 hover:bg-gray-100">
                      {label}
                    </button>
                  ))}
                </div>
                <span className="text-sm text-gray-400">~EMASX 0.00</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 hover:ring-1 hover:ring-primary/20 transition-all">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500 font-medium">Borrow Amount</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-full shadow-sm">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">I</div>
                  <span className="font-semibold text-gray-900">IDRX</span>
                </div>
                <input 
                  type="text" 
                  value={borrowAmount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d*\.?\d*$/.test(val)) {
                      setBorrowAmount(val);
                    }
                  }}
                  className="text-right text-3xl font-bold bg-transparent border-none focus:outline-none w-full text-gray-900 placeholder-gray-300"
                  placeholder="0"
                />
              </div>
              <div className="flex justify-end mt-2">
                <span className="text-sm text-gray-400">~IDRX 0.00</span>
              </div>
            </div>

            <div className="bg-blue-50/50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">LTV (Loan to Value)</span>
                <span className="font-medium text-gray-900">0.00%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Liquidation Price</span>
                <span className="font-medium text-gray-900">-</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Annual Interest</span>
                <span className="font-medium text-green-600">4.5%</span>
              </div>
            </div>

            {!account ? (
              <button 
                onClick={connect}
                className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all"
              >
                Connect Wallet to Borrow
              </button>
            ) : (
              <button 
                className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                <HandCoins className="w-5 h-5" />
                Borrow IDRX
              </button>
            )}
          </div>
        </div>

        {/* Stats & Info Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="text-green-500" />
              Safety & Security
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Your collateral is secured in audited smart contracts. Liquidation occurs only if your LTV exceeds the maximum threshold of 80%.
            </p>
            <div className="flex items-center gap-2 text-sm text-primary cursor-pointer hover:underline">
              <Info size={16} />
              Learn more about risks
            </div>
          </div>

          <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-sm">
             <h3 className="font-bold mb-4">Market Stats</h3>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <p className="text-gray-400 text-xs mb-1">Total Value Locked</p>
                 <p className="text-xl font-bold">$12.5M</p>
               </div>
               <div>
                 <p className="text-gray-400 text-xs mb-1">Total IDRX Borrowed</p>
                 <p className="text-xl font-bold">45.2B</p>
               </div>
               <div>
                 <p className="text-gray-400 text-xs mb-1">Gold Price</p>
                 <p className="text-xl font-bold text-yellow-400">$2,340</p>
               </div>
               <div>
                 <p className="text-gray-400 text-xs mb-1">IDRX Price</p>
                 <p className="text-xl font-bold text-blue-400">$1.00</p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
