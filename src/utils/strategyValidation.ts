import type { StrategyNode, StrategyConnection, ComponentType, ValidationResult, ValidationError, ValidationWarning } from '../types/strategy';
import { getComponentByType } from '../data/componentLibrary';

export interface ValidationContext {
  nodes: StrategyNode[];
  connections: StrategyConnection[];
}

/**
 * Validates a complete strategy and returns a comprehensive report
 */
export function validateStrategy(context: ValidationContext): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const suggestions: string[] = [];

  // Run all validation checks
  const nodeValidation = validateNodes(context.nodes);
  const connectionValidation = validateConnections(context.nodes, context.connections);
  const flowValidation = validateLogicFlow(context.nodes, context.connections);
  const completenessValidation = validateCompleteness(context.nodes, context.connections);

  // Combine all validation results
  errors.push(...nodeValidation.errors, ...connectionValidation.errors, ...flowValidation.errors);
  warnings.push(...nodeValidation.warnings, ...connectionValidation.warnings, ...flowValidation.warnings);
  suggestions.push(...completenessValidation.suggestions);

  const completeness = calculateCompletenessScore(context.nodes, context.connections);
  const isValid = errors.length === 0;

  // Convert ValidationError warnings to ValidationWarning format
  const validationWarnings: ValidationWarning[] = warnings.map(warning => ({
    id: warning.id,
    type: 'best-practice' as const,
    componentId: warning.componentId,
    message: warning.message,
    suggestion: 'Consider reviewing this configuration'
  }));

  return {
    isValid,
    errors,
    warnings: validationWarnings,
    completeness,
    suggestions
  };
}

/**
 * Validates individual nodes and their parameters
 */
