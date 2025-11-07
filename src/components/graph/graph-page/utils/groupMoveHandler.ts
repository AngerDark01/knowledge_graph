/**
 * 容器移动处理器（新架构）
 *
 * 迁移说明：
 * - Group -> Container
 * - groupId -> parentId
 * - handleGroupMove -> handleContainerMove
 */

import { BaseNode } from '@/types/graph/models';
import { useGraphStore } from '@/stores/graph';
import { handleNodePositionUpdate } from './nodeUpdateHandler';

/**
 * 处理容器移动时同步更新内部子节点
 */
export const handleContainerMove = (containerId: string, newPosition: { x: number; y: number }) => {
  const state = useGraphStore.getState();
  const container = state.getNodeById(containerId) as BaseNode;

  if (!container || container.viewMode !== 'container') return;

  // 计算容器移动的偏移量
  const offsetX = newPosition.x - container.position.x;
  const offsetY = newPosition.y - container.position.y;

  // 获取容器内所有子节点
  const childNodes = state.getNodes().filter(node =>
    node.parentId === containerId
  ) as BaseNode[];

  // 批量更新容器内节点的位置
  const updatedNodes = childNodes.map(node => ({
    ...node,
    position: {
      x: node.position.x + offsetX,
      y: node.position.y + offsetY
    }
  }));

  // 更新store中的节点位置
  updatedNodes.forEach(node => {
    handleNodePositionUpdate(node.id, node.position);
  });

  // 更新容器自身的位置
  state.updateNode(containerId, { position: newPosition });
};
