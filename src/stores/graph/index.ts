import { create } from 'zustand';
import { createNodesSlice, NodesSlice } from './nodes';
import { createEdgesSlice, EdgesSlice } from './edgesSlice';
import { createCanvasViewSlice, CanvasViewSlice } from './canvasViewSlice';
import { createHistorySlice, HistoryState } from './historySlice';
import { persistenceMiddleware } from './persistenceMiddleware';

export type GraphStore = NodesSlice & EdgesSlice & CanvasViewSlice & HistoryState;

// 是否启用自动持久化
const ENABLE_AUTO_PERSISTENCE = process.env.NEXT_PUBLIC_USE_NEW_LAYOUT !== 'false';

export const useGraphStore = create<GraphStore>()(
  ENABLE_AUTO_PERSISTENCE
    ? persistenceMiddleware(
        (set, get, api) => ({
          ...createNodesSlice(set, get),
          ...createEdgesSlice(set, get),
          ...createCanvasViewSlice(set),
          ...createHistorySlice(set, get, api),
        }),
        { debounceMs: 500 }
      )
    : (set, get, api) => ({
        ...createNodesSlice(set, get),
        ...createEdgesSlice(set, get),
        ...createCanvasViewSlice(set),
        ...createHistorySlice(set, get, api),
      })
);