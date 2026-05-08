import { Edge } from '@/types/graph/models';
import {
  addEdgeToVisibility,
  createAllEdgeVisibility,
  createCustomEdgeVisibility,
  createNoEdgeVisibility,
  removeEdgeIdsFromVisibility,
  toggleEdgeInVisibility,
  type EdgeVisibility,
} from '@/domain/ontology';

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
  edgeVisibility: EdgeVisibility;
  setCustomEdgeVisibility: (ids: string[]) => void;
  showAllEdges: () => void;
  hideAllEdges: () => void;
  toggleEdgeVisibility: (id: string) => void;
}

type EdgesStoreState = EdgesSlice & {
  addHistorySnapshot?: () => void;
};

type EdgesStorePatch = Partial<EdgesStoreState>;
type EdgesStoreSet = (
  patch: EdgesStorePatch | EdgesStoreState | ((state: EdgesStoreState) => EdgesStorePatch | EdgesStoreState)
) => void;
type EdgesStoreGet = () => EdgesStoreState;

export const createEdgesSlice = (set: EdgesStoreSet, get: EdgesStoreGet): EdgesSlice => ({
  edges: [],
  edgeVisibility: createAllEdgeVisibility(),
  addEdge: (edge) => {
    const state = get();
    const nextEdges = [...state.edges, edge];
    const nextVisibility = addEdgeToVisibility(state.edgeVisibility, edge.id);
    const newState = {
      edges: nextEdges,
      edgeVisibility: nextVisibility
    };
    set(newState);
    // 添加历史记录快照
    get().addHistorySnapshot?.();
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
    get().addHistorySnapshot?.();
    return newState;
  },
  deleteEdge: (id) => {
    const state = get();
    const nextEdges = state.edges.filter((edge: Edge) => edge.id !== id);
    const nextVisibility = removeEdgeIdsFromVisibility(state.edgeVisibility, [id]);
    const newState = {
      edges: nextEdges,
      edgeVisibility: nextVisibility
    };
    set(newState);
    // 添加历史记录快照
    get().addHistorySnapshot?.();
    return newState;
  },
  getEdges: () => get().edges,
  getEdgeById: (id) => get().edges.find((edge: Edge) => edge.id === id),
  getEdgesByGroupId: (groupId: string) => {
    return get().edges.filter((edge: Edge) =>
      edge.data?.sourceGroupId === groupId || edge.data?.targetGroupId === groupId
    );
  },
  getCrossGroupEdges: () => {
    return get().edges.filter((edge: Edge) =>
      edge.data?.isCrossGroup === true
    );
  },
  getInternalGroupEdges: (groupId: string) => {
    return get().edges.filter((edge: Edge) =>
      edge.data?.isCrossGroup === false &&
      (edge.data?.sourceGroupId === groupId || edge.data?.targetGroupId === groupId)
    );
  },
  filterEdges: (filterFn: (edge: Edge) => boolean) => {
    return get().edges.filter(filterFn);
  },
  setCustomEdgeVisibility: (ids: string[]) => {
    const state = get();
    const nextVisibility = createCustomEdgeVisibility(ids, state.edges);
    set({
      edgeVisibility: nextVisibility
    });
  },
  showAllEdges: () => {
    const nextVisibility = createAllEdgeVisibility();
    const newState = {
      edgeVisibility: nextVisibility
    };
    set(newState);
    // 添加历史记录快照
    get().addHistorySnapshot?.();
    return newState;
  },
  hideAllEdges: () => {
    const nextVisibility = createNoEdgeVisibility();
    const newState = {
      edgeVisibility: nextVisibility
    };
    set(newState);
    // 添加历史记录快照
    get().addHistorySnapshot?.();
    return newState;
  },
  toggleEdgeVisibility: (id: string) => {
    const state = get();
    const nextVisibility = toggleEdgeInVisibility(id, state.edges, state.edgeVisibility);
    const newState = {
      edgeVisibility: nextVisibility
    };
    set(newState);
    // 添加历史记录快照
    get().addHistorySnapshot?.();
    return newState;
  },
});

export type { EdgesSlice };
