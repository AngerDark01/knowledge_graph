import { create } from 'zustand';
import { Node, Group, Edge } from '@/types/graph/models';

interface EdgesSlice {
  edges: Edge[];
  addEdge: (edge: Edge) => void;
  updateEdge: (id: string, updates: Partial<Edge>) => void;
  deleteEdge: (id: string) => void;
  getEdges: () => Edge[];
  getEdgeById: (id: string) => Edge | undefined;
}

export const createEdgesSlice = (set: any, get: any): EdgesSlice => ({
  edges: [],
  addEdge: (edge) => set((state: any) => ({ 
    edges: [...state.edges, edge] 
  })),
  updateEdge: (id, updates) => set((state: any) => ({
    edges: state.edges.map((edge: Edge) => 
      edge.id === id ? { 
        ...edge, 
        ...updates,
        updatedAt: new Date()
      } : edge
    )
  })),
  deleteEdge: (id) => set((state: any) => ({
    edges: state.edges.filter((edge: Edge) => edge.id !== id)
  })),
  getEdges: () => get().edges,
  getEdgeById: (id) => get().edges.find((edge: Edge) => edge.id === id),
});