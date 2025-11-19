# 群组内布局完整执行流程分析

## 📍 执行流程概览

```
用户点击"布局群组内部"按钮
  ↓
handleGroupLayout (LayoutControl.tsx:125)
  ↓
layoutManager.applyLayout(..., { targetGroupId: selectedNodeId })
  ↓
GridCenterLayoutStrategy.applyLayout (options.targetGroupId 存在)
  ↓
【群组内布局分支】line 218-342
  ↓
返回 LayoutResult
  ↓
更新 Zustand store (nodes, edges)
  ↓
触发 updateGroupBoundary
  ↓
前端重新渲染
```

---

## 🔍 详细步骤分析

### 步骤 0：用户操作

**位置**：`LayoutControl.tsx:372-407`

**触发条件**：
- 用户选中了一个 Group 节点
- 该 Group 至少有 1 个子节点
- 按钮显示：`布局群组内部 (N)`

**点击后调用**：`handleGroupLayout()` (line 125)

---

### 步骤 1：`handleGroupLayout` - 准备参数

**位置**：`LayoutControl.tsx:125-222`

**输入**：
- `nodes`: 所有节点的数组（从 Zustand store 获取）
- `edges`: 所有边的数组
- `selectedNodeId`: 当前选中的群组 ID

**关键参数**：
```typescript
const layoutResult = await layoutManager.applyLayout(
  nodes,           // 所有节点
  edges,           // 所有边
  {
    strategy: 'grid-center-layout',
    targetGroupId: selectedNodeId,  // ✨ 关键：指定目标群组
    layoutScope: 'group',            // ✨ 布局范围：群组
    animate: true,
    useWeightedLayout: true
  }
);
```

**输出**：传递给 `GridCenterLayoutStrategy.applyLayout`

---

### 步骤 2：进入 `applyLayout` 方法

**位置**：`GridCenterLayoutStrategy.ts:197-417`

**关键判断**：
```typescript
// Line 210-212: 获取目标节点
const targetNodes = this.getTargetNodes(nodes, options);
const otherNodes = nodes.filter(n => !targetNodes.some(tn => tn.id === n.id));

// Line 218: 检测是否为群组内布局
if (options?.targetGroupId) {
  // 进入群组内布局分支
}
```

---

### 步骤 3：`getTargetNodes` - 筛选目标节点

**位置**：`GridCenterLayoutStrategy.ts:33-50`

**输入**：
- `allNodes`: 所有节点数组
- `options.targetGroupId`: `'group_xxx'`

**执行逻辑**：
```typescript
// Line 46-49: 返回指定群组的直接子节点
return allNodes.filter(node =>
  'groupId' in node && (node as Node).groupId === targetGroupId
);
```

**输出**：
```typescript
targetNodes = [
  { id: 'node1', type: 'node', groupId: 'group_xxx', position: {...} },
  { id: 'groupB', type: 'group', groupId: 'group_xxx', position: {...} },
  { id: 'node3', type: 'node', groupId: 'group_xxx', position: {...} }
]
```

**问题点**：
- 如果显示 6 个节点，说明实际有 6 个节点的 `groupId === targetGroupId`
- 需要通过日志确认是否有重复数据

---

### 步骤 4：获取父群组信息

**位置**：`GridCenterLayoutStrategy.ts:219-226`

**执行逻辑**：
```typescript
const parentGroup = nodes.find(n =>
  n.id === options.targetGroupId && n.type === BlockEnum.GROUP
) as Group | undefined;

if (!parentGroup) {
  throw new Error(`目标群组 ${options.targetGroupId} 不存在`);
}
```

**输出**：
```typescript
parentGroup = {
  id: 'group_xxx',
  type: 'group',
  position: { x: -819, y: 795 },  // 画布绝对坐标
  width: 600,
  height: 500,
  // ...
}
```

---

### 步骤 5：打印日志（新增）

