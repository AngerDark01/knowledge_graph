// src/services/layout/index.ts
import { LayoutManager } from './LayoutManager';
import { EdgeOptimizer } from './algorithms/EdgeOptimizer';
import { GeometryUtils } from './utils/GeometryUtils';
import { ELKLayoutStrategy } from './strategies/ELKLayoutStrategy';
import { ELKGraphConverter, ELKConfigBuilder } from './utils';

export {
  // 核心管理器
  LayoutManager,

  // ELK布局策略
  ELKLayoutStrategy,

  // 工具和算法
  EdgeOptimizer,
  GeometryUtils,
  ELKGraphConverter,
  ELKConfigBuilder
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