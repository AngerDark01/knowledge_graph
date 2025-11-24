// src/services/layout/strategies/CanvasLayoutStrategy.ts
import { Node, Group, Edge } from '../../../types/graph/models';
import { ILayoutStrategy, LayoutResult, LayoutOptions } from '../types/layoutTypes';
import { LAYOUT_CONFIG, GRID_LAYOUT } from '../../../config/graph.config';

// 算法层
import { GridCenterAlgorithm } from '../algorithms/GridCenterAlgorithm';
import { ILayoutAlgorithm } from '../algorithms/ILayoutAlgorithm';
import { EdgeOptimizer, OptimizedEdge } from '../algorithms/EdgeOptimizer';

// 工具层
import { CollisionResolver } from '../utils/CollisionResolver';
import { NestedNodePositionUpdater } from '../utils/NestedNodePositionUpdater';

/**
 * 全画布布局策略
 *
 * 职责：
 * - 对所有顶层节点（没有 groupId）进行布局
 * - 使用居中布局算法（以原点为中心）
 * - 处理嵌套节点位置更新（子节点跟随父节点移动）
 * - 优化边的连接点
 *
 * 流程：
 * 1. 筛选顶层节点
 * 2. 使用算法计算居中布局
 * 3. 碰撞检测与解决
 * 4. 更新嵌套节点位置（保持相对位置）
 * 5. 优化边的连接点
 * 6. 返回布局结果
 */
export class CanvasLayoutStrategy implements ILayoutStrategy {
  readonly name = 'Canvas Layout';
  readonly id = 'canvas-layout';

  private algorithm: ILayoutAlgorithm;
  private collisionResolver: CollisionResolver;
  private edgeOptimizer: EdgeOptimizer;

  constructor(
    algorithm?: ILayoutAlgorithm,
    collisionResolver?: CollisionResolver,
    edgeOptimizer?: EdgeOptimizer
  ) {
    // 默认使用 GridCenterAlgorithm（居中布局）
    this.algorithm = algorithm || new GridCenterAlgorithm();
    this.collisionResolver = collisionResolver || new CollisionResolver();
    this.edgeOptimizer = edgeOptimizer || new EdgeOptimizer();
  }

  /**
   * 应用全画布布局
   */
  async applyLayout(
    nodes: (Node | Group)[],
    edges: Edge[],
    options?: LayoutOptions
  ): Promise<LayoutResult> {
    const startTime = performance.now();

    try {
      // 1. 筛选顶层节点
      const topLevelNodes = this.getTopLevelNodes(nodes);

      if (topLevelNodes.length === 0) {
        console.warn('没有顶层节点，跳过画布布局');
        return this.buildEmptyResult(startTime);
      }

      console.log(`📐 CanvasLayoutStrategy: 布局 ${topLevelNodes.length} 个顶层节点`);

      // 2. 计算权重（如果启用）
      let nodeWeights: Map<string, number> | undefined;
      if (options?.useWeightedLayout) {
        nodeWeights = this.calculateWeights(topLevelNodes, edges);
        console.log('📊 使用权重排序布局');
      }

      // 3. 使用算法计算居中布局
      const layoutedNodes = this.algorithm.calculate(topLevelNodes, {
        horizontalSpacing: options?.gridSpacing || GRID_LAYOUT.HORIZONTAL_SPACING,
        verticalSpacing: options?.gridSpacing || GRID_LAYOUT.VERTICAL_SPACING,
        useWeightedOrder: options?.useWeightedLayout,
        nodeWeights
      });

      // 4. 碰撞检测与解决
      const resolvedNodes = this.collisionResolver.resolve(layoutedNodes);
      const collisionCount = this.collisionResolver.countCollisions(layoutedNodes);

      if (collisionCount > 0) {
        console.log(`  └─ 解决了 ${collisionCount} 个碰撞`);
      }

      // 5. 更新嵌套节点位置（保持相对位置）
      const finalNodes = NestedNodePositionUpdater.updateNestedNodePositionsForCanvasLayout(nodes, resolvedNodes);

      // 6. 优化边的连接点
      const optimizedEdges = this.edgeOptimizer.optimizeEdgeHandles(finalNodes, edges);

      console.log(`  └─ 优化了 ${optimizedEdges.length} 条边的连接点`);

      // 7. 构建返回结果
      const endTime = performance.now();

      const nodePositions = new Map<string, { x: number; y: number }>();
      for (const node of finalNodes) {
        nodePositions.set(node.id, node.position);
      }

      const edgeHandles = new Map<string, OptimizedEdge>();
      for (const edge of optimizedEdges) {
        edgeHandles.set(edge.id, edge);
      }

      console.log(`✅ 画布布局完成，耗时 ${(endTime - startTime).toFixed(0)}ms`);

      return {
        success: true,
        nodes: nodePositions,
        edges: edgeHandles,
        errors: [],
        stats: {
          duration: endTime - startTime,
          iterations: 1,
          collisions: collisionCount
        }
      };

    } catch (error) {
      const endTime = performance.now();
      console.error('❌ CanvasLayoutStrategy 失败:', error);

      return {
        success: false,
        nodes: new Map(),
        edges: new Map(),
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        stats: {
          duration: endTime - startTime,
          iterations: 0,
          collisions: 0
        }
      };
    }
  }