**位置**：`GridCenterLayoutStrategy.ts:227-235`

**日志内容**：
```
📐 对群组 group_xxx 内的 N 个子节点进行布局
  └─ 目标节点详情:
     [0] id=node1..., type=node, groupId=group_xxx..., 旧位置=(X, Y)
     [1] id=groupB..., type=group, groupId=group_xxx..., 旧位置=(X, Y)
     ...
```

**作用**：
- 确认目标节点数量
- 确认是否有重复节点
- 记录旧位置，用于对比变化

---

### 步骤 6：构建网格参数

**位置**：`GridCenterLayoutStrategy.ts:238-244`

**执行逻辑**：
```typescript
const gridOptions = {
  rows: Math.ceil(targetNodes.length / GRID_LAYOUT.NODES_PER_ROW),  // 行数
  cols: GRID_LAYOUT.NODES_PER_ROW,                                   // 2
  spacing: options?.gridSpacing || LAYOUT_CONFIG.layoutAlgorithm.gridSpacing,
  horizontalSpacing: GRID_LAYOUT.HORIZONTAL_SPACING,  // 400
  verticalSpacing: GRID_LAYOUT.VERTICAL_SPACING       // 320
};
```

**示例**（3个节点）：
```typescript
gridOptions = {
  rows: 2,      // ceil(3/2) = 2
  cols: 2,
  spacing: 20,
  horizontalSpacing: 400,
  verticalSpacing: 320
}
```

---

### 步骤 7：`calculateGridCenterPositions` - 计算相对布局

**位置**：`GridCenterLayoutStrategy.ts:505-542`

**输入**：
- `targetNodes`: 3个节点
- `gridOptions`: 上一步的参数

**执行逻辑**：
```typescript
// 1. 计算网格总尺寸
gridWidth = (cols - 1) * horizontalSpacing + cols * nodeWidth
          = 1 * 400 + 2 * 350
          = 1100

gridHeight = (rows - 1) * verticalSpacing + rows * nodeHeight
           = 1 * 320 + 2 * 280
           = 880

// 2. 计算偏移量（使网格中心对齐原点）
offsetX = -gridWidth / 2 = -550
offsetY = -gridHeight / 2 = -440

// 3. 计算每个节点的相对位置
节点0 (row=0, col=0):
  x = offsetX + col * (nodeWidth + horizontalSpacing) + nodeWidth/2
    = -550 + 0 * 750 + 175
    = -375
  y = offsetY + row * (nodeHeight + verticalSpacing) + nodeHeight/2
    = -440 + 0 * 600 + 140
    = -300

节点1 (row=0, col=1):
  x = -550 + 1 * 750 + 175 = 375
  y = -440 + 0 * 600 + 140 = -300

节点2 (row=1, col=0):
  x = -550 + 0 * 750 + 175 = -375
  y = -440 + 1 * 600 + 140 = 300
```

**输出**（相对于原点(0,0)的坐标）：
```typescript
relativePositionedNodes = [
  { id: 'node1', position: { x: -375, y: -300 } },
  { id: 'node2', position: { x: 375, y: -300 } },
  { id: 'node3', position: { x: -375, y: 300 } }
]
```

**坐标系特征**：
- 中心对齐：网格中心在 (0, 0)
- 跨越四个象限
- **这是临时的相对坐标，还不是最终位置**

---

### 步骤 8：计算网格边界框

**位置**：`GridCenterLayoutStrategy.ts:246-258`

**执行逻辑**：
```typescript
// 遍历每个节点，找出边界
节点0:
  左边界 = position.x - nodeWidth/2 = -375 - 175 = -550
  上边界 = position.y - nodeHeight/2 = -300 - 140 = -440

节点1:
  左边界 = 375 - 175 = 200
  上边界 = -300 - 140 = -440

节点2:
  左边界 = -375 - 175 = -550
  上边界 = 300 - 140 = 160

// 取最小值
minX = min(-550, 200, -550) = -550
minY = min(-440, -440, 160) = -440
```

