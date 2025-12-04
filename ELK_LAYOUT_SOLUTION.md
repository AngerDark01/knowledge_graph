# ELK布局问题分析与解决方案

## 📋 问题总结

根据你的反馈，当前ELK集成存在以下问题：

### 问题1：三个按钮功能相同 ❌
- **现状**：全局布局、群组内布局、递归布局三个按钮都触发同一个ELK算法
- **期望**：
  1. **全局布局**：针对所有节点包括嵌套结构的布局
  2. **群组内布局**：只影响选中容器内部的节点（包括嵌套结构）

### 问题2：边界问题（之前已解决，现在又出现）❌
- **节点重叠**：布局后节点有重叠情况
- **容器边界不更新**：group节点不会随着子节点的布局调整大小
- **子节点溢出**：子节点出现在容器外部

### 问题3：布局质量问题 ⚠️
- 感觉当前算法没有结合边和节点的大小进行布局
- 目前是无向的，是否应该改成有向图

---

## 🔍 深度代码分析

### 分析1：三个按钮为什么功能相同？

**当前代码（LayoutControl.tsx）：**

```typescript
// Line 50-56: handleLayout (全局布局)
const layoutResult = await layoutManager.applyLayout(nodes, edges, {
  animate: true,
  strategy: 'elk-layout'  // ✅ 传入所有节点
});

// Line 159-165: handleGroupLayout (群组布局)
const layoutResult = await layoutManager.applyLayout(nodes, edges, {
  animate: true,
  strategy: 'elk-layout'  // ❌ 也是传入所有节点！
});

// Line 264-270: handleRecursiveLayout (递归布局)
const layoutResult = await layoutManager.applyLayout(nodes, edges, {
  animate: true,
  strategy: 'elk-layout'  // ❌ 也是传入所有节点！
});
```

**根本原因**：
- 三个函数都将 **所有节点 (nodes)** 和 **所有边 (edges)** 传递给布局管理器
- 没有区分布局范围，ELK每次都对整个图进行布局
- 缺少 **子图提取** 逻辑

---

### 分析2：容器边界为什么不更新？

**当前代码（ELKGraphConverter.ts）：**

```typescript
// Line 144-154: fromELKLayout方法
static fromELKLayout(elkLayout: ElkNode): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  this.extractPositions(elkLayout, positions, 0, 0);
  return positions;  // ❌ 只返回了 {x, y}，丢弃了width和height！
}

// Line 165-201: extractPositions方法
private static extractPositions(...) {
  const absoluteX = parentX + (elkNode.x || 0);
  const absoluteY = parentY + (elkNode.y || 0);

  // ❌ 只保存了位置
  positions.set(elkNode.id, { x: absoluteX, y: absoluteY });

  // 🚨 ELK计算的width和height被忽略了！
  // elkNode.width 和 elkNode.height 包含了正确的容器尺寸
}
```

**ELK的工作机制（根据文档）：**
1. ELK接收到包含子节点的群组时，会**自动计算**群组的width和height
2. 计算的尺寸会包裹所有子节点 + padding
3. 这些信息在 `elkNode.width` 和 `elkNode.height` 中返回

**Mermaid的处理方式（参考）：**
```typescript
// Mermaid会提取width和height
offsets[child.id] = {
  posX: child.x + childOffsetX,
  posY: child.y + childOffsetY,
  width: child.width,   // ✅ 提取宽度
  height: child.height  // ✅ 提取高度
};
```

**根本原因**：
- ELK **确实计算了**正确的群组尺寸
- 但 `fromELKLayout` 方法 **丢弃了** width和height信息
- 导致群组的边界没有更新，子节点看起来"溢出"了

---

### 分析3：为什么节点会重叠？

**当前配置（ELKGraphConverter.ts Line 206-218）：**

```typescript
private static getDefaultLayoutOptions(options?: LayoutOptions): Record<string, any> {
  return {
    'elk.algorithm': 'layered',
    'elk.direction': 'DOWN',
    'elk.spacing.nodeNode': 80,                              // ✅ 已配置
    'elk.layered.spacing.nodeNodeBetweenLayers': 100,       // ✅ 已配置
    'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
    'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
    'elk.layered.crossingMinimization.semiInteractive': true,

    // ❌ 缺失的关键配置：
    // 'elk.spacing.edgeNode': 边与节点的间距
    // 'elk.edgeRouting': 边的路由方式
    // 'elk.separateConnectedComponents': 是否分离独立组件
  };
}
```

