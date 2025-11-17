// src/services/layout/strategies/GridCenterLayoutStrategy.ts
import { Node, Group, Edge, BlockEnum } from '../../../types/graph/models';
import { ILayoutStrategy, LayoutResult, LayoutOptions } from '../types/layoutTypes';
import { GeometryUtils } from '../utils/GeometryUtils';
import { LAYOUT_CONFIG } from '../../../config/graph.config';
import { applyOffsetToDescendants, getAbsolutePosition } from '../../../utils/graph/recursiveMoveHelpers';
import { EdgeOptimizer, OptimizedEdge } from '../algorithms/EdgeOptimizer';

export interface GridCenterLayoutOptions extends LayoutOptions {
  centerWeight?: number;
  useWeightedLayout?: boolean;
  gridSpacing?: number;
}

export class GridCenterLayoutStrategy implements ILayoutStrategy {
  name = 'Grid Center Layout';
  id = 'grid-center-layout';

  // 边优化器实例
  private edgeOptimizer: EdgeOptimizer;

  constructor() {
    this.edgeOptimizer = new EdgeOptimizer();
  }

  async applyLayout(
    nodes: (Node | Group)[],
    edges: Edge[],
    options?: GridCenterLayoutOptions
  ): Promise<LayoutResult> {
    const startTime = performance.now();

    try {
      // 首先标准化节点尺寸，对有子节点的Group保持原始尺寸
      const normalizedNodes = this.normalizeNodeSizes(nodes);

      // 计算节点权重来影响布局
      const weights = this.calculateWeights(normalizedNodes, edges);
      let processedNodes = [...normalizedNodes];

      // 按权重排序节点（高权重节点优先）
      if (options?.useWeightedLayout) {
        processedNodes = this.sortNodesByWeight(normalizedNodes, weights);
      }

      // 应用网格布局 - 以权重为主要考虑因素
      const gridOptions = {
        rows: Math.ceil(Math.sqrt(processedNodes.length)),
        cols: Math.ceil(processedNodes.length / Math.ceil(Math.sqrt(processedNodes.length))),
        spacing: options?.gridSpacing || LAYOUT_CONFIG.layoutAlgorithm.gridSpacing
      };

      // 计算网格中心位置
      const positionedNodes = this.calculateGridCenterPositions(processedNodes, gridOptions);

      // 重点：解决同层节点之间的碰撞
      const resolvedNodes = this.resolveCollisions(positionedNodes);

      // 实现嵌套节点的相对位置保持机制
      const finalNodes = this.updateNestedNodePositions(nodes, resolvedNodes);

      // 优化边的连接点
      const optimizedEdges = this.edgeOptimizer.optimizeEdgeHandles(finalNodes, edges);

      const endTime = performance.now();

      // 创建结果映射
      const nodePositions = new Map<string, { x: number; y: number }>();
      for (const node of finalNodes) {
        nodePositions.set(node.id, node.position);
      }

      // 创建边映射
      const edgeHandles = new Map<string, OptimizedEdge>();
      for (const edge of optimizedEdges) {
        edgeHandles.set(edge.id, edge);
      }

      return {
        success: true,
        nodes: nodePositions,
        edges: edgeHandles, // 返回优化后的边信息
        errors: [],
        stats: {
          duration: endTime - startTime,
          iterations: 1,
          collisions: this.countCollisions(resolvedNodes)
        }
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        success: false,
        nodes: new Map(),
        edges: new Map(),
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
        stats: {
          duration: endTime - startTime,
          iterations: 0,
          collisions: 0
        }
      };
    }
  }
  
  /**
   * 标准化节点尺寸
   */
  private normalizeNodeSizes(nodes: (Node | Group)[]): (Node | Group)[] {
    return nodes.map(node => {
      // 先检查是否为Group节点
      if (node.type === BlockEnum.GROUP) {
        // 检查是否存在嵌套关系
        const hasChildren = nodes.some(n => ('groupId' in n) && (n.groupId === node.id));

        // 如果group有子节点，保留其原始尺寸
        if (hasChildren) {
          return node;
        }
        // 否则，应用归一化尺寸
        else {
          return {
            ...node,
            width: node.width || LAYOUT_CONFIG.nodeSize.groupNode.width,
            height: node.height || LAYOUT_CONFIG.nodeSize.groupNode.height
          };
        }
      }
      // 非Group节点应用归一化尺寸
      else {
        return {
          ...node,
          width: node.width || LAYOUT_CONFIG.nodeSize.defaultNode.width,
          height: node.height || LAYOUT_CONFIG.nodeSize.defaultNode.height
        };
      }
    });
  }
  
