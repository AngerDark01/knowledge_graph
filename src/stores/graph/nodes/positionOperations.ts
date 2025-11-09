/**
 * 位置操作 Slice
 *
 * 职责：
 * 1. 节点位置更新
 * 2. 位置约束处理
 * 3. 容器边界自动更新
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
        if (parentNode && parentNode.viewMode === 'container') {
          finalPosition = constrainToParentBoundary(node, parentNode, finalPosition);
        }
      }

      // 更新节点位置
      get().updateNode(id, { position: finalPosition });

      // 如果节点有子节点（即它是容器），同步移动所有子节点
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

      // 如果节点属于某个容器，延迟更新容器边界
      if (node.parentId) {
        setTimeout(() => {
          updateContainerBoundary(node.parentId!, get);
        }, 0);
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

/**
 * 更新容器边界以适应内部子节点
 *
 * 同时更新 containerState，确保状态同步
 */
function updateContainerBoundary(containerId: string, get: any) {
  const container = get().getNodeById(containerId) as BaseNode;

  if (!container || container.viewMode !== 'container') return;

  // 获取容器内所有子节点
  const childNodes = get().getNodes().filter((node: BaseNode) =>
    node.parentId === containerId
  ) as BaseNode[];

  if (childNodes.length === 0) {
    return;
  }

  // 计算容器边界
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  childNodes.forEach((node: BaseNode) => {
    const nodeWidth = node.width || 350;
    const nodeHeight = node.height || 280;

    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + nodeWidth);
    maxY = Math.max(maxY, node.position.y + nodeHeight);
  });

  // 添加内边距
  const padding = GROUP_PADDING;
  minX -= padding.left;
  minY -= padding.top;
  maxX += padding.right;
  maxY += padding.bottom;

  // 计算新尺寸
  const newWidth = Math.max(400, maxX - minX);
  const newHeight = Math.max(300, maxY - minY);

  // 只有在尺寸或位置发生变化时才更新
  const needsUpdate =
    Math.abs(container.position.x - minX) > 1 ||
    Math.abs(container.position.y - minY) > 1 ||
    Math.abs((container.width || 400) - newWidth) > 1 ||
    Math.abs((container.height || 300) - newHeight) > 1;

  if (needsUpdate) {
    const updates: Partial<BaseNode> = {
      position: { x: minX, y: minY },
      width: newWidth,
      height: newHeight
    };

    // 🔥 同步更新 containerState
    if (container.containerState) {
      updates.containerState = {
        ...container.containerState,
        width: newWidth,
        height: newHeight,
      };
    }

    get().updateNode(containerId, updates);
  }
}

