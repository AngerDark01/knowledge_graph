// src/services/layout/strategies/ELKLayoutStrategy.ts
import { Node, Group, Edge } from '../../../types/graph/models';
import { ILayoutStrategy, LayoutResult, LayoutOptions } from '../types/layoutTypes';
import { ELKGraphConverter, type ElkNode } from '../utils/ELKGraphConverter';
import { createELKEngine, type ELKEngine } from '../utils/ELKRuntime';
import { logLayoutDebug } from '../utils/layoutDebug';

/**
 * ELK布局策略
 *
 * 职责：
 * - 使用 ELK.js 库进行自动布局
 * - 支持多层嵌套容器的层次布局
 * - 只负责计算节点位置，不处理边优化（由EdgeOptimizer处理）
 *
 * 特点：
 * - 一次性处理所有嵌套层级（相比RecursiveLayoutStrategy更高效）
 * - 支持多种布局算法（layered, force, stress等）
 * - 自动最小化边交叉
 * - 专业的层次布局算法
 */
export class ELKLayoutStrategy implements ILayoutStrategy {
  readonly name = 'ELK Layout';
  readonly id = 'elk-layout';

  private elkReady: Promise<ELKEngine> | null = null;

  /**
   * 获取 ELK 库实例（真正执行布局时才加载）
   */
  private getELK(): Promise<ELKEngine> {
    if (!this.elkReady) {
      this.elkReady = this.initELK();
    }

    return this.elkReady;
  }

  private async initELK(): Promise<ELKEngine> {
    try {
      const elk = await createELKEngine();
      logLayoutDebug('ELK 库加载成功');
      return elk;
    } catch (error) {
      console.error('❌ ELK 库加载失败:', error);
      throw new Error('Failed to load ELK library. Please install: npm install elkjs');
    }
  }

  /**
   * 应用ELK布局
   */
  async applyLayout(
    nodes: (Node | Group)[],
    edges: Edge[],
    options?: LayoutOptions
  ): Promise<LayoutResult> {
    const startTime = performance.now();

    try {
      logLayoutDebug(`ELKLayoutStrategy: 开始布局 ${nodes.length} 个节点, ${edges.length} 条边`);

      const elk = await this.getELK();

      // 1. 转换为 ELK 图格式
      logLayoutDebug('步骤 1/3: 转换数据格式...');
      const elkGraph = ELKGraphConverter.toELKGraph(nodes, edges, options);

      // 2. 调用 ELK 布局
      logLayoutDebug('步骤 2/3: 执行 ELK 布局算法...');
      const layoutStartTime = performance.now();

      const elkLayout: ElkNode = await elk.layout(elkGraph);

      const layoutDuration = performance.now() - layoutStartTime;
      logLayoutDebug(`ELK 布局计算耗时: ${layoutDuration.toFixed(0)}ms`);

      // 3. 提取节点位置
      logLayoutDebug('步骤 3/3: 提取节点位置...');
      const nodePositions = ELKGraphConverter.fromELKLayout(elkLayout);

      // 4. 构建返回结果
      const endTime = performance.now();
      const totalDuration = endTime - startTime;

      logLayoutDebug('ELK 布局完成');
      logLayoutDebug(`更新了 ${nodePositions.size} 个节点位置`);
      logLayoutDebug(`总耗时: ${totalDuration.toFixed(0)}ms`);
      logLayoutDebug(`算法: ${elkGraph.layoutOptions?.['elk.algorithm'] || 'layered'}`);

      return {
        success: true,
        nodes: nodePositions,
        edges: new Map(), // 不处理边，由 EdgeOptimizer 或 ReactFlow 处理
        errors: [],
        stats: {
          duration: totalDuration,
          iterations: 1,
          collisions: 0
        }
      };

    } catch (error) {
      const endTime = performance.now();
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      console.error('❌ ELK 布局失败:', error);

      return {
        success: false,
        nodes: new Map(),
        edges: new Map(),
        errors: [errorMessage],
        stats: {
          duration: endTime - startTime,
          iterations: 0,
          collisions: 0
        }
      };
    }
  }

  /**
   * 验证配置
   */
  validateConfig(): boolean {
    // ELK 布局不需要特殊的配置验证
    // 配置项由 ELKConfigBuilder 提供默认值
    return true;
  }

  /**
   * 获取支持的算法列表
   */
  static getSupportedAlgorithms(): string[] {
    return [
      'layered',    // 层次布局（推荐）
      'force',      // 力导向布局
      'stress',     // 压力布局
      'mrtree',     // 树形布局
      'radial',     // 径向布局
      'disco'       // 组件分离布局
    ];
  }

  /**
   * 获取推荐的布局算法
   *
   * @param nodeCount 节点数量
   * @param hasGroups 是否有群组
   * @param isDirected 是否为有向图
   */
  static getRecommendedAlgorithm(
    nodeCount: number,
    hasGroups: boolean,
    isDirected: boolean = true
  ): string {
    // 有群组或有向图，推荐层次布局
    if (hasGroups || isDirected) {
      return 'layered';
    }

    // 小图（<50个节点），使用力导向
    if (nodeCount < 50) {
      return 'force';
    }

    // 大图，使用层次布局（性能更好）
    return 'layered';
  }
}
