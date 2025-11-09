/**
 * 群组嵌套工具函数
 * 提供嵌套层级计算、循环检测、节点查询等功能
 */

import { Node, Group, BlockEnum } from '@/types/graph/models';
import { GraphConfig } from '@/config/graph.config';

/**
 * 获取节点的嵌套深度
 * @param nodeId 节点 ID
 * @param nodes 所有节点列表
 * @returns 嵌套深度（0 表示顶层）
 */
export function getNestingDepth(
  nodeId: string,
  nodes: (Node | Group)[]
): number {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return 0;

  // 如果节点没有 groupId，说明是顶层节点
  if (!('groupId' in node) || !node.groupId) {
    return 0;
  }

  // 递归计算父节点的深度 + 1
  return 1 + getNestingDepth(node.groupId, nodes);
}

/**
 * 检测是否会造成循环嵌套
 * @param groupId 要添加子节点的群组 ID
 * @param targetNodeId 要添加的节点 ID
 * @param nodes 所有节点列表
 * @returns true 表示会造成循环嵌套
 *
 * @example
 * // 如果 B 已经在 A 内部（直接或间接），则不能将 A 添加到 B
 * hasCircularNesting('B', 'A', nodes) // true
 */
export function hasCircularNesting(
  groupId: string,
  targetNodeId: string,
  nodes: (Node | Group)[]
): boolean {
  // 不能将自己添加到自己
  if (groupId === targetNodeId) {
    return true;
  }

  // 获取 targetNode
  const targetNode = nodes.find(n => n.id === targetNodeId);
  if (!targetNode) return false;

  // 如果 targetNode 不是 GROUP，不会造成循环
  if (targetNode.type !== BlockEnum.GROUP) {
    return false;
  }

  // 检查 groupId 是否是 targetNodeId 的祖先
  // 如果是，则会造成循环
  const ancestorPath = getAncestorPath(groupId, nodes);
  return ancestorPath.includes(targetNodeId);
}

/**
 * 检查是否超过最大嵌套深度
 * @param groupId 父群组 ID
 * @param nodes 所有节点列表
 * @returns true 表示已达到最大深度，不能继续嵌套
 */
export function exceedsMaxDepth(
  groupId: string,
  nodes: (Node | Group)[]
): boolean {
  const depth = getNestingDepth(groupId, nodes);
  return depth >= GraphConfig.nesting.maxDepth;
}

/**
 * 递归获取群组内所有节点 ID（包括嵌套的群组及其内部节点）
 * @param groupId 群组 ID
 * @param nodes 所有节点列表
 * @returns 所有子节点 ID 数组
 */
export function getAllNestedNodeIds(
  groupId: string,
  nodes: (Node | Group)[]
): string[] {
  const group = nodes.find(n => n.id === groupId && n.type === BlockEnum.GROUP) as Group;
  if (!group) return [];

  const result: string[] = [];

  // 获取直接子节点
  const directChildren = nodes.filter(n =>
    'groupId' in n && n.groupId === groupId
  );

  for (const child of directChildren) {
    result.push(child.id);

    // 如果子节点是群组，递归获取其内部节点
    if (child.type === BlockEnum.GROUP) {
      const nestedIds = getAllNestedNodeIds(child.id, nodes);
      result.push(...nestedIds);
    }
  }

  return result;
}

/**
 * 获取节点到顶层的完整祖先路径
 * @param nodeId 节点 ID
 * @param nodes 所有节点列表
 * @returns 祖先 ID 数组（从直接父节点到根节点）
 *
 * @example
 * // 如果 C 在 B 中，B 在 A 中
 * getAncestorPath('C', nodes) // ['B', 'A']
 */
export function getAncestorPath(
  nodeId: string,
  nodes: (Node | Group)[]
): string[] {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return [];

  // 如果没有父节点，返回空数组
  if (!('groupId' in node) || !node.groupId) {
    return [];
  }

  // 递归获取父节点的祖先路径，并添加当前父节点
  return [node.groupId, ...getAncestorPath(node.groupId, nodes)];
}

