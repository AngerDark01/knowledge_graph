/**
 * 视图模式操作 Slice
 *
 * 职责：
 * 1. 视图模式转换（Note ↔ Container）
 * 2. 展开/折叠状态管理
 * 3. 自定义尺寸保存
 */

import { BaseNode } from '@/types/graph/unifiedNode';
import { ViewMode } from '@/types/graph/viewModes';
import { ViewModeTransformer, toggleExpanded, saveCustomExpandedSize } from '@/utils/graph/nodeFactory';
import { toBaseNode, fromBaseNode } from '@/utils/graph/nodeAdapter';
import { Node, Group } from '@/types/graph/models';

export interface ViewModeOperationsSlice {
  // 视图模式转换
  switchViewMode: (nodeId: string, targetMode: ViewMode) => void;
  convertToNote: (nodeId: string) => void;
  convertToContainer: (nodeId: string) => void;

  // 展开/折叠
  toggleNodeExpanded: (nodeId: string) => void;
  expandNode: (nodeId: string) => void;
  collapseNode: (nodeId: string) => void;

  // 批量操作
  expandAll: () => void;
  collapseAll: () => void;
  expandChildren: (nodeId: string) => void;
  collapseChildren: (nodeId: string) => void;

  // 自定义尺寸
  saveNodeCustomSize: (nodeId: string, width: number, height: number) => void;
}

export const createViewModeOperationsSlice = (set: any, get: any): ViewModeOperationsSlice => {
  return {
    /**
     * 切换视图模式
     */
    switchViewMode: (nodeId: string, targetMode: ViewMode) => {
      const state = get();
      const oldNode = state.getNodeById(nodeId);

      if (!oldNode) {
        console.error(`Node ${nodeId} not found`);
        return;
      }

      console.log(`🔄 切换视图模式: ${nodeId} -> ${targetMode}`);

      // 转换为 BaseNode
      const baseNode = toBaseNode(oldNode);

      // 执行视图模式转换
      const transformedNode = ViewModeTransformer.transform(baseNode, targetMode);

      // 转换回原始类型
      const newNode = fromBaseNode(transformedNode);

      // 更新状态
      set({
        nodes: state.nodes.map((n: Node | Group) => (n.id === nodeId ? newNode : n)),
      });

      // 添加历史记录
      if (get().addHistorySnapshot) {
        get().addHistorySnapshot();
      }

      console.log(`✅ 视图模式已切换: ${oldNode.type} -> ${newNode.type}`);
    },

    /**
     * 转换为笔记模式
     */
    convertToNote: (nodeId: string) => {
      get().switchViewMode(nodeId, 'note');
    },

    /**
     * 转换为容器模式
     */
    convertToContainer: (nodeId: string) => {
      get().switchViewMode(nodeId, 'container');
    },

    /**
     * 切换展开/折叠状态
     */
    toggleNodeExpanded: (nodeId: string) => {
      const state = get();
      const node = state.getNodeById(nodeId);

      if (!node) {
        console.error(`Node ${nodeId} not found`);
        return;
      }

      console.log(`🔄 切换展开状态: ${nodeId}`);

      // 转换为 BaseNode
      const baseNode = toBaseNode(node);

      // 切换展开状态
      const toggledNode = toggleExpanded(baseNode);

      // 转换回原始类型
      const newNode = fromBaseNode(toggledNode);

      // 更新状态
      set({
        nodes: state.nodes.map((n: Node | Group) => (n.id === nodeId ? newNode : n)),
      });

      console.log(`✅ 展开状态已更新: expanded=${toggledNode.expanded}`);
    },

    /**
     * 展开节点
     */
    expandNode: (nodeId: string) => {
      const state = get();
      const node = state.getNodeById(nodeId);

      if (!node) return;

      const baseNode = toBaseNode(node);

      if (baseNode.expanded) {
        console.log(`Node ${nodeId} is already expanded`);
        return;
      }

      get().toggleNodeExpanded(nodeId);
    },

    /**
     * 折叠节点
     */
    collapseNode: (nodeId: string) => {
      const state = get();
      const node = state.getNodeById(nodeId);

      if (!node) return;

      const baseNode = toBaseNode(node);

      if (!baseNode.expanded) {
        console.log(`Node ${nodeId} is already collapsed`);
        return;
      }

      get().toggleNodeExpanded(nodeId);
    },

    /**
     * 展开所有节点
     */
    expandAll: () => {
      const state = get();
      console.log('📖 展开所有节点');

      const nodes = state.nodes.map((node: Node | Group) => {
        const baseNode = toBaseNode(node);
        if (!baseNode.expanded) {
          const expanded = toggleExpanded(baseNode);
          return fromBaseNode(expanded);
        }
        return node;
      });

      set({ nodes });
    },

    /**
     * 折叠所有节点
     */
    collapseAll: () => {
      const state = get();
      console.log('📕 折叠所有节点');

      const nodes = state.nodes.map((node: Node | Group) => {
        const baseNode = toBaseNode(node);
        if (baseNode.expanded) {
          const collapsed = toggleExpanded(baseNode);
          return fromBaseNode(collapsed);
        }
        return node;
      });

      set({ nodes });
    },

    /**
     * 展开所有子节点
     */
    expandChildren: (nodeId: string) => {
      const state = get();
      const parentNode = state.getNodeById(nodeId);

      if (!parentNode) return;

      const baseParent = toBaseNode(parentNode);
      const childrenIds = baseParent.childrenIds;

      console.log(`📖 展开 ${nodeId} 的所有子节点 (${childrenIds.length} 个)`);

      const nodes = state.nodes.map((node: Node | Group) => {
        if (childrenIds.includes(node.id)) {
          const baseNode = toBaseNode(node);
          if (!baseNode.expanded) {
            const expanded = toggleExpanded(baseNode);
            return fromBaseNode(expanded);
          }
        }
        return node;
      });

      set({ nodes });
    },

    /**
     * 折叠所有子节点
     */
    collapseChildren: (nodeId: string) => {
      const state = get();
      const parentNode = state.getNodeById(nodeId);

      if (!parentNode) return;

      const baseParent = toBaseNode(parentNode);
      const childrenIds = baseParent.childrenIds;

      console.log(`📕 折叠 ${nodeId} 的所有子节点 (${childrenIds.length} 个)`);

      const nodes = state.nodes.map((node: Node | Group) => {
        if (childrenIds.includes(node.id)) {
          const baseNode = toBaseNode(node);
          if (baseNode.expanded) {
            const collapsed = toggleExpanded(baseNode);
            return fromBaseNode(collapsed);
          }
        }
        return node;
      });

      set({ nodes });
    },

    /**
     * 保存自定义展开尺寸
     */
    saveNodeCustomSize: (nodeId: string, width: number, height: number) => {
      const state = get();
      const node = state.getNodeById(nodeId);

      if (!node) return;

      console.log(`💾 保存自定义尺寸: ${nodeId} (${width}x${height})`);

      const baseNode = toBaseNode(node);
      const withCustomSize = saveCustomExpandedSize(baseNode, width, height);
      const newNode = fromBaseNode(withCustomSize);

      set({
        nodes: state.nodes.map((n: Node | Group) => (n.id === nodeId ? newNode : n)),
      });
    },
  };
};
