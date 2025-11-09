import { create } from 'zustand';
import { createNodesSlice, NodesSlice } from './nodes';
import { createEdgesSlice, EdgesSlice } from './edgesSlice';
import { createCanvasViewSlice, CanvasViewSlice } from './canvasViewSlice';
import { createHistorySlice, HistoryState } from './historySlice';

export type GraphStore = NodesSlice & EdgesSlice & CanvasViewSlice & HistoryState;

export const useGraphStore = create<GraphStore>()((set, get, api) => ({
  ...createNodesSlice(set, get),
  ...createEdgesSlice(set, get),
  ...createCanvasViewSlice(set),
  ...createHistorySlice(set, get, api),
}));