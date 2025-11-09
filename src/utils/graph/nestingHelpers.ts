/**
 * 群组嵌套检测和管理工具函数
 * 用于处理多层群组嵌套的各种场景
 */

import { Node, Group, BlockEnum } from '@/types/graph/models';
import { MAX_DEPTH, ENABLE_CIRCULAR_CHECK } from '@/config/graph.config';

/**
 * 获取节点的嵌套深度
 * @param nodeId 节点ID
 * @param nodes 所有节点列表
 * @returns 嵌套深度（0 = 顶层，1 = 一级嵌套，以此类推）
 */
export const getNestingDepth = (
  nodeId: string,
  nodes: (Node | Group)[]
): number => {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return 0;

  // 如果节点没有父群组，它在顶层
  if (!('groupId' in node) || !node.groupId) {
    return 0;
  }

  // 递归向上查找，直到找到顶层
  let depth = 0;
  let currentGroupId: string | undefined = node.groupId;

  while (currentGroupId && depth < MAX_DEPTH + 1) {
    const parentGroup = nodes.find(
      n => n.id === currentGroupId && n.type === BlockEnum.GROUP
    ) as Group | undefined;

    if (!parentGroup) break;

    depth++;
    currentGroupId = parentGroup.groupId;
  }

  return depth;
};

/**
 * 检测是否会形成循环嵌套
 * @param nodeId 要移动的节点ID
 * @param targetGroupId 目标群组ID
 * @param nodes 所有节点列表
 * @returns true 表示会形成循环，false 表示安全
 */
export const hasCircularNesting = (
  nodeId: string,
  targetGroupId: string,
  nodes: (Node | Group)[]
): boolean => {
  if (!ENABLE_CIRCULAR_CHECK) return false;

  // 如果节点不是群组，不会形成循环
  const node = nodes.find(n => n.id === nodeId);
  if (!node || node.type !== BlockEnum.GROUP) return false;

  // 检查目标群组是否是当前节点的后代
  const descendants = getAllNestedNodeIds(nodeId, nodes);
  return descendants.includes(targetGroupId);
};

/**
 * 递归获取群组内所有节点的ID（包括所有嵌套层级）
 * @param groupId 群组ID
 * @param nodes 所有节点列表
 * @returns 所有子节点ID数组
 */
export const getAllNestedNodeIds = (
  groupId: string,
  nodes: (Node | Group)[]
): string[] => {
  const group = nodes.find(
    n => n.id === groupId && n.type === BlockEnum.GROUP
  ) as Group | undefined;

  if (!group || !group.nodeIds || group.nodeIds.length === 0) {
    return [];
  }

  const result: string[] = [...group.nodeIds];

  // 对每个子节点，如果它也是群组，递归获取其子节点
  group.nodeIds.forEach(childId => {
    const child = nodes.find(n => n.id === childId);
    if (child && child.type === BlockEnum.GROUP) {
      const nestedIds = getAllNestedNodeIds(childId, nodes);
      result.push(...nestedIds);
    }
  });

  return result;
};

/**
 * 获取节点的祖先路径（从顶层到当前节点）
 * @param nodeId 节点ID
 * @param nodes 所有节点列表
 * @returns 祖先ID数组，从顶层到当前节点的父节点
 */
export const getAncestorPath = (
  nodeId: string,
  nodes: (Node | Group)[]
): string[] => {
  const node = nodes.find(n => n.id === nodeId);
  if (!node || !('groupId' in node) || !node.groupId) {
    return [];
  }

  const path: string[] = [];
  let currentGroupId: string | undefined = node.groupId;

  while (currentGroupId) {
    path.unshift(currentGroupId); // 添加到数组开头
    const parentGroup = nodes.find(
      n => n.id === currentGroupId && n.type === BlockEnum.GROUP
    ) as Group | undefined;

    if (!parentGroup) break;
    currentGroupId = parentGroup.groupId;
  }

  return path;
};

/**
 * 获取节点的所有后代（包括节点自己和所有嵌套的子节点）
 * @param nodeId 节点ID
 * @param nodes 所有节点列表
 * @returns 所有后代节点对象数组（包括自己）
 */
export const getAllDescendants = (
  nodeId: string,
  nodes: (Node | Group)[]
): (Node | Group)[] => {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return [];

  const descendants: (Node | Group)[] = [node];

  // 如果是群组，递归获取所有子节点
  if (node.type === BlockEnum.GROUP) {
    const group = node as Group;
    if (group.nodeIds && group.nodeIds.length > 0) {
      group.nodeIds.forEach(childId => {
        const childDescendants = getAllDescendants(childId, nodes);
        descendants.push(...childDescendants);
      });
    }
  }

  return descendants;
};

