// src/services/layout/types/layoutTypes.ts
import { Node, Group, Edge } from '../../../types/graph/models';

// 将现有项目类型映射为布局系统使用类型
export type LayoutNode = Node | Group;
export type LayoutEdge = Edge;

export interface LayoutOptions {
  strategy?: string;
  animate?: boolean;

  // 布局范围控制
  targetGroupId?: string | null;  // null 或 undefined = 全画布布局，string = 指定群组ID
  layoutScope?: 'canvas' | 'group';  // 布局范围类型

  // 递归布局模式
  layoutMode?: 'normal' | 'recursive';  // normal = 单层布局，recursive = 递归布局所有嵌套层级

  onProgress?: (progress: { currentLevel: number; totalLevels: number; processedNodes: number; totalNodes: number }) => void;
  [key: string]: any;
}

export interface LayoutResult {
  success: boolean;
  nodes: Map<string, { x: number; y: number }>;
  edges: Map<string, any>;
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
  
  validateConfig(config: any): boolean;
}