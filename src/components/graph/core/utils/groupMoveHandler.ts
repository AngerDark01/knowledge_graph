import { Group, Node } from '@/types/graph/models';
import { useGraphStore } from '@/stores/graph';
import { handleNodePositionUpdate } from './nodeUpdateHandler';

// 处理群组移动时同步更新内部节点
export const handleGroupMove = (groupId: string, newPosition: { x: number; y: number }) => {
  const state = useGraphStore.getState();
  const group = state.getNodeById(groupId) as Group;
  
  if (!group) return;
  
  // 计算群组移动的偏移量
  const offsetX = newPosition.x - group.position.x;
  const offsetY = newPosition.y - group.position.y;
  
  // 获取群组内所有节点
  const groupNodes = state.getNodes().filter(node => 
    node.groupId === groupId
  ) as Node[];
  
  // 批量更新群组内节点的位置
  const updatedNodes = groupNodes.map(node => ({
    ...node,
    position: {
      x: node.position.x + offsetX,
      y: node.position.y + offsetY
    }
  }));
  
  // 更新store中的节点位置和群组边界
  updatedNodes.forEach(node => {
    handleNodePositionUpdate(node.id, node.position);
  });
  
  // 更新群组自身的位置
  state.updateNode(groupId, { position: newPosition });
};