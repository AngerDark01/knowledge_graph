// src/services/layout/strategies/ELKGroupLayoutStrategy.ts（正确版本）
import { Node, Group, Edge, BlockEnum } from '../../../types/graph/models';
import { ILayoutStrategy, LayoutResult, LayoutOptions, LayoutNodePosition } from '../types/layoutTypes';
import { type ElkEdge, type ElkNode } from '../utils/ELKGraphConverter';
import { ELKConfigBuilder } from '../utils/ELKConfigBuilder';
import { createELKEngine, type ELKEngine } from '../utils/ELKRuntime';
import { logLayoutDebug } from '../utils/layoutDebug';
import { LAYOUT_CONFIG, PADDING_CONFIG } from '../../../config/layout';

/**
 * 修正的 ELK 群组布局策略
 * 
 * 关键理解：
 * - ELK 返回的子节点坐标是相对于其【直接父容器的内容区】的相对坐标
 * - 而不是相对于根群组的坐标
 * - 所以在递归结构中，每个节点的坐标 = parentOffsetX + elkNode.x
 * - 而不是累加所有祖先！
 */
export class ELKGroupLayoutStrategy implements ILayoutStrategy {
  readonly name = 'ELK Group Layout';
  readonly id = 'elk-group-layout';

  private elkReady: Promise<ELKEngine> | null = null;

  private getELK(): Promise<ELKEngine> {
    if (!this.elkReady) {
      this.elkReady = this.initELK();
    }

    return this.elkReady;
  }

  private async initELK(): Promise<ELKEngine> {
    try {
      const elk = await createELKEngine();
      logLayoutDebug('ELK 库加载成功 (Group Layout Strategy)');
      return elk;
    } catch (error) {
      console.error('❌ ELK 库加载失败:', error);
      throw new Error('Failed to load ELK library. Please install: npm install elkjs');
    }
  }

  async applyLayout(
    nodes: (Node | Group)[],
    edges: Edge[],
    options?: LayoutOptions
  ): Promise<LayoutResult> {
    const startTime = performance.now();

    try {
      logLayoutDebug('ELKGroupLayoutStrategy: 开始布局群组内部');

      const elk = await this.getELK();

      const targetGroupId = options?.groupId;
      if (!targetGroupId) {
        throw new Error('Target group ID is required for group layout');
      }

      const targetGroup = nodes.find(n => n.id === targetGroupId);
      if (!targetGroup || targetGroup.type !== BlockEnum.GROUP) {
        throw new Error(`Target node is not a group: ${targetGroupId}`);
      }

      logLayoutDebug(`目标群组: ${targetGroupId.substring(0, 8)}..., 位置: (${targetGroup.position.x}, ${targetGroup.position.y})`);

      // 提取子图
      const { subgraphNodes, subgraphEdges } = this.extractSubgraph(nodes, edges, targetGroupId);

      logLayoutDebug(`子图包含 ${subgraphNodes.length} 个节点和 ${subgraphEdges.length} 条边`);

      if (subgraphNodes.length === 0) {
        console.warn(`⚠️ 群组 ${targetGroupId} 没有内部节点，无需布局`);
        return {
          success: true,
          nodes: new Map(),
          edges: new Map(),
          errors: [],
          stats: { duration: performance.now() - startTime, iterations: 0, collisions: 0 }
        };
      }

      // 构建 ELK 子图
      const elkGraph = this.createSubgraph(targetGroup, subgraphNodes, subgraphEdges, options);

      logLayoutDebug('执行 ELK 子图布局...');
      const layoutStartTime = performance.now();
      const elkLayout: ElkNode = await elk.layout(elkGraph);
      const layoutDuration = performance.now() - layoutStartTime;
      logLayoutDebug(`ELK 子图布局计算耗时: ${layoutDuration.toFixed(0)}ms`);

      // ✅ 正确的坐标转换
      const nodePositions = this.extractLayoutResults(elkLayout, targetGroup);

      // 🔧 修复：如果ELK返回了目标群组自身的尺寸信息（在某些ELK算法中），也应包含在结果中
      // 查找布局结果中是否有目标群组自身的尺寸信息
      const targetGroupLayoutResult = this.findTargetGroupLayoutResult(elkLayout, targetGroupId);

      // 将目标群组的尺寸更新也包含在返回结果中
      if (targetGroupLayoutResult) {
        nodePositions.set(targetGroupId, {
          x: targetGroup.position.x,
          y: targetGroup.position.y,
          width: targetGroupLayoutResult.width,
          height: targetGroupLayoutResult.height
        });
      }

      const endTime = performance.now();
      const totalDuration = endTime - startTime;

      logLayoutDebug('ELK 群组内部布局完成');
      logLayoutDebug(`更新了 ${nodePositions.size} 个节点位置（含自身边界）`);
      logLayoutDebug(`总耗时: ${totalDuration.toFixed(0)}ms`);

      return {
        success: true,
        nodes: nodePositions,
        edges: new Map(),
        errors: [],
        stats: { duration: totalDuration, iterations: 1, collisions: 0 }
      };

    } catch (error) {
      const endTime = performance.now();
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ ELK 群组内部布局失败:', error);
      return {
        success: false,
        nodes: new Map(),
        edges: new Map(),
        errors: [errorMessage],
        stats: { duration: endTime - startTime, iterations: 0, collisions: 0 }
      };
    }
  }

