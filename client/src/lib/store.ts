import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  MarkerType,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import { NodeType, LinkType } from '@shared/schema';

// Define base data structures for our specific engineering domain
interface NodeData {
  label: string;
  type: NodeType;
  elevation?: number;
  nodeNumber?: number;
  comment?: string;
  // Specific properties
  topElevation?: number;
  bottomElevation?: number;
  diameter?: number;
  celerity?: number;
  friction?: number;
  scheduleNumber?: number;
}

interface EdgeData {
  label: string;
  type: LinkType;
  length?: number;
  diameter?: number;
  celerity?: number;
  friction?: number;
  numSegments?: number;
  cplus?: number;
  cminus?: number;
  comment?: string;
}

export type WhamoNode = Node<NodeData>;
export type WhamoEdge = Edge<EdgeData>;

interface NetworkState {
  nodes: WhamoNode[];
  edges: WhamoEdge[];
  selectedElementId: string | null;
  selectedElementType: 'node' | 'edge' | null;

  // Actions
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNodeData: (id: string, data: Partial<NodeData>) => void;
  updateEdgeData: (id: string, data: Partial<EdgeData>) => void;
  selectElement: (id: string | null, type: 'node' | 'edge' | null) => void;
  loadNetwork: (nodes: WhamoNode[], edges: WhamoEdge[]) => void;
  clearNetwork: () => void;
}

let idCounter = 1;
const getId = () => `${idCounter++}`;

export const useNetworkStore = create<NetworkState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedElementId: null,
  selectedElementType: null,

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as WhamoNode[],
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges) as WhamoEdge[],
    });
  },

  onConnect: (connection: Connection) => {
    const id = getId();
    set({
      edges: addEdge(
        {
          ...connection,
          id,
          type: 'conduit', // Default edge type
          style: { stroke: '#3b82f6', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
          data: { 
            label: `C-${id}`, 
            type: 'conduit', 
            length: 1000, 
            diameter: 0.5, 
            celerity: 1000, 
            friction: 0.02, 
            numSegments: 1 
          }
        },
        get().edges
      ),
    });
  },

  addNode: (type, position) => {
    const id = getId();
    let initialData: NodeData = { label: '', type };

    // Common node number logic for all physical nodes
    const nodeTypesWithNumbers: NodeType[] = ['reservoir', 'node', 'junction', 'surgeTank', 'flowBoundary'];
    let nodeNumber = parseInt(id);

    switch (type) {
      case 'reservoir':
        initialData = { ...initialData, label: 'HW', nodeNumber, elevation: 100 };
        break;
      case 'node':
        initialData = { ...initialData, label: `Node ${nodeNumber}`, nodeNumber, elevation: 50 };
        break;
      case 'junction':
        initialData = { ...initialData, label: `Node ${nodeNumber}`, nodeNumber, elevation: 50 };
        break;
      case 'surgeTank':
        initialData = { ...initialData, label: 'ST', nodeNumber, topElevation: 120, bottomElevation: 80, diameter: 5, celerity: 1000, friction: 0.01 };
        break;
      case 'flowBoundary':
        initialData = { ...initialData, label: `FB${id}`, nodeNumber, scheduleNumber: 1 };
        break;
    }

    const newNode: WhamoNode = {
      id,
      type,
      position,
      data: initialData,
    };

    set({ nodes: [...get().nodes, newNode] });
  },

  updateNodeData: (id, data) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
    });
  },

  updateEdgeData: (id, data) => {
    set({
      edges: get().edges.map((edge) => {
        if (edge.id === id) {
          const newData = { ...edge.data, ...data };
          let style = edge.style;
          let markerEnd = edge.markerEnd;

          if (data.type === 'conduit') {
            style = { stroke: '#3b82f6', strokeWidth: 2 };
            markerEnd = { type: MarkerType.ArrowClosed, color: '#3b82f6' };
          } else if (data.type === 'dummy') {
            style = { stroke: '#94a3b8', strokeWidth: 2, strokeDasharray: '5,5' };
            markerEnd = { type: MarkerType.ArrowClosed, color: '#94a3b8' };
          }

          return { 
            ...edge, 
            data: newData,
            style,
            markerEnd: markerEnd as any
          };
        }
        return edge;
      }),
    });
  },

  selectElement: (id, type) => {
    set({ selectedElementId: id, selectedElementType: type });
  },

  loadNetwork: (nodes, edges) => {
    // Reset ID counter based on max ID to prevent collisions
    const maxId = Math.max(
      ...nodes.map(n => parseInt(n.id) || 0),
      ...edges.map(e => parseInt(e.id) || 0),
      0
    );
    idCounter = maxId + 1;
    set({ nodes, edges, selectedElementId: null, selectedElementType: null });
  },

  clearNetwork: () => {
    set({ nodes: [], edges: [], selectedElementId: null, selectedElementType: null });
    idCounter = 1;
  },
}));
