// src/services/layout/LayoutManager.ts
import { Node, Group, Edge } from '../../types/graph/models';
import { ILayoutStrategy, LayoutResult, LayoutOptions } from './types/layoutTypes';
import { LAYOUT_CONFIG } from '../../config/graph.config';

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

    // 可以在这里注册默认策略
    // this.registerDefaultStrategies();
  }
  
  /**
   * 注册默认布局策略
   */
  private registerDefaultStrategies(): void {
    // 这里可以注册默认策略
    // 这个方法将在后续开发中实现具体策略
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
      // 获取指定的策略
      const strategy = this.strategies.get(options?.strategy || 'grid-center-layout');
      
      if (!strategy) {
        throw new Error(`Unknown layout strategy: ${options?.strategy}`);
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