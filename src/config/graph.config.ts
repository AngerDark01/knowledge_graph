/**
 * 知识图谱编辑器 - 配置文件
 * 集中管理所有常量、尺寸、限制等配置
 */

// ========== 嵌套限制配置 ==========
export const NESTING_CONFIG = {
  /** 最大嵌套层数（从 0 开始，0 = 顶层） */
  MAX_DEPTH: 5,
  /** 是否启用循环嵌套检测 */
  ENABLE_CIRCULAR_CHECK: true,
} as const;

// ========== 节点尺寸配置 ==========
export const NODE_SIZES = {
  /** 普通节点默认尺寸 */
  NOTE: {
    DEFAULT_WIDTH: 350,
    DEFAULT_HEIGHT: 280,
    /** 展开状态尺寸 */
    EXPANDED_WIDTH: 600,
    EXPANDED_HEIGHT: 450,
    /** 最小尺寸 */
    MIN_WIDTH: 350,
    MIN_HEIGHT: 280,
  },
  /** 群组节点默认尺寸 */
  GROUP: {
    DEFAULT_WIDTH: 400,
    DEFAULT_HEIGHT: 350,
    /** 最小尺寸 */
    MIN_WIDTH: 350,
    MIN_HEIGHT: 280,
  },
} as const;

// ========== 间距和边距配置 ==========
export const PADDING_CONFIG = {
  /** 群组内边距（保持原有值） */
  GROUP_PADDING: {
    top: 70,    // 标题栏高度 + 额外间距
    left: 20,
    right: 20,
    bottom: 20,
  },
  /** 节点外框的额外空间（阴影、边框等视觉效果） */
  NODE_VISUAL_PADDING: 4,
} as const;

// ========== 网格布局配置 ==========
export const GRID_LAYOUT = {
  /** 每行节点数量 */
  NODES_PER_ROW: 2,
  /** 水平间距 */
  HORIZONTAL_SPACING: 400,
  /** 垂直间距 */
  VERTICAL_SPACING: 320,
  /** 群组内第一个节点的起始偏移 */
  INITIAL_OFFSET: {
    x: 50,
    y: 100,
  },
} as const;