**ELK官方推荐配置（针对知识图谱）：**

根据ELK文档和Mermaid实践，完整配置应包括：

| 配置项 | 当前值 | 推荐值 | 说明 |
|--------|--------|--------|------|
| `elk.spacing.nodeNode` | 80 | 80 | 同层节点间距 ✅ |
| `elk.layered.spacing.nodeNodeBetweenLayers` | 100 | 100 | 层间节点间距 ✅ |
| `elk.spacing.edgeNode` | ❌ 未设置 | 15 | 边与节点的间距 |
| `elk.spacing.edgeEdge` | ❌ 未设置 | 10 | 边与边的间距 |
| `elk.layered.spacing.edgeNodeBetweenLayers` | ❌ 未设置 | 15 | 层间边节点间距 |
| `elk.edgeRouting` | ❌ 未设置 | ORTHOGONAL | 正交路由 |
| `elk.separateConnectedComponents` | ❌ 未设置 | true | 分离独立组件 |
| `elk.spacing.componentComponent` | ❌ 未设置 | 50 | 组件间距 |

**根本原因**：
- 缺少 **边与节点的间距** 配置，导致边可能与节点重叠
- 没有配置 **边路由方式**，ELK可能使用默认的简单路由
- 节点尺寸可能传递不准确（需要验证）

---

### 分析4：是否应该改成有向图？

**当前实现**：
- 使用 `elk.algorithm: 'layered'` ✅（layered专为有向图设计）
- 使用 `elk.direction: 'DOWN'` ✅（从上到下）
- 但 **没有明确配置边的方向性**

**知识图谱的特性**：
- 边通常有方向（A → B 表示关系）
- 需要区分源节点和目标节点
- 应该使用有向图算法

**Edge数据模型（models.ts）**：
```typescript
export interface Edge {
  source: string;  // ✅ 有source
  target: string;  // ✅ 有target
  data?: {
    direction?: 'unidirectional' | 'bidirectional' | 'undirected';
  };
}
```

**ELK的处理**：
- ELK的 `layered` 算法本身就是为有向图设计的
- 边会自动从source指向target
- 但可以通过配置优化有向图的布局质量

**建议配置**：
```typescript
{
  'elk.algorithm': 'layered',  // ✅ 已正确
  'elk.direction': 'DOWN',     // ✅ 已正确

  // 新增：优化有向图布局
  'elk.layered.cycleBreaking.strategy': 'GREEDY',  // 处理循环引用
  'elk.layered.considerModelOrder.strategy': 'PREFER_EDGES',  // 优先考虑边的方向
  'elk.layered.layering.strategy': 'NETWORK_SIMPLEX',  // 最优分层
}
```

**结论**：
- 当前 **已经是** 有向图配置（使用layered算法）
- 但可以通过额外配置 **优化** 有向图的布局质量
- 如果有双向边或无向边，可以通过edge.data.direction区分

---

## 💡 解决方案

### 方案1：实现真正的群组布局（解决问题1）

**目标**：群组布局只影响选中容器内部的节点

**实现策略**：
1. 提取目标群组及其所有子孙节点（递归）
2. 提取群组内部的边（只包括source和target都在群组内的边）
3. 创建最小化的ELK子图
4. 布局完成后，只更新这些节点的位置，其他节点保持不变

**参考Mermaid和elkjs Issue #100**：
- elkjs不支持增量布局，需要手动提取子图

**代码修改点**：

#### 1.1 修改LayoutOptions类型，增加布局范围参数

```typescript
// src/services/layout/types/layoutTypes.ts
export interface LayoutOptions {
  animate?: boolean;
  strategy?: string;
  elkOptions?: Record<string, any>;

  // 新增：布局范围
  scope?: 'global' | 'group';  // 全局 or 群组
  targetGroupId?: string;      // 如果scope=group，指定目标群组ID
}
```

#### 1.2 在ELKLayoutStrategy中实现子图提取

