import React, { useState, useEffect, useRef } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { Maximize2, Minimize2, Volume2, VolumeX, HelpCircle } from 'lucide-react';
import { TradingChart } from '../components/trading/TradingChart';
import { TradingPanel } from '../components/trading/TradingPanel';
import { PositionManager } from '../components/trading/PositionManager';
import { MarketDataFeed } from '../components/trading/MarketDataFeed';
import { useKeyboardShortcuts, useKeyboardShortcutsHelp } from '../hooks/useKeyboardShortcuts';
import { KeyboardShortcutsHelp } from '../components/KeyboardShortcutsHelp';
import { useAudioAlerts, useAudioAlertSettings } from '../hooks/useAudioAlerts';
import { AudioAlertSettings } from '../components/AudioAlertSettings';
import { cn } from '../utils/cn';

interface TradingLayoutProps {
  children: React.ReactNode;
  isFullscreen: boolean;
  audioEnabled: boolean;
  onToggleFullscreen: () => void;
  onToggleAudio: () => void;
  onToggleHelp: () => void;
  onShowAudioSettings: () => void;
}

const TradingLayout: React.FC<TradingLayoutProps> = ({ 
  children, 
  isFullscreen, 
  audioEnabled, 
  onToggleFullscreen, 
  onToggleAudio, 
  onToggleHelp, 
  onShowAudioSettings 
}) => {

  return (
    <div className={cn(
      'h-screen bg-gray-900 text-white flex flex-col',
      isFullscreen && 'fixed inset-0 z-50'
    )}>
      {/* Trading Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Live Trading Interface</h1>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400 font-medium">Market Open</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleAudio}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
            title={audioEnabled ? 'Disable Audio' : 'Enable Audio'}
          >
            {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          
          <button
            onClick={onToggleFullscreen}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
            title="Toggle Fullscreen (F)"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          
          <button
            onClick={onToggleHelp}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
            title="Keyboard Shortcuts (Shift+H)"
          >
            <HelpCircle className="h-4 w-4 text-gray-300" />
          </button>
          
          <button
            onClick={onShowAudioSettings}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
            title="Audio Alert Settings"
          >
            <Volume2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Trading Interface */}
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </div>
  );
};

const ResizeHandle: React.FC = () => {
  return (
    <PanelResizeHandle className="w-2 bg-gray-700 hover:bg-blue-600 transition-all duration-200 relative group cursor-col-resize">
      <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-0.5 bg-gray-500 group-hover:bg-blue-400 transition-all duration-200" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-gray-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </PanelResizeHandle>
  );
};

