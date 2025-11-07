import { z } from 'zod';
import type { CSSProperties } from 'react';

/**
 * 视图模式类型
 */
export type ViewMode = 'note' | 'container';

/**
 * 统一节点模型 - BaseNode
 *
 * 设计理念：
 * - 不再区分 Node 和 Group，使用统一的数据结构
 * - 通过 viewMode 控制显示方式
 * - 通过 expanded 控制子节点可见性
 * - 使用 parentId 和 childrenIds 构建层级关系
 */
export interface BaseNode {
  // ==================== 基础属性 ====================
  id: string;
  position: { x: number; y: number };
  width: number;
  height: number;

  // ==================== 视图模式 ====================
  /**
   * 视图模式：决定节点如何显示
   * - note: 笔记模式，显示详细内容，可以展开/折叠
   * - container: 容器模式，显示为群组，包含子节点
   */
  viewMode: ViewMode;

  /**
   * 展开状态：控制子节点是否可见
   * - true: 展开，子节点可见
   * - false: 折叠，子节点隐藏
   */
  expanded: boolean;

  // ==================== 内容属性 ====================
  title: string;
  content?: string;
  summary?: string;
  tags?: string[];
  attributes?: Record<string, any>;

  // ==================== 层级关系 ====================
  /**
   * 父节点 ID
   * 用于构建层级关系，子节点不能超出父节点边界
   */
  parentId?: string;

  /**
   * 子节点 ID 列表
   * 有序列表，记录所有直接子节点
   */
  childrenIds: string[];

  // ==================== 状态属性 ====================
  selected?: boolean;
  dragging?: boolean;
  isEditing?: boolean;
  validationError?: string;

  // ==================== 样式属性 ====================
  style?: CSSProperties;

  /**
   * 用户自定义的展开尺寸（仅 note 模式）
   * 用户手动调整尺寸后保存
   */
  customExpandedSize?: { width: number; height: number };

  // ==================== 元数据 ====================
  createdAt: Date;
  updatedAt: Date;

  // ==================== ReactFlow 兼容性 ====================
  data?: Record<string, any>;
}

// ==================== 类型别名（方便使用） ====================
/**
 * Note 节点（viewMode = 'note'）
 */
export type Node = BaseNode & { viewMode: 'note' };

/**
 * Container 节点（viewMode = 'container'）
 */
export type Group = BaseNode & { viewMode: 'container' };

// ==================== Edge (边) 模型 ====================
export interface Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
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

// ==================== Zod 验证 Schema ====================
export const BaseNodeSchema = z.object({
  id: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  width: z.number().positive(),
  height: z.number().positive(),
  viewMode: z.enum(['note', 'container']),
  expanded: z.boolean(),
  title: z.string().min(1, 'Title cannot be empty'),
  content: z.string().optional(),
  summary: z.string().optional(),
  tags: z.array(z.string()).optional(),
  attributes: z.record(z.string(), z.any()).optional(),
  parentId: z.string().optional(),
  childrenIds: z.array(z.string()),
  selected: z.boolean().optional(),
  dragging: z.boolean().optional(),
  isEditing: z.boolean().optional(),
  validationError: z.string().optional(),
  style: z.any().optional(),
  customExpandedSize: z
    .object({
      width: z.number(),
      height: z.number(),
    })
    .optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  data: z.record(z.string(), z.any()).optional(),
});

export const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  label: z.string().optional(),
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

// ==================== 类型守卫 ====================
/**
 * 检查是否为有效的 BaseNode
 */
export const isBaseNode = (node: any): node is BaseNode => {
  return (
    typeof node === 'object' &&
    node !== null &&
    typeof node.id === 'string' &&
    typeof node.title === 'string' &&
    ['note', 'container'].includes(node.viewMode) &&
    typeof node.expanded === 'boolean' &&
    Array.isArray(node.childrenIds)
  );
};

/**
 * 检查节点是否为容器模式
 */
export const isContainerNode = (node: BaseNode): node is Group => {
  return node.viewMode === 'container';
};

/**
 * 检查节点是否为笔记模式
 */
export const isNoteNode = (node: BaseNode): node is Node => {
  return node.viewMode === 'note';
};

/**
 * 检查节点是否有子节点
 */
export const hasChildren = (node: BaseNode): boolean => {
  return node.childrenIds.length > 0;
};

/**
 * 检查节点是否为根节点（无父节点）
 */
export const isRootNode = (node: BaseNode): boolean => {
  return !node.parentId;
};

/**
 * 检查节点是否应该显示子节点
 */
export const shouldShowChildren = (node: BaseNode): boolean => {
  return hasChildren(node) && node.expanded;
};
