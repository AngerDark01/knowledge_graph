// src/services/layout/strategies/GridCenterLayoutStrategy.ts
import { Node, Group, Edge, BlockEnum } from '../../../types/graph/models';
import { ILayoutStrategy, LayoutResult, LayoutOptions } from '../types/layoutTypes';
import { GeometryUtils } from '../utils/GeometryUtils';
import { LAYOUT_CONFIG, GRID_LAYOUT } from '../../../config/graph.config';
import { applyOffsetToDescendants, getAbsolutePosition } from '../../../utils/graph/recursiveMoveHelpers';
import { EdgeOptimizer, OptimizedEdge } from '../algorithms/EdgeOptimizer';
import { NestingTreeBuilder } from '../utils/NestingTreeBuilder';

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

  /**
   * 根据布局选项获取目标节点
   * @param allNodes 所有节点
   * @param options 布局选项
   * @returns 需要参与布局的节点列表
   */
  private getTargetNodes(
    allNodes: (Node | Group)[],
    options?: GridCenterLayoutOptions
  ): (Node | Group)[] {
    const targetGroupId = options?.targetGroupId;

    if (!targetGroupId) {
      // 原有逻辑：返回顶层节点（没有 groupId 的节点）
      return allNodes.filter(node =>
        !('groupId' in node) || !(node as Node).groupId
      );
    }

    // 新逻辑：返回指定群组的直接子节点
    return allNodes.filter(node =>
      'groupId' in node && (node as Node).groupId === targetGroupId
    );
  }

  /**
   * 将节点约束在群组边界内
   * @param nodes 需要约束的节点列表
   * @param parentGroup 父群组
   * @param options 布局选项
   * @returns 约束后的节点列表
   */
  private constrainToGroupBoundary(
    nodes: (Node | Group)[],
    parentGroup: Group,
    options?: GridCenterLayoutOptions
  ): (Node | Group)[] {
    const padding = LAYOUT_CONFIG.group;

    const groupBounds = {
      minX: parentGroup.position.x + padding.paddingLeft,
      minY: parentGroup.position.y + padding.paddingTop,
      maxX: parentGroup.position.x + (parentGroup.width || LAYOUT_CONFIG.nodeSize.groupNode.width) - padding.paddingRight,
      maxY: parentGroup.position.y + (parentGroup.height || LAYOUT_CONFIG.nodeSize.groupNode.height) - padding.paddingBottom
    };

    return nodes.map(node => {
      const nodeWidth = node.width || LAYOUT_CONFIG.nodeSize.defaultNode.width;
      const nodeHeight = node.height || LAYOUT_CONFIG.nodeSize.defaultNode.height;

      // 确保节点中心点在群组边界内
      const constrainedX = Math.max(
        groupBounds.minX + nodeWidth / 2,
        Math.min(groupBounds.maxX - nodeWidth / 2, node.position.x)
      );

      const constrainedY = Math.max(
        groupBounds.minY + nodeHeight / 2,
        Math.min(groupBounds.maxY - nodeHeight / 2, node.position.y)
      );

      return {
        ...node,
        position: { x: constrainedX, y: constrainedY }
      };
    });
  }

  /**
   * 计算群组内部的网格布局（使用相对位置）
   * 核心改进：先计算相对于群组的相对坐标，再转换为绝对坐标
   * 这样可以提高空间利用率，逻辑更清晰
   *
   * @param nodes 需要布局的节点
   * @param parentGroup 父群组
   * @param options 布局选项
   * @returns 布局后的节点列表
   */
  private calculateGroupGridLayout(
    nodes: (Node | Group)[],
    parentGroup: Group,
    options?: GridCenterLayoutOptions
  ): (Node | Group)[] {
    if (nodes.length === 0) return nodes;

    const padding = LAYOUT_CONFIG.group;
    const groupWidth = parentGroup.width || LAYOUT_CONFIG.nodeSize.groupNode.width;
    const groupHeight = parentGroup.height || LAYOUT_CONFIG.nodeSize.groupNode.height;

    // 1. 计算可用空间（相对于群组内部）
    const availableWidth = groupWidth - padding.paddingLeft - padding.paddingRight;
    const availableHeight = groupHeight - padding.paddingTop - padding.paddingBottom;

    // 2. 获取节点尺寸（支持不同节点不同尺寸）
    const nodeWidths = nodes.map(n => n.width || LAYOUT_CONFIG.nodeSize.defaultNode.width);
    const nodeHeights = nodes.map(n => n.height || LAYOUT_CONFIG.nodeSize.defaultNode.height);
    const avgNodeWidth = nodeWidths.reduce((a, b) => a + b, 0) / nodes.length;
    const avgNodeHeight = nodeHeights.reduce((a, b) => a + b, 0) / nodes.length;

    // 3. 智能计算最优列数（考虑可用空间）
    const minSpacing = 20; // 最小间距
    const estimatedCols = Math.floor(availableWidth / (avgNodeWidth + minSpacing));
    const optimalCols = Math.max(1, Math.min(estimatedCols, Math.ceil(Math.sqrt(nodes.length))));
    const rows = Math.ceil(nodes.length / optimalCols);

    console.log(`  └─ 群组内布局: ${nodes.length}个节点, ${optimalCols}列 x ${rows}行, 可用空间: ${Math.round(availableWidth)}x${Math.round(availableHeight)}`);

    // 4. 计算节点网格的总尺寸
    const totalNodesWidth = avgNodeWidth * optimalCols;
    const totalNodesHeight = avgNodeHeight * rows;

    // 5. 🔧 计算自适应间距（混合策略：有上限限制，防止过度分散）
    // 最大间距限制：取较小值 - 80px 或节点宽度/高度的 50%
    const maxHorizontalSpacing = Math.min(80, avgNodeWidth * 0.5);
    const maxVerticalSpacing = Math.min(80, avgNodeHeight * 0.5);

    // 计算理想间距（基于可用空间）
    const idealHorizontalSpacing = optimalCols > 1
      ? (availableWidth - totalNodesWidth) / (optimalCols - 1)
      : minSpacing;

    const idealVerticalSpacing = rows > 1
      ? (availableHeight - totalNodesHeight) / (rows - 1)
      : minSpacing;

    // 应用限制：minSpacing ≤ spacing ≤ maxSpacing
    const horizontalSpacing = optimalCols > 1
      ? Math.max(minSpacing, Math.min(maxHorizontalSpacing, idealHorizontalSpacing))
      : minSpacing;

    const verticalSpacing = rows > 1
      ? Math.max(minSpacing, Math.min(maxVerticalSpacing, idealVerticalSpacing))
      : minSpacing;

    console.log(`  └─ 间距控制: 水平=${Math.round(horizontalSpacing)}px (理想=${Math.round(idealHorizontalSpacing)}px, 上限=${Math.round(maxHorizontalSpacing)}px), 垂直=${Math.round(verticalSpacing)}px`);

    // 6. 计算网格在可用空间中的起始偏移（居中对齐）
    const gridWidth = totalNodesWidth + horizontalSpacing * Math.max(0, optimalCols - 1);
    const gridHeight = totalNodesHeight + verticalSpacing * Math.max(0, rows - 1);

    const offsetX = Math.max(0, (availableWidth - gridWidth) / 2);
    const offsetY = Math.max(0, (availableHeight - gridHeight) / 2);

    // 7. 使用相对位置布局每个节点
    return nodes.map((node, index) => {
      const row = Math.floor(index / optimalCols);
      const col = index % optimalCols;

      const nodeWidth = nodeWidths[index];
      const nodeHeight = nodeHeights[index];

      // 7.1 计算相对于群组内部padding区域的相对位置
      const relativeX = offsetX + col * (avgNodeWidth + horizontalSpacing) + nodeWidth / 2;
      const relativeY = offsetY + row * (avgNodeHeight + verticalSpacing) + nodeHeight / 2;

      // 7.2 转换为相对于群组左上角的位置（加上padding）
      const groupRelativeX = padding.paddingLeft + relativeX;
      const groupRelativeY = padding.paddingTop + relativeY;

      // 7.3 转换为画布绝对位置
      const absoluteX = parentGroup.position.x + groupRelativeX;
      const absoluteY = parentGroup.position.y + groupRelativeY;

      return {
        ...node,
        position: { x: absoluteX, y: absoluteY }
      };
    });
  }

  async applyLayout(
    nodes: (Node | Group)[],
    edges: Edge[],
    options?: GridCenterLayoutOptions
  ): Promise<LayoutResult> {
    const startTime = performance.now();

    try {
      // ✨ 检测是否为递归布局模式
      if (options?.layoutMode === 'recursive') {
        console.log('🌳 启动递归布局模式');
        return this.applyRecursiveLayout(nodes, edges, options);
      }
      // ✨ 使用新的节点过滤方法获取目标节点
      const targetNodes = this.getTargetNodes(nodes, options);
      const otherNodes = nodes.filter(n => !targetNodes.some(tn => tn.id === n.id));

      // 首先标准化节点尺寸，对有子节点的Group保持原始尺寸（为了边优化）
      const normalizedNodes = this.normalizeNodeSizes(nodes);

      // ✨ 如果是群组内部布局，使用顶层布局算法 + 第四象限转换算子
      if (options?.targetGroupId) {
        const parentGroup = nodes.find(n =>
          n.id === options.targetGroupId && n.type === BlockEnum.GROUP
        ) as Group | undefined;

        if (!parentGroup) {
          throw new Error(`目标群组 ${options.targetGroupId} 不存在`);
        }

        console.log(`📐 对群组 ${parentGroup.id} 内的 ${targetNodes.length} 个子节点进行布局`);

        // ✅ 1. 使用和顶层相同的布局算法
        const gridOptions = {
          rows: Math.ceil(targetNodes.length / GRID_LAYOUT.NODES_PER_ROW),
          cols: GRID_LAYOUT.NODES_PER_ROW,
          spacing: options?.gridSpacing || LAYOUT_CONFIG.layoutAlgorithm.gridSpacing,
          horizontalSpacing: GRID_LAYOUT.HORIZONTAL_SPACING,
          verticalSpacing: GRID_LAYOUT.VERTICAL_SPACING
        };

        // ✅ 2. 计算相对于原点(0,0)的布局（和顶层一样）
        const relativePositionedNodes = this.calculateGridCenterPositions(targetNodes, gridOptions);

        // ✅ 3. 转换算子：计算网格边界框
        let minX = Infinity, minY = Infinity;

        relativePositionedNodes.forEach(node => {
          const nodeWidth = node.width || LAYOUT_CONFIG.nodeSize.defaultNode.width;
          const nodeHeight = node.height || LAYOUT_CONFIG.nodeSize.defaultNode.height;
          minX = Math.min(minX, node.position.x - nodeWidth / 2);
          minY = Math.min(minY, node.position.y - nodeHeight / 2);
        });

        // ✅ 4. 转换算子：计算移到第四象限的偏移量
        const offsetToQuadrant = {
          x: -minX,
          y: -minY
        };

        console.log(`  └─ 网格边界左上角: (${Math.round(minX)}, ${Math.round(minY)})`);
        console.log(`  └─ 移到第四象限偏移: (${Math.round(offsetToQuadrant.x)}, ${Math.round(offsetToQuadrant.y)})`);

        // ✅ 5. 固定原点：父节点左上角 + padding
        const padding = LAYOUT_CONFIG.group;
        const originX = parentGroup.position.x + padding.paddingLeft;
        const originY = parentGroup.position.y + padding.paddingTop;

        console.log(`  └─ 固定原点（父节点左上角+padding）: (${Math.round(originX)}, ${Math.round(originY)})`);

        // ✅ 6. 转换为绝对坐标：原点 + 相对位置 + 第四象限偏移
        const positionedTargetNodes = relativePositionedNodes.map(node => ({
          ...node,
          position: {
            x: originX + node.position.x + offsetToQuadrant.x,
            y: originY + node.position.y + offsetToQuadrant.y
          }
        }));

        console.log(`  └─ 第一个节点最终位置: (${Math.round(positionedTargetNodes[0].position.x)}, ${Math.round(positionedTargetNodes[0].position.y)})`);

        // ✅ 7. 碰撞检测（和顶层一样）
        const resolvedTargetNodes = this.resolveCollisions(positionedTargetNodes);

        // ✅ 8. 合并节点（和顶层一样的逻辑）
        const positionedNodes = nodes.map(node => {
          if ('groupId' in node && (node as Node).groupId === options.targetGroupId) {
            const layoutNode = resolvedTargetNodes.find(n => n.id === node.id);
            if (layoutNode) {
              return { ...node, position: layoutNode.position };
            }
          }
          return node;
        });

        // ✅ 9. 更新嵌套节点位置（和顶层一样）
        const finalNodes = this.updateNestedNodePositions(nodes, positionedNodes);

        // ✅ 10. 优化边（和顶层一样）
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
          edges: edgeHandles,
          errors: [],
          stats: {
            duration: endTime - startTime,
            iterations: 1,
            collisions: this.countCollisions(resolvedTargetNodes)
          }
        };
      }

      // 原有逻辑：全画布布局
      // 分离顶层节点和嵌套节点，仅对顶层节点应用网格布局
      const originalTopLevelNodes = targetNodes;
      const originalNestedNodes = otherNodes;

      // 仅对顶层节点进行网格布局处理
      const normalizedTopLevelNodes = this.normalizeNodeSizes(originalTopLevelNodes);
      const topLevelWeights = this.calculateWeights(normalizedTopLevelNodes, edges);
      let processedTopLevelNodes = [...normalizedTopLevelNodes];

      if (options?.useWeightedLayout) {
        processedTopLevelNodes = this.sortNodesByWeight(normalizedTopLevelNodes, topLevelWeights);
      }

      // 计算顶层节点的网格布局位置
      const gridOptions = {
        rows: Math.ceil(processedTopLevelNodes.length / GRID_LAYOUT.NODES_PER_ROW),
        cols: GRID_LAYOUT.NODES_PER_ROW,
        spacing: options?.gridSpacing || LAYOUT_CONFIG.layoutAlgorithm.gridSpacing,
        horizontalSpacing: GRID_LAYOUT.HORIZONTAL_SPACING,
        verticalSpacing: GRID_LAYOUT.VERTICAL_SPACING
      };

      const positionedTopLevelNodes = this.calculateGridCenterPositions(processedTopLevelNodes, gridOptions);

      // 解决顶层节点之间的碰撞
      const resolvedTopLevelNodes = this.resolveCollisions(positionedTopLevelNodes);

      // 创建一个包含所有节点的数组，顶层节点用新位置，嵌套节点用原始位置
      // 重要：保持原始节点顺序，只替换顶层节点的位置
      const positionedNodes = nodes.map(node => {
        // 检查是否为顶层节点
        if (!('groupId' in node) || !(node as Node).groupId) {
          // 查找对应的布局后节点
          const layoutNode = resolvedTopLevelNodes.find(n => n.id === node.id);
          if (layoutNode) {
            // 返回布局后的位置，但保留其他属性
            return {
              ...node,
              position: layoutNode.position
            };
          }
        }
        // 如果是嵌套节点或未找到对应布局的顶层节点，返回原始节点
        return node;
      });

      // 实现嵌套节点的相对位置保持机制
      const finalNodes = this.updateNestedNodePositions(nodes, positionedNodes);

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
          collisions: this.countCollisions(resolvedTopLevelNodes)
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
  private calculateGridCenterPositions(nodes: (Node | Group)[], opts: {
    rows: number;
    cols: number;
    spacing: number;
    horizontalSpacing?: number;
    verticalSpacing?: number;
  }): (Node | Group)[] {
    const result: (Node | Group)[] = [];

    // 计算网格中心
    const nodeWidth = nodes.length > 0 ? (nodes[0].width || LAYOUT_CONFIG.nodeSize.defaultNode.width) : LAYOUT_CONFIG.nodeSize.defaultNode.width;
    const nodeHeight = nodes.length > 0 ? (nodes[0].height || LAYOUT_CONFIG.nodeSize.defaultNode.height) : LAYOUT_CONFIG.nodeSize.defaultNode.height;

    // 使用GRID_LAYOUT配置的间距，如果未提供则使用默认间距
    const horizontalSpacing = opts.horizontalSpacing || opts.spacing;
    const verticalSpacing = opts.verticalSpacing || opts.spacing;

    const gridWidth = (opts.cols - 1) * horizontalSpacing + opts.cols * nodeWidth;
    const gridHeight = (opts.rows - 1) * verticalSpacing + opts.rows * nodeHeight;

    const offsetX = -gridWidth / 2;
    const offsetY = -gridHeight / 2;

    for (let i = 0; i < nodes.length; i++) {
      const row = Math.floor(i / opts.cols);
      const col = i % opts.cols;

      const x = offsetX + col * (nodeWidth + horizontalSpacing) + nodeWidth / 2;
      const y = offsetY + row * (nodeHeight + verticalSpacing) + nodeHeight / 2;

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
   * 支持多层嵌套结构（Group嵌套Group，再嵌套Node）
   */
  private updateNestedNodePositions(
    originalNodes: (Node | Group)[],
    positionedNodes: (Node | Group)[]
  ): (Node | Group)[] {
    // 首先，找出哪些是顶层节点（没有父群组的节点）
    const topLevelNodes = positionedNodes.filter(node =>
      !('groupId' in node) || !node.groupId
    );

    // 创建节点映射以便快速查找
    const originalNodeMap = new Map(originalNodes.map(node => [node.id, node]));
    const positionedNodeMap = new Map(positionedNodes.map(node => [node.id, node]));

    // 构建结果数组，顶层节点使用布局后的位置
    let resultNodes = [...topLevelNodes];

    // 找出嵌套节点（属于某个群组的节点）
    const nestedNodes = originalNodes.filter(node =>
      'groupId' in node && node.groupId
    );

    // 对于每个嵌套节点，计算其绝对位置
    for (const nestedNode of nestedNodes) {
      const absolutePosition = this.calculateAbsolutePosition(
        nestedNode,
        originalNodeMap,
        positionedNodeMap
      );

      // 将计算出的绝对位置应用到节点
      resultNodes.push({
        ...nestedNode,
        position: absolutePosition
      });
    }

    // 重要：在布局阶段完成节点定位，避免后续约束逻辑影响
    // 我们需要确保所有嵌套节点在父群组的边界内，但保持它们之间的相对位置
    resultNodes = this.adjustNestedNodesWithinBounds(resultNodes);

    return resultNodes;
  }

  /**
   * 递归计算嵌套节点的绝对位置
   * 这个方法会查找节点的所有祖先群组，计算其相对于最顶层父群组的最终位置
   */
  private calculateAbsolutePosition(
    node: Node | Group,
    originalNodeMap: Map<string, Node | Group>,
    positionedNodeMap: Map<string, Node | Group>
  ): { x: number; y: number } {
    // 如果节点没有父群组，返回其在positionedNodes中的位置
    if (!('groupId' in node) || !node.groupId) {
      const positionedNode = positionedNodeMap.get(node.id);
      return positionedNode ? positionedNode.position : node.position;
    }

    // 🔧 关键修复：优先使用positionedNodeMap中的父群组（可能已被布局算法移动）
    const positionedParentGroup = positionedNodeMap.get(node.groupId);
    const originalParentGroup = originalNodeMap.get(node.groupId) as Group;

    if (!originalParentGroup) {
      // 如果找不到原始父群组，返回原位置
      return node.position;
    }

    // 计算节点相对于原始父群组的相对位置
    const relativeX = node.position.x - originalParentGroup.position.x;
    const relativeY = node.position.y - originalParentGroup.position.y;

    // 🔧 如果父群组在positionedNodeMap中（已被处理），直接使用其新位置
    if (positionedParentGroup) {
      return {
        x: positionedParentGroup.position.x + relativeX,
        y: positionedParentGroup.position.y + relativeY
      };
    }

    // 否则递归计算父群组的新绝对位置（用于嵌套更深的情况）
    const parentAbsolutePosition = this.calculateAbsolutePosition(
      originalParentGroup,
      originalNodeMap,
      positionedNodeMap
    );

    return {
      x: parentAbsolutePosition.x + relativeX,
      y: parentAbsolutePosition.y + relativeY
    };
  }

  /**
   * 递归计算节点的原始绝对位置
   * 获取节点在原始状态下的绝对位置（考虑到所有祖先的位置）
   */
  private getOriginalAbsolutePosition(
    node: Node | Group,
    originalNodeMap: Map<string, Node | Group>
  ): { x: number; y: number } {
    // 如果节点没有父群组，直接返回其位置
    if (!('groupId' in node) || !node.groupId) {
      return node.position;
    }

    // 获取原始父群组
    const originalParentGroup = originalNodeMap.get(node.groupId) as Group;
    if (!originalParentGroup) {
      // 如果找不到原始父群组，返回原位置
      return node.position;
    }

    // 递归计算父群组的原始绝对位置
    const parentOriginalAbsolutePosition = this.getOriginalAbsolutePosition(
      originalParentGroup,
      originalNodeMap
    );

    // 计算节点相对于父群组的相对位置
    const relativeX = node.position.x - originalParentGroup.position.x;
    const relativeY = node.position.y - originalParentGroup.position.y;

    // 计算节点的原始绝对位置
    return {
      x: parentOriginalAbsolutePosition.x + relativeX,
      y: parentOriginalAbsolutePosition.y + relativeY
    };
  }

  /**
   * 调整嵌套节点确保它们在父群组边界内，同时保持彼此间的相对位置
   * 优化以保留节点相对于父群组的原始相对位置，支持多层嵌套
   */
  private adjustNestedNodesWithinBounds(nodes: (Node | Group)[]): (Node | Group)[] {
    // 创建映射以便快速查找节点
    const nodeMap = new Map(nodes.map(node => [node.id, node]));

    // 为了处理多层嵌套，我们需要多次迭代确保所有嵌套层级都正确约束
    let resultNodes = [...nodes];
    let hasChanges = true;
    let iterations = 0;
    const maxIterations = 10; // 防止无限循环

    while (hasChanges && iterations < maxIterations) {
      hasChanges = false;
      const currentNodes = [...resultNodes];

      resultNodes = currentNodes.map(node => {
        // 只处理有父群组的节点
        if ('groupId' in node && node.groupId) {
          const parentGroup = nodeMap.get(node.groupId) as Group;

          if (parentGroup) {
            // 获取节点和群组的尺寸
            const nodeWidth = node.width || LAYOUT_CONFIG.nodeSize.defaultNode.width;
            const nodeHeight = node.height || LAYOUT_CONFIG.nodeSize.defaultNode.height;
            const groupWidth = parentGroup.width || LAYOUT_CONFIG.nodeSize.groupNode.width;
            const groupHeight = parentGroup.height || LAYOUT_CONFIG.nodeSize.groupNode.height;

            // 计算节点相对于父群组的当前相对位置
            const currentRelativeX = node.position.x - parentGroup.position.x;
            const currentRelativeY = node.position.y - parentGroup.position.y;

            // 确定可以放置节点的安全区域（考虑边距）
            // 使用GRID_LAYOUT配置的初始偏移作为群组内布局的起始点
            const marginX = GRID_LAYOUT.INITIAL_OFFSET.x; // 使用配置的x偏移作为水平边距
            const marginY = GRID_LAYOUT.INITIAL_OFFSET.y; // 使用配置的y偏移作为垂直边距
            const safeArea = {
              minX: marginX,
              minY: marginY,
              maxX: groupWidth - nodeWidth - marginX,
              maxY: groupHeight - nodeHeight - marginY
            };

            // 检查当前相对位置是否在安全区域内
            let adjustedRelativeX = currentRelativeX;
            let adjustedRelativeY = currentRelativeY;

            // 确保节点在父群组边界内
            if (currentRelativeX < safeArea.minX) {
              adjustedRelativeX = safeArea.minX;
              hasChanges = true;
            }
            if (currentRelativeX > safeArea.maxX) {
              adjustedRelativeX = safeArea.maxX;
              hasChanges = true;
            }
            if (currentRelativeY < safeArea.minY) {
              adjustedRelativeY = safeArea.minY;
              hasChanges = true;
            }
            if (currentRelativeY > safeArea.maxY) {
              adjustedRelativeY = safeArea.maxY;
              hasChanges = true;
            }

            // 如果位置需要调整，返回新位置
            if (adjustedRelativeX !== currentRelativeX || adjustedRelativeY !== currentRelativeY) {
              return {
                ...node,
                position: {
                  x: parentGroup.position.x + adjustedRelativeX,
                  y: parentGroup.position.y + adjustedRelativeY
                }
              };
            }
          }
        }

        return node;
      });

      iterations++;
    }

    return resultNodes;
  }

  /**
   * 🌳 递归布局方法 - 从最深层群组开始逐层向上布局
   * 核心思路：
   * 1. 使用 NestingTreeBuilder 计算所有节点的嵌套深度
   * 2. 从最深层开始，逐层布局每个群组的子节点
   * 3. 最后布局顶层节点
   * 4. 使用同一套 GridCenterLayoutStrategy 算法
   */
  private async applyRecursiveLayout(
    nodes: (Node | Group)[],
    edges: Edge[],
    options?: GridCenterLayoutOptions
  ): Promise<LayoutResult> {
    const startTime = performance.now();
    const stats = { duration: 0, iterations: 0, collisions: 0 };

    try {
      console.log(`🌳 开始递归布局，共 ${nodes.length} 个节点`);

      // 1. 构建嵌套层级树
      const treeBuilder = new NestingTreeBuilder();
      const depthGroups = treeBuilder.groupNodesByDepth(nodes);
      const maxDepth = treeBuilder.getMaxDepth(depthGroups);

      console.log(`🌳 检测到 ${depthGroups.size} 层嵌套结构，最大深度: ${maxDepth}`);

      // 2. 创建工作节点副本（用于逐步更新位置）
      let workingNodes = nodes.map(n => ({ ...n, position: { ...n.position } }));
      const allUpdatedPositions = new Map<string, { x: number; y: number }>();

      let totalProcessedNodes = 0;
      const totalNodes = nodes.length;

      // 3. 从最深层向上逐层布局
      for (let depth = maxDepth; depth > 0; depth--) {
        const groupsAtDepth = treeBuilder.getGroupsAtDepth(depthGroups, depth);

        if (groupsAtDepth.length === 0) {
          console.log(`📐 深度 ${depth} 没有群组，跳过`);
          continue;
        }

        console.log(`📐 处理深度 ${depth}，群组数量: ${groupsAtDepth.length}`);

        // 布局每个群组的子节点
        for (const group of groupsAtDepth) {
          // 获取该群组的子节点数量
          const childrenCount = workingNodes.filter(n =>
            'groupId' in n && (n as Node).groupId === group.id
          ).length;

          if (childrenCount === 0) {
            console.log(`  └─ 群组 ${group.id} 没有子节点，跳过`);
            continue;
          }

          console.log(`  └─ 布局群组 ${group.id} 的 ${childrenCount} 个子节点`);

          // 使用现有的单群组布局逻辑
          const layoutResult = await this.layoutSingleGroup(
            group.id,
            workingNodes,
            edges,
            options
          );

          // 合并布局结果到工作节点
          layoutResult.nodes.forEach((pos, id) => {
            allUpdatedPositions.set(id, pos);
            const node = workingNodes.find(n => n.id === id);
            if (node) {
              node.position = pos;
            }
          });

          stats.iterations += layoutResult.stats.iterations;
          stats.collisions += layoutResult.stats.collisions;
          totalProcessedNodes += layoutResult.nodes.size;

          // 发送进度更新
          if (options?.onProgress) {
            options.onProgress({
              currentLevel: maxDepth - depth + 1,
              totalLevels: maxDepth + 1,
              processedNodes: totalProcessedNodes,
              totalNodes: totalNodes
            });
          }
        }
      }

      // 4. 最后布局顶层节点
      console.log(`📐 处理顶层节点`);
      const topLevelResult = await this.applyLayout(workingNodes, edges, {
        ...options,
        layoutMode: 'normal', // 确保使用普通模式，避免递归调用
        targetGroupId: undefined,
      });

      // 合并顶层布局结果
      topLevelResult.nodes.forEach((pos, id) => {
        allUpdatedPositions.set(id, pos);
        const node = workingNodes.find(n => n.id === id);
        if (node) {
          node.position = pos;
        }
      });

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

      // 5. 🔧 递归调整父节点大小以包含所有子节点（从深到浅）
      console.log(`🔧 调整父节点大小以包含子节点`);
      const adjustedNodes = this.adjustParentNodeSizes(
        workingNodes,
        treeBuilder,
        depthGroups,
        maxDepth
      );

      // 更新调整后的节点大小到结果中
      for (const node of adjustedNodes) {
        if (node.type === BlockEnum.GROUP && (node.width || node.height)) {
          const currentPos = allUpdatedPositions.get(node.id);
          if (currentPos) {
            // 保持位置不变，只更新大小信息
            allUpdatedPositions.set(node.id, currentPos);
          }
          // 将尺寸信息和边界信息也存储到特殊字段（用于UI更新）
          const pos = allUpdatedPositions.get(node.id);
          if (pos) {
            (pos as any).width = node.width;
            (pos as any).height = node.height;
            // 🔧 同时传递 boundary 信息，确保群组边界及时更新
            if ((node as Group).boundary) {
              (pos as any).boundary = (node as Group).boundary;
            }
          }
        }
      }

      // 6. 优化所有边的连接点
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
      console.log(`   • 调整了父节点大小`);
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
   * 布局单个群组的子节点
   * 复用现有的 applyLayout 逻辑，指定 targetGroupId
   */
  private async layoutSingleGroup(
    groupId: string,
    nodes: (Node | Group)[],
    edges: Edge[],
    options?: GridCenterLayoutOptions
  ): Promise<LayoutResult> {
    return this.applyLayout(nodes, edges, {
      ...options,
      layoutMode: 'normal', // 确保使用普通模式
      targetGroupId: groupId,
      layoutScope: 'group',
    });
  }

  /**
   * 🔧 递归调整父节点大小以包含所有子节点（优化版 - 使用相对位置计算）
   * 从最深层开始，逐层向上调整每个群组的大小
   * 核心改进：基于子节点相对于群组的相对位置来计算所需大小
   *
   * @param nodes 所有节点
   * @param treeBuilder 嵌套树构建器
   * @param depthGroups 深度分组
   * @param maxDepth 最大深度
   * @returns 调整后的节点列表
   */
  private adjustParentNodeSizes(
    nodes: (Node | Group)[],
    treeBuilder: NestingTreeBuilder,
    depthGroups: Map<number, (Node | Group)[]>,
    maxDepth: number
  ): (Node | Group)[] {
    // 创建节点副本
    const workingNodes = nodes.map(n => ({ ...n }));
    const nodeMap = new Map(workingNodes.map(n => [n.id, n]));

    console.log(`🔧 开始调整群组大小（从深度 ${maxDepth} 到 0）`);

    // 从最深层向上逐层调整群组大小
    for (let depth = maxDepth; depth >= 0; depth--) {
      const groupsAtDepth = treeBuilder.getGroupsAtDepth(depthGroups, depth);

      for (const group of groupsAtDepth) {
        const workingGroup = nodeMap.get(group.id) as Group;
        if (!workingGroup) continue;

        // 获取该群组的所有直接子节点
        const children = workingNodes.filter(n =>
          'groupId' in n && (n as Node).groupId === group.id
        );

        if (children.length === 0) continue;

        // 计算子节点相对于群组的边界（使用相对坐标）
        const padding = LAYOUT_CONFIG.group;
        const childrenRelativeBounds = this.calculateChildrenRelativeBounds(
          children,
          workingGroup
        );

        // 计算需要的内容区域大小（子节点占用的空间）
        const contentWidth = childrenRelativeBounds.maxX - childrenRelativeBounds.minX;
        const contentHeight = childrenRelativeBounds.maxY - childrenRelativeBounds.minY;

        // 计算总的群组大小（内容 + padding + 额外边距）
        const extraMargin = 30; // 额外边距，确保有足够空间
        const requiredWidth = contentWidth + padding.paddingLeft + padding.paddingRight + extraMargin;
        const requiredHeight = contentHeight + padding.paddingTop + padding.paddingBottom + extraMargin;

        // 应用最小尺寸限制
        const minWidth = LAYOUT_CONFIG.nodeSize.groupNode.width;
        const minHeight = LAYOUT_CONFIG.nodeSize.groupNode.height;

        const currentWidth = workingGroup.width || minWidth;
        const currentHeight = workingGroup.height || minHeight;

        // 只扩大不缩小（避免压缩已有内容）
        const newWidth = Math.max(currentWidth, requiredWidth, minWidth);
        const newHeight = Math.max(currentHeight, requiredHeight, minHeight);

        if (newWidth !== currentWidth || newHeight !== currentHeight) {
          console.log(
            `  └─ 深度${depth} 群组${group.id}: ${Math.round(currentWidth)}x${Math.round(currentHeight)} -> ` +
            `${Math.round(newWidth)}x${Math.round(newHeight)} (内容: ${Math.round(contentWidth)}x${Math.round(contentHeight)})`
          );

          workingGroup.width = newWidth;
          workingGroup.height = newHeight;

          // 更新 boundary
          workingGroup.boundary = {
            minX: workingGroup.position.x,
            minY: workingGroup.position.y,
            maxX: workingGroup.position.x + newWidth,
            maxY: workingGroup.position.y + newHeight
          };
        }
      }
    }

    return workingNodes;
  }

  /**
   * 计算子节点相对于父群组的边界
   * 返回子节点在群组内的相对坐标范围
   */
  private calculateChildrenRelativeBounds(
    children: (Node | Group)[],
    parentGroup: Group
  ): { minX: number; minY: number; maxX: number; maxY: number } {
    if (children.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const child of children) {
      const nodeWidth = child.width || LAYOUT_CONFIG.nodeSize.defaultNode.width;
      const nodeHeight = child.height || LAYOUT_CONFIG.nodeSize.defaultNode.height;

      // 计算子节点相对于父群组左上角的相对位置
      const relativeX = child.position.x - parentGroup.position.x;
      const relativeY = child.position.y - parentGroup.position.y;

      // 计算节点边界（相对坐标）
      const nodeMinX = relativeX - nodeWidth / 2;
      const nodeMinY = relativeY - nodeHeight / 2;
      const nodeMaxX = relativeX + nodeWidth / 2;
      const nodeMaxY = relativeY + nodeHeight / 2;

      minX = Math.min(minX, nodeMinX);
      minY = Math.min(minY, nodeMinY);
      maxX = Math.max(maxX, nodeMaxX);
      maxY = Math.max(maxY, nodeMaxY);
    }

    return { minX, minY, maxX, maxY };
  }

  /**
   * 计算多个节点的边界
   */
  private calculateNodesBoundary(nodes: (Node | Group)[]): {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  } {
    if (nodes.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const node of nodes) {
      const nodeWidth = node.width || LAYOUT_CONFIG.nodeSize.defaultNode.width;
      const nodeHeight = node.height || LAYOUT_CONFIG.nodeSize.defaultNode.height;

      // 节点的边界（考虑节点中心点）
      const nodeMinX = node.position.x - nodeWidth / 2;
      const nodeMinY = node.position.y - nodeHeight / 2;
      const nodeMaxX = node.position.x + nodeWidth / 2;
      const nodeMaxY = node.position.y + nodeHeight / 2;

      minX = Math.min(minX, nodeMinX);
      minY = Math.min(minY, nodeMinY);
      maxX = Math.max(maxX, nodeMaxX);
      maxY = Math.max(maxY, nodeMaxY);
    }

    return { minX, minY, maxX, maxY };
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