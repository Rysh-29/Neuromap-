import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
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
  Panel,
  useReactFlow,
  MarkerType,
} from 'reactflow';
import { toPng } from 'html-to-image';
import { Download, Plus, Eraser, BrainCircuit } from 'lucide-react';

// Components
import CustomNode from './components/CustomNode';
import { Sidebar } from './components/Sidebar';
import { loadMap, saveMap, clearMap } from './services/storage';
import { NodeData } from './types';

const nodeTypes = {
  custom: CustomNode,
};

const INITIAL_NODES: Node[] = [
  {
    id: '1',
    type: 'custom',
    data: { label: 'Central Concept', content: '<p>Start typing your notes here...</p>' },
    position: { x: 250, y: 250 },
  },
];

const InnerApp = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  const { setViewport, getViewport, project } = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Load data on mount
  useEffect(() => {
    const savedData = loadMap();
    if (savedData) {
      setNodes(savedData.nodes || []);
      setEdges(savedData.edges || []);
      if (savedData.viewport) {
        setViewport(savedData.viewport);
      }
    } else {
        setNodes(INITIAL_NODES);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (nodes.length > 0) {
      const timeoutId = setTimeout(() => {
        saveMap(nodes, edges, getViewport());
      }, 1000); // Debounce save
      return () => clearTimeout(timeoutId);
    }
  }, [nodes, edges, getViewport]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ 
        ...params, 
        animated: true, 
        style: { stroke: '#52525b', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#52525b' }
    }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const handleAddNode = useCallback(() => {
    const id = `${Date.now()}`;
    // Project center of screen to flow coordinates for placement
    const { x, y, zoom } = getViewport();
    // Simply placing it slightly offset from top left if projection is complex, 
    // or calculate center based on wrapper center.
    // Simplifying: Add near current view center with random offset
    const newNode: Node = {
      id,
      type: 'custom',
      position: { 
        x: (-x + window.innerWidth / 2) / zoom + (Math.random() * 50), 
        y: (-y + window.innerHeight / 2) / zoom + (Math.random() * 50)
      },
      data: { label: 'New Concept', content: '' },
    };
    setNodes((nds) => nds.concat(newNode));
    setSelectedNodeId(id);
  }, [getViewport, setNodes]);

  const handleUpdateNode = useCallback((id: string, data: Partial<NodeData>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...data,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const handleDeleteNode = useCallback((id: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
      setSelectedNodeId(null);
  }, [setNodes, setEdges]);

  const handleExport = useCallback(() => {
    if (reactFlowWrapper.current === null) {
      return;
    }

    // We select the viewport div to export
    const flowElement = document.querySelector('.react-flow__viewport') as HTMLElement;

    if (flowElement) {
        toPng(flowElement, {
            backgroundColor: '#09090b',
            style: {
                transform: `translate(${getViewport().x}px, ${getViewport().y}px) scale(${getViewport().zoom})`
            }
        })
        .then((dataUrl) => {
            const link = document.createElement('a');
            link.download = 'neuromap-export.png';
            link.href = dataUrl;
            link.click();
        })
        .catch((err) => {
            console.error('Failed to export', err);
        });
    }
  }, [getViewport]);

  const handleClear = useCallback(() => {
      if(window.confirm("Are you sure you want to clear the entire map? This cannot be undone.")) {
          clearMap();
          setNodes(INITIAL_NODES);
          setEdges([]);
          setViewport({ x: 0, y: 0, zoom: 1 });
      }
  }, [setNodes, setEdges, setViewport]);

  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  return (
    <div className="w-screen h-screen bg-background flex flex-col">
      {/* Top Navigation / Brand */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-3 pointer-events-none">
        <div className="bg-surface border border-border p-2 rounded-lg shadow-xl flex items-center gap-2 pointer-events-auto">
            <div className="text-primary bg-primary/10 p-1.5 rounded">
                <BrainCircuit size={20} />
            </div>
            <div>
                <h1 className="font-bold text-zinc-100 text-sm leading-none">NeuroMap</h1>
                <p className="text-[10px] text-zinc-500 font-medium">Study & Organize</p>
            </div>
        </div>
      </div>

      <div className="flex-1 w-full h-full relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-background"
          minZoom={0.1}
          maxZoom={4}
        >
          <Background color="#27272a" gap={24} size={1} />
          <Controls className="!bg-surface !border-border !shadow-xl [&>button]:!border-border [&>button]:!fill-zinc-400 hover:[&>button]:!bg-zinc-800" />
          <MiniMap 
            className="!bg-surface !border-border !rounded-lg !shadow-xl" 
            nodeColor="#3f3f46"
            maskColor="rgba(9, 9, 11, 0.6)" 
          />
          
          <Panel position="bottom-center" className="mb-8">
             <div className="flex items-center gap-2 bg-surface/90 backdrop-blur border border-border p-2 rounded-xl shadow-2xl">
                <button 
                    onClick={handleAddNode}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-teal-400 text-zinc-900 font-bold rounded-lg transition-colors text-sm"
                >
                    <Plus size={16} strokeWidth={3} />
                    <span>Add Concept</span>
                </button>
                <div className="w-px h-6 bg-border mx-1"></div>
                 <button 
                    onClick={handleExport}
                    className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Export as Image"
                >
                    <Download size={20} />
                </button>
                <button 
                    onClick={handleClear}
                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Clear Board"
                >
                    <Eraser size={20} />
                </button>
             </div>
          </Panel>
        </ReactFlow>

        <Sidebar 
          node={selectedNode} 
          onClose={() => setSelectedNodeId(null)} 
          onUpdate={handleUpdateNode}
          onDelete={handleDeleteNode}
        />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ReactFlowProvider>
      <InnerApp />
    </ReactFlowProvider>
  );
}