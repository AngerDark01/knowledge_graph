/**
 * 布局系统 V2 类型定义
 * 基于 ELK 的新布局系统
 */

import { Node, Group, Edge } from '@/types/graph/models';
import { ELKLayoutOptions } from '../config/elk.config';

/**
 * 全局布局选项
 * 用于布局所有节点（包括嵌套的）
 */
export interface GlobalLayoutOptions extends ELKLayoutOptions {
  // 是否启用动画
  animate?: boolean;

  // 布局排序策略（可选的权重排序）
  useWeightedLayout?: boolean;

  // 自定义权重计算函数
  calculateWeights?: (nodes: (Node | Group)[], edges: Edge[]) => Map<string, number>;
}

/**
 * 局部布局选项
 * 用于布局选中的节点及其子图
 */
export interface LocalLayoutOptions extends ELKLayoutOptions {
  // 是否包含子节点（递归）
  includeChildren?: boolean;

  // 是否锁定其他节点的位置（不改变未选中节点）
  lockOtherNodes?: boolean;

  // 是否启用动画
  animate?: boolean;
}

/**
 * 群组内部布局选项
 * 用于布局群组内的子节点
 */
export interface GroupInternalLayoutOptions extends ELKLayoutOptions {
  animate?: boolean;
  // 群组 ID
  groupId: string;
}

/**
 * 布局结果的单个节点信息
 */
export interface LayoutedNode {
  x: number;
  y: number;
  width?: number;
  height?: number;
  boundary?: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

/**
 * 布局结果的单个边信息
 */
export interface LayoutedEdge {
  sourceHandle?: string;
  targetHandle?: string;
  [key: string]: any;
}

/**
 * 完整的布局结果
 */
export interface LayoutResult {
  success: boolean;
  // 节点 ID → 位置信息的映射
  nodes: Map<string, LayoutedNode>;
  // 边 ID → 边信息的映射
  edges: Map<string, LayoutedEdge>;
  // 错误信息
  errors: string[];
  // 布局统计信息
  stats: {
    duration: number;      // 耗时（毫秒）
    iterations: number;    // 迭代次数
    collisions: number;    // 碰撞数量
    nodesLayouted?: number; // 布局的节点数量
    edgesLayouted?: number; // 布局的边数量
  };
}

/**
 * 布局管理器 V2 接口
 * 提供两个核心接口：全局和局部布局
 */
export interface ILayoutManagerV2 {
  /**
   * 应用全局布局
   * 对所有节点进行布局，包括处理嵌套的群组
   *
   * @param nodes 所有节点（包括群组）
   * @param edges 所有边
   * @param options 布局选项
   * @returns 布局结果（所有节点的新位置）
   *
   * @example
   * ```typescript
   * const result = await layoutManager.applyGlobalLayout(nodes, edges, {
   *   direction: 'DOWN',
   *   nodeNodeSpacing: 100
   * });
   * ```
   */
  applyGlobalLayout(
    nodes: (Node | Group)[],
    edges: Edge[],
    options?: GlobalLayoutOptions
  ): Promise<LayoutResult>;

  /**
   * 应用局部布局
   * 只布局选中的节点及其相关的子图，保持其他节点位置不变
   *
   * @param selectedNodeIds 选中的节点 ID
   * @param allNodes 所有节点
   * @param allEdges 所有边
   * @param options 布局选项
   * @returns 布局结果（仅包含更新的节点）
   *
   * @example
   * ```typescript
   * const result = await layoutManager.applyLocalLayout(
   *   ['node-1', 'node-2'],
   *   nodes,
   *   edges,
   *   {
   *     includeChildren: true,
   *     lockOtherNodes: true
   *   }
   * );
   * ```
   */
  applyLocalLayout(
    selectedNodeIds: string[],
    allNodes: (Node | Group)[],
    allEdges: Edge[],
    options?: LocalLayoutOptions
  ): Promise<LayoutResult>;

  /**
   * 应用群组内部布局
   * 只布局特定群组内的子节点，自动调整群组大小
   *
   * @param groupId 群组 ID
   * @param allNodes 所有节点
   * @param allEdges 所有边
   * @param options 布局选项
   * @returns 布局结果
   *
   * @example
   * ```typescript
   * const result = await layoutManager.applyGroupInternalLayout(
   *   'group-1',
   *   nodes,
   *   edges
   * );
   * ```
   */
  applyGroupInternalLayout(
    groupId: string,
    allNodes: (Node | Group)[],
    allEdges: Edge[],
    options?: GroupInternalLayoutOptions
  ): Promise<LayoutResult>;
}

/**
 * ELK 图数据结构
 * 用于与 ELK 库通信
 */
export interface ELKNode {
  id: string;
  x?: number;
  y?: number;
  width: number;
  height: number;
  labels?: Array<{ text: string }>;
  children?: ELKNode[];
  layoutOptions?: Record<string, any>;
  properties?: Record<string, any>;
}

export interface ELKEdge {
  id: string;
  sources: string[];
  targets: string[];
  layoutOptions?: Record<string, any>;
}

export interface ELKGraph {
  id: string;
  layoutOptions?: Record<string, any>;
  children?: ELKNode[];
  edges?: ELKEdge[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

/**
 * 子图提取结果
 */
export interface SubgraphExtractResult {
  subgraphNodes: (Node | Group)[];
  subgraphEdges: Edge[];
}

/**
 * 嵌套树节点（用于处理嵌套结构）
 */
export interface NestingTreeNode {
  id: string;
  depth: number;
  parentId?: string;
  children: NestingTreeNode[];
}
