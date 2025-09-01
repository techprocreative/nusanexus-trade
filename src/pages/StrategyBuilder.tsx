import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Save, Play, Share2, Download, Upload, Trash2, FolderOpen } from 'lucide-react';
import ComponentLibrary from '../components/strategy/ComponentLibrary';
import StrategyCanvas from '../components/strategy/StrategyCanvas';
import PropertyPanel from '../components/strategy/PropertyPanel';
import { StrategyManager } from '../components/StrategyManager';
import { useStrategyBuilderStore } from '../stores/strategyBuilderStore';

const StrategyBuilder: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showStrategyManager, setShowStrategyManager] = useState(false);
  const {
    currentStrategy,
    nodes,
    edges,
    validationResult,
    selectedComponent,
    setSelectedComponent,
    saveStrategy,
    loadStrategy,
    exportStrategy,
    clearStrategy,
    validateStrategy
  } = useStrategyBuilderStore();

  // Sync selectedComponent from store with local selectedNodeId
  useEffect(() => {
    setSelectedNodeId(selectedComponent);
  }, [selectedComponent]);

  const handleNodeSelect = (nodeId: string | null) => {
    setSelectedNodeId(nodeId);
    setSelectedComponent(nodeId);
  };

  const handleSaveStrategy = async () => {
    try {
      await saveStrategy();
      // Show success notification
      console.log('Strategy saved successfully');
    } catch (error) {
      console.error('Failed to save strategy:', error);
    }
  };

  const handleExportStrategy = () => {
    try {
      const exported = exportStrategy();
      const blob = new Blob([JSON.stringify(exported, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentStrategy.name || 'strategy'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export strategy:', error);
    }
  };

  const handleImportStrategy = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const imported = JSON.parse(e.target?.result as string);
            loadStrategy(imported);
            console.log('Strategy imported successfully');
          } catch (error) {
            console.error('Failed to import strategy:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClearStrategy = () => {
    if (window.confirm('Are you sure you want to clear the current strategy? This action cannot be undone.')) {
      clearStrategy();
      setSelectedNodeId(null);
      setSelectedComponent(null);
    }
  };

  const handleTestStrategy = () => {
    validateStrategy();
    // Navigate to backtesting or show validation results
    console.log('Validation result:', validationResult);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col bg-gray-100">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Strategy Builder
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {currentStrategy?.name || 'Untitled Strategy'} • 
                {nodes.length} components • 
                {edges.length} connections
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Validation Status */}
              {validationResult && (
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  validationResult.isValid 
                    ? 'bg-green-100 text-green-800'
                    : validationResult.errors.length > 0
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {validationResult.isValid 
                    ? '✓ Valid Strategy'
                    : `${validationResult.errors.length} Issues`
                  }
                </div>
              )}
              
              {/* Action Buttons */}
              <button
                onClick={() => setShowStrategyManager(true)}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FolderOpen size={16} />
                Manage
              </button>
              
              <button
                onClick={handleImportStrategy}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Upload size={16} />
                Import
              </button>
              
              <button
                onClick={handleExportStrategy}
                disabled={nodes.length === 0}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download size={16} />
                Export
              </button>
              
              <button
                onClick={handleClearStrategy}
                disabled={nodes.length === 0}
                className="flex items-center gap-2 px-3 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 size={16} />
                Clear
              </button>
              
              <button
                onClick={handleTestStrategy}
                disabled={nodes.length === 0}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Play size={16} />
                Test Strategy
              </button>
              
              <button
                onClick={handleSaveStrategy}
                disabled={nodes.length === 0}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save size={16} />
                Save
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Content - Three Panel Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Component Library */}
          <div className="w-80 border-r border-gray-200 bg-white">
            <ComponentLibrary />
          </div>
          
          {/* Center Panel - Strategy Canvas */}
          <div className="flex-1 relative">
            <StrategyCanvas onNodeSelect={handleNodeSelect} />
            
            {/* Canvas Overlay Info */}
            <div className="absolute top-4 left-4 bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2">
              <div className="text-xs text-gray-600 space-y-1">
                <div className="font-medium">Canvas Info</div>
                <div>Components: {nodes.length}</div>
                <div>Connections: {edges.length}</div>
                {validationResult && (
                  <div className={validationResult.isValid ? 'text-green-600' : 'text-red-600'}>
                    Score: {Math.round(validationResult.completeness)}%
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Panel - Property Panel */}
          <div className="w-80 border-l border-gray-200 bg-white">
            <PropertyPanel selectedNodeId={selectedNodeId} />
          </div>
        </div>
        
        {/* Footer Status Bar */}
        <div className="bg-white border-t border-gray-200 px-6 py-2">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-4">
              <span>Ready</span>
              {selectedNodeId && (
                <span>Selected: {nodes.find(n => n.id === selectedNodeId)?.data.name}</span>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {validationResult && validationResult.errors.length > 0 && (
                <span className="text-red-600">
                  {validationResult.errors.length} validation error(s)
                </span>
              )}
              {validationResult && validationResult.warnings.length > 0 && (
                <span className="text-yellow-600">
                  {validationResult.warnings.length} warning(s)
                </span>
              )}
              <span>Last saved: Never</span>
            </div>
          </div>
        </div>
        
        {/* Strategy Manager Dialog */}
        <StrategyManager 
          isOpen={showStrategyManager} 
          onClose={() => setShowStrategyManager(false)}
        />
      </div>
    </DndProvider>
  );
};

export default StrategyBuilder;