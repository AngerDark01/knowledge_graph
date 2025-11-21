// src/services/layout/algorithms/ILayoutAlgorithm.ts
import { Node, Group } from '../../../types/graph/models';

/**
 * 网格配置
 */
export interface GridConfig {
  /** 每行最大节点数 */
  maxCols: number;
  /** 水平间距 */
  horizontalSpacing: number;
  /** 垂直间距 */
  verticalSpacing: number;
  /** 默认节点宽度 */
  defaultNodeWidth: number;
  /** 默认节点高度 */
  defaultNodeHeight: number;
}

/**
 * 布局算法选项
 */
export interface LayoutAlgorithmOptions {
  /** 强制指定列数（可选） */
  cols?: number;
  /** 强制指定行数（可选） */
  rows?: number;
  /** 自定义水平间距（可选） */
  horizontalSpacing?: number;
  /** 自定义垂直间距（可选） */
  verticalSpacing?: number;
  /** 是否使用权重排序（可选） */
  useWeightedOrder?: boolean;
  /** 节点权重映射（可选） */
  nodeWeights?: Map<string, number>;
}

/**
 * 布局算法接口
 *
 * 职责：
 * - 纯粹的布局计算，输入节点列表，输出节点位置
 * - 不关心节点在画布还是群组内
 * - 不处理坐标转换（由 CoordinateTransformer 处理）
 * - 不处理碰撞检测（由 CollisionResolver 处理）
 * - 只关心节点之间的相对位置关系
 */
export interface ILayoutAlgorithm {
  /**
   * 算法名称
   */
  readonly name: string;

  /**
   * 算法ID
   */
  readonly id: string;

  /**
   * 计算节点布局
   *
   * @param nodes 需要布局的节点列表
   * @param options 布局选项
   * @returns 包含新位置的节点列表（相对坐标）
   *
   * 注意：
   * - 返回的坐标是相对坐标，具体含义由算法决定
   * - GridAlgorithm: 从 (0,0) 开始，第四象限坐标（全正）
   * - GridCenterAlgorithm: 以原点为中心，可能有负坐标
   */
  calculate(
    nodes: (Node | Group)[],
    options?: LayoutAlgorithmOptions
  ): (Node | Group)[];

  /**
   * 验证配置是否有效（可选）
   *
   * @param options 布局选项
   * @returns true 如果配置有效
   */
  validateOptions?(options: LayoutAlgorithmOptions): boolean;
}
