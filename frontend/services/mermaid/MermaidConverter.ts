/**
 * Mermaid数据转换器
 *
 * 将Mermaid解析结果转换为项目数据模型（Node/Group/Edge）
 */

import { nanoid } from 'nanoid';
import { Node, Group, Edge, BlockEnum } from '@/types/graph/models';
import { NODE_SIZES } from '@/config/graph.config';
import {
  MermaidParseResult,
  MermaidNode,
  MermaidEdge,
  MermaidSubgraph,
  ConversionResult
} from './types';

export class MermaidConverter {
  /**
   * 转换Mermaid解析结果为项目数据模型
   */
  convert(parseResult: MermaidParseResult): ConversionResult {
    console.log('🔄 开始转换Mermaid数据...');

    const idMap = new Map<string, string>();

    // 1. 转换子图为Group
    const groups = this.convertSubgraphs(parseResult.subgraphs, idMap);
    console.log(`📦 转换了 ${groups.length} 个Group`);

    // 2. 转换节点为Node
    const nodes = this.convertNodes(parseResult.nodes, idMap, parseResult.subgraphs);
    console.log(`📦 转换了 ${nodes.length} 个Node`);

    // 3. 更新Group的nodeIds
    this.updateGroupNodeIds(groups, nodes, parseResult.subgraphs, idMap);

    // 4. 转换边为Edge
    const edges = this.convertEdges(parseResult.edges, idMap, nodes, groups);
    console.log(`🔗 转换了 ${edges.length} 条Edge`);

    console.log('✅ 数据转换完成');

    return { nodes, groups, edges, idMap };
  }

