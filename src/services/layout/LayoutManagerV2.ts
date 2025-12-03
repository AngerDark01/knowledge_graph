/**
 * 布局管理器 V2 - ELK 完全改造版
 *
 * 提供两个核心接口：
 * 1. applyGlobalLayout - 布局所有节点
 * 2. applyLocalLayout - 只布局选中的节点
 * 3. applyGroupInternalLayout - 布局群组内部
 */

import { Node, Group, Edge, BlockEnum } from '@/types/graph/models';
import {
  ILayoutManagerV2,
  GlobalLayoutOptions,
  LocalLayoutOptions,
  GroupInternalLayoutOptions,
  LayoutResult,
  ELKGraph
} from './types/layoutTypesV2';
import { ElkLayoutAlgorithm } from './algorithms/ElkLayoutAlgorithm';
import { ElkLayoutAdapter } from './algorithms/ElkLayoutAdapter';
import { EdgeOptimizer } from './algorithms/EdgeOptimizer';
import { GROUP_INTERNAL_CONFIG, buildELKConfig } from './config/elk.config';

export class LayoutManagerV2 implements ILayoutManagerV2 {
  private elkAlgorithm: ElkLayoutAlgorithm;
  private adapter: ElkLayoutAdapter;
  private edgeOptimizer: EdgeOptimizer;

  constructor() {
    this.elkAlgorithm = new ElkLayoutAlgorithm();
    this.adapter = new ElkLayoutAdapter();
    this.edgeOptimizer = new EdgeOptimizer();
  }

  /**
   * 接口1：全局布局 - 布局所有节点（包括嵌套的）
   */
  async applyGlobalLayout(
    nodes: (Node | Group)[],
    edges: Edge[],
    options?: GlobalLayoutOptions
  ): Promise<LayoutResult> {
    try {
      console.log(`🌍 LayoutManagerV2: 应用全局布局，节点数: ${nodes.length}, 边数: ${edges.length}`);

      // 1. 使用 ELK 算法进行布局
      const layoutResult = await this.elkAlgorithm.calculate(nodes, edges, options);

      if (!layoutResult.success) {
        return layoutResult;
      }

      // 2. 优化边的连接点
      const optimizedEdges = this.edgeOptimizer.optimizeEdgeHandles(
        this.adapter.mergeWithOriginal(layoutResult, nodes),
        edges
      );

      // 3. 更新布局结果中的边信息
      optimizedEdges.forEach((edge, edgeId) => {
        const existing = layoutResult.edges.get(edgeId);
        if (existing) {
          existing.sourceHandle = edge.sourceHandle;
          existing.targetHandle = edge.targetHandle;
        }
      });

      console.log(`✅ 全局布局完成，耗时: ${layoutResult.stats.duration.toFixed(2)}ms`);
      return layoutResult;
    } catch (error) {
      console.error('Global layout error:', error);
      return {
        success: false,
        nodes: new Map(),
        edges: new Map(),
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        stats: { duration: 0, iterations: 0, collisions: 0 }
      };
    }
  }

  /**
   * 接口2：局部布局 - 只布局选中的节点
   */
  async applyLocalLayout(
    selectedNodeIds: string[],
    allNodes: (Node | Group)[],
    allEdges: Edge[],
    options?: LocalLayoutOptions
  ): Promise<LayoutResult> {
    try {
      console.log(`🎯 LayoutManagerV2: 应用局部布局，选中节点: ${selectedNodeIds.length}`);

      // 1. 提取子图
      const { subgraphNodes, subgraphEdges } = this.adapter.extractSubgraph(
        selectedNodeIds,
        allNodes,
        allEdges,
        options?.includeChildren ?? false
      );

      console.log(`   子图节点: ${subgraphNodes.length}, 边: ${subgraphEdges.length}`);

      // 2. 特殊处理：如果是单个群组，使用群组内部布局
      if (
        selectedNodeIds.length === 1 &&
        allNodes.find(n => n.id === selectedNodeIds[0])?.type === BlockEnum.GROUP
      ) {
        return this.applyGroupInternalLayout(
          selectedNodeIds[0],
          allNodes,
          allEdges,
          {
            ...options,
            groupId: selectedNodeIds[0]
          }
        );
      }

      // 3. 对子图进行布局
      const layoutResult = await this.elkAlgorithm.calculate(subgraphNodes, subgraphEdges, options);

      if (!layoutResult.success) {
        return layoutResult;
      }

      // 4. 优化边的连接点
      const optimizedEdges = this.edgeOptimizer.optimizeEdgeHandles(
        this.adapter.mergeWithOriginal(layoutResult, subgraphNodes),
        subgraphEdges
      );

      optimizedEdges.forEach((edge, edgeId) => {
        const existing = layoutResult.edges.get(edgeId);
        if (existing) {
          existing.sourceHandle = edge.sourceHandle;
          existing.targetHandle = edge.targetHandle;
        }
      });

      // 5. 如果指定了锁定其他节点，则合并结果
      if (options?.lockOtherNodes) {
        const mergedNodes = this.adapter.mergeLocalLayoutResult(layoutResult, allNodes, selectedNodeIds);
        // 重新构建返回结果，包含所有节点
        const finalResult = new Map<string, any>();
        mergedNodes.forEach(node => {
          const layoutedNode = layoutResult.nodes.get(node.id);
          if (layoutedNode) {
            finalResult.set(node.id, layoutedNode);
          }
        });
        layoutResult.nodes = finalResult;
      }

      console.log(`✅ 局部布局完成`);
      return layoutResult;
    } catch (error) {
      console.error('Local layout error:', error);
      return {
        success: false,
        nodes: new Map(),
        edges: new Map(),
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        stats: { duration: 0, iterations: 0, collisions: 0 }
      };
    }
  }

