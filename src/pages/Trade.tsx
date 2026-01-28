import React from 'react';
import SwapCard from '../components/SwapCard';
import GoldChart from '../components/GoldChart';

export default function Trade() {
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
