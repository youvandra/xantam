import { useState, useEffect } from 'react';
import { ShieldCheck, TrendingUp, HandCoins, PlusCircle, X } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useContracts } from '../hooks/useContracts';
import { useToast } from '../context/ToastContext';
import ContractAddresses from '../abis/contract-address.json';
import { ethers } from 'ethers';
import Skeleton from '../components/Skeleton';
import EmasxIcon from '../assets/EMASX.svg';
import IdrxIcon from '../assets/IDRX.svg';

const formatCompactNumber = (number: number) => {
  return new Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(number);
};

export default function Loans() {
  const { account, connect } = useWallet();
  const contracts = useContracts();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'deposit' | 'borrow' | 'repay' | 'withdraw'>('deposit');
  const [depositAmount, setDepositAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [repayAmount, setRepayAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [maxLtv, setMaxLtv] = useState('60');
  const [isLoading, setIsLoading] = useState(true);
  const [isTransacting, setIsTransacting] = useState(false);
  
  const [userBalance, setUserBalance] = useState({ emasx: '0', idrx: '0' });
  const [userPosition, setUserPosition] = useState({ collateral: '0', debt: '0' });
  const [goldPrice, setGoldPrice] = useState('0');
  const [goldPriceUsd, setGoldPriceUsd] = useState('0');
  const [marketStats, setMarketStats] = useState({
    tvl: '0',
    treasuryBalance: '0',
    lendingLiquidity: '0'
  });
  const [treasuryOwner, setTreasuryOwner] = useState('');
  const [isAddLiquidityOpen, setIsAddLiquidityOpen] = useState(false);
  const [liquidityAmount, setLiquidityAmount] = useState('');
  const [liquiditySource, setLiquiditySource] = useState<'wallet' | 'treasury'>('wallet');

  // Fetch live price consistent with Trade page
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=pax-gold,tether&vs_currencies=usd,idr');
        const data = await response.json();
        
        if (data['pax-gold']?.usd && data['tether']?.idr) {
          const xauUsd = data['pax-gold'].usd;
          const usdIdr = data['tether'].idr;
          
          // Formula: (XAUUSD * USDIDR) / 31.1035
          const pricePerGram = Math.floor((xauUsd * usdIdr) / 31.1035);
          setGoldPrice(pricePerGram.toString());
          
          // Price per gram in USD
          const pricePerGramUsd = xauUsd / 31.1035;
          setGoldPriceUsd(pricePerGramUsd.toString());
        }
      } catch (error) {
        console.error("Failed to fetch live price:", error);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Market Stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!contracts) return;
      
      try {
        const emasx = await contracts.getEMASX();
        const idrx = await contracts.getMockIDRX();
        
        if (emasx && idrx) {
          // Calculate TVL: EMASX balance of Lending Contract
          const lendingBalance = await emasx.balanceOf(ContractAddresses.EMASXLending);
          const lendingBalanceFormatted = ethers.formatEther(lendingBalance);
          
          // Get Treasury Balance: IDRX balance of Treasury
          const treasuryBal = await idrx.balanceOf(ContractAddresses.Treasury);
          const treasuryBalFormatted = ethers.formatEther(treasuryBal);
          
          // Get Lending Contract Liquidity: IDRX balance of Lending Contract
          const lendingLiquidity = await idrx.balanceOf(ContractAddresses.EMASXLending);
          const lendingLiquidityFormatted = ethers.formatEther(lendingLiquidity);
          
          setMarketStats({
            tvl: lendingBalanceFormatted,
            treasuryBalance: treasuryBalFormatted,
            lendingLiquidity: lendingLiquidityFormatted
          });
        }

        // Get Treasury Owner
        const treasury = await contracts.getTreasury();
        if (treasury) {
           const owner = await treasury.owner();
           setTreasuryOwner(owner);
        }

        // Fetch LTV from contract
        const lending = await contracts.getLending();
        if (lending) {
          const ltvVal = await lending.LTV();
          if (ltvVal) {
            setMaxLtv(ltvVal.toString());
          }
        }
      } catch (err) {
        console.error("Failed to fetch market stats:", err);
      }
    };
    
    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [contracts]);

  useEffect(() => {
    const fetchData = async () => {
      if (!contracts || !account) {
        setIsLoading(false);
        return;
      }

      try {
        const emasx = await contracts.getEMASX();
        const lending = await contracts.getLending();

        if (emasx && lending) {
          // Get Balances
          const emasxBal = await emasx.balanceOf(account);
          setUserBalance(prev => ({ ...prev, emasx: ethers.formatEther(emasxBal) }));

          // Get Position
          const pos = await lending.positions(account);
          setUserPosition({
            collateral: ethers.formatEther(pos.collateral),
            debt: ethers.formatEther(pos.debt)
          });
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

  const handleDeposit = async () => {
    if (!contracts || !account) {
      connect();
      return;
    }

    setIsTransacting(true);
    try {
      const emasx = await contracts.getEMASX();
      const lending = await contracts.getLending();

      if (!emasx || !lending) throw new Error("Contracts not loaded");

      if (depositAmount && Number(depositAmount) > 0) {
        const amountWei = ethers.parseEther(depositAmount);
        
        // Check Allowance
        const allowance = await emasx.allowance(account, ContractAddresses.EMASXLending);
        if (allowance < amountWei) {
          const txApprove = await emasx.approve(ContractAddresses.EMASXLending, amountWei);
          await txApprove.wait();
        }

        const txDeposit = await lending.deposit(amountWei);
        await txDeposit.wait();

        setDepositAmount('');
        showToast('success', "Deposit Successful!");
        
        // Refresh data
        const pos = await lending.positions(account);
        setUserPosition({
          collateral: ethers.formatEther(pos.collateral),
          debt: ethers.formatEther(pos.debt)
        });
        const emasxBal = await emasx.balanceOf(account);
        setUserBalance(prev => ({ ...prev, emasx: ethers.formatEther(emasxBal) }));
      }
    } catch (err: any) {
      console.error("Deposit failed:", err);
      showToast('error', "Deposit Failed: " + (err.reason || err.message || "Unknown error"));
    } finally {
      setIsTransacting(false);
    }
  };

  const handleBorrow = async () => {
    if (!contracts || !account) {
      connect();
      return;
    }

    setIsTransacting(true);
    try {
      const lending = await contracts.getLending();
      if (!lending) throw new Error("Contracts not loaded");

      if (borrowAmount && Number(borrowAmount) > 0) {
        const amountWei = ethers.parseEther(borrowAmount);
        
        // Check Protocol Liquidity
        const liquidityWei = ethers.parseEther(marketStats.lendingLiquidity || '0');
        if (amountWei > liquidityWei) {
           showToast('error', "Insufficient Protocol Liquidity. Try a smaller amount.");
           setIsTransacting(false);
           return;
        }

        const txBorrow = await lending.borrow(amountWei);
        await txBorrow.wait();

        setBorrowAmount('');
        showToast('success', "Borrow Successful!");
        
        // Refresh data
        const pos = await lending.positions(account);
        setUserPosition({
          collateral: ethers.formatEther(pos.collateral),
          debt: ethers.formatEther(pos.debt)
        });
      }
    } catch (err: any) {
      console.error("Borrow failed:", err);
      // Check for ERC20InsufficientBalance error (0xe450d38c)
      const isInsufficientBalance = 
        (err?.data && err.data.includes('0xe450d38c')) || 
        (err?.message && (err.message.includes('transfer amount exceeds balance') || err.message.includes('0xe450d38c')));
      
      if (isInsufficientBalance) {
         showToast('error', "Borrow Failed: Insufficient Protocol Liquidity");
      } else {
         showToast('error', "Borrow Failed: " + (err.reason || err.message || "Unknown error"));
      }
    } finally {
      setIsTransacting(false);
    }
  };
  const handleRepay = async () => {
    if (!contracts || !account) {
      connect();
      return;
    }

    setIsTransacting(true);
    try {
      const lending = await contracts.getLending();
      const idrx = await contracts.getMockIDRX();

      if (!lending || !idrx) throw new Error("Contracts not loaded");

      if (repayAmount && Number(repayAmount) > 0) {
        const amountWei = ethers.parseEther(repayAmount);
        
        // Check Allowance for IDRX
        const allowance = await idrx.allowance(account, ContractAddresses.EMASXLending);
        if (allowance < amountWei) {
          const txApprove = await idrx.approve(ContractAddresses.EMASXLending, amountWei);
          await txApprove.wait();
        }

        const txRepay = await lending.repay(amountWei);
        await txRepay.wait();

        setRepayAmount('');
        showToast('success', "Repay Successful!");
        
        // Refresh data
        const pos = await lending.positions(account);
        setUserPosition({
          collateral: ethers.formatEther(pos.collateral),
          debt: ethers.formatEther(pos.debt)
        });
      }
    } catch (err: any) {
      console.error("Repay failed:", err);
      showToast('error', "Repay Failed: " + (err.reason || err.message || "Unknown error"));
    } finally {
      setIsTransacting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!contracts || !account) {
      connect();
      return;
    }

    setIsTransacting(true);
    try {
      const lending = await contracts.getLending();
      const emasx = await contracts.getEMASX();

      if (!lending || !emasx) throw new Error("Contracts not loaded");

      if (withdrawAmount && Number(withdrawAmount) > 0) {
        const amountWei = ethers.parseEther(withdrawAmount);
        const txWithdraw = await lending.withdraw(amountWei);
        await txWithdraw.wait();

        setWithdrawAmount('');
        showToast('success', "Withdraw Successful!");
        
        // Refresh data
        const pos = await lending.positions(account);
        setUserPosition({
          collateral: ethers.formatEther(pos.collateral),
          debt: ethers.formatEther(pos.debt)
        });
        const emasxBal = await emasx.balanceOf(account);
        setUserBalance(prev => ({ ...prev, emasx: ethers.formatEther(emasxBal) }));
      }
    } catch (err: any) {
      console.error("Withdraw failed:", err);
      showToast('error', "Withdraw Failed: " + (err.reason || err.message || "Unknown error"));
    } finally {
      setIsTransacting(false);
    }
  };

  const handleAddLiquidity = async () => {
    if (!contracts || !account) return;
    
    if (!liquidityAmount || Number(liquidityAmount) <= 0) {
      showToast('error', "Enter a valid amount");
      return;
    }

    setIsTransacting(true);
    try {
      const amountWei = ethers.parseEther(liquidityAmount);
      
      if (liquiditySource === 'wallet') {
          const idrx = await contracts.getMockIDRX();
          if (!idrx) throw new Error("IDRX contract not found");
          
          // Direct transfer to Lending Contract
          const tx = await idrx.transfer(ContractAddresses.EMASXLending, amountWei);
          await tx.wait();
      } else {
          // Treasury Withdrawal to Lending Contract
          const treasury = await contracts.getTreasury();
          if (!treasury) throw new Error("Treasury contract not found");
          
          const tx = await treasury.withdraw(ContractAddresses.EMASXLending, amountWei);
          await tx.wait();
      }
      
      showToast('success', "Liquidity Added Successfully!");
      setLiquidityAmount('');
      setIsAddLiquidityOpen(false);
      
      // Refresh stats immediately
      const idrx = await contracts.getMockIDRX();
      if (idrx) {
        const liq = await idrx.balanceOf(ContractAddresses.EMASXLending);
        setMarketStats(prev => ({
          ...prev,
          lendingLiquidity: ethers.formatEther(liq)
        }));
      }

    } catch (err: any) {
       console.error("Add Liquidity failed:", err);
       showToast('error', "Failed: " + (err.reason || err.message || "Unknown error"));
    } finally {
       setIsTransacting(false);
    }
  };

  // Calculate LTV
  // For Borrow: Current Position + New Collateral & Debt
  // For Repay: Current Position - Repay & Withdraw
  let projectedCollateral = Number(userPosition.collateral);
  let projectedDebt = Number(userPosition.debt);

  if (activeTab === 'deposit') {
    projectedCollateral += (Number(depositAmount) || 0);
  } else if (activeTab === 'borrow') {
    projectedDebt += (Number(borrowAmount) || 0);
  } else if (activeTab === 'repay') {
    projectedDebt -= (Number(repayAmount) || 0);
  } else if (activeTab === 'withdraw') {
    projectedCollateral -= (Number(withdrawAmount) || 0);
  }

  if (projectedCollateral < 0) projectedCollateral = 0;
  if (projectedDebt < 0) projectedDebt = 0;

  const collateralValue = projectedCollateral * Number(goldPrice);
  const ltv = collateralValue > 0 ? (projectedDebt / collateralValue) * 100 : 0;
  
  // Calculate Liquidation Price (when LTV hits 80%)
  // 80% = Debt / (Collateral * LiqPrice) => LiqPrice = Debt / (Collateral * 0.8)
  const liquidationPrice = projectedCollateral > 0 ? projectedDebt / (projectedCollateral * (Number(maxLtv) / 100) * 0.8 / 0.6) : 0; 
  
  const actualLiquidationPrice = projectedCollateral > 0 ? projectedDebt / (projectedCollateral * (Number(maxLtv) / 100)) : 0;

  // Calculate Available to Borrow
  const currentCollateralValue = Number(userPosition.collateral) * Number(goldPrice);
  const maxBorrowPossible = currentCollateralValue * (Number(maxLtv) / 100);
  const availableBorrow = Math.max(0, maxBorrowPossible - Number(userPosition.debt));

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

      {/* Market Stats Section */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Total Value Locked</p>
          <p className="text-xl font-bold text-gray-900">
            {formatCompactNumber(Number(marketStats.tvl) * Number(goldPrice))} IDRX
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center relative group">
          <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Pool Liquidity</p>
          <p className="text-xl font-bold text-gray-900">
            {formatCompactNumber(Number(marketStats.lendingLiquidity))} IDRX
          </p>
          <button 
             onClick={() => setIsAddLiquidityOpen(true)}
             className="absolute top-2 right-2 p-1 text-gray-400 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
             title="Add Liquidity"
          >
             <PlusCircle size={16} />
          </button>
        </div>
      </div>

      {/* Main Action Section */}
      <div className="max-w-xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto no-scrollbar">
             {['deposit', 'borrow', 'repay', 'withdraw'].map((tab) => (
               <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`text-sm font-bold flex items-center gap-2 px-4 py-2 rounded-full transition-all whitespace-nowrap ${
                    activeTab === tab 
                      ? 'bg-primary text-white shadow-md shadow-blue-500/20' 
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
               >
                  {(tab === 'deposit' || tab === 'borrow') && <TrendingUp size={16} />}
                  {(tab === 'repay' || tab === 'withdraw') && <HandCoins size={16} />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
               </button>
             ))}
          </div>

          <div className="space-y-6">
            {activeTab === 'deposit' && (
                <div className="bg-gray-50 rounded-xl p-4 hover:ring-1 hover:ring-primary/20 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500 font-medium">Deposit Collateral</span>
                    <span className="text-sm text-gray-500">Balance: {Number(userBalance.emasx).toLocaleString('en-US')}</span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-full shadow-sm min-w-fit">
                      <img src={EmasxIcon} alt="EMASX" className="w-6 h-6 rounded-full shrink-0" />
                      <span className="font-semibold text-gray-900">EMASX</span>
                    </div>
                    <input   
                      type="text" 
                      value={depositAmount}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^\d*\.?\d*$/.test(val)) {
                          setDepositAmount(val);
                        }
                      }}
                      className="text-right text-3xl font-bold bg-transparent border-none focus:outline-none w-full text-gray-900 placeholder-gray-300"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-2">
                      {['0', 'Half', 'Max'].map((label) => (
                        <button 
                          key={label} 
                          onClick={() => {
                            const balance = Number(userBalance.emasx);
                            let val = '';
                            if (label === '0') val = '0';
                            if (label === 'Half') val = (balance / 2).toString();
                            if (label === 'Max') val = balance.toString();
                            setDepositAmount(val);
                          }}
                          className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-md text-gray-600 hover:bg-gray-100"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <span className="text-sm text-gray-400">
                      ~ {((Number(depositAmount) || 0) * (Number(goldPrice) || 0)).toLocaleString('id-ID', { maximumFractionDigits: 0 })} IDRX
                    </span>
                  </div>
                </div>
            )}

            {activeTab === 'borrow' && (
                <div className="bg-gray-50 rounded-xl p-4 hover:ring-1 hover:ring-primary/20 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500 font-medium">Borrow Amount</span>
                    <span className="text-sm text-gray-500">Available: {formatCompactNumber(availableBorrow)} IDRX</span>
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
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setBorrowAmount(Math.floor(availableBorrow).toString())}
                        className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-md text-gray-600 hover:bg-gray-100"
                      >
                        Max
                      </button>
                    </div>
                    <span className="text-sm text-gray-400">
                      Price: {Number(goldPrice).toLocaleString('id-ID')} IDRX / 1 EMASX
                    </span>
                  </div>
                </div>
            )}

            {activeTab === 'repay' && (
                <div className="bg-gray-50 rounded-xl p-4 hover:ring-1 hover:ring-primary/20 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500 font-medium">Repay Amount</span>
                    <span className="text-sm text-gray-500">Debt: {Number(userPosition.debt).toLocaleString('en-US')}</span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-full shadow-sm min-w-fit">
                      <img src={IdrxIcon} alt="IDRX" className="w-6 h-6 rounded-full shrink-0" />
                      <span className="font-semibold text-gray-900">IDRX</span>
                    </div>
                    <input   
                      type="text" 
                      value={repayAmount}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^\d*\.?\d*$/.test(val)) {
                          setRepayAmount(val);
                        }
                      }}
                      className="text-right text-3xl font-bold bg-transparent border-none focus:outline-none w-full text-gray-900 placeholder-gray-300"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                     <div className="flex gap-2">
                      <button 
                        onClick={() => setRepayAmount(userPosition.debt)}
                        className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-md text-gray-600 hover:bg-gray-100"
                      >
                        Max Debt
                      </button>
                    </div>
                  </div>
                </div>
            )}

            {activeTab === 'withdraw' && (
                <div className="bg-gray-50 rounded-xl p-4 hover:ring-1 hover:ring-primary/20 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500 font-medium">Withdraw Collateral</span>
                    <span className="text-sm text-gray-500">Locked: {Number(userPosition.collateral).toLocaleString('en-US')}</span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-full shadow-sm min-w-fit">
                      <img src={EmasxIcon} alt="EMASX" className="w-6 h-6 rounded-full shrink-0" />
                      <span className="font-semibold text-gray-900">EMASX</span>
                    </div>
                    <input   
                      type="text" 
                      value={withdrawAmount}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^\d*\.?\d*$/.test(val)) {
                          setWithdrawAmount(val);
                        }
                      }}
                      className="text-right text-3xl font-bold bg-transparent border-none focus:outline-none w-full text-gray-900 placeholder-gray-300"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex justify-end mt-2">
                    <span className="text-sm text-gray-400">
                      Max Withdraw: Check LTV
                    </span>
                  </div>
                </div>
            )}

            {!account ? (
              <button 
                onClick={connect}
                className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                Connect Wallet
              </button>
            ) : (
              <button 
                onClick={() => {
                  if (activeTab === 'deposit') handleDeposit();
                  else if (activeTab === 'borrow') handleBorrow();
                  else if (activeTab === 'repay') handleRepay();
                  else if (activeTab === 'withdraw') handleWithdraw();
                }}
                disabled={isTransacting}
                className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                  isTransacting ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary hover:bg-blue-600 shadow-blue-500/20'
                }`}
              >
                {isTransacting ? 'Processing...' : (
                  <>
                    {(activeTab === 'deposit' || activeTab === 'borrow') && <TrendingUp className="w-5 h-5" />}
                    {(activeTab === 'repay' || activeTab === 'withdraw') && <HandCoins className="w-5 h-5" />}
                    {activeTab === 'deposit' ? 'Deposit Collateral' : 
                     activeTab === 'borrow' ? 'Borrow IDRX' :
                     activeTab === 'repay' ? 'Repay Debt' :
                     'Withdraw Collateral'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col justify-center text-center">
              <span className="text-gray-400 text-xs uppercase tracking-wider mb-1">Projected LTV</span>
              <span className={`font-bold text-lg ${ltv > Number(maxLtv) ? 'text-red-500' : 'text-gray-900'}`}>
                  {ltv > 0 ? ltv.toFixed(2) : '0.00'}% <span className="text-gray-300 text-sm font-normal">/ {maxLtv}%</span>
              </span>
           </div>
           <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col justify-center text-center">
              <span className="text-gray-400 text-xs uppercase tracking-wider mb-1">Liquidation Price</span>
              <span className="font-bold text-lg text-gray-900">
                  {actualLiquidationPrice > 0 ? Number(actualLiquidationPrice).toLocaleString('en-US', { maximumFractionDigits: 0 }) : '-'}
              </span>
           </div>
        </div>

      {/* Add Liquidity Modal */}
      {isAddLiquidityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add Pool Liquidity</h3>
              <button 
                onClick={() => setIsAddLiquidityOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setLiquiditySource('wallet')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    liquiditySource === 'wallet' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  From Wallet
                </button>
                {account && treasuryOwner && account.toLowerCase() === treasuryOwner.toLowerCase() && (
                  <button
                    onClick={() => setLiquiditySource('treasury')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                      liquiditySource === 'treasury' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    From Treasury
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (IDRX)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={liquidityAmount}
                    onChange={(e) => {
                       const val = e.target.value;
                       if (val === '' || /^\d*\.?\d*$/.test(val)) setLiquidityAmount(val);
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono"
                    placeholder="0.00"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">
                    IDRX
                  </div>
                </div>
                {liquiditySource === 'wallet' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Your Balance: {Number(userBalance.idrx).toLocaleString()} IDRX
                  </p>
                )}
                {liquiditySource === 'treasury' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Treasury Balance: {Number(marketStats.treasuryBalance).toLocaleString()} IDRX
                  </p>
                )}
              </div>

              <button
                onClick={handleAddLiquidity}
                disabled={isTransacting || !liquidityAmount || Number(liquidityAmount) <= 0}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2 mt-2"
              >
                {isTransacting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Add Liquidity
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safety Info Footer */}
        <div className="text-center pb-8">
           <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
             <ShieldCheck size={14} className="text-green-500" />
             Secured by audited smart contracts. Liquidation at &gt;{maxLtv}% LTV.
           </p>
        </div>
      </div>
    </div>
  );
}
