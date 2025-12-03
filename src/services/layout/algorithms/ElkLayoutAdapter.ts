/**
 * ELK 布局适配层
 *
 * 职责：
 * 1. 将你的数据结构（Node/Group/Edge）转换为 ELK 格式
 * 2. 将 ELK 的布局结果转换回你的格式
 * 3. 处理嵌套结构的递归转换
 * 4. 保留所有非布局相关的属性
 */

import { Node, Group, Edge, BlockEnum } from '@/types/graph/models';
import {
  ELKNode,
  ELKEdge,
  ELKGraph,
  SubgraphExtractResult,
  LayoutedNode,
  LayoutResult,
  LayoutedEdge
} from '../types/layoutTypesV2';
import { GLOBAL_LAYOUT_CONFIG, GROUP_INTERNAL_CONFIG, ELK_NODE_SIZE } from '../config/elk.config';

export class ElkLayoutAdapter {
  /**
   * 将你的数据结构转换为 ELK 格式
   *
   * @param nodes 你的节点列表（包括 Group）
   * @param edges 你的边列表
   * @param layoutOptions ELK 布局选项（可选）
   * @returns ELK 格式的图
   */
  toElkGraph(
    nodes: (Node | Group)[],
    edges: Edge[],
    layoutOptions: Record<string, any> = GLOBAL_LAYOUT_CONFIG
  ): ELKGraph {
    // 创建节点 ID → 节点对象的映射，便于查找
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    // 将所有节点转换为 ELK 节点
    const elkChildren = this.convertNodesToElkNodes(nodes, nodeMap);

    // 将所有边转换为 ELK 边
    const elkEdges = this.convertEdgesToElkEdges(edges);

    // 构建 ELK 图
    const elkGraph: ELKGraph = {
      id: 'root',
      layoutOptions,
      children: elkChildren,
      edges: elkEdges
    };

    return elkGraph;
  }

  /**
   * 将 ELK 的布局结果转换回你的格式
   *
   * @param elkGraph ELK 布局后的结果（包含 x, y, width, height）
   * @param originalNodes 原始节点列表（用于保留其他属性）
   * @param originalEdges 原始边列表
   * @returns LayoutResult
   */
  fromElkGraph(
    elkGraph: ELKGraph,
    originalNodes: (Node | Group)[],
    originalEdges: Edge[]
  ): LayoutResult {
    const nodes = new Map<string, LayoutedNode>();
    const edges = new Map<string, LayoutedEdge>();
    const nodeMap = new Map(originalNodes.map(n => [n.id, n]));

    // 递归处理所有 ELK 节点，转换回 LayoutedNode
    const processELKNodes = (elkNodes: ELKNode[] | undefined) => {
      if (!elkNodes) return;

      for (const elkNode of elkNodes) {
        const originalNode = nodeMap.get(elkNode.id);
        if (originalNode) {
          // 提取位置信息
          const position: LayoutedNode = {
            x: elkNode.x || 0,
            y: elkNode.y || 0,
            width: elkNode.width,
            height: elkNode.height
          };

          // 如果是群组，计算边界
          if (originalNode.type === BlockEnum.GROUP && elkNode.children) {
            position.boundary = this.calculateNodeBoundary(
              elkNode.x || 0,
              elkNode.y || 0,
              elkNode.width,
              elkNode.height
            );
          }

          nodes.set(elkNode.id, position);

          // 递归处理子节点
          if (elkNode.children) {
            processELKNodes(elkNode.children);
          }
        }
      }
    };

    // 处理 ELK 的所有节点（包括嵌套的）
    processELKNodes(elkGraph.children);

    // 处理边的连接点（仅设置占位符，实际连接点由 EdgeOptimizer 处理）
    for (const originalEdge of originalEdges) {
      edges.set(originalEdge.id, {
        sourceHandle: undefined,
        targetHandle: undefined
      });
    }

    return {
      success: true,
      nodes,
      edges,
      errors: [],
      stats: {
        duration: 0,
        iterations: 1,
        collisions: 0,
        nodesLayouted: nodes.size,
        edgesLayouted: edges.size
      }
    };
  }

