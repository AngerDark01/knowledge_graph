/**
 * 节点位置约束（新架构）
 *
 * 迁移说明：
 * - groupId -> parentId
 * - Group -> Container
 */

import { BaseNode } from '@/types/graph/models';
import { useGraphStore } from '@/stores/graph';
import { isNodeInContainerBoundary, constrainNodeToContainer } from './groupBoundaryManager';

/**
 * 应用节点位置约束，确保不超出其所属容器边界
 */
export const applyNodePositionConstraints = (nodeId: string) => {
  const state = useGraphStore.getState();
  const node = state.getNodeById(nodeId) as BaseNode;

  if (!node || !node.parentId) return node;

  const parent = state.getNodeById(node.parentId) as BaseNode;
  if (!parent || parent.viewMode !== 'container') return node;

  // 如果节点超出了容器边界，则约束其位置
  if (!isNodeInContainerBoundary(node, parent)) {
    return constrainNodeToContainer(node, parent);
  }

  return node;
};
