/**
 * 层级关系操作 Slice
 *
 * 职责：
 * 1. 父子节点关系管理
 * 2. 子节点添加/移除
 * 3. 层级遍历和查询
 * 4. 位置约束
 */

import { BaseNode } from '@/types/graph/unifiedNode';
import { toBaseNode, fromBaseNode } from '@/utils/graph/nodeAdapter';
import { Node, Group, BlockEnum } from '@/types/graph/models';
import { constrainNodeToGroupBoundary, GROUP_PADDING } from './types';

export interface HierarchyOperationsSlice {
  // 父子关系管理
  addChildToParent: (childId: string, parentId: string) => void;
  removeChildFromParent: (childId: string) => void;
  moveNodeToParent: (nodeId: string, newParentId: string | null) => void;

  // 查询
  getChildNodes: (parentId: string) => (Node | Group)[];
  getParentNode: (childId: string) => (Node | Group) | undefined;
  getAncestors: (nodeId: string) => (Node | Group)[];
  getDescendants: (nodeId: string) => (Node | Group)[];
  getRootNodes: () => (Node | Group)[];

  // 层级验证
  canBeParent: (nodeId: string, childId: string) => boolean;
  isAncestor: (ancestorId: string, descendantId: string) => boolean;

  // 批量操作
  orphanAllChildren: (parentId: string) => void;
  reparentChildren: (oldParentId: string, newParentId: string) => void;
}

