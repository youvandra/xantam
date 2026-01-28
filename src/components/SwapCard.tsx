import React, { useState } from 'react';
import { ArrowUpDown, Info, Settings, ChevronDown, RefreshCw } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

export default function SwapCard() {
  const { account, connect } = useWallet();
  const [amountIn, setAmountIn] = useState('5379.28');
  const [amountOut, setAmountOut] = useState('1');
  const [isSwapping, setIsSwapping] = useState(false);
  
  // Token state
  const [tokenIn, setTokenIn] = useState({ symbol: 'IDRX', color: 'bg-blue-500', letter: 'I' });
  const [tokenOut, setTokenOut] = useState({ symbol: 'EMASX', color: 'bg-yellow-400', letter: 'E' });

  const handleSwapTokens = () => {
    const tempToken = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(tempToken);
    
    // Also swap amounts
    const tempAmount = amountIn;
    setAmountIn(amountOut);
    setAmountOut(tempAmount);
  };

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
              <div className={`w-6 h-6 rounded-full ${tokenIn.color} flex items-center justify-center text-white text-xs`}>{tokenIn.letter}</div>
              <span className="font-semibold text-gray-900">{tokenIn.symbol}</span>
            </div>
            <input 
              type="text" 
              value={amountIn}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || /^\d*\.?\d*$/.test(val)) {
                  setAmountIn(val);
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
            <span className="text-sm text-gray-400">~{tokenIn.symbol} 5,377</span>
          </div>
        </div>

        {/* Swap Arrow */}
        <div className="flex justify-center -my-3 relative z-10">
          <button 
            onClick={handleSwapTokens}
            className="bg-white border border-gray-100 p-2 rounded-lg shadow-sm text-gray-500 hover:text-primary hover:border-primary transition-all active:scale-95 transform cursor-pointer"
          >
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
              <div className={`w-6 h-6 rounded-full ${tokenOut.color} flex items-center justify-center text-white text-xs`}>{tokenOut.letter}</div>
              <span className="font-semibold text-gray-900">{tokenOut.symbol}</span>
            </div>
            <input 
              type="text" 
              value={amountOut}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || /^\d*\.?\d*$/.test(val)) {
                  setAmountOut(val);
                }
              }}
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
            <div className={`w-4 h-4 rounded-full ${tokenOut.color} flex items-center justify-center text-white text-[10px]`}>{tokenOut.letter}</div>
            <span>1 {tokenOut.symbol}</span>
            <ArrowUpDown size={12} className="text-gray-400" />
          </div>
          <div className="flex items-center gap-2 font-medium">
            <span>5,379.28</span>
            <span className="text-gray-500 text-sm">{tokenIn.symbol}</span>
          </div>
        </div>
      </div>

      {/* Options / Route Info */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-900">Summary</h3>
          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>

        <div className="border border-blue-100 bg-blue-50/30 rounded-xl p-4 relative overflow-hidden ring-1 ring-primary/20">
          <div className="flex justify-between items-center mb-3 text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span>5,379.28 IDRX</span>
            </div>
            <span className="text-gray-400">→</span>
            <div className="flex items-center gap-1 text-gray-900 font-medium">
              <span>1 EMASX</span>
              <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-gray-200/50">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Avg. Price:</span>
              <span className="font-medium">5,379.28156 IDRX/EMASX</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Price Impact:</span>
              <span className="font-medium text-green-500">~0.00%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Fee:</span>
              <span className="font-medium">~2,000 IDRX</span>
            </div>
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
          className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
        >
          {isSwapping ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Swapping...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              Swap
            </>
          )}
        </button>
      )}
    </div>
  );
}
