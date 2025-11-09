import { Node, Group, Edge } from '@/types/graph/models';
import { GraphConfig } from '@/config/graph.config';

// 从配置文件导出常量（保持兼容性）
export const GROUP_PADDING = GraphConfig.groupPadding;
export const NODE_VISUAL_PADDING = GraphConfig.nodeVisualPadding;

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

// 约束节点位置在群组边界内（支持 Node 和 Group）
export const constrainNodeToGroupBoundary = (
  node: Node | Group,
  group: Group
): { x: number; y: number } => {
  // 根据节点类型获取默认尺寸
  const defaultWidth = node.type === 'group' ?
    GraphConfig.nodeSize.group.default.width :
    GraphConfig.nodeSize.note.collapsed.width;
  const defaultHeight = node.type === 'group' ?
    GraphConfig.nodeSize.group.default.height :
    GraphConfig.nodeSize.note.collapsed.height;

  const nodeWidth = safeNumber(node.width, defaultWidth);
  const nodeHeight = safeNumber(node.height, defaultHeight);
  const groupWidth = safeNumber(group.width, GraphConfig.nodeSize.group.default.width);
  const groupHeight = safeNumber(group.height, GraphConfig.nodeSize.group.default.height);
  
  const groupPos = safePosition(group.position);
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