import { useState, useEffect } from 'react';
import { 
  DashboardStats, 
  ActivityItem, 
  EquityCurveData, 
  QuickStats 
} from '../types';

// Mock data for dashboard stats
const mockDashboardStats: DashboardStats = {
  winRate: 68,
  totalTrades: 142,
  bestPerformingPair: 'EUR/USD',
  currentDrawdown: 8.5
};

// Mock data for quick stats
const mockQuickStats: QuickStats = {
  openPositions: 5,
  activeStrategies: 3,
  todayPnL: 1250.75,
  accountBalance: 25000.00
};

// Mock data for recent activities
const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'trade',
    title: 'EUR/USD Trade Closed',
    description: 'Long position closed with profit',
    amount: 125.50,
    symbol: 'EUR/USD',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    status: 'profit'
  },
  {
    id: '2',
    type: 'ai_recommendation',
    title: 'AI Signal Generated',
    description: 'Strong buy signal detected for GBP/JPY based on technical analysis',
    symbol: 'GBP/JPY',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    status: 'neutral'
  },
  {
    id: '3',
    type: 'strategy',
    title: 'Scalping Strategy Activated',
    description: 'Auto-scalping strategy started on multiple pairs',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: 'neutral'
  },
  {
    id: '4',
    type: 'trade',
    title: 'USD/JPY Trade Closed',
    description: 'Short position closed with loss',
    amount: -45.25,
    symbol: 'USD/JPY',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    status: 'loss'
  },
  {
    id: '5',
    type: 'news',
    title: 'Fed Interest Rate Decision',
    description: 'Federal Reserve maintains current interest rates, USD strengthens',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'neutral'
  }
];

// Generate mock equity curve data
const generateEquityData = (period: '1D' | '1W' | '1M', baseValue: number = 25000) => {
  const points: { timestamp: string; value: number }[] = [];
  const now = new Date();
  let intervals: number;
  let intervalMs: number;

  switch (period) {
    case '1D':
      intervals = 24; // hourly data
      intervalMs = 60 * 60 * 1000;
      break;
    case '1W':
      intervals = 7; // daily data
      intervalMs = 24 * 60 * 60 * 1000;
      break;
    case '1M':
      intervals = 30; // daily data
      intervalMs = 24 * 60 * 60 * 1000;
      break;
  }

  let currentValue = baseValue;
  
  for (let i = intervals; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * intervalMs);
    
    // Add some realistic volatility
    const volatility = period === '1D' ? 0.002 : period === '1W' ? 0.01 : 0.02;
    const change = (Math.random() - 0.5) * volatility * currentValue;
    currentValue += change;
    
    // Ensure we don't go below a reasonable minimum
    currentValue = Math.max(currentValue, baseValue * 0.8);
    
    points.push({
      timestamp: timestamp.toISOString(),
      value: currentValue
    });
  }

  return points;
};

const mockEquityData: EquityCurveData[] = [
  {
    period: '1D',
    data: generateEquityData('1D')
  },
  {
    period: '1W',
    data: generateEquityData('1W')
  },
  {
    period: '1M',
    data: generateEquityData('1M')
  }
];

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setStats(mockDashboardStats);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return { stats, loading };
};

export const useQuickStats = () => {
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setStats(mockQuickStats);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return { stats, loading };
};

export const useRecentActivities = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setActivities(mockActivities);
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return { activities, loading };
};

export const useEquityData = () => {
  const [equityData, setEquityData] = useState<EquityCurveData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setEquityData(mockEquityData);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return { equityData, loading };
};

// Combined hook for dashboard data
export const useDashboardData = () => {
  const { stats: dashboardStats, loading: statsLoading } = useDashboardStats();
  const { stats: quickStats, loading: quickStatsLoading } = useQuickStats();
  const { activities: recentActivity, loading: activitiesLoading } = useRecentActivities();
  const { equityData, loading: equityLoading } = useEquityData();

  const loading = statsLoading || quickStatsLoading || activitiesLoading || equityLoading;

  return {
    accountBalance: quickStats,
    quickStats,
    dashboardStats,
    recentActivity,
    livePositions: [], // Mock empty array for now
    equityData,
    loading
  };
};