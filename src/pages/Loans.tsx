import React, { useState, useEffect } from 'react';
import { ShieldCheck, TrendingUp, Info, HandCoins } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useContracts } from '../hooks/useContracts';
import ContractAddresses from '../abis/contract-address.json';
import { ethers } from 'ethers';
import Skeleton from '../components/Skeleton';
import EmasxIcon from '../assets/EMASX.svg';
import IdrxIcon from '../assets/IDRX.svg';

export default function Loans() {
  const { account, connect } = useWallet();
  const contracts = useContracts();
  const [collateralAmount, setCollateralAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTransacting, setIsTransacting] = useState(false);
  
  const [userBalance, setUserBalance] = useState({ emasx: '0', idrx: '0' });
  const [userPosition, setUserPosition] = useState({ collateral: '0', debt: '0' });
  const [goldPrice, setGoldPrice] = useState('0');

  useEffect(() => {
    const fetchData = async () => {
      if (!contracts || !account) {
        setIsLoading(false);
        return;
      }

      try {
        const emasx = await contracts.getEMASX();
        const lending = await contracts.getLending();
        const oracle = await contracts.getOracle();

        if (emasx && lending && oracle) {
          // Get Balances
          const emasxBal = await emasx.balanceOf(account);
          setUserBalance(prev => ({ ...prev, emasx: ethers.formatEther(emasxBal) }));

          // Get Position
          const pos = await lending.positions(account);
          setUserPosition({
            collateral: ethers.formatEther(pos.collateral),
            debt: ethers.formatEther(pos.debt)
          });

          // Get Gold Price
          const price = await oracle.getGoldPrice();
          setGoldPrice(ethers.formatEther(price));
        }
      } catch (err) {
        console.error("Error fetching loan data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [contracts, account]);

  const handleBorrow = async () => {
    if (!contracts || !account) {
      connect();
      return;
    }

    setIsTransacting(true);
    try {
      const emasx = await contracts.getEMASX();
      const lending = await contracts.getLending();

      if (!emasx || !lending) throw new Error("Contracts not loaded");

      // 1. Deposit Collateral if amount > 0
      if (collateralAmount && Number(collateralAmount) > 0) {
        const amountWei = ethers.parseEther(collateralAmount);
        
        // Check Allowance
        const allowance = await emasx.allowance(account, ContractAddresses.EMASXLending);
        if (allowance < amountWei) {
          const txApprove = await emasx.approve(ContractAddresses.EMASXLending, amountWei);
          await txApprove.wait();
        }

        const txDeposit = await lending.deposit(amountWei);
        await txDeposit.wait();
      }

      // 2. Borrow IDRX if amount > 0
      if (borrowAmount && Number(borrowAmount) > 0) {
        const amountWei = ethers.parseEther(borrowAmount);
        const txBorrow = await lending.borrow(amountWei);
        await txBorrow.wait();
      }

      // Reset inputs
      setCollateralAmount('');
      setBorrowAmount('');
      alert("Transaction Successful!");
      
      // Refresh data immediately
      const pos = await lending.positions(account);
        setUserPosition({
        collateral: ethers.formatEther(pos.collateral),
        debt: ethers.formatEther(pos.debt)
      });
      const emasxBal = await emasx.balanceOf(account);
      setUserBalance(prev => ({ ...prev, emasx: ethers.formatEther(emasxBal) }));

    } catch (err: any) {
      console.error("Borrow failed:", err);
      alert("Transaction Failed: " + (err.message || err));
    } finally {
      setIsTransacting(false);
    }
  };

  // Calculate LTV
  const currentCollateral = Number(userPosition.collateral) + (Number(collateralAmount) || 0);
  const currentDebt = Number(userPosition.debt) + (Number(borrowAmount) || 0);
  const collateralValue = currentCollateral * Number(goldPrice);
  const ltv = collateralValue > 0 ? (currentDebt / collateralValue) * 100 : 0;
  
  // Calculate Liquidation Price (when LTV hits 80%)
  // 80% = Debt / (Collateral * LiqPrice) => LiqPrice = Debt / (Collateral * 0.8)
  const liquidationPrice = currentCollateral > 0 ? currentDebt / (currentCollateral * 0.8) : 0;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <Skeleton className="h-10 w-64 mx-auto mb-2" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-[500px] w-full rounded-2xl" />
          <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

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
                <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-full shadow-sm min-w-fit">
                  <img src={EmasxIcon} alt="EMASX" className="w-6 h-6 rounded-full shrink-0" />
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
                <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-full shadow-sm min-w-fit">
                  <img src={IdrxIcon} alt="IDRX" className="w-6 h-6 rounded-full shrink-0" />
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
                 <p className="text-xl font-bold text-yellow-400">${Number(goldPrice).toLocaleString()}</p>
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