**输出**：
```typescript
minX = -550
minY = -440
```

**含义**：网格的左上角在相对坐标系的 **(-550, -440)** 位置。

**日志**：
```
└─ 网格边界左上角: (-550, -440)
```

---

### 步骤 9：计算第四象限偏移量

**位置**：`GridCenterLayoutStrategy.ts:251-258`

**执行逻辑**：
```typescript
offsetToQuadrant = {
  x: -minX = -(-550) = 550,
  y: -minY = -(-440) = 440
}
```

**数学验证**：
```typescript
// 应用偏移后，节点0的位置
x' = -375 + 550 = 175  // ✅ 正数
y' = -300 + 440 = 140  // ✅ 正数

// 应用偏移后，网格左上角
minX' = -550 + 550 = 0  // ✅ 对齐到(0,0)
minY' = -440 + 440 = 0  // ✅ 对齐到(0,0)
```

**输出**：
```typescript
offsetToQuadrant = { x: 550, y: 440 }
```

**日志**：
```
└─ 移到第四象限偏移: (550, 440)
```

**含义**：将网格左上角从 (-550, -440) 移动到 (0, 0)。

---

### 步骤 10：确定父群组内的固定原点

**位置**：`GridCenterLayoutStrategy.ts:260-265`

**执行逻辑**：
```typescript
const padding = LAYOUT_CONFIG.group;
// padding = { paddingLeft: 20, paddingTop: 40, ... }

const originX = parentGroup.position.x + padding.paddingLeft;
              = -819 + 20
              = -799

const originY = parentGroup.position.y + padding.paddingTop;
              = 795 + 40
              = 835
```

**输出**：
```typescript
originX = -799
originY = 835
```

**日志**：
```
└─ 固定原点（父节点左上角+padding）: (-799, 835)
```

**坐标系说明**：
- `originX, originY` 是**画布绝对坐标系**中的位置
- 表示父群组内容区域的左上角（加上 padding 后）
- **这是所有子节点布局的起始点**

**为什么是负数**：
- 父群组 GroupA 本身在画布负坐标区域（x = -819）
- 这是正常的，不是错误

---

### 步骤 11：转换为画布绝对坐标

**位置**：`GridCenterLayoutStrategy.ts:268-274`

**执行逻辑**：
```typescript
const positionedTargetNodes = relativePositionedNodes.map(node => ({
  ...node,
  position: {
    x: originX + node.position.x + offsetToQuadrant.x,
    y: originY + node.position.y + offsetToQuadrant.y
  }
}));
```

**公式分解**：
```
finalX = originX + relativeX + offsetToQuadrant.x
       = (parentX + paddingLeft) + relativeX + (-minX)
```

**计算每个节点的最终位置**：

**节点0**：
```typescript
x = originX + relativeX + offsetToQuadrant.x
  = -799 + (-375) + 550
  = -799 - 375 + 550
  = -624

y = originY + relativeY + offsetToQuadrant.y
  = 835 + (-300) + 440
  = 835 - 300 + 440
  = 975
```

**节点1**：
```typescript
x = -799 + 375 + 550 = 126
y = 835 + (-300) + 440 = 975
```

**节点2**：
```typescript
x = -799 + (-375) + 550 = -624
y = 835 + 300 + 440 = 1575
```

**输出**（画布绝对坐标）：
```typescript
positionedTargetNodes = [
  { id: 'node1', position: { x: -624, y: 975 } },
  { id: 'node2', position: { x: 126, y: 975 } },
  { id: 'node3', position: { x: -624, y: 1575 } }
]
```

**日志**：
```
└─ 第一个节点最终位置: (-624, 975)
```

