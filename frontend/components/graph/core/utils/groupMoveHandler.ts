import { Group, Node } from '@/types/graph/models';
import { useGraphStore } from '@/stores/graph';

// ⚡ 优化版：处理群组移动时同步更新内部节点（批量更新）
export const handleGroupMove = (groupId: string, newPosition: { x: number; y: number }) => {
  const state = useGraphStore.getState();
  const group = state.getNodeById(groupId) as Group;

  if (!group) return;

  // 计算群组移动的偏移量
  const offsetX = newPosition.x - group.position.x;
  const offsetY = newPosition.y - group.position.y;

  // ⚡ 优化：避免零偏移的无效更新
  if (offsetX === 0 && offsetY === 0) {
    return;
  }

  // 获取群组内所有节点
  const allNodes = state.getNodes();
  const groupNodes = allNodes.filter(node =>
    node.groupId === groupId
  ) as Node[];

  // ⚡ 优化：批量更新 - 创建更新映射表
  const nodeUpdatesMap = new Map<string, { x: number; y: number }>();

  // 收集所有需要更新的节点位置
  groupNodes.forEach(node => {
    nodeUpdatesMap.set(node.id, {
      x: node.position.x + offsetX,
      y: node.position.y + offsetY
    });
  });

  // ⚡ 优化：一次性批量更新所有节点（减少状态变化次数）
  useGraphStore.setState((prevState) => {
    const updatedNodes = prevState.nodes.map(node => {
      // 更新群组自身位置
      if (node.id === groupId) {
        return { ...node, position: newPosition };
      }
      // 更新群组内节点位置
      const newPos = nodeUpdatesMap.get(node.id);
      if (newPos) {
        return { ...node, position: newPos };
      }
      return node;
    });

    return { nodes: updatedNodes };
  });
};