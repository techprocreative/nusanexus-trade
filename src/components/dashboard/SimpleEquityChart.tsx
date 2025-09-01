import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface ChartDataPoint {
  time: string;
  value: number;
}

interface SimpleEquityChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
  error?: string;
}

const SimpleEquityChart: React.FC<SimpleEquityChartProps> = ({ data, loading = false, error }) => {

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 text-white p-2 rounded-lg shadow-lg border border-gray-600">
          <p className="text-xs text-gray-300">{`Time: ${label}`}</p>
          <p className="text-sm font-semibold">
            {`Value: ${new Intl.NumberFormat('en-US').format(payload[0].value)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-300 rounded w-1/2 mb-6"></div>
          <div className="h-48 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">Error loading chart data</div>
          <div className="text-gray-400 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">No chart data available</div>
          <div className="text-gray-400 text-sm">Chart will appear when data is loaded</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-2xl p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-white font-semibold text-lg mb-2">Real-time Equity Graph</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-gray-400 text-sm">Data Real-time • Update setiap 2 detik</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#equityGradient)"
              dot={false}
              activeDot={{ r: 4, stroke: '#10b981', strokeWidth: 2, fill: '#1f2937' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SimpleEquityChart;