  private extractSubgraph(
    nodes: (Node | Group)[],
    edges: Edge[],
    rootGroupId: string
  ): { subgraphNodes: (Node | Group)[], subgraphEdges: Edge[] } {
    const descendantNodes = this.getDescendants(nodes, rootGroupId);
    const subgraphNodes = [...descendantNodes, ...nodes.filter(n => n.id === rootGroupId)];

    const subgraphNodeIds = new Set(subgraphNodes.map(node => node.id));
    const subgraphEdges = edges.filter(edge =>
      subgraphNodeIds.has(edge.source) && subgraphNodeIds.has(edge.target)
    );

    return { subgraphNodes, subgraphEdges };
  }

  private getDescendants(nodes: (Node | Group)[], groupId: string): (Node | Group)[] {
    const descendants: (Node | Group)[] = [];
    const directChildren = nodes.filter(node => node.groupId === groupId);

    for (const child of directChildren) {
      descendants.push(child);
      if (child.type === BlockEnum.GROUP) {
        const nestedDescendants = this.getDescendants(nodes, child.id);
        descendants.push(...nestedDescendants);
      }
    }
    return descendants;
  }

  private createSubgraph(
    targetGroup: Group,
    subgraphNodes: (Node | Group)[],
    subgraphEdges: Edge[],
    options?: LayoutOptions
  ): ElkNode {
    const directChildren = subgraphNodes.filter(
      node => node.id !== targetGroup.id && node.groupId === targetGroup.id
    );

    // 使用ELKConfigBuilder获取基础配置，确保与ELKLayoutStrategy一致
    const baseLayoutConfig = ELKConfigBuilder.getLayeredConfig('DOWN');
    const layoutOptions = {
      ...baseLayoutConfig,
      // 确保处理嵌套结构
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
      // 应用群组的padding设置，与系统配置一致
      'elk.padding': `[top=${PADDING_CONFIG.GROUP_PADDING.top},left=${PADDING_CONFIG.GROUP_PADDING.left},bottom=${PADDING_CONFIG.GROUP_PADDING.bottom},right=${PADDING_CONFIG.GROUP_PADDING.right}]`,
      ...options?.elkOptions  // 合并用户选项
    };

    return {
      id: targetGroup.id,
      width: targetGroup.width || LAYOUT_CONFIG.nodeSize.groupNode.width,
      height: targetGroup.height || LAYOUT_CONFIG.nodeSize.groupNode.height,
      layoutOptions,
      children: this.convertNodesRecursive(directChildren, subgraphNodes),
      edges: this.convertEdges(subgraphEdges)
    };
  }

  private convertNodesRecursive(
    nodesToConvert: (Node | Group)[],
    allSubgraphNodes: (Node | Group)[]
  ): ElkNode[] {
    return nodesToConvert.map(node => {
      const elkNode: ElkNode = {
        id: node.id,
        width: node.width || this.getDefaultWidth(node),
        height: node.height || this.getDefaultHeight(node)
      };

      if (node.type === BlockEnum.GROUP) {
        const groupChildren = allSubgraphNodes.filter(
          n => n.groupId === node.id
        );

        if (groupChildren.length > 0) {
          // 为嵌套群组设置适当的布局选项，包括padding
          const baseLayoutConfig = ELKConfigBuilder.getLayeredConfig('DOWN');
          elkNode.layoutOptions = {
            ...baseLayoutConfig,
            'elk.padding': `[top=${PADDING_CONFIG.GROUP_PADDING.top},left=${PADDING_CONFIG.GROUP_PADDING.left},bottom=${PADDING_CONFIG.GROUP_PADDING.bottom},right=${PADDING_CONFIG.GROUP_PADDING.right}]`, // 为嵌套群组的标题栏和其他边距预留空间
            'elk.hierarchyHandling': 'INCLUDE_CHILDREN'
          };
          elkNode.children = this.convertNodesRecursive(groupChildren, allSubgraphNodes);
        }
      }

      return elkNode;
    });
  }

