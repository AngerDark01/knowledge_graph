/**
 * ELK算法配置参数
 * 
 * 包含ELK布局算法的各种参数配置
 */

export const ELK_ALGORITHM_CONFIG = {
  // 层次布局配置
  layered: {
    spacing: {
      nodeNode: 80,                          // 同层节点间距
      nodeNodeBetweenLayers: 100,            // 层间距
      edgeNode: 40,                          // 边与节点的间距
      edgeEdge: 20,                          // 边与边的间距
    },
    nodePlacement: {
      strategy: 'NETWORK_SIMPLEX',           // 节点放置策略
    },
    crossingMinimization: {
      semiInteractive: true,                 // 交叉最小化是否半交互
      strategy: 'LAYER_SWEEP',               // 交叉最小化策略
    },
    layering: {
      strategy: 'NETWORK_SIMPLEX',           // 分层策略
    },
    cycleBreaking: {
      strategy: 'GREEDY',                    // 周期打破策略
    }
  },

  // 力导向布局配置
  force: {
    repulsion: 100,                          // 排斥力
    temperature: 0.5,                        // 温度（影响收敛速度）
    iterations: 300,                         // 迭代次数
    spacing: {
      nodeNode: 80,                          // 节点间距
    }
  },

  // 压力布局配置
  stress: {
    desiredEdgeLength: 100,                  // 期望的边长度
    epsilon: 0.0001,                         // 收敛阈值
    spacing: {
      nodeNode: 80,                          // 节点间距
    }
  },

  // 树形布局配置
  tree: {
    spacing: {
      nodeNode: 60,                          // 节点间距
    },
    searchOrder: 'DFS',                      // 搜索顺序
  },

  // 径向布局配置
  radial: {
    radius: 200,                            // 半径
    spacing: {
      nodeNode: 80,                         // 节点间距
    }
  },

  // 紧凑布局配置
  compact: {
    spacing: {
      nodeNode: 40,                         // 节点间距
      nodeNodeBetweenLayers: 60,            // 层间距
      edgeNode: 20,                         // 边与节点的间距
    }
  },

  // 宽松布局配置
  spacious: {
    spacing: {
      nodeNode: 120,                        // 节点间距
      nodeNodeBetweenLayers: 150,           // 层间距
      edgeNode: 60,                         // 边与节点的间距
      edgeEdge: 30,                         // 边与边的间距
    }
  },

  // 通用配置
  common: {
    hierarchyHandling: 'INCLUDE_CHILDREN',  // 层次处理方式
    compaction: {
      postCompactionStrategy: 'EDGE_LENGTH', // 后置压缩策略
      connectedComponents: true,             // 连通分量处理
    },
    edgeRouting: 'ORTHOGONAL',              // 边路由类型
    debugMode: true,                        // 调试模式
    algorithm: 'layered',                   // 默认算法
    direction: 'DOWN' as const,             // 默认方向
  }
} as const;