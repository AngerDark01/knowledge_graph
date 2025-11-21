// src/services/layout/strategies/GroupLayoutStrategy.ts
import { Node, Group, Edge, BlockEnum } from '../../../types/graph/models';
import { ILayoutStrategy, LayoutResult, LayoutOptions } from '../types/layoutTypes';
import { LAYOUT_CONFIG } from '../../../config/graph.config';

// 算法层
import { GridAlgorithm } from '../algorithms/GridAlgorithm';
import { ILayoutAlgorithm } from '../algorithms/ILayoutAlgorithm';

// 工具层
import { CoordinateTransformer } from '../utils/CoordinateTransformer';
import { GroupSizeAdjuster } from '../utils/GroupSizeAdjuster';
import { CollisionResolver } from '../utils/CollisionResolver';

/**
 * 群组内布局策略
 *
 * 职责：
 * - 对指定群组的直接子节点进行布局
 * - 使用固定锚点（群组左上角 + padding）
 * - 自动调整群组大小以适应子节点
 *
 * 流程：
 * 1. 筛选目标群组的直接子节点（去重）
 * 2. 使用算法计算相对布局（从左上角开始）
 * 3. 转换为绝对坐标（基于群组锚点）
 * 4. 碰撞检测与解决
 * 5. 自适应调整群组大小
 * 6. 返回布局结果
 */
export class GroupLayoutStrategy implements ILayoutStrategy {
  readonly name = 'Group Layout';
  readonly id = 'group-layout';

  private algorithm: ILayoutAlgorithm;
  private collisionResolver: CollisionResolver;

  constructor(
    algorithm?: ILayoutAlgorithm,
    collisionResolver?: CollisionResolver
  ) {
    // 默认使用 GridAlgorithm（从左上角开始）
    this.algorithm = algorithm || new GridAlgorithm();
    this.collisionResolver = collisionResolver || new CollisionResolver();
  }

  /**
   * 应用群组内布局
   */
  async applyLayout(
    nodes: (Node | Group)[],
    edges: Edge[],
    options?: LayoutOptions
  ): Promise<LayoutResult> {
    const startTime = performance.now();

    try {
      const { targetGroupId } = options || {};

      if (!targetGroupId) {
        throw new Error('GroupLayoutStrategy requires targetGroupId in options');
      }

      // 1. 获取目标群组
      const parentGroup = this.findGroup(nodes, targetGroupId);
      if (!parentGroup) {
        throw new Error(`Target group ${targetGroupId} not found`);
      }

      // 2. 获取直接子节点（去重）
      const children = this.getDirectChildren(nodes, targetGroupId);

      if (children.length === 0) {
        console.warn(`群组 ${targetGroupId} 没有子节点，跳过布局`);
        return this.buildEmptyResult(startTime);
      }

      console.log(`📐 GroupLayoutStrategy: 布局群组 ${targetGroupId.substring(0, 8)}... 的 ${children.length} 个子节点`);

      // 3. 使用算法计算相对布局（从 (0,0) 开始）
      const relativeLayout = this.algorithm.calculate(children, {
        horizontalSpacing: options?.gridSpacing,
        verticalSpacing: options?.gridSpacing
      });

      // 4. 转换为绝对坐标
      const absoluteLayout = CoordinateTransformer.relativeToAbsoluteForGroup(
        relativeLayout,
        parentGroup
      );

      console.log(`  └─ 第一个节点位置: (${Math.round(absoluteLayout[0].position.x)}, ${Math.round(absoluteLayout[0].position.y)})`);

      // 5. 碰撞检测与解决
      const resolvedLayout = this.collisionResolver.resolve(absoluteLayout);
      const collisionCount = this.collisionResolver.countCollisions(absoluteLayout);

      if (collisionCount > 0) {
        console.log(`  └─ 解决了 ${collisionCount} 个碰撞`);
      }

      // 6. 自适应调整群组大小
      const adjustedNodes = GroupSizeAdjuster.adjustSingleGroup(
        targetGroupId,
        [...nodes] // 传入所有节点的副本
      );

      // 7. 合并结果：更新子节点位置和群组尺寸
      const finalNodes = this.mergeResults(nodes, resolvedLayout, adjustedNodes, targetGroupId);

      // 8. 构建返回结果
      const endTime = performance.now();

      const nodePositions = new Map<string, { x: number; y: number }>();
      for (const node of resolvedLayout) {
        nodePositions.set(node.id, node.position);
      }

      // 添加群组尺寸信息
      const updatedGroup = finalNodes.find(n => n.id === targetGroupId) as Group;
      if (updatedGroup) {
        const groupPos = nodePositions.get(targetGroupId);
        if (groupPos) {
          (groupPos as any).width = updatedGroup.width;
          (groupPos as any).height = updatedGroup.height;
          (groupPos as any).boundary = updatedGroup.boundary;
        } else {
          // 如果群组位置不在 Map 中，添加它
          nodePositions.set(targetGroupId, {
            x: updatedGroup.position.x,
            y: updatedGroup.position.y,
            ...(updatedGroup.width && { width: updatedGroup.width }),
            ...(updatedGroup.height && { height: updatedGroup.height }),
            ...(updatedGroup.boundary && { boundary: updatedGroup.boundary })
          } as any);
        }
      }

      console.log(`✅ 群组布局完成，耗时 ${(endTime - startTime).toFixed(0)}ms`);

      return {
        success: true,
        nodes: nodePositions,
        edges: new Map(), // 群组布局不处理边优化
        errors: [],
        stats: {
          duration: endTime - startTime,
          iterations: 1,
          collisions: collisionCount
        }
      };

    } catch (error) {
      const endTime = performance.now();
      console.error('❌ GroupLayoutStrategy 失败:', error);

      return {
        success: false,
        nodes: new Map(),
        edges: new Map(),
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        stats: {
          duration: endTime - startTime,
          iterations: 0,
          collisions: 0
        }
      };
    }
  }