```typescript
// src/services/layout/strategies/ELKLayoutStrategy.ts

async applyLayout(
  nodes: (Node | Group)[],
  edges: Edge[],
  options?: LayoutOptions
): Promise<LayoutResult> {
  // 根据scope决定布局范围
  let nodesToLayout: (Node | Group)[];
  let edgesToLayout: Edge[];

  if (options?.scope === 'group' && options.targetGroupId) {
    // 群组布局：提取子图
    const subgraph = this.extractSubgraph(
      nodes,
      edges,
      options.targetGroupId
    );
    nodesToLayout = subgraph.nodes;
    edgesToLayout = subgraph.edges;
  } else {
    // 全局布局：使用所有节点
    nodesToLayout = nodes;
    edgesToLayout = edges;
  }

  // 转换为ELK图并布局
  const elkGraph = ELKGraphConverter.toELKGraph(nodesToLayout, edgesToLayout, options);
  const elkLayout = await this.elk.layout(elkGraph);

  // 提取位置和尺寸
  const result = ELKGraphConverter.fromELKLayout(elkLayout);

  return result;
}

/**
 * 提取子图：包含目标群组及其所有子孙节点
 */
private extractSubgraph(
  allNodes: (Node | Group)[],
  allEdges: Edge[],
  targetGroupId: string
): { nodes: (Node | Group)[]; edges: Edge[] } {
  // 1. 找到目标群组
  const targetGroup = allNodes.find(n => n.id === targetGroupId);
  if (!targetGroup || targetGroup.type !== 'group') {
    throw new Error(`Group ${targetGroupId} not found`);
  }

  // 2. 递归收集所有子孙节点ID
  const nodeIdsInGroup = new Set<string>();
  nodeIdsInGroup.add(targetGroupId);  // 包含群组本身

  const collectChildren = (groupId: string) => {
    allNodes.forEach(node => {
      if ('groupId' in node && node.groupId === groupId) {
        nodeIdsInGroup.add(node.id);
        if (node.type === 'group') {
          collectChildren(node.id);  // 递归收集嵌套群组的子节点
        }
      }
    });
  };

  collectChildren(targetGroupId);

  // 3. 过滤节点
  const nodes = allNodes.filter(n => nodeIdsInGroup.has(n.id));

  // 4. 过滤边（只包括两端都在群组内的边）
  const edges = allEdges.filter(e =>
    nodeIdsInGroup.has(e.source) && nodeIdsInGroup.has(e.target)
  );

  console.log(`📦 提取子图: ${nodes.length} 个节点, ${edges.length} 条边`);

  return { nodes, edges };
}
```

#### 1.3 修改LayoutControl.tsx中的调用

```typescript
// src/components/graph/controls/LayoutControl.tsx

// 全局布局：保持不变
const handleLayout = async () => {
  const layoutResult = await layoutManager.applyLayout(nodes, edges, {
    animate: true,
    strategy: 'elk-layout',
    scope: 'global'  // 明确指定全局布局
  });
};

// 群组布局：指定范围
const handleGroupLayout = async () => {
  const layoutResult = await layoutManager.applyLayout(nodes, edges, {
    animate: true,
    strategy: 'elk-layout',
    scope: 'group',           // 群组布局
    targetGroupId: selectedNodeId  // 目标群组ID
  });

  // ⚠️ 关键：只更新布局结果中返回的节点
  // 其他节点保持原位置不变
};
```

**预期效果**：
- ✅ 全局布局：对所有节点重新布局
- ✅ 群组布局：只对选中群组内的节点布局，其他节点保持不变
- ✅ 递归布局：可以合并到全局布局，或使用不同的hierarchyHandling策略

---

### 方案2：修复容器边界问题（解决问题2）

**目标**：ELK计算的群组尺寸能正确应用到前端

**实现策略**：
1. 修改 `fromELKLayout` 提取width和height
2. 修改 `LayoutControl` 应用尺寸更新
3. 确保传递给ELK的节点尺寸准确

#### 2.1 修改ELKGraphConverter.fromELKLayout