function validateNodes(nodes: StrategyNode[]): { errors: ValidationError[]; warnings: ValidationError[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  for (const node of nodes) {
    const component = getComponentByType(node.type);
    if (!component) {
      errors.push({
        id: `unknown-component-${node.id}`,
        type: 'invalid-parameter',
        componentId: node.id,
        message: `Unknown component type: ${node.type}`,
        severity: 'error'
      });
      continue;
    }

    // Get component parameters from the node data
    const componentParameters = node.data?.component?.parameters || {};

    // Validate required parameters
    for (const param of component.parameters) {
      if (param.required && (componentParameters[param.name] === undefined || componentParameters[param.name] === '')) {
        errors.push({
          id: `missing-param-${node.id}-${param.name}`,
          type: 'invalid-parameter',
          componentId: node.id,
          message: `Required parameter '${param.label}' is missing`,
          severity: 'error'
        });
      }

      // Validate parameter values
      const value = componentParameters[param.name];
      if (value !== undefined && value !== '') {
        const paramValidation = validateParameter(param, value);
        if (!paramValidation.isValid) {
          errors.push({
            id: `invalid-param-${node.id}-${param.name}`,
            type: 'invalid-parameter',
            componentId: node.id,
            message: `Invalid value for '${param.label}': ${paramValidation.error}`,
            severity: 'error'
          });
        }
      }
    }

    // Check for incomplete configurations
    const configuredParams = Object.keys(componentParameters).filter(key => 
      componentParameters[key] !== undefined && componentParameters[key] !== ''
    );
    const totalParams = component.parameters.length;
    const configurationRatio = configuredParams.length / totalParams;

    if (configurationRatio < 0.5) {
      warnings.push({
        id: `incomplete-config-${node.id}`,
        type: 'invalid-parameter',
        componentId: node.id,
        message: `Component '${component.name}' is only ${Math.round(configurationRatio * 100)}% configured`,
        severity: 'warning'
      });
    }
  }

  return { errors, warnings };
}

/**
 * Validates connections between nodes
 */
function validateConnections(nodes: StrategyNode[], connections: StrategyConnection[]): { errors: ValidationError[]; warnings: ValidationError[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  for (const connection of connections) {
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);

    if (!sourceNode) {
      errors.push({
        id: `invalid-source-${connection.id}`,
        type: 'missing-connection',
        message: 'Connection source node not found',
        severity: 'error'
      });
      continue;
    }

    if (!targetNode) {
      errors.push({
        id: `invalid-target-${connection.id}`,
        type: 'missing-connection',
        message: 'Connection target node not found',
        severity: 'error'
      });
      continue;
    }

    // Validate connection compatibility
    const sourceComponent = getComponentByType(sourceNode.type);
    const targetComponent = getComponentByType(targetNode.type);

    if (sourceComponent && targetComponent) {
      const sourceHandleExists = sourceComponent.outputs.includes(connection.sourceHandle);
      const targetHandleExists = targetComponent.inputs.includes(connection.targetHandle);

      if (!sourceHandleExists) {
        errors.push({
          id: `invalid-source-handle-${connection.id}`,
          type: 'missing-connection',
          message: `Invalid source handle: ${connection.sourceHandle}`,
          severity: 'error'
        });
      }

      if (!targetHandleExists) {
        errors.push({
          id: `invalid-target-handle-${connection.id}`,
          type: 'missing-connection',
          message: `Invalid target handle: ${connection.targetHandle}`,
          severity: 'error'
        });
      }

      // Basic validation completed
      // TODO: Implement data type compatibility checks when handle objects include dataType properties
    }
  }

  return { errors, warnings };
}

/**
 * Validates the logical flow of the strategy
 */
function validateLogicFlow(nodes: StrategyNode[], connections: StrategyConnection[]): { errors: ValidationError[]; warnings: ValidationError[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Check for circular dependencies
  const circularDeps = detectCircularDependencies(nodes, connections);
  if (circularDeps.length > 0) {
    errors.push({
      id: `circular-dependency-${Date.now()}`,
      type: 'circular-dependency',
      message: `Circular dependency detected: ${circularDeps.join(' → ')}`,
      severity: 'error'
    });
  }

  // Check for orphaned nodes
  const orphanedNodes = findOrphanedNodes(nodes, connections);
  for (const nodeId of orphanedNodes) {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      warnings.push({
        id: `orphaned-node-${nodeId}`,
        type: 'orphaned-component',
        componentId: nodeId,
        message: `Node '${getComponentByType(node.type)?.name || node.type}' is not connected`,
        severity: 'warning'
      });
    }
  }

  // Validate strategy structure
  const hasEntryCondition = nodes.some(n => getComponentByType(n.type)?.category === 'entry-exit');
  const hasRiskManagement = nodes.some(n => getComponentByType(n.type)?.category === 'risk-management');

  if (!hasEntryCondition) {
    warnings.push({
      id: `missing-entry-conditions-${Date.now()}`,
      type: 'invalid-parameter',
      message: 'Strategy lacks entry/exit conditions',
      severity: 'warning'
    });
  }

  if (!hasRiskManagement) {
    warnings.push({
      id: `missing-risk-management-${Date.now()}`,
      type: 'invalid-parameter',
      message: 'Strategy lacks risk management components',
      severity: 'warning'
    });
  }

  return { errors, warnings };
}

/**
 * Validates strategy completeness and provides suggestions
 */
function validateCompleteness(nodes: StrategyNode[], connections: StrategyConnection[]): { suggestions: string[] } {
  const suggestions: string[] = [];

  // Check for missing component categories
  const categories = new Set(nodes.map(n => getComponentByType(n.type)?.category).filter(Boolean));

  if (!categories.has('entry-exit')) {
    suggestions.push('Add entry and exit conditions to define when trades should be opened and closed');
  }

  if (!categories.has('risk-management')) {
    suggestions.push('Add risk management components like stop loss and position sizing');
  }

  if (!categories.has('technical-indicators')) {
    suggestions.push('Consider adding technical indicators to improve signal quality');
  }

  if (!categories.has('time-filters')) {
    suggestions.push('Add time filters to control when the strategy should be active');
  }

  // Check for strategy complexity
  if (nodes.length < 3) {
    suggestions.push('Consider adding more components to create a more robust strategy');
  }

  if (connections.length < 2) {
    suggestions.push('Connect components to create logical relationships in your strategy');
  }

  return { suggestions };
}

/**
 * Calculates a completeness score from 0-100
 */
function calculateCompletenessScore(nodes: StrategyNode[], connections: StrategyConnection[]): number {
  let score = 0;
  const maxScore = 100;

  // Base score for having nodes (20 points)
  if (nodes.length > 0) {
    score += Math.min(20, nodes.length * 5);
  }

  // Score for connections (20 points)
  if (connections.length > 0) {
    score += Math.min(20, connections.length * 4);
  }

  // Score for category coverage (40 points)
  const categories = new Set(nodes.map(n => getComponentByType(n.type)?.category).filter(Boolean));
  score += categories.size * 10;

  // Score for parameter configuration (20 points)
  let totalParams = 0;
  let configuredParams = 0;

  for (const node of nodes) {
    const component = getComponentByType(node.type);
    if (component && node.data?.component?.parameters) {
      totalParams += component.parameters.length;
      configuredParams += Object.keys(node.data.component.parameters).filter(key => 
        node.data.component.parameters[key] !== undefined && node.data.component.parameters[key] !== ''
      ).length;
    }
  }

  if (totalParams > 0) {
    score += Math.round((configuredParams / totalParams) * 20);
  }

  return Math.min(maxScore, score);
}

/**
 * Validates individual parameter values
 */
function validateParameter(param: any, value: any): { isValid: boolean; error?: string } {
  // Type validation
  switch (param.type) {
    case 'number':
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return { isValid: false, error: 'Must be a valid number' };
      }
      if (param.min !== undefined && numValue < param.min) {
        return { isValid: false, error: `Must be at least ${param.min}` };
      }
      if (param.max !== undefined && numValue > param.max) {
        return { isValid: false, error: `Must be at most ${param.max}` };
      }
      break;

    case 'string':
      if (typeof value !== 'string') {
        return { isValid: false, error: 'Must be a string' };
      }
      if (param.pattern && !new RegExp(param.pattern).test(value)) {
        return { isValid: false, error: 'Invalid format' };
      }
      break;

    case 'select':
      if (param.options && !param.options.some((opt: any) => opt.value === value)) {
        return { isValid: false, error: 'Invalid option selected' };
      }
      break;

    case 'boolean':
      if (typeof value !== 'boolean') {
        return { isValid: false, error: 'Must be true or false' };
      }
      break;
  }

  return { isValid: true };
}

