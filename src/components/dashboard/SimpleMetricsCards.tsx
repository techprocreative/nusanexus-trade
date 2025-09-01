import React from 'react';
import { DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';

interface MetricsData {
  equity: number;
  todaysSale: number; // This represents open positions now
  profit: number;
}

interface SimpleMetricsCardsProps {
  data: MetricsData;
  loading?: boolean;
}

const SimpleMetricsCards: React.FC<SimpleMetricsCardsProps> = ({ data, loading = false }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-300 rounded w-16 mb-2"></div>
      <div className="h-8 bg-gray-300 rounded w-24"></div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Equity Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-gray-700 font-medium">Equity</span>
        </div>
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(data.equity)}
            </div>
            <div className="text-sm text-gray-500">Daily</div>
          </>
        )}
      </div>

      {/* Open Positions Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-gray-700 font-medium">Open Positions</span>
        </div>
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {data.todaysSale}
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <span>Active</span>
            </div>
          </>
        )}
      </div>

      {/* Profit Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <span className="text-gray-700 font-medium">Profit</span>
        </div>
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              <span className={data.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                {data.profit >= 0 ? '+' : ''}${formatCurrency(Math.abs(data.profit))}
              </span>
            </div>
            <div className="text-sm text-gray-500">Today's P&L</div>
          </>
        )}
      </div>
    </div>
  );
};

export default SimpleMetricsCards;