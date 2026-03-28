import React, { useState, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { Card, Stack, Text } from '@/components/ui/index.ts';

const MerchantHub: React.FC = () => {
  const intl = useIntl();
  const [merchantData, setMerchantData] = useState({
    totalSavings: 12847.50,
    capitalVelocity: 400,
    activeExperts: 24,
    matchingRate: 94.3,
    budgetAvailable: 2450.00,
    dailySpend: 127.50,
    roi7day: 3247,
    transactions: [
      { id: 'TXN-2024-001', merchant: 'FashionHub Inc', amount: 247.50, settlement: 'Instant', savings: 185.63, status: 'Settled' },
      { id: 'TXN-2024-002', merchant: 'TechGadgets Ltd', amount: 189.99, settlement: 'T+1', savings: 142.49, status: 'Processing' },
      { id: 'TXN-2024-003', merchant: 'HomeDecor Pro', amount: 456.78, settlement: 'Instant', savings: 342.59, status: 'Settled' },
    ]
  });

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setMerchantData(prev => ({
        ...prev,
        totalSavings: prev.totalSavings + (Math.random() - 0.5) * 100,
        capitalVelocity: Math.max(300, prev.capitalVelocity + (Math.random() - 0.5) * 20)
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Merchant Center - Web 2.5 Revenue Engine
        </h1>
        <p className="text-gray-600">
          跨境卖家的P2P广告革命：省90%成本，收款即时化，让中小卖家成为流量主宰者
        </p>
      </div>

      {/* AI Insights Panel */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">🤖 AI-Powered Insights</h3>
            <p className="text-blue-700 text-sm">Real-time analysis of your P2P advertising performance</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              ${merchantData.totalSavings.toFixed(2)}
            </div>
            <div className="text-xs text-gray-600">Total Savings This Month</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white p-3 rounded border border-gray-200">
            <div className="text-lg font-bold text-blue-600">{merchantData.matchingRate}%</div>
            <div className="text-xs text-gray-600">AI Matching Rate</div>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200">
            <div className="text-lg font-bold text-green-600">+{Math.round(merchantData.capitalVelocity)}%</div>
            <div className="text-xs text-gray-600">Capital Velocity</div>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200">
            <div className="text-lg font-bold text-yellow-600">{merchantData.roi7day}%</div>
            <div className="text-xs text-gray-600">Avg ROI</div>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ad Cost Comparison */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b border-gray-200 pb-2">
            📉 Ad Cost Comparison
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Market Avg (Google/FB)</span>
              <span className="text-red-600 font-semibold">$1.5 - $3.0 / Click</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">AdNostr P2P Cost</span>
              <span className="text-green-600 font-semibold">$0.15 - $0.30 / Click</span>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Savings</span>
                <span className="text-yellow-600 font-bold text-xl">${merchantData.totalSavings.toFixed(2)}</span>
              </div>
              <div className="text-gray-600 text-sm mt-1">90% cost reduction achieved</div>
            </div>
          </div>
        </Card>

        {/* Settlement Speed */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b border-gray-200 pb-2">
            ⚡ Settlement Speed
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Traditional Cycle</span>
              <span className="text-red-600 font-semibold">14 - 28 Days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">AdNostr Settlement</span>
              <span className="text-green-600 font-semibold">Real-time (Lightning)</span>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Capital Velocity</span>
                <span className="text-blue-600 font-bold text-xl">+{Math.round(merchantData.capitalVelocity)}%</span>
              </div>
              <div className="text-gray-600 text-sm mt-1">Funds available instantly vs 2-4 weeks</div>
            </div>
          </div>
        </Card>

        {/* P2P Traffic Matching */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b border-gray-200 pb-2">
            🤝 P2P Traffic Matching
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Active Experts</span>
              <span className="text-green-600 font-semibold">{merchantData.activeExperts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Avg Expert Score</span>
              <span className="text-yellow-600 font-semibold">8.7/10</span>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Matching Rate</span>
                <span className="text-purple-600 font-bold text-xl">{merchantData.matchingRate}%</span>
              </div>
              <div className="text-gray-600 text-sm mt-1">AI-powered traffic-to-product matching</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Merchant Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Management */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 border-b border-gray-200 pb-2">
            💰 Budget Management
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Available Budget</span>
              <span className="text-green-600 font-semibold">${merchantData.budgetAvailable.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Today's Spend</span>
              <span className="text-blue-600 font-semibold">${merchantData.dailySpend.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">ROI (7-day)</span>
              <span className="text-yellow-600 font-semibold">{merchantData.roi7day}%</span>
            </div>
            <button className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors mt-4">
              🔄 Top Up Budget
            </button>
          </div>
        </Card>

        {/* Active Campaigns */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 border-b border-gray-200 pb-2">
            📢 Active Campaigns
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-900 font-medium">Summer Dress Collection</span>
                <span className="text-green-600 text-sm">Active</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Clicks: 1,247</span>
                <span className="text-gray-600">Conv: 3.2%</span>
                <span className="text-gray-600">Revenue: $847</span>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-900 font-medium">Tech Gadget Launch</span>
                <span className="text-yellow-600 text-sm">Pending</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Target: 2,000 clicks</span>
                <span className="text-gray-600">Budget: $500</span>
              </div>
            </div>
          </div>
          <button className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors mt-4">
            ➕ New Campaign
          </button>
        </Card>
      </div>

      {/* Recent Transactions Table */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 border-b border-gray-200 pb-2">
          📊 Recent Cross-Border Transactions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-gray-700">Transaction ID</th>
                <th className="text-left py-2 px-3 text-gray-700">Merchant</th>
                <th className="text-left py-2 px-3 text-gray-700">Amount (USD)</th>
                <th className="text-left py-2 px-3 text-gray-700">Settlement Time</th>
                <th className="text-left py-2 px-3 text-gray-700">P2P Savings</th>
                <th className="text-left py-2 px-3 text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {merchantData.transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="py-3 px-3 text-gray-900">#{transaction.id}</td>
                  <td className="py-3 px-3 text-gray-900">{transaction.merchant}</td>
                  <td className="py-3 px-3 text-green-600">${transaction.amount.toFixed(2)}</td>
                  <td className="py-3 px-3 text-blue-600">{transaction.settlement}</td>
                  <td className="py-3 px-3 text-yellow-600">${transaction.savings.toFixed(2)}</td>
                  <td className="py-3 px-3">
                    {transaction.status === 'Settled' ? (
                      <span className="text-green-600">✓ Settled</span>
                    ) : (
                      <span className="text-yellow-600">⟳ {transaction.status}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <p className="text-gray-600 text-sm">Showing last {merchantData.transactions.length} transactions</p>
          <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors text-sm">
            📄 Export Full Report
          </button>
        </div>
      </Card>
    </div>
  );
};

export default MerchantHub;