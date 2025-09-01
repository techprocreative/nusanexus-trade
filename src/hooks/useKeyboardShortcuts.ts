import React, { useEffect, useCallback, useState } from 'react';

interface KeyboardShortcuts {
  onBuy?: () => void;
  onSell?: () => void;
  onCloseAll?: () => void;
  onToggleFullscreen?: () => void;
  onToggleHelp?: () => void;
  onFocusSymbol?: () => void;
  onFocusVolume?: () => void;
  onQuickBuy?: () => void;
  onQuickSell?: () => void;
  onCancelOrders?: () => void;
}

interface UseKeyboardShortcutsProps {
  shortcuts: KeyboardShortcuts;
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({ shortcuts, enabled = true }: UseKeyboardShortcutsProps) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;
    
    // Don't trigger shortcuts when user is typing in input fields
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true'
    ) {
      return;
    }

    // Prevent default behavior for our shortcuts
    const shouldPreventDefault = [
      'Enter', 'Space', 'KeyF', 'KeyH', 'KeyS', 'KeyV', 'KeyB', 'KeyQ', 'KeyW', 'KeyC'
    ].includes(event.code);

    if (shouldPreventDefault && (
      event.ctrlKey || event.altKey || event.shiftKey || 
      ['Enter', 'Space', 'KeyF'].includes(event.code)
    )) {
      event.preventDefault();
    }

    // Handle shortcuts
    switch (event.code) {
      case 'Enter':
        if (!event.ctrlKey && !event.altKey && !event.shiftKey) {
          shortcuts.onBuy?.();
        }
        break;
        
      case 'Space':
        if (!event.ctrlKey && !event.altKey && !event.shiftKey) {
          shortcuts.onSell?.();
        }
        break;
        
      case 'KeyF':
        if (!event.ctrlKey && !event.altKey && !event.shiftKey) {
          shortcuts.onToggleFullscreen?.();
        }
        break;
        
      case 'KeyH':
        if (event.shiftKey && !event.ctrlKey && !event.altKey) {
          shortcuts.onToggleHelp?.();
        }
        break;
        
      case 'KeyS':
        if (event.ctrlKey && !event.altKey && !event.shiftKey) {
          event.preventDefault();
          shortcuts.onFocusSymbol?.();
        }
        break;
        
      case 'KeyV':
        if (event.ctrlKey && !event.altKey && !event.shiftKey) {
          event.preventDefault();
          shortcuts.onFocusVolume?.();
        }
        break;
        
      case 'KeyB':
        if (event.ctrlKey && event.shiftKey && !event.altKey) {
          event.preventDefault();
          shortcuts.onQuickBuy?.();
        }
        break;
        
      case 'KeyQ':
        if (event.ctrlKey && event.shiftKey && !event.altKey) {
          event.preventDefault();
          shortcuts.onQuickSell?.();
        }
        break;
        
      case 'KeyW':
        if (event.ctrlKey && event.shiftKey && !event.altKey) {
          event.preventDefault();
          shortcuts.onCloseAll?.();
        }
        break;
        
      case 'KeyC':
        if (event.ctrlKey && event.altKey && !event.shiftKey) {
          event.preventDefault();
          shortcuts.onCancelOrders?.();
        }
        break;
        
      case 'Escape':
        // Close any open modals or help screens
        shortcuts.onToggleHelp?.();
        break;
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);

  return {
    // Return the shortcuts mapping for display purposes
    shortcutsList: [
      { key: 'Enter', description: 'Place Buy Order', action: 'onBuy' },
      { key: 'Space', description: 'Place Sell Order', action: 'onSell' },
      { key: 'F', description: 'Toggle Fullscreen', action: 'onToggleFullscreen' },
      { key: 'Shift + H', description: 'Toggle Help', action: 'onToggleHelp' },
      { key: 'Ctrl + S', description: 'Focus Symbol Input', action: 'onFocusSymbol' },
      { key: 'Ctrl + V', description: 'Focus Volume Input', action: 'onFocusVolume' },
      { key: 'Ctrl + Shift + B', description: 'Quick Buy (Market)', action: 'onQuickBuy' },
      { key: 'Ctrl + Shift + Q', description: 'Quick Sell (Market)', action: 'onQuickSell' },
      { key: 'Ctrl + Shift + W', description: 'Close All Positions', action: 'onCloseAll' },
      { key: 'Ctrl + Alt + C', description: 'Cancel All Orders', action: 'onCancelOrders' },
      { key: 'Escape', description: 'Close Dialogs', action: 'onToggleHelp' }
    ]
  };
};

// Hook for managing keyboard shortcut help display
export const useKeyboardShortcutsHelp = () => {
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  const toggleHelp = useCallback(() => {
    setIsHelpVisible(prev => !prev);
  }, []);

  const hideHelp = useCallback(() => {
    setIsHelpVisible(false);
  }, []);

  const showHelp = useCallback(() => {
    setIsHelpVisible(true);
  }, []);

  return {
    isHelpVisible,
    toggleHelp,
    hideHelp,
    showHelp
  };
};