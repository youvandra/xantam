import React, { useState, useEffect } from 'react';
import { Package, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import Skeleton from '../components/Skeleton';

interface GoldOption {
  weight: number;
  purity: string;
  image?: string;
}

const GOLD_OPTIONS: GoldOption[] = [
  { weight: 1, purity: '99.99%' },
  { weight: 2, purity: '99.99%' },
  { weight: 5, purity: '99.99%' },
  { weight: 10, purity: '99.99%' },
  { weight: 50, purity: '99.99%' },
  { weight: 100, purity: '99.99%' },
];

export default function Claim() {
  const { account, connect } = useWallet();
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const updateQuantity = (weight: number, delta: number) => {
    setQuantities(prev => {
      const current = prev[weight] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [weight]: next };
    });
  };

  const totalWeight = Object.entries(quantities).reduce((sum, [weight, qty]) => {
    return sum + (Number(weight) * qty);
  }, 0);

  const totalEMASX = totalWeight; // Assuming 1g = 1 EMASX for simplicity, or 1 EMASX = 1g? usually EMASX is 1g tokenized gold.

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <Skeleton className="h-10 w-64 mx-auto mb-2" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[400px] w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Claim Physical Gold</h1>
        <p className="text-gray-500">Redeem your EMASX tokens for certified physical gold bars.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
        {GOLD_OPTIONS.map((option) => (
          <div key={option.weight} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="aspect-square bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl mb-6 flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-yellow-400/10 group-hover:bg-yellow-400/20 transition-colors"></div>
              <div className="w-32 h-48 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-lg shadow-lg flex flex-col items-center justify-center border-2 border-yellow-200 transform group-hover:scale-105 transition-transform">
                <div className="text-yellow-100 text-xs font-bold mb-2">FINE GOLD</div>
                <div className="text-white text-2xl font-bold mb-1">{option.weight}g</div>
                <div className="text-yellow-100 text-xs">{option.purity}</div>
              </div>
            </div>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{option.weight}g Gold Bar</h3>
                <p className="text-sm text-gray-500">Purity {option.purity}</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-primary">{option.weight} EMASX</div>
                <div className="text-xs text-gray-400">Processing Fee: ~0.5%</div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-2">
              <button 
                onClick={() => updateQuantity(option.weight, -1)}
                className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
                disabled={!quantities[option.weight]}
              >
                <Minus size={18} />
              </button>
              <span className="font-bold text-lg w-12 text-center">{quantities[option.weight] || 0}</span>
              <button 
                onClick={() => updateQuantity(option.weight, 1)}
                className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">
          <div className="hidden md:block">
            <div className="text-sm text-gray-500">Total Redemption Amount</div>
            <div className="text-2xl font-bold text-gray-900">{totalWeight}g <span className="text-base font-normal text-gray-400">({totalEMASX} EMASX)</span></div>
          </div>
          
          <div className="flex-1 md:flex-none flex gap-4">
             {!account ? (
              <button 
                onClick={connect}
                className="flex-1 md:w-64 bg-primary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                Connect Wallet
              </button>
            ) : (
              <button 
                disabled={totalWeight === 0}
                className="flex-1 md:w-64 bg-primary hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Package size={20} />
                Claim {totalWeight > 0 ? `${totalWeight}g` : ''} Gold
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