  /**
   * 查找目标群组
   */
  private findGroup(nodes: (Node | Group)[], groupId: string): Group | undefined {
    return nodes.find(
      n => n.id === groupId && n.type === BlockEnum.GROUP
    ) as Group | undefined;
  }

  /**
   * 获取群组的直接子节点（去重）
   */
  private getDirectChildren(
    nodes: (Node | Group)[],
    groupId: string
  ): (Node | Group)[] {
    // 筛选所有 groupId 匹配的节点
    const filtered = nodes.filter(
      n => 'groupId' in n && (n as Node).groupId === groupId
    );

    // 使用 Map 去重
    const uniqueMap = new Map<string, Node | Group>();
    filtered.forEach(node => {
      if (!uniqueMap.has(node.id)) {
        uniqueMap.set(node.id, node);
      }
    });

    const result = Array.from(uniqueMap.values());

    // 如果检测到重复，打印警告
    if (result.length !== filtered.length) {
      console.warn(
        `⚠️ 检测到重复节点！原始: ${filtered.length}, 去重后: ${result.length}`
      );
    }

    return result;
  }

  /**
   * 合并布局结果
   * @param originalNodes 原始节点列表
   * @param layoutedChildren 布局后的子节点
   * @param adjustedNodes 调整大小后的节点（包含群组）
   * @param targetGroupId 目标群组ID
   */
  private mergeResults(
    originalNodes: (Node | Group)[],
    layoutedChildren: (Node | Group)[],
    adjustedNodes: (Node | Group)[],
    targetGroupId: string
  ): (Node | Group)[] {
    // 创建子节点位置映射
    const childPositionMap = new Map(
      layoutedChildren.map(n => [n.id, n.position])
    );

    // 创建群组尺寸映射
    const updatedGroup = adjustedNodes.find(n => n.id === targetGroupId) as Group;

    return originalNodes.map(node => {
      // 如果是布局的子节点，使用新位置
      if (childPositionMap.has(node.id)) {
        return {
          ...node,
          position: childPositionMap.get(node.id)!
        };
      }

      // 如果是目标群组，使用调整后的尺寸
      if (node.id === targetGroupId && updatedGroup) {
        return {
          ...node,
          width: updatedGroup.width,
          height: updatedGroup.height,
          boundary: updatedGroup.boundary
        };
      }

      // 其他节点保持不变
      return node;
    });
  }

  /**
   * 构建空结果（当没有子节点时）
   */
  private buildEmptyResult(startTime: number): LayoutResult {
    return {
      success: true,
      nodes: new Map(),
      edges: new Map(),
      errors: [],
      stats: {
        duration: performance.now() - startTime,
        iterations: 0,
        collisions: 0
      }
    };
  }

  /**
   * 验证配置
   */
  validateConfig(config: any): boolean {
    if (!config.targetGroupId) {
      console.error('GroupLayoutStrategy: targetGroupId is required');
      return false;
    }
    return true;
  }
}