// ========== z-index 层级配置 ==========
export const Z_INDEX_CONFIG = {
  /** 基础 z-index */
  BASE_GROUP: 1,
  BASE_NODE: 2,
  /** 每增加一层嵌套，z-index 增量 */
  NESTING_INCREMENT: 10,
  /** 选中状态额外增量 */
  SELECTED_BOOST: 100,
  /** 边的 z-index */
  EDGE_DEFAULT: 0,
  EDGE_CROSS_GROUP: 5,
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

// ========== 验证限制配置 ==========
export const VALIDATION_CONFIG = {
  /** 标题最大长度 */
  MAX_TITLE_LENGTH: 100,
  /** 内容最大长度 */
  MAX_CONTENT_LENGTH: 10000,
  /** 摘要最大长度 */
  MAX_SUMMARY_LENGTH: 500,
  /** 标签最大数量 */
  MAX_TAGS_COUNT: 20,
  /** 单个标签最大长度 */
  MAX_TAG_LENGTH: 50,
} as const;

// ========== 视觉区分策略配置 ==========
export const VISUAL_STYLE_CONFIG = {
  /** 是否启用群组嵌套的视觉区分 */
  enabled: true,
  /** 视觉区分策略: 'color' | 'opacity' | 'border' | 'none' */
  strategy: 'color' as 'color' | 'opacity' | 'border' | 'none',

  /** 颜色方案（按嵌套层级） */
  colors: [
    'bg-blue-50 border-blue-200',      // 层级 0
    'bg-purple-50 border-purple-200',  // 层级 1
    'bg-green-50 border-green-200',    // 层级 2
    'bg-yellow-50 border-yellow-200',  // 层级 3
    'bg-pink-50 border-pink-200',      // 层级 4
    'bg-indigo-50 border-indigo-200',  // 层级 5
  ],

  /** 透明度方案（按嵌套层级） */
  opacities: [0.7, 0.6, 0.5, 0.4, 0.3, 0.2],

  /** 边框方案（按嵌套层级） */
  borders: [
    'border-2 border-blue-400',
    'border-2 border-purple-400',
    'border-2 border-green-400',
    'border-2 border-yellow-400',
    'border-2 border-pink-400',
    'border-2 border-indigo-400',
  ],
} as const;

/**
 * 获取群组的视觉样式类名
 * @param nestingDepth 嵌套深度
 */
export const getGroupVisualStyle = (nestingDepth: number): string => {
  if (!VISUAL_STYLE_CONFIG.enabled || VISUAL_STYLE_CONFIG.strategy === 'none') {
    return '';
  }

  const index = nestingDepth % 6; // 循环使用样式

  switch (VISUAL_STYLE_CONFIG.strategy) {
    case 'color':
      return VISUAL_STYLE_CONFIG.colors[index];
    case 'border':
      return VISUAL_STYLE_CONFIG.borders[index];
    case 'opacity':
      // 透明度通过内联样式设置
      return '';
    default:
      return '';
  }
};

/**
 * 获取群组的透明度
 * @param nestingDepth 嵌套深度
 */
export const getGroupOpacity = (nestingDepth: number): number | undefined => {
  if (!VISUAL_STYLE_CONFIG.enabled || VISUAL_STYLE_CONFIG.strategy !== 'opacity') {
    return undefined;
  }
  const index = nestingDepth % VISUAL_STYLE_CONFIG.opacities.length;
  return VISUAL_STYLE_CONFIG.opacities[index];
};

// ========== 历史记录配置 ==========
export const HISTORY_CONFIG = {
  /** 最大历史记录数量 */
  MAX_SIZE: 50,
} as const;

// ========== 画布配置 ==========
export const CANVAS_CONFIG = {
  /** 默认缩放级别 */
  DEFAULT_ZOOM: 1,
  /** 最小缩放 */
  MIN_ZOOM: 0.1,
  /** 最大缩放 */
  MAX_ZOOM: 2,
  /** 默认视口位置 */
  DEFAULT_VIEWPORT: {
    x: 0,
    y: 0,
    zoom: 1,
  },
} as const;

// ========== 边配置 ==========
export const EDGE_CONFIG = {
  /** 默认边颜色 */
  DEFAULT_COLOR: '#000',
  /** 跨群组边颜色 */
  CROSS_GROUP_COLOR: '#FFA500',
  /** 默认线宽 */
  DEFAULT_STROKE_WIDTH: 1,
  /** 跨群组边线宽 */
  CROSS_GROUP_STROKE_WIDTH: 2,
  /** 跨群组边虚线样式 */
  CROSS_GROUP_DASH_ARRAY: '5,5',
} as const;

// ========== 边优化配置 ==========
export const EDGE_OPTIMIZATION_CONFIG = {
  /** 是否启用边优化 */
  ENABLED: true,
  /** 角度阈值（用于确定连接点方向） */
  ANGLE_THRESHOLDS: {
    /** π/4，用于判断是水平还是垂直方向 */
    QUADRANT: Math.PI / 4,
  },
  /** 防抖延迟（毫秒） - 拖拽时避免频繁计算 */
  DEBOUNCE_DELAY: 100,
  /** 批量优化时的性能阈值 */
  PERFORMANCE: {
    /** 边数量超过此值时启用性能优化模式 */
    BATCH_THRESHOLD: 100,
    /** 使用 requestIdleCallback 的边数量阈值 */
    IDLE_CALLBACK_THRESHOLD: 50,
  },
} as const;

// ========== 布局配置 ==========
export const LAYOUT_CONFIG = {
  general: {
    enableAnimation: true,
    animationDuration: 500,
    debugMode: false
  },
  nodeSize: {
    defaultNode: { width: 350, height: 280 },  // 符合NoteNode的初始尺寸
    groupNode: { width: 300, height: 200 },   // 符合GroupNode的初始尺寸
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
    paddingTop: 40,        // 为Group标题预留空间
    paddingRight: 20,
    paddingBottom: 20,
    paddingLeft: 20,
    titleHeight: 40,       // Group标题高度
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
};

// ========== 导出所有常量的快捷访问 ==========
export const {
  GROUP_PADDING,
  NODE_VISUAL_PADDING,
} = PADDING_CONFIG;

export const {
  MAX_DEPTH,
  ENABLE_CIRCULAR_CHECK,
} = NESTING_CONFIG;

// 导出布局配置类型
export type LayoutConfig = typeof LAYOUT_CONFIG;