  /**
   * ✅ 关键修复：正确的坐标转换逻辑
   * 
   * ELK 的坐标含义：
   * - 根节点的子节点坐标相对于根的内容区
   * - 嵌套群组内的节点坐标相对于该群组的内容区
   * - 递归结构中，坐标已经是正确的相对值
   * 
   * 转换过程：
   * 1. 递归遍历 ELK 返回的树结构
   * 2. 维护累积偏移：从根到当前节点的位置累和
   * 3. 最后加上目标群组在画布中的位置
   */
  private extractLayoutResults(
    elkLayout: ElkNode,
    targetGroup: Group
  ): Map<string, LayoutNodePosition> {
    const nodePositions = new Map<string, LayoutNodePosition>();

    const groupBaseX = targetGroup.position.x;
    const groupBaseY = targetGroup.position.y;

    logLayoutDebug(`群组基准点: (${groupBaseX}, ${groupBaseY})`);

    // 递归处理节点
    // parentOffsetX/Y: 从根群组到该节点父容器的累积位移
    const processElkNode = (
      elkNode: ElkNode,
      parentOffsetX: number,  // 节点父容器相对于根群组的 X 偏移
      parentOffsetY: number,  // 节点父容器相对于根群组的 Y 偏移
      depth: number = 0
    ) => {
      // 跳过根节点本身
      if (elkNode.id === targetGroup.id) {
        if (elkNode.children) {
          for (const child of elkNode.children) {
            // 根的子节点，父偏移就是 (0, 0)
            processElkNode(child, 0, 0, depth + 1);
          }
        }
        return;
      }

      // 关键：elkNode.x/y 是相对于直接父容器的坐标
      const nodeX = elkNode.x || 0;
      const nodeY = elkNode.y || 0;

      // 当前节点相对于根群组的坐标
      const offsetX = parentOffsetX + nodeX;
      const offsetY = parentOffsetY + nodeY;

      // 绝对坐标（相对于画布）
      const absoluteX = groupBaseX + offsetX;
      const absoluteY = groupBaseY + offsetY;

      const indent = '  '.repeat(depth);
      logLayoutDebug(
        `${indent}${elkNode.id.substring(0, 8)}... ` +
        `相对: (${nodeX.toFixed(0)}, ${nodeY.toFixed(0)}) | ` +
        `累积: (${offsetX.toFixed(0)}, ${offsetY.toFixed(0)}) | ` +
        `绝对: (${absoluteX.toFixed(0)}, ${absoluteY.toFixed(0)})`
      );

      nodePositions.set(elkNode.id, {
        x: absoluteX,
        y: absoluteY,
        width: elkNode.width,
        height: elkNode.height
      });

      // 递归处理子节点
      if (elkNode.children && elkNode.children.length > 0) {
        logLayoutDebug(`${indent}处理 ${elkNode.children.length} 个子节点`);
        for (const child of elkNode.children) {
          // 关键：传递当前节点的累积偏移作为子节点的父偏移
          processElkNode(child, offsetX, offsetY, depth + 1);
        }
      }
    };

    if (elkLayout.children) {
      for (const child of elkLayout.children) {
        processElkNode(child, 0, 0, 0);
      }
    }

    return nodePositions;
  }

  private convertEdges(edges: Edge[]): ElkEdge[] {
    return edges.map(edge => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target]
    }));
  }

  private getDefaultWidth(node: Node | Group): number {
    if (node.width && node.width > 0) return node.width;
    return node.type === BlockEnum.GROUP
      ? LAYOUT_CONFIG.nodeSize.groupNode.width
      : LAYOUT_CONFIG.nodeSize.defaultNode.width;
  }

  /**
   * 查找目标群组在ELK布局结果中的尺寸信息
   * @param elkLayout ELK 布局结果
   * @param targetGroupId 目标群组ID
   * @returns 如果找到，返回包含尺寸信息的对象；否则返回 null
   */
  private findTargetGroupLayoutResult(elkLayout: ElkNode, targetGroupId: string): { width?: number; height?: number } | null {
    // 检查根节点是否是我们寻找的目标群组
    if (elkLayout.id === targetGroupId) {
      return {
        width: elkLayout.width,
        height: elkLayout.height
      };
    }

    // 递归检查子节点
    const findInChildren = (node: ElkNode): { width?: number; height?: number } | null => {
      if (node.id === targetGroupId) {
        return {
          width: node.width,
          height: node.height
        };
      }

      if (node.children) {
        for (const child of node.children) {
          const result = findInChildren(child);
          if (result) {
            return result;
          }
        }
      }

      return null;
    };

    return findInChildren(elkLayout);
  }

  private getDefaultHeight(node: Node | Group): number {
    if (node.height && node.height > 0) return node.height;
    return node.type === BlockEnum.GROUP
      ? LAYOUT_CONFIG.nodeSize.groupNode.height
      : LAYOUT_CONFIG.nodeSize.defaultNode.height;
  }

  validateConfig(): boolean {
    return true;
  }
}
