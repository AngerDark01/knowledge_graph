import { z } from 'zod';
import type { Node, Group, Edge } from '@/types/graph/models';

// ========== 用户模型 (预留设计) ==========
export interface User {
  id: string;
  name: string;
  avatar?: string;
  createdAt: Date;
}

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().optional(),
  createdAt: z.union([z.coerce.date(), z.string()])
    .transform((value) => {
      if (value instanceof Date) {
        return value;
      }
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date string');
      }
      return date;
    }),
});

// ========== 画布模型 ==========
export interface Canvas {
  id: string;
  name: string;
  parentId: string | null;
  children: string[];  // 子画布 ID 列表
  graphData: {
    nodes: (Node | Group)[];
    edges: Edge[];
  };
  viewportState: {
    x: number;
    y: number;
    zoom: number;
  };
  isCollapsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Group Schema (简化版，用于嵌套验证)
const GroupSchemaForCanvas = z.object({
  id: z.string(),
  type: z.literal('group'),
  position: z.object({ x: z.number(), y: z.number() }),
  title: z.string(),
  collapsed: z.boolean(),
  nodeIds: z.array(z.string()),
  boundary: z.object({
    minX: z.number(),
    minY: z.number(),
    maxX: z.number(),
    maxY: z.number(),
  }),
  createdAt: z.union([z.coerce.date(), z.string()])
    .transform((value) => {
      if (value instanceof Date) {
        return value;
      }
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date string');
      }
      return date;
    }),
  updatedAt: z.union([z.coerce.date(), z.string()])
    .transform((value) => {
      if (value instanceof Date) {
        return value;
      }
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date string');
      }
      return date;
    }),
}).passthrough(); // 允许额外字段

// Node Schema (简化版，用于嵌套验证)
const NodeSchemaForCanvas = z.object({
  id: z.string(),
  type: z.literal('node'),
  position: z.object({ x: z.number(), y: z.number() }),
  title: z.string(),
  createdAt: z.union([z.coerce.date(), z.string()])
    .transform((value) => {
      if (value instanceof Date) {
        return value;
      }
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date string');
      }
      return date;
    }),
  updatedAt: z.union([z.coerce.date(), z.string()])
    .transform((value) => {
      if (value instanceof Date) {
        return value;
      }
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date string');
      }
      return date;
    }),
}).passthrough(); // 允许额外字段

// Edge Schema (简化版)
const EdgeSchemaForCanvas = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  createdAt: z.union([z.coerce.date(), z.string()])
    .transform((value) => {
      if (value instanceof Date) {
        return value;
      }
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date string');
      }
      return date;
    }),
  updatedAt: z.union([z.coerce.date(), z.string()])
    .transform((value) => {
      if (value instanceof Date) {
        return value;
      }
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date string');
      }
      return date;
    }),
}).passthrough();

export const CanvasSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  parentId: z.string().nullable(),
  children: z.array(z.string()),
  graphData: z.object({
    nodes: z.array(z.union([NodeSchemaForCanvas, GroupSchemaForCanvas])),
    edges: z.array(EdgeSchemaForCanvas),
  }),
  viewportState: z.object({
    x: z.number(),
    y: z.number(),
    zoom: z.number(),
  }),
  isCollapsed: z.boolean(),
  createdAt: z.union([z.coerce.date(), z.string()])
    .transform((value) => {
      if (value instanceof Date) {
        return value;
      }
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date string');
      }
      return date;
    }),
  updatedAt: z.union([z.coerce.date(), z.string()])
    .transform((value) => {
      if (value instanceof Date) {
        return value;
      }
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date string');
      }
      return date;
    }),
});

// ========== 画布树节点 ==========
export interface CanvasTreeNode {
  id: string;
  name: string;
  isCollapsed: boolean;
  children: CanvasTreeNode[];
}

export const CanvasTreeNodeSchema: z.ZodType<CanvasTreeNode> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    isCollapsed: z.boolean(),
    children: z.array(CanvasTreeNodeSchema),
  })
);

// ========== 工作空间模型 ==========
export interface Workspace {
  userId: string;
  currentCanvasId: string;
  canvases: Canvas[];
  canvasTree: CanvasTreeNode[];
}

export const WorkspaceSchema = z.object({
  userId: z.string(),
  currentCanvasId: z.string(),
  canvases: z.array(CanvasSchema),
  canvasTree: z.array(CanvasTreeNodeSchema),
});

// ========== 默认值 ==========
export const DEFAULT_USER: User = {
  id: 'user_0',
  name: '默认用户',
  createdAt: new Date(),
};

export const DEFAULT_CANVAS: Canvas = {
  id: 'canvas_default',
  name: '默认画布',
  parentId: null,
  children: [],
  graphData: {
    nodes: [],
    edges: [],
  },
  viewportState: {
    x: 0,
    y: 0,
    zoom: 1,
  },
  isCollapsed: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};
