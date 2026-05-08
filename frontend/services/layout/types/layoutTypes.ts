// src/services/layout/types/layoutTypes.ts
import { Node, Group, Edge } from '../../../types/graph/models';

// 将现有项目类型映射为布局系统使用类型
export type LayoutNode = Node | Group;
export type LayoutEdge = Edge;

export type LayoutStrategyId = 'elk-layout' | 'elk-group-layout' | string;
export type ELKLayoutDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type ELKLayoutOptionValue = string | number | boolean;
export type ELKLayoutOptions = Record<string, ELKLayoutOptionValue>;

export interface LayoutProgress {
  currentLevel: number;
  totalLevels: number;
  processedNodes: number;
  totalNodes: number;
}

export interface LayoutNodePosition {
  x: number;
  y: number;
  width?: number;
  height?: number;
  boundary?: Group['boundary'];
}

export interface LayoutEdgeUpdate {
  sourceHandle?: string;
  targetHandle?: string;
}

export interface LayoutOptions {
  strategy?: LayoutStrategyId;
  animate?: boolean;

  // 布局范围控制
  targetGroupId?: string | null;  // null 或 undefined = 全画布布局，string = 指定群组ID
  layoutScope?: 'canvas' | 'group';  // 布局范围类型

  // 递归布局模式
  layoutMode?: 'normal' | 'recursive';  // normal = 单层布局，recursive = 递归布局所有嵌套层级

  // 特定功能参数
  groupId?: string;  // 用于群组内部布局策略

  elkOptions?: ELKLayoutOptions;
  onProgress?: (progress: LayoutProgress) => void;
}

export interface LayoutResult {
  success: boolean;
  nodes: Map<string, LayoutNodePosition>;
  edges: Map<string, LayoutEdgeUpdate>;
  errors: string[];
  stats: {
    duration: number;
    iterations: number;
    collisions: number;
  };
}

export interface ILayoutStrategy {
  name: string;
  id: string;
  
  applyLayout(
    nodes: LayoutNode[],
    edges: LayoutEdge[],
    options?: LayoutOptions
  ): Promise<LayoutResult>;
  
  validateConfig(config: unknown): boolean;
}
