import { Node } from '@/types/graph/models';
import { updateGroupBoundary } from './groupBoundaryManager';
import { useGraphStore } from '@/stores/graph';

// 处理节点位置更新，包括更新群组边界
export const handleNodePositionUpdate = (nodeId: string, position: { x: number; y: number }) => {
  const { updateNode } = useGraphStore.getState();
  updateNode(nodeId, { position });
  
  // 获取更新后的节点，检查是否属于群组
  const node = useGraphStore.getState().getNodeById(nodeId) as Node;
  if (node && node.groupId) {
    // 延迟更新群组边界，避免在状态更新过程中发生冲突
    setTimeout(() => {
      updateGroupBoundary(node.groupId!);
    }, 0);
  }
};