/**
 * 找到两个节点的最近公共祖先
 * @param nodeId1 节点 1 ID
 * @param nodeId2 节点 2 ID
 * @param nodes 所有节点列表
 * @returns 最近公共祖先 ID，如果没有则返回 null
 */
export function findCommonAncestor(
  nodeId1: string,
  nodeId2: string,
  nodes: (Node | Group)[]
): string | null {
  if (nodeId1 === nodeId2) return null;

  const path1 = getAncestorPath(nodeId1, nodes);
  const path2 = getAncestorPath(nodeId2, nodes);

  // 找到第一个共同的祖先
  for (const ancestor of path1) {
    if (path2.includes(ancestor)) {
      return ancestor;
    }
  }

  return null;
}

/**
 * 判断两个节点是否在同一个直接父群组内
 * @param nodeId1 节点 1 ID
 * @param nodeId2 节点 2 ID
 * @param nodes 所有节点列表
 * @returns true 表示在同一个直接父群组内
 */
export function isInSameDirectParent(
  nodeId1: string,
  nodeId2: string,
  nodes: (Node | Group)[]
): boolean {
  const node1 = nodes.find(n => n.id === nodeId1);
  const node2 = nodes.find(n => n.id === nodeId2);

  if (!node1 || !node2) return false;

  const groupId1 = ('groupId' in node1) ? node1.groupId : undefined;
  const groupId2 = ('groupId' in node2) ? node2.groupId : undefined;

  // 都没有父群组（都是顶层节点）
  if (!groupId1 && !groupId2) return true;

  // 只有一个有父群组
  if (!groupId1 || !groupId2) return false;

  // 都有父群组，比较是否相同
  return groupId1 === groupId2;
}

/**
 * 获取群组的所有直接子节点（不递归）
 * @param groupId 群组 ID
 * @param nodes 所有节点列表
 * @returns 直接子节点数组
 */
export function getDirectChildren(
  groupId: string,
  nodes: (Node | Group)[]
): (Node | Group)[] {
  return nodes.filter(n =>
    'groupId' in n && n.groupId === groupId
  );
}

/**
 * 获取群组的所有直接子群组
 * @param groupId 群组 ID
 * @param nodes 所有节点列表
 * @returns 直接子群组数组
 */
export function getDirectChildGroups(
  groupId: string,
  nodes: (Node | Group)[]
): Group[] {
  return nodes.filter(n =>
    n.type === BlockEnum.GROUP &&
    'groupId' in n &&
    n.groupId === groupId
  ) as Group[];
}

/**
 * 计算群组内的总节点数量（包括嵌套）
 * @param groupId 群组 ID
 * @param nodes 所有节点列表
 * @returns 总节点数量
 */
export function getTotalNestedNodeCount(
  groupId: string,
  nodes: (Node | Group)[]
): number {
  return getAllNestedNodeIds(groupId, nodes).length;
}

/**
 * 验证是否可以将节点添加到群组
 * @param targetNodeId 要添加的节点 ID
 * @param groupId 目标群组 ID
 * @param nodes 所有节点列表
 * @returns { valid: boolean, error?: string }
 */
export function validateAddToGroup(
  targetNodeId: string,
  groupId: string,
  nodes: (Node | Group)[]
): { valid: boolean; error?: string } {
  // 检查循环嵌套
  if (hasCircularNesting(groupId, targetNodeId, nodes)) {
    return {
      valid: false,
      error: '不能将群组添加到其子孙群组中，这会造成循环嵌套'
    };
  }

  // 检查嵌套深度
  if (exceedsMaxDepth(groupId, nodes)) {
    return {
      valid: false,
      error: `已达到最大嵌套深度 (${GraphConfig.nesting.maxDepth} 层)`
    };
  }

  return { valid: true };
}