**物理含义**：
- 节点0距离内容区域左边界：`relativeX + offsetToQuadrant.x = -375 + 550 = 175px`
- 节点0距离内容区域上边界：`relativeY + offsetToQuadrant.y = -300 + 440 = 140px`
- 这些偏移都是**正数**（第四象限）✅
- 最终的画布坐标是负数，因为 `originX = -799` 是负数

---

### 步骤 12：打印位置变化（新增）

**位置**：`GridCenterLayoutStrategy.ts:279-285`

**执行逻辑**：
```typescript
const oldNode = targetNodes[0];
const newNode = positionedTargetNodes[0];
const deltaX = newNode.position.x - oldNode.position.x;
const deltaY = newNode.position.y - oldNode.position.y;
```

**示例**：
假设节点0的旧位置是 `(-700, 900)`：
```typescript
deltaX = -624 - (-700) = 76
deltaY = 975 - 900 = 75
```

**日志**：
```
└─ 第一个节点位置变化: Δx=76, Δy=75
```

**作用**：
- 确认节点位置确实发生了变化
- 如果 Δx ≈ 0 且 Δy ≈ 0，说明旧位置和新位置相同，视觉上看不出变化

---

### 步骤 13：`resolveCollisions` - 碰撞检测

**位置**：`GridCenterLayoutStrategy.ts:547-629`

**输入**：`positionedTargetNodes`（3个节点的新位置）

**执行逻辑**：
1. 检测节点之间是否有重叠
2. 如果有重叠，计算 MTV（最小平移向量）
3. 应用排斥力，将节点推开
4. 迭代多次直到没有碰撞或达到最大迭代次数

**输出**：
```typescript
resolvedTargetNodes = [
  { id: 'node1', position: { x: -624 + δx1, y: 975 + δy1 } },
  { id: 'node2', position: { x: 126 + δx2, y: 975 + δy2 } },
  { id: 'node3', position: { x: -624 + δx3, y: 1575 + δy3 } }
]
```

**注意**：
- 如果节点间距足够大，位置可能不变
- 如果有碰撞，位置会被微调

---

### 步骤 14：合并节点数据

**位置**：`GridCenterLayoutStrategy.ts:291-299`

**执行逻辑**：
```typescript
const positionedNodes = nodes.map(node => {
  // 如果是目标群组的直接子节点
  if ('groupId' in node && (node as Node).groupId === options.targetGroupId) {
    const layoutNode = resolvedTargetNodes.find(n => n.id === node.id);
    if (layoutNode) {
      // 使用新位置
      return { ...node, position: layoutNode.position };
    }
  }
  // 其他节点保持原位置
  return node;
});
```

**输入**：
- `nodes`: 所有节点（原始数据）
- `resolvedTargetNodes`: 3个布局后的节点

**输出**：
```typescript
positionedNodes = [
  // 顶层节点（位置不变）
  { id: 'topNode1', position: { x: 100, y: 200 } },

  // GroupA 的子节点（新位置）✨
  { id: 'node1', groupId: 'groupA', position: { x: -624, y: 975 } },  // 新
  { id: 'groupB', groupId: 'groupA', position: { x: 126, y: 975 } },  // 新
  { id: 'node3', groupId: 'groupA', position: { x: -624, y: 1575 } }, // 新

  // GroupB 的子节点（位置不变）⚠️
  { id: 'nodeC', groupId: 'groupB', position: { x: 500, y: 1100 } },  // 旧位置

  // 其他节点（位置不变）
  ...
]
```

**关键点**：
- ✅ 目标子节点（node1, groupB, node3）使用新位置
- ❌ GroupB 的子节点（nodeC）仍然使用旧的绝对位置
- **问题**：NodeC 的位置是基于 GroupB 的旧位置计算的！

---

### 步骤 15：`updateNestedNodePositions` - 更新嵌套节点位置 🔧

**位置**：`GridCenterLayoutStrategy.ts:671-725`

