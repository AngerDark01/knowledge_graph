// src/services/layout/strategies/CompositeLayoutStrategy.ts
import { Node, Group, Edge } from '../../../types/graph/models';
import { ILayoutStrategy, LayoutResult, LayoutOptions } from '../types/layoutTypes';
import { GridCenterLayoutStrategy } from './GridCenterLayoutStrategy';
import { GroupAwareLayoutStrategy } from './GroupAwareLayoutStrategy';
import { EdgeOptimizationStrategy } from './EdgeOptimizationStrategy';
import { GeometryUtils } from '../utils/GeometryUtils';

export interface CompositeLayoutOptions extends LayoutOptions {
  enableNodeLayout?: boolean;
  enableGroupLayout?: boolean;
  enableEdgeOptimization?: boolean;
  nodeLayoutStrategy?: string;
  groupLayoutStrategy?: string;
  edgeOptimizationOptions?: any;
}

export class CompositeLayoutStrategy implements ILayoutStrategy {
  name = 'Composite Layout Strategy';
  id = 'composite-layout';
  
  private gridCenterStrategy: GridCenterLayoutStrategy;
  private groupAwareStrategy: GroupAwareLayoutStrategy;
  private edgeOptimizationStrategy: EdgeOptimizationStrategy;
  
  constructor() {
    this.gridCenterStrategy = new GridCenterLayoutStrategy();
    this.groupAwareStrategy = new GroupAwareLayoutStrategy();
    this.edgeOptimizationStrategy = new EdgeOptimizationStrategy();
  }
  
  async applyLayout(
    nodes: (Node | Group)[],
    edges: Edge[],
    options?: CompositeLayoutOptions
  ): Promise<LayoutResult> {
    const startTime = performance.now();
    
    try {
      let workingNodes = [...nodes];
      let workingEdges = [...edges];
      let finalNodePositions = new Map<string, { x: number; y: number }>();
      let finalEdgeProperties = new Map<string, any>();
      
      // 步骤1: 应用节点布局
      if (options?.enableNodeLayout !== false) {
        const nodeLayoutResult = await this.applyNodeLayout(workingNodes, workingEdges, options);
        if (nodeLayoutResult.success) {
          // 更新节点位置
          nodeLayoutResult.nodes.forEach((position, nodeId) => {
            finalNodePositions.set(nodeId, position);
          });
          
          // 更新workingNodes中的位置
          workingNodes = workingNodes.map(node => {
            if (finalNodePositions.has(node.id)) {
              return {
                ...node,
                position: finalNodePositions.get(node.id)!
              };
            }
            return node;
          });
        }
      }
      
      // 步骤2: 应用组布局
      if (options?.enableGroupLayout !== false) {
        const groupLayoutResult = await this.applyGroupLayout(workingNodes, workingEdges, options);
        if (groupLayoutResult.success) {
          // 更新节点位置
          groupLayoutResult.nodes.forEach((position, nodeId) => {
            finalNodePositions.set(nodeId, position);
          });
          
          // 更新workingNodes中的位置
          workingNodes = workingNodes.map(node => {
            if (finalNodePositions.has(node.id)) {
              return {
                ...node,
                position: finalNodePositions.get(node.id)!
              };
            }
            return node;
          });
        }
      }
      
      // 步骤3: 应用边优化
      if (options?.enableEdgeOptimization !== false) {
        const edgeOptResult = await this.edgeOptimizationStrategy.applyLayout(
          workingNodes, 
          workingEdges, 
          options?.edgeOptimizationOptions
        );
        if (edgeOptResult.success) {
          // 更新边的属性
          edgeOptResult.edges.forEach((properties, edgeId) => {
            finalEdgeProperties.set(edgeId, properties);
          });
        }
      }
      
      const endTime = performance.now();
      
      return {
        success: true,
        nodes: finalNodePositions,
        edges: finalEdgeProperties,
        errors: [],
        stats: {
          duration: endTime - startTime,
          iterations: 3, // 三个步骤
          collisions: this.estimateCollisions(workingNodes)
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
   * 应用节点布局
   */
  private async applyNodeLayout(
    nodes: (Node | Group)[],
    edges: Edge[],
    options?: CompositeLayoutOptions
  ): Promise<LayoutResult> {
    const strategy = options?.nodeLayoutStrategy === 'group-aware-layout' 
      ? this.groupAwareStrategy 
      : this.gridCenterStrategy;
    
    return await strategy.applyLayout(nodes, edges, {
      useWeightedLayout: true
    });
  }
  
  /**
   * 应用组布局
   */
  private async applyGroupLayout(
    nodes: (Node | Group)[],
    edges: Edge[],
    options?: CompositeLayoutOptions
  ): Promise<LayoutResult> {
    return await this.groupAwareStrategy.applyLayout(nodes, edges, {
      intraGroupSpacing: 30,
      interGroupSpacing: 50
    });
  }
  
  /**
   * 估算碰撞数
   */
  private estimateCollisions(nodes: (Node | Group)[]): number {
    let count = 0;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        
        const node1Bounds = {
          x: node1.position.x - (node1.width || 0) / 2,
          y: node1.position.y - (node1.height || 0) / 2,
          width: node1.width || 350,
          height: node1.height || 280
        };
        
        const node2Bounds = {
          x: node2.position.x - (node2.width || 0) / 2,
          y: node2.position.y - (node2.height || 0) / 2,
          width: node2.width || 350,
          height: node2.height || 280
        };
        
        if (GeometryUtils.isOverlapping(node1Bounds, node2Bounds)) {
          count++;
        }
      }
    }
    return count;
  }
  
  validateConfig(config: any): boolean {
    if (config.enableNodeLayout !== undefined && typeof config.enableNodeLayout !== 'boolean') {
      return false;
    }
    if (config.enableGroupLayout !== undefined && typeof config.enableGroupLayout !== 'boolean') {
      return false;
    }
    if (config.enableEdgeOptimization !== undefined && typeof config.enableEdgeOptimization !== 'boolean') {
      return false;
    }
    if (config.nodeLayoutStrategy !== undefined && 
        !['grid-center-layout', 'group-aware-layout'].includes(config.nodeLayoutStrategy)) {
      return false;
    }
    if (config.groupLayoutStrategy !== undefined && 
        !['group-aware-layout'].includes(config.groupLayoutStrategy)) {
      return false;
    }
    return true;
  }
}