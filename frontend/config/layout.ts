/**
 * 知识图谱编辑器 - 布局配置
 */

import { UI_DIMENSIONS } from './constants';

// ========== 布局配置 ==========
export const LAYOUT_CONFIG = {
  general: {
    enableAnimation: true,
    animationDuration: 500,
    debugMode: false
  },
  nodeSize: {
    defaultNode: { width: UI_DIMENSIONS.NODE_DEFAULT_SIZE.width, height: UI_DIMENSIONS.NODE_DEFAULT_SIZE.height },  // 符合NoteNode的初始尺寸
    groupNode: { width: UI_DIMENSIONS.GROUP_DEFAULT_SIZE.width, height: UI_DIMENSIONS.GROUP_DEFAULT_SIZE.height },   // 符合GroupNode的初始尺寸
    minWidth: 100,
    minHeight: 80,
    maxWidth: 800,
    maxHeight: 600
  },
  weight: {
    areaWeight: 0.3,
    totalEdgesWeight: 0.4,
    crossEdgesWeight: 0.2,
    sameEdgesWeight: 0.1,
    maxArea: 100000,
    maxEdges: 20,
    coreThreshold: 0.7,
    secondaryThreshold: 0.4
  },
  collision: {
    minNodeGap: 20,
    minGroupPadding: 30,
    maxIterations: 100,
    repulsionForce: 0.5,
    convergenceThreshold: 1.0,
    boundaryMargin: 10
  },
  layoutAlgorithm: {
    gridSpacing: 20,
    centerWeight: 0.2,
    boundaryExpansion: 1.1
  },
  group: {
    paddingTop: 48,        // 统一使用48px，与UI组件一致
    paddingRight: 20,
    paddingBottom: 20,
    paddingLeft: 20,
    titleHeight: UI_DIMENSIONS.GROUP_DEFAULT_TITLE_HEIGHT,       // Group标题高度，与UI组件一致
    repositionThreshold: 50,
    interLevelSpacing: 100,
    levelAlignment: 'center' as const,
    boundaryExpansionFactor: 1.2,
    maxIteration: 5
  },
  recursive: {
    maxDepth: 10,
    levelSpacing: 50,
    boundaryExpansionFactor: 1.2,
    shouldMergeSingleChildGroup: true,
    maxNodesPerGroup: 10,
    balanceThreshold: 3,
  },
  performance: {
    maxCacheSize: 50,
    cacheEnabled: true,
    cacheMaxAge: 300000, // 5 minutes
    baseLayoutTime: 10,
    nodeTimeMultiplier: 0.5,
    depthTimeMultiplier: 2.0
  },
  memory: {
    limit: 512 * 1024 * 1024 // 512MB
  }
} as const;

// ========== 间距和边距配置 ==========
export const PADDING_CONFIG = {
  /** 群组内边距 */
  GROUP_PADDING: {
    top: 70,    // 统一使用48px，与UI组件一致
    left: 20,
    right: 20,
    bottom: 20,
  },
  /** 节点外框的额外空间（阴影、边框等视觉效果） */
  NODE_VISUAL_PADDING: UI_DIMENSIONS.NODE_VISUAL_PADDING,
} as const;

// ========== z-index 层级配置 ==========
export const Z_INDEX_CONFIG = {
  /** 基础 z-index */
  BASE_GROUP: UI_DIMENSIONS.Z_INDEX.BASE_GROUP,
  BASE_NODE: UI_DIMENSIONS.Z_INDEX.BASE_NODE,
  /** 每增加一层嵌套，z-index 增量 */
  NESTING_INCREMENT: UI_DIMENSIONS.Z_INDEX.NESTING_INCREMENT,
  /** 选中状态额外增量 */
  SELECTED_BOOST: UI_DIMENSIONS.Z_INDEX.SELECTED_BOOST,
  /** 边的 z-index */
  EDGE_DEFAULT: UI_DIMENSIONS.Z_INDEX.EDGE_DEFAULT,
  EDGE_CROSS_GROUP: UI_DIMENSIONS.Z_INDEX.EDGE_CROSS_GROUP,
} as const;

/**
 * 计算节点的 z-index
 * @param nestingDepth 嵌套深度（0 = 顶层）
 * @param isGroup 是否为群组节点
 * @param isSelected 是否被选中
 */
export const calculateZIndex = (
  nestingDepth: number,
  isGroup: boolean,
  isSelected: boolean = false
): number => {
  const base = isGroup ? Z_INDEX_CONFIG.BASE_GROUP : Z_INDEX_CONFIG.BASE_NODE;
  const nestingBoost = nestingDepth * Z_INDEX_CONFIG.NESTING_INCREMENT;
  const selectedBoost = isSelected ? Z_INDEX_CONFIG.SELECTED_BOOST : 0;
  return base + nestingBoost + selectedBoost;
};

// 导出布局配置类型
export type LayoutConfig = typeof LAYOUT_CONFIG;