**输入**：
- `originalNodes = nodes`: 原始所有节点
- `positionedNodes`: 包含3个新位置的节点数组
- `layoutedNodeIds = Set(['node1', 'groupB', 'node3'])`: 🔧 **新增参数**

**执行逻辑**：

```typescript
// 1. 找出顶层节点
const topLevelNodes = positionedNodes.filter(node =>
  !('groupId' in node) || !node.groupId
);

// 2. 创建映射
const originalNodeMap = new Map(originalNodes.map(node => [node.id, node]));
const positionedNodeMap = new Map(positionedNodes.map(node => [node.id, node]));

// 3. 找出所有嵌套节点
const nestedNodes = originalNodes.filter(node =>
  'groupId' in node && node.groupId
);
// nestedNodes = [node1, groupB, node3, nodeC, ...]

// 4. 遍历每个嵌套节点
for (const nestedNode of nestedNodes) {
  // 🔧 关键修复：检查是否刚被布局
  if (layoutedNodeIds && layoutedNodeIds.has(nestedNode.id)) {
    const layoutedNode = positionedNodeMap.get(nestedNode.id);
    if (layoutedNode) {
      resultNodes.push(layoutedNode);  // 直接使用新位置
      continue;  // 跳过重新计算
    }
  }

  // 否则，计算相对位置
  const absolutePosition = this.calculateAbsolutePosition(
    nestedNode,
    originalNodeMap,
    positionedNodeMap
  );

  resultNodes.push({
    ...nestedNode,
    position: absolutePosition
  });
}
```

**详细分析**：

**对于 node1**（刚被布局）：
```typescript
layoutedNodeIds.has('node1') = true  // ✅
→ 直接使用 positionedNodeMap.get('node1')
→ position = { x: -624, y: 975 }  // ✅ 新位置
```

**对于 groupB**（刚被布局）：
```typescript
layoutedNodeIds.has('groupB') = true  // ✅
→ 直接使用 positionedNodeMap.get('groupB')
→ position = { x: 126, y: 975 }  // ✅ 新位置
```

**对于 nodeC**（GroupB 的子节点，未被布局）：
```typescript
layoutedNodeIds.has('nodeC') = false  // ❌
→ 调用 calculateAbsolutePosition(nodeC, ...)
```

**`calculateAbsolutePosition` 计算 NodeC 的新位置**：

```typescript
// Line 720-723: nodeC 有 groupId
if (!('groupId' in node) || !node.groupId) {
  // 跳过
}

// Line 726-727: 获取父群组
const positionedParentGroup = positionedNodeMap.get(node.groupId);
// → positionedParentGroup = groupB 的新位置 { x: 126, y: 975 }

const originalParentGroup = originalNodeMap.get(node.groupId);
// → originalParentGroup = groupB 的旧位置 { x: 100, y: 950 }

// Line 734-736: 计算相对位置
const relativeX = node.position.x - originalParentGroup.position.x;
                = 500 - 100 = 400
const relativeY = node.position.y - originalParentGroup.position.y;
                = 1100 - 950 = 150

// Line 739-744: 返回新的绝对位置
if (positionedParentGroup) {
  return {
    x: positionedParentGroup.position.x + relativeX,
       = 126 + 400 = 526  // ✅ 新位置
    y: positionedParentGroup.position.y + relativeY
       = 975 + 150 = 1125  // ✅ 新位置
  };
}
```

**输出**：
```typescript
finalNodes = [
  // 顶层节点
  { id: 'topNode1', position: { x: 100, y: 200 } },

  // GroupA 的子节点（新位置）
  { id: 'node1', position: { x: -624, y: 975 } },   // ✅ 新
  { id: 'groupB', position: { x: 126, y: 975 } },   // ✅ 新
  { id: 'node3', position: { x: -624, y: 1575 } },  // ✅ 新

  // GroupB 的子节点（跟随 GroupB 移动）
  { id: 'nodeC', position: { x: 526, y: 1125 } },   // ✅ 新（跟随）

  ...
]
```

