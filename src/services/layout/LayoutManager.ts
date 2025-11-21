// src/services/layout/LayoutManager.ts
import { Node, Group, Edge } from '../../types/graph/models';
import { ILayoutStrategy, LayoutResult, LayoutOptions } from './types/layoutTypes';
import { LAYOUT_CONFIG } from '../../config/graph.config';

// 新的策略类（重构后）
import { GroupLayoutStrategy } from './strategies/GroupLayoutStrategy';
import { CanvasLayoutStrategy } from './strategies/CanvasLayoutStrategy';
import { RecursiveLayoutStrategy } from './strategies/RecursiveLayoutStrategy';

// 算法层
import { GridAlgorithm } from './algorithms/GridAlgorithm';
import { GridCenterAlgorithm } from './algorithms/GridCenterAlgorithm';
import { EdgeOptimizer } from './algorithms/EdgeOptimizer';

// 工具层
import { CollisionResolver } from './utils/CollisionResolver';
import { NestingTreeBuilder } from './utils/NestingTreeBuilder';

export interface ILayoutManager {
  /**
   * 应用布局算法
   */
  applyLayout(nodes: (Node | Group)[], edges: Edge[], options?: LayoutOptions): Promise<LayoutResult>;
  
  /**
   * 注册布局策略
   */
  registerStrategy(name: string, strategy: ILayoutStrategy): void;
  
  /**
   * 获取支持的策略列表
   */
  getSupportedStrategies(): string[];
  
  /**
   * 取消当前布局操作
   */
  cancelCurrentOperation(): void;
  
  /**
   * 设置布局配置
   */
  setConfig(config: Partial<typeof LAYOUT_CONFIG>): void;

  /**
   * 获取当前配置
   */
  getConfig(): typeof LAYOUT_CONFIG;
}

export class LayoutManager implements ILayoutManager {
  private strategies: Map<string, ILayoutStrategy>;
  private currentOperation?: Promise<LayoutResult>;
  private config: typeof LAYOUT_CONFIG;
  private isOperationCancelled: boolean;

  constructor() {
    this.strategies = new Map();
    this.config = LAYOUT_CONFIG;
    this.isOperationCancelled = false;

    // 注册默认策略
    this.registerDefaultStrategies();
  }
  
  /**
   * 注册默认布局策略
   */
  private registerDefaultStrategies(): void {
    // 创建共享的工具实例
    const collisionResolver = new CollisionResolver();
    const edgeOptimizer = new EdgeOptimizer();
    const nestingTreeBuilder = new NestingTreeBuilder();

    // 创建算法实例
    const gridAlgorithm = new GridAlgorithm();
    const gridCenterAlgorithm = new GridCenterAlgorithm();

    // 1. 注册群组布局策略
    const groupStrategy = new GroupLayoutStrategy(
      gridAlgorithm,
      collisionResolver
    );
    this.strategies.set(groupStrategy.id, groupStrategy);
    console.log(`✅ 策略已注册: ${groupStrategy.name} (${groupStrategy.id})`);

    // 2. 注册画布布局策略
    const canvasStrategy = new CanvasLayoutStrategy(
      gridCenterAlgorithm,
      collisionResolver,
      edgeOptimizer
    );
    this.strategies.set(canvasStrategy.id, canvasStrategy);
    console.log(`✅ 策略已注册: ${canvasStrategy.name} (${canvasStrategy.id})`);

    // 3. 注册递归布局策略（依赖前两个策略）
    const recursiveStrategy = new RecursiveLayoutStrategy(
      groupStrategy,
      canvasStrategy,
      nestingTreeBuilder,
      edgeOptimizer
    );
    this.strategies.set(recursiveStrategy.id, recursiveStrategy);
    console.log(`✅ 策略已注册: ${recursiveStrategy.name} (${recursiveStrategy.id})`);
  }
  
  async applyLayout(nodes: (Node | Group)[], edges: Edge[], options?: LayoutOptions): Promise<LayoutResult> {
    // 检查是否有正在进行的操作
    if (this.currentOperation) {
      console.warn('Layout operation already in progress, cancelling previous operation');
      this.cancelCurrentOperation();
    }
    
    // 重置取消标志
    this.isOperationCancelled = false;
    
    // 创建新的操作Promise
    this.currentOperation = this.executeLayout(nodes, edges, options);
    
    try {
      const result = await this.currentOperation;
      return result;
    } finally {
      // 清除当前操作引用
      this.currentOperation = undefined;
    }
  }
  
  /**
   * 执行布局操作
   */
  private async executeLayout(nodes: (Node | Group)[], edges: Edge[], options?: LayoutOptions): Promise<LayoutResult> {
    if (this.isOperationCancelled) {
      return {
        success: false,
        nodes: new Map(),
        edges: new Map(),
        errors: ['Operation was cancelled'],
        stats: { duration: 0, iterations: 0, collisions: 0 }
      };
    }

    const startTime = performance.now();

    try {
      // 智能策略选择
      const strategyId = this.selectStrategy(options);

      console.log(`📋 LayoutManager: 选择策略 "${strategyId}"`);

      // 获取策略实例
      const strategy = this.strategies.get(strategyId);

      if (!strategy) {
        throw new Error(`Unknown layout strategy: ${strategyId}`);
      }

      // 应用布局
      const result = await strategy.applyLayout(nodes, edges, options);

      // 记录执行时间
      const endTime = performance.now();
      result.stats.duration = endTime - startTime;

      return result;
    } catch (error) {
      const endTime = performance.now();
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
   * 智能选择布局策略
   * 根据 options 自动选择最合适的策略
   */
  private selectStrategy(options?: LayoutOptions): string {
    // 1. 如果显式指定了策略，直接使用
    if (options?.strategy) {
      return options.strategy;
    }

    // 2. 如果是递归布局模式
    if (options?.layoutMode === 'recursive') {
      return 'recursive-layout';
    }

    // 3. 如果指定了目标群组ID（群组内布局）
    if (options?.targetGroupId) {
      return 'group-layout';
    }

    // 4. 默认使用画布布局（顶层节点布局）
    return 'canvas-layout';
  }
  
  /**
   * 注册布局策略
   */
  registerStrategy(name: string, strategy: ILayoutStrategy): void {
    this.strategies.set(name, strategy);
  }
  
  /**
   * 获取支持的策略列表
   */
  getSupportedStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }
  
  /**
   * 取消当前布局操作
   */
  cancelCurrentOperation(): void {
    this.isOperationCancelled = true;
  }
  
  /**
   * 设置布局配置
   */
  setConfig(config: Partial<typeof LAYOUT_CONFIG>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前配置
   */
  getConfig(): typeof LAYOUT_CONFIG {
    return this.config;
  }
}