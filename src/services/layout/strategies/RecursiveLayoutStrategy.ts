// src/services/layout/strategies/RecursiveLayoutStrategy.ts
import { Node, Group, Edge, BlockEnum } from '../../../types/graph/models';
import { ILayoutStrategy, LayoutResult, LayoutOptions } from '../types/layoutTypes';

// 依赖的策略
import { GroupLayoutStrategy } from './GroupLayoutStrategy';
import { CanvasLayoutStrategy } from './CanvasLayoutStrategy';

// 工具层
import { NestingTreeBuilder } from '../utils/NestingTreeBuilder';
import { GroupSizeAdjuster } from '../utils/GroupSizeAdjuster';
import { EdgeOptimizer } from '../algorithms/EdgeOptimizer';

/**
 * 递归布局策略
 *
 * 职责：
 * - 对所有嵌套层级的节点进行递归布局
 * - 从最深层群组开始，逐层向上布局
 * - 最后布局顶层节点
 * - 自动调整所有群组大小
 *
 * 核心思想：
 * - 递归布局是 GroupLayoutStrategy 和 CanvasLayoutStrategy 的编排器
 * - 不重新实现布局逻辑，而是协调其他策略的执行
 *
 * 流程：
 * 1. 构建嵌套层级树（使用 NestingTreeBuilder）
 * 2. 从最深层到第1层，依次布局每个群组（调用 GroupLayoutStrategy）
 * 3. 布局顶层节点（调用 CanvasLayoutStrategy）
 * 4. 从深到浅调整所有群组大小
 * 5. 优化所有边
 * 6. 返回完整的布局结果
 */
export class RecursiveLayoutStrategy implements ILayoutStrategy {
  readonly name = 'Recursive Layout';
  readonly id = 'recursive-layout';

  private groupStrategy: GroupLayoutStrategy;
  private canvasStrategy: CanvasLayoutStrategy;
  private treeBuilder: NestingTreeBuilder;
  private edgeOptimizer: EdgeOptimizer;

  constructor(
    groupStrategy?: GroupLayoutStrategy,
    canvasStrategy?: CanvasLayoutStrategy,
    treeBuilder?: NestingTreeBuilder,
    edgeOptimizer?: EdgeOptimizer
  ) {
    this.groupStrategy = groupStrategy || new GroupLayoutStrategy();
    this.canvasStrategy = canvasStrategy || new CanvasLayoutStrategy();
    this.treeBuilder = treeBuilder || new NestingTreeBuilder();
    this.edgeOptimizer = edgeOptimizer || new EdgeOptimizer();
  }

  /**
   * 应用递归布局
   */
  async applyLayout(
    nodes: (Node | Group)[],
    edges: Edge[],
    options?: LayoutOptions
  ): Promise<LayoutResult> {
    const startTime = performance.now();
    const stats = { duration: 0, iterations: 0, collisions: 0 };

    try {
      console.log(`🌳 RecursiveLayoutStrategy: 开始递归布局，共 ${nodes.length} 个节点`);

      // 1. 构建嵌套层级树
      const depthGroups = this.treeBuilder.groupNodesByDepth(nodes);
      const maxDepth = this.treeBuilder.getMaxDepth(depthGroups);

      console.log(`🌳 检测到 ${depthGroups.size} 层嵌套结构，最大深度: ${maxDepth}`);

      // 2. 创建工作节点副本（用于逐步更新位置）
      let workingNodes = nodes.map(n => ({ ...n, position: { ...n.position } }));
      const allUpdatedPositions = new Map<string, { x: number; y: number }>();

      let totalProcessedNodes = 0;
      const totalNodes = nodes.length;

      // 3. 从最深层向上逐层布局群组
      for (let depth = maxDepth; depth > 0; depth--) {
        const groupsAtDepth = this.treeBuilder.getGroupsAtDepth(depthGroups, depth);

        if (groupsAtDepth.length === 0) {
          console.log(`📐 深度 ${depth} 没有群组，跳过`);
          continue;
        }

        console.log(`📐 处理深度 ${depth}，群组数量: ${groupsAtDepth.length}`);

        // 布局每个群组的子节点
        for (const group of groupsAtDepth) {
          const childrenCount = workingNodes.filter(
            n => 'groupId' in n && (n as Node).groupId === group.id
          ).length;

          if (childrenCount === 0) {
            console.log(`  └─ 群组 ${group.id.substring(0, 8)}... 没有子节点，跳过`);
            continue;
          }

          console.log(`  └─ 布局群组 ${group.id.substring(0, 8)}... 的 ${childrenCount} 个子节点`);

          // 调用群组布局策略
          const layoutResult = await this.groupStrategy.applyLayout(
            workingNodes,
            edges,
            {
              targetGroupId: group.id,
              gridSpacing: options?.gridSpacing,
              ...options
            }
          );

          // 合并布局结果
          if (layoutResult.success) {
            this.mergeLayoutResult(workingNodes, allUpdatedPositions, layoutResult);
            stats.iterations += layoutResult.stats.iterations;
            stats.collisions += layoutResult.stats.collisions;
            totalProcessedNodes += layoutResult.nodes.size;

            // 发送进度更新（如果提供了回调）
            if (options?.onProgress) {
              options.onProgress({
                currentLevel: maxDepth - depth + 1,
                totalLevels: maxDepth + 1,
                processedNodes: totalProcessedNodes,
                totalNodes: totalNodes
              });
            }
          } else {
            console.warn(`  └─ 群组 ${group.id} 布局失败:`, layoutResult.errors);
          }
        }
      }

      // 4. 布局顶层节点
      console.log(`📐 处理顶层节点`);
      const topLevelResult = await this.canvasStrategy.applyLayout(
        workingNodes,
        edges,
        {
          useWeightedLayout: options?.useWeightedLayout,
          gridSpacing: options?.gridSpacing,
          ...options
        }
      );

      if (topLevelResult.success) {
        this.mergeLayoutResult(workingNodes, allUpdatedPositions, topLevelResult);
        stats.iterations += topLevelResult.stats.iterations;
        stats.collisions += topLevelResult.stats.collisions;
        totalProcessedNodes = allUpdatedPositions.size;

        // 发送最终进度
        if (options?.onProgress) {
          options.onProgress({
            currentLevel: maxDepth + 1,
            totalLevels: maxDepth + 1,
            processedNodes: totalProcessedNodes,
            totalNodes: totalNodes
          });
        }
      }

      // 5. 从深到浅调整所有群组大小
      console.log(`🔧 调整群组大小以适应子节点`);
      const adjustedNodes = this.adjustAllGroupSizes(
        workingNodes,
        depthGroups,
        maxDepth
      );

      // 6. 更新群组尺寸信息到结果 Map
      this.updateGroupSizesInResult(adjustedNodes, allUpdatedPositions);

      // 7. 优化所有边的连接点
      console.log(`🔄 优化边的连接点`);
      const optimizedEdges = this.edgeOptimizer.optimizeEdgeHandles(
        adjustedNodes,
        edges
      );

      const endTime = performance.now();
      stats.duration = endTime - startTime;

      console.log(`✅ 递归布局完成！`);
      console.log(`   • 处理了 ${maxDepth + 1} 层嵌套结构`);
      console.log(`   • 更新了 ${allUpdatedPositions.size} 个节点`);
      console.log(`   • 优化了 ${optimizedEdges.length} 条边`);
      console.log(`   • 总迭代次数: ${stats.iterations}`);
      console.log(`   • 碰撞处理次数: ${stats.collisions}`);
      console.log(`   • 耗时: ${stats.duration.toFixed(0)}ms`);

      return {
        success: true,
        nodes: allUpdatedPositions,
        edges: new Map(optimizedEdges.map(e => [e.id, e])),
        errors: [],
        stats
      };

    } catch (error) {
      const endTime = performance.now();
      console.error('❌ 递归布局失败:', error);

      return {
        success: false,
        nodes: new Map(),
        edges: new Map(),
        errors: [error instanceof Error ? error.message : 'Unknown error in recursive layout'],
        stats: { ...stats, duration: endTime - startTime }
      };
    }
  }

