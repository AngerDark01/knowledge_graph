import { Node, Group, BlockEnum } from '@/types/graph/models';
import {
  type GraphNode,
  type GraphStoreSet,
  type ConstraintOperationsSlice,
  safePosition,
  constrainNodeToGroupBoundary
} from './types';
import { applyOffsetToDescendants } from '@/utils/graph/recursiveMoveHelpers';

export const createConstraintOperationsSlice = (
  set: GraphStoreSet
): ConstraintOperationsSlice => {
  return {
    updateNodePosition: (id, position) => set((state) => {
      const safePos = safePosition(position);

      return {
        nodes: state.nodes.map((node: Node | Group) => {
          if (node.id === id) {
            const updatedNode: GraphNode = {
              ...node,
              position: safePos,
              updatedAt: new Date()
            };

            // 🔧 如果节点（Node 或 Group）属于群组，约束位置（但只在非布局模式下）
            if (state.isLayoutMode !== true && 'groupId' in node && node.groupId) {
              const parentGroup = state.nodes.find((n: Node | Group) =>
                n.id === node.groupId && n.type === BlockEnum.GROUP
              ) as Group | undefined;

              if (parentGroup) {
                const constrainedPos = constrainNodeToGroupBoundary(updatedNode, parentGroup);
                updatedNode.position = constrainedPos;
              }
            }

            return updatedNode;
          }
          return node;
        })
      };
    }),

    handleGroupMove: (groupId, newPosition) => set((state) => {
      // 如果在布局模式下，直接返回，不执行移动操作
      if (state.isLayoutMode === true) {
        return state;
      }

      const group = state.nodes.find((node: Node | Group) =>
        node.id === groupId && node.type === BlockEnum.GROUP
      ) as Group | undefined;

      if (!group) {
        return state;
      }

      const safeNewPos = safePosition(newPosition);
      const safeOldPos = safePosition(group.position);

      const offsetX = safeNewPos.x - safeOldPos.x;
      const offsetY = safeNewPos.y - safeOldPos.y;

      // 先更新群组位置
      let updatedNodes = state.nodes.map((node: Node | Group) => {
        if (node.id === groupId) {
          return {
            ...node,
            position: safeNewPos,
            updatedAt: new Date()
          };
        }
        return node;
      });

      // 🔧 对于拖拽操作，仍然需要使用偏移量来移动所有子节点
      // 但在布局阶段，我们保持子节点的相对位置而不是应用偏移
      updatedNodes = applyOffsetToDescendants(
        groupId,
        { x: offsetX, y: offsetY },
        updatedNodes
      );

      return { nodes: updatedNodes };
    }),
  };
};