/**
 * Detects circular dependencies in the strategy graph
 */
function detectCircularDependencies(nodes: StrategyNode[], connections: StrategyConnection[]): string[] {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const path: string[] = [];

  function dfs(nodeId: string): boolean {
    if (recursionStack.has(nodeId)) {
      const cycleStart = path.indexOf(nodeId);
      return true;
    }

    if (visited.has(nodeId)) {
      return false;
    }

    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);

    const outgoingConnections = connections.filter(c => c.source === nodeId);
    for (const connection of outgoingConnections) {
      if (dfs(connection.target)) {
        return true;
      }
    }

    recursionStack.delete(nodeId);
    path.pop();
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) {
        return path;
      }
    }
  }

  return [];
}

/**
 * Finds nodes that are not connected to any other nodes
 */
function findOrphanedNodes(nodes: StrategyNode[], connections: StrategyConnection[]): string[] {
  const connectedNodes = new Set<string>();

  for (const connection of connections) {
    connectedNodes.add(connection.source);
    connectedNodes.add(connection.target);
  }

  return nodes.filter(node => !connectedNodes.has(node.id)).map(node => node.id);
}

/**
 * Real-time validation hook for individual nodes
 */
export function validateNode(node: StrategyNode): ValidationResult {
  const component = getComponentByType(node.type);
  if (!component) {
    return {
      isValid: false,
      errors: [{
        id: `unknown-component-${node.id}`,
        type: 'invalid-parameter',
        componentId: node.id,
        message: `Unknown component type: ${node.type}`,
        severity: 'error'
      }],
      warnings: [],
      completeness: 0
    };
  }

  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Validate required parameters
  if (node.data?.component?.parameters) {
    for (const param of component.parameters) {
      if (param.required && (node.data.component.parameters[param.name] === undefined || node.data.component.parameters[param.name] === '')) {
        errors.push({
          id: `missing-param-${node.id}-${param.name}`,
          type: 'invalid-parameter',
          componentId: node.id,
          message: `Required parameter '${param.label}' is missing`,
          severity: 'error'
        });
      }

      // Validate parameter values
      const value = node.data.component.parameters[param.name];
      if (value !== undefined && value !== '') {
        const paramValidation = validateParameter(param, value);
        if (!paramValidation.isValid) {
          errors.push({
            id: `invalid-param-${node.id}-${param.name}`,
            type: 'invalid-parameter',
            componentId: node.id,
            message: `Invalid value for '${param.label}': ${paramValidation.error}`,
            severity: 'error'
          });
        }
      }
    }
  }

  // Calculate completeness
  const configuredParams = Object.keys(node.data?.component?.parameters || {}).filter(key => {
    const value = node.data?.component?.parameters?.[key];
    return value !== undefined && value !== '';
  });
  const totalParams = component.parameters.length;
  const completeness = totalParams > 0 ? Math.round((configuredParams.length / totalParams) * 100) : 100;

  // Add warning for incomplete configuration
  if (completeness < 50) {
    warnings.push({
      id: `incomplete-config-${node.id}`,
      type: 'best-practice',
      componentId: node.id,
      message: `Component '${component.name}' is only ${completeness}% configured`,
      suggestion: 'Consider configuring more parameters for better performance'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    completeness
  };
}

/**
 * Validates a single connection
 */
export function validateConnection(connection: StrategyConnection, nodes: StrategyNode[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  const sourceNode = nodes.find(n => n.id === connection.source);
  const targetNode = nodes.find(n => n.id === connection.target);

  if (!sourceNode) {
    errors.push({
      id: `invalid-source-${connection.id}`,
      type: 'missing-connection',
      message: 'Connection source node not found',
      severity: 'error'
    });
  }

  if (!targetNode) {
    errors.push({
      id: `invalid-target-${connection.id}`,
      type: 'missing-connection',
      message: 'Connection target node not found',
      severity: 'error'
    });
  }

  if (sourceNode && targetNode) {
    const sourceComponent = getComponentByType(sourceNode.type);
    const targetComponent = getComponentByType(targetNode.type);

    if (sourceComponent && targetComponent) {
      // Validate source handle exists in component outputs
      if (connection.sourceHandle && !sourceComponent.outputs.includes(connection.sourceHandle)) {
        errors.push({
          id: `invalid-source-handle-${connection.id}`,
          type: 'missing-connection',
          message: `Invalid source handle: ${connection.sourceHandle}`,
          severity: 'error'
        });
      }

      // Validate target handle exists in component inputs
      if (connection.targetHandle && !targetComponent.inputs.includes(connection.targetHandle)) {
        errors.push({
          id: `invalid-target-handle-${connection.id}`,
          type: 'missing-connection',
          message: `Invalid target handle: ${connection.targetHandle}`,
          severity: 'error'
        });
      }

      // Note: Basic connection validation completed
      // Data type compatibility could be enhanced in future versions
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    completeness: errors.length === 0 ? 100 : 0
  };
}