import { create } from 'zustand';
import { Node, Group, Edge } from '@/types/graph/models';

interface EdgesSlice {
  edges: Edge[];
  addEdge: (edge: Edge) => void;
  updateEdge: (id: string, updates: Partial<Edge>) => void;
  deleteEdge: (id: string) => void;
  getEdges: () => Edge[];
  getEdgeById: (id: string) => Edge | undefined;
  getEdgesByGroupId: (groupId: string) => Edge[];
  getCrossGroupEdges: () => Edge[];
  getInternalGroupEdges: (groupId: string) => Edge[];
  filterEdges: (filterFn: (edge: Edge) => boolean) => Edge[];
  // 用于边的可见性控制
  visibleEdgeIds: string[];
  setVisibleEdgeIds: (ids: string[]) => void;
  showAllEdges: () => void;
  hideAllEdges: () => void;
  toggleEdgeVisibility: (id: string) => void;
}

export const createEdgesSlice = (set: any, get: any): EdgesSlice => ({
  edges: [],
  visibleEdgeIds: [],
  addEdge: (edge) => {
    const state = get();
    const newState = {
      edges: [...state.edges, edge],
      visibleEdgeIds: [...state.visibleEdgeIds, edge.id] // 新增的边默认可见
    };
    set(newState);
    // 添加历史记录快照
    if (get().addHistorySnapshot) {
      get().addHistorySnapshot();
    }
    return newState;
  },
  updateEdge: (id, updates) => {
    const state = get();
    const newState = {
      edges: state.edges.map((edge: Edge) => 
        edge.id === id ? { 
          ...edge, 
          ...updates,
          updatedAt: new Date()
        } : edge
      )
    };
    set(newState);
    // 添加历史记录快照
    if (get().addHistorySnapshot) {
      get().addHistorySnapshot();
    }
    return newState;
  },
  deleteEdge: (id) => {
    const state = get();
    const newState = {
      edges: state.edges.filter((edge: Edge) => edge.id !== id),
      visibleEdgeIds: state.visibleEdgeIds.filter((edgeId: string) => edgeId !== id)
    };
    set(newState);
    // 添加历史记录快照
    if (get().addHistorySnapshot) {
      get().addHistorySnapshot();
    }
    return newState;
  },
  getEdges: () => get().edges,
  getEdgeById: (id) => get().edges.find((edge: Edge) => edge.id === id),
  getEdgesByGroupId: (groupId: string) => {
    return get().edges.filter(edge => 
      edge.data?.sourceGroupId === groupId || edge.data?.targetGroupId === groupId
    );
  },
  getCrossGroupEdges: () => {
    return get().edges.filter(edge => 
      edge.data?.isCrossGroup === true
    );
  },
  getInternalGroupEdges: (groupId: string) => {
    return get().edges.filter(edge => 
      edge.data?.isCrossGroup === false && 
      (edge.data?.sourceGroupId === groupId || edge.data?.targetGroupId === groupId)
    );
  },
  filterEdges: (filterFn: (edge: Edge) => boolean) => {
    return get().edges.filter(filterFn);
  },
  setVisibleEdgeIds: (ids: string[]) => set({ visibleEdgeIds: ids }),
  showAllEdges: () => {
    const state = get();
    const newState = { visibleEdgeIds: state.edges.map((edge: Edge) => edge.id) };
    set(newState);
    // 添加历史记录快照
    if (get().addHistorySnapshot) {
      get().addHistorySnapshot();
    }
    return newState;
  },
  hideAllEdges: () => {
    const newState = { visibleEdgeIds: [] };
    set(newState);
    // 添加历史记录快照
    if (get().addHistorySnapshot) {
      get().addHistorySnapshot();
    }
    return newState;
  },
  toggleEdgeVisibility: (id: string) => {
    const state = get();
    const newState = {
      visibleEdgeIds: state.visibleEdgeIds.includes(id)
        ? state.visibleEdgeIds.filter((edgeId: string) => edgeId !== id)
        : [...state.visibleEdgeIds, id]
    };
    set(newState);
    // 添加历史记录快照
    if (get().addHistorySnapshot) {
      get().addHistorySnapshot();
    }
    return newState;
  },
});

export type { EdgesSlice };