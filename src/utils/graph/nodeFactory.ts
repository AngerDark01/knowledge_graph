/**
 * 节点工厂 - 创建和转换节点
 *
 * 职责：
 * 1. 创建新节点
 * 2. 视图模式转换
 * 3. 验证节点数据
 */

import { BaseNode, BaseNodeSchema, ViewMode } from '@/types/graph/models';
import { getDefaultSize, getViewModeConfig } from '@/types/graph/viewModes';
import { nanoid } from 'nanoid';

/**
 * 节点创建参数
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
 * 创建新节点
 */
export const createNode = (params: CreateNodeParams): BaseNode => {
  const viewMode = params.viewMode || 'note';
  const defaultSize = getDefaultSize(viewMode);

  const node: BaseNode = {
    id: params.id || nanoid(),
    position: params.position,
    width: defaultSize.width,
    height: defaultSize.height,
    viewMode,
    expanded: false, // 默认折叠
    title: params.title,
    content: params.content,
    tags: params.tags,
    attributes: params.attributes,
    parentId: params.parentId,
    childrenIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // 验证节点数据
  const validation = BaseNodeSchema.safeParse(node);
  if (!validation.success) {
    console.error('Node validation failed:', validation.error);
    throw new Error('Invalid node data');
  }

  return node;
};

/**
 * 视图模式转换器
 */
export class ViewModeTransformer {
  /**
   * 转换视图模式
   */
  static transform(node: BaseNode, targetMode: ViewMode): BaseNode {
    if (node.viewMode === targetMode) {
      console.warn(`Node ${node.id} is already in ${targetMode} mode`);
      return node;
    }

    const config = getViewModeConfig(targetMode);
    const now = new Date();

    // 基础转换
    const transformed: BaseNode = {
      ...node,
      viewMode: targetMode,
      expanded: false, // 转换后默认折叠
      width: config.defaultWidth,
      height: config.defaultHeight,
      updatedAt: now,
    };

    // 特殊处理
    if (targetMode === 'note') {
      return this.transformToNote(transformed);
    } else {
      return this.transformToContainer(transformed);
    }
  }

  /**
   * 转换为笔记模式
   */
  private static transformToNote(node: BaseNode): BaseNode {
    const config = getViewModeConfig('note');

    return {
      ...node,
      width: config.collapsedWidth!,
      height: config.collapsedHeight!,
      // 清除容器特定的属性
      customExpandedSize: undefined,
    };
  }

  /**
   * 转换为容器模式
   */
  private static transformToContainer(node: BaseNode): BaseNode {
    const config = getViewModeConfig('container');

    return {
      ...node,
      width: config.defaultWidth,
      height: config.defaultHeight,
      // 清除笔记特定的属性
      customExpandedSize: undefined,
    };
  }

  /**
   * 批量转换
   */
  static transformBatch(nodes: BaseNode[], targetMode: ViewMode): BaseNode[] {
    return nodes.map((node) => this.transform(node, targetMode));
  }
}

/**
 * 切换展开/折叠状态
 */
export const toggleExpanded = (node: BaseNode, customSize?: { width: number; height: number }): BaseNode => {
  const newExpanded = !node.expanded;
  const config = getViewModeConfig(node.viewMode);

  let newWidth = node.width;
  let newHeight = node.height;

  if (node.viewMode === 'note') {
    // Note 模式：根据展开状态改变尺寸
    if (newExpanded) {
      // 展开：使用自定义尺寸或默认展开尺寸
      if (customSize) {
        newWidth = customSize.width;
        newHeight = customSize.height;
      } else if (node.customExpandedSize) {
        newWidth = node.customExpandedSize.width;
        newHeight = node.customExpandedSize.height;
      } else {
        newWidth = config.expandedWidth!;
        newHeight = config.expandedHeight!;
      }
    } else {
      // 折叠：使用折叠尺寸
      newWidth = config.collapsedWidth!;
      newHeight = config.collapsedHeight!;
    }
  }
  // Container 模式：不改变尺寸（由子节点自动决定）

  return {
    ...node,
    expanded: newExpanded,
    width: newWidth,
    height: newHeight,
    updatedAt: new Date(),
  };
};

/**
 * 保存自定义展开尺寸
 */
export const saveCustomExpandedSize = (node: BaseNode, width: number, height: number): BaseNode => {
  if (node.viewMode !== 'note') {
    console.warn('Custom expanded size only applies to note mode');
    return node;
  }

  return {
    ...node,
    customExpandedSize: { width, height },
    updatedAt: new Date(),
  };
};

/**
 * 克隆节点（深拷贝）
 */
export const cloneNode = (node: BaseNode, newId?: string): BaseNode => {
  return {
    ...node,
    id: newId || nanoid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    // 不克隆子节点关系
    childrenIds: [],
    parentId: undefined,
  };
};

/**
 * 验证节点数据
 */
export const validateNode = (node: BaseNode): { valid: boolean; errors: string[] } => {
  const validation = BaseNodeSchema.safeParse(node);

  if (validation.success) {
    return { valid: true, errors: [] };
  }

  const errors = validation.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);

  return { valid: false, errors };
};