  /**
   * 计算节点权重
   * 根据节点大小和边数量计算权重
   */
  private calculateWeights(nodes: (Node | Group)[], edges: Edge[]): Map<string, number> {
    const weights = new Map<string, number>();

    for (const node of nodes) {
      // 计算节点面积权重（归一化）
      const area = (node.width || LAYOUT_CONFIG.nodeSize.defaultNode.width) *
                   (node.height || LAYOUT_CONFIG.nodeSize.defaultNode.height);
      const maxArea = LAYOUT_CONFIG.weight.maxArea;
      const areaWeight = Math.min(1, area / maxArea);

      // 计算边数权重（总连接数）
      const connectedEdges = edges.filter(e => e.source === node.id || e.target === node.id);
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
   * 按权重排序节点
   */
  private sortNodesByWeight(nodes: (Node | Group)[], weights: Map<string, number>): (Node | Group)[] {
    return [...nodes].sort((a, b) => {
      const weightA = weights.get(a.id) || 0;
      const weightB = weights.get(b.id) || 0;
      return weightB - weightA; // 按权重降序排列
    });
  }
  
  /**
   * 计算网格中心布局位置
   */
  private calculateGridCenterPositions(nodes: (Node | Group)[], opts: { rows: number; cols: number; spacing: number }): (Node | Group)[] {
    const result: (Node | Group)[] = [];
    
    // 计算网格中心
    const nodeWidth = nodes.length > 0 ? (nodes[0].width || LAYOUT_CONFIG.nodeSize.defaultNode.width) : LAYOUT_CONFIG.nodeSize.defaultNode.width;
    const nodeHeight = nodes.length > 0 ? (nodes[0].height || LAYOUT_CONFIG.nodeSize.defaultNode.height) : LAYOUT_CONFIG.nodeSize.defaultNode.height;

    const gridWidth = (opts.cols - 1) * opts.spacing + opts.cols * nodeWidth;
    const gridHeight = (opts.rows - 1) * opts.spacing + opts.rows * nodeHeight;

    const offsetX = -gridWidth / 2;
    const offsetY = -gridHeight / 2;
    
    for (let i = 0; i < nodes.length; i++) {
      const row = Math.floor(i / opts.cols);
      const col = i % opts.cols;
      
      const x = offsetX + col * (nodeWidth + opts.spacing) + nodeWidth / 2;
      const y = offsetY + row * (nodeHeight + opts.spacing) + nodeHeight / 2;
      
      result.push({
        ...nodes[i],
        position: { x, y }
      });
    }
    
    return result;
  }
  
  /**
   * 解决节点碰撞
   */
  private resolveCollisions(nodes: (Node | Group)[]): (Node | Group)[] {
    let resolvedNodes = [...nodes];
    let hasCollisions = true;
    let iterations = 0;
    const maxIterations = LAYOUT_CONFIG.collision.maxIterations;

    while (hasCollisions && iterations < maxIterations) {
      hasCollisions = false;
      const collisionPairs: { node1: number; node2: number }[] = [];

      // 检测碰撞
      for (let i = 0; i < resolvedNodes.length; i++) {
        for (let j = i + 1; j < resolvedNodes.length; j++) {
          const node1 = resolvedNodes[i];
          const node2 = resolvedNodes[j];

          if (GeometryUtils.isOverlapping(
            {
              x: node1.position.x - (node1.width || 0) / 2,
              y: node1.position.y - (node1.height || 0) / 2,
              width: node1.width || LAYOUT_CONFIG.nodeSize.defaultNode.width,
              height: node1.height || LAYOUT_CONFIG.nodeSize.defaultNode.height
            },
            {
              x: node2.position.x - (node2.width || 0) / 2,
              y: node2.position.y - (node2.height || 0) / 2,
              width: node2.width || LAYOUT_CONFIG.nodeSize.defaultNode.width,
              height: node2.height || LAYOUT_CONFIG.nodeSize.defaultNode.height
            }
          )) {
            collisionPairs.push({ node1: i, node2: j });
            hasCollisions = true;
          }
        }
      }

      // 解决碰撞
      for (const pair of collisionPairs) {
        const node1 = resolvedNodes[pair.node1];
        const node2 = resolvedNodes[pair.node2];

        const mtv = GeometryUtils.getMTV(
          {
            x: node1.position.x - (node1.width || 0) / 2,
            y: node1.position.y - (node1.height || 0) / 2,
            width: node1.width || LAYOUT_CONFIG.nodeSize.defaultNode.width,
            height: node1.height || LAYOUT_CONFIG.nodeSize.defaultNode.height
          },
          {
            x: node2.position.x - (node2.width || 0) / 2,
            y: node2.position.y - (node2.height || 0) / 2,
            width: node2.width || LAYOUT_CONFIG.nodeSize.defaultNode.width,
            height: node2.height || LAYOUT_CONFIG.nodeSize.defaultNode.height
          }
        );

        if (mtv) {
          // 应用排斥力，将两个节点分开
          const repulsionForce = LAYOUT_CONFIG.collision.repulsionForce;

          resolvedNodes[pair.node1] = {
            ...resolvedNodes[pair.node1],
            position: {
              x: resolvedNodes[pair.node1].position.x + mtv.x * 0.5 * repulsionForce,
              y: resolvedNodes[pair.node1].position.y + mtv.y * 0.5 * repulsionForce
            }
          };

          resolvedNodes[pair.node2] = {
            ...resolvedNodes[pair.node2],
            position: {
              x: resolvedNodes[pair.node2].position.x - mtv.x * 0.5 * repulsionForce,
              y: resolvedNodes[pair.node2].position.y - mtv.y * 0.5 * repulsionForce
            }
          };
        }
      }

      iterations++;
    }
    
    return resolvedNodes;
  }
  
  /**
   * 计算碰撞数量
   */
  private countCollisions(nodes: (Node | Group)[]): number {
    let count = 0;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        
        if (GeometryUtils.isOverlapping(
          {
            x: node1.position.x - (node1.width || 0) / 2,
            y: node1.position.y - (node1.height || 0) / 2,
            width: node1.width || LAYOUT_CONFIG.nodeSize.defaultNode.width,
            height: node1.height || LAYOUT_CONFIG.nodeSize.defaultNode.height
          },
          {
            x: node2.position.x - (node2.width || 0) / 2,
            y: node2.position.y - (node2.height || 0) / 2,
            width: node2.width || LAYOUT_CONFIG.nodeSize.defaultNode.width,
            height: node2.height || LAYOUT_CONFIG.nodeSize.defaultNode.height
          }
        )) {
          count++;
        }
      }
    }
    return count;
  }

