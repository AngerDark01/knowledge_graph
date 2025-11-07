/**
 * 位置操作 Slice
 *
 * 职责：
 * 1. 节点位置更新
 * 2. 位置约束处理
 */

import { BaseNode } from '@/types/graph/models';
import { PositionOperationsSlice, safePosition, safeNumber, GROUP_PADDING } from './types';

export const createPositionOperationsSlice = (set: any, get: any): PositionOperationsSlice => {
  return {
    updateNodePosition: (id: string, position: { x: number; y: number }) => {
      const state = get();
      const node = state.getNodeById(id) as BaseNode;

      if (!node) {
        console.error(`Node ${id} not found`);
        return;
      }

      let finalPosition = safePosition(position);

      // 如果节点有父节点，约束位置到父节点边界内
      if (node.parentId) {
        const parentNode = state.getNodeById(node.parentId) as BaseNode;
        if (parentNode) {
          finalPosition = constrainToParentBoundary(node, parentNode, finalPosition);
        }
      }

      // 更新节点位置
      get().updateNode(id, { position: finalPosition });

      // 如果节点有子节点，同步移动所有子节点
      if (node.childrenIds.length > 0) {
        const deltaX = finalPosition.x - node.position.x;
        const deltaY = finalPosition.y - node.position.y;

        node.childrenIds.forEach((childId) => {
          const childNode = state.getNodeById(childId) as BaseNode;
          if (childNode) {
            const newChildPosition = {
              x: childNode.position.x + deltaX,
              y: childNode.position.y + deltaY,
            };
            get().updateNode(childId, { position: newChildPosition });
          }
        });
      }
    },
  };
};

/**
 * 约束节点位置到父节点边界内
 */
function constrainToParentBoundary(
  node: BaseNode,
  parent: BaseNode,
  position: { x: number; y: number }
): { x: number; y: number } {
  const nodeWidth = safeNumber(node.width, 350);
  const nodeHeight = safeNumber(node.height, 280);
  const parentWidth = safeNumber(parent.width, 400);
  const parentHeight = safeNumber(parent.height, 300);

  const parentPos = safePosition(parent.position);

  // 计算允许的最小和最大位置
  const minX = parentPos.x + GROUP_PADDING.left;
  const minY = parentPos.y + GROUP_PADDING.top;
  const maxX = parentPos.x + parentWidth - GROUP_PADDING.right - nodeWidth;
  const maxY = parentPos.y + parentHeight - GROUP_PADDING.bottom - nodeHeight;

  // 约束节点位置
  const constrainedX = Math.max(minX, Math.min(position.x, maxX));
  const constrainedY = Math.max(minY, Math.min(position.y, maxY));

  return {
    x: safeNumber(constrainedX, minX),
    y: safeNumber(constrainedY, minY),
  };
}
