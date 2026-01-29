import React, { useState, useEffect } from 'react';
import { ArrowUpDown, Info, Settings, ChevronDown, RefreshCw, ArrowLeftRight, Repeat } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useContracts } from '../hooks/useContracts';
import { ethers } from 'ethers';
import EmasxIcon from '../assets/EMASX.svg';
import IdrxIcon from '../assets/IDRX.svg';
import ContractAddresses from '../abis/contract-address.json';

export default function SwapCard() {
  const { account, connect } = useWallet();
  const contracts = useContracts();
  
  // Live price calculation based on: (XAU/USD * USD/IDR) / 31.1035
  // We use PAXG (Paxos Gold) as proxy for XAU and USDT (Tether) as proxy for USD
  const [exchangeRate, setExchangeRate] = useState(2922500); 
  const [amountIn, setAmountIn] = useState('1'); 
  const [amountOut, setAmountOut] = useState((2922500).toLocaleString('en-US'));
  const [isSwapping, setIsSwapping] = useState(false);
  const [lastFocused, setLastFocused] = useState<'in'|'out'>('in');
  
  // Real Balances
  const [balances, setBalances] = useState<Record<string, number>>({
    'IDRX': 0,
    'EMASX': 0
  });

  // Fetch Balances
  useEffect(() => {
    const fetchBalances = async () => {
      if (!account || !contracts) return;
      try {
        const idrx = await contracts.getMockIDRX();
        const emasx = await contracts.getEMASX();
        
        if (idrx && emasx) {
          const idrxBal = await idrx.balanceOf(account);
          const emasxBal = await emasx.balanceOf(account);
          
          setBalances({
            'IDRX': Number(ethers.formatEther(idrxBal)),
            'EMASX': Number(ethers.formatEther(emasxBal))
          });
        }
      } catch (err) {
        console.error("Error fetching balances:", err);
      }
    };
    
    fetchBalances();
    const interval = setInterval(fetchBalances, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [account, contracts]);

  // Handle Swap Execution
  const handleSwap = async () => {
    if (!account || !contracts) {
      connect();
      return;
    }
    
    setIsSwapping(true);
    try {
      const swap = await contracts.getSwap();
      const idrx = await contracts.getMockIDRX();
      
      if (!swap || !idrx) throw new Error("Contracts not loaded");
      
      const rawAmountIn = ethers.parseEther(amountIn.replace(/,/g, ''));
      
      if (tokenIn.symbol === 'IDRX') {
        // IDRX -> EMASX
        // 1. Check Allowance
        const allowance = await idrx.allowance(account, ContractAddresses.EMASXSwap);
        if (allowance < rawAmountIn) {
          console.log("Approving IDRX...");
          const txApprove = await idrx.approve(ContractAddresses.EMASXSwap, rawAmountIn);
          await txApprove.wait();
          console.log("IDRX Approved");
        }
        
        // 2. Swap
        console.log("Swapping IDRX to EMASX...");
        const txSwap = await swap.swapIDRXToEMASX(rawAmountIn);
        await txSwap.wait();
        console.log("Swap Complete");
        
      } else {
        // EMASX -> IDRX
        // No approval needed because Swap contract has BURNER_ROLE
        console.log("Swapping EMASX to IDRX...");
        const txSwap = await swap.swapEMASXToIDRX(rawAmountIn);
        await txSwap.wait();
        console.log("Swap Complete");
      }
      
      // Reset inputs or show success
      alert("Swap Successful!");
      setAmountIn('');
      setAmountOut('');
      
    } catch (err: any) {
      console.error("Swap failed:", err);
      alert("Swap Failed: " + (err.message || err));
    } finally {
      setIsSwapping(false);
    }
  };

  // Token state
  const [tokenIn, setTokenIn] = useState({ symbol: 'EMASX', color: 'bg-yellow-400', letter: 'E' });
  const [tokenOut, setTokenOut] = useState({ symbol: 'IDRX', color: 'bg-blue-500', letter: 'I' });

  const currentBalance = balances[tokenIn.symbol] || 0;

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: 5 });
  };

  // Fetch live price
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        // Fetch PAXG (Gold) in USD and Tether (USD) in IDR
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=pax-gold,tether&vs_currencies=usd,idr');
        const data = await response.json();
        
        if (data['pax-gold']?.usd && data['tether']?.idr) {
          const xauUsd = data['pax-gold'].usd;
          const usdIdr = data['tether'].idr;
          
          // Formula: (XAUUSD * USDIDR) / 31.1035
          const pricePerGram = Math.floor((xauUsd * usdIdr) / 31.1035);
          
          console.log(`Live Price Update: XAU/USD=${xauUsd}, USD/IDR=${usdIdr}, Rate=${pricePerGram}`);
          setExchangeRate(pricePerGram);
        }
      } catch (error) {
        console.error("Failed to fetch live price:", error);
      }
    };

    fetchPrice();
    // Refresh every minute
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  // Recalculate amounts when exchange rate updates
  useEffect(() => {
    const rawIn = Number(amountIn.replace(/,/g, ''));
    const rawOut = Number(amountOut.replace(/,/g, ''));
    
    if (lastFocused === 'out' && !isNaN(rawOut) && rawOut !== 0) {
       const calculated = tokenIn.symbol === 'IDRX'
         ? rawOut * exchangeRate
         : rawOut / exchangeRate;
       setAmountIn(formatNumber(calculated));
    } else if (lastFocused === 'in' && !isNaN(rawIn) && rawIn !== 0) {
       const calculated = tokenIn.symbol === 'IDRX' 
         ? rawIn / exchangeRate 
         : rawIn * exchangeRate;
       setAmountOut(formatNumber(calculated));
    }
  }, [exchangeRate, tokenIn.symbol]);

  const handleAmountInChange = (val: string) => {
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setAmountIn(val);
      setLastFocused('in');
      if (val && !isNaN(Number(val))) {
        const rawVal = Number(val.replace(/,/g, ''));
        // If selling IDRX for EMASX: amountIn (IDRX) / rate = amountOut (EMASX)
        // If selling EMASX for IDRX: amountIn (EMASX) * rate = amountOut (IDRX)
        const calculated = tokenIn.symbol === 'IDRX' 
          ? rawVal / exchangeRate 
          : rawVal * exchangeRate;
        setAmountOut(formatNumber(calculated));
      } else {
        setAmountOut('');
      }
    }
  };

  const handleAmountOutChange = (val: string) => {
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setAmountOut(val);
      setLastFocused('out');
      if (val && !isNaN(Number(val))) {
        const rawVal = Number(val.replace(/,/g, ''));
        // If buying EMASX with IDRX: amountOut (EMASX) * rate = amountIn (IDRX)
        // If buying IDRX with EMASX: amountOut (IDRX) / rate = amountIn (EMASX)
        const calculated = tokenIn.symbol === 'IDRX'
          ? rawVal * exchangeRate
          : rawVal / exchangeRate;
        setAmountIn(formatNumber(calculated));
      } else {
        setAmountIn('');
      }
    }
  };

  const handleSwapTokens = () => {
    const tempToken = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(tempToken);
    
    // Recalculate based on new direction
    const rawAmountIn = Number(amountIn.replace(/,/g, ''));
    if (!isNaN(rawAmountIn)) {
       // Let's just recalculate amountOut based on amountIn with new rate logic
       const newOut = tempToken.symbol === 'EMASX' // New IN is EMASX
         ? rawAmountIn * exchangeRate
         : rawAmountIn / exchangeRate;
         
       setAmountOut(formatNumber(newOut));
    }
  };

  const handleQuickAmount = (type: string) => {
    let newAmount = '';
    if (type === '0') {
      newAmount = '0';
    } else if (type === 'Half') {
      newAmount = (currentBalance / 2).toString();
    } else if (type === 'Max') {
      newAmount = currentBalance.toString();
    }
    handleAmountInChange(newAmount);
  };

  // Calculate display rate based on direction
  // exchangeRate is Price of 1 EMASX in IDRX (e.g. 2,922,500)
  // If showing Price per 1 EMASX: rate is exchangeRate
  // If showing Price per 1 IDRX: rate is 1 / exchangeRate
  const isEmasxToIdrx = tokenIn.symbol === 'EMASX';
  const displayRate = isEmasxToIdrx ? exchangeRate : (1 / exchangeRate);
  
  // Format the rate appropriately (handle small numbers)
  const formatRate = (rate: number) => {
    if (rate < 1) {
      return rate.toLocaleString('en-US', { maximumFractionDigits: 10 });
    }
    return formatNumber(rate);
  };
  
  // Determine which token is the "Base" for the price display
  // By default we show Price per 1 [TokenIn] = X [TokenOut]
  // BUT the UI currently shows Price per 1 [TokenOut] = X [TokenIn]
  // Let's stick to the UI's structure: Price per 1 [TokenOut]
  const priceBaseToken = tokenOut;
  const priceQuoteToken = tokenIn;
  // If TokenOut is IDRX (Selling EMASX): Base is IDRX. Rate should be 1/Rate (EMASX per IDRX).
  // If TokenOut is EMASX (Buying EMASX): Base is EMASX. Rate should be Rate (IDRX per EMASX).
  // Wait, if TokenOut is IDRX, exchangeRate is 2.9M. 
  // If I want "Price per 1 IDRX", it should be small.
  // If I want "Price per 1 EMASX", it should be large.
  
  // Let's use a simpler logic: Always show Price per 1 EMASX if possible, or toggle.
  // But to fix the user's issue "still price per EMASX", I should probably make sure the text matches the number.
  
  // Actually, standard practice:
  // Show 1 EMASX = X IDRX (because EMASX is the asset).
  // Let's force the display to be "Price per 1 EMASX" regardless of direction.
  const showEmasxPrice = true;
  const finalDisplayRate = exchangeRate; 
  const finalBaseToken = { symbol: 'EMASX', color: 'bg-yellow-400', letter: 'E' };
  const finalQuoteToken = { symbol: 'IDRX', color: 'bg-blue-500', letter: 'I' };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        {/* From Section */}
        <div className="bg-gray-50 rounded-xl p-4 mb-2 hover:ring-1 hover:ring-primary/20 transition-all">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500 font-medium">From</span>
            <span className="text-sm text-gray-500">Balance: {currentBalance.toLocaleString('en-US')}</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-full shadow-sm min-w-fit">
              <img 
                src={tokenIn.symbol === 'EMASX' ? EmasxIcon : IdrxIcon} 
                alt={tokenIn.symbol} 
                className="w-6 h-6 rounded-full shrink-0"
              />
              <span className="font-semibold text-gray-900">{tokenIn.symbol}</span>
            </div>
            <input  
              type="text" 
              value={amountIn}
              onChange={(e) => handleAmountInChange(e.target.value)}
              className="text-right text-3xl font-bold bg-transparent border-none focus:outline-none w-full text-gray-900 placeholder-gray-300"
              placeholder="0"
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="flex gap-2">
              {['0', 'Half', 'Max'].map((label) => (
                <button 
                  key={label} 
                  onClick={() => handleQuickAmount(label)}
                  className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-md text-gray-600 hover:bg-gray-100"
                >
                  {label}
                </button>
              ))}
            </div>
            <span className="text-sm text-gray-400">
              {/* Placeholder for USD value or similar */}
            </span>
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
            <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-full shadow-sm min-w-fit">
              <img 
                src={tokenOut.symbol === 'EMASX' ? EmasxIcon : IdrxIcon} 
                alt={tokenOut.symbol} 
                className="w-6 h-6 rounded-full shrink-0"
              />
              <span className="font-semibold text-gray-900">{tokenOut.symbol}</span>
            </div>
            <input  
              type="text" 
              value={amountOut}
              onChange={(e) => handleAmountOutChange(e.target.value)}
              className="text-right text-3xl font-bold bg-transparent border-none focus:outline-none w-full text-gray-900 placeholder-gray-300"
              placeholder="0"
            />
          </div>
          <div className="flex justify-end mt-2">
             {/* Placeholder */}
          </div>
        </div>

        {/* Price Info */}
        <div className="mt-4 p-3 rounded-lg border border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Price per</span>
            <img 
              src={finalBaseToken.symbol === 'EMASX' ? EmasxIcon : IdrxIcon} 
              alt={finalBaseToken.symbol} 
              className="w-4 h-4 rounded-full"
            />
            <span>1 {finalBaseToken.symbol}</span>
            <ArrowUpDown size={12} className="text-gray-400" />
          </div>
          <div className="flex items-center gap-2 font-medium">
            <span>{formatNumber(finalDisplayRate)}</span>
            <span className="text-gray-500 text-sm">{finalQuoteToken.symbol}</span>
          </div>
        </div>
      </div>

      {/* Options / Route Info */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-900">Summary</h3>
        </div>

        <div className="border border-blue-100 bg-blue-50/30 rounded-xl p-4 relative overflow-hidden ring-1 ring-primary/20">
          <div className="flex justify-between items-center mb-3 text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <img 
                src={tokenIn.symbol === 'EMASX' ? EmasxIcon : IdrxIcon} 
                alt={tokenIn.symbol} 
                className="w-4 h-4 rounded-full"
              />
              <span>{amountIn || '0'} {tokenIn.symbol}</span>
            </div>
            <span className="text-gray-400">→</span>
            <div className="flex items-center gap-1 text-gray-900 font-medium">
              <span>{amountOut || '0'} {tokenOut.symbol}</span>
              <img 
                src={tokenOut.symbol === 'EMASX' ? EmasxIcon : IdrxIcon} 
                alt={tokenOut.symbol} 
                className="w-4 h-4 rounded-full"
              />
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-gray-200/50">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Avg. Price:</span>
              <span className="font-medium">{formatNumber(exchangeRate)} {tokenIn.symbol}/{tokenOut.symbol}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Fee:</span>
              <span className="font-medium">~5,000 IDRX</span>
            </div>
          </div>
        </div>
      </div>

      {/* Swap Button */}
      {!account ? (
        <button 
          onClick={connect}
          className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          Connect Wallet
        </button>
      ) : (
        <button 
          onClick={handleSwap}
          disabled={isSwapping}
          className="w-full bg-primary hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {isSwapping ? (
            <>
              <RefreshCw size={20} className="animate-spin" />
              Swapping...
            </>
          ) : (
            <>
              <Repeat size={20} />
              Swap Tokens
            </>
          )}
        </button>
      )}
    </div>
  );
}
