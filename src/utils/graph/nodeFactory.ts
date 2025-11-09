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

// 容器内边距常量（与 types.ts 保持一致）
const GROUP_PADDING = {
  top: 70,
  left: 20,
  right: 20,
  bottom: 20,
};

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
 * 计算在容器内创建新子节点的合理位置
 *
 * 策略：
 * 1. 优先使用父容器左上角 + padding 作为基础位置
 * 2. 如果已有子节点，计算一个不重叠的位置（稍微偏移）
 * 3. 确保新节点在容器边界内
 *
 * @param parent 父容器节点
 * @param existingChildren 已有的子节点列表
 * @param childSize 子节点的尺寸
 * @returns 子节点的初始位置（绝对坐标）
 */
export function calculateChildInitialPosition(
  parent: BaseNode,
  existingChildren: BaseNode[],
  childSize: { width: number; height: number }
): { x: number; y: number } {
  // 基础位置：父容器左上角 + padding
  const baseX = parent.position.x + GROUP_PADDING.left;
  const baseY = parent.position.y + GROUP_PADDING.top;

  // 如果没有子节点，直接返回基础位置
  if (existingChildren.length === 0) {
    return { x: baseX, y: baseY };
  }

  // 有子节点时，计算一个稍微偏移的位置，避免完全重叠
  // 策略：从基础位置开始，向右下方递增偏移
  const offsetStep = 20; // 每个子节点偏移的距离
  let offsetX = (existingChildren.length % 5) * offsetStep; // 最多偏移 5 次后重新开始
  let offsetY = Math.floor(existingChildren.length / 5) * offsetStep;

  let candidateX = baseX + offsetX;
  let candidateY = baseY + offsetY;

  // 确保不超出父容器边界
  const maxX = parent.position.x + parent.width - GROUP_PADDING.right - childSize.width;
  const maxY = parent.position.y + parent.height - GROUP_PADDING.bottom - childSize.height;

  // 如果超出边界，调整到边界内
  if (candidateX > maxX) {
    candidateX = baseX; // 回到基础位置的 X
  }
  if (candidateY > maxY) {
    candidateY = baseY; // 回到基础位置的 Y
  }

  return {
    x: Math.max(baseX, Math.min(candidateX, maxX)),
    y: Math.max(baseY, Math.min(candidateY, maxY)),
  };
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
    expanded: viewMode === 'note' ? false : true,
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
   *
   * 核心功能：
   * 1. 保存当前模式的状态
   * 2. 恢复目标模式的状态（如果有保存的状态）
   * 3. 确保状态完全一致，支持来回切换
   */
  static transform(node: BaseNode, targetMode: ViewMode): BaseNode {
    if (node.viewMode === targetMode) {
      console.warn(`Node ${node.id} is already in ${targetMode} mode`);
      return node;
    }

    console.log(`🔄 视图模式转换: ${node.viewMode} -> ${targetMode}`);

    const now = new Date();

    // 特殊处理
    if (targetMode === 'note') {
      // Container -> Note
      return this.transformToNote(node, now);
    } else {
      // Note -> Container
      return this.transformToContainer(node, now);
    }
  }

  /**
   * 转换为笔记模式 (Container -> Note)
   *
   * 步骤：
   * 1. 保存当前 Container 的状态到 containerState（只保存尺寸，不保存 expanded）
   * 2. 恢复之前保存的 noteState（如果有）
   * 3. 如果没有保存的 noteState，使用默认值
   */
  private static transformToNote(node: BaseNode, now: Date): BaseNode {
    const config = getViewModeConfig('note');

    // 1. 保存当前 Container 的状态（只保存尺寸）
    const containerState = {
      width: node.width,
      height: node.height,
    };

    console.log(`💾 保存 Container 状态:`, containerState);

    // 2. 恢复 Note 状态（如果有保存）或使用默认值
    let width: number;
    let height: number;
    let expanded: boolean;
    let customExpandedSize: { width: number; height: number } | undefined;

    if (node.noteState) {
      // 恢复之前保存的 Note 状态
      console.log(`♻️ 恢复 Note 状态:`, node.noteState);
      width = node.noteState.width;
      height = node.noteState.height;
      expanded = node.noteState.expanded;
      customExpandedSize = node.noteState.customExpandedSize;
    } else {
      // 使用默认的 Note 状态（首次转换为 Note）
      console.log(`🆕 使用默认 Note 状态`);
      width = config.collapsedWidth!;
      height = config.collapsedHeight!;
      expanded = false;
      customExpandedSize = undefined;
    }

    return {
      ...node,
      viewMode: 'note',
      width,
      height,
      expanded,
      customExpandedSize,
      containerState, // 保存 Container 状态
      updatedAt: now,
    };
  }

  /**
   * 转换为容器模式 (Note -> Container)
   *
   * 步骤：
   * 1. 保存当前 Note 的状态到 noteState
   * 2. 恢复之前保存的 containerState（如果有）
   * 3. 如果没有保存的 containerState，使用默认值
   *
   * 注意：Container 不需要 expanded 状态，子节点总是显示
   */
  private static transformToContainer(node: BaseNode, now: Date): BaseNode {
    const config = getViewModeConfig('container');

    // 1. 保存当前 Note 的状态
    const noteState = {
      width: node.width,
      height: node.height,
      expanded: node.expanded,
      customExpandedSize: node.customExpandedSize,
    };

    console.log(`💾 保存 Note 状态:`, noteState);

    // 2. 恢复 Container 状态（如果有保存）或使用默认值
    let width: number;
    let height: number;

    if (node.containerState) {
      // 恢复之前保存的 Container 状态
      console.log(`♻️ 恢复 Container 状态:`, node.containerState);
      width = node.containerState.width;
      height = node.containerState.height;
    } else {
      // 使用默认的 Container 状态（首次转换为 Container）
      console.log(`🆕 使用默认 Container 状态`);
      width = config.defaultWidth;
      height = config.defaultHeight;
    }

    return {
      ...node,
      viewMode: 'container',
      width,
      height,
      expanded: true,
      customExpandedSize: undefined,
      noteState,
      updatedAt: now,
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
 *
 * 同时更新保存的状态（noteState 或 containerState），
 * 确保下次切换回来时能恢复到最新状态
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

  const updatedNode: BaseNode = {
    ...node,
    expanded: newExpanded,
    width: newWidth,
    height: newHeight,
    updatedAt: new Date(),
  };

  if (node.viewMode === 'note' && node.noteState) {
    updatedNode.noteState = {
      ...node.noteState,
      expanded: newExpanded,
      width: newWidth,
      height: newHeight,
    };
  }

  return updatedNode;
};

/**
 * 保存自定义展开尺寸
 */
export const saveCustomExpandedSize = (node: BaseNode, width: number, height: number): BaseNode => {
  if (node.viewMode !== 'note') {
    console.warn('Custom expanded size only applies to note mode');
    return node;
  }

  const updatedNode: BaseNode = {
    ...node,
    customExpandedSize: { width, height },
    updatedAt: new Date(),
  };

  if (node.noteState) {
    updatedNode.noteState = {
      ...node.noteState,
      customExpandedSize: { width, height },
    };
  }

  return updatedNode;
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
