import { Node, Group } from '@/types/graph/models';
import { useGraphStore } from '@/stores/graph';

// 更新群组边界以适应内部节点
export const updateGroupBoundary = (groupId: string) => {
  const state = useGraphStore.getState();
  const group = state.getNodeById(groupId) as Group;
  
  if (!group) return;
  
  // 获取群组内所有节点
  const groupNodes = state.getNodes().filter(node => 
    node.groupId === groupId
  ) as Node[];
  
  if (groupNodes.length === 0) {
    // 如果群组内没有节点，保持原始尺寸
    return;
  }
  
  // 计算群组边界
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  groupNodes.forEach(node => {
    const nodeWidth = node.width || 150;
    const nodeHeight = node.height || 100;
    
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + nodeWidth);
    maxY = Math.max(maxY, node.position.y + nodeHeight);
  });
  
  // 添加一些内边距
  const padding = 20;
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;
  
  // 计算新尺寸
  const newWidth = Math.max(300, maxX - minX);  // 确保最小宽度为300
  const newHeight = Math.max(200, maxY - minY); // 确保最小高度为200
  
  // 更新群组尺寸和位置
  state.updateNode(groupId, {
    position: { x: minX, y: minY },
    width: newWidth,
    height: newHeight
  });
};

// 检查节点是否在群组边界内
export const isNodeInGroupBoundary = (node: Node, group: Group): boolean => {
  const groupRect = {
    minX: group.position.x,
    minY: group.position.y,
    maxX: group.position.x + (group.width || 300),
    maxY: group.position.y + (group.height || 200)
  };
  
  const nodeWidth = node.width || 150;
  const nodeHeight = node.height || 100;
  
  return (
    node.position.x >= groupRect.minX &&
    node.position.x + nodeWidth <= groupRect.maxX &&
    node.position.y >= groupRect.minY &&
    node.position.y + nodeHeight <= groupRect.maxY
  );
};

// 将节点约束在群组边界内
export const constrainNodeToGroup = (node: Node, group: Group): Node => {
  const groupRect = {
    minX: group.position.x,
    minY: group.position.y,
    maxX: group.position.x + (group.width || 300),
    maxY: group.position.y + (group.height || 200)
  };
  
  const nodeWidth = node.width || 150;
  const nodeHeight = node.height || 100;
  
  const constrainedPosition = {
    x: Math.max(
      groupRect.minX,
      Math.min(node.position.x, groupRect.maxX - nodeWidth)
    ),
    y: Math.max(
      groupRect.minY,
      Math.min(node.position.y, groupRect.maxY - nodeHeight)
    )
  };
  
  return {
    ...node,
    position: constrainedPosition
  };
};