```typescript
// src/services/layout/utils/ELKGraphConverter.ts

/**
 * 从ELK布局结果提取节点位置和尺寸
 * ✅ 修改返回类型，包含width和height
 */
static fromELKLayout(elkLayout: ElkNode): Map<string, {
  x: number;
  y: number;
  width?: number;   // ✅ 新增
  height?: number;  // ✅ 新增
}> {
  const result = new Map();
  this.extractPositions(elkLayout, result, 0, 0);
  return result;
}

/**
 * 递归提取节点位置和尺寸
 * ✅ 修改逻辑，同时提取尺寸
 */
private static extractPositions(
  elkNode: ElkNode,
  result: Map<string, any>,
  parentX: number,
  parentY: number
): void {
  if (elkNode.id === 'root') {
    if (elkNode.children) {
      for (const child of elkNode.children) {
        this.extractPositions(child, result, 0, 0);
      }
    }
    return;
  }

  // 计算绝对坐标
  const absoluteX = parentX + (elkNode.x || 0);
  const absoluteY = parentY + (elkNode.y || 0);

  // ✅ 同时保存位置和尺寸
  const positionData: any = {
    x: absoluteX,
    y: absoluteY
  };

  // ✅ 如果ELK返回了尺寸（通常是群组节点），也保存
  if (elkNode.width !== undefined) {
    positionData.width = elkNode.width;
  }
  if (elkNode.height !== undefined) {
    positionData.height = elkNode.height;
  }

  result.set(elkNode.id, positionData);

  console.log(
    `📍 节点 ${elkNode.id.substring(0, 8)}... ` +
    `位置: (${Math.round(absoluteX)}, ${Math.round(absoluteY)}) ` +
    `${positionData.width ? `尺寸: ${Math.round(positionData.width)}x${Math.round(positionData.height)}` : ''}`
  );

  // 递归处理子节点
  if (elkNode.children && elkNode.children.length > 0) {
    for (const child of elkNode.children) {
      this.extractPositions(child, result, absoluteX, absoluteY);
    }
  }
}
```

#### 2.2 修改toELKGraph，确保节点尺寸准确

```typescript
// src/services/layout/utils/ELKGraphConverter.ts

private static buildChildren(...): ElkNode[] {
  for (const node of currentLevelNodes) {
    const elkNode: ElkNode = {
      id: node.id,
      // ✅ 使用实际尺寸，如果没有则使用默认值
      width: node.width || this.getDefaultWidth(node),
      height: node.height || this.getDefaultHeight(node)
    };

    // 如果是群组
    if (node.type === BlockEnum.GROUP) {
      const children = allNodes.filter(...);

      if (children.length > 0) {
        elkNode.children = this.buildChildren(children, allNodes, nodeMap);
        elkNode.layoutOptions = {
          'elk.padding': this.getGroupPadding(),
          'elk.hierarchyHandling': 'INCLUDE_CHILDREN',

          // ✅ 新增：允许ELK调整群组大小以适应子节点
          // 不设置fixedGraphSize，让ELK自动计算
        };
      }
    }

    elkNodes.push(elkNode);
  }

  return elkNodes;
}
```

#### 2.3 LayoutControl中应用尺寸（已经有逻辑，确保正确）

```typescript
// src/components/graph/controls/LayoutControl.tsx (Line 64-80)

// ✅ 当前代码已经有尺寸应用逻辑，只需确保fromELKLayout返回了尺寸
for (const [nodeId, positionData] of layoutResult.nodes) {
  const updateData: any = {
    position: { x: positionData.x, y: positionData.y }
  };

  // ✅ 如果有width，应用到节点
  if (positionData.width !== undefined) {
    updateData.width = positionData.width;
  }

  // ✅ 如果有height，应用到节点
  if (positionData.height !== undefined) {
    updateData.height = positionData.height;
  }

  // ✅ 同时更新style（ReactFlow需要）
  if (positionData.width || positionData.height) {
    updateData.style = {
      width: positionData.width,
      height: positionData.height
    };
  }

  updateNode(nodeId, updateData);
}
```

**预期效果**：
- ✅ 群组节点的width和height会根据子节点自动调整
- ✅ 子节点不会溢出群组边界
- ✅ 嵌套群组的尺寸会逐层正确计算

---

### 方案3：优化布局质量（解决问题3）

**目标**：
1. 减少节点重叠
2. 优化边的布局和路由
3. 确保有向图的正确配置

#### 3.1 增强ELK配置