**关键修复**：
- ✅ 刚布局的节点（node1, groupB, node3）直接使用新位置
- ✅ 未布局的嵌套节点（nodeC）根据父节点的新位置计算相对位置
- ✅ NodeC 跟随 GroupB 移动，保持相对位置不变

**日志**：
```
└─ 已布局节点数量: 3
```

---

### 步骤 16：`adjustNestedNodesWithinBounds` - 约束边界 🔧

**位置**：`GridCenterLayoutStrategy.ts:801-912`

**输入**：`finalNodes`（所有节点，包含新位置）

**执行逻辑**：

```typescript
let resultNodes = [...finalNodes];
let hasChanges = true;
let iterations = 0;

while (hasChanges && iterations < 10) {
  hasChanges = false;

  // 🔧 记录位置变化
  const positionDeltas = new Map<string, { dx: number; dy: number }>();

  // 遍历每个节点，检查是否在父群组边界内
  resultNodes = currentNodes.map(node => {
    if ('groupId' in node && node.groupId) {
      const parentGroup = nodeMap.get(node.groupId);

      // 计算安全区域
      const safeArea = {
        minX: marginX,
        minY: marginY,
        maxX: groupWidth - nodeWidth - marginX,
        maxY: groupHeight - nodeHeight - marginY
      };

      // 约束节点在安全区域内
      if (currentRelativeX < safeArea.minX) {
        adjustedRelativeX = safeArea.minX;
        hasChanges = true;
      }
      // ... 其他边界检查

      // 如果位置需要调整
      if (adjustedRelativeX !== currentRelativeX || adjustedRelativeY !== currentRelativeY) {
        const newX = parentGroup.position.x + adjustedRelativeX;
        const newY = parentGroup.position.y + adjustedRelativeY;

        // 🔧 记录位置变化
        const dx = newX - node.position.x;
        const dy = newY - node.position.y;
        positionDeltas.set(node.id, { dx, dy });

        return { ...node, position: { x: newX, y: newY } };
      }
    }
    return node;
  });

  // 🔧 关键修复：将位置变化应用到所有子节点
  if (positionDeltas.size > 0) {
    resultNodes = resultNodes.map(node => {
      if ('groupId' in node && node.groupId) {
        const parentDelta = positionDeltas.get(node.groupId);
        if (parentDelta) {
          // 子节点同步移动
          return {
            ...node,
            position: {
              x: node.position.x + parentDelta.dx,
              y: node.position.y + parentDelta.dy
            }
          };
        }
      }
      return node;
    });
  }

  iterations++;
}

return resultNodes;
```

**示例场景**：

假设 GroupB 被调整了位置：
```typescript
// 调整前
groupB.position = { x: 126, y: 975 }

// 约束后
groupB.position = { x: 150, y: 1000 }

// 计算 delta
dx = 150 - 126 = 24
dy = 1000 - 975 = 25

// 存储
positionDeltas.set('groupB', { dx: 24, dy: 25 })
```

应用到 NodeC：
```typescript
// NodeC 调整前
nodeC.position = { x: 526, y: 1125 }
nodeC.groupId = 'groupB'

// 获取父节点的 delta
parentDelta = positionDeltas.get('groupB') = { dx: 24, dy: 25 }

// 同步移动
nodeC.position = {
  x: 526 + 24 = 550,
  y: 1125 + 25 = 1150
}
```

**输出**：
```typescript
adjustedNodes = [
  // GroupB（位置被调整）
  { id: 'groupB', position: { x: 150, y: 1000 } },

  // NodeC（跟随 GroupB 移动）✅
  { id: 'nodeC', position: { x: 550, y: 1150 } },

  ...
]
```

