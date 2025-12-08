/**
 * 知识图谱编辑器 - 主配置聚合文件
 *
 * 将所有配置模块聚合在此，以简化导入
 */

// 从新的配置模块导入
import { NESTING_CONFIG, VALIDATION_CONFIG, HISTORY_CONFIG, CANVAS_CONFIG, EDGE_CONFIG, VISUAL_STYLE_CONFIG } from './constants';
import { LAYOUT_CONFIG, PADDING_CONFIG, Z_INDEX_CONFIG, calculateZIndex } from './layout';
import { ELKConfigBuilder } from './elk';

// 导出所有配置以简化导入
export {
  NESTING_CONFIG,
  VALIDATION_CONFIG,
  HISTORY_CONFIG,
  CANVAS_CONFIG,
  EDGE_CONFIG,
  VISUAL_STYLE_CONFIG,
  LAYOUT_CONFIG,
  PADDING_CONFIG,
  Z_INDEX_CONFIG,
  calculateZIndex,
  ELKConfigBuilder
};

// 从配置中导出，方便使用
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

// ========== 为向后兼容保留的配置 ==========
import { UI_DIMENSIONS, EDGE_OPTIMIZATION_CONFIG } from './constants';

// 重新创建 NODE_SIZES 以保持向后兼容
export const NODE_SIZES = {
  /** 普通节点默认尺寸 */
  NOTE: {
    DEFAULT_WIDTH: UI_DIMENSIONS.NODE_DEFAULT_SIZE.width,
    DEFAULT_HEIGHT: UI_DIMENSIONS.NODE_DEFAULT_SIZE.height,
    /** 展开状态尺寸 */
    EXPANDED_WIDTH: 600,
    EXPANDED_HEIGHT: 450,
    /** 最小尺寸 */
    MIN_WIDTH: LAYOUT_CONFIG.nodeSize.minWidth,
    MIN_HEIGHT: LAYOUT_CONFIG.nodeSize.minHeight,
  },
  /** 群组节点默认尺寸 */
  GROUP: {
    DEFAULT_WIDTH: UI_DIMENSIONS.GROUP_DEFAULT_SIZE.width,
    DEFAULT_HEIGHT: UI_DIMENSIONS.GROUP_DEFAULT_SIZE.height,
    /** 最小尺寸 */
    MIN_WIDTH: LAYOUT_CONFIG.nodeSize.minWidth,
    MIN_HEIGHT: LAYOUT_CONFIG.nodeSize.minHeight,
  },
} as const;

// 导出 UI_DIMENSIONS 以提供直接访问
export { UI_DIMENSIONS };

// 导出边优化配置
export { EDGE_OPTIMIZATION_CONFIG };

