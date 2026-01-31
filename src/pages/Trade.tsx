import { useState, useEffect } from 'react';
import SwapCard from '../components/SwapCard';
import GoldChart from '../components/GoldChart';
import Skeleton from '../components/Skeleton';

export default function Trade() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-7xl mx-auto">
        <div className="lg:col-span-8">
          <Skeleton className="w-full h-[600px] rounded-2xl" />
        </div>
        
        <div className="lg:col-span-4">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-[400px] w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-7xl mx-auto">
      <div className="lg:col-span-8 lg:sticky lg:top-24">
        {/* TradingView Chart */}
        <div className="w-full h-[600px]">
           <GoldChart />
        </div>
      </div>
      
      <div className="lg:col-span-4">
        <SwapCard />
      </div>
    </div>
  );
}
