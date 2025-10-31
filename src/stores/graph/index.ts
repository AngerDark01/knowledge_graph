import { create } from 'zustand';
import { createNodesSlice, NodesSlice } from './nodesSlice';
import { createEdgesSlice, EdgesSlice } from './edgesSlice';
import { createCanvasViewSlice, CanvasViewSlice } from './canvasViewSlice';

export type GraphStore = NodesSlice & EdgesSlice & CanvasViewSlice;

export const useGraphStore = create<GraphStore>()((set, get) => ({
  ...createNodesSlice(set, get),
  ...createEdgesSlice(set, get),
  ...createCanvasViewSlice(set),
}));