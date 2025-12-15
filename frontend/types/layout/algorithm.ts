// src/types/layout/algorithm.ts
import { LayoutNode } from './node';
import { LayoutEdge } from './edge';

export interface IWeightCalculator {
  calculate(node: LayoutNode, edges: LayoutEdge[]): number;
}

export interface ICollisionDetector {
  detect(nodes: LayoutNode[]): { node1Id: string; node2Id: string }[];
  resolve(collisions: { node1Id: string; node2Id: string }[], nodes: LayoutNode[]): LayoutNode[];
}