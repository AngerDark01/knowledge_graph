// src/services/layout/utils/ELKConfigBuilder.ts

/**
 * ELK配置构建器
 * 职责：为不同的布局场景生成ELK配置选项
 */
export class ELKConfigBuilder {
  /**
   * 获取层次布局配置（推荐用于有向图）
   *
   * 特点：
   * - 节点按层级排列
   * - 最小化边交叉
   * - 适合流程图、知识图谱
   */
  static getLayeredConfig(direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' = 'DOWN'): Record<string, any> {
    return {
      'elk.algorithm': 'layered',
      'elk.direction': direction,

      // 间距配置
      'elk.spacing.nodeNode': 80,  // 同层节点间距
      'elk.layered.spacing.nodeNodeBetweenLayers': 100,  // 层间距
      'elk.spacing.edgeNode': 40,  // 边与节点的间距
      'elk.spacing.edgeEdge': 20,  // 边与边的间距

      // 层次处理
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN',  // 一次性处理所有嵌套层级

      // 节点放置策略
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',  // 最优化节点位置

      // 交叉最小化
      'elk.layered.crossingMinimization.semiInteractive': true,  // 改善深层嵌套的边
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',

      // 边路由（可选）
      // 'elk.edgeRouting': 'ORTHOGONAL',  // 正交路由（直角转弯）

      // 分层策略
      'elk.layered.layering.strategy': 'NETWORK_SIMPLEX',  // 最优分层

      // 周期打破（处理循环引用）
      'elk.layered.cycleBreaking.strategy': 'GREEDY'
    };
  }

  /**
   * 获取力导向布局配置
   *
   * 特点：
   * - 基于物理模拟
   * - 节点分布均匀
   * - 适合无向图、社交网络
   */
  static getForceConfig(): Record<string, any> {
    return {
      'elk.algorithm': 'force',

      // 力导向参数
      'elk.force.repulsion': 100,  // 排斥力
      'elk.force.temperature': 0.5,  // 温度（影响收敛速度）
      'elk.force.iterations': 300,  // 迭代次数

      // 间距
      'elk.spacing.nodeNode': 80,

      // 层次处理
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN'
    };
  }

  /**
   * 获取压力布局配置
   *
   * 特点：
   * - 基于应力最小化
   * - 保持节点间距离关系
   * - 计算较慢但效果好
   */
  static getStressConfig(): Record<string, any> {
    return {
      'elk.algorithm': 'stress',

      // 压力参数
      'elk.stress.desiredEdgeLength': 100,  // 期望的边长度
      'elk.stress.epsilon': 0.0001,  // 收敛阈值

      // 间距
      'elk.spacing.nodeNode': 80,

      // 层次处理
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN'
    };
  }

  /**
   * 获取树形布局配置
   *
   * 特点：
   * - 适合树形结构
   * - 父节点在上，子节点在下
   * - 紧凑的层次结构
   */
  static getTreeConfig(direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' = 'DOWN'): Record<string, any> {
    return {
      'elk.algorithm': 'mrtree',  // Mr. Tree算法

      'elk.direction': direction,

      // 间距
      'elk.spacing.nodeNode': 60,
      'elk.mrtree.searchOrder': 'DFS',  // 深度优先搜索

      // 层次处理
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN'
    };
  }

  /**
   * 获取径向布局配置
   *
   * 特点：
   * - 以中心节点为圆心
   * - 其他节点环绕分布
   * - 适合展示中心关系
   */
  static getRadialConfig(): Record<string, any> {
    return {
      'elk.algorithm': 'radial',

      // 径向参数
      'elk.radial.radius': 200,  // 半径

      // 间距
      'elk.spacing.nodeNode': 80,

      // 层次处理
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN'
    };
  }

  /**
   * 获取紧凑布局配置（用于空间受限场景）
   */
  static getCompactConfig(): Record<string, any> {
    return {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',

      // 紧凑间距
      'elk.spacing.nodeNode': 40,  // 减小间距
      'elk.layered.spacing.nodeNodeBetweenLayers': 60,
      'elk.spacing.edgeNode': 20,

      // 紧凑模式
      'elk.layered.compaction.postCompaction.strategy': 'EDGE_LENGTH',
      'elk.layered.compaction.connectedComponents': true,

      // 层次处理
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN',

      // 节点放置
      'elk.layered.nodePlacement.strategy': 'SIMPLE'
    };
  }

  /**
   * 获取宽松布局配置（用于复杂大图）
   */
  static getSpacingConfig(): Record<string, any> {
    return {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',

      // 增大间距
      'elk.spacing.nodeNode': 120,
      'elk.layered.spacing.nodeNodeBetweenLayers': 150,
      'elk.spacing.edgeNode': 60,
      'elk.spacing.edgeEdge': 30,

      // 层次处理
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN',

      // 节点放置
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX'
    };
  }

  /**
   * 合并用户自定义配置
   *
   * @param baseConfig 基础配置
   * @param userConfig 用户配置（会覆盖基础配置）
   */
  static mergeConfig(
    baseConfig: Record<string, any>,
    userConfig?: Record<string, any>
  ): Record<string, any> {
    return {
      ...baseConfig,
      ...(userConfig || {})
    };
  }

  /**
   * 根据场景自动选择配置
   *
   * @param nodeCount 节点数量
   * @param hasNesting 是否有嵌套结构
   * @param isDirected 是否为有向图
   */
  static getAutoConfig(
    nodeCount: number,
    hasNesting: boolean,
    isDirected: boolean = true
  ): Record<string, any> {
    // 小图（<20个节点）使用紧凑布局
    if (nodeCount < 20) {
      return this.getCompactConfig();
    }

    // 大图（>100个节点）使用宽松布局
    if (nodeCount > 100) {
      return this.getSpacingConfig();
    }

    // 中等大小，有向图使用层次布局
    if (isDirected) {
      return this.getLayeredConfig('DOWN');
    }

    // 无向图使用力导向布局
    return this.getForceConfig();
  }

  /**
   * 获取调试配置（包含详细日志）
   */
  static getDebugConfig(): Record<string, any> {
    return {
      ...this.getLayeredConfig('DOWN'),
      // ELK内部会输出更多调试信息
      'elk.debugMode': true
    };
  }
}