**关键修复**：
- ✅ 当 GroupB 位置被调整时，计算 delta (dx, dy)
- ✅ 将 delta 应用到 NodeC，使其同步移动
- ✅ 保持 GroupB 和 NodeC 的相对位置不变

---

### 步骤 17：优化边连接点

**位置**：`GridCenterLayoutStrategy.ts:308`

**执行逻辑**：
```typescript
const optimizedEdges = this.edgeOptimizer.optimizeEdgeHandles(finalNodes, edges);
```

**作用**：
- 根据节点的最终位置
- 计算边的最佳连接点（sourceHandle, targetHandle）
- 确保边的连接点在节点的合适位置

---

### 步骤 18：返回 LayoutResult

**位置**：`GridCenterLayoutStrategy.ts:312-330`

**输出**：
```typescript
return {
  success: true,
  nodes: new Map([
    ['node1', { x: -624, y: 975 }],
    ['groupB', { x: 150, y: 1000 }],
    ['node3', { x: -624, y: 1575 }],
    ['nodeC', { x: 550, y: 1150 }],
    ...
  ]),
  edges: new Map([
    ['edge1', { sourceHandle: 'right', targetHandle: 'left', ... }],
    ...
  ]),
  errors: [],
  stats: {
    duration: 50,
    iterations: 1,
    collisions: 0
  }
};
```

---

### 步骤 19：更新 Zustand Store

**位置**：`LayoutControl.tsx:170-181`

**执行逻辑**：
```typescript
// 更新节点位置
for (const [nodeId, position] of layoutResult.nodes) {
  updateNode(nodeId, { position });
}

// 更新边的连接点
layoutResult.edges.forEach((edgeData, edgeId) => {
  updateEdge(edgeId, {
    sourceHandle: edgeData.sourceHandle,
    targetHandle: edgeData.targetHandle
  });
});
```

**作用**：
- 将布局结果写入 Zustand store
- 触发 React 组件重新渲染

---

### 步骤 20：触发群组边界更新

**位置**：`LayoutControl.tsx:186-187`

**执行逻辑**：
```typescript
updateGroupBoundary(selectedNodeId);
```

**作用**：
- 根据子节点的新位置
- 重新计算父群组的边界和大小
- 确保父群组能够包含所有子节点

---

### 步骤 21：前端重新渲染

**ReactFlow 组件接收更新**：
- Zustand store 的变化触发 React 组件 re-render
- ReactFlow 根据新的节点位置渲染节点
- 用户看到节点移动到新位置

---

## 🔍 关键数据流总结

### 坐标变换链路

```
1. 原始位置（画布绝对坐标）
   node1: { x: -700, y: 900 }
   ↓
2. calculateGridCenterPositions（相对于原点）
   node1: { x: -375, y: -300 }  // 居中对齐
   ↓
3. 计算边界框
   minX = -550, minY = -440
   ↓
4. 第四象限偏移
   offsetToQuadrant = { x: 550, y: 440 }
   相对坐标 = { x: -375 + 550 = 175, y: -300 + 440 = 140 }
   ↓
5. 固定原点（父群组左上角 + padding）
   origin = { x: -799, y: 835 }
   ↓
6. 最终绝对坐标
   finalPosition = origin + 相对坐标
                 = { x: -799 + 175 = -624, y: 835 + 140 = 975 }
   ↓
7. resolveCollisions（碰撞检测微调）
   可能不变，或微调几个像素
   ↓
8. updateNestedNodePositions（处理嵌套节点）
   - 刚布局的节点：直接使用新位置（layoutedNodeIds）
   - 未布局的节点：根据父节点新位置计算
   ↓
9. adjustNestedNodesWithinBounds（边界约束）
   - 约束节点在父群组边界内
   - 子节点跟随父节点移动（positionDeltas）
   ↓
10. 最终位置（返回给前端）
```

---

## 🐛 潜在问题点分析

### 问题1：节点数量显示6个而非3个

