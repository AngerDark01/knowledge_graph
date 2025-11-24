import { Node, Group, BlockEnum } from '../../../types/graph/models';

/**
 * 嵌套节点位置更新工具类
 * 提供通用方法来根据父节点位置变化更新子节点的绝对位置
 */
export class NestedNodePositionUpdater {
  /**
   * 根据父节点的新位置更新嵌套节点的相对位置
   * 在布局算法中，当父节点位置发生变化时，需要保持嵌套节点相对于父节点的相对位置不变
   * 支持多层嵌套结构（Group嵌套Group，再嵌套Node）
   *
   * @param originalNodes 原始节点列表
   * @param layoutedTopLevelNodes 布局后的顶层节点（父节点）
   * @returns 更新后的所有节点（包括嵌套节点）
   */
  static updateNestedNodePositionsForCanvasLayout(
    originalNodes: (Node | Group)[],
    layoutedTopLevelNodes: (Node | Group)[]
  ): (Node | Group)[] {
    // 创建节点映射以便快速查找
    const originalNodeMap = new Map(originalNodes.map(node => [node.id, node]));
    const layoutedNodeMap = new Map(layoutedTopLevelNodes.map(node => [node.id, node]));

    // 顶层节点使用布局后的位置
    const resultNodes: (Node | Group)[] = [...layoutedTopLevelNodes];

    // 找出嵌套节点（属于某个群组的节点）
    const nestedNodes = originalNodes.filter(
      node => 'groupId' in node && node.groupId
    );

    // 对于每个嵌套节点，计算其新的绝对位置
    for (const nestedNode of nestedNodes) {
      const absolutePosition = this.calculateAbsolutePosition(
        nestedNode,
        originalNodeMap,
        layoutedNodeMap
      );

      resultNodes.push({
        ...nestedNode,
        position: absolutePosition
      });
    }

    return resultNodes;
  }

  /**
   * 递归计算嵌套节点的绝对位置
   * 这个方法会查找节点的所有祖先群组，计算其相对于最顶层父群组的最终位置
   */
  private static calculateAbsolutePosition(
    node: Node | Group,
    originalNodeMap: Map<string, Node | Group>,
    layoutedNodeMap: Map<string, Node | Group>
  ): { x: number; y: number } {
    // 如果节点没有父群组，返回其在layoutedNodes中的位置
    if (!('groupId' in node) || !node.groupId) {
      const layoutedNode = layoutedNodeMap.get(node.id);
      return layoutedNode ? layoutedNode.position : node.position;
    }

    // 优先使用layoutedNodeMap中的父群组（可能已被布局算法移动）
    const layoutedParentGroup = layoutedNodeMap.get(node.groupId);
    const originalParentGroup = originalNodeMap.get(node.groupId) as Group;

    if (!originalParentGroup) {
      // 如果找不到原始父群组，返回原位置
      return node.position;
    }

    // 计算节点相对于原始父群组的相对位置
    const relativeX = node.position.x - originalParentGroup.position.x;
    const relativeY = node.position.y - originalParentGroup.position.y;

    // 如果父群组在layoutedNodeMap中（已被处理），直接使用其新位置
    if (layoutedParentGroup) {
      return {
        x: layoutedParentGroup.position.x + relativeX,
        y: layoutedParentGroup.position.y + relativeY
      };
    }

    // 否则递归计算父群组的新绝对位置（用于嵌套更深的情况）
    const parentAbsolutePosition = this.calculateAbsolutePosition(
      originalParentGroup,
      originalNodeMap,
      layoutedNodeMap
    );

    return {
      x: parentAbsolutePosition.x + relativeX,
      y: parentAbsolutePosition.y + relativeY
    };
  }

  /**
   * 根据父群组布局更新其后代节点的位置
   * 当直接子节点布局完成后，需要相应更新其后代节点的位置（保持相对位置不变）
   *
   * @param allNodes 所有节点列表
   * @param originalChildren 原始直接子节点列表
   * @param layoutedChildren 布局后的直接子节点列表
   * @returns 所有需要更新位置的节点（包括直接子节点和嵌套子节点）
   */
  static updateNestedNodePositionsForGroupLayout(
    allNodes: (Node | Group)[],
    originalChildren: (Node | Group)[],
    layoutedChildren: (Node | Group)[]
  ): (Node | Group)[] {
    const result: (Node | Group)[] = [...layoutedChildren];

    // 创建原始子节点位置映射
    const originalPositionMap = new Map(
      originalChildren.map(n => [n.id, n.position])
    );

    // 创建布局后子节点位置映射
    const layoutedPositionMap = new Map(
      layoutedChildren.map(n => [n.id, n.position])
    );

    // 对于每个直接子节点，如果它是群组，则递归更新它的所有后代节点
    for (const layoutedChild of layoutedChildren) {
      if (layoutedChild.type === BlockEnum.GROUP) {
        const originalPosition = originalPositionMap.get(layoutedChild.id);
        const newPosition = layoutedPositionMap.get(layoutedChild.id);

        if (originalPosition && newPosition) {
          // 计算偏移量
          const offsetX = newPosition.x - originalPosition.x;
          const offsetY = newPosition.y - originalPosition.y;

          // 如果有偏移，递归更新所有后代节点
          if (offsetX !== 0 || offsetY !== 0) {
            const descendants = this.getAllDescendants(layoutedChild.id, allNodes);

            for (const descendant of descendants) {
              const updatedDescendant = {
                ...descendant,
                position: {
                  x: descendant.position.x + offsetX,
                  y: descendant.position.y + offsetY
                }
              };
              result.push(updatedDescendant);
            }
          }
        }
      }
    }

    return result;
  }

  /**
   * 获取群组的所有后代节点（递归）
   *
   * @param groupId 群组ID
   * @param allNodes 所有节点列表
   * @returns 所有后代节点列表
   */
  private static getAllDescendants(
    groupId: string,
    allNodes: (Node | Group)[]
  ): (Node | Group)[] {
    const descendants: (Node | Group)[] = [];

    // 获取直接子节点
    const directChildren = allNodes.filter(
      n => 'groupId' in n && (n as Node).groupId === groupId
    );

    for (const child of directChildren) {
      descendants.push(child);

      // 如果子节点也是群组，递归获取其后代
      if (child.type === BlockEnum.GROUP) {
        const childDescendants = this.getAllDescendants(child.id, allNodes);
        descendants.push(...childDescendants);
      }
    }

    return descendants;
  }
}