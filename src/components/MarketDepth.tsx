import React from 'react';

export default function MarketDepth() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm h-full flex flex-col items-center justify-center min-h-[300px]">
      <h3 className="text-sm font-medium text-gray-500 mb-8">Market Depth - IDRX / EMASX</h3>
      
      {/* Simple CSS Bar Chart Mock */}
      <div className="relative w-full max-w-xs h-40 flex items-end justify-center gap-1">
        <div className="w-full absolute bottom-0 border-b border-gray-200 border-dashed w-full"></div>
        <div className="absolute bottom-[-24px] text-xs font-medium text-gray-600">5,392.76</div>
        <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 text-xs text-gray-400">Market</div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full border-l border-blue-300 border-dashed z-0"></div>

        {/* Sell Side */}
        <div className="w-4 bg-blue-200 rounded-t-sm h-[20%] hover:bg-blue-300 transition-colors cursor-pointer" title="Sell Order"></div>
        <div className="w-4 bg-blue-200 rounded-t-sm h-[40%] hover:bg-blue-300 transition-colors cursor-pointer" title="Sell Order"></div>
        <div className="w-4 bg-blue-200 rounded-t-sm h-[15%] hover:bg-blue-300 transition-colors cursor-pointer" title="Sell Order"></div>
        
        {/* Buy Side */}
        <div className="w-4 bg-blue-400 rounded-t-sm h-[60%] hover:bg-blue-500 transition-colors cursor-pointer" title="Buy Order"></div>
        <div className="w-4 bg-blue-400 rounded-t-sm h-[80%] hover:bg-blue-500 transition-colors cursor-pointer" title="Buy Order"></div>
        <div className="w-4 bg-blue-400 rounded-t-sm h-[30%] hover:bg-blue-500 transition-colors cursor-pointer" title="Buy Order"></div>
      </div>
      
      <p className="mt-8 text-xs text-gray-400 text-center max-w-[200px]">
        Visualize the order book liquidity. Blue bars represent buy/sell volume at different price levels.
      </p>
    </div>
  );
}
