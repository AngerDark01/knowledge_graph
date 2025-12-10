import { create } from 'zustand';
import { createNodesSlice, NodesSlice } from './nodes';
import { createEdgesSlice, EdgesSlice } from './edgesSlice';
import { createCanvasViewSlice, CanvasViewSlice } from './canvasViewSlice';
import { createHistorySlice, HistoryState } from './historySlice';
import { withPersistence } from './persistenceMiddleware';
import { Node, Group } from '@/types/graph/models';

export type GraphStore = NodesSlice & EdgesSlice & CanvasViewSlice & HistoryState & {
  initializeGraphData: (
    nodes: (Node | Group)[],
    edges: any[],
    viewport?: { x: number; y: number; zoom: number }
  ) => void;
};

export const useGraphStore = create<GraphStore>()(withPersistence((set, get, api) => ({
  ...createNodesSlice(set, get),
  ...createEdgesSlice(set, get),
  ...createCanvasViewSlice(set),
  ...createHistorySlice(set, get, api),
  initializeGraphData: (nodes: (Node | Group)[], edges: any[], viewport?: { x: number; y: number; zoom: number }) => {
    set({
      nodes,
      edges,
      ...viewport ? { position: [viewport.x, viewport.y], zoom: viewport.zoom } : {}
    });
  }
})));