// src/types/layout/strategy.ts
import { LayoutNode } from './node';
import { LayoutEdge } from './edge';

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
}

export interface LayoutEdgeUpdate {
  sourceHandle?: string;
  targetHandle?: string;
}

export type ELKLayoutOptionValue = string | number | boolean;
export type ELKLayoutOptions = Record<string, ELKLayoutOptionValue>;

export interface LayoutOptions {
  strategy?: string;
  animate?: boolean;
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
