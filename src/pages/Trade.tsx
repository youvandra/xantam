import React from 'react';
import SwapCard from '../components/SwapCard';
import MarketDepth from '../components/MarketDepth';

export default function Trade() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-6xl mx-auto">
      <div className="lg:col-span-7 lg:sticky lg:top-24">
        {/* Just a placeholder for the left area - could be charts, info, etc */}
        <div className="aspect-[4/3] w-full">
           <MarketDepth />
        </div>
      </div>
      
      <div className="lg:col-span-5">
        <SwapCard />
      </div>
    </div>
  );
}