export const createHierarchyOperationsSlice = (set: any, get: any): HierarchyOperationsSlice => {
  return {
    /**
     * 添加子节点到父节点
     */
    addChildToParent: (childId: string, parentId: string) => {
      const state = get();
      const childNode = state.getNodeById(childId);
      const parentNode = state.getNodeById(parentId);

      if (!childNode || !parentNode) {
        console.error('Child or parent node not found');
        return;
      }

      // 检查是否会形成循环引用
      if (!get().canBeParent(parentId, childId)) {
        console.error('Cannot add child: would create circular reference');
        return;
      }

      console.log(`👨‍👧 添加子节点: ${childId} -> ${parentId}`);

      const baseChild = toBaseNode(childNode);
      const baseParent = toBaseNode(parentNode);

      // 如果子节点已有父节点，先移除
      if (baseChild.parentId) {
        get().removeChildFromParent(childId);
      }

      // 更新子节点
      const updatedChild: BaseNode = {
        ...baseChild,
        parentId: parentId,
        updatedAt: new Date(),
      };

      // 约束子节点位置到父节点边界内
      const constrainedChild = constrainChildPosition(updatedChild, baseParent);

      // 更新父节点的 childrenIds
      const updatedParent: BaseNode = {
        ...baseParent,
        childrenIds: [...new Set([...baseParent.childrenIds, childId])],
        updatedAt: new Date(),
      };

      // 转换回原始类型并更新状态
      set({
        nodes: state.nodes.map((n: Node | Group) => {
          if (n.id === childId) return fromBaseNode(constrainedChild);
          if (n.id === parentId) return fromBaseNode(updatedParent);
          return n;
        }),
      });

      // 添加历史记录
      if (get().addHistorySnapshot) {
        get().addHistorySnapshot();
      }

      console.log(`✅ 子节点已添加`);
    },

    /**
     * 从父节点移除子节点
     */
    removeChildFromParent: (childId: string) => {
      const state = get();
      const childNode = state.getNodeById(childId);

      if (!childNode) return;

      const baseChild = toBaseNode(childNode);

      if (!baseChild.parentId) {
        console.log(`Node ${childId} has no parent`);
        return;
      }

      console.log(`👨‍👧 移除子节点: ${childId} <- ${baseChild.parentId}`);

      const parentNode = state.getNodeById(baseChild.parentId);
      if (!parentNode) return;

      const baseParent = toBaseNode(parentNode);

      // 更新子节点
      const updatedChild: BaseNode = {
        ...baseChild,
        parentId: undefined,
        updatedAt: new Date(),
      };

      // 更新父节点的 childrenIds
      const updatedParent: BaseNode = {
        ...baseParent,
        childrenIds: baseParent.childrenIds.filter((id) => id !== childId),
        updatedAt: new Date(),
      };

      // 转换回原始类型并更新状态
      set({
        nodes: state.nodes.map((n: Node | Group) => {
          if (n.id === childId) return fromBaseNode(updatedChild);
          if (n.id === baseParent.id) return fromBaseNode(updatedParent);
          return n;
        }),
      });

      // 添加历史记录
      if (get().addHistorySnapshot) {
        get().addHistorySnapshot();
      }

      console.log(`✅ 子节点已移除`);
    },

    /**
     * 移动节点到新父节点
     */
    moveNodeToParent: (nodeId: string, newParentId: string | null) => {
      if (newParentId) {
        get().addChildToParent(nodeId, newParentId);
      } else {
        get().removeChildFromParent(nodeId);
      }
    },

    /**
     * 获取所有子节点
     */
    getChildNodes: (parentId: string) => {
      const state = get();
      const parentNode = state.getNodeById(parentId);

      if (!parentNode) return [];

      const baseParent = toBaseNode(parentNode);

      return state.nodes.filter((n: Node | Group) => baseParent.childrenIds.includes(n.id));
    },

    /**
     * 获取父节点
     */
    getParentNode: (childId: string) => {
      const state = get();
      const childNode = state.getNodeById(childId);

      if (!childNode) return undefined;

      const baseChild = toBaseNode(childNode);

      if (!baseChild.parentId) return undefined;

      return state.getNodeById(baseChild.parentId);
    },

    /**
     * 获取所有祖先节点（从直接父节点到根节点）
     */
    getAncestors: (nodeId: string) => {
      const ancestors: (Node | Group)[] = [];
      let currentId: string | undefined = nodeId;

      while (currentId) {
        const parent = get().getParentNode(currentId);
        if (!parent) break;

        ancestors.push(parent);
        currentId = parent.id;
      }

      return ancestors;
    },

    /**
     * 获取所有后代节点（递归获取所有子孙节点）
     */
    getDescendants: (nodeId: string) => {
      const descendants: (Node | Group)[] = [];
      const visited = new Set<string>();

      const collectDescendants = (id: string) => {
        if (visited.has(id)) return; // 防止循环引用
        visited.add(id);

        const children = get().getChildNodes(id);
        children.forEach((child: Node | Group) => {
          descendants.push(child);
          collectDescendants(child.id);
        });
      };

      collectDescendants(nodeId);

      return descendants;
    },

    /**
     * 获取所有根节点（没有父节点的节点）
     */
    getRootNodes: () => {
      const state = get();
      return state.nodes.filter((n: Node | Group) => {
        const baseNode = toBaseNode(n);
        return !baseNode.parentId;
      });
    },

    /**
     * 检查节点是否可以作为另一个节点的父节点
     */
    canBeParent: (parentId: string, childId: string) => {
      if (parentId === childId) {
        return false; // 不能自己是自己的父节点
      }

      // 检查是否会形成循环引用
      const ancestors = get().getAncestors(parentId);
      return !ancestors.some((ancestor: Node | Group) => ancestor.id === childId);
    },

    /**
     * 检查节点是否为另一个节点的祖先
     */
    isAncestor: (ancestorId: string, descendantId: string) => {
      const ancestors = get().getAncestors(descendantId);
      return ancestors.some((ancestor: Node | Group) => ancestor.id === ancestorId);
    },

    /**
     * 移除所有子节点的父子关系（使子节点成为孤儿）
     */
    orphanAllChildren: (parentId: string) => {
      const children = get().getChildNodes(parentId);
      console.log(`🚫 移除 ${parentId} 的所有子节点关系 (${children.length} 个)`);

      children.forEach((child: Node | Group) => {
        get().removeChildFromParent(child.id);
      });
    },

    /**
     * 将所有子节点移动到新父节点
     */
    reparentChildren: (oldParentId: string, newParentId: string) => {
      const children = get().getChildNodes(oldParentId);
      console.log(`🔄 重新分配 ${oldParentId} 的子节点到 ${newParentId} (${children.length} 个)`);

      children.forEach((child: Node | Group) => {
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

  // 计算允许的最小和最大位置
  const minX = parent.position.x + GROUP_PADDING.left;
  const minY = parent.position.y + GROUP_PADDING.top;
  const maxX = parent.position.x + parentWidth - GROUP_PADDING.right - childWidth;
  const maxY = parent.position.y + parentHeight - GROUP_PADDING.bottom - childHeight;

  // 约束节点位置
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
