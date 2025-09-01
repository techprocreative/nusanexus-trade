import React, { useState, useEffect } from 'react';
import { useStrategyBuilderStore } from '../stores/strategyBuilderStore';
import { Strategy, StrategyTemplate } from '../types/strategy';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  Save, 
  FolderOpen, 
  Download, 
  Upload, 
  Copy, 
  Trash2, 
  Share2, 
  Search, 
  Star, 
  Clock,
  Tag,
  BarChart3,
  FileText
} from 'lucide-react';

interface StrategyManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StrategyManager: React.FC<StrategyManagerProps> = ({ isOpen, onClose }) => {
  const {
    currentStrategy,
    saveStrategy,
    loadStrategy,
    getAllStrategies,
    searchStrategies,
    duplicateStrategy,
    deleteStrategy,
    exportStrategy,
    importStrategy,
    saveAsTemplate,
    createFromTemplate,
    getAllTemplates,
    deleteTemplate,
    shareStrategy,
    loadSharedStrategy,
    getSharedStrategies,
    generateStrategyStats
  } = useStrategyBuilderStore();

  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [templates, setTemplates] = useState<StrategyTemplate[]>([]);
  const [sharedStrategies, setSharedStrategies] = useState<Strategy[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('strategies');

  // Dialog states
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  // Form states
  const [saveForm, setSaveForm] = useState({ name: '', description: '', tags: '' });
  const [templateForm, setTemplateForm] = useState({ 
    name: '', 
    description: '', 
    category: '', 
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced'
  });
  const [shareForm, setShareForm] = useState({ isPublic: false });
  const [importData, setImportData] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (currentStrategy) {
      setSaveForm({
        name: currentStrategy.name,
        description: currentStrategy.description || '',
        tags: currentStrategy.metadata.tags?.join(', ') || ''
      });
    }
  }, [currentStrategy]);

  const loadData = () => {
    setStrategies(getAllStrategies());
    setTemplates(getAllTemplates());
    setSharedStrategies(getSharedStrategies());
  };

  const handleSearch = () => {
    const results = searchStrategies(searchQuery, selectedTags.length > 0 ? selectedTags : undefined);
    setStrategies(results);
  };

  const handleSave = async () => {
    if (!currentStrategy) return;
    
    setIsLoading(true);
    try {
      // Update strategy metadata
      currentStrategy.name = saveForm.name;
      currentStrategy.description = saveForm.description;
      currentStrategy.metadata.tags = saveForm.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      await saveStrategy();
      alert('Strategy saved successfully!');
      setShowSaveDialog(false);
      loadData();
    } catch (error) {
      alert('Failed to save strategy');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoad = async (strategyId: string) => {
    setIsLoading(true);
    try {
      await loadStrategy(strategyId);
      alert('Strategy loaded successfully!');
      onClose();
    } catch (error) {
      alert('Failed to load strategy');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicate = async (strategyId: string) => {
    setIsLoading(true);
    try {
      const duplicated = await duplicateStrategy(strategyId);
      if (duplicated) {
        alert('Strategy duplicated successfully!');
        loadData();
      }
    } catch (error) {
      alert('Failed to duplicate strategy');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (strategyId: string) => {
    setIsLoading(true);
    try {
      await deleteStrategy(strategyId);
      alert('Strategy deleted successfully!');
      loadData();
    } catch (error) {
      alert('Failed to delete strategy');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    try {
      const data = exportStrategy();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentStrategy?.name || 'strategy'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('Strategy exported successfully!');
    } catch (error) {
      alert('Failed to export strategy');
    }
  };

  const handleImport = () => {
    try {
      importStrategy(importData);
      alert('Strategy imported successfully!');
      setShowImportDialog(false);
      setImportData('');
      onClose();
    } catch (error) {
      alert('Failed to import strategy. Please check the format.');
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!currentStrategy) return;
    
    setIsLoading(true);
    try {
      const template = await saveAsTemplate({
        name: templateForm.name,
        description: templateForm.description,
        category: templateForm.category,
        difficulty: templateForm.difficulty,
        tags: templateForm.name.toLowerCase().split(' ')
      });
      
      if (template) {
        alert('Template saved successfully!');
        setShowTemplateDialog(false);
        loadData();
      }
    } catch (error) {
      alert('Failed to save template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFromTemplate = (templateId: string) => {
    try {
      createFromTemplate(templateId);
      alert('Strategy created from template!');
      onClose();
    } catch (error) {
      alert('Failed to create strategy from template');
    }
  };

  const handleShare = async () => {
    if (!currentStrategy) return;
    
    setIsLoading(true);
    try {
      const shareId = await shareStrategy(shareForm.isPublic);
      if (shareId) {
        navigator.clipboard.writeText(shareId);
        alert('Strategy shared! Share ID copied to clipboard.');
        setShowShareDialog(false);
      }
    } catch (error) {
      alert('Failed to share strategy');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStrategyStats = (strategy: Strategy) => {
    const stats = {
      components: strategy.components.length,
      connections: strategy.connections.length,
      completeness: strategy.validation?.completeness || 0
    };
    return stats;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Strategy Manager</DialogTitle>
          <DialogDescription>
            Manage your trading strategies, templates, and shared strategies
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Action Bar */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <Button onClick={() => setShowSaveDialog(true)} disabled={!currentStrategy}>
              <Save className="w-4 h-4 mr-2" />
              Save Current
            </Button>
            <Button variant="outline" onClick={handleExport} disabled={!currentStrategy}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={() => setShowImportDialog(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" onClick={() => setShowTemplateDialog(true)} disabled={!currentStrategy}>
              <Star className="w-4 h-4 mr-2" />
              Save as Template
            </Button>
            <Button variant="outline" onClick={() => setShowShareDialog(true)} disabled={!currentStrategy}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search strategies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="strategies">My Strategies ({strategies.length})</TabsTrigger>
              <TabsTrigger value="templates">Templates ({templates.length})</TabsTrigger>
              <TabsTrigger value="shared">Shared ({sharedStrategies.length})</TabsTrigger>
            </TabsList>

            {/* Strategies Tab */}
            <TabsContent value="strategies" className="flex-1 overflow-auto">
              <div className="grid gap-4">
                {strategies.map((strategy) => {
                  const stats = getStrategyStats(strategy);
                  return (
                    <Card key={strategy.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{strategy.name}</CardTitle>
                            <CardDescription className="mt-1">
                              {strategy.description || 'No description'}
                            </CardDescription>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => handleLoad(strategy.id)}>
                              <FolderOpen className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDuplicate(strategy.id)}>
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                  <Trash2 size={14} />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Delete Strategy</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete "{strategy.name}"? This action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline">Cancel</Button>
                                  <Button
                                    onClick={() => handleDelete(strategy.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <div className="flex gap-4">
                            <span className="flex items-center gap-1">
                              <BarChart3 className="w-4 h-4" />
                              {stats.components} components
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              {stats.connections} connections
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatDate(strategy.metadata.modified)}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {strategy.metadata.tags?.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {strategies.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No strategies found. Create your first strategy!
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="flex-1 overflow-auto">
              <div className="grid gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {template.description}
                          </CardDescription>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" onClick={() => handleCreateFromTemplate(template.id)}>
                            Use Template
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Template</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete the template "{template.name}"? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline">Cancel</Button>
                                <Button
                                  onClick={() => {
                                    try {
                                      deleteTemplate(template.id);
                                      alert('Template deleted successfully!');
                                      loadData();
                                    } catch (error) {
                                      alert('Failed to delete template');
                                    }
                                  }}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  Delete
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <div className="flex gap-4">
                          <Badge variant="outline">{template.category}</Badge>
                          <Badge variant={template.difficulty === 'beginner' ? 'default' : template.difficulty === 'intermediate' ? 'secondary' : 'destructive'}>
                            {template.difficulty}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          {template.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {templates.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No templates available. Save your first template!
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Shared Tab */}
            <TabsContent value="shared" className="flex-1 overflow-auto">
              <div className="grid gap-4">
                {sharedStrategies.map((strategy) => {
                  const stats = getStrategyStats(strategy);
                  return (
                    <Card key={strategy.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{strategy.name}</CardTitle>
                            <CardDescription className="mt-1">
                              {strategy.description || 'No description'}
                            </CardDescription>
                          </div>
                          <Button size="sm" onClick={() => handleLoad(strategy.id)}>
                            <FolderOpen className="w-4 h-4 mr-2" />
                            Load
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <div className="flex gap-4">
                            <span>By {strategy.metadata.author || 'Anonymous'}</span>
                            <span>{stats.components} components</span>
                            <span>{formatDate(strategy.metadata.created)}</span>
                          </div>
                          <div className="flex gap-2">
                            {strategy.metadata.tags?.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {sharedStrategies.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No shared strategies available.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Save Dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Strategy</DialogTitle>
              <DialogDescription>
                Save your current strategy with metadata
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label htmlFor="save-name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <Input
                  id="save-name"
                  value={saveForm.name}
                  onChange={(e) => setSaveForm({ ...saveForm, name: e.target.value })}
                  placeholder="Strategy name"
                />
              </div>
              <div>
                <label htmlFor="save-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  id="save-description"
                  value={saveForm.description}
                  onChange={(e) => setSaveForm({ ...saveForm, description: e.target.value })}
                  placeholder="Strategy description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="save-tags" className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                <Input
                  id="save-tags"
                  value={saveForm.tags}
                  onChange={(e) => setSaveForm({ ...saveForm, tags: e.target.value })}
                  placeholder="trend, momentum, scalping"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading || !saveForm.name}>
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Template Dialog */}
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save as Template</DialogTitle>
              <DialogDescription>
                Create a reusable template from your current strategy
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label htmlFor="template-name" className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                <Input
                  id="template-name"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  placeholder="Template name"
                />
              </div>
              <div>
                <label htmlFor="template-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  id="template-description"
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                  placeholder="Template description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="template-category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <Input
                  id="template-category"
                  value={templateForm.category}
                  onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                  placeholder="e.g., Trend Following, Mean Reversion"
                />
              </div>
              <div>
                <label htmlFor="template-difficulty" className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  id="template-difficulty"
                  value={templateForm.difficulty}
                  onChange={(e) => setTemplateForm({ ...templateForm, difficulty: e.target.value as any })}
                  className="w-full p-2 border rounded"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveAsTemplate} disabled={isLoading || !templateForm.name}>
                {isLoading ? 'Saving...' : 'Save Template'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Share Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Strategy</DialogTitle>
              <DialogDescription>
                Generate a shareable link for your strategy
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="public-share"
                  checked={shareForm.isPublic}
                  onChange={(e) => setShareForm({ ...shareForm, isPublic: e.target.checked })}
                />
                <label htmlFor="public-share" className="block text-sm font-medium text-gray-700 mb-1">Make publicly discoverable</label>
              </div>
              <p className="text-sm text-muted-foreground">
                {shareForm.isPublic 
                  ? 'Your strategy will be visible in the public gallery'
                  : 'Only people with the link can access your strategy'
                }
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleShare} disabled={isLoading}>
                {isLoading ? 'Sharing...' : 'Share Strategy'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Import Dialog */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Strategy</DialogTitle>
              <DialogDescription>
                Import a strategy from JSON data
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label htmlFor="import-data" className="block text-sm font-medium text-gray-700 mb-1">Strategy JSON</label>
                <textarea
                  id="import-data"
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="Paste your strategy JSON here..."
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={!importData.trim()}>
                Import Strategy
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};