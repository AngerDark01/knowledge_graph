// src/services/layout/utils/NestingTreeBuilder.ts
import { Node, Group, BlockEnum } from '../../../types/graph/models';
import { NESTING_CONFIG } from '../../../config/graph.config';

/**
 * 嵌套树节点结构
 */
export interface NestingTreeNode {
  id: string;
  node: Node | Group;
  depth: number;
  isGroup: boolean;
  children: NestingTreeNode[];
  parentId?: string;
}

/**
 * 嵌套层级树构建器
 * 职责：分析节点关系，构建嵌套层级结构，计算嵌套深度
 */
export class NestingTreeBuilder {
  private depthCache: Map<string, number>;
  private nodeMap: Map<string, Node | Group>;

  constructor() {
    this.depthCache = new Map();
    this.nodeMap = new Map();
  }

  /**
   * 递归计算节点的嵌套深度
   * @param nodeId 节点ID
   * @param visited 用于检测循环嵌套的访问记录
   * @returns 嵌套深度 (0 = 顶层)
   */
  calculateDepth(
    nodeId: string,
    visited: Set<string> = new Set()
  ): number {
    // 检查缓存
    if (this.depthCache.has(nodeId)) {
      return this.depthCache.get(nodeId)!;
    }

    // 检测循环嵌套
    if (visited.has(nodeId)) {
      if (NESTING_CONFIG.ENABLE_CIRCULAR_CHECK) {
        throw new Error(`检测到循环嵌套: 节点 ${nodeId} 形成循环引用`);
      }
      console.warn(`检测到循环嵌套: 节点 ${nodeId}`);
      return 0;
    }

    const node = this.nodeMap.get(nodeId);
    if (!node) {
      console.warn(`节点 ${nodeId} 不存在`);
      return 0;
    }

    // 如果没有父群组，深度为0
    if (!('groupId' in node) || !node.groupId) {
      this.depthCache.set(nodeId, 0);
      return 0;
    }

    // 递归计算父群组的深度
    const newVisited = new Set(visited);
    newVisited.add(nodeId);

    const parentDepth = this.calculateDepth(node.groupId, newVisited);
    const depth = parentDepth + 1;

    // 检查最大深度限制
    if (depth > NESTING_CONFIG.MAX_DEPTH) {
      console.warn(
        `节点 ${nodeId} 超过最大嵌套深度 ${NESTING_CONFIG.MAX_DEPTH}，将被限制为 ${NESTING_CONFIG.MAX_DEPTH}`
      );
      this.depthCache.set(nodeId, NESTING_CONFIG.MAX_DEPTH);
      return NESTING_CONFIG.MAX_DEPTH;
    }

    this.depthCache.set(nodeId, depth);
    return depth;
  }

  /**
   * 检测是否存在循环嵌套
   * @param nodeId 节点ID
   * @returns 是否存在循环
   */
  detectCircular(nodeId: string): boolean {
    const visited = new Set<string>();
    let currentId: string | undefined = nodeId;

    while (currentId) {
      if (visited.has(currentId)) {
        return true; // 检测到循环
      }

      visited.add(currentId);

      const node = this.nodeMap.get(currentId);
      if (!node || !('groupId' in node)) {
        break;
      }

      currentId = (node as Node).groupId;
    }

    return false;
  }

  /**
   * 按深度对节点分组
   * @param nodes 所有节点
   * @returns 深度 -> 节点列表的映射
   */
  groupNodesByDepth(nodes: (Node | Group)[]): Map<number, (Node | Group)[]> {
    // 初始化节点映射
    this.nodeMap = new Map(nodes.map(n => [n.id, n]));
    this.depthCache.clear();

    const depthGroups = new Map<number, (Node | Group)[]>();

    for (const node of nodes) {
      try {
        const depth = this.calculateDepth(node.id);

        if (!depthGroups.has(depth)) {
          depthGroups.set(depth, []);
        }
        depthGroups.get(depth)!.push(node);
      } catch (error) {
        console.error(`计算节点 ${node.id} 深度时出错:`, error);
        // 出错的节点默认放到顶层
        if (!depthGroups.has(0)) {
          depthGroups.set(0, []);
        }
        depthGroups.get(0)!.push(node);
      }
    }

    return depthGroups;
  }

  /**
   * 构建嵌套层级树
   * @param nodes 所有节点
   * @returns 嵌套树节点列表
   */
  buildTree(nodes: (Node | Group)[]): NestingTreeNode[] {
    // 初始化节点映射
    this.nodeMap = new Map(nodes.map(n => [n.id, n]));
    this.depthCache.clear();

    const treeNodes: NestingTreeNode[] = [];
    const treeNodeMap = new Map<string, NestingTreeNode>();

    // 第一遍：创建所有树节点
    for (const node of nodes) {
      const depth = this.calculateDepth(node.id);
      const isGroup = node.type === BlockEnum.GROUP;

      const treeNode: NestingTreeNode = {
        id: node.id,
        node,
        depth,
        isGroup,
        children: [],
        parentId: 'groupId' in node ? (node as Node).groupId : undefined,
      };

      treeNodeMap.set(node.id, treeNode);
      treeNodes.push(treeNode);
    }

    // 第二遍：建立父子关系
    for (const treeNode of treeNodes) {
      if (treeNode.parentId) {
        const parentNode = treeNodeMap.get(treeNode.parentId);
        if (parentNode) {
          parentNode.children.push(treeNode);
        }
      }
    }

    return treeNodes;
  }

  /**
   * 获取指定深度的所有群组节点
   * @param depthGroups 深度分组结果
   * @param depth 目标深度
   * @returns 该深度的所有群组节点
   */
  getGroupsAtDepth(
    depthGroups: Map<number, (Node | Group)[]>,
    depth: number
  ): Group[] {
    const nodesAtDepth = depthGroups.get(depth) || [];
    return nodesAtDepth.filter(n => n.type === BlockEnum.GROUP) as Group[];
  }

  /**
   * 获取最大嵌套深度
   * @param depthGroups 深度分组结果
   * @returns 最大深度
   */
  getMaxDepth(depthGroups: Map<number, (Node | Group)[]>): number {
    const depths = Array.from(depthGroups.keys());
    return depths.length > 0 ? Math.max(...depths) : 0;
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.depthCache.clear();
    this.nodeMap.clear();
  }
}