  /**
   * 从 ELK 图中递归提取所有节点，转换为平扁列表
   * 用于便于访问所有节点的位置信息
   */
  flattenELKNodes(elkNodes: ELKNode[] | undefined): Map<string, ELKNode> {
    const result = new Map<string, ELKNode>();

    const process = (nodes: ELKNode[] | undefined) => {
      if (!nodes) return;
      for (const node of nodes) {
        result.set(node.id, node);
        process(node.children);
      }
    };

    process(elkNodes);
    return result;
  }

  /**
   * 私有方法：将节点数组转换为 ELK 节点数组
   */
  private convertNodesToElkNodes(
    nodes: (Node | Group)[],
    nodeMap: Map<string, Node | Group>
  ): ELKNode[] {
    // 首先只转换顶层节点（没有 groupId 的节点）
    const topLevelNodes = nodes.filter(n => !('groupId' in n) || !n.groupId);

    return topLevelNodes.map(node => this.nodeToElkNode(node, nodes, nodeMap));
  }

  /**
   * 私有方法：将单个节点转换为 ELK 节点（递归处理嵌套）
   */
  private nodeToElkNode(
    node: Node | Group,
    allNodes: (Node | Group)[],
    nodeMap: Map<string, Node | Group>
  ): ELKNode {
    const elkNode: ELKNode = {
      id: node.id,
      width: node.width || (node.type === BlockEnum.GROUP ? ELK_NODE_SIZE.defaultGroup.width : ELK_NODE_SIZE.defaultNode.width),
      height: node.height || (node.type === BlockEnum.GROUP ? ELK_NODE_SIZE.defaultGroup.height : ELK_NODE_SIZE.defaultNode.height),
      // 保留原始数据，便于后续恢复其他属性
      properties: {
        originalNode: node,
        type: node.type
      }
    };

    // 如果是群组，设置群组的 padding 配置，并处理子节点
    if (node.type === BlockEnum.GROUP) {
      const group = node as Group;

      // 添加群组标题标签
      if (group.title) {
        elkNode.labels = [{ text: group.title }];
      }

      // 设置群组内部布局的配置
      elkNode.layoutOptions = {
        ...GROUP_INTERNAL_CONFIG
      };

      // 递归处理群组内的子节点
      const childNodes = allNodes.filter(n => 'groupId' in n && n.groupId === group.id);
      if (childNodes.length > 0) {
        elkNode.children = childNodes.map(child => this.nodeToElkNode(child, allNodes, nodeMap));
      }
    }

    return elkNode;
  }

