import { StateCreator } from 'zustand';
import { GraphStore } from '.';
import { Node, Group } from '../../types/graph/models';
import { Edge } from '../../types/graph/models';

export interface HistoryState {
  history: Array<{ nodes: (Node | Group)[]; edges: Edge[] }>;
  historyIndex: number;
  maxSize: number;
  addHistorySnapshot: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
}

export const createHistorySlice: StateCreator<
  GraphStore,
  [],
  [],
  HistoryState
> = (set, get) => ({
  history: [],
  historyIndex: -1,
  maxSize: 50, // 最多保存50个历史记录

  addHistorySnapshot: () => {
    const { nodes, edges } = get();
    const newHistory = [...get().history];
    // 截断当前索引之后的历史记录
    newHistory.splice(get().historyIndex + 1);
    // 添加新的快照
    newHistory.push({ nodes: [...nodes], edges: [...edges] });
    // 如果历史记录超过最大大小，删除最早的记录
    if (newHistory.length > get().maxSize) {
      newHistory.shift();
    }
    set({
      history: newHistory,
      historyIndex: Math.min(get().historyIndex + 1, get().maxSize - 1),
    });
  },

  canUndo: () => get().historyIndex > 0,

  canRedo: () => get().historyIndex < get().history.length - 1,

  undo: () => {
    if (get().canUndo()) {
      const newIndex = get().historyIndex - 1;
      const snapshot = get().history[newIndex];
      set({
        nodes: [...snapshot.nodes],
        edges: [...snapshot.edges],
        historyIndex: newIndex,
      });
    }
  },

  redo: () => {
    if (get().canRedo()) {
      const newIndex = get().historyIndex + 1;
      const snapshot = get().history[newIndex];
      set({
        nodes: [...snapshot.nodes],
        edges: [...snapshot.edges],
        historyIndex: newIndex,
      });
    }
  },

  clearHistory: () => set({ history: [], historyIndex: -1 }),
});