  /**
   * 接口3：群组内部布局 - 只布局群组内的子节点，自动调整群组大小
   */
  async applyGroupInternalLayout(
    groupId: string,
    allNodes: (Node | Group)[],
    allEdges: Edge[],
    options?: GroupInternalLayoutOptions
  ): Promise<LayoutResult> {
    try {
      console.log(`📦 LayoutManagerV2: 应用群组内部布局，群组: ${groupId}`);

      // 1. 获取群组节点
      const groupNode = allNodes.find(n => n.id === groupId);
      if (!groupNode || groupNode.type !== BlockEnum.GROUP) {
        throw new Error(`Group node not found: ${groupId}`);
      }

      // 2. 获取群组的直接子节点
      const childNodes = this.adapter.getGroupChildren(groupId, allNodes);
      console.log(`   子节点数: ${childNodes.length}`);

      if (childNodes.length === 0) {
        // 群组为空，无需布局
        return {
          success: true,
          nodes: new Map().set(groupId, {
            x: (groupNode as any).position.x,
            y: (groupNode as any).position.y,
            width: groupNode.width,
            height: groupNode.height
          }),
          edges: new Map(),
          errors: [],
          stats: { duration: 0, iterations: 1, collisions: 0 }
        };
      }

      // 3. 获取群组内的边（只包含子节点之间的边）
      const childNodeIds = new Set(childNodes.map(n => n.id));
      const groupInternalEdges = allEdges.filter(
        e => childNodeIds.has(e.source) && childNodeIds.has(e.target)
      );

      // 4. 构建只包含子节点的 ELK 图
      const elkLayoutOptions = options
        ? buildELKConfig(GROUP_INTERNAL_CONFIG, options)
        : GROUP_INTERNAL_CONFIG;

      const elkGraph = this.adapter.toElkGraph(childNodes, groupInternalEdges, elkLayoutOptions);

      // 5. 执行 ELK 布局
      const startTime = performance.now();
      const elkResult = await this.elkAlgorithm.getELK().layout(elkGraph);
      const duration = performance.now() - startTime;

      // 6. 转换结果
      const layoutResult = new Map<string, any>();

      // 首先更新所有子节点的位置
      const flattenedNodes = this.adapter.flattenELKNodes(elkResult.children);
      flattenedNodes.forEach((elkNode, nodeId) => {
        // 相对于群组位置的坐标（保持绝对坐标）
        layoutResult.set(nodeId, {
          x: (groupNode as any).position.x + elkNode.x,
          y: (groupNode as any).position.y + elkNode.y,
          width: elkNode.width,
          height: elkNode.height
        });
      });

      // 然后更新群组大小（ELK 自动计算）
      layoutResult.set(groupId, {
        x: (groupNode as any).position.x,
        y: (groupNode as any).position.y,
        width: elkResult.width || groupNode.width,
        height: elkResult.height || groupNode.height,
        boundary: {
          minX: (groupNode as any).position.x,
          minY: (groupNode as any).position.y,
          maxX: (groupNode as any).position.x + (elkResult.width || groupNode.width),
          maxY: (groupNode as any).position.y + (elkResult.height || groupNode.height)
        }
      });

      // 7. 优化边的连接点
      const mergedNodes = Array.from(layoutResult.entries()).map(([id, pos]) => {
        const original = allNodes.find(n => n.id === id);
        return original ? { ...original, position: { x: pos.x, y: pos.y }, width: pos.width, height: pos.height } : original;
      }).filter(Boolean) as (Node | Group)[];

      const optimizedEdges = this.edgeOptimizer.optimizeEdgeHandles(mergedNodes, groupInternalEdges);

      const edgesResult = new Map();
      optimizedEdges.forEach((edge, edgeId) => {
        edgesResult.set(edgeId, {
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle
        });
      });

      console.log(`✅ 群组内部布局完成，耗时: ${duration.toFixed(2)}ms`);
      return {
        success: true,
        nodes: layoutResult,
        edges: edgesResult,
        errors: [],
        stats: { duration, iterations: 1, collisions: 0, nodesLayouted: layoutResult.size }
      };
    } catch (error) {
      console.error('Group internal layout error:', error);
      return {
        success: false,
        nodes: new Map(),
        edges: new Map(),
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        stats: { duration: 0, iterations: 0, collisions: 0 }
      };
    }
  }
}
