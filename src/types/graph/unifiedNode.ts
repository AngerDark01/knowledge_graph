import { z } from 'zod';
import type { CSSProperties } from 'react';
import { ViewMode } from './viewModes';

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

  // ==================== 兼容性 ====================
  /**
   * 用于与 ReactFlow 集成
   */
  data?: Record<string, any>;
}

/**
 * 节点创建参数
 * 用于创建新节点，提供默认值
 */
export interface CreateNodeParams {
  id?: string;
  position: { x: number; y: number };
  title: string;
  viewMode?: ViewMode;
  parentId?: string;
  content?: string;
  tags?: string[];
  attributes?: Record<string, any>;
}

/**
 * 节点更新参数
 * 允许部分更新
 */
export type UpdateNodeParams = Partial<BaseNode>;

/**
 * Zod 验证 Schema
 */
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

/**
 * 类型守卫：检查是否为有效的 BaseNode
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
 * 类型守卫：检查节点是否为容器模式
 */
export const isContainerNode = (node: BaseNode): boolean => {
  return node.viewMode === 'container';
};

/**
 * 类型守卫：检查节点是否为笔记模式
 */
export const isNoteNode = (node: BaseNode): boolean => {
  return node.viewMode === 'note';
};

/**
 * 类型守卫：检查节点是否有子节点
 */
export const hasChildren = (node: BaseNode): boolean => {
  return node.childrenIds.length > 0;
};

/**
 * 类型守卫：检查节点是否为根节点（无父节点）
 */
export const isRootNode = (node: BaseNode): boolean => {
  return !node.parentId;
};

/**
 * 类型守卫：检查节点是否应该显示子节点
 */
export const shouldShowChildren = (node: BaseNode): boolean => {
  return hasChildren(node) && node.expanded;
};
