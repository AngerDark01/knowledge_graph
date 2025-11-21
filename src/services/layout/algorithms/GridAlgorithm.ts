// src/services/layout/algorithms/GridAlgorithm.ts
import { Node, Group } from '../../../types/graph/models';
import { LAYOUT_CONFIG, GRID_LAYOUT } from '../../../config/graph.config';
import { ILayoutAlgorithm, GridConfig, LayoutAlgorithmOptions } from './ILayoutAlgorithm';

/**
 * 网格布局算法（从左上角开始）
 *
 * 特点：
 * - 从 (0, 0) 开始布局，所有坐标为正数（第四象限）
 * - 适用于群组内部布局（相对于群组左上角）
 * - 节点按行优先顺序排列
 * - 自动计算最优行列数
 *
 * 输出：
 * - 相对坐标，从 (0, 0) 开始
 * - 例如：第一个节点在 (nodeWidth/2, nodeHeight/2)
 */
export class GridAlgorithm implements ILayoutAlgorithm {
  readonly name = 'Grid Layout (Top-Left)';
  readonly id = 'grid-top-left';

  private config: GridConfig;

  constructor(config?: Partial<GridConfig>) {
    // 使用传入的配置，或使用默认配置
    this.config = {
      maxCols: config?.maxCols || GRID_LAYOUT.NODES_PER_ROW,
      horizontalSpacing: config?.horizontalSpacing || GRID_LAYOUT.HORIZONTAL_SPACING,
      verticalSpacing: config?.verticalSpacing || GRID_LAYOUT.VERTICAL_SPACING,
      defaultNodeWidth: config?.defaultNodeWidth || LAYOUT_CONFIG.nodeSize.defaultNode.width,
      defaultNodeHeight: config?.defaultNodeHeight || LAYOUT_CONFIG.nodeSize.defaultNode.height
    };
  }

  /**
   * 计算网格布局
   */
  calculate(
    nodes: (Node | Group)[],
    options?: LayoutAlgorithmOptions
  ): (Node | Group)[] {
    if (nodes.length === 0) {
      return [];
    }

    // 1. 获取节点尺寸
    const nodeSizes = nodes.map(node => ({
      width: node.width || this.config.defaultNodeWidth,
      height: node.height || this.config.defaultNodeHeight
    }));

    const avgWidth = nodeSizes.reduce((sum, s) => sum + s.width, 0) / nodes.length;
    const avgHeight = nodeSizes.reduce((sum, s) => sum + s.height, 0) / nodes.length;

    // 2. 计算网格结构
    const { rows, cols } = this.calculateGridStructure(nodes.length, options);

    // 3. 获取间距
    const horizontalSpacing = options?.horizontalSpacing ?? this.config.horizontalSpacing;
    const verticalSpacing = options?.verticalSpacing ?? this.config.verticalSpacing;

    console.log(
      `📐 GridAlgorithm: ${nodes.length}个节点, ${cols}列 x ${rows}行, ` +
      `间距: H=${horizontalSpacing}px V=${verticalSpacing}px`
    );

    // 4. 按行优先顺序计算每个节点的位置
    const result: (Node | Group)[] = [];

    for (let i = 0; i < nodes.length; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;

      const nodeWidth = nodeSizes[i].width;
      const nodeHeight = nodeSizes[i].height;

      // 从 (0, 0) 开始布局，第四象限坐标
      // 位置是节点中心点
      const x = col * (avgWidth + horizontalSpacing) + nodeWidth / 2;
      const y = row * (avgHeight + verticalSpacing) + nodeHeight / 2;

      result.push({
        ...nodes[i],
        position: { x, y }
      });
    }

    return result;
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

    // 如果只指定了列数
    if (options?.cols) {
      return {
        cols: options.cols,
        rows: Math.ceil(nodeCount / options.cols)
      };
    }

    // 如果只指定了行数
    if (options?.rows) {
      return {
        rows: options.rows,
        cols: Math.ceil(nodeCount / options.rows)
      };
    }

    // 自动计算最优列数
    // 策略：尽量接近正方形，但不超过 maxCols
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
      console.error('GridAlgorithm: cols must be positive');
      return false;
    }

    if (options.rows !== undefined && options.rows <= 0) {
      console.error('GridAlgorithm: rows must be positive');
      return false;
    }

    if (options.horizontalSpacing !== undefined && options.horizontalSpacing < 0) {
      console.error('GridAlgorithm: horizontalSpacing cannot be negative');
      return false;
    }

    if (options.verticalSpacing !== undefined && options.verticalSpacing < 0) {
      console.error('GridAlgorithm: verticalSpacing cannot be negative');
      return false;
    }

    return true;
  }

  /**
   * 计算布局后的边界（用于调试）
   */
  calculateBounds(nodes: (Node | Group)[]): {
    width: number;
    height: number;
  } {
    if (nodes.length === 0) {
      return { width: 0, height: 0 };
    }

    let maxX = 0;
    let maxY = 0;

    nodes.forEach(node => {
      const nodeWidth = node.width || this.config.defaultNodeWidth;
      const nodeHeight = node.height || this.config.defaultNodeHeight;

      maxX = Math.max(maxX, node.position.x + nodeWidth / 2);
      maxY = Math.max(maxY, node.position.y + nodeHeight / 2);
    });

    return { width: maxX, height: maxY };
  }
}