  /**
   * 私有方法：将边数组转换为 ELK 边数组
   */
  private convertEdgesToElkEdges(edges: Edge[]): ELKEdge[] {
    return edges.map(edge => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
      // 保留原始边数据（可选）
      properties: {
        originalEdge: edge
      }
    }));
  }

  /**
   * 私有方法：计算节点的边界框
   */
  private calculateNodeBoundary(
    x: number,
    y: number,
    width: number,
    height: number
  ): { minX: number; minY: number; maxX: number; maxY: number } {
    return {
      minX: x,
      minY: y,
      maxX: x + width,
      maxY: y + height
    };
  }

  /**
   * 提取子图：给定选中的节点 ID，返回这些节点及其相关的边
   *
   * @param selectedNodeIds 选中的节点 ID 数组
   * @param allNodes 所有节点
   * @param allEdges 所有边
   * @param includeChildren 是否包含子节点（递归）
   */
  extractSubgraph(
    selectedNodeIds: string[],
    allNodes: (Node | Group)[],
    allEdges: Edge[],
    includeChildren: boolean = false
  ): SubgraphExtractResult {
    const selectedSet = new Set(selectedNodeIds);
    const subgraphNodes = new Set<Node | Group>();

    // 1. 添加选中的节点
    selectedNodeIds.forEach(id => {
      const node = allNodes.find(n => n.id === id);
      if (node) {
        subgraphNodes.add(node);
      }
    });

    // 2. 如果包含子节点，递归添加
    if (includeChildren) {
      const toProcess = [...selectedNodeIds];
      const processed = new Set<string>();

      while (toProcess.length > 0) {
        const nodeId = toProcess.pop();
        if (!nodeId || processed.has(nodeId)) continue;
        processed.add(nodeId);

        const node = allNodes.find(n => n.id === nodeId);
        if (node && node.type === BlockEnum.GROUP) {
          // 找到属于这个群组的所有子节点
          const children = allNodes.filter(n => 'groupId' in n && n.groupId === nodeId);
          children.forEach(child => {
            if (!selectedSet.has(child.id)) {
              subgraphNodes.add(child);
              if (child.type === BlockEnum.GROUP) {
                toProcess.push(child.id);
              }
            }
          });
        }
      }
    }

    // 3. 收集相关的边（源和目标都在子图中）
    const subgraphNodeIds = new Set(Array.from(subgraphNodes).map(n => n.id));
    const subgraphEdges = allEdges.filter(
      edge =>
        subgraphNodeIds.has(edge.source) &&
        subgraphNodeIds.has(edge.target)
    );

    return {
      subgraphNodes: Array.from(subgraphNodes),
      subgraphEdges
    };
  }

  /**
   * 获取特定群组的所有子节点（非递归）
   */
  getGroupChildren(groupId: string, allNodes: (Node | Group)[]): (Node | Group)[] {
    return allNodes.filter(n => 'groupId' in n && n.groupId === groupId);
  }

  /**
   * 获取特定群组的所有后代节点（递归）
   */
  getAllDescendants(groupId: string, allNodes: (Node | Group)[]): (Node | Group)[] {
    const result: (Node | Group)[] = [];
    const toProcess = [groupId];
    const processed = new Set<string>();

    while (toProcess.length > 0) {
      const nodeId = toProcess.pop();
      if (!nodeId || processed.has(nodeId)) continue;
      processed.add(nodeId);

      const children = this.getGroupChildren(nodeId, allNodes);
      children.forEach(child => {
        result.push(child);
        if (child.type === BlockEnum.GROUP) {
          toProcess.push(child.id);
        }
      });
    }

    return result;
  }

  /**
   * 将 ELK 布局结果与原始节点合并（保留所有非位置的属性）
   */
  mergeWithOriginal(
    layoutResult: LayoutResult,
    originalNodes: (Node | Group)[]
  ): (Node | Group)[] {
    return originalNodes.map(originalNode => {
      const layoutedPosition = layoutResult.nodes.get(originalNode.id);

      if (layoutedPosition) {
        return {
          ...originalNode,
          position: { x: layoutedPosition.x, y: layoutedPosition.y },
          width: layoutedPosition.width,
          height: layoutedPosition.height,
          boundary: layoutedPosition.boundary
        } as Node | Group;
      }

      return originalNode;
    });
  }

  /**
   * 将局部布局结果合并到全局节点列表中
   * 只更新选中的节点，其他节点保持原样
   */
  mergeLocalLayoutResult(
    localLayoutResult: LayoutResult,
    allNodes: (Node | Group)[],
    selectedNodeIds: string[]
  ): (Node | Group)[] {
    const selectedSet = new Set(selectedNodeIds);

    return allNodes.map(originalNode => {
      if (selectedSet.has(originalNode.id)) {
        // 更新选中的节点
        const layoutedPosition = localLayoutResult.nodes.get(originalNode.id);
        if (layoutedPosition) {
          return {
            ...originalNode,
            position: { x: layoutedPosition.x, y: layoutedPosition.y },
            width: layoutedPosition.width,
            height: layoutedPosition.height,
            boundary: layoutedPosition.boundary
          } as Node | Group;
        }
      }

      // 其他节点保持原样
      return originalNode;
    });
  }
}
