import React, { useCallback, useRef, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import { useDrop } from 'react-dnd';
import { useStrategyBuilderStore } from '../../stores/strategyBuilderStore';
import { ComponentDefinition, StrategyNode } from '../../types/strategy';
import StrategyNodeComponent from './StrategyNodeComponent';
import '@xyflow/react/dist/style.css';

// Define nodeTypes outside component to prevent React Flow warning
const nodeTypes = {
  strategyNode: StrategyNodeComponent,
};



interface StrategyCanvasInnerProps {
  onNodeSelect: (nodeId: string | null) => void;
}

const StrategyCanvasInner: React.FC<StrategyCanvasInnerProps> = ({ onNodeSelect }) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  
  const {
    nodes,
    edges,
    addComponentFromDefinition,
    addConnection,
    setSelectedComponent,
    setSelectedNodeId,
  } = useStrategyBuilderStore();

  const [{ isOver }, drop] = useDrop({
    accept: 'component',
    drop: (item: { component: ComponentDefinition }, monitor) => {
      console.log('Drop event triggered for component:', item.component.name);
      const offset = monitor.getClientOffset();
      if (offset && reactFlowWrapper.current) {
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const position = screenToFlowPosition({
          x: offset.x - reactFlowBounds.left,
          y: offset.y - reactFlowBounds.top,
        });
        
        console.log('Adding component at position:', position);
        addComponentFromDefinition(item.component, position);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const onNodesChange = useCallback(
    (changes: any[]) => {
      // Handle node changes - for now just log them
      console.log('Node changes:', changes);
    },
    []
  );

  const onEdgesChange = useCallback(
    (changes: any[]) => {
      // Handle edge changes - for now just log them
      console.log('Edge changes:', changes);
    },
    []
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      console.log('StrategyCanvas onConnect:', connection);
      if (connection.source && connection.target) {
        // Generate unique ID to prevent duplicate keys
        const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newConnection = {
          id: uniqueId,
          source: connection.source,
          target: connection.target,
          sourceHandle: connection.sourceHandle || 'output',
          targetHandle: connection.targetHandle || 'input',
        };
        console.log('Adding connection:', newConnection);
        addConnection(newConnection);
      }
    },
    [addConnection]
  );

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      console.log('StrategyCanvas onNodeClick:', {
        nodeId: node.id,
        nodeName: (node as StrategyNode).data?.name
      });
      setSelectedComponent(node.id);
      onNodeSelect(node.id);
    },
    [setSelectedComponent, onNodeSelect]
  );

  const onPaneClick = useCallback(() => {
    setSelectedComponent(null);
    onNodeSelect(null);
  }, [setSelectedComponent, onNodeSelect]);

  const onNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // Double-click to delete node - for now just log
      console.log('Double-click on node:', node.id);
    },
    []
  );

  return (
    <div className="h-full w-full" ref={reactFlowWrapper} style={{ minHeight: '400px' }}>
      <div ref={drop} className="h-full w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onNodeDoubleClick={onNodeDoubleClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          className="bg-gray-50"
        >
          <Background 
            color="#e5e7eb" 
            gap={20} 
            size={1}
          />
          <Controls 
            position="top-left"
            className="bg-white border border-gray-200 rounded-lg shadow-sm"
          />
          <MiniMap 
            position="bottom-right"
            className="bg-white border border-gray-200 rounded-lg shadow-sm"
            nodeColor={(node: Node) => {
              const strategyNode = node as StrategyNode;
              return strategyNode.data?.color || '#6b7280';
            }}
          />
        </ReactFlow>
      </div>
      
      {/* Canvas Instructions */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-500">
            <div className="text-6xl mb-4 opacity-20">📊</div>
            <h3 className="text-lg font-medium mb-2">Start Building Your Strategy</h3>
            <p className="text-sm max-w-md">
              Drag components from the library to create your trading strategy.
              Connect components to define the logic flow.
            </p>
            <div className="mt-4 text-xs space-y-1">
              <div>• Click to select components</div>
              <div>• Double-click to delete components</div>
              <div>• Drag handles to create connections</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface StrategyCanvasProps {
  onNodeSelect: (nodeId: string | null) => void;
}

const StrategyCanvas: React.FC<StrategyCanvasProps> = ({ onNodeSelect }) => {
  return (
    <ReactFlowProvider>
      <StrategyCanvasInner onNodeSelect={onNodeSelect} />
    </ReactFlowProvider>
  );
};

export default StrategyCanvas;