/**
 * 验证嵌套深度是否合法
 * @param nodeId 节点ID
 * @param targetGroupId 目标群组ID（可选）
 * @param nodes 所有节点列表
 * @returns { valid: boolean, currentDepth: number, maxDepth: number }
 */
export const validateNestingDepth = (
  nodeId: string,
  targetGroupId: string | undefined,
  nodes: (Node | Group)[]
): { valid: boolean; currentDepth: number; maxDepth: number; message?: string } => {
  // 如果没有目标群组，深度为 0（顶层）
  if (!targetGroupId) {
    return { valid: true, currentDepth: 0, maxDepth: MAX_DEPTH };
  }

  // 计算目标群组的深度
  const targetGroupDepth = getNestingDepth(targetGroupId, nodes);

  // 如果要添加的是群组，还需要考虑它自己的嵌套深度
  const node = nodes.find(n => n.id === nodeId);
  if (node && node.type === BlockEnum.GROUP) {
    // 计算这个群组的最大内部深度
    const maxInternalDepth = getMaxInternalDepth(nodeId, nodes);
    const totalDepth = targetGroupDepth + 1 + maxInternalDepth;

    if (totalDepth > MAX_DEPTH) {
      return {
        valid: false,
        currentDepth: totalDepth,
        maxDepth: MAX_DEPTH,
        message: `嵌套深度 ${totalDepth} 超过最大限制 ${MAX_DEPTH}`
      };
    }
  } else {
    // 普通节点
    const totalDepth = targetGroupDepth + 1;
    if (totalDepth > MAX_DEPTH) {
      return {
        valid: false,
        currentDepth: totalDepth,
        maxDepth: MAX_DEPTH,
        message: `嵌套深度 ${totalDepth} 超过最大限制 ${MAX_DEPTH}`
      };
    }
  }

  const finalDepth = targetGroupDepth + 1;
  return { valid: true, currentDepth: finalDepth, maxDepth: MAX_DEPTH };
};

/**
 * 获取群组的最大内部深度（群组内部的嵌套层数）
 * @param groupId 群组ID
 * @param nodes 所有节点列表
 * @returns 最大内部深度
 */
export const getMaxInternalDepth = (
  groupId: string,
  nodes: (Node | Group)[]
): number => {
  const group = nodes.find(
    n => n.id === groupId && n.type === BlockEnum.GROUP
  ) as Group | undefined;

  if (!group || !group.nodeIds || group.nodeIds.length === 0) {
    return 0;
  }

  let maxDepth = 0;

  group.nodeIds.forEach(childId => {
    const child = nodes.find(n => n.id === childId);
    if (child && child.type === BlockEnum.GROUP) {
      const childDepth = 1 + getMaxInternalDepth(childId, nodes);
      maxDepth = Math.max(maxDepth, childDepth);
    }
  });

  return maxDepth;
};

/**
 * 获取两个节点的最近公共祖先群组
 * @param nodeId1 节点1 ID
 * @param nodeId2 节点2 ID
 * @param nodes 所有节点列表
 * @returns 最近公共祖先群组ID，如果没有则返回 undefined
 */
export const getLowestCommonAncestor = (
  nodeId1: string,
  nodeId2: string,
  nodes: (Node | Group)[]
): string | undefined => {
  const ancestors1 = getAncestorPath(nodeId1, nodes);
  const ancestors2 = getAncestorPath(nodeId2, nodes);

  // 从顶层向下查找最后一个公共祖先
  let commonAncestor: string | undefined;
  const minLength = Math.min(ancestors1.length, ancestors2.length);

  for (let i = 0; i < minLength; i++) {
    if (ancestors1[i] === ancestors2[i]) {
      commonAncestor = ancestors1[i];
    } else {
      break;
    }
  }

  return commonAncestor;
};

/**
 * 判断节点1是否是节点2的祖先
 * @param ancestorId 潜在祖先节点ID
 * @param descendantId 潜在后代节点ID
 * @param nodes 所有节点列表
 * @returns true 表示是祖先关系
 */
export const isAncestor = (
  ancestorId: string,
  descendantId: string,
  nodes: (Node | Group)[]
): boolean => {
  const ancestorPath = getAncestorPath(descendantId, nodes);
  return ancestorPath.includes(ancestorId);
};
