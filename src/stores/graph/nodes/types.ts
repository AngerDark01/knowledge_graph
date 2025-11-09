import { Node, Group, Edge, BlockEnum } from '@/types/graph/models';

// 群组内边距常量
export const GROUP_PADDING = { 
  top: 70,    // 标题栏高度 + 额外间距
  left: 20, 
  right: 20, 
  bottom: 20 
};

// 节点外框的额外空间（阴影、边框等视觉效果）
export const NODE_VISUAL_PADDING = 4;

// 安全的数值验证函数
export const safeNumber = (value: any, defaultValue: number = 0): number => {
  const num = Number(value);
  return typeof num === 'number' && !isNaN(num) && isFinite(num) ? num : defaultValue;
};

// 确保位置对象有效
export const safePosition = (position: any): { x: number; y: number } => {
  return {
    x: safeNumber(position?.x, 0),
    y: safeNumber(position?.y, 0)
  };
};

/**
 * 约束节点位置在群组边界内（支持 Node 和 Group）
 * @param node 要约束的节点（Node 或 Group）
 * @param parentGroup 父群组
 * @returns 约束后的位置
 */
export const constrainNodeToGroupBoundary = (
  node: Node | Group,
  parentGroup: Group
): { x: number; y: number } => {
  // 根据节点类型确定默认尺寸
  let defaultWidth = 150;
  let defaultHeight = 100;

  if (node.type === BlockEnum.NODE) {
    defaultWidth = 350;
    defaultHeight = 280;
  } else if (node.type === BlockEnum.GROUP) {
    defaultWidth = 300;
    defaultHeight = 200;
  }

  const nodeWidth = safeNumber(node.width, defaultWidth);
  const nodeHeight = safeNumber(node.height, defaultHeight);
  const groupWidth = safeNumber(parentGroup.width, 300);
  const groupHeight = safeNumber(parentGroup.height, 200);

  const groupPos = safePosition(parentGroup.position);
  const nodePos = safePosition(node.position);

  // 计算允许的最小和最大位置
  const minX = groupPos.x + GROUP_PADDING.left;
  const minY = groupPos.y + GROUP_PADDING.top;
  const maxX = groupPos.x + groupWidth - GROUP_PADDING.right - nodeWidth;
  const maxY = groupPos.y + groupHeight - GROUP_PADDING.bottom - nodeHeight;

  // 约束节点位置
  const constrainedX = Math.max(minX, Math.min(nodePos.x, maxX));
  const constrainedY = Math.max(minY, Math.min(nodePos.y, maxY));

  return {
    x: safeNumber(constrainedX, minX),
    y: safeNumber(constrainedY, minY)
  };
};

export interface NodeOperationsSlice {
  nodes: (Node | Group)[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  addNode: (node: Node | Group) => void;
  updateNode: (id: string, updates: Partial<Node | Group>) => void;
  deleteNode: (id: string) => void;
  getNodes: () => (Node | Group)[];
  getNodeById: (id: string) => (Node | Group) | undefined;
  setSelectedNodeId: (id: string | null) => void;
  setSelectedEdgeId: (id: string | null) => void;
}

export interface GroupOperationsSlice {
  addGroup: (group: Group) => void;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  addNodeToGroup: (nodeId: string, groupId: string) => void;
  removeNodeFromGroup: (nodeId: string) => void;
}

export interface ConstraintOperationsSlice {
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
  handleGroupMove: (groupId: string, newPosition: { x: number; y: number }) => void;
}

export interface GroupBoundaryOperationsSlice {
  updateGroupBoundary: (groupId: string) => void;
}