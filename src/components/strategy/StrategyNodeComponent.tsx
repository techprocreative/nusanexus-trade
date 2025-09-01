import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { StrategyNode } from '../../types/strategy';
import * as LucideIcons from 'lucide-react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useStrategyBuilderStore } from '../../stores/strategyBuilderStore';

interface StrategyNodeComponentProps extends NodeProps {
  data: StrategyNode['data'];
}

const StrategyNodeComponent: React.FC<StrategyNodeComponentProps> = ({ 
  id, 
  data, 
  selected 
}) => {
  const { selectedNodeId } = useStrategyBuilderStore();
  const isSelected = selected || selectedNodeId === id;
  
  // Get the icon component dynamically
  const IconComponent = (LucideIcons as any)[data.icon] || LucideIcons.Box;
  
  // Determine if node has inputs/outputs for handle rendering
  const hasInputs = data.inputs && data.inputs.length > 0;
  const hasOutputs = data.outputs && data.outputs.length > 0;
  
  // Debug logging
  console.log('StrategyNodeComponent render:', {
    nodeId: data.id,
    hasInputs: data.inputs && data.inputs.length > 0,
    hasOutputs: data.outputs && data.outputs.length > 0,
    inputs: data.inputs,
    outputs: data.outputs,
    isSelected: selected
  });
  
  return (
    <div 
      className={`
        relative bg-white border-2 rounded-lg shadow-sm min-w-[160px] max-w-[200px]
        transition-all duration-200
        ${isSelected 
          ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
        }
      `}
    >
      {/* Input Handles */}
      {hasInputs && (
        <Handle
          type="target"
          position={Position.Left}
          id="input"
          className="w-3 h-3 bg-gray-400 border-2 border-white hover:bg-blue-500 transition-colors"
          style={{ left: -6 }}
        />
      )}
      
      {/* Node Header */}
      <div 
        className="px-3 py-2 rounded-t-lg flex items-center gap-2"
        style={{ 
          backgroundColor: data.color + '15',
          borderBottom: `1px solid ${data.color}25`
        }}
      >
        <IconComponent 
          size={16} 
          style={{ color: data.color }}
        />
        <span className="font-medium text-sm text-gray-900 truncate">
          {data.name}
        </span>
      </div>
      
      {/* Node Body */}
      <div className="px-3 py-2">
        <p className="text-xs text-gray-600 leading-relaxed">
          {data.description}
        </p>
        
        {/* Parameter Summary */}
        {data.parameters && Object.keys(data.parameters).length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500 space-y-1">
              {Object.entries(data.parameters).slice(0, 2).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="truncate">{key}:</span>
                  <span className="font-mono ml-1 truncate">
                    {String(value).length > 8 
                      ? String(value).substring(0, 8) + '...' 
                      : String(value)
                    }
                  </span>
                </div>
              ))}
              {Object.keys(data.parameters).length > 2 && (
                <div className="text-center text-gray-400">
                  +{Object.keys(data.parameters).length - 2} more
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Output Handles */}
      {hasOutputs && (
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          className="w-3 h-3 bg-gray-400 border-2 border-white hover:bg-blue-500 transition-colors"
          style={{ right: -6 }}
        />
      )}
      
      {/* Validation Status Indicator */}
      <div className="absolute -top-2 -right-2 z-10">
        {data.isValid && !data.errors?.length && (
          <CheckCircle className="w-4 h-4 text-green-500" />
        )}
        {data.errors && data.errors.length > 0 && (
          data.errors.some(e => e.severity === 'error') ? (
            <XCircle className="w-4 h-4 text-red-500" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
          )
        )}
      </div>
      
      {/* Category Badge */}
      <div className="absolute -top-2 left-2">
        <span 
          className="px-2 py-0.5 text-xs font-medium rounded-full text-white"
          style={{ backgroundColor: data.color }}
        >
          {data.category.replace('-', ' ').toUpperCase()}
        </span>
      </div>
    </div>
  );
};

export default StrategyNodeComponent;