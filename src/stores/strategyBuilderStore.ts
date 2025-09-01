import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  Strategy, 
  StrategyComponent, 
  StrategyConnection, 
  StrategyNode, 
  StrategyEdge,
  ComponentDefinition,
  ValidationResult,
  StrategyTemplate,
  ComponentCategory,
  StrategyBuilderState
} from '../types/strategy';
import { componentLibrary } from '../data/componentLibrary';
import { validateStrategy } from '../utils/strategyValidation';
import { StrategyManager, TemplateManager, SharingManager, strategyUtils } from '../utils/strategyManagement';
import { getComponentByType } from '../data/componentLibrary';

interface StrategyBuilderStore extends StrategyBuilderState {
  // Additional internal methods
  _generateId: () => string;
  _updateNodes: () => void;
  _updateEdges: () => void;
}

export const useStrategyBuilderStore = create<StrategyBuilderStore>()(devtools(
  (set, get) => ({
    // Initial State
    currentStrategy: null,
    nodes: [],
    edges: [],
    selectedComponent: null,
    selectedConnection: null,
    selectedNodeId: null,
    draggedComponent: null,
    validationResult: null,
    isValidating: false,
    componentDefinitions: componentLibrary,
    componentCategories: {
      'entry-exit': componentLibrary.filter(c => c.category === 'entry-exit'),
      'risk-management': componentLibrary.filter(c => c.category === 'risk-management'),
      'time-filters': componentLibrary.filter(c => c.category === 'time-filters'),
      'technical-indicators': componentLibrary.filter(c => c.category === 'technical-indicators'),
    },
    templates: [],

    // Internal Methods
    _generateId: () => {
      return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    _updateNodes: () => {
      const state = get();
      if (!state.currentStrategy) return;

      const nodes: StrategyNode[] = state.currentStrategy.components.map(component => {
        const definition = state.componentDefinitions.find(d => d.type === component.type);
        if (!definition) throw new Error(`Component definition not found: ${component.type}`);

        const errors = state.validationResult?.errors.filter(e => e.componentId === component.id) || [];
        
        return {
          id: component.id,
          type: 'strategyNode', // Use consistent node type for React Flow
          position: component.position,
          data: {
            type: component.type, // Add component type to node data for PropertyPanel
            name: definition.name,
            description: definition.description,
            icon: definition.icon,
            color: definition.color,
            category: definition.category,
            inputs: definition.inputs,
            outputs: definition.outputs,
            parameters: component.parameters,
            validationStatus: errors.length === 0 ? 'valid' : 'error',
            component,
            definition,
            isValid: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined,
          },
        };
      });

      set({ nodes });
    },

    _updateEdges: () => {
      const state = get();
      if (!state.currentStrategy) return;

      const edges: StrategyEdge[] = state.currentStrategy.connections.map(connection => ({
        id: connection.id,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        type: connection.type || 'default',
        animated: connection.animated || false,
        style: connection.style,
        data: {
          connection,
          isValid: true, // TODO: Add connection validation
        },
      }));

      set({ edges });
    },

    // Actions
    setCurrentStrategy: (strategy: Strategy | null) => {
      set({ currentStrategy: strategy });
      if (strategy) {
        get()._updateNodes();
        get()._updateEdges();
        get().validateStrategy();
      } else {
        set({ nodes: [], edges: [], validationResult: null });
      }
    },

    addComponent: (component: StrategyComponent) => {
      const state = get();
      if (!state.currentStrategy) {
        // Create new strategy if none exists
        const newStrategy: Strategy = {
          id: state._generateId(),
          name: 'Untitled Strategy',
          version: '1.0.0',
          components: [component],
          connections: [],
          metadata: {
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
          },
        };
        set({ currentStrategy: newStrategy, selectedComponent: component.id });
      } else {
        const updatedStrategy = {
          ...state.currentStrategy,
          components: [...state.currentStrategy.components, component],
          metadata: {
            ...state.currentStrategy.metadata,
            modified: new Date().toISOString(),
          },
        };
        set({ currentStrategy: updatedStrategy, selectedComponent: component.id });
      }
      
      get()._updateNodes();
      get().validateStrategy();
    },

    // Helper method to create StrategyComponent from ComponentDefinition
    addComponentFromDefinition: (definition: ComponentDefinition, position: { x: number; y: number }) => {
      const componentId = get()._generateId();
      
      // Create default parameters from definition
      const defaultParameters: Record<string, any> = {};
      definition.parameters.forEach(param => {
        defaultParameters[param.name] = param.defaultValue;
      });
      
      const strategyComponent: StrategyComponent = {
        id: componentId,
        type: definition.type,
        position,
        parameters: defaultParameters,
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
        },
      };
      
      console.log('Creating StrategyComponent from definition:', {
        componentId,
        type: definition.type,
        position,
        parameters: defaultParameters
      });
      
      get().addComponent(strategyComponent);
    },

    updateComponent: (id: string, updates: Partial<StrategyComponent>) => {
      const state = get();
      if (!state.currentStrategy) return;

      const updatedComponents = state.currentStrategy.components.map(component =>
        component.id === id ? { ...component, ...updates } : component
      );

      const updatedStrategy = {
        ...state.currentStrategy,
        components: updatedComponents,
        metadata: {
          ...state.currentStrategy.metadata,
          modified: new Date().toISOString(),
        },
      };

      set({ currentStrategy: updatedStrategy });
      get()._updateNodes();
      get().validateStrategy();
    },

    updateNodeParameters: (id: string, parameters: Record<string, any>) => {
      const state = get();
      if (!state.currentStrategy) return;

      const updatedComponents = state.currentStrategy.components.map(component =>
        component.id === id ? { ...component, parameters } : component
      );

      const updatedStrategy = {
        ...state.currentStrategy,
        components: updatedComponents,
        metadata: {
          ...state.currentStrategy.metadata,
          modified: new Date().toISOString(),
        },
      };

      set({ currentStrategy: updatedStrategy });
      get()._updateNodes();
      get().validateStrategy();
    },

    removeComponent: (id: string) => {
      const state = get();
      if (!state.currentStrategy) return;

      // Remove component and its connections
      const updatedComponents = state.currentStrategy.components.filter(c => c.id !== id);
      const updatedConnections = state.currentStrategy.connections.filter(
        c => c.source !== id && c.target !== id
      );

      const updatedStrategy = {
        ...state.currentStrategy,
        components: updatedComponents,
        connections: updatedConnections,
        metadata: {
          ...state.currentStrategy.metadata,
          modified: new Date().toISOString(),
        },
      };

      set({ 
        currentStrategy: updatedStrategy,
        selectedComponent: state.selectedComponent === id ? null : state.selectedComponent,
      });
      
      get()._updateNodes();
      get()._updateEdges();
      get().validateStrategy();
    },

    addConnection: (connection: StrategyConnection) => {
      const state = get();
      if (!state.currentStrategy) return;

      const updatedConnections = [...state.currentStrategy.connections, connection];
      const updatedStrategy = {
        ...state.currentStrategy,
        connections: updatedConnections,
        metadata: {
          ...state.currentStrategy.metadata,
          modified: new Date().toISOString(),
        },
      };

      set({ currentStrategy: updatedStrategy });
      get()._updateEdges();
      get().validateStrategy();
    },

    removeConnection: (id: string) => {
      const state = get();
      if (!state.currentStrategy) return;

      const updatedConnections = state.currentStrategy.connections.filter(c => c.id !== id);
      const updatedStrategy = {
        ...state.currentStrategy,
        connections: updatedConnections,
        metadata: {
          ...state.currentStrategy.metadata,
          modified: new Date().toISOString(),
        },
      };

      set({ 
        currentStrategy: updatedStrategy,
        selectedConnection: state.selectedConnection === id ? null : state.selectedConnection,
      });
      
      get()._updateEdges();
      get().validateStrategy();
    },

    setSelectedComponent: (id: string | null) => {
      console.log('setSelectedComponent called with:', id);
      set({ 
        selectedComponent: id,
        selectedConnection: null,
        selectedNodeId: id
      });
    },

    setSelectedConnection: (id: string | null) => {
      set({ selectedConnection: id, selectedComponent: null });
    },

    setSelectedNodeId: (id: string | null) => {
      set({ selectedNodeId: id });
    },

    validateStrategy: async (): Promise<ValidationResult> => {
      const state = get();
      if (!state.currentStrategy) {
        const emptyResult: ValidationResult = {
          isValid: false,
          errors: [],
          warnings: [],
          completeness: 0,
        };
        set({ validationResult: emptyResult });
        return emptyResult;
      }

      set({ isValidating: true });
      
      try {
        // Ensure nodes are properly initialized before validation
        const nodes = state.nodes || [];
        const connections = state.currentStrategy.connections || [];
        
        const result = validateStrategy({
          nodes,
          connections
        });
        
        const updatedStrategy = {
          ...state.currentStrategy,
          validation: result,
        };
        
        set({ 
          currentStrategy: updatedStrategy,
          validationResult: result,
          isValidating: false,
        });
        
        get()._updateNodes();
        return result;
      } catch (error) {
        console.error('Validation error:', error);
        const errorResult: ValidationResult = {
          isValid: false,
          errors: [{
            id: 'validation-error',
            type: 'missing-connection',
            message: 'Validation failed due to an internal error',
            severity: 'error',
          }],
          warnings: [],
          completeness: 0,
        };
        
        set({ validationResult: errorResult, isValidating: false });
        return errorResult;
      }
    },

    saveStrategy: async (): Promise<void> => {
      const state = get();
      if (!state.currentStrategy) return;

      try {
        // Update the modified timestamp
        const updatedStrategy = {
          ...state.currentStrategy,
          metadata: {
            ...state.currentStrategy.metadata,
            modified: new Date().toISOString(),
          },
        };
        
        // Save to localStorage
        await StrategyManager.saveStrategy(updatedStrategy);
        set({ currentStrategy: updatedStrategy });
      } catch (error) {
        console.error('Failed to save strategy:', error);
        throw error;
      }
    },

    loadStrategy: async (id: string): Promise<void> => {
      try {
        const strategy = await StrategyManager.loadStrategy(id);
        if (strategy) {
          get().setCurrentStrategy(strategy);
        } else {
          throw new Error('Strategy not found');
        }
      } catch (error) {
        console.error('Failed to load strategy:', error);
        throw error;
      }
    },

    exportStrategy: (): string => {
      const state = get();
      if (!state.currentStrategy) return '';
      
      return JSON.stringify(state.currentStrategy, null, 2);
    },

    importStrategy: (data: string): void => {
      try {
        const strategy: Strategy = JSON.parse(data);
        get().setCurrentStrategy(strategy);
      } catch (error) {
        console.error('Failed to import strategy:', error);
      }
    },

    resetBuilder: () => {
      set({
        currentStrategy: null,
        nodes: [],
        edges: [],
        selectedComponent: null,
        selectedConnection: null,
        draggedComponent: null,
        validationResult: null,
        isValidating: false,
      });
    },

    clearStrategy: () => {
      set({
        currentStrategy: null,
        nodes: [],
        edges: [],
        selectedComponent: null,
        selectedConnection: null,
        draggedComponent: null,
        validationResult: null,
        isValidating: false,
      });
    },

    // Enhanced Strategy Management Methods
    duplicateStrategy: async (id: string, newName?: string): Promise<Strategy | null> => {
      try {
        return await StrategyManager.duplicateStrategy(id, newName);
      } catch (error) {
        console.error('Failed to duplicate strategy:', error);
        return null;
      }
    },

    deleteStrategy: async (id: string): Promise<void> => {
      try {
        await StrategyManager.deleteStrategy(id);
      } catch (error) {
        console.error('Failed to delete strategy:', error);
        throw error;
      }
    },

    getAllStrategies: () => {
      return StrategyManager.getAllStrategies();
    },

    searchStrategies: (query: string, tags?: string[]) => {
      return StrategyManager.searchStrategies(query, tags);
    },

    // Template Management
    saveAsTemplate: async (templateData: Partial<StrategyTemplate>): Promise<StrategyTemplate | null> => {
      const state = get();
      if (!state.currentStrategy) return null;

      try {
        return await TemplateManager.saveAsTemplate(state.currentStrategy, templateData);
      } catch (error) {
        console.error('Failed to save template:', error);
        return null;
      }
    },

    createFromTemplate: (templateId: string, customName?: string): void => {
      try {
        const strategy = TemplateManager.createFromTemplate(templateId, customName);
        if (strategy) {
          get().setCurrentStrategy(strategy);
        }
      } catch (error) {
        console.error('Failed to create from template:', error);
      }
    },

    getAllTemplates: () => {
      return TemplateManager.getAllTemplates();
    },

    deleteTemplate: async (id: string): Promise<void> => {
      try {
        await TemplateManager.deleteTemplate(id);
      } catch (error) {
        console.error('Failed to delete template:', error);
        throw error;
      }
    },

    // Sharing Features
    shareStrategy: async (isPublic: boolean = false): Promise<string | null> => {
      const state = get();
      if (!state.currentStrategy) return null;

      try {
        return await SharingManager.shareStrategy(state.currentStrategy, isPublic);
      } catch (error) {
        console.error('Failed to share strategy:', error);
        return null;
      }
    },

    loadSharedStrategy: async (shareId: string): Promise<void> => {
      try {
        const strategy = await SharingManager.loadSharedStrategy(shareId);
        if (strategy) {
          get().setCurrentStrategy(strategy);
        } else {
          throw new Error('Shared strategy not found');
        }
      } catch (error) {
        console.error('Failed to load shared strategy:', error);
        throw error;
      }
    },

    getSharedStrategies: () => {
      return SharingManager.getSharedStrategies();
    },

    // Utility Methods
    generateStrategyStats: () => {
      const state = get();
      if (!state.currentStrategy) return null;
      return strategyUtils.generateStats(state.currentStrategy);
    },

    generateNewId: () => {
      return strategyUtils.generateId();
    },
  }),
  {
    name: 'strategy-builder-store',
  }
));

// Selector hooks for better performance
export const useCurrentStrategy = () => useStrategyBuilderStore(state => state.currentStrategy);
export const useNodes = () => useStrategyBuilderStore(state => state.nodes);
export const useEdges = () => useStrategyBuilderStore(state => state.edges);
export const useSelectedComponent = () => useStrategyBuilderStore(state => state.selectedComponent);
export const useValidationResult = () => useStrategyBuilderStore(state => state.validationResult);
export const useComponentCategories = () => useStrategyBuilderStore(state => state.componentCategories);