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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import {
  Save,
  Template,
  Plus,
  Edit,
  Trash2,
  Copy,
  Star,
  StarOff,
  MoreVertical,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Shield,
  Zap,
} from 'lucide-react';
import { OrderType, OrderSide } from '@/types/trading';
import { useOrderStore } from '@/store/useOrderStore';

interface OrderTemplate {
  id: string;
  name: string;
  description?: string;
  symbol: string;
  orderType: OrderType;
  side: OrderSide;
  volume: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  expiry?: string;
  isFavorite: boolean;
  category: 'scalping' | 'swing' | 'position' | 'hedging' | 'custom';
  createdAt: Date;
  lastUsed?: Date;
  useCount: number;
}

interface OrderTemplatesProps {
  className?: string;
  onApplyTemplate?: (template: OrderTemplate) => void;
}

const OrderTemplates: React.FC<OrderTemplatesProps> = ({ 
  className, 
  onApplyTemplate 
}) => {
  const { createOrder } = useOrderStore();

  // Template management state
  const [templates, setTemplates] = useState<OrderTemplate[]>([
    {
      id: '1',
      name: 'EUR/USD Scalp Long',
      description: 'Quick scalping template for EUR/USD bullish moves',
      symbol: 'EURUSD',
      orderType: 'market',
      side: 'BUY',
      volume: 0.1,
      stopLoss: 0.0010,
      takeProfit: 0.0015,
      isFavorite: true,
      category: 'scalping',
      createdAt: new Date('2024-01-15'),
      lastUsed: new Date('2024-01-20'),
      useCount: 15,
    },
    {
      id: '2',
      name: 'GBP/USD Swing Short',
      description: 'Medium-term swing trade setup for GBP/USD bearish trend',
      symbol: 'GBPUSD',
      orderType: 'limit',
      side: 'SELL',
      volume: 0.2,
      price: 1.2650,
      stopLoss: 0.0080,
      takeProfit: 0.0150,
      isFavorite: false,
      category: 'swing',
      createdAt: new Date('2024-01-10'),
      lastUsed: new Date('2024-01-18'),
      useCount: 8,
    },
    {
      id: '3',
      name: 'USD/JPY Position Long',
      description: 'Long-term position trade for USD/JPY uptrend',
      symbol: 'USDJPY',
      orderType: 'stop',
      side: 'BUY',
      volume: 0.5,
      price: 148.50,
      stopLoss: 2.00,
      takeProfit: 5.00,
      isFavorite: true,
      category: 'position',
      createdAt: new Date('2024-01-05'),
      useCount: 3,
    },
  ]);

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<OrderTemplate | null>(null);

  // New template form state
  const [newTemplate, setNewTemplate] = useState<Partial<OrderTemplate>>({
    name: '',
    description: '',
    symbol: 'EURUSD',
    orderType: 'market',
    side: 'BUY',
    volume: 0.1,
    category: 'custom',
    isFavorite: false,
  });

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
      const matchesFavorites = !showFavoritesOnly || template.isFavorite;
      
      return matchesSearch && matchesCategory && matchesFavorites;
    }).sort((a, b) => {
      // Sort by favorites first, then by last used, then by use count
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      
      if (a.lastUsed && b.lastUsed) {
        return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
      }
      
      return b.useCount - a.useCount;
    });
  }, [templates, searchTerm, categoryFilter, showFavoritesOnly]);

  // Category stats
  const categoryStats = useMemo(() => {
    const stats = templates.reduce((acc, template) => {
      acc[template.category] = (acc[template.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      all: templates.length,
      ...stats,
    };
  }, [templates]);

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.symbol) return;
    
    const template: OrderTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name,
      description: newTemplate.description,
      symbol: newTemplate.symbol,
      orderType: newTemplate.orderType || 'market',
      side: newTemplate.side || 'BUY',
      volume: newTemplate.volume || 0.1,
      price: newTemplate.price,
      stopLoss: newTemplate.stopLoss,
      takeProfit: newTemplate.takeProfit,
      expiry: newTemplate.expiry,
      isFavorite: newTemplate.isFavorite || false,
      category: newTemplate.category || 'custom',
      createdAt: new Date(),
      useCount: 0,
    };
    
    setTemplates(prev => [...prev, template]);
    setNewTemplate({
      name: '',
      description: '',
      symbol: 'EURUSD',
      orderType: 'market',
      side: 'BUY',
      volume: 0.1,
      category: 'custom',
      isFavorite: false,
    });
    setIsCreateDialogOpen(false);
  };

  const handleApplyTemplate = (template: OrderTemplate) => {
    // Update use count and last used
    setTemplates(prev => prev.map(t => 
      t.id === template.id 
        ? { ...t, useCount: t.useCount + 1, lastUsed: new Date() }
        : t
    ));
    
    // Apply template to order form or create order
    if (onApplyTemplate) {
      onApplyTemplate(template);
    } else {
      // Create order directly
      createOrder({
        symbol: template.symbol,
        type: template.orderType,
        side: template.side,
        volume: template.volume,
        price: template.price,
        stopLoss: template.stopLoss,
        takeProfit: template.takeProfit,
        expiry: template.expiry,
      });
    }
  };

  const handleToggleFavorite = (templateId: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === templateId ? { ...t, isFavorite: !t.isFavorite } : t
    ));
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  const handleDuplicateTemplate = (template: OrderTemplate) => {
    const duplicated: OrderTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      createdAt: new Date(),
      useCount: 0,
      lastUsed: undefined,
      isFavorite: false,
    };
    
    setTemplates(prev => [...prev, duplicated]);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'scalping': return <Zap className="h-3 w-3" />;
      case 'swing': return <TrendingUp className="h-3 w-3" />;
      case 'position': return <Target className="h-3 w-3" />;
      case 'hedging': return <Shield className="h-3 w-3" />;
      default: return <Template className="h-3 w-3" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'scalping': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'swing': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'position': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'hedging': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 5,
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Template className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Order Templates</h3>
          <Badge variant="outline" className="text-xs">
            {templates.length} templates
          </Badge>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-1" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Create Order Template</DialogTitle>
              <DialogDescription className="text-gray-400">
                Save your order configuration as a reusable template.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-300">Template Name</Label>
                <Input
                  value={newTemplate.name || ''}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., EUR/USD Scalp Long"
                  className="mt-1 bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label className="text-sm text-gray-300">Description</Label>
                <Textarea
                  value={newTemplate.description || ''}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description..."
                  className="mt-1 bg-gray-700 border-gray-600 text-white h-20 resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm text-gray-300">Symbol</Label>
                  <Select 
                    value={newTemplate.symbol} 
                    onValueChange={(value) => setNewTemplate(prev => ({ ...prev, symbol: value }))}
                  >
                    <SelectTrigger className="mt-1 bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="EURUSD">EUR/USD</SelectItem>
                      <SelectItem value="GBPUSD">GBP/USD</SelectItem>
                      <SelectItem value="USDJPY">USD/JPY</SelectItem>
                      <SelectItem value="AUDUSD">AUD/USD</SelectItem>
                      <SelectItem value="USDCAD">USD/CAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm text-gray-300">Category</Label>
                  <Select 
                    value={newTemplate.category} 
                    onValueChange={(value: any) => setNewTemplate(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="mt-1 bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="scalping">Scalping</SelectItem>
                      <SelectItem value="swing">Swing</SelectItem>
                      <SelectItem value="position">Position</SelectItem>
                      <SelectItem value="hedging">Hedging</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-sm text-gray-300">Order Type</Label>
                  <Select 
                    value={newTemplate.orderType} 
                    onValueChange={(value: any) => setNewTemplate(prev => ({ ...prev, orderType: value }))}
                  >
                    <SelectTrigger className="mt-1 bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="market">Market</SelectItem>
                      <SelectItem value="limit">Limit</SelectItem>
                      <SelectItem value="stop">Stop</SelectItem>
                      <SelectItem value="stop_limit">Stop Limit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm text-gray-300">Side</Label>
                  <Select 
                    value={newTemplate.side} 
                    onValueChange={(value: any) => setNewTemplate(prev => ({ ...prev, side: value }))}
                  >
                    <SelectTrigger className="mt-1 bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="BUY">BUY</SelectItem>
                      <SelectItem value="SELL">SELL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm text-gray-300">Volume</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newTemplate.volume || ''}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, volume: parseFloat(e.target.value) || 0 }))}
                    className="mt-1 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateTemplate}
                disabled={!newTemplate.name || !newTemplate.symbol}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-1" />
                Save Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="w-full sm:w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Categories ({categoryStats.all})</SelectItem>
                  <SelectItem value="scalping">Scalping ({categoryStats.scalping || 0})</SelectItem>
                  <SelectItem value="swing">Swing ({categoryStats.swing || 0})</SelectItem>
                  <SelectItem value="position">Position ({categoryStats.position || 0})</SelectItem>
                  <SelectItem value="hedging">Hedging ({categoryStats.hedging || 0})</SelectItem>
                  <SelectItem value="custom">Custom ({categoryStats.custom || 0})</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Favorites Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={cn(
                "border-gray-600",
                showFavoritesOnly 
                  ? "bg-yellow-500/20 border-yellow-500 text-yellow-400" 
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              )}
            >
              <Star className={cn("h-4 w-4 mr-1", showFavoritesOnly && "fill-current")} />
              Favorites
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <CardTitle className="text-sm text-white truncate">
                      {template.name}
                    </CardTitle>
                    {template.isFavorite && (
                      <Star className="h-3 w-3 text-yellow-400 fill-current flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={cn("text-xs px-2 py-0.5", getCategoryColor(template.category))}>
                      {getCategoryIcon(template.category)}
                      <span className="ml-1 capitalize">{template.category}</span>
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {template.symbol}
                    </Badge>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-white">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-800 border-gray-700" align="end">
                    <DropdownMenuItem 
                      onClick={() => handleToggleFavorite(template.id)}
                      className="text-gray-300 hover:bg-gray-700"
                    >
                      {template.isFavorite ? (
                        <><StarOff className="h-3 w-3 mr-2" /> Remove from Favorites</>
                      ) : (
                        <><Star className="h-3 w-3 mr-2" /> Add to Favorites</>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDuplicateTemplate(template)}
                      className="text-gray-300 hover:bg-gray-700"
                    >
                      <Copy className="h-3 w-3 mr-2" /> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setEditingTemplate(template)}
                      className="text-gray-300 hover:bg-gray-700"
                    >
                      <Edit className="h-3 w-3 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-600" />
                    <DropdownMenuItem 
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-3 w-3 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {template.description && (
                <p className="text-xs text-gray-400 line-clamp-2">
                  {template.description}
                </p>
              )}
              
              {/* Order Details */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Type</span>
                  <span className="text-white capitalize">{template.orderType}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Side</span>
                  <span className={cn(
                    "font-medium",
                    template.side === 'BUY' ? "text-green-400" : "text-red-400"
                  )}>
                    {template.side === 'BUY' ? (
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>BUY</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <TrendingDown className="h-3 w-3" />
                        <span>SELL</span>
                      </div>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Volume</span>
                  <span className="text-white">{template.volume} lots</span>
                </div>
                {template.price && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Price</span>
                    <span className="text-white font-mono">{formatCurrency(template.price)}</span>
                  </div>
                )}
                {(template.stopLoss || template.takeProfit) && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">SL/TP</span>
                    <span className="text-white font-mono">
                      {template.stopLoss ? formatCurrency(template.stopLoss) : '-'} / {template.takeProfit ? formatCurrency(template.takeProfit) : '-'}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Usage Stats */}
              <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-700">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>Used {template.useCount} times</span>
                </div>
                {template.lastUsed && (
                  <span>{new Date(template.lastUsed).toLocaleDateString()}</span>
                )}
              </div>
              
              {/* Apply Button */}
              <Button 
                onClick={() => handleApplyTemplate(template)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                Apply Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredTemplates.length === 0 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-8 text-center">
            <Template className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No templates found</h3>
            <p className="text-gray-400 mb-4">
              {searchTerm || categoryFilter !== 'all' || showFavoritesOnly
                ? 'Try adjusting your filters or search terms.'
                : 'Create your first order template to get started.'}
            </p>
            {!searchTerm && categoryFilter === 'all' && !showFavoritesOnly && (
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Create Template
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderTemplates;