// src/services/layout/strategies/ELKGroupLayoutStrategy.ts
import { Node, Group, Edge } from '../../../types/graph/models';
import { ILayoutStrategy, LayoutResult, LayoutOptions } from '../types/layoutTypes';
import { ELKGraphConverter, ElkNode } from '../utils/ELKGraphConverter';
import { ELKConfigBuilder } from '../utils/ELKConfigBuilder';

// 动态导入 ELK（按需加载，减小初始包体积）
let ELK: any;

/**
 * ELK群组内部布局策略
 *
 * 职责：
 * - 使用 ELK.js 库对指定群组内的节点进行布局
 * - 只布局选中群组的直接子节点（不处理嵌套群组）
 * - 仅更新群组内节点的位置，保持其他节点不变
 *
 * 特点：
 * - 仅对指定群组内部进行布局
 * - 保持群组外的节点位置不变
 * - 适用于仅对部分节点重新排列的场景
 */
export class ELKGroupLayoutStrategy implements ILayoutStrategy {
  readonly name = 'ELK Group Layout';
  readonly id = 'elk-group-layout';

  private elk: any;
  private elkReady: Promise<void>;

  constructor() {
    // 异步加载 ELK 库
    this.elkReady = this.initELK();
  }

  /**
   * 初始化 ELK 库（懒加载）
   */
  private async initELK(): Promise<void> {
    try {
      // 动态导入 ELK
      const elkModule = await import('elkjs/lib/elk.bundled.js');
      ELK = elkModule.default || elkModule;
      this.elk = new ELK();
      console.log('✅ ELK 库加载成功 (Group Layout Strategy)');
    } catch (error) {
      console.error('❌ ELK 库加载失败:', error);
      throw new Error('Failed to load ELK library. Please install: npm install elkjs');
    }
  }

  /**
   * 应用ELK群组内部布局
   */
  async applyLayout(
    nodes: (Node | Group)[],
    edges: Edge[],
    options?: LayoutOptions
  ): Promise<LayoutResult> {
    const startTime = performance.now();

    try {
      console.log(`🎯 ELKGroupLayoutStrategy: 开始布局群组内部`);

      // 确保 ELK 已加载
      await this.elkReady;

      if (!this.elk) {
        throw new Error('ELK library is not initialized');
      }

      // 从options中获取目标群组ID
      const targetGroupId = options?.groupId;
      if (!targetGroupId) {
        throw new Error('Target group ID is required for group layout');
      }

      console.log(`🔍 目标群组: ${targetGroupId.substring(0, 8)}...`);

      // 找出目标群组及其子节点
      const targetGroup = nodes.find(n => n.id === targetGroupId);
      if (!targetGroup || targetGroup.type !== 'group') {
        throw new Error(`Target node is not a group: ${targetGroupId}`);
      }

      // 找出目标群组的所有子孙节点（包括嵌套群组内的节点）
      const groupDescendants = this.getAllDescendants(nodes, targetGroupId);

      console.log(`📊 群组 ${targetGroupId.substring(0, 8)}... 包含 ${groupDescendants.length} 个子孙节点`);

      if (groupDescendants.length === 0) {
        console.warn(`⚠️ 群组 ${targetGroupId} 没有子孙节点，无法进行内部布局`);
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

      // 1. 转换目标群组及其子孙节点到ELK图格式
      console.log('📊 步骤 1/3: 转换群组内部数据格式...');
      const elkGraph = this.createGroupELKGraph(targetGroup, groupDescendants, edges, options);

      // 2. 调用 ELK 布局
      console.log('🔄 步骤 2/3: 执行 ELK 群组内部布局算法...');
      const layoutStartTime = performance.now();

      const elkLayout: ElkNode = await this.elk.layout(elkGraph);

      const layoutDuration = performance.now() - layoutStartTime;
      console.log(`⚡ ELK 群组布局计算耗时: ${layoutDuration.toFixed(0)}ms`);

      // 3. 提取群组内节点位置
      console.log('📍 步骤 3/3: 提取群组内节点位置...');
      const nodePositions = ELKGraphConverter.fromELKLayout(elkLayout);

      // 4. 将ELK计算的相对位置转换为相对于画布的绝对位置
      // 保持目标群组的左上角作为锚点，确保群组整体位置不变
      const anchorX = targetGroup.position.x; // 群组的左上角X坐标
      const anchorY = targetGroup.position.y; // 群组的左上角Y坐标

      const absoluteNodePositions = new Map<string, { x: number; y: number; width?: number; height?: number }>();

      for (const [nodeId, position] of nodePositions) {
        // 计算绝对位置：以群组左上角为锚点
        const absoluteX = anchorX + position.x;
        const absoluteY = anchorY + position.y;

        // 对于目标群组，保持位置不变，但更新尺寸以适应内容
        if (nodeId === targetGroup.id) {
          absoluteNodePositions.set(nodeId, {
            x: anchorX, // 保持原始X位置
            y: anchorY, // 保持原始Y位置
            width: position.width,  // 更新宽度
            height: position.height // 更新高度
          });
        }
        // 对于目标群组内的其他群组，更新位置，也更新尺寸
        else if (nodeId.startsWith('group_')) {
          absoluteNodePositions.set(nodeId, {
            x: absoluteX,
            y: absoluteY,
            width: position.width,
            height: position.height
          });
        }
        // 对于普通节点，更新位置和尺寸
        else {
          absoluteNodePositions.set(nodeId, {
            x: absoluteX,
            y: absoluteY,
            width: position.width,
            height: position.height
          });
        }
      }

      // 5. 构建返回结果 - 只返回群组内节点的位置
      const endTime = performance.now();
      const totalDuration = endTime - startTime;

      console.log(`✅ ELK 群组内部布局完成！`);
      console.log(`   • 更新了 ${absoluteNodePositions.size} 个群组内节点位置`);
      console.log(`   • 总耗时: ${totalDuration.toFixed(0)}ms`);
      console.log(`   • 算法: ${elkGraph.layoutOptions?.['elk.algorithm'] || 'layered'}`);

      return {
        success: true,
        nodes: absoluteNodePositions,
        edges: new Map(), // 不处理边，由 EdgeOptimizer 或 ReactFlow 处理
        errors: [],
        stats: {
          duration: totalDuration,
          iterations: 1,
          collisions: 0
        }
      };

    } catch (error) {
      const endTime = performance.now();
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      console.error('❌ ELK 群组内部布局失败:', error);

      return {
        success: false,
        nodes: new Map(),
        edges: new Map(),
        errors: [errorMessage],
        stats: {
          duration: endTime - startTime,
          iterations: 0,
          collisions: 0
        }
      };
    }
  }

  /**
   * 为指定群组创建ELK图格式（仅包含该群组和其所有子孙节点）
   */
  private createGroupELKGraph(
    targetGroup: Node | Group,
    groupDescendants: (Node | Group)[],
    originalEdges: Edge[],
    options?: LayoutOptions
  ): ElkNode {
    console.log(`🔄 ELKGroupLayoutStrategy: 为群组 ${targetGroup.id} 创建ELK图`);

    // 构建群组内部的边 - 仅连接群组内部的节点（包括嵌套群组）
    const groupInternalEdges = originalEdges.filter(
      edge =>
        groupDescendants.some(descendant => descendant.id === edge.source) &&
        groupDescendants.some(descendant => descendant.id === edge.target)
    );

    // 构建ELK根节点 - 表示目标群组
    const elkGraph: ElkNode = {
      id: targetGroup.id,
      width: targetGroup.width,
      height: targetGroup.height,
      layoutOptions: this.getDefaultLayoutOptions(options),
      children: this.convertGroupChildren(groupDescendants),
      edges: this.convertEdges(groupInternalEdges)
    };

    // 统计信息
    const totalChildren = this.countNodes(elkGraph);
    console.log(`✅ 群组ELK图创建完成: ${totalChildren} 个节点, ${elkGraph.edges?.length || 0} 条群组内边`);

    return elkGraph;
  }

  /**
   * 转换群组的所有子孙节点（包括嵌套群组）
   */
  private convertGroupChildren(children: (Node | Group)[]): ElkNode[] {
    return children.map(child => {
      // 如果是群组，递归转换其子节点
      if (child.type === 'group') {
        const subChildren = this.getAllDescendants(children, child.id);
        return {
          id: child.id,
          width: child.width || this.getDefaultWidth(child),
          height: child.height || this.getDefaultHeight(child),
          children: this.convertGroupChildren(subChildren),
        };
      } else {
        // 普通节点
        return {
          id: child.id,
          width: child.width || this.getDefaultWidth(child),
          height: child.height || this.getDefaultHeight(child)
        };
      }
    });
  }

  /**
   * 转换边
   */
  private convertEdges(edges: Edge[]): ElkEdge[] {
    return edges.map(edge => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target]
    }));
  }

  /**
   * 获取默认的布局选项
   */
  private getDefaultLayoutOptions(options?: LayoutOptions): Record<string, any> {
    return {
      // ========== 核心算法 ==========
      'elk.algorithm': 'layered',  // 层次布局，适合有向图
      'elk.direction': 'DOWN',     // 从上到下

      // ========== 间距配置 ==========
      'elk.spacing.nodeNode': 80,  // 同层节点间距
      'elk.layered.spacing.nodeNodeBetweenLayers': 100,  // 层间节点间距

      // ✅ 新增：边与节点的间距（ELK布局节点时会为边预留空间）
      'elk.spacing.edgeNode': 15,  // 边与节点间距
      'elk.spacing.edgeEdge': 10,  // 边与边间距
      'elk.layered.spacing.edgeNodeBetweenLayers': 15,  // 层间边节点间距
      'elk.layered.spacing.edgeEdgeBetweenLayers': 10,  // 层间边边间距

      // ========== 节点放置（考虑节点大小）==========
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',  // 最优节点位置
      'elk.layered.nodePlacement.bk.fixedAlignment': 'BALANCED',  // 平衡对齐

      // ========== 交叉最小化（考虑边的连接关系）==========
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',  // 减少边交叉
      'elk.layered.crossingMinimization.semiInteractive': true,  // 改善深层嵌套

      // ========== 有向图优化（考虑边的方向性）==========
      'elk.layered.cycleBreaking.strategy': 'GREEDY',  // 处理循环引用
      'elk.layered.considerModelOrder.strategy': 'PREFER_EDGES',  // 优先考虑边的方向
      'elk.layered.layering.strategy': 'NETWORK_SIMPLEX',  // 最优分层

      // ========== 组件分离 ==========
      'elk.separateConnectedComponents': true,  // 分离独立的连通组件
      'elk.spacing.componentComponent': 50,  // 组件间距

      // ========== 性能与质量平衡 ==========
      'elk.layered.thoroughness': 7,  // 布局质量（1-10，默认7）
      'elk.layered.compaction.postCompaction.strategy': 'EDGE_LENGTH',  // 紧凑策略

      // 用户自定义选项可以覆盖默认值
      ...(options?.elkOptions || {})
    };
  }

  /**
   * 获取节点的默认宽度
   */
  private getDefaultWidth(node: Node | Group): number {
    if (node.width && node.width > 0) {
      return node.width;
    }

    // 如果是群组，使用群组默认尺寸
    if (node.type === 'group') {
      return 180;
    }

    return 120;
  }

  /**
   * 获取节点的默认高度
   */
  private getDefaultHeight(node: Node | Group): number {
    if (node.height && node.height > 0) {
      return node.height;
    }

    // 如果是群组，使用群组默认尺寸
    if (node.type === 'group') {
      return 120;
    }

    return 60;
  }

  /**
   * 获取指定群组的所有子孙节点（包括嵌套群组内的节点）
   */
  private getAllDescendants(nodes: (Node | Group)[], groupId: string): (Node | Group)[] {
    const descendants: (Node | Group)[] = [];

    // 查找直接子节点
    const directChildren = nodes.filter(n =>
      'groupId' in n && (n as Node | Group).groupId === groupId
    );

    for (const child of directChildren) {
      // 添加当前子节点
      descendants.push(child);

      // 如果当前子节点是一个群组，递归获取其子孙节点
      if (child.type === 'group') {
        const nestedDescendants = this.getAllDescendants(nodes, child.id);
        descendants.push(...nestedDescendants);
      }
    }

    return descendants;
  }

  /**
   * 统计节点总数（用于调试）
   */
  private countNodes(elkNode: ElkNode): number {
    let count = 1; // 计算当前节点
    if (elkNode.children) {
      for (const child of elkNode.children) {
        count += this.countNodes(child);
      }
    }
    return count;
  }

  /**
   * 验证配置
   */
  validateConfig(config: any): boolean {
    return true;
  }
}

// ELK边格式定义
interface ElkEdge {
  id: string;
  sources: string[];
  targets: string[];
}