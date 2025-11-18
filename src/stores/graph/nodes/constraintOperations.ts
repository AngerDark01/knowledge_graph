import { Node, Group, BlockEnum } from '@/types/graph/models';
import { ConstraintOperationsSlice, safePosition, safeNumber, constrainNodeToGroupBoundary } from './types';
import { applyOffsetToDescendants } from '@/utils/graph/recursiveMoveHelpers';

export const createConstraintOperationsSlice = (set: any, get: any): ConstraintOperationsSlice => {
  return {
    updateNodePosition: (id, position) => set((state: any) => {
      console.log(`📍 更新节点位置 ${id}:`, position);

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
                console.log('  🔒 拖动时约束位置到群组内:', constrainedPos);
              }
            }

            console.log(`  ✅ 位置已更新:`, updatedNode.position);
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
        console.log(`⚠️ 群组 ${groupId} 未找到`);
        return state;
      }

      const safeNewPos = safePosition(newPosition);
      const safeOldPos = safePosition(group.position);

      const offsetX = safeNewPos.x - safeOldPos.x;
      const offsetY = safeNewPos.y - safeOldPos.y;

      console.log(`📦 群组移动 ${groupId}:`, {
        旧位置: safeOldPos,
        新位置: safeNewPos,
        偏移: { x: offsetX, y: offsetY }
      });

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