  /**
   * 获取顶层节点（没有 groupId 的节点）
   */
  private getTopLevelNodes(nodes: (Node | Group)[]): (Node | Group)[] {
    return nodes.filter(node => !('groupId' in node) || !node.groupId);
  }

  /**
   * 计算节点权重
   * 根据节点大小和边数量计算权重
   */
  private calculateWeights(
    nodes: (Node | Group)[],
    edges: Edge[]
  ): Map<string, number> {
    const weights = new Map<string, number>();

    for (const node of nodes) {
      // 计算节点面积权重（归一化）
      const area =
        (node.width || LAYOUT_CONFIG.nodeSize.defaultNode.width) *
        (node.height || LAYOUT_CONFIG.nodeSize.defaultNode.height);
      const maxArea = LAYOUT_CONFIG.weight.maxArea;
      const areaWeight = Math.min(1, area / maxArea);

      // 计算边数权重（总连接数）
      const connectedEdges = edges.filter(
        e => e.source === node.id || e.target === node.id
      );
      const maxEdges = LAYOUT_CONFIG.weight.maxEdges;
      const totalEdgeWeight = Math.min(1, connectedEdges.length / maxEdges);

      // 计算入度和出度权重
      const inEdges = edges.filter(e => e.target === node.id);
      const outEdges = edges.filter(e => e.source === node.id);
      const inEdgeWeight = Math.min(1, inEdges.length / maxEdges);
      const outEdgeWeight = Math.min(1, outEdges.length / maxEdges);

      // 综合权重 - 考虑面积、总边数、入度、出度
      const totalWeight =
        areaWeight * LAYOUT_CONFIG.weight.areaWeight +
        totalEdgeWeight * LAYOUT_CONFIG.weight.totalEdgesWeight +
        inEdgeWeight * LAYOUT_CONFIG.weight.crossEdgesWeight +
        outEdgeWeight * LAYOUT_CONFIG.weight.sameEdgesWeight;

      weights.set(node.id, totalWeight);
    }

    return weights;
  }

  /**
   * 构建空结果
   */
  private buildEmptyResult(startTime: number): LayoutResult {
    return {
      success: true,
      nodes: new Map(),
      edges: new Map(),
      errors: [],
      stats: {
        duration: performance.now() - startTime,
        iterations: 0,
        collisions: 0
      }
    };
  }

  /**
   * 验证配置
   */
  validateConfig(config: any): boolean {
    // 画布布局不需要特殊配置验证
    return true;
  }
}
