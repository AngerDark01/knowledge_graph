// src/types/layout/edge.ts
import { LayoutNode } from './node';

export interface LayoutEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  data?: any;
}