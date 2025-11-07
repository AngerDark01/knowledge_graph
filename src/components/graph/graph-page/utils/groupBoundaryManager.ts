/**
 * 容器边界管理器（新架构）
 *
 * 迁移说明：
 * - Group -> Container（viewMode === 'container'）
 * - groupId -> parentId
 * - 自动调整容器大小以适应子节点
 */

import { BaseNode } from '@/types/graph/models';
import { useGraphStore } from '@/stores/graph';
import { GROUP_PADDING } from '@/stores/graph/nodes/types';

/**
 * 更新容器边界以适应内部子节点
 */
export const updateContainerBoundary = (containerId: string) => {
  const state = useGraphStore.getState();
  const container = state.getNodeById(containerId) as BaseNode;

  if (!container || container.viewMode !== 'container') return;

  // 获取容器内所有子节点
  const childNodes = state.getNodes().filter(node =>
    node.parentId === containerId
  ) as BaseNode[];

  if (childNodes.length === 0) {
    // 如果容器内没有节点，保持原始尺寸
    return;
  }

  // 计算容器边界
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  childNodes.forEach(node => {
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
  const newWidth = Math.max(400, maxX - minX);  // 确保最小宽度为400
  const newHeight = Math.max(300, maxY - minY); // 确保最小高度为300

  // 更新容器尺寸和位置
  state.updateNode(containerId, {
    position: { x: minX, y: minY },
    width: newWidth,
    height: newHeight
  });
};

/**
 * 检查节点是否在容器边界内
 */
export const isNodeInContainerBoundary = (node: BaseNode, container: BaseNode): boolean => {
  if (container.viewMode !== 'container') return false;

  const containerRect = {
    minX: container.position.x + GROUP_PADDING.left,
    minY: container.position.y + GROUP_PADDING.top,
    maxX: container.position.x + (container.width || 400) - GROUP_PADDING.right,
    maxY: container.position.y + (container.height || 300) - GROUP_PADDING.bottom
  };

  const nodeWidth = node.width || 350;
  const nodeHeight = node.height || 280;

  return (
    node.position.x >= containerRect.minX &&
    node.position.x + nodeWidth <= containerRect.maxX &&
    node.position.y >= containerRect.minY &&
    node.position.y + nodeHeight <= containerRect.maxY
  );
};

/**
 * 将节点约束在容器边界内
 */
export const constrainNodeToContainer = (node: BaseNode, container: BaseNode): BaseNode => {
  if (container.viewMode !== 'container') return node;

  const containerRect = {
    minX: container.position.x + GROUP_PADDING.left,
    minY: container.position.y + GROUP_PADDING.top,
    maxX: container.position.x + (container.width || 400) - GROUP_PADDING.right,
    maxY: container.position.y + (container.height || 300) - GROUP_PADDING.bottom
  };

  const nodeWidth = node.width || 350;
  const nodeHeight = node.height || 280;

  const constrainedPosition = {
    x: Math.max(
      containerRect.minX,
      Math.min(node.position.x, containerRect.maxX - nodeWidth)
    ),
    y: Math.max(
      containerRect.minY,
      Math.min(node.position.y, containerRect.maxY - nodeHeight)
    )
  };

  return {
    ...node,
    position: constrainedPosition
  };
};
