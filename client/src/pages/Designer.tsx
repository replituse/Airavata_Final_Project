import { useCallback, useRef, useState, useEffect } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  NodeChange,
  EdgeChange,
  Connection,
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useNetworkStore, WhamoNode, WhamoEdge } from '@/lib/store';
import { ReservoirNode, SimpleNode, JunctionNode, SurgeTankNode, FlowBoundaryNode } from '@/components/NetworkNode';
import { ConnectionEdge } from '@/components/ConnectionEdge';
import { PropertiesPanel } from '@/components/PropertiesPanel';
import { Toolbar } from '@/components/Toolbar';
import { generateInpFile } from '@/lib/inp-generator';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const nodeTypes = {
  reservoir: ReservoirNode,
  node: SimpleNode,
  junction: JunctionNode,
  surgeTank: SurgeTankNode,
  flowBoundary: FlowBoundaryNode,
};

const edgeTypes = {
  connection: ConnectionEdge,
};

export default function Designer() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // We connect local ReactFlow state to our global Zustand store for properties panel sync
  const { 
    nodes, 
    edges, 
    onNodesChange: storeOnNodesChange, 
    onEdgesChange: storeOnEdgesChange,
    onConnect: storeOnConnect, 
    selectElement, 
    loadNetwork,
    clearNetwork,
    deleteElement,
    selectedElementId,
    selectedElementType
  } = useNetworkStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && 
          selectedElementId && 
          selectedElementType && 
          !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) {
        deleteElement(selectedElementId, selectedElementType);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteElement, selectedElementId, selectedElementType]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      storeOnNodesChange(changes);
    },
    [storeOnNodesChange]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      storeOnEdgesChange(changes);
    },
    [storeOnEdgesChange]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source === params.target) {
        toast({
          variant: "destructive",
          title: "Invalid Connection",
          description: "An element cannot be connected to itself.",
        });
        return;
      }
      storeOnConnect(params);
    },
    [storeOnConnect, toast]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    selectElement(node.id, 'node');
  }, [selectElement]);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    selectElement(edge.id, 'edge');
  }, [selectElement]);

  const onSelectionChange = useCallback(({ nodes, edges }: { nodes: WhamoNode[], edges: WhamoEdge[] }) => {
    if (nodes.length > 0) {
      selectElement(nodes[0].id, 'node');
    } else if (edges.length > 0) {
      selectElement(edges[0].id, 'edge');
    } else {
      selectElement(null, null);
    }
  }, [selectElement]);

  const handleSave = () => {
    const data = { nodes, edges };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    saveAs(blob, `whamo_project_${Date.now()}.json`);
    toast({ title: "Project Saved", description: "Network topology saved to JSON." });
  };

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.nodes && json.edges) {
          loadNetwork(json.nodes, json.edges);
          toast({ title: "Project Loaded", description: "Network topology restored." });
        } else {
          throw new Error("Invalid format");
        }
      } catch (err) {
        toast({ variant: "destructive", title: "Load Failed", description: "Invalid JSON file." });
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const handleGenerateInp = () => {
    try {
      generateInpFile(nodes, edges);
      toast({ title: "INP Generated", description: "WHAMO input file downloaded successfully." });
    } catch (err) {
      toast({ variant: "destructive", title: "Generation Failed", description: "Could not generate .inp file. Check connections." });
    }
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".json" 
        className="hidden" 
      />

      {/* Top Bar */}
      <Toolbar 
        onExport={handleGenerateInp} 
        onSave={handleSave} 
        onLoad={handleLoadClick} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Canvas Area */}
        <div className="flex-1 relative h-full bg-slate-50 transition-all duration-300">
          <ReactFlow
            nodes={nodes as any}
            edges={edges as any}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onSelectionChange={onSelectionChange as any}
            fitView
            className="bg-slate-50"
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#94a3b8" gap={20} size={1} />
            <Controls className="!bg-white !shadow-xl !border-border" />
          </ReactFlow>
        </div>

        {/* Properties Panel (Sidebar) */}
        {selectedElementId && (
          <div className="w-[350px] h-full border-l border-border bg-card shadow-2xl z-20 flex flex-col animate-in slide-in-from-right duration-300">
            <PropertiesPanel />
          </div>
        )}
      </div>
    </div>
  );
}