  /**
   * 根据父节点的新位置更新嵌套节点的相对位置
   * 在布局算法中，我们只移动顶层节点，保持所有嵌套节点相对于父节点的相对位置不变
   */
  private updateNestedNodePositions(
    originalNodes: (Node | Group)[],
    positionedNodes: (Node | Group)[]
  ): (Node | Group)[] {
    // 首先，找出哪些是顶层节点（没有父群组的节点）
    const topLevelNodes = positionedNodes.filter(node =>
      !('groupId' in node) || !node.groupId
    );

    // 找出嵌套节点（属于某个群组的节点）
    const nestedNodes = originalNodes.filter(node =>
      'groupId' in node && node.groupId
    );

    // 构建结果数组，顶层节点使用布局后的位置
    let resultNodes = [...topLevelNodes];

    // 对于嵌套节点，需要保持它们相对于父群组的相对位置
    for (const nestedNode of nestedNodes) {
      // 找到原始的父群组
      const originalParentGroup = originalNodes.find(
        node => node.id === nestedNode.groupId && node.type === BlockEnum.GROUP
      ) as Group;

      if (originalParentGroup) {
        // 找到布局后的新父群组位置
        const newParentGroup = positionedNodes.find(
          node => node.id === nestedNode.groupId && node.type === BlockEnum.GROUP
        ) as Group;

        if (newParentGroup) {
          // 计算嵌套节点相对于原始父群组的相对位置
          const relativeX = nestedNode.position.x - originalParentGroup.position.x;
          const relativeY = nestedNode.position.y - originalParentGroup.position.y;

          // 基于新父群组位置和相对位置，确定嵌套节点的新绝对位置
          const newX = newParentGroup.position.x + relativeX;
          const newY = newParentGroup.position.y + relativeY;

          // 添加到结果中，保持相对于父群组的相对位置
          resultNodes.push({
            ...nestedNode,
            position: { x: newX, y: newY }
          });
        } else {
          // 如果父群组在布局后不存在，则保持原始位置
          resultNodes.push(nestedNode);
        }
      } else {
        // 如果找不到原始父群组，保持原始位置
        resultNodes.push(nestedNode);
      }
    }

    // 重要：在布局阶段完成节点定位，避免后续约束逻辑影响
    // 我们需要确保所有嵌套节点在父群组的边界内，但保持它们之间的相对位置
    resultNodes = this.adjustNestedNodesWithinBounds(resultNodes);

    return resultNodes;
  }

