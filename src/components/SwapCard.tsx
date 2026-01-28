import React, { useState } from 'react';
import { ArrowUpDown, Info, Settings, ChevronDown } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

export default function SwapCard() {
  const { account, connect } = useWallet();
  const [amountIn, setAmountIn] = useState('5379.28');
  const [amountOut, setAmountOut] = useState('1');
  const [isSwapping, setIsSwapping] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        {/* From Section */}
        <div className="bg-gray-50 rounded-xl p-4 mb-2 hover:ring-1 hover:ring-primary/20 transition-all">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500 font-medium">From</span>
            <span className="text-sm text-gray-500">Balance: 5,379.28</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-full shadow-sm">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">I</div>
              <span className="font-semibold text-gray-900">IDRX</span>
            </div>
            <input 
              type="text" 
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
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
            <span className="text-sm text-gray-400">~IDRX 5,377</span>
          </div>
        </div>

        {/* Swap Arrow */}
        <div className="flex justify-center -my-3 relative z-10">
          <button className="bg-white border border-gray-100 p-2 rounded-lg shadow-sm text-gray-500 hover:text-primary hover:border-primary transition-all">
            <ArrowUpDown size={16} />
          </button>
        </div>

        {/* To Section */}
        <div className="bg-gray-50 rounded-xl p-4 mt-2 hover:ring-1 hover:ring-primary/20 transition-all">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500 font-medium">To</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-full shadow-sm">
              <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-white text-xs">X</div>
              <span className="font-semibold text-gray-900">XNTM</span>
            </div>
            <input 
              type="text" 
              value={amountOut}
              onChange={(e) => setAmountOut(e.target.value)}
              className="text-right text-3xl font-bold bg-transparent border-none focus:outline-none w-full text-gray-900 placeholder-gray-300"
              placeholder="0"
            />
          </div>
          <div className="flex justify-end mt-2">
            <span className="text-sm text-gray-400">~IDRX 5,391</span>
          </div>
        </div>

        {/* Price Info */}
        <div className="mt-4 p-3 rounded-lg border border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Price per</span>
            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px]">I</div>
            <span>1 IDRX</span>
            <ArrowUpDown size={12} className="text-gray-400" />
          </div>
          <div className="flex items-center gap-2 font-medium">
            <span>0.000185</span>
            <span className="text-gray-500 text-sm">XNTM</span>
          </div>
        </div>
      </div>

      {/* Options / Route Info */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-900">Options:</h3>
          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>

        <div className="border border-blue-100 bg-blue-50/30 rounded-xl p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-white/80 px-2 py-1 text-[10px] text-gray-500 rounded-bl-lg border-l border-b border-gray-100">
            Executes Instantly
          </div>
          <div className="flex justify-between items-start mb-2">
            <span className="font-medium text-gray-900">Swap instantly</span>
          </div>
          
          <div className="flex justify-between items-center mb-3 text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span>5,379.28 IDRX</span>
            </div>
            <span className="text-gray-400">→</span>
            <div className="flex items-center gap-1 text-gray-900 font-medium">
              <span>1 XNTM</span>
              <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-gray-200/50">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Offers to take:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">1</span>
                <span className="text-primary cursor-pointer hover:underline">View Offers</span>
              </div>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Avg. Price:</span>
              <span className="font-medium">5,379.28156 IDRX/XNTM</span>
            </div>
          </div>
        </div>

        <div className="mt-3 p-4 rounded-xl border border-gray-100 hover:border-gray-300 transition-colors cursor-pointer group">
           <div className="flex justify-between items-start mb-1">
            <span className="font-medium text-gray-900">Limit offer</span>
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md group-hover:bg-gray-200">Set your own price</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Get a better price by placing a Limit. Limits are added to the orderbook and can be cancelled at any time.
          </p>
          <div className="flex justify-between text-xs mt-3 pt-3 border-t border-gray-100">
             <span className="text-gray-500">Market Price:</span>
             <span className="font-medium">5,392.76346 IDRX/XNTM</span>
          </div>
        </div>
      </div>

      {!account ? (
        <button 
          onClick={connect}
          className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
        >
          Connect wallet
        </button>
      ) : (
        <button 
          onClick={() => setIsSwapping(!isSwapping)}
          className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
        >
          {isSwapping ? 'Swapping...' : 'Swap'}
        </button>
      )}
    </div>
  );
}
