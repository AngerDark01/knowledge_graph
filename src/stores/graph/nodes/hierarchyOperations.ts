/**
 * 层级关系操作 Slice
 *
 * 职责：
 * 1. 父子节点关系管理
 * 2. 子节点添加/移除
 * 3. 层级遍历和查询
 * 4. 位置约束
 */

import { BaseNode } from '@/types/graph/models';
import { constrainNodeToGroupBoundary, GROUP_PADDING } from './types';

export interface HierarchyOperationsSlice {
  // 父子关系管理
  addChildToParent: (childId: string, parentId: string) => void;
  removeChildFromParent: (childId: string) => void;
  moveNodeToParent: (nodeId: string, newParentId: string | null) => void;

  // 查询
  getChildNodes: (parentId: string) => BaseNode[];
  getParentNode: (childId: string) => BaseNode | undefined;
  getAncestors: (nodeId: string) => BaseNode[];
  getDescendants: (nodeId: string) => BaseNode[];
  getRootNodes: () => BaseNode[];

  // 层级验证
  canBeParent: (nodeId: string, childId: string) => boolean;
  isAncestor: (ancestorId: string, descendantId: string) => boolean;

  // 批量操作
  orphanAllChildren: (parentId: string) => void;
  reparentChildren: (oldParentId: string, newParentId: string) => void;
}

export const createHierarchyOperationsSlice = (set: any, get: any): HierarchyOperationsSlice => {
  return {
    addChildToParent: (childId: string, parentId: string) => {
      const state = get();
      const childNode = state.getNodeById(childId) as BaseNode;
      const parentNode = state.getNodeById(parentId) as BaseNode;

      if (!childNode || !parentNode) {
        console.error('Child or parent node not found');
        return;
      }

      if (!get().canBeParent(parentId, childId)) {
        console.error('Cannot add child: would create circular reference');
        return;
      }

      console.log(`👨‍👧 添加子节点: ${childId} -> ${parentId}`);

      if (childNode.parentId) {
        get().removeChildFromParent(childId);
      }

      const updatedChild: BaseNode = {
        ...childNode,
        parentId: parentId,
        updatedAt: new Date(),
      };

      const constrainedChild = constrainChildPosition(updatedChild, parentNode);

      const updatedParent: BaseNode = {
        ...parentNode,
        childrenIds: [...new Set([...parentNode.childrenIds, childId])],
        updatedAt: new Date(),
      };

      set({
        nodes: state.nodes.map((n: BaseNode) => {
          if (n.id === childId) return constrainedChild;
          if (n.id === parentId) return updatedParent;
          return n;
        }),
      });

      if (get().addHistorySnapshot) {
        get().addHistorySnapshot();
      }

      console.log(`✅ 子节点已添加`);
    },

    removeChildFromParent: (childId: string) => {
      const state = get();
      const childNode = state.getNodeById(childId) as BaseNode;

      if (!childNode || !childNode.parentId) {
        console.log(`Node ${childId} has no parent`);
        return;
      }

      console.log(`👨‍👧 移除子节点: ${childId} <- ${childNode.parentId}`);

      const parentNode = state.getNodeById(childNode.parentId) as BaseNode;
      if (!parentNode) return;

      const updatedChild: BaseNode = {
        ...childNode,
        parentId: undefined,
        updatedAt: new Date(),
      };

      const updatedParent: BaseNode = {
        ...parentNode,
        childrenIds: parentNode.childrenIds.filter((id) => id !== childId),
        updatedAt: new Date(),
      };

      set({
        nodes: state.nodes.map((n: BaseNode) => {
          if (n.id === childId) return updatedChild;
          if (n.id === parentNode.id) return updatedParent;
          return n;
        }),
      });

      if (get().addHistorySnapshot) {
        get().addHistorySnapshot();
      }

      console.log(`✅ 子节点已移除`);
    },

    moveNodeToParent: (nodeId: string, newParentId: string | null) => {
      if (newParentId) {
        get().addChildToParent(nodeId, newParentId);
      } else {
        get().removeChildFromParent(nodeId);
      }
    },

    getChildNodes: (parentId: string) => {
      const state = get();
      const parentNode = state.getNodeById(parentId) as BaseNode;

      if (!parentNode) return [];

      return state.nodes.filter((n: BaseNode) => parentNode.childrenIds.includes(n.id));
    },

    getParentNode: (childId: string) => {
      const state = get();
      const childNode = state.getNodeById(childId) as BaseNode;

      if (!childNode || !childNode.parentId) return undefined;

      return state.getNodeById(childNode.parentId) as BaseNode;
    },

    getAncestors: (nodeId: string) => {
      const ancestors: BaseNode[] = [];
      let currentId: string | undefined = nodeId;

      while (currentId) {
        const parent = get().getParentNode(currentId);
        if (!parent) break;

        ancestors.push(parent);
        currentId = parent.id;
      }

      return ancestors;
    },

    getDescendants: (nodeId: string) => {
      const descendants: BaseNode[] = [];
      const visited = new Set<string>();

      const collectDescendants = (id: string) => {
        if (visited.has(id)) return;
        visited.add(id);

        const children = get().getChildNodes(id);
        children.forEach((child: BaseNode) => {
          descendants.push(child);
          collectDescendants(child.id);
        });
      };

      collectDescendants(nodeId);

      return descendants;
    },

    getRootNodes: () => {
      const state = get();
      return state.nodes.filter((n: BaseNode) => !n.parentId);
    },

    canBeParent: (parentId: string, childId: string) => {
      if (parentId === childId) {
        return false;
      }

      const ancestors = get().getAncestors(parentId);
      return !ancestors.some((ancestor: BaseNode) => ancestor.id === childId);
    },

    isAncestor: (ancestorId: string, descendantId: string) => {
      const ancestors = get().getAncestors(descendantId);
      return ancestors.some((ancestor: BaseNode) => ancestor.id === ancestorId);
    },

    orphanAllChildren: (parentId: string) => {
      const children = get().getChildNodes(parentId);
      console.log(`🚫 移除 ${parentId} 的所有子节点关系 (${children.length} 个)`);

      children.forEach((child: BaseNode) => {
        get().removeChildFromParent(child.id);
      });
    },

    reparentChildren: (oldParentId: string, newParentId: string) => {
      const children = get().getChildNodes(oldParentId);
      console.log(`🔄 重新分配 ${oldParentId} 的子节点到 ${newParentId} (${children.length} 个)`);

      children.forEach((child: BaseNode) => {
        get().addChildToParent(child.id, newParentId);
      });
    },
  };
};

/**
 * 约束子节点位置到父节点边界内
 */
function constrainChildPosition(child: BaseNode, parent: BaseNode): BaseNode {
  const childWidth = child.width;
  const childHeight = child.height;
  const parentWidth = parent.width;
  const parentHeight = parent.height;

  const minX = parent.position.x + GROUP_PADDING.left;
  const minY = parent.position.y + GROUP_PADDING.top;
  const maxX = parent.position.x + parentWidth - GROUP_PADDING.right - childWidth;
  const maxY = parent.position.y + parentHeight - GROUP_PADDING.bottom - childHeight;

  const constrainedX = Math.max(minX, Math.min(child.position.x, maxX));
  const constrainedY = Math.max(minY, Math.min(child.position.y, maxY));

  return {
    ...child,
    position: {
      x: constrainedX,
      y: constrainedY,
    },
  };
}