```typescript
// src/services/layout/utils/ELKGraphConverter.ts

private static getDefaultLayoutOptions(options?: LayoutOptions): Record<string, any> {
  return {
    // ========== 核心算法 ==========
    'elk.algorithm': 'layered',  // 层次布局（适合有向图）
    'elk.direction': 'DOWN',     // 从上到下

    // ========== 层级处理 ==========
    'elk.hierarchyHandling': 'INCLUDE_CHILDREN',  // 一次性处理所有嵌套层级

    // ========== 间距配置 ==========
    'elk.spacing.nodeNode': 80,                    // 同层节点间距 ✅
    'elk.layered.spacing.nodeNodeBetweenLayers': 100,  // 层间节点间距 ✅

    // ✅ 新增：边与节点的间距
    'elk.spacing.edgeNode': 15,                    // 边与节点间距
    'elk.spacing.edgeEdge': 10,                    // 边与边间距
    'elk.layered.spacing.edgeNodeBetweenLayers': 15,  // 层间边节点间距
    'elk.layered.spacing.edgeEdgeBetweenLayers': 10,  // 层间边边间距

    // ========== 边路由 ==========
    // ✅ 新增：正交路由（直角转弯，更清晰）
    'elk.edgeRouting': 'ORTHOGONAL',
    'elk.layered.unnecessaryBendpoints': false,    // 移除不必要的拐点

    // ========== 节点放置 ==========
    'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',  // 最优节点位置 ✅
    'elk.layered.nodePlacement.bk.fixedAlignment': 'BALANCED',  // 平衡对齐

    // ========== 交叉最小化 ==========
    'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
    'elk.layered.crossingMinimization.semiInteractive': true,  // ✅

    // ========== 有向图优化 ==========
    // ✅ 新增：循环引用处理
    'elk.layered.cycleBreaking.strategy': 'GREEDY',

    // ✅ 新增：考虑边的顺序（优化有向图）
    'elk.layered.considerModelOrder.strategy': 'PREFER_EDGES',

    // ✅ 新增：最优分层策略
    'elk.layered.layering.strategy': 'NETWORK_SIMPLEX',

    // ========== 组件分离 ==========
    // ✅ 新增：分离独立的连通组件
    'elk.separateConnectedComponents': true,
    'elk.spacing.componentComponent': 50,          // 组件间距

    // ========== 性能优化 ==========
    'elk.layered.thoroughness': 7,  // 布局质量（1-10，默认7）
    'elk.layered.compaction.postCompaction.strategy': 'EDGE_LENGTH',

    // 用户自定义选项可以覆盖默认值
    ...(options?.elkOptions || {})
  };
}
```

#### 3.2 为群组提供专门的配置

```typescript
// src/services/layout/utils/ELKGraphConverter.ts

/**
 * ✅ 新增：群组专属的布局配置
 */
private static getGroupLayoutOptions(): Record<string, any> {
  return {
    'elk.padding': this.getGroupPadding(),
    'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
    'elk.algorithm': 'layered',
    'elk.direction': 'DOWN',

    // 群组内使用稍微紧凑的间距
    'elk.spacing.nodeNode': 60,
    'elk.layered.spacing.nodeNodeBetweenLayers': 80,
    'elk.spacing.edgeNode': 12,

    // 边路由
    'elk.edgeRouting': 'ORTHOGONAL',
  };
}

// 在buildChildren中使用：
if (children.length > 0) {
  elkNode.children = this.buildChildren(children, allNodes, nodeMap);
  elkNode.layoutOptions = this.getGroupLayoutOptions();  // ✅ 使用群组配置
}
```

#### 3.3 处理不同尺寸的节点

**参考Mermaid的做法**：

Mermaid会在布局前测量实际DOM尺寸：
```typescript
const boundingBox = childNodeEl.node()!.getBBox();
child.width = boundingBox.width;
child.height = boundingBox.height;
```

**对于本项目**：
- 节点尺寸已经在 `NODE_SIZES` 配置中定义
- 如果节点有动态内容，考虑在布局前测量实际尺寸
- 确保 `node.width` 和 `node.height` 准确反映节点的实际大小

```typescript
// src/services/layout/utils/ELKGraphConverter.ts

private static getDefaultWidth(node: Node | Group): number {
  if (node.type === BlockEnum.GROUP) {
    // 群组：使用配置的默认值
    return LAYOUT_CONFIG.nodeSize.groupNode.width;
  }

  // 普通节点：优先使用节点的实际width
  if (node.width) {
    return node.width;
  }

  // 如果节点是展开状态，使用展开尺寸
  if ('isExpanded' in node && node.isExpanded && 'customExpandedSize' in node) {
    return node.customExpandedSize?.width || NODE_SIZES.NOTE.EXPANDED_WIDTH;
  }

  return LAYOUT_CONFIG.nodeSize.defaultNode.width;
}
```