const Trading: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'trading' | 'positions' | 'market'>('trading');
  const [selectedSymbol, setSelectedSymbol] = useState('EURUSD');
  const [isAutoTrading, setIsAutoTrading] = useState(false);
  const [isLoadingPositions, setIsLoadingPositions] = useState(true);

  // Tab content renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 'trading':
        return (
          <TradingPanel 
            symbol={selectedSymbol}
            className="h-full overflow-y-auto" 
            symbolInputRef={symbolInputRef}
            volumeInputRef={volumeInputRef}
          />
        );
      case 'positions':
        return <PositionManager className="h-full" isLoading={isLoadingPositions} />;
      case 'market':
        return <MarketDataFeed className="h-full" />;
      default:
        return null;
    }
  };
  const symbolInputRef = useRef<HTMLInputElement>(null);
  const volumeInputRef = useRef<HTMLInputElement>(null);
  
  // Audio alerts
  const { settings: audioSettings, updateSetting, updateAlertSetting, toggleAllAlerts } = useAudioAlertSettings();
  const { alerts } = useAudioAlerts({ enabled: audioSettings.enabled, volume: audioSettings.volume });
  
  const { isHelpVisible, toggleHelp, hideHelp } = useKeyboardShortcutsHelp();

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
  };

  const handleBuy = () => {
    console.log('Quick Buy Order');
    alerts.orderFilled();
    // Implement buy logic
  };

  const handleSell = () => {
    console.log('Quick Sell Order');
    alerts.orderFilled();
    // Implement sell logic
  };

  const handleCloseAll = () => {
    console.log('Close All Positions');
    alerts.positionClosed();
    // Implement close all logic
  };

  const handleQuickBuy = () => {
    console.log('Quick Market Buy');
    // Implement quick market buy
  };

  const handleQuickSell = () => {
    console.log('Quick Market Sell');
    // Implement quick market sell
  };

  const handleCancelOrders = () => {
    console.log('Cancel All Orders');
    // Implement cancel orders logic
  };

  const focusSymbolInput = () => {
    symbolInputRef.current?.focus();
  };

  const focusVolumeInput = () => {
    volumeInputRef.current?.focus();
  };

  const toggleAutoTrading = () => {
    setIsAutoTrading(!isAutoTrading);
  };

  const { shortcutsList } = useKeyboardShortcuts({
    shortcuts: {
      onBuy: handleBuy,
      onSell: handleSell,
      onCloseAll: handleCloseAll,
      onToggleFullscreen: toggleFullscreen,
      onToggleHelp: toggleHelp,
      onFocusSymbol: focusSymbolInput,
      onFocusVolume: focusVolumeInput,
      onQuickBuy: handleQuickBuy,
      onQuickSell: handleQuickSell,
      onCancelOrders: handleCancelOrders
    },
    enabled: true
  });

  // Simulate loading positions
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingPositions(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <TradingLayout
      isFullscreen={isFullscreen}
      audioEnabled={audioEnabled}
      onToggleFullscreen={toggleFullscreen}
      onToggleAudio={toggleAudio}
      onToggleHelp={toggleHelp}
      onShowAudioSettings={() => setShowAudioSettings(true)}
    >
      <div className="flex flex-col h-full">
        {/* Main Content Area */}
        <div className="flex-1 min-h-0">
          {/* Desktop Layout */}
          <div className="hidden md:block h-full">
            <PanelGroup direction="horizontal" className="h-full">
              {/* Main Chart Area - 70% */}
              <Panel defaultSize={70} minSize={50}>
                <div className="h-full flex flex-col">
                  {/* Chart Container */}
                  <div className="flex-1 min-h-[400px] p-4">
                    <TradingChart 
                      symbol={selectedSymbol}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </Panel>

              <ResizeHandle />

              {/* Trading Panel - 30% */}
              <Panel defaultSize={30} minSize={25}>
                <div className="h-full flex flex-col">
                  {/* Tab Navigation */}
                  <div className="flex bg-gray-800 border-b border-gray-700">
                    <button
                      onClick={() => setActiveTab('trading')}
                      className={cn(
                        'flex-1 px-4 py-3 text-sm font-medium transition-all duration-200',
                        activeTab === 'trading'
                          ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700'
                      )}
                    >
                      Trading
                    </button>
                    <button
                      onClick={() => setActiveTab('positions')}
                      className={cn(
                        'flex-1 px-4 py-3 text-sm font-medium transition-all duration-200',
                        activeTab === 'positions'
                          ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700'
                      )}
                    >
                      Positions
                    </button>
                    <button
                      onClick={() => setActiveTab('market')}
                      className={cn(
                        'flex-1 px-4 py-3 text-sm font-medium transition-all duration-200',
                        activeTab === 'market'
                          ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700'
                      )}
                    >
                      Market
                    </button>
                  </div>
                  
                  {/* Tab Content */}
                  <div className="flex-1 min-h-0 p-4">
                    {renderTabContent()}
                  </div>
                </div>
              </Panel>
            </PanelGroup>
          </div>
          
          {/* Mobile Layout */}
          <div className="md:hidden h-full flex flex-col">
            {/* Chart Area - Takes most space on mobile */}
            <div className="flex-1 min-h-[350px] max-h-[60vh] p-2">
              <TradingChart 
                symbol={selectedSymbol}
                className="w-full h-full"
              />
            </div>
            
            {/* Mobile Tab System */}
            <div className="bg-gray-800 border-t border-gray-700 flex-shrink-0">
              {/* Mobile Tab Navigation */}
              <div className="flex bg-gray-900 mx-2 mt-2 rounded-t-lg">
                <button
                  onClick={() => setActiveTab('trading')}
                  className={cn(
                    'flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 touch-manipulation rounded-tl-lg',
                    activeTab === 'trading'
                      ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700 active:bg-gray-600'
                  )}
                >
                  Trading
                </button>
                <button
                  onClick={() => setActiveTab('positions')}
                  className={cn(
                    'flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 touch-manipulation',
                    activeTab === 'positions'
                      ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700 active:bg-gray-600'
                  )}
                >
                  Positions
                </button>
                <button
                  onClick={() => setActiveTab('market')}
                  className={cn(
                    'flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 touch-manipulation rounded-tr-lg',
                    activeTab === 'market'
                      ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700 active:bg-gray-600'
                  )}
                >
                  Market
                </button>
              </div>
              
              {/* Mobile Tab Content */}
              <div className="min-h-[250px] max-h-[50vh] overflow-y-auto bg-gray-900 mx-2 mb-2 rounded-b-lg">
                <div className="p-4 h-full">
                  {renderTabContent()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trading Status Bar */}
        <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-4">
            <span>Connected to server</span>
            <span>Latency: 12ms</span>
            <span>Last update: {new Date().toLocaleTimeString()}</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span>Spread: 0.3 pips</span>
            <span>Execution: 12ms</span>
            <button
              onClick={toggleAutoTrading}
              className={cn(
                'px-2 py-1 rounded text-xs font-medium transition-colors',
                isAutoTrading
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              )}
            >
              {isAutoTrading ? 'Stop' : 'Start'} Auto
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp
        isVisible={isHelpVisible}
        onClose={hideHelp}
        shortcuts={shortcutsList}
      />
      
      <AudioAlertSettings
        isVisible={showAudioSettings}
        onClose={() => setShowAudioSettings(false)}
        settings={audioSettings}
        onUpdateSetting={updateSetting}
        onUpdateAlertSetting={updateAlertSetting}
        onToggleAllAlerts={toggleAllAlerts}
      />
    </TradingLayout>
  );
};

export default Trading;