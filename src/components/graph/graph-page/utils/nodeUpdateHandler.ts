/**
 * 节点更新处理器（新架构）
 *
 * 迁移说明：
 * - groupId -> parentId
 * - updateGroupBoundary -> updateContainerBoundary
 */

import { BaseNode } from '@/types/graph/models';
import { updateContainerBoundary } from './groupBoundaryManager';
import { useGraphStore } from '@/stores/graph';

/**
 * 处理节点位置更新，包括更新容器边界
 */
export const handleNodePositionUpdate = (nodeId: string, position: { x: number; y: number }) => {
  const { updateNode } = useGraphStore.getState();
  updateNode(nodeId, { position });

  // 获取更新后的节点，检查是否属于容器
  const node = useGraphStore.getState().getNodeById(nodeId) as BaseNode;
  if (node && node.parentId) {
    // 延迟更新容器边界，避免在状态更新过程中发生冲突
    setTimeout(() => {
      updateContainerBoundary(node.parentId!);
    }, 0);
  }
};
