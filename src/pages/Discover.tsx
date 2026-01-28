import React from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

export default function Discover() {
  const offers = [
    { id: 1, type: 'Buy', amount: '10 XNTM', price: '5,378.20 IDRX', total: '53,782.00 IDRX', user: '0x12...34ab' },
    { id: 2, type: 'Sell', amount: '5 XNTM', price: '5,380.50 IDRX', total: '26,902.50 IDRX', user: '0x56...78cd' },
    { id: 3, type: 'Buy', amount: '2.5 XNTM', price: '5,377.90 IDRX', total: '13,444.75 IDRX', user: '0x90...12ef' },
    { id: 4, type: 'Sell', amount: '100 XNTM', price: '5,382.00 IDRX', total: '538,200.00 IDRX', user: '0x34...56gh' },
    { id: 5, type: 'Buy', amount: '0.5 XNTM', price: '5,379.00 IDRX', total: '2,689.50 IDRX', user: '0x78...90ij' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discover Offers</h1>
          <p className="text-gray-500 mt-1">Browse active limit orders from other users</p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by address..." 
              className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700">
            <Filter size={20} />
            Filter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Type</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Amount (XNTM)</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Price (IDRX)</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Total (IDRX)</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">User</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {offers.map((offer) => (
                <tr key={offer.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      offer.type === 'Buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {offer.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{offer.amount}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{offer.price}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{offer.total}</td>
                  <td className="px-6 py-4 text-sm text-primary font-mono cursor-pointer hover:underline">
                    {offer.user}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-sm font-medium text-primary hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                      Trade
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-100 flex justify-center">
          <button className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
            Show more
            <ArrowUpDown size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
