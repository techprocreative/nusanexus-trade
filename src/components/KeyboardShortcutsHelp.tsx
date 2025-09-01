import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { cn } from '../utils/cn';

interface KeyboardShortcutsHelpProps {
  isVisible: boolean;
  onClose: () => void;
  shortcuts: Array<{
    key: string;
    description: string;
    action: string;
  }>;
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  isVisible,
  onClose,
  shortcuts
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Keyboard className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-700 transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 px-3 bg-gray-900 rounded border border-gray-600"
            >
              <span className="text-gray-300">{shortcut.description}</span>
              <kbd className="px-2 py-1 bg-gray-700 text-white text-sm font-mono rounded border border-gray-600">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-400">
            Press <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Shift + H</kbd> to toggle this help screen
          </p>
        </div>
      </div>
    </div>
  );
};