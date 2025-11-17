import { Node, Group, BlockEnum } from '@/types/graph/models';
import { ConstraintOperationsSlice, safePosition, safeNumber, constrainNodeToGroupBoundary } from './types';
import { applyOffsetToDescendants } from '@/utils/graph/recursiveMoveHelpers';

export const createConstraintOperationsSlice = (set: any, get: any): ConstraintOperationsSlice => {
  return {
    updateNodePosition: (id, position) => set((state: any) => {
      const safePos = safePosition(position);

      return {
        nodes: state.nodes.map((node: Node | Group) => {
          if (node.id === id) {
            let updatedNode = {
              ...node,
              position: safePos,
              updatedAt: new Date()
            };

            // 🔧 如果节点（Node 或 Group）属于群组，约束位置
            if ('groupId' in node && node.groupId) {
              const parentGroup = state.nodes.find((n: Node | Group) =>
                n.id === node.groupId && n.type === BlockEnum.GROUP
              ) as Group;

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

    handleGroupMove: (groupId, newPosition) => set((state: any) => {
      const group = state.nodes.find((node: Node | Group) =>
        node.id === groupId && node.type === BlockEnum.GROUP
      ) as Group;

      if (!group) {
        return state;
      }

      const safeNewPos = safePosition(newPosition);
      const safeOldPos = safePosition(group.position);

      const offsetX = safeNewPos.x - safeOldPos.x;
      const offsetY = safeNewPos.y - safeOldPos.y;

      // ⚡ 性能优化: 如果偏移量为0，直接返回，避免不必要的更新
      if (offsetX === 0 && offsetY === 0) {
        return state;
      }

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

      // 🔧 递归应用偏移量到所有后代节点（支持多层嵌套）
      updatedNodes = applyOffsetToDescendants(
        groupId,
        { x: offsetX, y: offsetY },
        updatedNodes
      );

      return { nodes: updatedNodes };
    }),
  };
};