**预期效果**：
- ✅ 节点重叠大幅减少
- ✅ 边的路由更清晰（正交路由）
- ✅ 有向图的层次结构更明显
- ✅ 独立的子图会被分离开

---

## 📊 对比表格

### 配置对比

| 配置项 | 修改前 | 修改后 | 影响 |
|--------|--------|--------|------|
| **布局范围** | 都是全局 | 区分全局/群组 | ✅ 群组布局不影响其他节点 |
| **提取尺寸** | 只有x,y | 包含width,height | ✅ 群组边界自动调整 |
| **边节点间距** | ❌ 未设置 | 15 | ✅ 减少重叠 |
| **边路由** | ❌ 未设置 | ORTHOGONAL | ✅ 边更清晰 |
| **组件分离** | ❌ 未设置 | true | ✅ 独立子图分开 |
| **有向图优化** | 部分 | 完整 | ✅ 层次结构更明显 |

### 功能对比

| 功能 | 修改前 | 修改后 |
|------|--------|--------|
| **全局布局** | ✅ 对所有节点布局 | ✅ 对所有节点布局（不变） |
| **群组布局** | ❌ 也是全局布局 | ✅ 只对群组内节点布局 |
| **递归布局** | ❌ 也是全局布局 | ✅ 可选：使用SEPARATE_CHILDREN策略 |
| **群组边界** | ❌ 不自动调整 | ✅ 自动包裹子节点 |
| **节点重叠** | ⚠️ 有重叠 | ✅ 大幅减少 |
| **子节点溢出** | ❌ 会溢出 | ✅ 不会溢出 |

---

## 🎯 实施步骤

### 阶段1：修复核心问题（高优先级）

**步骤1.1**：修复容器边界问题
- [ ] 修改 `ELKGraphConverter.fromELKLayout` 返回类型
- [ ] 修改 `extractPositions` 提取width和height
- [ ] 验证 `LayoutControl` 应用尺寸的逻辑

**步骤1.2**：优化ELK配置
- [ ] 在 `getDefaultLayoutOptions` 中添加完整配置
- [ ] 添加 `getGroupLayoutOptions` 方法
- [ ] 在 `buildChildren` 中使用群组配置

**测试1**：
- 创建一个群组包含3个子节点
- 应用全局布局
- 验证：群组的width和height是否自动调整
- 验证：子节点是否在群组边界内

### 阶段2：实现群组布局（中优先级）

**步骤2.1**：扩展类型定义
- [ ] 修改 `LayoutOptions` 类型，添加 `scope` 和 `targetGroupId`

**步骤2.2**：实现子图提取
- [ ] 在 `ELKLayoutStrategy` 中添加 `extractSubgraph` 方法
- [ ] 修改 `applyLayout` 根据scope选择布局范围

**步骤2.3**：修改UI调用
- [ ] 修改 `handleLayout` 传递 `scope: 'global'`
- [ ] 修改 `handleGroupLayout` 传递 `scope: 'group'` 和 `targetGroupId`

**测试2**：
- 创建多个群组，每个包含若干节点
- 选中一个群组，点击"群组布局"
- 验证：只有该群组内的节点移动
- 验证：其他群组和节点位置不变

### 阶段3：优化和调试（低优先级）

**步骤3.1**：参数调优
- [ ] 根据实际布局效果调整间距参数
- [ ] 测试不同的边路由方式（ORTHOGONAL vs POLYLINE vs SPLINES）
- [ ] 调整 `thoroughness` 参数平衡质量和性能

**步骤3.2**：性能优化
- [ ] 对大图（>100节点）测试性能
- [ ] 如果需要，实现布局结果缓存

**步骤3.3**：边界情况处理
- [ ] 处理空群组的布局
- [ ] 处理单节点群组的布局
- [ ] 处理循环引用的边

---

## 🔧 需要修改的文件清单

### 必须修改（阶段1）

1. **src/services/layout/utils/ELKGraphConverter.ts**
   - `fromELKLayout` 方法：修改返回类型和逻辑
   - `extractPositions` 方法：提取width和height
   - `getDefaultLayoutOptions` 方法：添加完整配置
   - `getGroupLayoutOptions` 方法：新增

