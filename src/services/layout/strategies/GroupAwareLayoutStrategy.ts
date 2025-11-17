// src/services/layout/strategies/GroupAwareLayoutStrategy.ts
import { Node, Group, Edge, BlockEnum } from '../../../types/graph/models';
import { ILayoutStrategy, LayoutResult, LayoutOptions } from '../types/layoutTypes';
import { GeometryUtils } from '../utils/GeometryUtils';
import { LAYOUT_CONFIG } from '../../../config/graph.config';

export interface GroupAwareLayoutOptions extends LayoutOptions {
  intraGroupSpacing?: number;
  interGroupSpacing?: number;
  useWeightedLayout?: boolean;
}

export class GroupAwareLayoutStrategy implements ILayoutStrategy {
  name = 'Group-Aware Layout';
  id = 'group-aware-layout';
  
  async applyLayout(
    nodes: (Node | Group)[],
    edges: Edge[],
    options?: GroupAwareLayoutOptions
  ): Promise<LayoutResult> {
    const startTime = performance.now();
    
    try {
      // 标准化节点尺寸
      const normalizedNodes = this.normalizeNodeSizes(nodes);
      
      // 识别分组结构
      const { groupedNodes, ungroupedNodes } = this.groupNodesByParent(normalizedNodes);
      
      // 分别对每组内的节点进行布局
      const positionedGroupedNodes: (Node | Group)[] = [];
      let currentYOffset = 0;
      
      for (const [groupId, groupNodes] of groupedNodes.entries()) {
        const group = nodes.find(n => n.id === groupId && n.type === BlockEnum.GROUP) as Group;
        if (group) {
          // 对组内节点进行布局
          const groupLayoutResult = this.layoutNodesInGroup(
            groupNodes, 
            group,
            options
          );
          
          // 添加垂直偏移以避免组间的重叠
          const positionedGroupNodesWithOffset = groupLayoutResult.map(node => ({
            ...node,
            position: {
              ...node.position,
              y: node.position.y + currentYOffset
            }
          }));
          
          positionedGroupedNodes.push(...positionedGroupNodesWithOffset);
          
          // 更新Y偏移量
          const groupBoundary = GeometryUtils.getEnclosingBounds(positionedGroupNodesWithOffset);
          currentYOffset = groupBoundary.maxY + (options?.interGroupSpacing || LAYOUT_CONFIG.collision.minGroupPadding);
        }
      }
      
      // 对未分组的节点进行布局
      const positionedUngroupedNodes = this.layoutUngroupedNodes(
        ungroupedNodes,
        currentYOffset,
        options
      );
      
      // 合并所有节点
      const allPositionedNodes = [...positionedGroupedNodes, ...positionedUngroupedNodes];
      
      // 解决可能的碰撞
      const resolvedNodes = this.resolveCollisions(allPositionedNodes);
      
      const endTime = performance.now();
      
      // 创建结果映射
      const nodePositions = new Map<string, { x: number; y: number }>();
      for (const node of resolvedNodes) {
        nodePositions.set(node.id, node.position);
      }
      
      return {
        success: true,
        nodes: nodePositions,
        edges: new Map(), // 布局策略暂时不处理边
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
      if (node.type === BlockEnum.GROUP) {
        return {
          ...node,
          width: node.width || LAYOUT_CONFIG.nodeSize.groupNode.width,
          height: node.height || LAYOUT_CONFIG.nodeSize.groupNode.height
        };
      } else {
        return {
          ...node,
          width: node.width || LAYOUT_CONFIG.nodeSize.defaultNode.width,
          height: node.height || LAYOUT_CONFIG.nodeSize.defaultNode.height
        };
      }
    });
  }
  
  /**
   * 按父组对节点进行分组
   */
  private groupNodesByParent(nodes: (Node | Group)[]): {
    groupedNodes: Map<string, (Node | Group)[]>;
    ungroupedNodes: (Node | Group)[]
  } {
    const groupedNodes = new Map<string, (Node | Group)[]>();
    const ungroupedNodes: (Node | Group)[] = [];

    for (const node of nodes) {
      if ('groupId' in node && node.groupId) {
        if (!groupedNodes.has(node.groupId)) {
          groupedNodes.set(node.groupId, []);
        }
        groupedNodes.get(node.groupId)!.push(node);
      } else {
        ungroupedNodes.push(node);
      }
    }

    return { groupedNodes, ungroupedNodes };
  }
  
