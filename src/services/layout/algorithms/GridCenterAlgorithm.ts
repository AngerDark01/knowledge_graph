// src/services/layout/algorithms/GridCenterAlgorithm.ts
import { Node, Group } from '../../../types/graph/models';
import { LAYOUT_CONFIG, GRID_LAYOUT } from '../../../config/graph.config';
import { ILayoutAlgorithm, GridConfig, LayoutAlgorithmOptions } from './ILayoutAlgorithm';

/**
 * 网格中心布局算法
 *
 * 特点：
 * - 以原点 (0, 0) 为中心布局，可能产生负坐标
 * - 适用于全画布布局（顶层节点）
 * - 高权重节点可以排在中心位置
 * - 网格整体居中对齐
 *
 * 输出：
 * - 相对坐标，以原点为中心
 * - 可能包含负坐标
 * - 例如：3个节点排成一行，中间节点在 (0, 0) 附近
 */
export class GridCenterAlgorithm implements ILayoutAlgorithm {
  readonly name = 'Grid Center Layout';
  readonly id = 'grid-center';

  private config: GridConfig;

  constructor(config?: Partial<GridConfig>) {
    this.config = {
      maxCols: config?.maxCols || GRID_LAYOUT.NODES_PER_ROW,
      horizontalSpacing: config?.horizontalSpacing || GRID_LAYOUT.HORIZONTAL_SPACING,
      verticalSpacing: config?.verticalSpacing || GRID_LAYOUT.VERTICAL_SPACING,
      defaultNodeWidth: config?.defaultNodeWidth || LAYOUT_CONFIG.nodeSize.defaultNode.width,
      defaultNodeHeight: config?.defaultNodeHeight || LAYOUT_CONFIG.nodeSize.defaultNode.height
    };
  }

  /**
   * 计算居中网格布局
   */
  calculate(
    nodes: (Node | Group)[],
    options?: LayoutAlgorithmOptions
  ): (Node | Group)[] {
    if (nodes.length === 0) {
      return [];
    }

    // 1. 如果启用权重排序，先按权重排序节点
    let sortedNodes = nodes;
    if (options?.useWeightedOrder && options?.nodeWeights) {
      sortedNodes = this.sortByWeight(nodes, options.nodeWeights);
      console.log('📊 GridCenterAlgorithm: 使用权重排序');
    }

    // 2. 获取节点尺寸
    const avgWidth = this.calculateAverageWidth(sortedNodes);
    const avgHeight = this.calculateAverageHeight(sortedNodes);

    // 3. 计算网格结构
    const { rows, cols } = this.calculateGridStructure(sortedNodes.length, options);

    // 4. 获取间距
    const horizontalSpacing = options?.horizontalSpacing ?? this.config.horizontalSpacing;
    const verticalSpacing = options?.verticalSpacing ?? this.config.verticalSpacing;

    // 5. 计算网格总尺寸
    const gridWidth = cols * avgWidth + (cols - 1) * horizontalSpacing;
    const gridHeight = rows * avgHeight + (rows - 1) * verticalSpacing;

    // 6. 计算偏移量（使网格居中）
    const offsetX = -gridWidth / 2;
    const offsetY = -gridHeight / 2;

    console.log(
      `📐 GridCenterAlgorithm: ${sortedNodes.length}个节点, ${cols}列 x ${rows}行, ` +
      `网格尺寸: ${Math.round(gridWidth)}x${Math.round(gridHeight)}, ` +
      `居中偏移: (${Math.round(offsetX)}, ${Math.round(offsetY)})`
    );

    // 7. 按行优先顺序计算每个节点的位置
    const result: (Node | Group)[] = [];

    for (let i = 0; i < sortedNodes.length; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;

      const nodeWidth = sortedNodes[i].width || this.config.defaultNodeWidth;
      const nodeHeight = sortedNodes[i].height || this.config.defaultNodeHeight;

      // 以原点为中心布局，可能有负坐标
      const x = offsetX + col * (avgWidth + horizontalSpacing) + avgWidth / 2;
      const y = offsetY + row * (avgHeight + verticalSpacing) + avgHeight / 2;

      result.push({
        ...sortedNodes[i],
        position: { x, y }
      });
    }

    return result;
  }

  /**
   * 按权重排序节点（权重高的排在前面，会出现在中心位置）
   */
  private sortByWeight(
    nodes: (Node | Group)[],
    weights: Map<string, number>
  ): (Node | Group)[] {
    return [...nodes].sort((a, b) => {
      const weightA = weights.get(a.id) || 0;
      const weightB = weights.get(b.id) || 0;
      return weightB - weightA; // 降序
    });
  }

  /**
   * 计算平均节点宽度
   */
  private calculateAverageWidth(nodes: (Node | Group)[]): number {
    const totalWidth = nodes.reduce(
      (sum, node) => sum + (node.width || this.config.defaultNodeWidth),
      0
    );
    return totalWidth / nodes.length;
  }

  /**
   * 计算平均节点高度
   */
  private calculateAverageHeight(nodes: (Node | Group)[]): number {
    const totalHeight = nodes.reduce(
      (sum, node) => sum + (node.height || this.config.defaultNodeHeight),
      0
    );
    return totalHeight / nodes.length;
  }

  /**
   * 计算最优的网格结构（行列数）
   */
  private calculateGridStructure(
    nodeCount: number,
    options?: LayoutAlgorithmOptions
  ): { rows: number; cols: number } {
    // 如果显式指定了行列数，直接使用
    if (options?.cols && options?.rows) {
      return { cols: options.cols, rows: options.rows };
    }

    if (options?.cols) {
      return {
        cols: options.cols,
        rows: Math.ceil(nodeCount / options.cols)
      };
    }

    if (options?.rows) {
      return {
        rows: options.rows,
        cols: Math.ceil(nodeCount / options.rows)
      };
    }

    // 自动计算最优列数
    const idealCols = Math.ceil(Math.sqrt(nodeCount));
    const cols = Math.min(idealCols, this.config.maxCols);
    const rows = Math.ceil(nodeCount / cols);

    return { rows, cols };
  }

  /**
   * 验证选项
   */
  validateOptions(options: LayoutAlgorithmOptions): boolean {
    if (options.cols !== undefined && options.cols <= 0) {
      console.error('GridCenterAlgorithm: cols must be positive');
      return false;
    }

    if (options.rows !== undefined && options.rows <= 0) {
      console.error('GridCenterAlgorithm: rows must be positive');
      return false;
    }

    if (options.horizontalSpacing !== undefined && options.horizontalSpacing < 0) {
      console.error('GridCenterAlgorithm: horizontalSpacing cannot be negative');
      return false;
    }

    if (options.verticalSpacing !== undefined && options.verticalSpacing < 0) {
      console.error('GridCenterAlgorithm: verticalSpacing cannot be negative');
      return false;
    }

    return true;
  }
}
