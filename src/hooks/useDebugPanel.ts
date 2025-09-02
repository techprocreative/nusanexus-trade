import { useState, useEffect, useCallback } from 'react';

interface DebugPanelState {
  isOpen: boolean;
  isEnabled: boolean;
}

interface UseDebugPanelReturn {
  isOpen: boolean;
  isEnabled: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  enable: () => void;
  disable: () => void;
}

/**
 * Hook for managing debug panel state and keyboard shortcuts
 * Provides easy integration of the debug panel into the application
 */
export const useDebugPanel = (): UseDebugPanelReturn => {
  const [state, setState] = useState<DebugPanelState>(() => {
    // Check if debug mode is enabled (development environment or explicit flag)
    const isDevelopment = process.env.NODE_ENV === 'development';
    const debugFlag = localStorage.getItem('debug-panel-enabled') === 'true';
    const urlParams = new URLSearchParams(window.location.search);
    const debugParam = urlParams.get('debug') === 'true';
    
    return {
      isOpen: false,
      isEnabled: isDevelopment || debugFlag || debugParam,
    };
  });

  // Keyboard shortcut handler (Ctrl/Cmd + Shift + D)
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!state.isEnabled) return;
    
    const isCtrlOrCmd = event.ctrlKey || event.metaKey;
    const isShiftD = event.shiftKey && event.key.toLowerCase() === 'd';
    
    if (isCtrlOrCmd && isShiftD) {
      event.preventDefault();
      setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
    }
  }, [state.isEnabled]);

  // Set up keyboard event listener
  useEffect(() => {
    if (state.isEnabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, state.isEnabled]);

  // Save enabled state to localStorage
  useEffect(() => {
    localStorage.setItem('debug-panel-enabled', state.isEnabled.toString());
  }, [state.isEnabled]);

  const toggle = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  const open = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: true }));
  }, []);

  const close = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const enable = useCallback(() => {
    setState(prev => ({ ...prev, isEnabled: true }));
  }, []);

  const disable = useCallback(() => {
    setState(prev => ({ ...prev, isEnabled: false, isOpen: false }));
  }, []);

  return {
    isOpen: state.isOpen,
    isEnabled: state.isEnabled,
    toggle,
    open,
    close,
    enable,
    disable,
  };
};

/**
 * Global debug panel manager for programmatic access
 */
class DebugPanelManager {
  private static instance: DebugPanelManager;
  private listeners: Set<(isOpen: boolean) => void> = new Set();
  private _isOpen = false;

  static getInstance(): DebugPanelManager {
    if (!DebugPanelManager.instance) {
      DebugPanelManager.instance = new DebugPanelManager();
    }
    return DebugPanelManager.instance;
  }

  get isOpen(): boolean {
    return this._isOpen;
  }

  open(): void {
    this._isOpen = true;
    this.notifyListeners();
  }

  close(): void {
    this._isOpen = false;
    this.notifyListeners();
  }

  toggle(): void {
    this._isOpen = !this._isOpen;
    this.notifyListeners();
  }

  subscribe(listener: (isOpen: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this._isOpen));
  }
}

export const debugPanelManager = DebugPanelManager.getInstance();

/**
 * Hook that syncs with the global debug panel manager
 * Useful for components that need to react to debug panel state changes
 */
export const useDebugPanelManager = () => {
  const [isOpen, setIsOpen] = useState(debugPanelManager.isOpen);

  useEffect(() => {
    const unsubscribe = debugPanelManager.subscribe(setIsOpen);
    return unsubscribe;
  }, []);

  return {
    isOpen,
    open: debugPanelManager.open.bind(debugPanelManager),
    close: debugPanelManager.close.bind(debugPanelManager),
    toggle: debugPanelManager.toggle.bind(debugPanelManager),
  };
};

/**
 * Utility functions for debug panel integration
 */
export const debugPanelUtils = {
  /**
   * Check if debug panel should be available
   */
  isDebugModeEnabled(): boolean {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const debugFlag = localStorage.getItem('debug-panel-enabled') === 'true';
    const urlParams = new URLSearchParams(window.location.search);
    const debugParam = urlParams.get('debug') === 'true';
    
    return isDevelopment || debugFlag || debugParam;
  },

  /**
   * Enable debug panel for current session
   */
  enableForSession(): void {
    localStorage.setItem('debug-panel-enabled', 'true');
    window.location.reload();
  },

  /**
   * Disable debug panel
   */
  disable(): void {
    localStorage.removeItem('debug-panel-enabled');
    debugPanelManager.close();
  },

  /**
   * Add debug panel trigger to any element
   */
  addTrigger(element: HTMLElement, options: { doubleClick?: boolean; longPress?: boolean } = {}): () => void {
    const { doubleClick = false, longPress = false } = options;
    
    if (doubleClick) {
      const handleDoubleClick = () => {
        if (debugPanelUtils.isDebugModeEnabled()) {
          debugPanelManager.toggle();
        }
      };
      element.addEventListener('dblclick', handleDoubleClick);
      return () => element.removeEventListener('dblclick', handleDoubleClick);
    }
    
    if (longPress) {
      let pressTimer: NodeJS.Timeout;
      
      const handleMouseDown = () => {
        pressTimer = setTimeout(() => {
          if (debugPanelUtils.isDebugModeEnabled()) {
            debugPanelManager.toggle();
          }
        }, 1000); // 1 second long press
      };
      
      const handleMouseUp = () => {
        clearTimeout(pressTimer);
      };
      
      element.addEventListener('mousedown', handleMouseDown);
      element.addEventListener('mouseup', handleMouseUp);
      element.addEventListener('mouseleave', handleMouseUp);
      
      return () => {
        element.removeEventListener('mousedown', handleMouseDown);
        element.removeEventListener('mouseup', handleMouseUp);
        element.removeEventListener('mouseleave', handleMouseUp);
        clearTimeout(pressTimer);
      };
    }
    
    // Default: single click
    const handleClick = () => {
      if (debugPanelUtils.isDebugModeEnabled()) {
        debugPanelManager.toggle();
      }
    };
    element.addEventListener('click', handleClick);
    return () => element.removeEventListener('click', handleClick);
  },
};