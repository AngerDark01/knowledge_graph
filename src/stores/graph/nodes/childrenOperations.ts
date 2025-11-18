import { Node, Group, BlockEnum } from '@/types/graph/models';
import { CONTAINER_PADDING, GRID_LAYOUT } from '@/config/layout';
import { safePosition, safeNumber } from './types';

/**
 * 子节点操作Slice接口
 */
export interface ChildrenOperationsSlice {
  /**
   * 对选中节点的子节点进行网格布局
   * @param parentId - 父节点ID（可以是Node或Group）
   */
  layoutChildrenInGrid: (parentId: string) => void;

  /**
   * 获取节点的所有直接子节点
   * @param parentId - 父节点ID
   * @returns 子节点列表
   */
  getChildNodes: (parentId: string) => (Node | Group)[];

  /**
   * 添加子节点到父节点
   * @param parentId - 父节点ID
   * @param childId - 子节点ID
   */
  addChildToParent: (parentId: string, childId: string) => void;

  /**
   * 从父节点移除子节点
   * @param parentId - 父节点ID
   * @param childId - 子节点ID
   */
  removeChildFromParent: (parentId: string, childId: string) => void;
}

/**
 * 创建子节点操作Slice
 */
export const createChildrenOperationsSlice = (set: any, get: any): ChildrenOperationsSlice => ({

  /**
   * 获取节点的所有直接子节点
   */
  getChildNodes: (parentId: string) => {
    const state = get();
    const parent = state.nodes.find((n: Node | Group) => n.id === parentId);

    if (!parent) {
      console.warn(`⚠️ 父节点 ${parentId} 未找到`);
      return [];
    }

    // 获取childNodeIds（Node的子节点）或nodeIds（Group的子节点）
    let childIds: string[] = [];

    if (parent.type === BlockEnum.GROUP) {
      childIds = (parent as Group).nodeIds || [];
    } else if (parent.type === BlockEnum.NODE) {
      childIds = (parent as Node).childNodeIds || [];
    }

    // 返回实际的子节点对象
    return state.nodes.filter((n: Node | Group) => childIds.includes(n.id));
  },

  /**
   * 对子节点进行网格布局
   */
  layoutChildrenInGrid: (parentId: string) => set((state: any) => {
    const parent = state.nodes.find((n: Node | Group) => n.id === parentId);
    if (!parent) {
      console.warn(`⚠️ 父节点 ${parentId} 未找到`);
      return state;
    }

    const children = get().getChildNodes(parentId);
    if (children.length === 0) {
      console.log(`📐 节点 ${parentId} 无子节点，跳过布局`);
      return state;
    }

    console.log(`📐 开始网格布局: 父节点 ${parentId} 有 ${children.length} 个子节点`);

    const parentPos = safePosition(parent.position);
    const { columns, spacingX, spacingY } = GRID_LAYOUT;

    console.log(`  配置: ${columns}列, 间距X=${spacingX}, 间距Y=${spacingY}`);
    console.log(`  父节点位置: (${parentPos.x}, ${parentPos.y})`);
    console.log(`  容器内边距: top=${CONTAINER_PADDING.top}, left=${CONTAINER_PADDING.left}`);

    // 计算每个子节点的新位置
    const updatedNodes = state.nodes.map((node: Node | Group) => {
      const childIndex = children.findIndex(c => c.id === node.id);
      if (childIndex === -1) return node; // 不是子节点，保持不变

      const row = Math.floor(childIndex / columns);
      const col = childIndex % columns;

      // 计算绝对位置（相对于画布）
      const newPosition = {
        x: parentPos.x + CONTAINER_PADDING.left + (col * spacingX),
        y: parentPos.y + CONTAINER_PADDING.top + (row * spacingY),
      };

      console.log(`  📍 节点 ${node.id}: 第${row}行第${col}列 -> (${newPosition.x}, ${newPosition.y})`);

      return {
        ...node,
        position: newPosition,
        updatedAt: new Date(),
      };
    });

    const newState = { nodes: updatedNodes };

    // 布局后更新父节点边界（确保能容纳所有子节点）
    setTimeout(() => {
      console.log(`📏 布局完成，更新父节点 ${parentId} 边界`);
      if (get().updateContainerBoundary) {
        get().updateContainerBoundary(parentId);
      } else {
        // 兼容旧的updateGroupBoundary
        console.log(`  使用updateGroupBoundary更新边界`);
        get().updateGroupBoundary(parentId);
      }
    }, 50);

    // 添加历史记录
    if (get().addHistorySnapshot) {
      get().addHistorySnapshot();
    }

    console.log(`✅ 网格布局完成`);

    return newState;
  }),

  /**
   * 添加子节点到父节点
   */
  addChildToParent: (parentId, childId) => set((state: any) => {
    const parent = state.nodes.find((n: Node | Group) => n.id === parentId);
    const child = state.nodes.find((n: Node | Group) => n.id === childId);

    if (!parent) {
      console.warn(`⚠️ 父节点 ${parentId} 未找到`);
      return state;
    }

    if (!child) {
      console.warn(`⚠️ 子节点 ${childId} 未找到`);
      return state;
    }

    console.log(`🔗 添加子节点 ${childId} 到父节点 ${parentId}`);

    const updatedNodes = state.nodes.map((n: Node | Group) => {
      if (n.id === parentId) {
        // 更新父节点的childNodeIds或nodeIds
        if (n.type === BlockEnum.GROUP) {
          const group = n as Group;
          const nodeIds = group.nodeIds || [];
          if (!nodeIds.includes(childId)) {
            return {
              ...group,
              nodeIds: [...nodeIds, childId],
              updatedAt: new Date(),
            };
          }
        } else if (n.type === BlockEnum.NODE) {
          const node = n as Node;
          const childNodeIds = node.childNodeIds || [];
          if (!childNodeIds.includes(childId)) {
            return {
              ...node,
              childNodeIds: [...childNodeIds, childId],
              updatedAt: new Date(),
            };
          }
        }
      } else if (n.id === childId) {
        // 更新子节点的parentId
        return {
          ...n,
          parentId: parentId,
          updatedAt: new Date(),
        };
      }
      return n;
    });

    console.log(`  ✅ 子节点关系已建立`);

    return { nodes: updatedNodes };
  }),

  /**
   * 从父节点移除子节点
   */
  removeChildFromParent: (parentId, childId) => set((state: any) => {
    const parent = state.nodes.find((n: Node | Group) => n.id === parentId);

    if (!parent) {
      console.warn(`⚠️ 父节点 ${parentId} 未找到`);
      return state;
    }

    console.log(`🔓 从父节点 ${parentId} 移除子节点 ${childId}`);

    const updatedNodes = state.nodes.map((n: Node | Group) => {
      if (n.id === parentId) {
        // 更新父节点的childNodeIds或nodeIds
        if (n.type === BlockEnum.GROUP) {
          const group = n as Group;
          return {
            ...group,
            nodeIds: (group.nodeIds || []).filter(id => id !== childId),
            updatedAt: new Date(),
          };
        } else if (n.type === BlockEnum.NODE) {
          const node = n as Node;
          return {
            ...node,
            childNodeIds: (node.childNodeIds || []).filter(id => id !== childId),
            updatedAt: new Date(),
          };
        }
      } else if (n.id === childId) {
        // 清除子节点的parentId
        return {
          ...n,
          parentId: undefined,
          updatedAt: new Date(),
        };
      }
      return n;
    });

    console.log(`  ✅ 子节点关系已解除`);

    return { nodes: updatedNodes };
  }),
});
