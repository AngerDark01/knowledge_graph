import { BaseNode } from '@/types/graph/models';

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
 * 基础节点操作接口
 */
export interface NodeOperationsSlice {
  nodes: BaseNode[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  addNode: (node: BaseNode) => void;
  updateNode: (id: string, updates: Partial<BaseNode>) => void;
  deleteNode: (id: string) => void;
  getNodes: () => BaseNode[];
  getNodeById: (id: string) => BaseNode | undefined;
  setSelectedNodeId: (id: string | null) => void;
  setSelectedEdgeId: (id: string | null) => void;
}

/**
 * 节点位置操作接口
 */
export interface PositionOperationsSlice {
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
}