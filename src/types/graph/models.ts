import { z } from 'zod';

export enum BlockEnum {
  NODE = 'node',
  GROUP = 'group'
}

export interface CommonNodeType<T = any> {
  id: string;
  type: BlockEnum;
  position: { x: number; y: number };
  data?: T;
  width?: number;
  height?: number;
  selected?: boolean;
  dragging?: boolean;
  parentId?: string; // 用于嵌套节点
  [key: string]: any;
}

export interface Node extends CommonNodeType {
  type: BlockEnum.NODE;
  title: string;
  content?: string;
  groupId?: string;
  validationError?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Group extends CommonNodeType {
  type: BlockEnum.GROUP;
  title: string;
  content?: string;
  collapsed: boolean;
  nodeIds: string[];
  boundary: { minX: number; minY: number; maxX: number; maxY: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  label?: string;
  groupId?: string;
  style?: React.CSSProperties;
  createdAt: Date;
  updatedAt: Date;
}

// Zod 验证 schema
export const NodeSchema = z.object({
  id: z.string(),
  type: z.literal(BlockEnum.NODE),
  position: z.object({
    x: z.number(),
    y: z.number()
  }),
  title: z.string().min(1),
  content: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  groupId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GroupSchema = z.object({
  id: z.string(),
  type: z.literal(BlockEnum.GROUP),
  position: z.object({
    x: z.number(),
    y: z.number()
  }),
  title: z.string().min(1),
  content: z.string().optional(),
  collapsed: z.boolean(),
  nodeIds: z.array(z.string()),
  boundary: z.object({
    minX: z.number(),
    minY: z.number(),
    maxX: z.number(),
    maxY: z.number()
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
  groupId: z.string().optional(),
  style: z.any().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});