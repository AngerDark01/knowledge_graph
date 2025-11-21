// src/services/layout/utils/GroupSizeAdjuster.ts
import { Node, Group, BlockEnum } from '../../../types/graph/models';
import { LAYOUT_CONFIG } from '../../../config/graph.config';

/**
 * 群组大小调整工具类
 * 根据子节点的实际占用空间自动调整父群组的尺寸
 */
export class GroupSizeAdjuster {
  /**
   * 调整单个群组的大小以适应其所有子节点
   *
   * @param groupId 群组ID
   * @param allNodes 所有节点列表
   * @returns 更新后的节点列表（群组尺寸已调整）
   */
  static adjustSingleGroup(
    groupId: string,
    allNodes: (Node | Group)[]
  ): (Node | Group)[] {
    // 1. 找到目标群组
    const group = allNodes.find(
      n => n.id === groupId && n.type === BlockEnum.GROUP
    ) as Group | undefined;

    if (!group) {
      console.warn(`群组 ${groupId} 不存在，跳过大小调整`);
      return allNodes;
    }

    // 2. 找到该群组的所有直接子节点
    const children = allNodes.filter(
      n => 'groupId' in n && (n as Node).groupId === groupId
    );

    if (children.length === 0) {
      console.log(`群组 ${groupId} 没有子节点，跳过大小调整`);
      return allNodes;
    }

    // 3. 计算子节点相对于群组的边界
    const bounds = this.calculateChildrenRelativeBounds(children, group);

    // 4. 计算需要的内容区域大小
    const contentWidth = bounds.maxX - bounds.minX;
    const contentHeight = bounds.maxY - bounds.minY;

    // 5. 计算总的群组大小（内容 + padding + 额外边距）
    const padding = LAYOUT_CONFIG.group;
    const extraMargin = 30; // 额外边距，确保有足够空间

    const requiredWidth =
      contentWidth + padding.paddingLeft + padding.paddingRight + extraMargin;
    const requiredHeight =
      contentHeight + padding.paddingTop + padding.paddingBottom + extraMargin;

    // 6. 应用最小尺寸限制
    const minWidth = LAYOUT_CONFIG.nodeSize.groupNode.width;
    const minHeight = LAYOUT_CONFIG.nodeSize.groupNode.height;

    const currentWidth = group.width || minWidth;
    const currentHeight = group.height || minHeight;

    // 7. 只扩大不缩小（避免压缩已有内容）
    const newWidth = Math.max(currentWidth, requiredWidth, minWidth);
    const newHeight = Math.max(currentHeight, requiredHeight, minHeight);

    // 8. 如果尺寸没有变化，直接返回
    if (newWidth === currentWidth && newHeight === currentHeight) {
      return allNodes;
    }

    console.log(
      `📏 调整群组 ${groupId.substring(0, 8)}... 尺寸: ` +
      `${Math.round(currentWidth)}x${Math.round(currentHeight)} -> ` +
      `${Math.round(newWidth)}x${Math.round(newHeight)} ` +
      `(内容: ${Math.round(contentWidth)}x${Math.round(contentHeight)})`
    );

    // 9. 更新群组节点
    return allNodes.map(node => {
      if (node.id === groupId) {
        return {
          ...node,
          width: newWidth,
          height: newHeight,
          boundary: {
            minX: node.position.x,
            minY: node.position.y,
            maxX: node.position.x + newWidth,
            maxY: node.position.y + newHeight
          }
        } as Group;
      }
      return node;
    });
  }

  /**
   * 批量调整多个群组的大小（按深度从深到浅）
   *
   * @param groupIds 群组ID列表（应按深度从深到浅排序）
   * @param allNodes 所有节点列表
   * @returns 更新后的节点列表
   */
  static adjustMultipleGroups(
    groupIds: string[],
    allNodes: (Node | Group)[]
  ): (Node | Group)[] {
    let workingNodes = [...allNodes];

    for (const groupId of groupIds) {
      workingNodes = this.adjustSingleGroup(groupId, workingNodes);
    }

    return workingNodes;
  }

  /**
   * 计算子节点相对于父群组的边界
   * 返回子节点在群组内的相对坐标范围
   *
   * @param children 子节点列表
   * @param parentGroup 父群组
   * @returns 相对边界 {minX, minY, maxX, maxY}
   */
  static calculateChildrenRelativeBounds(
    children: (Node | Group)[],
    parentGroup: Group
  ): { minX: number; minY: number; maxX: number; maxY: number } {
    if (children.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const child of children) {
      const nodeWidth =
        child.width || LAYOUT_CONFIG.nodeSize.defaultNode.width;
      const nodeHeight =
        child.height || LAYOUT_CONFIG.nodeSize.defaultNode.height;

      // 计算子节点相对于父群组左上角的相对位置
      const relativeX = child.position.x - parentGroup.position.x;
      const relativeY = child.position.y - parentGroup.position.y;

      // 计算节点边界（相对坐标）
      const nodeMinX = relativeX - nodeWidth / 2;
      const nodeMinY = relativeY - nodeHeight / 2;
      const nodeMaxX = relativeX + nodeWidth / 2;
      const nodeMaxY = relativeY + nodeHeight / 2;

      minX = Math.min(minX, nodeMinX);
      minY = Math.min(minY, nodeMinY);
      maxX = Math.max(maxX, nodeMaxX);
      maxY = Math.max(maxY, nodeMaxY);
    }

    return { minX, minY, maxX, maxY };
  }

  /**
   * 检查群组是否需要调整大小
   *
   * @param groupId 群组ID
   * @param allNodes 所有节点列表
   * @returns true 如果需要调整
   */
  static needsAdjustment(
    groupId: string,
    allNodes: (Node | Group)[]
  ): boolean {
    const group = allNodes.find(
      n => n.id === groupId && n.type === BlockEnum.GROUP
    ) as Group | undefined;

    if (!group) return false;

    const children = allNodes.filter(
      n => 'groupId' in n && (n as Node).groupId === groupId
    );

    if (children.length === 0) return false;

    const bounds = this.calculateChildrenRelativeBounds(children, group);
    const contentWidth = bounds.maxX - bounds.minX;
    const contentHeight = bounds.maxY - bounds.minY;

    const padding = LAYOUT_CONFIG.group;
    const extraMargin = 30;

    const requiredWidth =
      contentWidth + padding.paddingLeft + padding.paddingRight + extraMargin;
    const requiredHeight =
      contentHeight + padding.paddingTop + padding.paddingBottom + extraMargin;

    const currentWidth = group.width || LAYOUT_CONFIG.nodeSize.groupNode.width;
    const currentHeight = group.height || LAYOUT_CONFIG.nodeSize.groupNode.height;

    return requiredWidth > currentWidth || requiredHeight > currentHeight;
  }
}
