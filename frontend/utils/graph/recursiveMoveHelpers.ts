/**
 * 递归移动辅助函数
 * 处理多层嵌套群组移动时的位置更新
 */

import { Node, Group, BlockEnum } from '@/types/graph/models';
import { getAllDescendants } from './nestingHelpers';

/**
 * 计算并应用偏移量到所有后代节点
 * @param groupId 移动的群组ID
 * @param offset 位置偏移量
 * @param nodes 所有节点列表
 * @returns 更新后的节点列表
 */
export const applyOffsetToDescendants = (
  groupId: string,
  offset: { x: number; y: number },
  nodes: (Node | Group)[]
): (Node | Group)[] => {
  // 获取该群组的所有后代（包括所有嵌套层级的节点和群组，但不包括群组自己）
  const group = nodes.find(n => n.id === groupId);
  if (!group || group.type !== BlockEnum.GROUP) {
    return nodes;
  }

  // 使用 getAllDescendants 获取所有后代节点（包括嵌套的群组和节点）
  const allDescendants = getAllDescendants(groupId, nodes).filter(d => d.id !== groupId);
  const descendantIds = allDescendants.map(d => d.id);

  console.log(`📦 递归移动群组 ${groupId} 的所有后代，偏移量:`, offset);
  console.log(`  所有后代节点数量: ${descendantIds.length}`);

  // 更新所有后代节点的位置（包括嵌套群组）
  return nodes.map(node => {
    // 检查是否是后代节点
    if (descendantIds.includes(node.id)) {
      const updatedNode = {
        ...node,
        position: {
          x: node.position.x + offset.x,
          y: node.position.y + offset.y,
        },
        updatedAt: new Date(),
      };

      console.log(`  ↳ 更新后代节点 ${node.id} (${node.type}):`, {
        旧位置: node.position,
        新位置: updatedNode.position,
      });

      return updatedNode;
    }

    return node;
  });
};

/**
 * 递归收集所有需要移动的节点ID（包括所有嵌套层级）
 * @param groupId 群组ID
 * @param nodes 所有节点列表
 * @returns 所有需要移动的节点ID数组（不包括群组自己）
 */
export const collectAllDescendantIds = (
  groupId: string,
  nodes: (Node | Group)[]
): string[] => {
  const group = nodes.find(n => n.id === groupId);
  if (!group || group.type !== BlockEnum.GROUP) {
    return [];
  }

  const descendants = getAllDescendants(groupId, nodes);
  // 移除群组自己，只返回子节点
  return descendants.filter(d => d.id !== groupId).map(d => d.id);
};

/**
 * 获取节点的绝对位置（考虑所有祖先的位置）
 * @param nodeId 节点ID
 * @param nodes 所有节点列表
 * @returns 绝对位置
 */
export const getAbsolutePosition = (
  nodeId: string,
  nodes: (Node | Group)[]
): { x: number; y: number } => {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return { x: 0, y: 0 };

  // 如果节点没有父群组，直接返回其位置
  if (!('groupId' in node) || !node.groupId) {
    return { ...node.position };
  }

  // 递归获取父群组的绝对位置
  const parentAbsolutePos = getAbsolutePosition(node.groupId, nodes);

  // 节点的绝对位置 = 父群组绝对位置 + 节点相对位置
  return {
    x: parentAbsolutePos.x + node.position.x,
    y: parentAbsolutePos.y + node.position.y,
  };
};

/**
 * 验证移动后所有节点是否在各自父群组内
 * @param nodes 所有节点列表
 * @returns 验证结果
 */
export const validateAllNodesInBounds = (
  nodes: (Node | Group)[]
): { valid: boolean; violations: string[] } => {
  const violations: string[] = [];

  nodes.forEach(node => {
    if ('groupId' in node && node.groupId) {
      const parentGroup = nodes.find(
        n => n.id === node.groupId && n.type === BlockEnum.GROUP
      ) as Group | undefined;

      if (parentGroup) {
        const nodeRight = node.position.x + (node.width || 0);
        const nodeBottom = node.position.y + (node.height || 0);
        const groupRight = parentGroup.position.x + (parentGroup.width || 0);
        const groupBottom = parentGroup.position.y + (parentGroup.height || 0);

        if (
          node.position.x < parentGroup.position.x ||
          node.position.y < parentGroup.position.y ||
          nodeRight > groupRight ||
          nodeBottom > groupBottom
        ) {
          violations.push(
            `节点 ${node.id} 超出父群组 ${parentGroup.id} 边界`
          );
        }
      }
    }
  });

  return {
    valid: violations.length === 0,
    violations,
  };
};