  /**
   * 合并布局结果到工作节点和结果 Map
   */
  private mergeLayoutResult(
    workingNodes: (Node | Group)[],
    resultMap: Map<string, any>,
    layoutResult: LayoutResult
  ): void {
    layoutResult.nodes.forEach((pos, nodeId) => {
      // 更新工作节点数组
      const node = workingNodes.find(n => n.id === nodeId);
      if (node) {
        node.position = { x: pos.x, y: pos.y };

        // 如果有尺寸信息，也更新
        if ((pos as any).width !== undefined) {
          node.width = (pos as any).width;
        }
        if ((pos as any).height !== undefined) {
          node.height = (pos as any).height;
        }
        if ((pos as any).boundary !== undefined && node.type === BlockEnum.GROUP) {
          (node as Group).boundary = (pos as any).boundary;
        }
      }

      // 更新结果 Map
      resultMap.set(nodeId, pos);
    });
  }

  /**
   * 从深到浅调整所有群组大小
   */
  private adjustAllGroupSizes(
    nodes: (Node | Group)[],
    depthGroups: Map<number, (Node | Group)[]>,
    maxDepth: number
  ): (Node | Group)[] {
    let workingNodes = [...nodes];

    console.log(`🔧 开始调整群组大小（从深度 ${maxDepth} 到 0）`);

    // 从最深层向上逐层调整群组大小
    for (let depth = maxDepth; depth >= 0; depth--) {
      const groupsAtDepth = this.treeBuilder.getGroupsAtDepth(depthGroups, depth);

      for (const group of groupsAtDepth) {
        const children = workingNodes.filter(
          n => 'groupId' in n && (n as Node).groupId === group.id
        );

        if (children.length === 0) continue;

        // 使用工具类调整群组大小
        workingNodes = GroupSizeAdjuster.adjustSingleGroup(group.id, workingNodes);
      }
    }

    return workingNodes;
  }

  /**
   * 更新群组尺寸信息到结果 Map
   */
  private updateGroupSizesInResult(
    adjustedNodes: (Node | Group)[],
    resultMap: Map<string, any>
  ): void {
    for (const node of adjustedNodes) {
      if (node.type === BlockEnum.GROUP) {
        const pos = resultMap.get(node.id);
        if (pos) {
          // 更新尺寸信息
          if (node.width) (pos as any).width = node.width;
          if (node.height) (pos as any).height = node.height;
          if ((node as Group).boundary) (pos as any).boundary = (node as Group).boundary;
        } else {
          // 如果群组不在结果中，添加它（保持原位置，但更新尺寸）
          resultMap.set(node.id, {
            x: node.position.x,
            y: node.position.y,
            ...(node.width && { width: node.width }),
            ...(node.height && { height: node.height }),
            ...((node as Group).boundary && { boundary: (node as Group).boundary })
          });
        }
      }
    }
  }

  /**
   * 验证配置
   */
  validateConfig(config: any): boolean {
    // 递归布局不需要特殊配置验证
    return true;
  }
}
