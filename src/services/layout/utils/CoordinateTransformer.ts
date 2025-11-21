// src/services/layout/utils/CoordinateTransformer.ts
import { Node, Group } from '../../../types/graph/models';
import { LAYOUT_CONFIG } from '../../../config/graph.config';

/**
 * 坐标转换工具类
 * 提供各种坐标系统之间的转换功能
 */
export class CoordinateTransformer {
  /**
   * 将相对坐标转换为绝对坐标
   * @param nodes 包含相对坐标的节点列表
   * @param anchor 锚点（绝对坐标）
   * @returns 包含绝对坐标的节点列表
   */
  static toAbsolute(
    nodes: (Node | Group)[],
    anchor: { x: number; y: number }
  ): (Node | Group)[] {
    return nodes.map(node => ({
      ...node,
      position: {
        x: anchor.x + node.position.x,
        y: anchor.y + node.position.y
      }
    }));
  }

  /**
   * 将节点转换到第四象限（确保所有坐标为正数）
   * 通过计算最小边界并平移，使所有节点位于第四象限
   *
   * @param nodes 节点列表
   * @returns 转换后的节点列表（所有坐标 >= 0）
   */
  static toQuadrantFour(nodes: (Node | Group)[]): (Node | Group)[] {
    if (nodes.length === 0) return nodes;

    // 计算边界框的最小值
    const bounds = this.calculateBounds(nodes);

    // 计算需要的偏移量（如果已经在第四象限，偏移为0）
    const offset = {
      x: bounds.minX < 0 ? -bounds.minX : 0,
      y: bounds.minY < 0 ? -bounds.minY : 0
    };

    // 应用偏移
    return nodes.map(node => ({
      ...node,
      position: {
        x: node.position.x + offset.x,
        y: node.position.y + offset.y
      }
    }));
  }

  /**
   * 计算节点集合的边界框
   * @param nodes 节点列表
   * @returns 边界框 {minX, minY, maxX, maxY}
   */
  static calculateBounds(nodes: (Node | Group)[]): {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  } {
    if (nodes.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    nodes.forEach(node => {
      const nodeWidth = node.width || LAYOUT_CONFIG.nodeSize.defaultNode.width;
      const nodeHeight = node.height || LAYOUT_CONFIG.nodeSize.defaultNode.height;

      // 节点的边界（考虑节点中心点）
      const nodeMinX = node.position.x - nodeWidth / 2;
      const nodeMinY = node.position.y - nodeHeight / 2;
      const nodeMaxX = node.position.x + nodeWidth / 2;
      const nodeMaxY = node.position.y + nodeHeight / 2;

      minX = Math.min(minX, nodeMinX);
      minY = Math.min(minY, nodeMinY);
      maxX = Math.max(maxX, nodeMaxX);
      maxY = Math.max(maxY, nodeMaxY);
    });

    return { minX, minY, maxX, maxY };
  }

  /**
   * 计算群组的锚点（内容区域左上角）
   * @param group 群组节点
   * @returns 锚点坐标（群组左上角 + padding）
   */
  static calculateGroupAnchor(group: Group): { x: number; y: number } {
    const padding = LAYOUT_CONFIG.group;
    return {
      x: group.position.x + padding.paddingLeft,
      y: group.position.y + padding.paddingTop
    };
  }

  /**
   * 批量转换：从相对坐标到绝对坐标（群组场景）
   * 结合了第四象限转换和锚点转换
   *
   * @param nodes 相对坐标的节点列表（可能有负坐标）
   * @param parentGroup 父群组
   * @returns 绝对坐标的节点列表
   */
  static relativeToAbsoluteForGroup(
    nodes: (Node | Group)[],
    parentGroup: Group
  ): (Node | Group)[] {
    // 1. 确保在第四象限
    const quadrantNodes = this.toQuadrantFour(nodes);

    // 2. 计算锚点
    const anchor = this.calculateGroupAnchor(parentGroup);

    // 3. 转换为绝对坐标
    return this.toAbsolute(quadrantNodes, anchor);
  }
}
