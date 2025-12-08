// src/services/layout/utils/ELKGraphConverter.ts
import { Node, Group, Edge, BlockEnum } from '../../../types/graph/models';
import { LayoutOptions } from '../types/layoutTypes';
import { LAYOUT_CONFIG } from '../../../config/layout';
import { ELKConfigBuilder } from './ELKConfigBuilder';
import { PADDING_CONFIG } from '../../../config/layout';

/**
 * ELK节点格式
 */
export interface ElkNode {
  id: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  children?: ElkNode[];
  edges?: ElkEdge[];
  layoutOptions?: Record<string, any>;
}

/**
 * ELK边格式
 */
export interface ElkEdge {
  id: string;
  sources: string[];
  targets: string[];
}

/**
 * ELK图转换器
 * 职责：在项目数据模型和ELK格式之间进行双向转换
 */
export class ELKGraphConverter {
  /**
   * 将项目的节点和边转换为ELK图格式
   *
   * @param nodes 所有节点（包括Node和Group）
   * @param edges 所有边
   * @param options 布局选项
   * @returns ELK图格式
   */
  static toELKGraph(
    nodes: (Node | Group)[],
    edges: Edge[],
    options?: LayoutOptions
  ): ElkNode {
    console.log(`🔄 ELKGraphConverter: 开始转换 ${nodes.length} 个节点`);

    // 构建节点映射，用于快速查找
    const nodeMap = new Map<string, Node | Group>();
    nodes.forEach(n => nodeMap.set(n.id, n));

    // 找出所有顶层节点（没有groupId的节点）
    const topLevelNodes = nodes.filter(n => !('groupId' in n) || !n.groupId);

    console.log(`📊 找到 ${topLevelNodes.length} 个顶层节点`);

    // 构建ELK根节点
    const elkGraph: ElkNode = {
      id: 'root',
      layoutOptions: this.getDefaultLayoutOptions(options),
      children: this.buildChildren(topLevelNodes, nodes, nodeMap),
      edges: this.convertEdges(edges)
    };

    // 统计信息
    const totalChildren = this.countNodes(elkGraph);
    console.log(`✅ 转换完成: ${totalChildren} 个节点, ${elkGraph.edges?.length || 0} 条边`);

    return elkGraph;
  }

  /**
   * 递归构建子节点数组
   *
   * @param currentLevelNodes 当前层级的节点
   * @param allNodes 所有节点
   * @param nodeMap 节点映射表
   * @returns ELK节点数组
   */
  private static buildChildren(
    currentLevelNodes: (Node | Group)[],
    allNodes: (Node | Group)[],
    nodeMap: Map<string, Node | Group>
  ): ElkNode[] {
    const elkNodes: ElkNode[] = [];

    for (const node of currentLevelNodes) {
      const elkNode: ElkNode = {
        id: node.id,
        width: node.width || this.getDefaultWidth(node),
        height: node.height || this.getDefaultHeight(node)
      };

      // 如果是群组，递归处理子节点
      if (node.type === BlockEnum.GROUP) {
        const group = node as Group;

        // 找出该群组的所有直接子节点
        const children = allNodes.filter(
          n => 'groupId' in n && (n as Node).groupId === group.id
        );

        if (children.length > 0) {
          // 递归构建子节点
          elkNode.children = this.buildChildren(children, allNodes, nodeMap);

          // 为包含子节点的群组设置特殊的布局选项
          elkNode.layoutOptions = {
            'elk.padding': this.getGroupPadding(),
            'elk.hierarchyHandling': 'INCLUDE_CHILDREN'
          };

          console.log(`  📦 群组 ${group.id.substring(0, 8)}... 包含 ${children.length} 个子节点`);
        }
      }

      elkNodes.push(elkNode);
    }

    return elkNodes;
  }

