// src/services/layout/utils/GeometryUtils.ts
import { Node, Group } from '../../../types/graph/models';

export class GeometryUtils {
  /**
   * 计算两点之间的欧几里得距离
   */
  static distance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  /**
   * 判断两个矩形是否重叠（AABB碰撞检测）
   */
  static isOverlapping(rect1: { x: number; y: number; width: number; height: number },
                       rect2: { x: number; y: number; width: number; height: number }): boolean {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }

  /**
   * 计算矩形的中心点
   */
  static getCenter(rect: { x: number; y: number; width: number; height: number }): { x: number; y: number } {
    return {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2
    };
  }

  /**
   * 获取节点的边界
   */
  static getBounds(node: Node | Group): { minX: number; minY: number; maxX: number; maxY: number } {
    const x = node.position.x;
    const y = node.position.y;
    const width = node.width || 350;  // 默认宽度
    const height = node.height || 280; // 默认高度

    return {
      minX: x,
      minY: y,
      maxX: x + width,
      maxY: y + height
    };
  }

  /**
   * 计算包围所有节点的边界框
   */
  static getEnclosingBounds(nodes: (Node | Group)[]): { minX: number; minY: number; maxX: number; maxY: number } {
    if (nodes.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const node of nodes) {
      const bounds = this.getBounds(node);
      minX = Math.min(minX, bounds.minX);
      minY = Math.min(minY, bounds.minY);
      maxX = Math.max(maxX, bounds.maxX);
      maxY = Math.max(maxY, bounds.maxY);
    }

    return { minX, minY, maxX, maxY };
  }

  /**
   * 计算两个矩形的最小平移向量（MTV）
   */
  static getMTV(rect1: { x: number; y: number; width: number; height: number },
                rect2: { x: number; y: number; width: number; height: number }): { x: number; y: number } | null {
    const overlapX = Math.min(
      rect1.x + rect1.width - rect2.x,
      rect2.x + rect2.width - rect1.x
    );

    const overlapY = Math.min(
      rect1.y + rect1.height - rect2.y,
      rect2.y + rect2.height - rect1.y
    );

    if (overlapX <= 0 || overlapY <= 0) {
      return null; // 无重叠
    }

    // 返回最小平移向量
    if (overlapX < overlapY) {
      const direction = rect1.x < rect2.x ? -1 : 1;
      return { x: overlapX * direction, y: 0 };
    } else {
      const direction = rect1.y < rect2.y ? -1 : 1;
      return { x: 0, y: overlapY * direction };
    }
  }
}