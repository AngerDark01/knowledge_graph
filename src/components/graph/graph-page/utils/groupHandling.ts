import { Node as ReactFlowNode } from 'reactflow';
import { Node, Group, BlockEnum } from '@/types/graph/models';
import { useGraphStore } from '@/stores/graph';

// 检查节点位置是否在群组边界内
export const isPositionInGroupBoundary = (position: { x: number; y: number }, groupId: string, nodes: (Node | Group)[]) => {
  const group = nodes.find((n: Node | Group) => n.id === groupId) as Group;
  if (!group) return false;

  const groupBoundary = {
    minX: group.position.x,
    minY: group.position.y,
    maxX: group.position.x + (group.width || 300),
    maxY: group.position.y + (group.height || 200)
  };

  // 考虑节点尺寸，这里假设节点大小为固定值
  const nodeWidth = 150; // 节点宽度的估算值
  const nodeHeight = 100; // 节点高度的估算值

  return (
    position.x >= groupBoundary.minX &&
    position.x + nodeWidth <= groupBoundary.maxX &&
    position.y >= groupBoundary.minY &&
    position.y + nodeHeight <= groupBoundary.maxY
  );
};

// 限制节点位置在群组边界内
export const restrictNodePositionToGroup = (node: ReactFlowNode, nodes: (Node | Group)[]) => {
  // 如果节点属于某个群组，检查边界约束
  if (node.parentId) { // 使用parentId而不是groupId
    // 获取群组信息
    const group = nodes.find((n: Node | Group) => n.id === node.parentId && n.type === BlockEnum.GROUP) as Group;
    if (group) {
      // 群组的内边距，参考Dify的ITERATION_PADDING
      const padding = { top: 10, left: 10, right: 10, bottom: 10 };

      const restrictPosition: { x?: number; y?: number } = { x: undefined, y: undefined };

      // 检查边界约束
      if (node.position.y < padding.top) {
        restrictPosition.y = padding.top;
      }
      if (node.position.x < padding.left) {
        restrictPosition.x = padding.left;
      }
      if (node.position.x + (node.width || 150) > (group.width || 300) - padding.right) {
        restrictPosition.x = (group.width || 300) - padding.right - (node.width || 150);
      }
      if (node.position.y + (node.height || 100) > (group.height || 200) - padding.bottom) {
        restrictPosition.y = (group.height || 200) - padding.bottom - (node.height || 100);
      }

      return restrictPosition;
    }
  }
  return { x: undefined, y: undefined };
};

// 处理群组拖拽，同步移动内部节点
export const onGroupDrag = (event: React.MouseEvent, group: Group, nodes: (Node | Group)[], groupComputedPositions: Record<string, { x: number; y: number }>) => {
  // 获取群组内的所有节点（只过滤普通节点，排除群组节点）
  const groupNodes = nodes.filter((node: Node | Group): node is Node => 
    node.type === BlockEnum.NODE && 'groupId' in node && node.groupId === group.id
  );
  
  // 获取群组之前的计算位置
  const previousComputedPosition = groupComputedPositions[group.id];
  
  // 计算群组移动的偏移量
  const offsetX = previousComputedPosition 
    ? group.position.x - previousComputedPosition.x 
    : 0;
  const offsetY = previousComputedPosition 
    ? group.position.y - previousComputedPosition.y 
    : 0;

  // 更新群组内所有节点的位置
  groupNodes.forEach((node: Node) => {
    const { updateNode } = useGraphStore.getState();
    updateNode(node.id, {
      position: {
        x: node.position.x + offsetX,
        y: node.position.y + offsetY
      }
    });
  });
  
  // 更新群组的计算位置
  // 注意：这里需要通过某种方式更新groupComputedPositions状态
  // 由于这是一个工具函数，无法直接访问React状态，所以需要在调用处处理
};