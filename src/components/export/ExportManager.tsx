import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Download,
  FileText,
  Table,
  Calendar,
  Filter,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  FileSpreadsheet,
  Database,
  TrendingUp,
  TrendingDown,
  Activity,
  History,
  Target,
} from 'lucide-react';
import { usePositionStore } from '@/store/usePositionStore';
import { useOrderStore } from '@/store/useOrderStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { Position, Order, TradeHistory } from '@/types/trading';

type ExportFormat = 'csv' | 'excel' | 'json';
type ExportType = 'positions' | 'orders' | 'history' | 'all';

interface ExportConfig {
  type: ExportType;
  format: ExportFormat;
  dateRange: {
    start: string;
    end: string;
  };
  includeColumns: string[];
  filters: {
    status?: string[];
    symbols?: string[];
    minVolume?: number;
    maxVolume?: number;
  };
}

interface ExportJob {
  id: string;
  type: ExportType;
  format: ExportFormat;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  fileName: string;
  recordCount: number;
  createdAt: Date;
  completedAt?: Date;
  downloadUrl?: string;
  error?: string;
}

interface ExportManagerProps {
  className?: string;
}

const ExportManager: React.FC<ExportManagerProps> = ({ className }) => {
  const { positions } = usePositionStore();
  const { orders } = useOrderStore();
  const { trades } = useHistoryStore();

  // Export configuration
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    type: 'positions',
    format: 'csv',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
    includeColumns: [],
    filters: {},
  });

  // Export jobs
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([
    {
      id: '1',
      type: 'history',
      format: 'csv',
      status: 'completed',
      progress: 100,
      fileName: 'trade_history_2024_01.csv',
      recordCount: 156,
      createdAt: new Date('2024-01-20T10:30:00'),
      completedAt: new Date('2024-01-20T10:30:15'),
      downloadUrl: '#',
    },
    {
      id: '2',
      type: 'positions',
      format: 'excel',
      status: 'processing',
      progress: 65,
      fileName: 'current_positions.xlsx',
      recordCount: 12,
      createdAt: new Date('2024-01-20T11:15:00'),
    },
  ]);

  // UI state
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<Record<string, boolean>>({});

  // Available columns for each export type
  const availableColumns = useMemo(() => {
    const columns = {
      positions: [
        { key: 'symbol', label: 'Symbol', default: true },
        { key: 'side', label: 'Side', default: true },
        { key: 'volume', label: 'Volume', default: true },
        { key: 'openPrice', label: 'Open Price', default: true },
        { key: 'currentPrice', label: 'Current Price', default: true },
        { key: 'unrealizedPnL', label: 'Unrealized P&L', default: true },
        { key: 'swap', label: 'Swap', default: false },
        { key: 'commission', label: 'Commission', default: false },
        { key: 'openTime', label: 'Open Time', default: true },
        { key: 'stopLoss', label: 'Stop Loss', default: false },
        { key: 'takeProfit', label: 'Take Profit', default: false },
      ],
      orders: [
        { key: 'symbol', label: 'Symbol', default: true },
        { key: 'type', label: 'Order Type', default: true },
        { key: 'side', label: 'Side', default: true },
        { key: 'volume', label: 'Volume', default: true },
        { key: 'price', label: 'Price', default: true },
        { key: 'status', label: 'Status', default: true },
        { key: 'createdAt', label: 'Created At', default: true },
        { key: 'expiry', label: 'Expiry', default: false },
        { key: 'stopLoss', label: 'Stop Loss', default: false },
        { key: 'takeProfit', label: 'Take Profit', default: false },
      ],
      history: [
        { key: 'symbol', label: 'Symbol', default: true },
        { key: 'side', label: 'Side', default: true },
        { key: 'volume', label: 'Volume', default: true },
        { key: 'openPrice', label: 'Open Price', default: true },
        { key: 'closePrice', label: 'Close Price', default: true },
        { key: 'pnl', label: 'P&L', default: true },
        { key: 'commission', label: 'Commission', default: false },
        { key: 'swap', label: 'Swap', default: false },
        { key: 'openTime', label: 'Open Time', default: true },
        { key: 'closeTime', label: 'Close Time', default: true },
        { key: 'duration', label: 'Duration', default: false },
      ],
      all: [
        { key: 'type', label: 'Record Type', default: true },
        { key: 'symbol', label: 'Symbol', default: true },
        { key: 'side', label: 'Side', default: true },
        { key: 'volume', label: 'Volume', default: true },
        { key: 'price', label: 'Price', default: true },
        { key: 'status', label: 'Status', default: true },
        { key: 'timestamp', label: 'Timestamp', default: true },
        { key: 'pnl', label: 'P&L', default: false },
      ],
    };
    
    return columns[exportConfig.type] || [];
  }, [exportConfig.type]);

  // Initialize selected columns when type changes
  React.useEffect(() => {
    const defaultColumns = availableColumns.reduce((acc, col) => {
      acc[col.key] = col.default;
      return acc;
    }, {} as Record<string, boolean>);
    
    setSelectedColumns(defaultColumns);
  }, [availableColumns]);

  // Get filtered data based on current config
  const getFilteredData = () => {
    const startDate = new Date(exportConfig.dateRange.start);
    const endDate = new Date(exportConfig.dateRange.end);
    endDate.setHours(23, 59, 59, 999);

    switch (exportConfig.type) {
      case 'positions':
        return positions.filter(position => {
          const openTime = new Date(position.openTime);
          const matchesDate = openTime >= startDate && openTime <= endDate;
          const matchesSymbol = !exportConfig.filters.symbols?.length || 
                               exportConfig.filters.symbols.includes(position.symbol);
          const matchesVolume = (!exportConfig.filters.minVolume || position.volume >= exportConfig.filters.minVolume) &&
                               (!exportConfig.filters.maxVolume || position.volume <= exportConfig.filters.maxVolume);
          
          return matchesDate && matchesSymbol && matchesVolume;
        });
        
      case 'orders':
        return orders.filter(order => {
          const createdAt = new Date(order.createdAt);
          const matchesDate = createdAt >= startDate && createdAt <= endDate;
          const matchesSymbol = !exportConfig.filters.symbols?.length || 
                               exportConfig.filters.symbols.includes(order.symbol);
          const matchesStatus = !exportConfig.filters.status?.length || 
                               exportConfig.filters.status.includes(order.status);
          
          return matchesDate && matchesSymbol && matchesStatus;
        });
        
      case 'history':
        return trades.filter(trade => {
          const closeTime = new Date(trade.closeTime);
          const matchesDate = closeTime >= startDate && closeTime <= endDate;
          const matchesSymbol = !exportConfig.filters.symbols?.length || 
                               exportConfig.filters.symbols.includes(trade.symbol);
          
          return matchesDate && matchesSymbol;
        });
        
      case 'all':
        const allData = [
          ...positions.map(p => ({ ...p, type: 'position' })),
          ...orders.map(o => ({ ...o, type: 'order' })),
          ...trades.map(t => ({ ...t, type: 'trade' })),
        ];
        
        return allData.filter(item => {
          const timestamp = new Date(item.createdAt || item.openTime || item.closeTime);
          return timestamp >= startDate && timestamp <= endDate;
        });
        
      default:
        return [];
    }
  };

  const handleExport = async () => {
    const data = getFilteredData();
    const selectedCols = Object.keys(selectedColumns).filter(key => selectedColumns[key]);
    
    if (data.length === 0) {
      alert('No data to export with current filters');
      return;
    }
    
    if (selectedCols.length === 0) {
      alert('Please select at least one column to export');
      return;
    }

    // Create new export job
    const newJob: ExportJob = {
      id: Date.now().toString(),
      type: exportConfig.type,
      format: exportConfig.format,
      status: 'processing',
      progress: 0,
      fileName: `${exportConfig.type}_${new Date().toISOString().split('T')[0]}.${exportConfig.format}`,
      recordCount: data.length,
      createdAt: new Date(),
    };
    
    setExportJobs(prev => [newJob, ...prev]);
    setIsExportDialogOpen(false);
    
    // Simulate export process
    const updateProgress = (progress: number) => {
      setExportJobs(prev => prev.map(job => 
        job.id === newJob.id ? { ...job, progress } : job
      ));
    };
    
    try {
      // Simulate processing time
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        updateProgress(i);
      }
      
      // Generate export data
      const exportData = generateExportData(data, selectedCols, exportConfig.format);
      const blob = new Blob([exportData], { 
        type: exportConfig.format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const downloadUrl = URL.createObjectURL(blob);
      
      // Complete the job
      setExportJobs(prev => prev.map(job => 
        job.id === newJob.id 
          ? { 
              ...job, 
              status: 'completed', 
              progress: 100, 
              completedAt: new Date(),
              downloadUrl 
            } 
          : job
      ));
      
    } catch (error) {
      setExportJobs(prev => prev.map(job => 
        job.id === newJob.id 
          ? { 
              ...job, 
              status: 'failed', 
              error: 'Export failed. Please try again.' 
            } 
          : job
      ));
    }
  };

  const generateExportData = (data: any[], columns: string[], format: ExportFormat) => {
    if (format === 'json') {
      return JSON.stringify(data.map(item => {
        const filtered = {} as any;
        columns.forEach(col => {
          filtered[col] = item[col];
        });
        return filtered;
      }), null, 2);
    }
    
    // CSV format
    const headers = columns.join(',');
    const rows = data.map(item => 
      columns.map(col => {
        const value = item[col];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    );
    
    return [headers, ...rows].join('\n');
  };

  const handleDownload = (job: ExportJob) => {
    if (job.downloadUrl) {
      const link = document.createElement('a');
      link.href = job.downloadUrl;
      link.download = job.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getStatusIcon = (status: ExportJob['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'processing': return <Activity className="h-4 w-4 text-blue-400 animate-spin" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-400" />;
    }
  };

  const getTypeIcon = (type: ExportType) => {
    switch (type) {
      case 'positions': return <Target className="h-4 w-4" />;
      case 'orders': return <TrendingUp className="h-4 w-4" />;
      case 'history': return <History className="h-4 w-4" />;
      case 'all': return <Database className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Download className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Export Manager</h3>
          <Badge variant="outline" className="text-xs">
            {exportJobs.length} jobs
          </Badge>
        </div>
        
        <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              New Export
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Export Data</DialogTitle>
              <DialogDescription className="text-gray-400">
                Configure your data export settings and select the columns to include.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Export Type & Format */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-300">Data Type</Label>
                  <Select 
                    value={exportConfig.type} 
                    onValueChange={(value: ExportType) => 
                      setExportConfig(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger className="mt-1 bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="positions">
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4" />
                          <span>Current Positions</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="orders">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4" />
                          <span>Orders</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="history">
                        <div className="flex items-center space-x-2">
                          <History className="h-4 w-4" />
                          <span>Trade History</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="all">
                        <div className="flex items-center space-x-2">
                          <Database className="h-4 w-4" />
                          <span>All Data</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm text-gray-300">Format</Label>
                  <Select 
                    value={exportConfig.format} 
                    onValueChange={(value: ExportFormat) => 
                      setExportConfig(prev => ({ ...prev, format: value }))
                    }
                  >
                    <SelectTrigger className="mt-1 bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="csv">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>CSV</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="excel">
                        <div className="flex items-center space-x-2">
                          <FileSpreadsheet className="h-4 w-4" />
                          <span>Excel</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="json">
                        <div className="flex items-center space-x-2">
                          <Table className="h-4 w-4" />
                          <span>JSON</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Date Range */}
              <div>
                <Label className="text-sm text-gray-300 mb-2 block">Date Range</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-400">Start Date</Label>
                    <Input
                      type="date"
                      value={exportConfig.dateRange.start}
                      onChange={(e) => setExportConfig(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: e.target.value }
                      }))}
                      className="mt-1 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400">End Date</Label>
                    <Input
                      type="date"
                      value={exportConfig.dateRange.end}
                      onChange={(e) => setExportConfig(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, end: e.target.value }
                      }))}
                      className="mt-1 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
              </div>
              
              {/* Column Selection */}
              <div>
                <Label className="text-sm text-gray-300 mb-3 block">Columns to Export</Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {availableColumns.map((column) => (
                    <div key={column.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={column.key}
                        checked={selectedColumns[column.key] || false}
                        onCheckedChange={(checked) => 
                          setSelectedColumns(prev => ({ ...prev, [column.key]: !!checked }))
                        }
                        className="border-gray-600"
                      />
                      <Label 
                        htmlFor={column.key} 
                        className="text-xs text-gray-300 cursor-pointer"
                      >
                        {column.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Preview */}
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Records to export:</span>
                  <span className="text-white font-medium">{getFilteredData().length}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-400">Selected columns:</span>
                  <span className="text-white font-medium">
                    {Object.values(selectedColumns).filter(Boolean).length}
                  </span>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsExportDialogOpen(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleExport}
                disabled={getFilteredData().length === 0 || Object.values(selectedColumns).filter(Boolean).length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Start Export
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Export Jobs */}
      <div className="space-y-3">
        {exportJobs.map((job) => (
          <Card key={job.id} className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(job.type)}
                    {getStatusIcon(job.status)}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-white">{job.fileName}</h4>
                    <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                      <span>{job.recordCount} records</span>
                      <span className="capitalize">{job.type}</span>
                      <span className="uppercase">{job.format}</span>
                      <span>{job.createdAt.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {job.status === 'processing' && (
                    <div className="w-24">
                      <Progress value={job.progress} className="h-2" />
                      <p className="text-xs text-gray-400 text-center mt-1">{job.progress}%</p>
                    </div>
                  )}
                  
                  {job.status === 'completed' && job.downloadUrl && (
                    <Button
                      size="sm"
                      onClick={() => handleDownload(job)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  )}
                  
                  {job.status === 'failed' && (
                    <Badge variant="destructive" className="text-xs">
                      Failed
                    </Badge>
                  )}
                </div>
              </div>
              
              {job.error && (
                <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
                  {job.error}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {exportJobs.length === 0 && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-8 text-center">
              <Download className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No export jobs</h3>
              <p className="text-gray-400 mb-4">
                Create your first export to download your trading data.
              </p>
              <Button 
                onClick={() => setIsExportDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Start Export
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ExportManager;