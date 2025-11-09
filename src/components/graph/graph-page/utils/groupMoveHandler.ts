import { Group, Node, BlockEnum } from '@/types/graph/models';
import { useGraphStore } from '@/stores/graph';
import { handleNodePositionUpdate } from './nodeUpdateHandler';
import { getAllNestedNodeIds } from '@/utils/graph/nesting';

// 🔧 修复：递归更新所有嵌套子节点的位置
export const handleGroupMove = (groupId: string, newPosition: { x: number; y: number }) => {
  const state = useGraphStore.getState();
  const group = state.getNodeById(groupId) as Group;

  if (!group) return;

  // 计算群组移动的偏移量
  const offsetX = newPosition.x - group.position.x;
  const offsetY = newPosition.y - group.position.y;

  console.log(`📦 移动群组 ${groupId}, 偏移量: (${offsetX}, ${offsetY})`);

  // ✅ 关键修复：递归获取所有嵌套子节点（包括多层嵌套）
  const allNodes = state.getNodes();
  const nestedNodeIds = getAllNestedNodeIds(groupId, allNodes);

  console.log(`  🔍 找到 ${nestedNodeIds.length} 个嵌套子节点`);

  // 获取所有嵌套子节点的完整对象
  const nestedNodes = allNodes.filter(node =>
    nestedNodeIds.includes(node.id)
  ) as (Node | Group)[];

  // 批量更新所有嵌套子节点的绝对位置
  nestedNodes.forEach(node => {
    const newNodePosition = {
      x: node.position.x + offsetX,
      y: node.position.y + offsetY
    };

    console.log(`    📍 更新节点 ${node.id}: (${node.position.x}, ${node.position.y}) → (${newNodePosition.x}, ${newNodePosition.y})`);

    // 直接更新节点位置，不触发额外的边界更新
    state.updateNode(node.id, { position: newNodePosition });
  });

  // 更新群组自身的位置
  state.updateNode(groupId, { position: newPosition });

  console.log(`✅ 群组移动完成`);
};