  /**
   * 调整嵌套节点确保它们在父群组边界内，同时保持彼此间的相对位置
   */
  private adjustNestedNodesWithinBounds(nodes: (Node | Group)[]): (Node | Group)[] {
    return nodes.map(node => {
      // 只处理有父群组的节点
      if ('groupId' in node && node.groupId) {
        const parentGroup = nodes.find(n => n.id === node.groupId && n.type === BlockEnum.GROUP) as Group;

        if (parentGroup) {
          // 获取节点在父群组内的相对位置
          let { x, y } = node.position;

          // 计算节点在父群组内的相对坐标（以父群组左上角为原点）
          const relativeX = x - parentGroup.position.x;
          const relativeY = y - parentGroup.position.y;

          // 获取节点和群组的尺寸
          const nodeWidth = node.width || LAYOUT_CONFIG.nodeSize.defaultNode.width;
          const nodeHeight = node.height || LAYOUT_CONFIG.nodeSize.defaultNode.height;
          const groupWidth = parentGroup.width || LAYOUT_CONFIG.nodeSize.groupNode.width;
          const groupHeight = parentGroup.height || LAYOUT_CONFIG.nodeSize.groupNode.height;

          // 检查是否超出边界，并调整相对位置
          let adjustedRelativeX = relativeX;
          let adjustedRelativeY = relativeY;

          // 检查右边界和下边界 - 确保节点不超出群组
          if (relativeX + nodeWidth > groupWidth - 20) {  // 20px 为边距
            adjustedRelativeX = groupWidth - nodeWidth - 20;
          }
          if (relativeY + nodeHeight > groupHeight - 20) {
            adjustedRelativeY = groupHeight - nodeHeight - 20;
          }

          // 检查左边界和上边界
          if (relativeX < 20) {
            adjustedRelativeX = 20;
          }
          if (relativeY < 20) {
            adjustedRelativeY = 20;
          }

          // 如果位置被调整，更新节点位置
          if (adjustedRelativeX !== relativeX || adjustedRelativeY !== relativeY) {
            const absoluteX = parentGroup.position.x + adjustedRelativeX;
            const absoluteY = parentGroup.position.y + adjustedRelativeY;

            return {
              ...node,
              position: {
                x: absoluteX,
                y: absoluteY
              }
            };
          }
        }
      }

      return node;
    });
  }

  validateConfig(config: any): boolean {
    if (config.centerWeight !== undefined && (config.centerWeight < 0 || config.centerWeight > 1)) {
      return false;
    }
    if (config.gridSpacing !== undefined && config.gridSpacing < 0) {
      return false;
    }
    return true;
  }
}