  /**
   * 转换边（简化版本 - 只提供基本信息）
   *
   * @param edges 项目的边列表
   * @returns ELK边数组
   */
  private static convertEdges(edges: Edge[]): ElkEdge[] {
    return edges.map(edge => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target]
    }));
  }

  /**
   * 从ELK布局结果提取节点位置和尺寸
   * ✅ 修复：同时提取width和height，确保群组边界自动调整
   *
   * @param elkLayout ELK布局结果
   * @returns 节点位置和尺寸映射 Map<nodeId, {x, y, width?, height?}>
   */
  static fromELKLayout(elkLayout: ElkNode): Map<string, {
    x: number;
    y: number;
    width?: number;
    height?: number;
  }> {
    console.log(`🔄 ELKGraphConverter: 开始提取布局结果`);

    const result = new Map<string, { x: number; y: number; width?: number; height?: number }>();

    // 递归提取所有节点的位置和尺寸
    this.extractPositions(elkLayout, result, 0, 0);

    console.log(`✅ 提取完成: ${result.size} 个节点的位置和尺寸`);

    return result;
  }

  /**
   * 递归提取节点位置和尺寸（处理嵌套结构）
   * ✅ 修复：同时提取ELK计算的width和height
   *
   * @param elkNode ELK节点
   * @param result 位置和尺寸映射表
   * @param parentX 父节点的绝对X坐标
   * @param parentY 父节点的绝对Y坐标
   */
  private static extractPositions(
    elkNode: ElkNode,
    result: Map<string, { x: number; y: number; width?: number; height?: number }>,
    parentX: number,
    parentY: number
  ): void {
    // 跳过根节点
    if (elkNode.id === 'root') {
      // 处理根节点的子节点
      if (elkNode.children) {
        for (const child of elkNode.children) {
          this.extractPositions(child, result, 0, 0);
        }
      }
      return;
    }

    // 计算当前节点的绝对坐标
    const absoluteX = parentX + (elkNode.x || 0);
    const absoluteY = parentY + (elkNode.y || 0);

    // ✅ 同时保存位置和尺寸
    const positionData: { x: number; y: number; width?: number; height?: number } = {
      x: absoluteX,
      y: absoluteY
    };

    // ✅ 如果ELK返回了尺寸（通常是群组节点），也保存
    if (elkNode.width !== undefined) {
      positionData.width = elkNode.width;
    }
    if (elkNode.height !== undefined) {
      positionData.height = elkNode.height;
    }

    result.set(elkNode.id, positionData);

    // 输出日志
    const sizeInfo = positionData.width
      ? `尺寸: ${Math.round(positionData.width)}x${Math.round(positionData.height!)}`
      : '';
    console.log(
      `  📍 节点 ${elkNode.id.substring(0, 8)}... ` +
      `位置: (${Math.round(absoluteX)}, ${Math.round(absoluteY)}) ` +
      `${sizeInfo}`
    );

    // 递归处理子节点
    if (elkNode.children && elkNode.children.length > 0) {
      console.log(`  🔽 递归处理 ${elkNode.children.length} 个子节点...`);

      for (const child of elkNode.children) {
        // 子节点的坐标是相对于父节点内容区域的
        // 需要加上父节点的绝对坐标
        this.extractPositions(child, result, absoluteX, absoluteY);
      }
    }
  }

  /**
   * 获取默认的布局选项
   * ✅ 优化：移除无用配置，确保ELK考虑节点大小和连接关系
   */
  private static getDefaultLayoutOptions(options?: LayoutOptions): Record<string, any> {
    // 使用ELKConfigBuilder获取层次布局配置，并合并用户自定义选项
    const baseConfig = ELKConfigBuilder.getLayeredConfig('DOWN');
    return ELKConfigBuilder.mergeConfig(baseConfig, options?.elkOptions);
  }

  /**
   * 获取群组的padding配置
   */
  private static getGroupPadding(): string {
    // 使用PADDING_CONFIG中的配置，确保与UI中的标题栏高度一致
    const padding = PADDING_CONFIG.GROUP_PADDING;
    return `[top=${padding.top},left=${padding.left},bottom=${padding.bottom},right=${padding.right}]`;
  }

  /**
   * 获取节点的默认宽度
   * ✅ 优化：优先使用节点的实际width，确保ELK获得准确的节点尺寸
   */
  private static getDefaultWidth(node: Node | Group): number {
    // 优先使用节点的实际宽度
    if (node.width && node.width > 0) {
      return node.width;
    }

    // 如果是群组，使用群组默认尺寸
    if (node.type === BlockEnum.GROUP) {
      return LAYOUT_CONFIG.nodeSize.groupNode.width;
    }

    // 普通节点：检查是否展开状态
    if ('isExpanded' in node && node.isExpanded && 'customExpandedSize' in node) {
      const customSize = (node as any).customExpandedSize;
      if (customSize?.width) {
        return customSize.width;
      }
    }

    return LAYOUT_CONFIG.nodeSize.defaultNode.width;
  }

  /**
   * 获取节点的默认高度
   * ✅ 优化：优先使用节点的实际height，确保ELK获得准确的节点尺寸
   */
  private static getDefaultHeight(node: Node | Group): number {
    // 优先使用节点的实际高度
    if (node.height && node.height > 0) {
      return node.height;
    }

    // 如果是群组，使用群组默认尺寸
    if (node.type === BlockEnum.GROUP) {
      return LAYOUT_CONFIG.nodeSize.groupNode.height;
    }

    // 普通节点：检查是否展开状态
    if ('isExpanded' in node && node.isExpanded && 'customExpandedSize' in node) {
      const customSize = (node as any).customExpandedSize;
      if (customSize?.height) {
        return customSize.height;
      }
    }

    return LAYOUT_CONFIG.nodeSize.defaultNode.height;
  }

  /**
   * 统计节点总数（用于调试）
   */
  private static countNodes(elkNode: ElkNode): number {
    let count = elkNode.id === 'root' ? 0 : 1;
    if (elkNode.children) {
      for (const child of elkNode.children) {
        count += this.countNodes(child);
      }
    }
    return count;
  }
}
