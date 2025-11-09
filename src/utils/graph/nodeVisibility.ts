/**
 * 节点可见性工具函数
 *
 * 处理节点的显示/隐藏逻辑，特别是：
 * - 容器折叠时递归隐藏所有后代节点
 * - 支持容器嵌套
 */

import { BaseNode } from '@/types/graph/models';

/**
 * 递归检查节点是否应该显示
 *
 * 规则：
 * 1. 根节点（无父节点）总是显示
 * 2. 如果节点有父节点，需要检查所有祖先节点：
 *    - 只有当父节点是 Container 模式时，子节点才显示
 *    - 如果父节点是 Note 模式，子节点隐藏（Note 不能显示子节点）
 *    - 递归检查所有祖先节点
 *
 * @param node 要检查的节点
 * @param allNodes 所有节点的列表
 * @returns true 表示应该显示，false 表示应该隐藏
 */
export function shouldNodeBeVisible(node: BaseNode, allNodes: BaseNode[]): boolean {
  // 根节点总是显示
  if (!node.parentId) {
    return true;
  }

  // 查找父节点
  const parent = allNodes.find(n => n.id === node.parentId);

  // 如果找不到父节点（数据异常），为了安全起见显示节点
  if (!parent) {
    console.warn(`⚠️ 节点 ${node.id} 的父节点 ${node.parentId} 不存在`);
    return true;
  }

  // 🔥 核心逻辑：只有当父节点是 Container 模式时，子节点才显示
  if (parent.viewMode !== 'container') {
    // 父节点不是容器（是 Note），子节点隐藏
    return false;
  }

  // 父节点是容器，继续递归检查父节点的祖先
  return shouldNodeBeVisible(parent, allNodes);
}

/**
 * 批量过滤应该显示的节点
 *
 * @param nodes 所有节点列表
 * @returns 过滤后应该显示的节点列表
 */
export function filterVisibleNodes(nodes: BaseNode[]): BaseNode[] {
  return nodes.filter(node => shouldNodeBeVisible(node, nodes));
}

/**
 * 获取节点的所有后代节点（包括嵌套）
 *
 * @param nodeId 父节点ID
 * @param allNodes 所有节点列表
 * @returns 所有后代节点ID的数组
 */
export function getAllDescendantIds(nodeId: string, allNodes: BaseNode[]): string[] {
  const node = allNodes.find(n => n.id === nodeId);
  if (!node || node.childrenIds.length === 0) {
    return [];
  }

  const descendants: string[] = [];

  // 遍历所有直接子节点
  for (const childId of node.childrenIds) {
    descendants.push(childId);

    // 递归获取子节点的后代
    const childDescendants = getAllDescendantIds(childId, allNodes);
    descendants.push(...childDescendants);
  }

  return descendants;
}

/**
 * 检查节点是否有任何可见的子节点
 *
 * @param node 要检查的节点
 * @param allNodes 所有节点列表
 * @returns true 表示有可见的子节点
 */
export function hasVisibleChildren(node: BaseNode, allNodes: BaseNode[]): boolean {
  if (node.childrenIds.length === 0) {
    return false;
  }

  // 如果节点是折叠的容器，子节点不可见
  if (node.viewMode === 'container' && !node.expanded) {
    return false;
  }

  // 检查是否有任何子节点可见
  return node.childrenIds.some(childId => {
    const child = allNodes.find(n => n.id === childId);
    return child && shouldNodeBeVisible(child, allNodes);
  });
}

/**
 * 获取节点的可见子节点列表
 *
 * @param node 父节点
 * @param allNodes 所有节点列表
 * @returns 可见的子节点列表
 */
export function getVisibleChildren(node: BaseNode, allNodes: BaseNode[]): BaseNode[] {
  if (node.childrenIds.length === 0) {
    return [];
  }

  return node.childrenIds
    .map(childId => allNodes.find(n => n.id === childId))
    .filter((child): child is BaseNode => {
      return child !== undefined && shouldNodeBeVisible(child, allNodes);
    });
}
