// src/types/layout/strategy.ts
import { LayoutNode } from './node';
import { LayoutEdge } from './edge';

export interface LayoutOptions {
  strategy?: string;
  animate?: boolean;
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