/**
 * ELK配置构建器
 * 职责：为不同的布局场景生成ELK配置选项
 */
import { ELK_ALGORITHM_CONFIG } from '../../../config/elk-algorithm';
import type { ELKLayoutDirection, ELKLayoutOptions } from '../types/layoutTypes';

export class ELKConfigBuilder {
  /**
   * 获取层次布局配置（推荐用于有向图）
   *
   * 特点：
   * - 节点按层级排列
   * - 最小化边交叉
   * - 适合流程图、知识图谱
   */
  static getLayeredConfig(direction: ELKLayoutDirection = 'DOWN'): ELKLayoutOptions {
    return {
      'elk.algorithm': ELK_ALGORITHM_CONFIG.common.algorithm,
      'elk.direction': direction,

      // 间距配置
      'elk.spacing.nodeNode': ELK_ALGORITHM_CONFIG.layered.spacing.nodeNode,
      'elk.layered.spacing.nodeNodeBetweenLayers': ELK_ALGORITHM_CONFIG.layered.spacing.nodeNodeBetweenLayers,
      'elk.spacing.edgeNode': ELK_ALGORITHM_CONFIG.layered.spacing.edgeNode,
      'elk.spacing.edgeEdge': ELK_ALGORITHM_CONFIG.layered.spacing.edgeEdge,

      // 层次处理
      'elk.hierarchyHandling': ELK_ALGORITHM_CONFIG.common.hierarchyHandling,

      // 节点放置策略
      'elk.layered.nodePlacement.strategy': ELK_ALGORITHM_CONFIG.layered.nodePlacement.strategy,

      // 交叉最小化
      'elk.layered.crossingMinimization.semiInteractive': ELK_ALGORITHM_CONFIG.layered.crossingMinimization.semiInteractive,
      'elk.layered.crossingMinimization.strategy': ELK_ALGORITHM_CONFIG.layered.crossingMinimization.strategy,

      // 边路由（可选）
      // 'elk.edgeRouting': ELK_ALGORITHM_CONFIG.common.edgeRouting,

      // 分层策略
      'elk.layered.layering.strategy': ELK_ALGORITHM_CONFIG.layered.layering.strategy,

      // 周期打破（处理循环引用）
      'elk.layered.cycleBreaking.strategy': ELK_ALGORITHM_CONFIG.layered.cycleBreaking.strategy
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
  static getForceConfig(): ELKLayoutOptions {
    return {
      'elk.algorithm': 'force',

      // 力导向参数
      'elk.force.repulsion': ELK_ALGORITHM_CONFIG.force.repulsion,
      'elk.force.temperature': ELK_ALGORITHM_CONFIG.force.temperature,
      'elk.force.iterations': ELK_ALGORITHM_CONFIG.force.iterations,

      // 间距
      'elk.spacing.nodeNode': ELK_ALGORITHM_CONFIG.force.spacing.nodeNode,

      // 层次处理
      'elk.hierarchyHandling': ELK_ALGORITHM_CONFIG.common.hierarchyHandling
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
  static getStressConfig(): ELKLayoutOptions {
    return {
      'elk.algorithm': 'stress',

      // 压力参数
      'elk.stress.desiredEdgeLength': ELK_ALGORITHM_CONFIG.stress.desiredEdgeLength,
      'elk.stress.epsilon': ELK_ALGORITHM_CONFIG.stress.epsilon,

      // 间距
      'elk.spacing.nodeNode': ELK_ALGORITHM_CONFIG.stress.spacing.nodeNode,

      // 层次处理
      'elk.hierarchyHandling': ELK_ALGORITHM_CONFIG.common.hierarchyHandling
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
  static getTreeConfig(direction: ELKLayoutDirection = 'DOWN'): ELKLayoutOptions {
    return {
      'elk.algorithm': 'mrtree',  // Mr. Tree算法

      'elk.direction': direction,

      // 间距
      'elk.spacing.nodeNode': ELK_ALGORITHM_CONFIG.tree.spacing.nodeNode,
      'elk.mrtree.searchOrder': ELK_ALGORITHM_CONFIG.tree.searchOrder,

      // 层次处理
      'elk.hierarchyHandling': ELK_ALGORITHM_CONFIG.common.hierarchyHandling
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
  static getRadialConfig(): ELKLayoutOptions {
    return {
      'elk.algorithm': 'radial',

      // 径向参数
      'elk.radial.radius': ELK_ALGORITHM_CONFIG.radial.radius,

      // 间距
      'elk.spacing.nodeNode': ELK_ALGORITHM_CONFIG.radial.spacing.nodeNode,

      // 层次处理
      'elk.hierarchyHandling': ELK_ALGORITHM_CONFIG.common.hierarchyHandling
    };
  }

  /**
   * 获取紧凑布局配置（用于空间受限场景）
   */
  static getCompactConfig(): ELKLayoutOptions {
    return {
      'elk.algorithm': ELK_ALGORITHM_CONFIG.common.algorithm,
      'elk.direction': ELK_ALGORITHM_CONFIG.common.direction,

      // 紧凑间距
      'elk.spacing.nodeNode': ELK_ALGORITHM_CONFIG.compact.spacing.nodeNode,
      'elk.layered.spacing.nodeNodeBetweenLayers': ELK_ALGORITHM_CONFIG.compact.spacing.nodeNodeBetweenLayers,
      'elk.spacing.edgeNode': ELK_ALGORITHM_CONFIG.compact.spacing.edgeNode,

      // 紧凑模式
      'elk.layered.compaction.postCompaction.strategy': ELK_ALGORITHM_CONFIG.common.compaction.postCompactionStrategy,
      'elk.layered.compaction.connectedComponents': ELK_ALGORITHM_CONFIG.common.compaction.connectedComponents,

      // 层次处理
      'elk.hierarchyHandling': ELK_ALGORITHM_CONFIG.common.hierarchyHandling,

      // 节点放置
      'elk.layered.nodePlacement.strategy': 'SIMPLE'
    };
  }

  /**
   * 获取宽松布局配置（用于复杂大图）
   */
  static getSpacingConfig(): ELKLayoutOptions {
    return {
      'elk.algorithm': ELK_ALGORITHM_CONFIG.common.algorithm,
      'elk.direction': ELK_ALGORITHM_CONFIG.common.direction,

      // 增大间距
      'elk.spacing.nodeNode': ELK_ALGORITHM_CONFIG.spacious.spacing.nodeNode,
      'elk.layered.spacing.nodeNodeBetweenLayers': ELK_ALGORITHM_CONFIG.spacious.spacing.nodeNodeBetweenLayers,
      'elk.spacing.edgeNode': ELK_ALGORITHM_CONFIG.spacious.spacing.edgeNode,
      'elk.spacing.edgeEdge': ELK_ALGORITHM_CONFIG.spacious.spacing.edgeEdge,

      // 层次处理
      'elk.hierarchyHandling': ELK_ALGORITHM_CONFIG.common.hierarchyHandling,

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
    baseConfig: ELKLayoutOptions,
    userConfig?: ELKLayoutOptions
  ): ELKLayoutOptions {
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
  ): ELKLayoutOptions {
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
  static getDebugConfig(): ELKLayoutOptions {
    return {
      ...this.getLayeredConfig('DOWN'),
      // ELK内部会输出更多调试信息
      'elk.debugMode': true
    };
  }
}
