# 群组内部布局修复方案

## 问题分析

### 当前实现的问题：
1. **代码不复用**：顶层用`calculateGridCenterPositions`，群组内用`calculateGroupGridLayout`
2. **坐标系统不一致**：
   - 顶层：相对于画布中心(0,0)，offset可以是负数
   - 群组内：相对于群组左上角+padding，offset用`Math.max(0, ...)`限制为非负
3. **当网格 > 可用空间时**：节点贴着左上角，不居中

### 用户设计思路：
1. 第一步：顶层布局 - 只影响第一层，子孙节点维护相对位置 ✅ 已实现
2. 第二步：群组内布局 - **应该用同样的布局算法**，只是原点改为群组内部中心
3. 第三步：递归布局 - 对所有层级应用同样逻辑

## 修复方案

### 方案A：复用calculateGridCenterPositions + 坐标转换

```typescript
// Line 217-271 替换整个群组内布局分支
if (options?.targetGroupId) {
  const parentGroup = nodes.find(n =>
    n.id === options.targetGroupId && n.type === BlockEnum.GROUP
  ) as Group | undefined;

  if (!parentGroup) {
    throw new Error(`目标群组 ${options.targetGroupId} 不存在`);
  }

  console.log(`📐 对群组 ${parentGroup.id} 内的 ${targetNodes.length} 个子节点进行布局`);

  // ✅ 1. 使用和顶层完全一样的布局算法
  const gridOptions = {
    rows: Math.ceil(targetNodes.length / GRID_LAYOUT.NODES_PER_ROW),
    cols: GRID_LAYOUT.NODES_PER_ROW,
    spacing: options?.gridSpacing || LAYOUT_CONFIG.layoutAlgorithm.gridSpacing,
    horizontalSpacing: GRID_LAYOUT.HORIZONTAL_SPACING,
    verticalSpacing: GRID_LAYOUT.VERTICAL_SPACING
  };

  // ✅ 2. 计算相对于网格中心的位置（和顶层一样的逻辑）
  const relativePositionedNodes = this.calculateGridCenterPositions(targetNodes, gridOptions);

  // ✅ 3. 计算群组内部空间的中心点（新原点）
  const padding = LAYOUT_CONFIG.group;
  const availableWidth = (parentGroup.width || LAYOUT_CONFIG.nodeSize.groupNode.width)
    - padding.paddingLeft - padding.paddingRight;
  const availableHeight = (parentGroup.height || LAYOUT_CONFIG.nodeSize.groupNode.height)
    - padding.paddingTop - padding.paddingBottom;

  // 群组内部空间的中心（相对于父群组左上角）
  const groupInnerCenterX = padding.paddingLeft + availableWidth / 2;
  const groupInnerCenterY = padding.paddingTop + availableHeight / 2;

  // 群组内部空间的中心（画布绝对坐标）
  const absoluteCenterX = parentGroup.position.x + groupInnerCenterX;
  const absoluteCenterY = parentGroup.position.y + groupInnerCenterY;

  console.log(`  └─ 父群组: (${Math.round(parentGroup.position.x)}, ${Math.round(parentGroup.position.y)})`);
  console.log(`  └─ 内部中心: (${Math.round(absoluteCenterX)}, ${Math.round(absoluteCenterY)})`);

  // ✅ 4. 转换为绝对坐标（相对偏移 + 群组中心）
  const positionedTargetNodes = relativePositionedNodes.map(node => ({
    ...node,
    position: {
      x: absoluteCenterX + node.position.x,
      y: absoluteCenterY + node.position.y
    }
  }));

  // ✅ 5. 碰撞检测（和顶层一样）
  const resolvedTargetNodes = this.resolveCollisions(positionedTargetNodes);

  // ✅ 6. 合并节点（和顶层一样的逻辑）
  const positionedNodes = nodes.map(node => {
    if ('groupId' in node && (node as Node).groupId === options.targetGroupId) {
      const layoutNode = resolvedTargetNodes.find(n => n.id === node.id);
      if (layoutNode) {
        return { ...node, position: layoutNode.position };
      }
    }
    return node;
  });

  // ✅ 7. 更新嵌套节点位置（和顶层一样）
  const finalNodes = this.updateNestedNodePositions(nodes, positionedNodes);

  // ✅ 8. 优化边（和顶层一样）
  const optimizedEdges = this.edgeOptimizer.optimizeEdgeHandles(finalNodes, edges);

  const endTime = performance.now();

  const nodePositions = new Map<string, { x: number; y: number }>();
  for (const node of finalNodes) {
    nodePositions.set(node.id, node.position);
  }

  const edgeHandles = new Map<string, OptimizedEdge>();
  for (const edge of optimizedEdges) {
    edgeHandles.set(edge.id, edge);
  }

  return {
    success: true,
    nodes: nodePositions,
    edges: edgeHandles,
    errors: [],
    stats: {
      duration: endTime - startTime,
      iterations: 1,
      collisions: this.countCollisions(resolvedTargetNodes)
    }
  };
}
```

### 关键改进：
1. ✅ **完全复用 `calculateGridCenterPositions`** - 和顶层用同一套代码
2. ✅ **原点 = 群组内部空间中心** - 符合用户"以父节点左上角为原点"的要求
3. ✅ **offset可以是负数** - 网格大于可用空间时依然居中
4. ✅ **统一处理流程** - 和顶层完全一致
5. ✅ **自动调整父节点大小** - 通过updateGroupBoundary实现

### 可以删除的代码：
- `calculateGroupGridLayout` 方法（line 105-195）- 90行冗余代码
- `constrainToGroupBoundary` 调用（line 233）- 不需要额外约束

## 对比

| 特性 | 修复前 | 修复后 |
|------|--------|--------|
| 布局算法 | `calculateGroupGridLayout`（独立） | `calculateGridCenterPositions`（复用） |
| 原点定义 | 群组position + padding（不居中） | 群组内部空间中心（居中） |
| offset计算 | `Math.max(0, ...)` 限制非负 | 可以是负数 |
| 代码行数 | ~90行独立逻辑 | ~40行（复用+转换） |
| 和顶层一致性 | ❌ 完全不同的实现 | ✅ 完全一致的流程 |
| 支持递归 | ❌ 需要特殊处理 | ✅ 自然支持 |

## 测试场景

### 场景1：节点恰好fit可用空间
- 群组 400x300，2个节点 350x280
- 应该：居中显示 ✅

### 场景2：节点超出可用空间
- 群组 300x200，2个节点 350x280
- 应该：居中显示（部分超出边界，触发父节点自动扩展）✅

### 场景3：多层嵌套
- GroupA > GroupB > Node2
- 布局GroupA后，Node2应该跟随GroupB移动 ✅

## 实施步骤

1. 在 GridCenterLayoutStrategy.ts 中替换 line 217-271
2. 删除 calculateGroupGridLayout 方法（line 105-195）
3. 删除 constrainToGroupBoundary 调用（line 233）
4. 测试三个场景
5. 提交代码

