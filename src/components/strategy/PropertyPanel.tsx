import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Settings, Save, RotateCcw, AlertCircle } from 'lucide-react';
import { useStrategyBuilderStore } from '../../stores/strategyBuilderStore';
import { getComponentByType, componentLibrary } from '../../data/componentLibrary';
import { ParameterDefinition } from '../../types/strategy';

interface PropertyPanelProps {
  selectedNodeId: string | null;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({ selectedNodeId }) => {
  const { nodes, updateNodeParameters } = useStrategyBuilderStore();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const selectedNode = selectedNodeId ? nodes.find(node => node.id === selectedNodeId) : null;
  const componentDef = selectedNode ? getComponentByType(selectedNode.data.type) : null;
  
  // Debug: Check why componentDef is null
  if (selectedNode && !componentDef) {
    console.error('ComponentDef not found for type:', selectedNode.data.type);
    console.log('Available component types:', componentLibrary.map(c => c.type));
  }
  
  // Enhanced debug logging
  console.log('PropertyPanel render:', {
    selectedNodeId,
    nodesLength: nodes.length,
    selectedNode: selectedNode ? {
      id: selectedNode.id,
      type: selectedNode.data.type,
      name: selectedNode.data.name,
      parameters: selectedNode.data.parameters,
      parametersKeys: selectedNode.data.parameters ? Object.keys(selectedNode.data.parameters) : []
    } : null,
    componentDef: componentDef ? {
      type: componentDef.type,
      name: componentDef.name,
      parametersCount: componentDef.parameters?.length || 0,
      parameters: componentDef.parameters
    } : null,
    willShowForm: !!(selectedNode && componentDef && componentDef.parameters?.length > 0)
  });
  
  // Create dynamic validation schema based on component parameters
  const createValidationSchema = (parameters: ParameterDefinition[]) => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};
    
    parameters.forEach(param => {
      let field: z.ZodTypeAny;
      
      switch (param.type) {
        case 'number':
          field = z.number();
          if (param.validation?.min !== undefined) {
            field = field.min(param.validation.min);
          }
          if (param.validation?.max !== undefined) {
            field = field.max(param.validation.max);
          }
          break;
          
        case 'string':
          field = z.string();
          if (param.validation?.pattern) {
            field = field.regex(new RegExp(param.validation.pattern));
          }
          break;
          
        case 'boolean':
          field = z.boolean();
          break;
          
        case 'select':
          if (param.options) {
            const values = param.options.map(opt => opt.value) as [string, ...string[]];
            field = z.enum(values);
          } else {
            field = z.string();
          }
          break;
          
        default:
          field = z.any();
      }
      
      if (!param.required) {
        field = field.optional();
      }
      
      schemaFields[param.name] = field;
    });
    
    return z.object(schemaFields);
  };
  
  const validationSchema = componentDef ? createValidationSchema(componentDef.parameters) : z.object({});
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty }
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: selectedNode?.data.parameters || {}
  });
  
  // Watch for form changes
  const watchedValues = watch();
  
  useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty]);
  
  // Reset form when node selection changes
  useEffect(() => {
    if (selectedNode) {
      reset(selectedNode.data.parameters || {});
    }
  }, [selectedNodeId, reset, selectedNode]);
  
  const onSubmit = (data: any) => {
    if (selectedNodeId) {
      updateNodeParameters(selectedNodeId, data);
      setHasUnsavedChanges(false);
    }
  };
  
  const handleReset = () => {
    if (componentDef) {
      const defaultValues: Record<string, any> = {};
      componentDef.parameters.forEach(param => {
        defaultValues[param.name] = param.defaultValue;
      });
      reset(defaultValues);
    }
  };
  
  if (!selectedNode || !componentDef) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Settings size={20} />
            Properties
          </h2>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Settings size={48} className="mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium mb-2">No Component Selected</h3>
            <p className="text-sm max-w-sm">
              Select a component on the canvas to configure its properties and parameters.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Settings size={20} />
            Properties
          </h2>
          
          {hasUnsavedChanges && (
            <div className="flex items-center gap-1 text-orange-600 text-sm">
              <AlertCircle size={14} />
              <span>Unsaved</span>
            </div>
          )}
        </div>
        
        {/* Component Info */}
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: selectedNode.data.color }}
          />
          <div>
            <div className="font-medium text-sm text-gray-900">
              {selectedNode.data.name}
            </div>
            <div className="text-xs text-gray-600">
              {selectedNode.data.category.replace('-', ' ')}
            </div>
          </div>
        </div>
      </div>
      
      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {componentDef.parameters.map((param) => (
            <div key={param.name} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {param.label}
                {param.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {param.description && (
                <p className="text-xs text-gray-600">{param.description}</p>
              )}
              
              {/* Input Field */}
              {param.type === 'select' ? (
                <select
                  {...register(param.name, { 
                    valueAsNumber: false,
                    setValueAs: (value) => value
                  })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {param.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : param.type === 'boolean' ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register(param.name)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Enable</span>
                </label>
              ) : param.type === 'number' ? (
                <input
                  type="number"
                  {...register(param.name, { 
                    valueAsNumber: true,
                    setValueAs: (value) => value === '' ? undefined : Number(value)
                  })}
                  step={param.step || 'any'}
                  min={param.min}
                  max={param.max}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <input
                  type="text"
                  {...register(param.name)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
              
              {/* Validation Error */}
              {errors[param.name] && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors[param.name]?.message as string}
                </p>
              )}
            </div>
          ))}
          
          {/* Form Actions */}
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={!hasUnsavedChanges}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save size={14} />
              Save Changes
            </button>
            
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </form>
      </div>
      
      {/* Component Details */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="text-xs text-gray-600 space-y-1">
          <div><strong>Inputs:</strong> {componentDef.inputs.length || 'None'}</div>
          <div><strong>Outputs:</strong> {componentDef.outputs.length || 'None'}</div>
          <div><strong>ID:</strong> {selectedNode.id}</div>
        </div>
      </div>
    </div>
  );
};

export default PropertyPanel;