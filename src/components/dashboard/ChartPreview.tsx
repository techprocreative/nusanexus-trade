import React, { useState, useEffect } from 'react';
import { useEquityData } from '../../hooks/useDashboardData';
import { EquityPoint } from '../../types';
import { TrendingUp, TrendingDown, Download } from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine
} from 'recharts';

const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`glass-card p-6 ${className}`}>
    <div className="animate-pulse">
      <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
      <div className="h-8 bg-gray-700 rounded w-1/2 mb-6"></div>
      <div className="h-48 bg-gray-700 rounded"></div>
    </div>
  </div>
);

const EnhancedChart: React.FC<{ 
  data: EquityPoint[]; 
  className?: string;
  period: string;
  onPeriodChange: (period: string) => void;
}> = ({ data, className = '', period, onPeriodChange }) => {
  const [realTimeData, setRealTimeData] = useState<EquityPoint[]>(data);
  const [showVolume, setShowVolume] = useState(false);
  
  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (data.length > 0) {
        const lastPoint = data[data.length - 1];
        const variation = (Math.random() - 0.5) * 1000; // Random variation
        const newPoint: EquityPoint = {
          timestamp: new Date().toISOString(),
          value: Math.max(0, lastPoint.value + variation)
        };
        
        setRealTimeData(prev => {
          const updated = [...prev];
          if (updated.length > 50) {
            updated.shift(); // Keep only last 50 points for performance
          }
          updated.push(newPoint);
          return updated;
        });
      }
    }, 2000); // Update every 2 seconds
    
    return () => clearInterval(interval);
  }, [data]);
  
  if (!realTimeData || realTimeData.length === 0) return null;
  
  const formatData = realTimeData.map(point => ({
    ...point,
    timestamp: new Date(point.timestamp).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    formattedValue: new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(point.value)
  }));
  
  const values = realTimeData.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const currentValue = values[values.length - 1];
  const previousValue = values[values.length - 2] || currentValue;
  const isPositive = currentValue >= previousValue;
  const changePercent = previousValue ? ((currentValue - previousValue) / previousValue * 100) : 0;
  
  const periods = [
    { key: '1H', label: '1J' },
    { key: '4H', label: '4J' },
    { key: '1D', label: '1H' },
    { key: '1W', label: '1M' },
    { key: '1M', label: '1B' }
  ];
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-gray-300 text-sm mb-1">{`Waktu: ${label}`}</p>
          <p className="text-white font-semibold">
            {`Equity: ${payload[0].payload.formattedValue}`}
          </p>
          <p className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {`Perubahan: ${changePercent.toFixed(2)}%`}
          </p>
        </div>
      );
    }
    return null;
  };
  
  const exportChart = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Timestamp,Value\n" +
      realTimeData.map(point => `${point.timestamp},${point.value}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `equity_data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className={`${className} space-y-4`}>
      {/* Header with controls */}
      <div className="flex flex-col space-y-3 lg:space-y-0 lg:flex-row lg:justify-between lg:items-center">
        <div className="flex flex-wrap gap-1.5">
          {periods.map(p => (
            <button
              key={p.key}
              onClick={() => onPeriodChange(p.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 min-w-[2.5rem] ${
                period === p.key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/70 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVolume(!showVolume)}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-800/50 text-gray-300 hover:bg-gray-700/70 hover:text-white transition-all duration-200"
          >
            {showVolume ? 'Sembunyikan Volume' : 'Tampilkan Volume'}
          </button>
          <button
            onClick={exportChart}
            className="p-2 rounded-md bg-gray-800/50 text-gray-300 hover:bg-gray-700/70 hover:text-white transition-all duration-200"
            title="Export Data"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      {/* Performance metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-3 border border-gray-700/20">
          <div className="text-gray-400 text-[10px] font-medium uppercase tracking-wide mb-1.5">Nilai Saat Ini</div>
          <div className="text-white font-bold text-sm lg:text-base leading-tight">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
              notation: 'compact',
              compactDisplay: 'short'
            }).format(currentValue)}
          </div>
        </div>
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-3 border border-gray-700/20">
          <div className="text-gray-400 text-[10px] font-medium uppercase tracking-wide mb-1.5">Perubahan</div>
          <div className={`font-bold text-sm lg:text-base leading-tight ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
          </div>
        </div>
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-3 border border-gray-700/20">
          <div className="text-gray-400 text-[10px] font-medium uppercase tracking-wide mb-1.5">Tertinggi</div>
          <div className="text-white font-bold text-sm lg:text-base leading-tight">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
              notation: 'compact',
              compactDisplay: 'short'
            }).format(maxValue)}
          </div>
        </div>
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-3 border border-gray-700/20">
          <div className="text-gray-400 text-[10px] font-medium uppercase tracking-wide mb-1.5">Terendah</div>
          <div className="text-white font-bold text-sm lg:text-base leading-tight">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
              notation: 'compact',
              compactDisplay: 'short'
            }).format(minValue)}
          </div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="bg-gray-900/20 backdrop-blur-sm rounded-lg p-3 border border-gray-700/20 overflow-hidden">
        <div className="h-64 lg:h-72 overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formatData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.2} />
              <XAxis 
                dataKey="timestamp" 
                stroke="#9ca3af"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#9ca3af' }}
                height={20}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#9ca3af' }}
                width={40}
                tickFormatter={(value) => 
                  new Intl.NumberFormat('id-ID', {
                    notation: 'compact',
                    compactDisplay: 'short'
                  }).format(value)
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine 
                y={previousValue} 
                stroke="#6b7280" 
                strokeDasharray="2 2" 
                strokeOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={isPositive ? "#10b981" : "#ef4444"}
                strokeWidth={2}
                fill="url(#colorEquity)"
                dot={false}
                activeDot={{ r: 3, stroke: isPositive ? "#10b981" : "#ef4444", strokeWidth: 1, fill: "#1f2937" }}
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Real-time indicator */}
      <div className="flex items-center justify-center gap-2 py-2">
        <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
        <span className="text-xs text-gray-400 font-medium">Data Real-time • Update setiap 2 detik</span>
      </div>
    </div>
  );
};

const ChartPreview: React.FC = () => {
  const { equityData, loading } = useEquityData();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1D');



  if (loading) {
    return <LoadingSkeleton />;
  }

  // Get current data based on selected period
  const getCurrentData = (): EquityPoint[] => {
    if (!equityData || equityData.length === 0) return [];
    
    // For now, return the first available data set
    // In a real implementation, you would filter based on the selected period
    const currentDataSet = equityData[0];

    return currentDataSet?.data || [];
  };

  const currentData = getCurrentData();

  const currentValue = currentData.length > 0 ? currentData[currentData.length - 1].value : 0;
  const previousValue = currentData.length > 1 ? currentData[0].value : 0;
  const change = currentValue - previousValue;
  const changePercent = previousValue ? (change / previousValue) * 100 : 0;
  const isPositive = change >= 0;

  return (
    <div className="glass-card p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col space-y-3 lg:space-y-0 lg:flex-row lg:items-start lg:justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-lg lg:text-xl font-bold text-white flex items-center mb-1">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
            Grafik Equity Real-time
          </h3>
          <p className="text-xs text-gray-400 font-medium">Performa akun secara real-time</p>
        </div>
        
        <div className="text-left lg:text-right">
          <div className="text-2xl lg:text-3xl font-bold text-white mb-1 leading-tight">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
              notation: 'compact',
              compactDisplay: 'short'
            }).format(currentValue)}
          </div>
          <div className={`text-sm font-semibold flex items-center lg:justify-end gap-2 ${
            isPositive ? 'text-green-400' : 'text-red-400'
          }`}>
            <span>
              {isPositive ? '+' : ''}{new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                notation: 'compact',
                compactDisplay: 'short'
              }).format(Math.abs(change))}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-gray-800/40 text-xs">
              {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Chart */}
      {currentData.length === 0 ? (
        <div className="h-64 lg:h-72 flex items-center justify-center text-gray-400 bg-gray-900/20 rounded-lg border border-gray-700/20">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-base font-medium">Tidak ada data tersedia</p>
            <p className="text-xs text-gray-500 mt-1">Data akan muncul setelah trading dimulai</p>
          </div>
        </div>
      ) : (
        <EnhancedChart 
          data={currentData}
          period={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          className=""
        />
      )}
    </div>
  );
};

export default ChartPreview;