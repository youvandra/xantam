import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { ethers } from 'ethers';
import { useContracts } from '../hooks/useContracts';
import ContractAddresses from '../abis/contract-address.json';

interface Trade {
  id: string;
  type: 'buy' | 'sell';
  price: string;
  amount: string;
  total: string;
  time: string;
  hash: string;
}

export default function RecentTrades() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const { getContract } = useContracts();

  useEffect(() => {
    let isMounted = true;

    const fetchTrades = async () => {
      try {
        const emasx = await getContract('EMASX', require('../abis/EMASX.json'));
        const idrx = await getContract('MockIDRX', require('../abis/MockIDRX.json'));
        const swapAddress = ContractAddresses.EMASXSwap;

        if (!emasx || !idrx) return;

        // Fetch recent EMASX transfers involving the Swap contract
        // We look for transfers FROM Swap (Buy) or TO Swap (Sell)
        const filterFromSwap = emasx.filters.Transfer(swapAddress, null);
        const filterToSwap = emasx.filters.Transfer(null, swapAddress);

        const [fromEvents, toEvents] = await Promise.all([
          emasx.queryFilter(filterFromSwap, -1000), // Last 1000 blocks
          emasx.queryFilter(filterToSwap, -1000)
        ]);

        const allEvents = [...fromEvents, ...toEvents].sort((a, b) => b.blockNumber - a.blockNumber);
        
        // Take top 10 most recent
        const recentEvents = allEvents.slice(0, 10);

        const tradePromises = recentEvents.map(async (event: any) => {
           const block = await event.getBlock();
           const txHash = event.transactionHash;
           const isBuy = event.args[0].toLowerCase() === swapAddress.toLowerCase(); // From Swap = Buy
           const amount = ethers.formatEther(event.args[2]); // EMASX Amount

           // Try to find corresponding IDRX transfer in the same transaction
           // Since we can't easily query by txHash across contracts without indexing,
           // we'll fetch IDRX events in a small range around this block or assume price.
           // BETTER APPROACH: Get Transaction Receipt logs
           // But for frontend simplicity, let's just fetch the IDRX logs for this block and filter by txHash
           
           const idrxFilter = idrx.filters.Transfer();
           const idrxEvents = await idrx.queryFilter(idrxFilter, event.blockNumber, event.blockNumber);
           const matchingIdrxEvent = idrxEvents.find((e: any) => e.transactionHash === txHash);
           
           let total = '0';
           let price = '0';

           if (matchingIdrxEvent && matchingIdrxEvent.args) {
              total = ethers.formatEther(matchingIdrxEvent.args[2]);
              price = (Number(total) / Number(amount)).toFixed(0);
           } else {
             // Fallback if no IDRX transfer found (should not happen in atomic swap)
             price = '0'; 
           }

           return {
             id: txHash + event.logIndex,
             type: isBuy ? 'buy' : 'sell' as 'buy' | 'sell',
             price: price,
             amount: Number(amount).toFixed(4),
             total: Number(total).toFixed(0),
             time: new Date(block.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
             hash: txHash
           };
        });

        const resolvedTrades = await Promise.all(tradePromises);
        if (isMounted) {
            setTrades(resolvedTrades.filter(t => Number(t.price) > 0)); // Filter out incomplete data
        }

      } catch (err) {
        console.error("Failed to fetch trades:", err);
      }
    };

    fetchTrades();

    // Set up listeners for real-time updates
    // Note: Implementing robust real-time listeners requires careful cleanup
    const interval = setInterval(fetchTrades, 10000); // Poll every 10s for simplicity

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [getContract]);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Clock size={20} className="text-gray-400" />
          Market Activity
        </h3>
        <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full animate-pulse">
          Live
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
              <th className="pb-3 pl-2 font-medium">Type</th>
              <th className="pb-3 font-medium text-right">Price (IDRX)</th>
              <th className="pb-3 font-medium text-right">Amount (EMASX)</th>
              <th className="pb-3 font-medium text-right">Total (IDRX)</th>
              <th className="pb-3 font-medium text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {trades.map((trade) => (
              <tr key={trade.id} className="text-sm hover:bg-gray-50 transition-colors group cursor-default">
                <td className="py-4 pl-2">
                  <span className={`flex items-center gap-1.5 font-bold ${trade.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                    {trade.type === 'buy' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                    {trade.type === 'buy' ? 'Buy' : 'Sell'}
                  </span>
                </td>
                <td className="py-4 text-right font-mono font-medium text-gray-900">
                  {Number(trade.price).toLocaleString('id-ID')}
                </td>
                <td className="py-4 text-right font-mono text-gray-600">
                  {trade.amount}
                </td>
                <td className="py-4 text-right font-mono text-gray-900">
                  {Number(trade.total).toLocaleString('id-ID')}
                </td>
                <td className="py-4 text-right text-gray-400 text-xs font-mono">
                  {trade.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
