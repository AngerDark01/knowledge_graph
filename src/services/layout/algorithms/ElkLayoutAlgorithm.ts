/**
 * ELK 布局算法包装
 *
 * 职责：
 * 1. 包装 ELK 库的调用
 * 2. 实现 ILayoutAlgorithm 接口
 * 3. 处理数据转换和结果构建
 */

import ELK from 'elkjs';
import { Node, Group, Edge } from '@/types/graph/models';
import { ILayoutAlgorithm, LayoutAlgorithmOptions } from './ILayoutAlgorithm';
import { ElkLayoutAdapter } from './ElkLayoutAdapter';
import { LayoutResult } from '../types/layoutTypesV2';
import { GLOBAL_LAYOUT_CONFIG, buildELKConfig } from '../config/elk.config';

export class ElkLayoutAlgorithm implements ILayoutAlgorithm {
  readonly name = 'ELK Layered Layout Algorithm';
  readonly id = 'elk-layered';

  private elk: ELK;
  private adapter: ElkLayoutAdapter;

  constructor() {
    // 初始化 ELK 实例
    this.elk = new ELK();
    // 初始化适配器
    this.adapter = new ElkLayoutAdapter();
  }

  /**
   * 执行布局计算
   *
   * @param nodes 节点列表
   * @param edges 边列表
   * @param options 布局选项
   * @returns 布局结果
   */
  async calculate(
    nodes: (Node | Group)[],
    edges: Edge[],
    options?: LayoutAlgorithmOptions
  ): Promise<LayoutResult> {
    try {
      // 1. 构建 ELK 配置
      const elkLayoutOptions = this.buildLayoutOptions(options);

      // 2. 转换为 ELK 格式
      const elkGraph = this.adapter.toElkGraph(nodes, edges, elkLayoutOptions);

      // 3. 执行 ELK 布局
      const startTime = performance.now();
      const elkResult = await this.elk.layout(elkGraph);
      const duration = performance.now() - startTime;

      // 4. 转换回你的格式
      const layoutResult = this.adapter.fromElkGraph(elkResult, nodes, edges);

      // 5. 更新统计信息
      layoutResult.stats.duration = duration;
      layoutResult.stats.iterations = 1; // ELK 通常只需 1 次完整遍历
      layoutResult.stats.collisions = 0;  // ELK 内置碰撞避免

      return layoutResult;
    } catch (error) {
      console.error('ELK Layout Algorithm Error:', error);
      return {
        success: false,
        nodes: new Map(),
        edges: new Map(),
        errors: [error instanceof Error ? error.message : 'Unknown ELK layout error'],
        stats: { duration: 0, iterations: 0, collisions: 0 }
      };
    }
  }

  /**
   * 验证配置
   */
  validateConfig(config: any): boolean {
    // ELK 配置验证
    if (!config) return true;

    // 检查基本的配置项
    const validDirections = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    if (config.direction && !validDirections.includes(config.direction)) {
      console.warn(`Invalid direction: ${config.direction}`);
      return false;
    }

    if (config.nodeNodeSpacing !== undefined && typeof config.nodeNodeSpacing !== 'number') {
      console.warn('nodeNodeSpacing must be a number');
      return false;
    }

    return true;
  }

  /**
   * 私有方法：构建 ELK 布局选项
   */
  private buildLayoutOptions(options?: LayoutAlgorithmOptions): Record<string, any> {
    // 如果没有提供选项，使用默认配置
    if (!options) {
      return GLOBAL_LAYOUT_CONFIG;
    }

    // 使用配置辅助函数构建完整的 ELK 选项
    return buildELKConfig(GLOBAL_LAYOUT_CONFIG, options);
  }

  /**
   * 获取适配器（用于测试或特殊场景）
   */
  getAdapter(): ElkLayoutAdapter {
    return this.adapter;
  }

  /**
   * 获取 ELK 实例（用于高级用法）
   */
  getELK(): ELK {
    return this.elk;
  }
}
