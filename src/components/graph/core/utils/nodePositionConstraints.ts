import { Node, Group, BlockEnum } from '@/types/graph/models';
import { useGraphStore } from '@/stores/graph';
import { isNodeInGroupBoundary, constrainNodeToGroup } from './groupBoundaryManager';

// 限制节点位置，确保不超出其所属群组边界
export const applyNodePositionConstraints = (nodeId: string) => {
  const state = useGraphStore.getState();
  const node = state.getNodeById(nodeId) as Node;
  
  if (!node || !node.groupId) return node;
  
  const group = state.getNodeById(node.groupId) as Group;
  if (!group) return node;
  
  // 如果节点超出了群组边界，则约束其位置
  if (!isNodeInGroupBoundary(node, group)) {
    return constrainNodeToGroup(node, group);
  }
  
  return node;
};