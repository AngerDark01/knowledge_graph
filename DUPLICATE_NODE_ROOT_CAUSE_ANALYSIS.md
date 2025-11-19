# 重复节点根本原因深度分析

## 🔍 问题现象

从用户日志看到：
```
📐 对群组 group_xxx 内的 4 个子节点进行布局
  └─ 目标节点详情:
     [0] id=node_1763563750343_d..., 旧位置=(510, 799)
     [1] id=node_1763563750343_d..., 旧位置=(510, 799)  ← 同一个ID！
     [2] id=node_1763563753743_c..., 旧位置=(1051, 788)
     [3] id=node_1763563753743_c..., 旧位置=(1051, 788)  ← 同一个ID！
```

用户明确说：**"我明明只创建了两个子节点，显示有四个子节点"**

## 🎯 关键证据

### 证据1：`updateNode` 调用一次，但执行两次更新

```
basicOperations.ts:86  🔧 更新节点 node_1763563750343_dd8sxhrmh: {position: {…}}  ← 调用1次
basicOperations.ts:170   ✅ 节点 node_1763563750343_dd8sxhrmh 更新后: ...  ← 执行2次
basicOperations.ts:170   ✅ 节点 node_1763563750343_dd8sxhrmh 更新后: ...
```

**`updateNode` 代码**：
```typescript
// Line 99-100
nodes: state.nodes.map((node: Node | Group) => {
  if (node.id === id) {
    // ...更新节点
    console.log(`  ✅ 节点 ${id} 更新后:`, ...);  // Line 170
    return updatedNode;
  }
  return node;
})
```

**结论**：`map` 遍历时，匹配到了**两个相同 ID 的节点**，所以 line 170 打印了两次。

→ **`state.nodes` 数组中有重复节点**

---

### 证据2：顶层布局没问题，群组内布局有问题

用户明确指出：
> "顶层布局已经解决了的问题。为什么会再群组布局再犯呢？"

**对比分析**：

| 对比项 | 顶层布局 | 群组内布局 |
|--------|----------|------------|
| 调用方式 | `applyLayout(nodes, edges, {})` | `applyLayout(nodes, edges, { targetGroupId: xxx })` |
| `getTargetNodes` 筛选 | 顶层节点（无 groupId） | 特定群组的子节点（groupId === xxx） |
| 是否有重复 | ❌ 无重复 | ✅ 有重复 |

**推论**：
- `nodes` 数组中，顶层节点没有重复
- `nodes` 数组中，某个群组的子节点有重复

---

### 证据3：`getNodes()` 直接返回 `state.nodes`

```typescript
// basicOperations.ts:205
getNodes: () => get().nodes,
```

没有任何去重逻辑，直接返回 store 中的数组。

→ **如果 `state.nodes` 有重复，`getNodes()` 也会返回重复**

---

## 🔎 数据流追踪

### 1. LayoutControl 获取节点

```typescript
// LayoutControl.tsx:16
const nodes = useGraphStore(state => state.getNodes());
```

如果 store 中有重复，这里的 `nodes` 就有重复。

### 2. 传给布局算法

```typescript
// LayoutControl.tsx:154-164
const layoutResult = await layoutManager.applyLayout(
  nodes,  // ← 已有重复
  edges,
  { targetGroupId: selectedNodeId }
);
```

### 3. `getTargetNodes` 筛选

```typescript
// GridCenterLayoutStrategy.ts:48-50
filteredNodes = allNodes.filter(node =>
  'groupId' in node && (node as Node).groupId === targetGroupId
);
```

如果 `allNodes` 中有两个 `node_xxx`，都满足条件，`filteredNodes` 就有两个。

### 4. 去重修复（治标）

```typescript
// Line 53-59: 我们添加的去重逻辑
const uniqueNodes = new Map<string, Node | Group>();
filteredNodes.forEach(node => {
  if (!uniqueNodes.has(node.id)) {
    uniqueNodes.set(node.id, node);
  }
});
```

这解决了显示问题，但没有解决根本原因。

---

## 🐛 根本原因假设

### 假设1：`updateNestedNodePositions` 产生重复 ❌ 排除

**之前的分析**：
```typescript
for (const nestedNode of nestedNodes) {
  if (layoutedNodeIds.has(nestedNode.id)) {
    resultNodes.push(layoutedNode);  // ← 重复push？
  }
  // ...
}
```

**反驳**：
- `updateNestedNodePositions` 返回的 `resultNodes` 确实可能有重复
- 但这些结果被转换为 Map 返回：
  ```typescript
  const nodePositions = new Map<string, { x: number; y: number }>();
  for (const node of finalNodes) {
    nodePositions.set(node.id, node.position);  // Map 自动去重
  }
  ```
- LayoutControl 接收的是 Map，遍历更新时不会产生重复

**结论**：不是这里的问题

---

### 假设2：`updateGroupBoundary` 导致重复 ⚠️ 待验证

**时间线**：
```
1. LayoutControl.tsx:183 ✅ 群组布局完成，更新了 4 个节点
2. LayoutControl.tsx:186 🔧 触发群组边界更新: group_xxx
3. GraphPageContent.tsx:144 🔄 同步节点到ReactFlow: 7  ← 重复多次
4. groupBoundaryOperations.ts: 执行边界更新
```

