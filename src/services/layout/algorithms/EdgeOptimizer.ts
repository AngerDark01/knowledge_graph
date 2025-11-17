// src/services/layout/algorithms/EdgeOptimizer.ts
import { Node, Group, Edge } from '../../../types/graph/models';
import { GeometryUtils } from '../utils/GeometryUtils';
import { EDGE_OPTIMIZATION_CONFIG, LAYOUT_CONFIG } from '../../../config/graph.config';

export type HandlePosition = 'top' | 'right' | 'bottom' | 'left';

export interface OptimizedEdge extends Edge {
  sourceHandle?: HandlePosition;
  targetHandle?: HandlePosition;
}

export interface IEdgeOptimizer {
  /**
   * 优化所有边的连接点
   */
  optimizeEdgeHandles(nodes: (Node | Group)[], edges: Edge[]): OptimizedEdge[];

  /**
   * 为单条边计算最佳连接点
   */
  calculateBestHandles(sourceNode: Node | Group, targetNode: Node | Group): {
    sourceHandle: HandlePosition;
    targetHandle: HandlePosition
  };
}

export class EdgeOptimizer implements IEdgeOptimizer {
  /**
   * 优化所有边的连接点
   */
  optimizeEdgeHandles(nodes: (Node | Group)[], edges: Edge[]): OptimizedEdge[] {
    // 如果边优化未启用，直接返回原始边
    if (!EDGE_OPTIMIZATION_CONFIG.ENABLED) {
      return edges as OptimizedEdge[];
    }

    const nodeMap = new Map(nodes.map(node => [node.id, node]));

    return edges.map(edge => {
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);

      if (!sourceNode || !targetNode) {
        // 如果找不到节点，则使用原始边信息
        return edge as OptimizedEdge;
      }

      const handles = this.calculateBestHandles(sourceNode, targetNode);

      return {
        ...edge,
        sourceHandle: handles.sourceHandle,
        targetHandle: handles.targetHandle
      };
    });
  }

  /**
   * 为单条边计算最佳连接点
   */
  calculateBestHandles(sourceNode: Node | Group, targetNode: Node | Group): {
    sourceHandle: HandlePosition;
    targetHandle: HandlePosition
  } {
    // 计算两个节点中心点
    const sourceCenter = GeometryUtils.getCenter({
      x: sourceNode.position.x,
      y: sourceNode.position.y,
      width: sourceNode.width || LAYOUT_CONFIG.nodeSize.defaultNode.width,
      height: sourceNode.height || LAYOUT_CONFIG.nodeSize.defaultNode.height
    });

    const targetCenter = GeometryUtils.getCenter({
      x: targetNode.position.x,
      y: targetNode.position.y,
      width: targetNode.width || LAYOUT_CONFIG.nodeSize.defaultNode.width,
      height: targetNode.height || LAYOUT_CONFIG.nodeSize.defaultNode.height
    });

    // 计算源节点到目标节点的角度
    const angle = Math.atan2(
      targetCenter.y - sourceCenter.y,
      targetCenter.x - sourceCenter.x
    );

    // 根据角度确定最佳连接点
    let sourceHandle: HandlePosition;
    let targetHandle: HandlePosition;

    // 标准化角度到[-π, π]
    const normalizedAngle = this.normalizeAngle(angle);

    // 使用配置中的角度阈值
    const { QUADRANT } = EDGE_OPTIMIZATION_CONFIG.ANGLE_THRESHOLDS;

    // 选择源节点的连接点
    if (normalizedAngle >= -QUADRANT && normalizedAngle < QUADRANT) {
      sourceHandle = 'right';  // 目标在右侧
    } else if (normalizedAngle >= QUADRANT && normalizedAngle < 3 * QUADRANT) {
      sourceHandle = 'bottom'; // 目标在下方
    } else if (normalizedAngle >= -3 * QUADRANT && normalizedAngle < -QUADRANT) {
      sourceHandle = 'top';    // 目标在上方
    } else {
      sourceHandle = 'left';   // 目标在左侧
    }

    // 选择目标节点的连接点（与源节点相反）
    switch (sourceHandle) {
      case 'right': targetHandle = 'left'; break;
      case 'left': targetHandle = 'right'; break;
      case 'top': targetHandle = 'bottom'; break;
      case 'bottom': targetHandle = 'top'; break;
    }

    return { sourceHandle, targetHandle };
  }

  /**
   * 将角度标准化到[-π, π]范围
   */
  private normalizeAngle(angle: number): number {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle <= -Math.PI) angle += 2 * Math.PI;
    return angle;
  }

  /**
   * 优化单条边（用于拖拽等实时更新场景）
   * @param edge 要优化的边
   * @param nodes 所有节点
   * @returns 优化后的边
   */
  optimizeSingleEdge(edge: Edge, nodes: (Node | Group)[]): OptimizedEdge {
    if (!EDGE_OPTIMIZATION_CONFIG.ENABLED) {
      return edge as OptimizedEdge;
    }

    const nodeMap = new Map(nodes.map(node => [node.id, node]));
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);

    if (!sourceNode || !targetNode) {
      return edge as OptimizedEdge;
    }

    const handles = this.calculateBestHandles(sourceNode, targetNode);

    return {
      ...edge,
      sourceHandle: handles.sourceHandle,
      targetHandle: handles.targetHandle
    };
  }

  /**
   * 批量优化边（带性能优化）
   * @param nodes 所有节点
   * @param edges 所有边
   * @param affectedNodeIds 受影响的节点ID（可选，用于增量优化）
   * @returns 优化后的边
   */
  optimizeBatch(
    nodes: (Node | Group)[],
    edges: Edge[],
    affectedNodeIds?: Set<string>
  ): OptimizedEdge[] {
    if (!EDGE_OPTIMIZATION_CONFIG.ENABLED) {
      return edges as OptimizedEdge[];
    }

    // 如果指定了受影响的节点，只优化相关的边
    const edgesToOptimize = affectedNodeIds
      ? edges.filter(e => affectedNodeIds.has(e.source) || affectedNodeIds.has(e.target))
      : edges;

    // 对于大量边，使用性能优化模式
    if (edgesToOptimize.length > EDGE_OPTIMIZATION_CONFIG.PERFORMANCE.BATCH_THRESHOLD) {
      return this.optimizeEdgeHandles(nodes, edges);
    }

    const nodeMap = new Map(nodes.map(node => [node.id, node]));
    const optimizedEdgeMap = new Map<string, OptimizedEdge>();

    // 优化受影响的边
    for (const edge of edgesToOptimize) {
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);

      if (sourceNode && targetNode) {
        const handles = this.calculateBestHandles(sourceNode, targetNode);
        optimizedEdgeMap.set(edge.id, {
          ...edge,
          sourceHandle: handles.sourceHandle,
          targetHandle: handles.targetHandle
        });
      } else {
        optimizedEdgeMap.set(edge.id, edge as OptimizedEdge);
      }
    }

    // 返回完整的边列表，包含优化和未优化的边
    return edges.map(edge => optimizedEdgeMap.get(edge.id) || edge as OptimizedEdge);
  }
}
