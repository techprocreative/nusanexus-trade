import React, { useEffect, useState } from 'react';
import { Search, Filter, Grid, List, Plus, Download, Settings, TrendingUp } from 'lucide-react';
import { useStrategyStore } from '@/stores/strategyStore';
import { StrategyCard } from '@/components/strategy/StrategyCard';
import { StrategyDetailsModal } from '@/components/strategy/StrategyDetailsModal';
import { BulkOperationsPanel } from '@/components/strategy/BulkOperationsPanel';
import { AIInsightsDashboard } from '@/components/strategy/AIInsightsDashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';
import type { StrategyFilters, StrategySortOptions } from '@/types/strategy';

const StrategyLibrary: React.FC = () => {
  const {
    strategies,
    loading,
    error,
    filters,
    sortOptions,
    selectedStrategies,
    pagination,
    viewMode,
    tags,
    modal,
    bulkOperations,
    fetchStrategies,
    setFilters,
    setSortOptions,
    clearFilters,
    toggleStrategySelection,
    selectAllStrategies,
    clearSelection,
    setViewMode,
    loadMore,
    fetchTags,
    setBulkOperationsOpen,
    openStrategyModal
  } = useStrategyStore();

  const [searchInput, setSearchInput] = useState(filters.search);
  const [showFilters, setShowFilters] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);

  useEffect(() => {
    fetchStrategies(undefined, true);
    fetchTags();
  }, [fetchStrategies, fetchTags]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchInput !== filters.search) {
        setFilters({ search: searchInput });
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchInput, filters.search, setFilters]);

  const handleFilterChange = (key: keyof StrategyFilters, value: any) => {
    setFilters({ [key]: value });
  };

  const handleSortChange = (field: string) => {
    const direction = sortOptions.field === field && sortOptions.direction === 'desc' ? 'asc' : 'desc';
    setSortOptions({ field: field as StrategySortOptions['field'], direction });
  };

  const handleBulkAction = (action: string) => {
    if (selectedStrategies.length === 0) {
      toast.error('Please select strategies first');
      return;
    }
    setBulkOperationsOpen(true);
  };

  const handleCreateStrategy = () => {
    // Navigate to strategy builder or open creation modal
    toast.info('Strategy creation feature coming soon!');
  };

  const handleExportSelected = () => {
    if (selectedStrategies.length === 0) {
      toast.error('Please select strategies to export');
      return;
    }
    toast.info('Export feature coming soon!');
  };

  const statsCards = [
    {
      title: 'Total Strategies',
      value: pagination.totalCount.toLocaleString(),
      icon: Grid,
      color: 'text-blue-600'
    },
    {
      title: 'Active Strategies',
      value: strategies.filter(s => s.status === 'active').length.toLocaleString(),
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'My Strategies',
      value: strategies.filter(s => s.creatorId === 'current-user').length.toLocaleString(),
      icon: Settings,
      color: 'text-purple-600'
    },
    {
      title: 'Favorites',
      value: strategies.filter(s => s.isFavorite).length.toLocaleString(),
      icon: Plus,
      color: 'text-red-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Strategy Library
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Discover, analyze, and deploy trading strategies
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowAIInsights(true)}
                variant="outline"
                className="hidden lg:flex"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                AI Insights
              </Button>
              <Button onClick={handleCreateStrategy} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Strategy
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{stat.title}</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {stat.value}
                      </p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search strategies by name, description, or tags..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 bg-white dark:bg-slate-700"
                />
              </div>

              {/* Filter Controls */}
              <div className="flex items-center gap-2">
                <Sheet open={showFilters} onOpenChange={setShowFilters}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                      {(filters.status.length > 0 || filters.tags.length > 0 || filters.isPublic !== undefined) && (
                        <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                          {filters.status.length + filters.tags.length + (filters.isPublic !== undefined ? 1 : 0)}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Filter Strategies</SheetTitle>
                      <SheetDescription>
                        Refine your search with advanced filters
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                      {/* Status Filter */}
                      <div>
                        <Label className="text-sm font-medium mb-3 block">Status</Label>
                        <div className="space-y-2">
                          {['active', 'inactive', 'draft', 'archived'].map((status) => (
                            <div key={status} className="flex items-center space-x-2">
                              <Checkbox
                                id={status}
                                checked={filters.status.includes(status)}
                                onCheckedChange={(checked) => {
                                  const newStatus = checked
                                    ? [...filters.status, status]
                                    : filters.status.filter(s => s !== status);
                                  handleFilterChange('status', newStatus);
                                }}
                              />
                              <Label htmlFor={status} className="capitalize">{status}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Visibility Filter */}
                      <div>
                        <Label className="text-sm font-medium mb-3 block">Visibility</Label>
                        <Select
                          value={filters.isPublic === undefined ? 'all' : filters.isPublic ? 'public' : 'private'}
                          onValueChange={(value) => {
                            const isPublic = value === 'all' ? undefined : value === 'public';
                            handleFilterChange('isPublic', isPublic);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Strategies</SelectItem>
                            <SelectItem value="public">Public Only</SelectItem>
                            <SelectItem value="private">Private Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator />

                      {/* Tags Filter */}
                      <div>
                        <Label className="text-sm font-medium mb-3 block">Tags</Label>
                        <ScrollArea className="h-32">
                          <div className="space-y-2">
                            {tags.map((tag) => (
                              <div key={tag.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={tag.id}
                                  checked={filters.tags.includes(tag.id)}
                                  onCheckedChange={(checked) => {
                                    const newTags = checked
                                      ? [...filters.tags, tag.id]
                                      : filters.tags.filter(t => t !== tag.id);
                                    handleFilterChange('tags', newTags);
                                  }}
                                />
                                <Label htmlFor={tag.id} className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: tag.color }}
                                  />
                                  {tag.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>

                      <Separator />

                      {/* Favorites Filter */}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="favorites"
                          checked={filters.isFavorite}
                          onCheckedChange={(checked) => handleFilterChange('isFavorite', checked)}
                        />
                        <Label htmlFor="favorites">Show only favorites</Label>
                      </div>

                      {/* Clear Filters */}
                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="w-full"
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Sort */}
                <Select
                  value={`${sortOptions.field}-${sortOptions.direction}`}
                  onValueChange={(value) => {
                    const [field, direction] = value.split('-');
                    setSortOptions({ field: field as StrategySortOptions['field'], direction: direction as 'asc' | 'desc' });
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updatedAt-desc">Recently Updated</SelectItem>
                    <SelectItem value="createdAt-desc">Recently Created</SelectItem>
                    <SelectItem value="name-asc">Name A-Z</SelectItem>
                    <SelectItem value="name-desc">Name Z-A</SelectItem>
                    <SelectItem value="winRate-desc">Win Rate High-Low</SelectItem>
                    <SelectItem value="totalPnL-desc">P&L High-Low</SelectItem>
                    <SelectItem value="sharpeRatio-desc">Sharpe Ratio High-Low</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="flex items-center border rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedStrategies.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {selectedStrategies.length} strategies selected
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearSelection}
                    >
                      Clear Selection
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportSelected}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('bulk')}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Bulk Actions
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Strategy Grid/List */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <CardContent className="p-4">
              <p className="text-red-800 dark:text-red-200">Error: {error}</p>
            </CardContent>
          </Card>
        )}

        {loading && strategies.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                    <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : strategies.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-slate-400 mb-4">
                <Grid className="h-16 w-16 mx-auto mb-4" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                No strategies found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {filters.search || filters.status.length > 0 || filters.tags.length > 0
                  ? 'Try adjusting your filters or search terms'
                  : 'Get started by creating your first strategy'}
              </p>
              <Button onClick={handleCreateStrategy}>
                <Plus className="h-4 w-4 mr-2" />
                Create Strategy
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}>
              {strategies.map((strategy) => (
                <StrategyCard
                  key={strategy.id}
                  strategy={strategy}
                  isSelected={selectedStrategies.includes(strategy.id)}
                  onSelect={() => toggleStrategySelection(strategy.id)}
                  onView={() => openStrategyModal(strategy.id)}
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* Load More */}
            {pagination.hasMore && (
              <div className="text-center mt-8">
                <Button
                  onClick={loadMore}
                  disabled={loading}
                  variant="outline"
                  size="lg"
                >
                  {loading ? 'Loading...' : 'Load More Strategies'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals and Panels */}
      <StrategyDetailsModal />
      <BulkOperationsPanel />
      
      {/* AI Insights Dashboard */}
      {showAIInsights && (
        <AIInsightsDashboard
          isOpen={showAIInsights}
          onClose={() => setShowAIInsights(false)}
        />
      )}
    </div>
  );
};

export default StrategyLibrary;