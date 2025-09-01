import React from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import SimpleMetricsCards from '../components/dashboard/SimpleMetricsCards';
import SimpleEquityChart from '../components/dashboard/SimpleEquityChart';
import RecentActivityFeed from '../components/dashboard/RecentActivityFeed';
import LivePositionsPanel from '../components/dashboard/LivePositionsPanel';

// Legacy components removed - using new enhanced dashboard components

const Dashboard: React.FC = () => {
  const { 
    accountBalance, 
    quickStats, 
    dashboardStats, 
    recentActivity, 
    livePositions, 
    equityData,
    loading 
  } = useDashboardData();

  // Use real data from hooks
  const metricsData = {
    equity: quickStats?.accountBalance || 0,
    todaysSale: quickStats?.openPositions || 0,
    profit: quickStats?.todayPnL || 0
  };

  // Transform equity data for chart (use 1D data by default)
  const chartData = equityData?.find(data => data.period === '1D')?.data?.map(point => ({
    time: new Date(point.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }),
    value: point.value
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Trading Dashboard</h1>
        </div>
        
        {/* Metrics Cards */}
        <SimpleMetricsCards 
          data={metricsData}
          loading={loading}
        />
        
        {/* Equity Chart */}
        <SimpleEquityChart 
          data={chartData}
          loading={loading}
        />
        
        {/* Additional sections can be added here if needed */}
        <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
          <RecentActivityFeed 
            activities={recentActivity}
            loading={loading}
          />
          <LivePositionsPanel 
            positions={livePositions}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export { Dashboard };