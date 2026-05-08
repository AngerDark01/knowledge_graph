// src/types/layout/node.ts
export interface LayoutNode {
  id: string;
  type: 'node' | 'group';
  position: { x: number; y: number };
  width: number;
  height: number;
  parentId?: string;
  children?: LayoutNode[];
  isGroup: boolean;
  data: Record<string, unknown>;
}
