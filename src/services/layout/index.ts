// src/services/layout/index.ts
import { LayoutManager } from './LayoutManager';
import { EdgeOptimizer } from './algorithms/EdgeOptimizer';
import { GeometryUtils } from './utils/GeometryUtils';

// 布局策略
import { GroupLayoutStrategy } from './strategies/GroupLayoutStrategy';
import { CanvasLayoutStrategy } from './strategies/CanvasLayoutStrategy';
import { RecursiveLayoutStrategy } from './strategies/RecursiveLayoutStrategy';

export {
  // 核心管理器
  LayoutManager,

  // 布局策略
  GroupLayoutStrategy,
  CanvasLayoutStrategy,
  RecursiveLayoutStrategy,

  // 工具和算法
  EdgeOptimizer,
  GeometryUtils
};

// 导出类型
export type {
  ILayoutManager
} from './LayoutManager';

export type {
  ILayoutStrategy,
  LayoutResult,
  LayoutOptions
} from './types/layoutTypes';

export {
  LAYOUT_CONFIG
} from '../../config/graph.config';

export default LayoutManager;