  /**
   * 转换子图为Group
   */
  private convertSubgraphs(
    subgraphs: MermaidSubgraph[],
    idMap: Map<string, string>
  ): Group[] {
    const groups: Group[] = [];

    // 按层级排序，确保父级先创建
    const sortedSubgraphs = [...subgraphs].sort((a, b) => a.level - b.level);

    for (const subgraph of sortedSubgraphs) {
      const groupId = `mmd_group_${nanoid(8)}`;
      idMap.set(subgraph.id, groupId);

      const group: Group = {
        id: groupId,
        type: BlockEnum.GROUP,
        title: subgraph.title,
        content: `方向: ${subgraph.direction}`,
        nodeIds: [],  // 稍后填充
        groupId: subgraph.parent ? idMap.get(subgraph.parent) : undefined,
        collapsed: false,
        position: { x: 0, y: 0 },  // 待布局计算
        width: NODE_SIZES.GROUP.DEFAULT_WIDTH,
        height: NODE_SIZES.GROUP.DEFAULT_HEIGHT,
        boundary: {
          minX: 0,
          minY: 0,
          maxX: NODE_SIZES.GROUP.DEFAULT_WIDTH,
          maxY: NODE_SIZES.GROUP.DEFAULT_HEIGHT
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      groups.push(group);
      console.log(`  ✓ 创建Group: ${subgraph.title} (层级: ${subgraph.level})`);
    }

    return groups;
  }

  /**
   * 转换节点为Node
   */
  private convertNodes(
    mermaidNodes: MermaidNode[],
    idMap: Map<string, string>,
    subgraphs: MermaidSubgraph[]
  ): Node[] {
    const nodes: Node[] = [];

    // 收集所有子图ID
    const subgraphIds = new Set(subgraphs.map(s => s.id));

    for (const mNode of mermaidNodes) {
      // 跳过已转换为Group的节点
      if (subgraphIds.has(mNode.id)) {
        console.log(`  ⊙ 跳过子图节点: ${mNode.id}`);
        continue;
      }

      const nodeId = `mmd_node_${nanoid(8)}`;
      idMap.set(mNode.id, nodeId);

      // 查找节点所属的子图
      const ownerSubgraph = subgraphs.find(s => s.nodes.includes(mNode.id) && !subgraphIds.has(mNode.id));

      const node: Node = {
        id: nodeId,
        type: BlockEnum.NODE,
        title: mNode.label,
        content: `形状: ${mNode.shape}`,
        position: { x: 0, y: 0 },  // 待布局计算
        width: NODE_SIZES.NOTE.DEFAULT_WIDTH,
        height: NODE_SIZES.NOTE.DEFAULT_HEIGHT,
        groupId: ownerSubgraph ? idMap.get(ownerSubgraph.id) : undefined,
        style: this.convertStyles(mNode.styles),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      nodes.push(node);
      console.log(`  ✓ 创建Node: ${mNode.label}${node.groupId ? ` (所属: ${ownerSubgraph?.title})` : ''}`);
    }

    return nodes;
  }

  /**
   * 更新Group的nodeIds
   */
  private updateGroupNodeIds(
    groups: Group[],
    nodes: Node[],
    subgraphs: MermaidSubgraph[],
    idMap: Map<string, string>
  ): void {
    for (const group of groups) {
      // 查找对应的Mermaid子图
      const mermaidSubgraph = subgraphs.find(s => idMap.get(s.id) === group.id);
      if (!mermaidSubgraph) continue;

      // 添加直接子节点
      for (const node of nodes) {
        if (node.groupId === group.id) {
          group.nodeIds.push(node.id);
        }
      }

      // 添加子Group
      for (const childGroup of groups) {
        if (childGroup.groupId === group.id) {
          group.nodeIds.push(childGroup.id);
        }
      }

      console.log(`  ✓ Group ${group.title} 包含 ${group.nodeIds.length} 个子项`);
    }
  }

  /**
   * 转换边为Edge
   */
  private convertEdges(
    mermaidEdges: MermaidEdge[],
    idMap: Map<string, string>,
    nodes: Node[],
    groups: Group[]
  ): Edge[] {
    const edges: Edge[] = [];

    for (const mEdge of mermaidEdges) {
      const sourceId = idMap.get(mEdge.source);
      const targetId = idMap.get(mEdge.target);

      if (!sourceId || !targetId) {
        console.warn(`  ⚠ 跳过无效边: ${mEdge.source} -> ${mEdge.target}`);
        continue;
      }

      const edge: Edge = {
        id: `mmd_edge_${nanoid(8)}`,
        source: sourceId,
        target: targetId,
        label: mEdge.label,
        data: {
          strokeWidth: mEdge.strokeWidth,
          strokeDasharray: mEdge.stroke === 'dotted' ? '5,5' : undefined,
          direction: this.getEdgeDirection(mEdge.type)
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 计算跨组信息
      this.calculateCrossGroupInfo(edge, nodes, groups);

      edges.push(edge);
      console.log(`  ✓ 创建Edge: ${mEdge.source} -> ${mEdge.target}${edge.data?.isCrossGroup ? ' (跨组)' : ''}`);
    }

    return edges;
  }

  /**
   * 转换样式
   */
  private convertStyles(styles: string[] | undefined): any {
    if (!styles || styles.length === 0) {
      return undefined;
    }

    const style: any = {};

    for (const styleStr of styles) {
      if (styleStr.startsWith('fill:')) {
        style.backgroundColor = styleStr.substring(5);
      } else if (styleStr.startsWith('stroke:')) {
        style.borderColor = styleStr.substring(7);
      } else if (styleStr.startsWith('stroke-width:')) {
        style.borderWidth = styleStr.substring(13);
      } else if (styleStr.startsWith('color:')) {
        style.color = styleStr.substring(6);
      }
    }

    return Object.keys(style).length > 0 ? style : undefined;
  }

  /**
   * 获取边的方向性
   */
  private getEdgeDirection(type: string): 'unidirectional' | 'bidirectional' | 'undirected' {
    if (type === 'double_arrow_point' || type === 'double_arrow_open') {
      return 'bidirectional';
    } else if (type.includes('arrow')) {
      return 'unidirectional';
    }
    return 'undirected';
  }

  /**
   * 计算跨组信息
   */
  private calculateCrossGroupInfo(
    edge: Edge,
    nodes: Node[],
    groups: Group[]
  ): void {
    const allEntities = [...nodes, ...groups];
    const sourceEntity = allEntities.find(e => e.id === edge.source);
    const targetEntity = allEntities.find(e => e.id === edge.target);

    const sourceGroupId = sourceEntity?.groupId;
    const targetGroupId = targetEntity?.groupId;

    edge.data = {
      ...edge.data,
      isCrossGroup: sourceGroupId !== targetGroupId,
      sourceGroupId,
      targetGroupId
    };
  }
}
