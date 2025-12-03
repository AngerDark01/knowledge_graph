/**
 * ELK 布局算法的配置
 *
 * ELK (Eclipse Layout Kernel) 是一个专业的图布局引擎
 * 支持 140+ 配置选项，这里列出最常用的几个
 */

/**
 * 全局布局配置
 * 用于布局所有顶层节点
 */
export const GLOBAL_LAYOUT_CONFIG = {
  'elk.algorithm': 'org.eclipse.elk.layered',
  'elk.direction': 'DOWN',
  'elk.spacing.nodeNode': 100,
  'elk.spacing.edgeEdge': 50,
  'elk.spacing.edgeNode': 30,
  'elk.spacing.componentComponent': 100,

  // 关键：INCLUDE_CHILDREN 会递归处理所有嵌套层级
  'elk.hierarchyHandling': 'INCLUDE_CHILDREN',

  'elk.padding': '[top=40, left=20, bottom=20, right=20]',
  'elk.edgeRouting': 'ORTHOGONAL',
  'elk.layered.nodePlacement.strategy': 'SIMPLE',
  'elk.layered.cycleBreaking.strategy': 'DFS',
  'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
  'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES'
};

/**
 * 群组内部布局配置
 * 用于布局容器内部的子节点
 */
export const GROUP_INTERNAL_CONFIG = {
  'elk.algorithm': 'org.eclipse.elk.layered',
  'elk.direction': 'DOWN',
  'elk.spacing.nodeNode': 80,
  'elk.spacing.edgeEdge': 40,
  'elk.spacing.edgeNode': 25,

  // 群组内部使用 padding 为标题和边框留空间
  'elk.padding': '[top=50, left=30, bottom=30, right=30]',

  'elk.edgeRouting': 'ORTHOGONAL',
  'elk.layered.nodePlacement.strategy': 'SIMPLE'
};

/**
 * 局部布局配置
 * 用于布局选中节点的子图
 */
export const LOCAL_LAYOUT_CONFIG = {
  'elk.algorithm': 'org.eclipse.elk.layered',
  'elk.direction': 'DOWN',
  'elk.spacing.nodeNode': 90,
  'elk.spacing.edgeEdge': 45,
  'elk.spacing.edgeNode': 28,
  'elk.padding': '[top=40, left=20, bottom=20, right=20]',
  'elk.edgeRouting': 'ORTHOGONAL'
};

/**
 * ELK 布局配置的调整选项
 */
export interface ELKLayoutOptions {
  // 布局方向
  direction?: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

  // 节点间距
  nodeNodeSpacing?: number;

  // 边间距
  edgeEdgeSpacing?: number;

  // 边与节点的距离
  edgeNodeSpacing?: number;

  // 容器 padding
  padding?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };

  // 边路由方式
  edgeRouting?: 'ORTHOGONAL' | 'POLYLINE' | 'SPLINE';

  // 其他 ELK 原生选项（完整支持）
  [key: string]: any;
}

/**
 * ELK 配置帮助函数
 */
export function buildELKConfig(
  baseConfig: Record<string, any>,
  options?: ELKLayoutOptions
): Record<string, any> {
  const config = { ...baseConfig };

  if (!options) return config;

  // 更新布局方向
  if (options.direction) {
    config['elk.direction'] = options.direction;
  }

  // 更新节点间距
  if (options.nodeNodeSpacing !== undefined) {
    config['elk.spacing.nodeNode'] = options.nodeNodeSpacing;
  }

  // 更新边间距
  if (options.edgeEdgeSpacing !== undefined) {
    config['elk.spacing.edgeEdge'] = options.edgeEdgeSpacing;
  }

  // 更新边-节点距离
  if (options.edgeNodeSpacing !== undefined) {
    config['elk.spacing.edgeNode'] = options.edgeNodeSpacing;
  }

  // 更新 padding
  if (options.padding) {
    const p = options.padding;
    const paddingStr = `[top=${p.top || 40}, right=${p.right || 20}, bottom=${p.bottom || 20}, left=${p.left || 20}]`;
    config['elk.padding'] = paddingStr;
  }

  // 更新边路由
  if (options.edgeRouting) {
    config['elk.edgeRouting'] = options.edgeRouting;
  }

  // 合并其他选项（覆盖默认值）
  return {
    ...config,
    ...Object.fromEntries(
      Object.entries(options).filter(
        ([key]) => !['direction', 'nodeNodeSpacing', 'edgeEdgeSpacing', 'edgeNodeSpacing', 'padding', 'edgeRouting'].includes(key)
      )
    )
  };
}

/**
 * ELK 节点大小配置
 */
export const ELK_NODE_SIZE = {
  defaultNode: { width: 100, height: 80 },
  defaultGroup: { width: 300, height: 200 },
  minWidth: 50,
  minHeight: 50,
  maxWidth: 500,
  maxHeight: 400
};
