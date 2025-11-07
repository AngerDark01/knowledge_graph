/**
 * 基础节点操作 Slice
 *
 * 职责：
 * 1. 节点的基础 CRUD 操作
 * 2. 节点选择状态管理
 * 3. 节点查询
 */

import { BaseNode } from '@/types/graph/models';
import { NodeOperationsSlice, safePosition, safeNumber } from './types';

export const createNodeOperationsSlice = (set: any, get: any): NodeOperationsSlice => {
  return {
    nodes: [],
    selectedNodeId: null,
    selectedEdgeId: null,

    addNode: (node: BaseNode) => {
      set((state: any) => {
        console.log('➕ 添加节点:', node.id);
        const safeNode = {
          ...node,
          position: safePosition(node.position),
          width: safeNumber(node.width, 350),
          height: safeNumber(node.height, 280),
        };
        return { nodes: [...state.nodes, safeNode] };
      });

      if (get().addHistorySnapshot) {
        get().addHistorySnapshot();
      }
    },

    updateNode: (id: string, updates: Partial<BaseNode>) => {
      set((state: any) => {
        console.log(`🔧 更新节点 ${id}:`, updates);

        let validationError = undefined;
        if (updates.title !== undefined && updates.title.trim() === '') {
          validationError = 'Title cannot be empty';
        }

        return {
          nodes: state.nodes.map((node: BaseNode) => {
            if (node.id === id) {
              const updatedNode = {
                ...node,
                ...updates,
                position: updates.position !== undefined
                  ? safePosition(updates.position)
                  : safePosition(node.position),
                width: safeNumber(updates.width ?? node.width, 350),
                height: safeNumber(updates.height ?? node.height, 280),
                validationError,
                updatedAt: new Date(),
              };

              console.log(`  ✅ 节点 ${id} 更新后:`, {
                position: updatedNode.position,
                width: updatedNode.width,
                height: updatedNode.height,
              });

              return updatedNode;
            }
            return node;
          }),
        };
      });

      if (get().addHistorySnapshot) {
        get().addHistorySnapshot();
      }
    },

    deleteNode: (id: string) => {
      const state = get();
      const node = state.getNodeById(id) as BaseNode;

      if (!node) {
        console.error(`Node ${id} not found`);
        return;
      }

      console.log(`🗑️ 删除节点: ${id}`);

      // 如果节点有子节点，先解除所有子节点关系
      if (node.childrenIds.length > 0 && get().orphanAllChildren) {
        get().orphanAllChildren(id);
      }

      // 如果节点有父节点，从父节点的子节点列表中移除
      if (node.parentId && get().removeChildFromParent) {
        get().removeChildFromParent(id);
      }

      // 删除与该节点相关的所有边
      const edgesToDelete = state.edges.filter(
        (edge: any) => edge.source === id || edge.target === id
      );

      edgesToDelete.forEach((edge: any) => {
        if (get().deleteEdge) {
          get().deleteEdge(edge.id);
        }
      });

      // 删除节点本身
      set((state: any) => ({
        nodes: state.nodes.filter((n: BaseNode) => n.id !== id),
        selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
      }));

      if (get().addHistorySnapshot) {
        get().addHistorySnapshot();
      }

      console.log(`✅ 节点已删除: ${id}`);
    },

    getNodes: () => {
      return get().nodes;
    },

    getNodeById: (id: string) => {
      return get().nodes.find((node: BaseNode) => node.id === id);
    },

    setSelectedNodeId: (id: string | null) => {
      set({ selectedNodeId: id });
    },

    setSelectedEdgeId: (id: string | null) => {
      set({ selectedEdgeId: id });
    },
  };
};