**可能的问题**：
`updateGroupBoundary` 在更新边界时，可能错误地添加了节点？

让我检查这个方法...

---

### 假设3：ReactFlow 的 `onNodesChange` 导致重复 ⚠️ 待验证

**怀疑点**：
ReactFlow 的节点变化回调可能会触发多次更新，导致节点被重复添加到 store。

需要检查：
- `onNodesChange` 的处理逻辑
- 是否有防重复机制

---

### 假设4：历史记录恢复导致重复 ⚠️ 待验证

如果历史记录中保存了重复节点，恢复时也会有重复。

---

### 假设5：`syncStoreToReactFlowNodes` 和 store 的循环更新 ⚠️ 高度怀疑

**流程**：
```
1. Store 更新节点位置
2. GraphPageContent.tsx useMemo 触发，调用 syncStoreToReactFlowNodes
3. syncStoreToReactFlowNodes 将 store 节点转换为 ReactFlow 节点
4. setReactFlowNodes 更新 ReactFlow
5. ReactFlow 触发 onNodesChange
6. onNodesChange 可能更新 store
7. 回到步骤 1，形成循环
```

**如果在这个循环中某个环节错误地添加了节点，就会产生重复。**

需要检查：
- `onNodesChange` 的实现
- 是否有防止循环更新的机制

---

## 🔬 诊断方法

### 方法1：在 `addNode` 添加栈追踪

```typescript
addNode: (node) => {
  const state = get();

  // 🔍 检查是否已存在
  const existing = state.nodes.find(n => n.id === node.id);
  if (existing) {
    console.error('⚠️ 尝试添加重复节点:', node.id);
    console.trace('调用栈:');  // 打印调用栈
    return state;  // 拒绝添加
  }

  console.log('➕ 添加节点:', node.id, node);
  // ...
}
```

### 方法2：在 `set` 方法中验证唯一性

```typescript
set((state) => {
  const newNodes = ...;

  // 🔍 检查重复
  const ids = new Set<string>();
  const duplicates: string[] = [];
  newNodes.forEach(node => {
    if (ids.has(node.id)) {
      duplicates.push(node.id);
    }
    ids.add(node.id);
  });

  if (duplicates.length > 0) {
    console.error('⚠️ 检测到重复节点:', duplicates);
    console.trace('调用栈:');
  }

  return { ...state, nodes: newNodes };
});
```

### 方法3：在 `updateNode` 开始处检查

```typescript
updateNode: (id, updates) => {
  const state = get();

  // 🔍 统计相同 ID 的节点数量
  const count = state.nodes.filter(n => n.id === id).length;
  if (count > 1) {
    console.error(`⚠️ 发现 ${count} 个相同 ID 的节点:`, id);
    console.trace('调用栈:');
  }

  console.log(`🔧 更新节点 ${id}:`, updates);
  // ...
}
```

---

## 🎯 下一步行动

1. **立即添加诊断日志**：
   - 在 `addNode` 中检查重复
   - 在 `updateNode` 开始处统计重复节点数量
   - 打印调用栈

2. **检查 `onNodesChange` 实现**：
   - 查看是否会导致节点重复添加

3. **检查 `updateGroupBoundary` 实现**：
   - 确认是否会修改 `nodes` 数组

4. **重现问题并查看日志**：
   - 创建新的 Group，添加 2 个子节点
   - 点击"群组内布局"
   - 查看哪里首次产生重复

---

## 💡 临时解决方案（已实施）

在 `getTargetNodes` 中添加去重：
```typescript
const uniqueNodes = new Map<string, Node | Group>();
filteredNodes.forEach(node => {
  if (!uniqueNodes.has(node.id)) {
    uniqueNodes.set(node.id, node);
  }
});
```

**效果**：
- ✅ 解决了显示问题（4个→2个）
- ✅ 解决了节点重叠问题
- ❌ 但没有解决根本原因（store 中仍有重复）

---

## 🚨 根本解决方案（待实施）

### 方案A：在 store 层面防止重复

```typescript
set((state) => {
  // 去重逻辑
  const uniqueNodes = Array.from(
    new Map(newNodes.map(n => [n.id, n])).values()
  );
  return { ...state, nodes: uniqueNodes };
});
```

### 方案B：找到产生重复的源头并修复

需要通过诊断日志找到源头。

---

## 🔍 关键疑问

1. **为什么顶层节点没有重复，只有群组的子节点重复？**
   - 可能是群组相关的操作导致的

2. **什么时候产生的重复？**
   - 创建时？
   - 布局时？
   - 边界更新时？
   - ReactFlow 回调时？

3. **是所有群组的子节点都会重复，还是只有特定情况？**
   - 需要更多测试确认

---

## 📋 待检查的文件

1. `/src/components/graph/core/GraphPageContent.tsx` - 查看 `onNodesChange`
2. `/src/stores/graph/nodes/groupBoundaryOperations.ts` - 查看边界更新逻辑
3. `/src/stores/graph/historySlice.ts` - 查看历史记录相关逻辑

**用户要求：从数据结构定义开始分析，对比顶层布局和群组布局的差异。**