  /**
   * 对组内节点进行布局
   */
  private layoutNodesInGroup(
    groupNodes: (Node | Group)[],
    group: Group,
    options?: GroupAwareLayoutOptions
  ): (Node | Group)[] {
    if (groupNodes.length === 0) {
      return [];
    }
    
    // 计算网格布局
    const nodeCount = groupNodes.length;
    const cols = Math.ceil(Math.sqrt(nodeCount));
    const rows = Math.ceil(nodeCount / cols);
    
    const spacing = options?.intraGroupSpacing || LAYOUT_CONFIG.layoutAlgorithm.gridSpacing;
    const nodeWidth = groupNodes[0].width || LAYOUT_CONFIG.nodeSize.defaultNode.width;
    const nodeHeight = groupNodes[0].height || LAYOUT_CONFIG.nodeSize.defaultNode.height;

    // 计算组的中心位置
    const groupCenterX = group.position.x + (group.width || LAYOUT_CONFIG.nodeSize.groupNode.width) / 2;
    const groupCenterY = group.position.y + (group.height || LAYOUT_CONFIG.nodeSize.groupNode.height) / 2;
    
    // 围绕组的中心位置进行网格布局
    const result: (Node | Group)[] = [];
    
    for (let i = 0; i < groupNodes.length; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      
      // 计算相对于组中心的位置
      const offsetX = (col - (cols - 1) / 2) * (nodeWidth + spacing);
      const offsetY = (row - (rows - 1) / 2) * (nodeHeight + spacing);
      
      // 转换为绝对位置（考虑组的位置）
      const absoluteX = groupCenterX + offsetX;
      const absoluteY = groupCenterY + offsetY;
      
      result.push({
        ...groupNodes[i],
        position: { 
          x: absoluteX,
          y: absoluteY
        }
      });
    }
    
    return result;
  }
  
  /**
   * 对未分组的节点进行布局
   */
  private layoutUngroupedNodes(
    ungroupedNodes: (Node | Group)[],
    yOffset: number,
    options?: GroupAwareLayoutOptions
  ): (Node | Group)[] {
    if (ungroupedNodes.length === 0) {
      return [];
    }
    
    // 对未分组的节点进行网格布局
    const nodeCount = ungroupedNodes.length;
    const cols = Math.ceil(Math.sqrt(nodeCount));
    const rows = Math.ceil(nodeCount / cols);
    
    const spacing = options?.intraGroupSpacing || LAYOUT_CONFIG.layoutAlgorithm.gridSpacing;
    const nodeWidth = ungroupedNodes[0].width || LAYOUT_CONFIG.nodeSize.defaultNode.width;
    const nodeHeight = ungroupedNodes[0].height || LAYOUT_CONFIG.nodeSize.defaultNode.height;
    
    // 从指定的Y偏移开始布局
    const result: (Node | Group)[] = [];
    
    for (let i = 0; i < ungroupedNodes.length; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      
      const x = col * (nodeWidth + spacing);
      const y = yOffset + row * (nodeHeight + spacing);
      
      result.push({
        ...ungroupedNodes[i],
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

          const node1Bounds = {
            x: node1.position.x - (node1.width || 0) / 2,
            y: node1.position.y - (node1.height || 0) / 2,
            width: node1.width || LAYOUT_CONFIG.nodeSize.defaultNode.width,
            height: node1.height || LAYOUT_CONFIG.nodeSize.defaultNode.height
          };

          const node2Bounds = {
            x: node2.position.x - (node2.width || 0) / 2,
            y: node2.position.y - (node2.height || 0) / 2,
            width: node2.width || LAYOUT_CONFIG.nodeSize.defaultNode.width,
            height: node2.height || LAYOUT_CONFIG.nodeSize.defaultNode.height
          };

          if (GeometryUtils.isOverlapping(node1Bounds, node2Bounds)) {
            collisionPairs.push({ node1: i, node2: j });
            hasCollisions = true;
          }
        }
      }

      // 解决碰撞
      for (const pair of collisionPairs) {
        const node1 = resolvedNodes[pair.node1];
        const node2 = resolvedNodes[pair.node2];

        const node1Bounds = {
          x: node1.position.x - (node1.width || 0) / 2,
          y: node1.position.y - (node1.height || 0) / 2,
          width: node1.width || LAYOUT_CONFIG.nodeSize.defaultNode.width,
          height: node1.height || LAYOUT_CONFIG.nodeSize.defaultNode.height
        };

        const node2Bounds = {
          x: node2.position.x - (node2.width || 0) / 2,
          y: node2.position.y - (node2.height || 0) / 2,
          width: node2.width || LAYOUT_CONFIG.nodeSize.defaultNode.width,
          height: node2.height || LAYOUT_CONFIG.nodeSize.defaultNode.height
        };

        const mtv = GeometryUtils.getMTV(node1Bounds, node2Bounds);

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
        
        const node1Bounds = {
          x: node1.position.x - (node1.width || 0) / 2,
          y: node1.position.y - (node1.height || 0) / 2,
          width: node1.width || LAYOUT_CONFIG.nodeSize.defaultNode.width,
          height: node1.height || LAYOUT_CONFIG.nodeSize.defaultNode.height
        };

        const node2Bounds = {
          x: node2.position.x - (node2.width || 0) / 2,
          y: node2.position.y - (node2.height || 0) / 2,
          width: node2.width || LAYOUT_CONFIG.nodeSize.defaultNode.width,
          height: node2.height || LAYOUT_CONFIG.nodeSize.defaultNode.height
        };

        if (GeometryUtils.isOverlapping(node1Bounds, node2Bounds)) {
          count++;
        }
      }
    }
    return count;
  }
  
  validateConfig(config: any): boolean {
    if (config.intraGroupSpacing !== undefined && config.intraGroupSpacing < 0) {
      return false;
    }
    if (config.interGroupSpacing !== undefined && config.interGroupSpacing < 0) {
      return false;
    }
    return true;
  }
}