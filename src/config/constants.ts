/**
 * 知识图谱编辑器 - 通用常量定义
 * 集中管理所有常量、尺寸、限制等配置
 */

// ========== Tailwind CSS 与数值映射 ==========
export const TAILWIND_SIZES = {
  h12: 48,  // Tailwind h-12 对应 48px (3rem)
  h10: 40,  // Tailwind h-10 对应 40px (2.5rem)
  h8: 32,   // Tailwind h-8 对应 32px (2rem)
  h6: 24,   // Tailwind h-6 对应 24px (1.5rem)
  // ... 可根据需要添加更多映射
} as const;

// ========== UI 尺寸配置 ==========
export const UI_DIMENSIONS = {
  // 尺寸
  NODE_DEFAULT_SIZE: { width: 350, height: 280 },
  GROUP_DEFAULT_SIZE: { width: 300, height: 200 },
  
  // 间距
  NODE_VISUAL_PADDING: 4,
  GROUP_HEADER_HEIGHT: TAILWIND_SIZES.h12,  // 48px 对应 h-12，与UI组件一致
  GROUP_DEFAULT_TITLE_HEIGHT: 48,  // 统一组件和布局中的标题栏高度
  GROUP_HEADER_PADDING_Y: 12,     // px-4 对应 16px 水平padding, 其他垂直间距
  
  // z-index
  Z_INDEX: {
    BASE_GROUP: 1,
    BASE_NODE: 2,
    NESTING_INCREMENT: 10,
    SELECTED_BOOST: 100,
    EDGE_DEFAULT: 0,
    EDGE_CROSS_GROUP: 5
  }
} as const;

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

// ========== 嵌套限制配置 ==========
export const NESTING_CONFIG = {
  /** 最大嵌套层数（从 0 开始，0 = 顶层） */
  MAX_DEPTH: 5,
  /** 是否启用循环嵌套检测 */
  ENABLE_CIRCULAR_CHECK: true,
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

// ========== 获取视觉样式函数 ==========
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