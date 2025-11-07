/**
 * 视图模式操作 Slice
 *
 * 职责：
 * 1. 视图模式转换（Note ↔ Container）
 * 2. 展开/折叠状态管理
 * 3. 自定义尺寸保存
 */

import { BaseNode, ViewMode } from '@/types/graph/models';
import { ViewModeTransformer, toggleExpanded, saveCustomExpandedSize } from '@/utils/graph/nodeFactory';

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
    switchViewMode: (nodeId: string, targetMode: ViewMode) => {
      const state = get();
      const node = state.getNodeById(nodeId) as BaseNode;

      if (!node) {
        console.error(`Node ${nodeId} not found`);
        return;
      }

      console.log(`🔄 切换视图模式: ${nodeId} -> ${targetMode}`);

      const transformedNode = ViewModeTransformer.transform(node, targetMode);

      set({
        nodes: state.nodes.map((n: BaseNode) => (n.id === nodeId ? transformedNode : n)),
      });

      if (get().addHistorySnapshot) {
        get().addHistorySnapshot();
      }

      console.log(`✅ 视图模式已切换: ${node.viewMode} -> ${transformedNode.viewMode}`);
    },

    convertToNote: (nodeId: string) => {
      get().switchViewMode(nodeId, 'note');
    },

    convertToContainer: (nodeId: string) => {
      get().switchViewMode(nodeId, 'container');
    },

    toggleNodeExpanded: (nodeId: string) => {
      const state = get();
      const node = state.getNodeById(nodeId) as BaseNode;

      if (!node) {
        console.error(`Node ${nodeId} not found`);
        return;
      }

      console.log(`🔄 切换展开状态: ${nodeId}`);

      const toggledNode = toggleExpanded(node);

      set({
        nodes: state.nodes.map((n: BaseNode) => (n.id === nodeId ? toggledNode : n)),
      });

      console.log(`✅ 展开状态已更新: expanded=${toggledNode.expanded}`);
    },

    expandNode: (nodeId: string) => {
      const state = get();
      const node = state.getNodeById(nodeId) as BaseNode;

      if (!node) return;

      if (node.expanded) {
        console.log(`Node ${nodeId} is already expanded`);
        return;
      }

      get().toggleNodeExpanded(nodeId);
    },

    collapseNode: (nodeId: string) => {
      const state = get();
      const node = state.getNodeById(nodeId) as BaseNode;

      if (!node) return;

      if (!node.expanded) {
        console.log(`Node ${nodeId} is already collapsed`);
        return;
      }

      get().toggleNodeExpanded(nodeId);
    },

    expandAll: () => {
      const state = get();
      console.log('📖 展开所有节点');

      const nodes = state.nodes.map((node: BaseNode) => {
        if (!node.expanded) {
          return toggleExpanded(node);
        }
        return node;
      });

      set({ nodes });
    },

    collapseAll: () => {
      const state = get();
      console.log('📕 折叠所有节点');

      const nodes = state.nodes.map((node: BaseNode) => {
        if (node.expanded) {
          return toggleExpanded(node);
        }
        return node;
      });

      set({ nodes });
    },

    expandChildren: (nodeId: string) => {
      const state = get();
      const parentNode = state.getNodeById(nodeId) as BaseNode;

      if (!parentNode) return;

      const childrenIds = parentNode.childrenIds;

      console.log(`📖 展开 ${nodeId} 的所有子节点 (${childrenIds.length} 个)`);

      const nodes = state.nodes.map((node: BaseNode) => {
        if (childrenIds.includes(node.id) && !node.expanded) {
          return toggleExpanded(node);
        }
        return node;
      });

      set({ nodes });
    },

    collapseChildren: (nodeId: string) => {
      const state = get();
      const parentNode = state.getNodeById(nodeId) as BaseNode;

      if (!parentNode) return;

      const childrenIds = parentNode.childrenIds;

      console.log(`📕 折叠 ${nodeId} 的所有子节点 (${childrenIds.length} 个)`);

      const nodes = state.nodes.map((node: BaseNode) => {
        if (childrenIds.includes(node.id) && node.expanded) {
          return toggleExpanded(node);
        }
        return node;
      });

      set({ nodes });
    },

    saveNodeCustomSize: (nodeId: string, width: number, height: number) => {
      const state = get();
      const node = state.getNodeById(nodeId) as BaseNode;

      if (!node) return;

      console.log(`💾 保存自定义尺寸: ${nodeId} (${width}x${height})`);

      const withCustomSize = saveCustomExpandedSize(node, width, height);

      set({
        nodes: state.nodes.map((n: BaseNode) => (n.id === nodeId ? withCustomSize : n)),
      });
    },
  };
};
