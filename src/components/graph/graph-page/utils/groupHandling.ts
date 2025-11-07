/**
 * 容器处理工具（新架构）
 *
 * 迁移说明：
 * - Group -> Container
 * - groupId -> parentId
 * - BlockEnum -> viewMode
 */

import { Node as ReactFlowNode } from 'reactflow';
import { BaseNode } from '@/types/graph/models';
import { useGraphStore } from '@/stores/graph';
import { GROUP_PADDING } from '@/stores/graph/nodes/types';

/**
 * 检查节点位置是否在容器边界内
 */
export const isPositionInContainerBoundary = (
  position: { x: number; y: number },
  containerId: string,
  nodes: BaseNode[]
) => {
  const container = nodes.find((n: BaseNode) => n.id === containerId) as BaseNode;
  if (!container || container.viewMode !== 'container') return false;

  const containerBoundary = {
    minX: container.position.x + GROUP_PADDING.left,
    minY: container.position.y + GROUP_PADDING.top,
    maxX: container.position.x + (container.width || 400) - GROUP_PADDING.right,
    maxY: container.position.y + (container.height || 300) - GROUP_PADDING.bottom
  };

  // 考虑节点尺寸，这里假设节点大小为固定值
  const nodeWidth = 350; // 节点宽度的默认值
  const nodeHeight = 280; // 节点高度的默认值

  return (
    position.x >= containerBoundary.minX &&
    position.x + nodeWidth <= containerBoundary.maxX &&
    position.y >= containerBoundary.minY &&
    position.y + nodeHeight <= containerBoundary.maxY
  );
};

/**
 * 限制节点位置在容器边界内
 */
export const restrictNodePositionToContainer = (node: ReactFlowNode, nodes: BaseNode[]) => {
  // 如果节点属于某个父容器，检查边界约束
  if (node.parentNode) { // ReactFlow 使用 parentNode
    // 获取父容器信息
    const container = nodes.find((n: BaseNode) => n.id === node.parentNode) as BaseNode;
    if (container && container.viewMode === 'container') {
      const padding = GROUP_PADDING;

      const restrictPosition: { x?: number; y?: number } = { x: undefined, y: undefined };

      // 检查边界约束
      if (node.position.y < padding.top) {
        restrictPosition.y = padding.top;
      }
      if (node.position.x < padding.left) {
        restrictPosition.x = padding.left;
      }
      if (node.position.x + (node.width || 350) > (container.width || 400) - padding.right) {
        restrictPosition.x = (container.width || 400) - padding.right - (node.width || 350);
      }
      if (node.position.y + (node.height || 280) > (container.height || 300) - padding.bottom) {
        restrictPosition.y = (container.height || 300) - padding.bottom - (node.height || 280);
      }

      return restrictPosition;
    }
  }
  return { x: undefined, y: undefined };
};

/**
 * 处理容器拖拽，同步移动内部节点
 */
export const onContainerDrag = (
  event: React.MouseEvent,
  container: BaseNode,
  nodes: BaseNode[],
  containerComputedPositions: Record<string, { x: number; y: number }>
) => {
  if (container.viewMode !== 'container') return;

  // 获取容器内的所有子节点
  const childNodes = nodes.filter((node: BaseNode) =>
    node.parentId === container.id
  );

  // 获取容器之前的计算位置
  const previousComputedPosition = containerComputedPositions[container.id];

  // 计算容器移动的偏移量
  const offsetX = previousComputedPosition
    ? container.position.x - previousComputedPosition.x
    : 0;
  const offsetY = previousComputedPosition
    ? container.position.y - previousComputedPosition.y
    : 0;

  // 更新容器内所有节点的位置
  childNodes.forEach((node: BaseNode) => {
    const { updateNode } = useGraphStore.getState();
    updateNode(node.id, {
      position: {
        x: node.position.x + offsetX,
        y: node.position.y + offsetY
      }
    });
  });

  // 注意：containerComputedPositions 需要在调用处更新
};
