import { CSSProperties } from 'react';

/**
 * 视图模式类型
 * - note: 笔记模式，用于显示详细内容
 * - container: 容器模式，用于组织和包含其他节点
 */
export type ViewMode = 'note' | 'container';

/**
 * 视图模式配置接口
 */
export interface ViewModeConfig {
  // 默认尺寸
  defaultWidth: number;
  defaultHeight: number;

  // 最小尺寸
  minWidth: number;
  minHeight: number;

  // 折叠状态尺寸（仅 note 模式）
  collapsedWidth?: number;
  collapsedHeight?: number;

  // 展开状态尺寸（仅 note 模式）
  expandedWidth?: number;
  expandedHeight?: number;

  // 是否自动调整大小（container 模式）
  autoResize?: boolean;

  // 内边距配置
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };

  // 子节点可见性逻辑
  shouldShowChildren: (expanded: boolean) => boolean;

  // 视觉样式
  icon: string;
  iconColor: string;
  borderColor: string;
  backgroundColor: string;
}

/**
 * 视图模式配置映射
 */
export const VIEW_MODE_CONFIGS: Record<ViewMode, ViewModeConfig> = {
  note: {
    defaultWidth: 350,
    defaultHeight: 280,
    minWidth: 300,
    minHeight: 240,
    collapsedWidth: 350,
    collapsedHeight: 280,
    expandedWidth: 600,
    expandedHeight: 450,
    autoResize: false,
    padding: {
      top: 16,
      right: 16,
      bottom: 16,
      left: 16,
    },
    shouldShowChildren: (expanded) => expanded,
    icon: 'document',
    iconColor: '#3B82F6', // blue-500
    borderColor: '#E5E7EB', // gray-200
    backgroundColor: '#FFFFFF',
  },
  container: {
    defaultWidth: 400,
    defaultHeight: 300,
    minWidth: 300,
    minHeight: 200,
    autoResize: true,
    padding: {
      top: 70, // 为标题栏留出空间
      right: 20,
      bottom: 20,
      left: 20,
    },
    shouldShowChildren: (expanded) => expanded,
    icon: 'folder',
    iconColor: '#8B5CF6', // purple-500
    borderColor: '#C4B5FD', // purple-200
    backgroundColor: '#F5F3FF', // purple-50
  },
};

/**
 * 视图模式转换配置
 */
export interface ViewModeTransition {
  from: ViewMode;
  to: ViewMode;
  transform: (node: any) => Partial<any>;
  validate?: (node: any) => boolean;
  onBeforeTransition?: (node: any) => void;
  onAfterTransition?: (node: any) => void;
}

/**
 * 获取视图模式配置
 */
export const getViewModeConfig = (mode: ViewMode): ViewModeConfig => {
  return VIEW_MODE_CONFIGS[mode];
};

/**
 * 获取默认尺寸
 */
export const getDefaultSize = (mode: ViewMode) => {
  const config = getViewModeConfig(mode);
  return {
    width: config.defaultWidth,
    height: config.defaultHeight,
  };
};

/**
 * 获取展开/折叠尺寸
 */
export const getExpandedSize = (mode: ViewMode, expanded: boolean) => {
  const config = getViewModeConfig(mode);

  if (mode === 'note') {
    return expanded
      ? { width: config.expandedWidth!, height: config.expandedHeight! }
      : { width: config.collapsedWidth!, height: config.collapsedHeight! };
  }

  return { width: config.defaultWidth, height: config.defaultHeight };
};

/**
 * 检查是否应该显示子节点
 */
export const shouldShowChildren = (mode: ViewMode, expanded: boolean): boolean => {
  const config = getViewModeConfig(mode);
  return config.shouldShowChildren(expanded);
};