2. **src/services/layout/utils/ELKGraphConverter.ts**（toELKGraph部分）
   - `buildChildren` 方法：使用群组配置
   - `getDefaultWidth/Height` 方法：确保准确

### 需要修改（阶段2）

3. **src/services/layout/types/layoutTypes.ts**
   - `LayoutOptions` 接口：添加scope和targetGroupId

4. **src/services/layout/strategies/ELKLayoutStrategy.ts**
   - `applyLayout` 方法：添加范围判断
   - `extractSubgraph` 方法：新增

5. **src/components/graph/controls/LayoutControl.tsx**
   - `handleLayout` 方法：传递scope参数
   - `handleGroupLayout` 方法：传递scope和targetGroupId

### 可选修改（阶段3）

6. **src/services/layout/utils/ELKConfigBuilder.ts**
   - 根据需要添加新的配置预设

---

## ⚠️ 风险评估

### 低风险
- ✅ 修改ELK配置参数（向下兼容）
- ✅ 提取width和height（不影响现有位置逻辑）

### 中风险
- ⚠️ 修改fromELKLayout返回类型（需要确保LayoutControl正确处理）
- ⚠️ 子图提取逻辑（需要充分测试嵌套群组）

### 高风险
- 🚨 无明显高风险修改

### 回滚策略
- 所有修改都是增量的，不删除现有代码
- 可以通过配置开关启用/禁用新功能
- Git提交应该分阶段，每个阶段独立可回滚

---

## 📝 测试用例

### 测试用例1：群组边界自动调整
```
场景：创建一个群组，包含3个节点
步骤：
1. 创建群组G1，默认尺寸400x350
2. 添加3个节点到G1
3. 应用全局布局
预期：
- G1的width和height自动调整
- 所有子节点在G1边界内
- G1的边界包含所有子节点 + padding
```

### 测试用例2：群组布局不影响其他节点
```
场景：有2个群组G1和G2，分别包含节点
步骤：
1. 选中G1
2. 点击"群组布局"
预期：
- 只有G1和其子节点位置改变
- G2和其子节点位置不变
- 顶层节点位置不变
```

### 测试用例3：嵌套群组布局
```
场景：G1包含G2，G2包含节点N1、N2
步骤：
1. 应用全局布局
预期：
- G2的尺寸包裹N1、N2
- G1的尺寸包裹G2
- 所有节点都在正确的边界内
```

### 测试用例4：节点不重叠
```
场景：创建10个节点，相互连接
步骤：
1. 应用全局布局
预期：
- 没有节点重叠
- 边不穿过节点（或穿过次数最小）
- 布局美观
```

---

## 🎨 参考资源

### ELK官方文档
- [Hierarchy Handling](https://eclipse.dev/elk/reference/options/org-eclipse-elk-hierarchyHandling.html)
- [Padding](https://eclipse.dev/elk/reference/options/org-eclipse-elk-padding.html)
- [Node Spacing](https://eclipse.dev/elk/reference/options/org-eclipse-elk-spacing-nodeNode.html)
- [Layered Algorithm](https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-layered.html)

### Mermaid实现
- [ELK Layout Package](https://github.com/mermaid-js/mermaid/tree/develop/packages/mermaid-layout-elk)
- [render.ts](https://github.com/mermaid-js/mermaid/blob/develop/packages/mermaid-layout-elk/src/render.ts)

### elkjs Issues
- [#100 - Incremental layout](https://github.com/kieler/elkjs/issues/100)
- [#88 - Hierarchical boundaries](https://github.com/kieler/elkjs/issues/88)

---

## ✅ 总结

### 核心问题
1. **三个按钮功能相同**：缺少子图提取逻辑
2. **容器边界不更新**：fromELKLayout丢弃了width和height
3. **节点重叠**：缺少边节点间距等关键配置

### 解决方案
1. **实现子图提取**：群组布局只影响目标群组
2. **提取完整信息**：包括位置和尺寸
3. **优化ELK配置**：添加完整的间距和路由配置

### 预期改进
- ✅ 三个按钮有明确区别
- ✅ 群组边界自动调整
- ✅ 节点重叠大幅减少
- ✅ 布局质量显著提升

---

## 🚀 下一步

请审核以上方案，确认是否：
1. 分析的问题根源正确？
2. 解决方案可行？
3. 修改范围合理？
4. 优先级划分合适？

确认后，我将按照阶段1→阶段2→阶段3的顺序实施修改。
