// src/services/layout/strategies/EdgeOptimizationStrategy.ts
import { Node, Group, Edge, BlockEnum } from '../../../types/graph/models';
import { ILayoutStrategy, LayoutResult, LayoutOptions } from '../types/layoutTypes';
import { GeometryUtils } from '../utils/GeometryUtils';
import { LAYOUT_CONFIG, EDGE_CONFIG } from '../../../config/graph.config';

export interface EdgeOptimizationOptions extends LayoutOptions {
  optimizeHandles?: boolean;
  minimizeCrossings?: boolean;
  routeType?: 'straight' | 'orthogonal' | 'curved';
}

export class EdgeOptimizationStrategy implements ILayoutStrategy {
  name = 'Edge Optimization Strategy';
  id = 'edge-optimization';

  async applyLayout(
    nodes: (Node | Group)[],
    edges: Edge[],
    options?: EdgeOptimizationOptions
  ): Promise<LayoutResult> {
    const startTime = performance.now();

    try {
      // 计算优化后的边信息
      const optimizedEdges = this.optimizeEdgePaths(nodes, edges, options);

      // 创建节点位置映射（保持原始位置不变）
      const nodePositions = new Map<string, { x: number; y: number }>();
      for (const node of nodes) {
        nodePositions.set(node.id, node.position);
      }

      const endTime = performance.now();

      return {
        success: true,
        nodes: nodePositions, // 节点位置保持不变
        edges: optimizedEdges, // 返回优化后的边信息
        errors: [],
        stats: {
          duration: endTime - startTime,
          iterations: 1,
          collisions: 0
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
   * 优化边路径
   */
  private optimizeEdgePaths(
    nodes: (Node | Group)[],
    edges: Edge[],
    options?: EdgeOptimizationOptions
  ): Map<string, any> {
    const optimizedEdges = new Map<string, any>();
    const nodeMap = new Map<string, Node | Group>();
    
    // 创建节点映射
    for (const node of nodes) {
      nodeMap.set(node.id, node);
    }

    for (const edge of edges) {
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);

      if (sourceNode && targetNode) {
        // 计算最佳连接点
        let optimizedEdge = { ...edge };

        if (options?.optimizeHandles) {
          const handles = this.calculateOptimalHandles(sourceNode, targetNode);
          optimizedEdge = {
            ...optimizedEdge,
            sourceHandle: handles.sourceHandle,
            targetHandle: handles.targetHandle
          };
        }

        // 根据路由类型设置额外的路径信息
        if (options?.routeType) {
          const pathInfo = this.calculatePathInfo(sourceNode, targetNode, options.routeType);
          optimizedEdge = {
            ...optimizedEdge,
            ...pathInfo
          };
        }

        optimizedEdges.set(edge.id, optimizedEdge);
      } else {
        // 如果找不到节点，保留原始边信息
        optimizedEdges.set(edge.id, edge);
      }
    }

    return optimizedEdges;
  }

  /**
   * 计算最佳连接点
   */
  private calculateOptimalHandles(sourceNode: Node | Group, targetNode: Node | Group): { 
    sourceHandle: string; 
    targetHandle: string 
  } {
    // 计算节点中心点
    const sourceCenter = GeometryUtils.getCenter({
      x: sourceNode.position.x,
      y: sourceNode.position.y,
      width: sourceNode.width || 350,
      height: sourceNode.height || 280
    });

    const targetCenter = GeometryUtils.getCenter({
      x: targetNode.position.x,
      y: targetNode.position.y,
      width: targetNode.width || 350,
      height: targetNode.height || 280
    });

    // 计算方向向量
    const dx = targetCenter.x - sourceCenter.x;
    const dy = targetCenter.y - sourceCenter.y;

    // 确定最佳连接点
    let sourceHandle: string;
    let targetHandle: string;

    // 根据相对位置选择连接点
    if (Math.abs(dx) > Math.abs(dy)) {
      // 主要是水平方向
      if (dx > 0) {
        // target在source的右边
        sourceHandle = 'right';
        targetHandle = 'left';
      } else {
        // target在source的左边
        sourceHandle = 'left';
        targetHandle = 'right';
      }
    } else {
      // 主要是垂直方向
      if (dy > 0) {
        // target在source的下面
        sourceHandle = 'bottom';
        targetHandle = 'top';
      } else {
        // target在source的上面
        sourceHandle = 'top';
        targetHandle = 'bottom';
      }
    }

    return { sourceHandle, targetHandle };
  }

  /**
   * 计算路径信息
   */
  private calculatePathInfo(sourceNode: Node | Group, targetNode: Node | Group, routeType: string) {
    const sourceCenter = GeometryUtils.getCenter({
      x: sourceNode.position.x,
      y: sourceNode.position.y,
      width: sourceNode.width || 350,
      height: sourceNode.height || 280
    });

    const targetCenter = GeometryUtils.getCenter({
      x: targetNode.position.x,
      y: targetNode.position.y,
      width: targetNode.width || 350,
      height: targetNode.height || 280
    });

    switch (routeType) {
      case 'curved':
        // 计算贝塞尔曲线控制点
        const midX = (sourceCenter.x + targetCenter.x) / 2;
        const midY = (sourceCenter.y + targetCenter.y) / 2;
        
        // 添加偏移以创建曲线效果
        const offset = 50;
        const controlX = midX + (targetCenter.y - sourceCenter.y) / 4;
        const controlY = midY - (targetCenter.x - sourceCenter.x) / 4;
        
        return {
          type: 'default',
          animated: false,
          style: {
            stroke: EDGE_CONFIG.DEFAULT_COLOR,
            strokeWidth: EDGE_CONFIG.DEFAULT_STROKE_WIDTH
          },
          pathOptions: {
            type: 'smoothStep', // 使用平滑的路径
            offset: offset,
            curveness: 0.2
          }
        };
        
      case 'orthogonal':
        // 正交路径 - 使用多个线段连接，形成直角
        return {
          type: 'step',
          style: {
            stroke: EDGE_CONFIG.DEFAULT_COLOR,
            strokeWidth: EDGE_CONFIG.DEFAULT_STROKE_WIDTH
          }
        };

      default: // 'straight'
        return {
          type: 'default',
          style: {
            stroke: EDGE_CONFIG.DEFAULT_COLOR,
            strokeWidth: EDGE_CONFIG.DEFAULT_STROKE_WIDTH
          }
        };
    }
  }

  validateConfig(config: any): boolean {
    if (config.routeType && !['straight', 'orthogonal', 'curved'].includes(config.routeType)) {
      return false;
    }
    if (config.optimizeHandles !== undefined && typeof config.optimizeHandles !== 'boolean') {
      return false;
    }
    if (config.minimizeCrossings !== undefined && typeof config.minimizeCrossings !== 'boolean') {
      return false;
    }
    return true;
  }
}