**可能原因**：
1. **数据重复**：`allNodes` 数组中同一个节点出现2次
2. **实际有6个子节点**：用户记错了子节点数量
3. **筛选逻辑错误**：`getTargetNodes` 筛选出了不应该包含的节点

**排查方法**：
- 查看日志：`└─ 目标节点详情`（line 230-235）
- 检查每个节点的 id 是否重复

### 问题2：所有节点重叠在中心

**可能原因**：
1. **`adjustNestedNodesWithinBounds` 迭代问题**：
   - 多次迭代导致节点被挤压到同一位置
   - 需要检查 `safeArea` 计算是否正确

2. **坐标变换错误**：
   - `offsetToQuadrant` 计算错误
   - `originX, originY` 计算错误

3. **`calculateGridCenterPositions` 参数错误**：
   - `horizontalSpacing` 或 `verticalSpacing` 为 0
   - `nodeWidth` 或 `nodeHeight` 为 0

**排查方法**：
- 查看日志：各步骤的坐标值
- 添加断点调试 `adjustNestedNodesWithinBounds`

### 问题3：GroupB 和 NodeC 没有保持相对位置

**原因**：
- ❌ **旧代码**：`updateNestedNodePositions` 使用原始位置覆盖新位置
- ❌ **旧代码**：`adjustNestedNodesWithinBounds` 调整节点位置但子节点不跟随

**修复**：
- ✅ **新代码**：传递 `layoutedNodeIds`，跳过重新计算
- ✅ **新代码**：使用 `positionDeltas` 同步移动子节点

---

## 📊 修复效果验证

### 预期行为

1. **节点数量正确**：
   - 日志显示的节点数量与实际子节点数量一致
   - 没有重复节点

2. **位置正确变化**：
   - 日志显示 `Δx` 和 `Δy` 不为 0
   - 前端显示节点移动到新位置

3. **嵌套节点跟随**：
   - GroupB 移动时，NodeC 跟随移动
   - 相对位置保持不变

4. **节点分布合理**：
   - 节点按网格排列，间距均匀
   - 不会重叠在中心

---

## 🔧 调试建议

### 添加更多日志

在关键步骤添加日志：

```typescript
// 步骤8 后
console.log('边界框:', { minX, minY });

// 步骤9 后
console.log('第四象限偏移:', offsetToQuadrant);

// 步骤11 后
console.log('前3个节点最终位置:');
positionedTargetNodes.slice(0, 3).forEach((n, i) => {
  console.log(`  [${i}] ${n.id}: (${n.position.x}, ${n.position.y})`);
});

// 步骤15 后
console.log('updateNestedNodePositions 完成，节点数量:', finalNodes.length);

// 步骤16 后
console.log('adjustNestedNodesWithinBounds 完成，调整次数:', iterations);
console.log('位置变化记录:', positionDeltas);
```

### 使用浏览器调试

1. 在 `GridCenterLayoutStrategy.ts:227` 设置断点
2. 点击"布局群组内部"按钮
3. 单步调试，查看每个变量的值
4. 特别关注：
   - `targetNodes.length`
   - `positionedTargetNodes[0].position`
   - `layoutedNodeIds`
   - `positionDeltas`

---

## ✅ 修复总结

### 已修复的问题

1. **位置被覆盖** → 传递 `layoutedNodeIds`，跳过重新计算
2. **子节点不跟随** → 使用 `positionDeltas` 同步移动子节点
3. **详细日志** → 添加节点详情和位置变化日志

### 待确认的问题

1. **节点数量** → 需要查看实际日志确认
2. **节点重叠** → 需要测试验证是否仍然存在

### 核心修复

**修复1**：`layoutedNodeIds` 参数
- 防止刚计算的新位置被旧位置覆盖

**修复2**：`positionDeltas` 同步机制
- 确保子节点跟随父节点移动

这两个修复确保了**父子节点的相对位置始终保持不变**。
