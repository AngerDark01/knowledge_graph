import { StateCreator } from 'zustand';
import { Canvas, CanvasTreeNode, DEFAULT_CANVAS } from '@/types/workspace/models';
import { nanoid } from 'nanoid';

export interface CanvasSlice {
  // 状态
  canvases: Canvas[];
  canvasTree: CanvasTreeNode[];
  currentCanvasId: string;

  // 操作
  createCanvas: (name: string, parentId?: string) => Canvas;
  deleteCanvas: (canvasId: string) => void;
  renameCanvas: (canvasId: string, newName: string) => void;
  switchCanvas: (canvasId: string) => void;
  toggleCanvasCollapse: (canvasId: string) => void;
  updateCanvasViewport: (canvasId: string, viewport: Canvas['viewportState']) => void;

  // 初始化
  initializeWorkspace: (canvases: Canvas[], tree: CanvasTreeNode[], currentId: string) => void;
}

export const createCanvasSlice: StateCreator<CanvasSlice> = (set, get) => ({
  canvases: [DEFAULT_CANVAS],
  canvasTree: [
    {
      id: DEFAULT_CANVAS.id,
      name: DEFAULT_CANVAS.name,
      isCollapsed: false,
      children: [],
    },
  ],
  currentCanvasId: DEFAULT_CANVAS.id,

  createCanvas: (name, parentId) => {
    const newCanvas: Canvas = {
      id: `canvas_${nanoid()}`,
      name,
      parentId: parentId || null,
      children: [],
      graphData: {
        nodes: [],
        edges: [],
      },
      viewportState: {
        x: 0,
        y: 0,
        zoom: 1,
      },
      isCollapsed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => {
      // 更新 canvases 列表
      const updatedCanvases = [...state.canvases, newCanvas];

      // 更新父画布的 children
      if (parentId) {
        const parentCanvas = updatedCanvases.find((c) => c.id === parentId);
        if (parentCanvas) {
          parentCanvas.children.push(newCanvas.id);
        }
      }

      // 更新画布树
      const addToTree = (nodes: CanvasTreeNode[]): CanvasTreeNode[] => {
        if (!parentId) {
          // 添加到根节点
          return [
            ...nodes,
            {
              id: newCanvas.id,
              name: newCanvas.name,
              isCollapsed: false,
              children: [],
            },
          ];
        }

        // 递归查找父节点并添加
        return nodes.map((node) => {
          if (node.id === parentId) {
            return {
              ...node,
              children: [
                ...node.children,
                {
                  id: newCanvas.id,
                  name: newCanvas.name,
                  isCollapsed: false,
                  children: [],
                },
              ],
            };
          }
          return {
            ...node,
            children: addToTree(node.children),
          };
        });
      };

      return {
        canvases: updatedCanvases,
        canvasTree: addToTree(state.canvasTree),
      };
    });

    return newCanvas;
  },

  deleteCanvas: (canvasId) => {
    set((state) => {
      // 递归获取所有需要删除的画布ID
      const getCanvasIdsToDelete = (id: string): string[] => {
        const canvas = state.canvases.find((c) => c.id === id);
        if (!canvas) return [id];
        return [id, ...canvas.children.flatMap(getCanvasIdsToDelete)];
      };

      const idsToDelete = getCanvasIdsToDelete(canvasId);

      // 过滤掉被删除的画布
      const updatedCanvases = state.canvases.filter((c) => !idsToDelete.includes(c.id));

      // 更新画布树
      const removeFromTree = (nodes: CanvasTreeNode[]): CanvasTreeNode[] => {
        return nodes
          .filter((node) => !idsToDelete.includes(node.id))
          .map((node) => ({
            ...node,
            children: removeFromTree(node.children),
          }));
      };

      const updatedTree = removeFromTree(state.canvasTree);

      // 如果删除的是当前画布，切换到第一个画布
      let newCurrentId = state.currentCanvasId;
      if (idsToDelete.includes(state.currentCanvasId)) {
        newCurrentId = updatedCanvases[0]?.id || '';
      }

      return {
        canvases: updatedCanvases,
        canvasTree: updatedTree,
        currentCanvasId: newCurrentId,
      };
    });
  },

  renameCanvas: (canvasId, newName) => {
    set((state) => {
      // 更新 canvases
      const updatedCanvases = state.canvases.map((c) =>
        c.id === canvasId ? { ...c, name: newName, updatedAt: new Date() } : c
      );

      // 更新画布树
      const renameInTree = (nodes: CanvasTreeNode[]): CanvasTreeNode[] => {
        return nodes.map((node) => {
          if (node.id === canvasId) {
            return { ...node, name: newName };
          }
          return {
            ...node,
            children: renameInTree(node.children),
          };
        });
      };

      return {
        canvases: updatedCanvases,
        canvasTree: renameInTree(state.canvasTree),
      };
    });
  },

  switchCanvas: (canvasId) => {
    set({ currentCanvasId: canvasId });
  },

  toggleCanvasCollapse: (canvasId) => {
    set((state) => {
      // 更新 canvases
      const updatedCanvases = state.canvases.map((c) =>
        c.id === canvasId ? { ...c, isCollapsed: !c.isCollapsed } : c
      );

      // 更新画布树
      const toggleInTree = (nodes: CanvasTreeNode[]): CanvasTreeNode[] => {
        return nodes.map((node) => {
          if (node.id === canvasId) {
            return { ...node, isCollapsed: !node.isCollapsed };
          }
          return {
            ...node,
            children: toggleInTree(node.children),
          };
        });
      };

      return {
        canvases: updatedCanvases,
        canvasTree: toggleInTree(state.canvasTree),
      };
    });
  },

  updateCanvasViewport: (canvasId, viewport) => {
    set((state) => ({
      canvases: state.canvases.map((c) =>
        c.id === canvasId
          ? { ...c, viewportState: viewport, updatedAt: new Date() }
          : c
      ),
    }));
  },

  initializeWorkspace: (canvases, tree, currentId) => {
    set({
      canvases,
      canvasTree: tree,
      currentCanvasId: currentId,
    });
  },
});
