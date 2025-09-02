import React, { useState } from 'react';
import { X, Trash2, Archive, Download, Tag, Eye, EyeOff, Copy, Play, Pause, CheckSquare, Square } from 'lucide-react';
import { useStrategyStore } from '@/stores/strategyStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import type { BulkOperationsPanelProps, BulkOperation, Strategy } from '@/types/strategy';

export const BulkOperationsPanel: React.FC<BulkOperationsPanelProps> = () => {
  const {
    bulkOperations,
    strategies,
    selectedStrategies,
    clearSelection,
    selectAllStrategies,
    deselectAllStrategies,
    toggleStrategySelection,
    executeBulkOperation,
    closeBulkOperationsPanel
  } = useStrategyStore();

  const [operationType, setOperationType] = useState<BulkOperation['type'] | ''>('');
  const [operationData, setOperationData] = useState<any>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);

  const selectedStrategiesData = strategies.filter(s => selectedStrategies.includes(s.id));
  const selectedCount = selectedStrategies.length;
  const totalCount = strategies.length;

  const handleSelectAll = () => {
    if (selectedCount === totalCount) {
      deselectAllStrategies();
    } else {
      selectAllStrategies();
    }
  };

  const handleExecuteOperation = async () => {
    if (!operationType || selectedCount === 0) {
      toast.error('Please select an operation and at least one strategy');
      return;
    }

    setIsExecuting(true);
    setExecutionProgress(0);

    try {
      const operation: BulkOperation = {
        id: Date.now().toString(),
        type: operationType,
        strategyIds: selectedStrategies,
        data: operationData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        progress: 0
      };

      // Simulate progress for demo
      const progressInterval = setInterval(() => {
        setExecutionProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const result = await executeBulkOperation(operation);
      
      clearInterval(progressInterval);
      setExecutionProgress(100);

      if (result.success) {
        toast.success(`Successfully executed ${operationType} on ${selectedCount} strategies`);
        clearSelection();
        setOperationType('');
        setOperationData({});
      } else {
        toast.error(`Failed to execute operation: ${result.error}`);
      }
    } catch (error) {
      toast.error('An error occurred while executing the operation');
    } finally {
      setIsExecuting(false);
      setExecutionProgress(0);
    }
  };

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'delete': return <Trash2 className="h-4 w-4" />;
      case 'archive': return <Archive className="h-4 w-4" />;
      case 'export': return <Download className="h-4 w-4" />;
      case 'tag': return <Tag className="h-4 w-4" />;
      case 'activate': return <Play className="h-4 w-4" />;
      case 'deactivate': return <Pause className="h-4 w-4" />;
      case 'make_public': return <Eye className="h-4 w-4" />;
      case 'make_private': return <EyeOff className="h-4 w-4" />;
      case 'clone': return <Copy className="h-4 w-4" />;
      default: return null;
    }
  };

  const getOperationColor = (type: string) => {
    switch (type) {
      case 'delete': return 'text-red-600 dark:text-red-400';
      case 'archive': return 'text-orange-600 dark:text-orange-400';
      case 'export': return 'text-blue-600 dark:text-blue-400';
      case 'activate': return 'text-green-600 dark:text-green-400';
      case 'deactivate': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-slate-600 dark:text-slate-400';
    }
  };

  const renderOperationForm = () => {
    switch (operationType) {
      case 'tag':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="tag-action">Tag Action</Label>
              <Select
                value={operationData.action || ''}
                onValueChange={(value) => setOperationData({ ...operationData, action: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add Tags</SelectItem>
                  <SelectItem value="remove">Remove Tags</SelectItem>
                  <SelectItem value="replace">Replace Tags</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="trend-following, momentum, scalping"
                value={operationData.tags || ''}
                onChange={(e) => setOperationData({ ...operationData, tags: e.target.value })}
              />
            </div>
          </div>
        );

      case 'export':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="export-format">Export Format</Label>
              <Select
                value={operationData.format || ''}
                onValueChange={(value) => setOperationData({ ...operationData, format: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Include Data</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-performance"
                    checked={operationData.includePerformance || false}
                    onCheckedChange={(checked) => 
                      setOperationData({ ...operationData, includePerformance: checked })
                    }
                  />
                  <Label htmlFor="include-performance">Performance Metrics</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-backtest"
                    checked={operationData.includeBacktest || false}
                    onCheckedChange={(checked) => 
                      setOperationData({ ...operationData, includeBacktest: checked })
                    }
                  />
                  <Label htmlFor="include-backtest">Backtest Results</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-parameters"
                    checked={operationData.includeParameters || false}
                    onCheckedChange={(checked) => 
                      setOperationData({ ...operationData, includeParameters: checked })
                    }
                  />
                  <Label htmlFor="include-parameters">Strategy Parameters</Label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'clone':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="clone-prefix">Name Prefix</Label>
              <Input
                id="clone-prefix"
                placeholder="Copy of"
                value={operationData.namePrefix || 'Copy of'}
                onChange={(e) => setOperationData({ ...operationData, namePrefix: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="clone-private"
                checked={operationData.makePrivate || false}
                onCheckedChange={(checked) => 
                  setOperationData({ ...operationData, makePrivate: checked })
                }
              />
              <Label htmlFor="clone-private">Make clones private</Label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!bulkOperations.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] m-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Bulk Operations
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeBulkOperationsPanel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Selection Summary */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Selected Strategies ({selectedCount}/{totalCount})
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedCount === totalCount ? (
                  <><Square className="h-4 w-4 mr-2" />Deselect All</>
                ) : (
                  <><CheckSquare className="h-4 w-4 mr-2" />Select All</>
                )}
              </Button>
            </div>
            
            {selectedCount > 0 && (
              <ScrollArea className="max-h-32">
                <div className="space-y-2">
                  {selectedStrategiesData.map((strategy) => (
                    <div key={strategy.id} className="flex items-center justify-between bg-white dark:bg-slate-700 rounded p-2">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={true}
                          onCheckedChange={() => toggleStrategySelection(strategy.id)}
                        />
                        <div>
                          <p className="font-medium text-sm text-slate-900 dark:text-slate-100">
                            {strategy.name}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {strategy.status}
                            </Badge>
                            {strategy.performanceMetrics?.totalPnL && (
                              <span className={`text-xs ${
                                strategy.performanceMetrics.totalPnL >= 0 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {strategy.performanceMetrics.totalPnL >= 0 ? '+' : ''}
                                {strategy.performanceMetrics.totalPnL.toFixed(2)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          <Separator />

          {/* Operation Selection */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="operation-type">Select Operation</Label>
              <Select
                value={operationType}
                onValueChange={(value) => {
                  setOperationType(value as BulkOperation['type']);
                  setOperationData({});
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activate">
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4 text-green-600" />
                      Activate Strategies
                    </div>
                  </SelectItem>
                  <SelectItem value="deactivate">
                    <div className="flex items-center gap-2">
                      <Pause className="h-4 w-4 text-gray-600" />
                      Deactivate Strategies
                    </div>
                  </SelectItem>
                  <SelectItem value="make_public">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-blue-600" />
                      Make Public
                    </div>
                  </SelectItem>
                  <SelectItem value="make_private">
                    <div className="flex items-center gap-2">
                      <EyeOff className="h-4 w-4 text-gray-600" />
                      Make Private
                    </div>
                  </SelectItem>
                  <SelectItem value="tag">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-purple-600" />
                      Manage Tags
                    </div>
                  </SelectItem>
                  <SelectItem value="clone">
                    <div className="flex items-center gap-2">
                      <Copy className="h-4 w-4 text-blue-600" />
                      Clone Strategies
                    </div>
                  </SelectItem>
                  <SelectItem value="export">
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-green-600" />
                      Export Data
                    </div>
                  </SelectItem>
                  <SelectItem value="archive">
                    <div className="flex items-center gap-2">
                      <Archive className="h-4 w-4 text-orange-600" />
                      Archive Strategies
                    </div>
                  </SelectItem>
                  <SelectItem value="delete">
                    <div className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4 text-red-600" />
                      Delete Strategies
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Operation-specific form */}
            {operationType && renderOperationForm()}
          </div>

          {/* Execution Progress */}
          {isExecuting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Executing operation...
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {executionProgress}%
                </span>
              </div>
              <Progress value={executionProgress} className="h-2" />
            </div>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={clearSelection}
              disabled={selectedCount === 0 || isExecuting}
            >
              Clear Selection
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={closeBulkOperationsPanel}
                disabled={isExecuting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleExecuteOperation}
                disabled={!operationType || selectedCount === 0 || isExecuting}
                className={`${getOperationColor(operationType)} ${operationType === 'delete' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
              >
                {isExecuting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  getOperationIcon(operationType)
                )}
                {isExecuting ? 'Executing...' : `Execute on ${selectedCount} strategies`}
              </Button>
            </div>
          </div>

          {/* Warning for destructive operations */}
          {(operationType === 'delete' || operationType === 'archive') && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Warning: This action cannot be undone
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {operationType === 'delete' 
                      ? 'Selected strategies will be permanently deleted.' 
                      : 'Selected strategies will be archived and hidden from the main view.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};