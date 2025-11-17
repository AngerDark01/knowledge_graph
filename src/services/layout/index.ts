// src/services/layout/index.ts
import { LayoutManager } from './LayoutManager';
import { GridCenterLayoutStrategy } from './strategies/GridCenterLayoutStrategy';
import { GroupAwareLayoutStrategy } from './strategies/GroupAwareLayoutStrategy';
import { EdgeOptimizationStrategy } from './strategies/EdgeOptimizationStrategy';
import { CompositeLayoutStrategy } from './strategies/CompositeLayoutStrategy';
import { GeometryUtils } from './utils/GeometryUtils';

export {
  LayoutManager,
  GridCenterLayoutStrategy,
  GroupAwareLayoutStrategy,
  EdgeOptimizationStrategy,
  CompositeLayoutStrategy,
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