/**
 * 知识图谱编辑器全局配置
 * 集中管理所有固定数值、默认值和策略配置
 */

export const GraphConfig = {
  // ==================== 嵌套配置 ====================
  nesting: {
    /** 最大嵌套层数 */
    maxDepth: 5,
    /** 是否允许 GroupNode 嵌套 */
    allowGroupInGroup: true,
  },

  // ==================== 节点默认尺寸 ====================
  nodeSize: {
    /** 笔记节点尺寸 */
    note: {
      /** 收缩状态尺寸 */
      collapsed: { width: 350, height: 280 },
      /** 展开状态默认尺寸 */
      expanded: { width: 600, height: 450 },
      /** 最小尺寸 */
      min: { width: 300, height: 240 },
    },
    /** 群组节点尺寸 */
    group: {
      /** 默认尺寸 */
      default: { width: 300, height: 200 },
      /** 最小尺寸 */
      min: { width: 250, height: 150 },
    },
  },

  // ==================== 群组边距 ====================
  groupPadding: {
    /** 顶部边距（标题栏高度 + 额外间距） */
    top: 70,
    /** 左侧边距 */
    left: 20,
    /** 右侧边距 */
    right: 20,
    /** 底部边距 */
    bottom: 20,
  },

  // ==================== 节点视觉边距 ====================
  /** 节点外框的额外空间（阴影、边框等视觉效果） */
  nodeVisualPadding: 4,

  // ==================== 网格布局配置 ====================
  gridLayout: {
    /** 每行节点数量 */
    nodesPerRow: 2,
    /** 节点间水平间距 */
    horizontalSpacing: 400,
    /** 节点间垂直间距 */
    verticalSpacing: 320,
  },

  // ==================== z-index 层级配置 ====================
  zIndex: {
    /** 顶层群组 z-index */
    topLevelGroup: 1,
    /** 嵌套群组基础 z-index（每层嵌套 +1） */
    nestedGroupBase: 2,
    /** 普通节点 z-index（始终在群组之上） */
    node: 100,
    /** 边的 z-index */
    edge: {
      /** 群组内的边 */
      internal: 100,
      /** 跨群组的边 */
      cross: 50,
    },
  },

  // ==================== 历史记录配置 ====================
  history: {
    /** 最大历史记录数量 */
    maxSize: 50,
  },

  // ==================== 数据验证限制 ====================
  validation: {
    /** 标题验证 */
    title: {
      maxLength: 100,
    },
    /** 内容验证 */
    content: {
      maxLength: 10000,
    },
    /** 摘要验证 */
    summary: {
      maxLength: 500,
    },
    /** 标签验证 */
    tags: {
      maxCount: 20,
      maxLength: 50,
    },
  },

  // ==================== 视觉区分策略 ====================
  visualStyle: {
    /** 群组嵌套视觉区分配置 */
    groupNesting: {
      /** 是否启用视觉区分 */
      enabled: true,
      /**
       * 区分策略
       * - 'color': 不同层级使用不同背景颜色
       * - 'opacity': 不同层级使用不同透明度
       * - 'border': 不同层级使用不同边框样式
       * - 'none': 不做视觉区分
       */
      strategy: 'color' as 'color' | 'opacity' | 'border' | 'none',
      /** 颜色方案（按嵌套层级） */
      colors: [
        'bg-blue-50 bg-opacity-70',      // 层级 0 (顶层)
        'bg-purple-50 bg-opacity-70',    // 层级 1
        'bg-green-50 bg-opacity-70',     // 层级 2
        'bg-yellow-50 bg-opacity-70',    // 层级 3
        'bg-pink-50 bg-opacity-70',      // 层级 4
        'bg-indigo-50 bg-opacity-70',    // 层级 5+
      ],
      /** 边框颜色方案（按嵌套层级） */
      borderColors: [
        'border-blue-200',      // 层级 0
        'border-purple-200',    // 层级 1
        'border-green-200',     // 层级 2
        'border-yellow-200',    // 层级 3
        'border-pink-200',      // 层级 4
        'border-indigo-200',    // 层级 5+
      ],
      /** 透明度方案（按嵌套层级） */
      opacities: [0.7, 0.6, 0.5, 0.4, 0.3, 0.2],
      /** 边框样式方案（按嵌套层级） */
      borderStyles: [
        'border-2',
        'border-2 border-dashed',
        'border-[3px]',
        'border-[3px] border-dashed',
        'border-4',
        'border-4 border-dashed',
      ],
    },
  },

  // ==================== 删除确认配置 ====================
  deletion: {
    /** 删除群组时是否需要确认 */
    confirmGroupDeletion: true,
    /** 删除包含嵌套内容的群组时是否需要特别确认 */
    confirmNestedDeletion: true,
  },
} as const;

// ==================== 类型导出 ====================
export type GraphConfigType = typeof GraphConfig;

// ==================== 辅助函数 ====================

/**
 * 根据嵌套深度获取视觉样式
 */
export function getGroupVisualStyle(depth: number): {
  bgColor: string;
  borderColor: string;
  opacity?: number;
  borderStyle?: string;
} {
  const config = GraphConfig.visualStyle.groupNesting;

  if (!config.enabled || config.strategy === 'none') {
    return {
      bgColor: 'bg-blue-50 bg-opacity-70',
      borderColor: 'border-blue-200',
    };
  }

  // 确保 depth 在有效范围内
  const safeDepth = Math.min(depth, config.colors.length - 1);

  const result: ReturnType<typeof getGroupVisualStyle> = {
    bgColor: config.colors[safeDepth],
    borderColor: config.borderColors[safeDepth],
  };

  if (config.strategy === 'opacity') {
    result.opacity = config.opacities[safeDepth];
  }

  if (config.strategy === 'border') {
    result.borderStyle = config.borderStyles[safeDepth];
  }

  return result;
}

/**
 * 计算嵌套群组的 z-index
 */
export function calculateGroupZIndex(depth: number, hasParent: boolean): number {
  if (!hasParent) {
    return GraphConfig.zIndex.topLevelGroup;
  }
  return GraphConfig.zIndex.nestedGroupBase + depth;
}

/**
 * 获取节点默认尺寸
 */
export function getDefaultNodeSize(
  nodeType: 'note' | 'group',
  state?: 'collapsed' | 'expanded'
): { width: number; height: number } {
  if (nodeType === 'note') {
    if (state === 'collapsed') {
      return GraphConfig.nodeSize.note.collapsed;
    }
    return GraphConfig.nodeSize.note.expanded;
  }
  return GraphConfig.nodeSize.group.default;
}
