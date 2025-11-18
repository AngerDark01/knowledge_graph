import { z } from 'zod';
import type { CSSProperties } from 'react';

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
  attributes?: Record<string, any>; // 结构化属性
  tags?: string[]; // 标签
  summary?: string; // 摘要
  isEditing?: boolean; // 编辑状态
  groupId?: string;
  validationError?: string;
  isExpanded?: boolean; // 是否展开状态
  customExpandedSize?: { width: number; height: number }; // 用户自定义的展开尺寸
  style?: CSSProperties; // 样式属性
  childNodeIds?: string[]; // 🆕 子节点ID列表（用于嵌套布局）
  createdAt: Date;
  updatedAt: Date;
}

export interface Group extends CommonNodeType {
  type: BlockEnum.GROUP;
  title: string;
  content?: string;
  attributes?: Record<string, any>; // 结构化属性
  tags?: string[]; // 标签
  summary?: string; // 摘要
  isEditing?: boolean; // 编辑状态
  collapsed: boolean;
  nodeIds: string[];
  boundary: { minX: number; minY: number; maxX: number; maxY: number };
  style?: CSSProperties; // 样式属性
  createdAt: Date;
  updatedAt: Date;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  groupId?: string;
  style?: CSSProperties;
  data?: {
    color?: string;
    strokeWidth?: number;
    // 跨群关系相关属性
    isCrossGroup?: boolean;        // 是否为跨群关系
    sourceGroupId?: string;        // 源节点所属群组ID
    targetGroupId?: string;        // 目标节点所属群组ID
    // 关系样式属性
    strokeDasharray?: string;      // 虚线样式
    // 关系属性
    weight?: number;               // 关系权重
    strength?: number;             // 关系强度
    direction?: 'unidirectional' | 'bidirectional' | 'undirected'; // 方向性
    // 自定义属性
    customProperties?: Record<string, any>;
  };
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
  attributes: z.record(z.string(), z.any()).optional(),
  tags: z.array(z.string()).optional(),
  summary: z.string().optional(),
  isEditing: z.boolean().optional(),
  isExpanded: z.boolean().optional(),
  customExpandedSize: z.object({
    width: z.number(),
    height: z.number()
  }).optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  groupId: z.string().optional(),
  childNodeIds: z.array(z.string()).optional(), // 🆕 子节点ID列表
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
  attributes: z.record(z.string(), z.any()).optional(),
  tags: z.array(z.string()).optional(),
  summary: z.string().optional(),
  isEditing: z.boolean().optional(),
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
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  label: z.string().optional(),
  groupId: z.string().optional(),
  style: z.any().optional(),
  data: z.object({
    color: z.string().optional(),
    strokeWidth: z.number().optional(),
    isCrossGroup: z.boolean().optional(),
    sourceGroupId: z.string().optional(),
    targetGroupId: z.string().optional(),
    strokeDasharray: z.string().optional(),
    weight: z.number().optional(),
    strength: z.number().optional(),
    direction: z.enum(['unidirectional', 'bidirectional', 'undirected']).optional(),
    customProperties: z.record(z.string(), z.any()).optional(),
  }).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});