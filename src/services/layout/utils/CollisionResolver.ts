// src/services/layout/utils/CollisionResolver.ts
import { Node, Group } from '../../../types/graph/models';
import { GeometryUtils } from './GeometryUtils';
import { LAYOUT_CONFIG } from '../../../config/graph.config';

/**
 * 碰撞检测对
 */
interface CollisionPair {
  node1Index: number;
  node2Index: number;
}

/**
 * 碰撞解决工具类
 * 使用迭代式排斥力算法解决节点重叠问题
 */
export class CollisionResolver {
  private config: typeof LAYOUT_CONFIG.collision;

  constructor(config?: typeof LAYOUT_CONFIG.collision) {
    this.config = config || LAYOUT_CONFIG.collision;
  }

  /**
   * 解决节点之间的碰撞
   * 使用迭代式排斥力算法，直到无碰撞或达到最大迭代次数
   *
   * @param nodes 节点列表
   * @returns 解决碰撞后的节点列表
   */
  resolve(nodes: (Node | Group)[]): (Node | Group)[] {
    if (nodes.length <= 1) return nodes;

    let resolvedNodes = [...nodes];
    let hasCollisions = true;
    let iterations = 0;

    while (hasCollisions && iterations < this.config.maxIterations) {
      hasCollisions = false;
      const collisionPairs: CollisionPair[] = [];

      // 检测所有节点对之间的碰撞
      for (let i = 0; i < resolvedNodes.length; i++) {
        for (let j = i + 1; j < resolvedNodes.length; j++) {
          if (this.isColliding(resolvedNodes[i], resolvedNodes[j])) {
            collisionPairs.push({ node1Index: i, node2Index: j });
            hasCollisions = true;
          }
        }
      }

      // 如果有碰撞，应用排斥力分离节点
      if (collisionPairs.length > 0) {
        resolvedNodes = this.separateNodes(resolvedNodes, collisionPairs);
      }

      iterations++;
    }

    if (iterations >= this.config.maxIterations) {
      console.warn(
        `⚠️ 碰撞解决达到最大迭代次数 (${this.config.maxIterations})，` +
        `可能仍有未解决的碰撞`
      );
    }

    return resolvedNodes;
  }

  /**
   * 检测两个节点是否碰撞（重叠）
   */
  private isColliding(node1: Node | Group, node2: Node | Group): boolean {
    const rect1 = this.getNodeRect(node1);
    const rect2 = this.getNodeRect(node2);

    return GeometryUtils.isOverlapping(rect1, rect2);
  }

  /**
   * 将节点转换为矩形（用于碰撞检测）
   */
  private getNodeRect(node: Node | Group): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    const width = node.width || LAYOUT_CONFIG.nodeSize.defaultNode.width;
    const height = node.height || LAYOUT_CONFIG.nodeSize.defaultNode.height;

    // 矩形左上角坐标（节点位置是中心点）
    return {
      x: node.position.x - width / 2,
      y: node.position.y - height / 2,
      width,
      height
    };
  }

  /**
   * 应用排斥力分离碰撞的节点
   */
  private separateNodes(
    nodes: (Node | Group)[],
    collisionPairs: CollisionPair[]
  ): (Node | Group)[] {
    const result = [...nodes];

    for (const pair of collisionPairs) {
      const node1 = result[pair.node1Index];
      const node2 = result[pair.node2Index];

      const rect1 = this.getNodeRect(node1);
      const rect2 = this.getNodeRect(node2);

      // 计算最小平移向量（MTV）
      const mtv = GeometryUtils.getMTV(rect1, rect2);

      if (mtv) {
        // 应用排斥力，将两个节点向相反方向推开
        const repulsionForce = this.config.repulsionForce;

        result[pair.node1Index] = {
          ...result[pair.node1Index],
          position: {
            x: result[pair.node1Index].position.x + mtv.x * 0.5 * repulsionForce,
            y: result[pair.node1Index].position.y + mtv.y * 0.5 * repulsionForce
          }
        };

        result[pair.node2Index] = {
          ...result[pair.node2Index],
          position: {
            x: result[pair.node2Index].position.x - mtv.x * 0.5 * repulsionForce,
            y: result[pair.node2Index].position.y - mtv.y * 0.5 * repulsionForce
          }
        };
      }
    }

    return result;
  }

  /**
   * 计算碰撞数量（用于统计）
   *
   * @param nodes 节点列表
   * @returns 碰撞对的数量
   */
  countCollisions(nodes: (Node | Group)[]): number {
    let count = 0;

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (this.isColliding(nodes[i], nodes[j])) {
          count++;
        }
      }
    }

    return count;
  }

  /**
   * 检查是否存在碰撞
   *
   * @param nodes 节点列表
   * @returns true 如果存在至少一个碰撞
   */
  hasCollisions(nodes: (Node | Group)[]): boolean {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (this.isColliding(nodes[i], nodes[j])) {
          return true;
        }
      }
    }
    return false;
  }
}
