// src/services/layout/algorithms/index.ts

// 算法接口和类型
export type {
  ILayoutAlgorithm,
  GridConfig,
  LayoutAlgorithmOptions
} from './ILayoutAlgorithm';

// 网格布局算法
export { GridAlgorithm } from './GridAlgorithm';
export { GridCenterAlgorithm } from './GridCenterAlgorithm';

// 边优化算法
export { EdgeOptimizer } from './EdgeOptimizer';
export type { OptimizedEdge, HandlePosition } from './EdgeOptimizer';
