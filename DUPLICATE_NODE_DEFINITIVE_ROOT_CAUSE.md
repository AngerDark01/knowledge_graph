# 重复节点根本原因：确定性分析

## 🔴 根本原因

**位置**: `/src/components/graph/core/hooks/useNodeHandling.ts` **行号**: Lines 183-187

### 错误代码

```typescript
// Line 183-187: onNodeAdd 回调函数
// 添加节点到store
addNode(newNode);
setSelectedNodeId(newNode.id);

addNode(newNode);  // ← 🔴 重复调用！
setSelectedNodeId(newNode.id);
```

**问题**: `addNode` 被调用了**两次**，导致同一个节点被添加到 store 两次！

---

## 🔍 证据链

### 证据 1：用户日志显示重复节点

```
📐 对群组 group_xxx 内的 4 个子节点进行布局
  └─ 目标节点详情:
     [0] id=node_1763563750343_d..., 旧位置=(510, 799)
     [1] id=node_1763563750343_d..., 旧位置=(510, 799)  ← 同一个ID！
     [2] id=node_1763563753743_c..., 旧位置=(1051, 788)
     [3] id=node_1763563753743_c..., 旧位置=(1051, 788)  ← 同一个ID！
```

用户明确说：**"我明明只创建了两个子节点，显示有四个子节点"**

### 证据 2：`updateNode` 执行两次

```
basicOperations.ts:86  🔧 更新节点 node_1763563750343_dd8sxhrmh: {position: {…}}  ← 调用1次
basicOperations.ts:170   ✅ 节点 node_1763563750343_dd8sxhrmh 更新后: ...  ← 执行2次
basicOperations.ts:170   ✅ 节点 node_1763563750343_dd8sxhrmh 更新后: ...
```

`updateNode` 使用 `map` 遍历 `state.nodes`，line 170 打印两次证明数组中有两个相同 ID 的节点。

### 证据 3：`addNode` 没有防重复检查

`/src/stores/graph/nodes/basicOperations.ts` lines 32-82:

```typescript
addNode: (node) => {
  const state = get();
  console.log('➕ 添加节点:', node.id, node);

  // ❌ 没有检查 node.id 是否已存在！

  const newState = { nodes: [...state.nodes, safeNode] };
  set(newState);
  // ...
}
```

如果调用两次 `addNode(同一个节点)`，会添加两次。

### 证据 4：代码对比 - 为什么只有群组子节点重复？

#### ✅ 拖放创建节点（无重复）

`useNodeHandling.ts` lines 392-393:

```typescript
addNode(newNode);  // ← 只调用一次
setSelectedNodeId(newNode.id);
```

#### ❌ 按钮创建节点（有重复）

`useNodeHandling.ts` lines 183-187:

```typescript
addNode(newNode);
setSelectedNodeId(newNode.id);

addNode(newNode);  // ← 重复调用！
setSelectedNodeId(newNode.id);
```

**用户可能的操作**：
1. 选中 GroupA
2. 点击 "Add Node" 按钮创建第一个子节点 → 添加了两次
3. 再次点击 "Add Node" 创建第二个子节点 → 又添加了两次
4. 结果：store 中有 **4 个节点**（2 个节点各重复一次）

#### ✅ 按钮创建群组（无重复）

`useNodeHandling.ts` lines 328-329:

```typescript
addNode(newGroup);  // ← 只调用一次
setSelectedNodeId(newGroup.id);
```

群组创建没有重复调用，所以群组本身不会重复。

---

## 🔎 为什么顶层布局没问题，群组布局有问题？

### 对比分析

| 项目 | 顶层节点 | 群组子节点 |
|------|----------|------------|
| **创建方式** | 可能通过拖放 | 通过按钮（选中群组后点击 Add Node） |
| **`addNode` 调用次数** | 1次（拖放）或 2次（按钮） | 2次（按钮） |
| **是否重复** | 取决于创建方式 | ✅ 重复（如果用按钮） |

**用户场景**：
- 顶层节点可能是通过**拖放**创建的 → 只调用 1 次 `addNode` → 无重复
- 群组子节点是**选中群组后点击按钮**创建的 → 调用 2 次 `addNode` → 有重复

这完美解释了用户的观察：**"顶层布局已经解决了的问题。为什么会再群组布局再犯呢？"**

---

## 🧪 验证推理

### 假设

如果用户通过**拖放**创建群组子节点，应该不会重复（因为 `onDrop` 只调用一次 `addNode`）。

### 测试步骤

1. 创建一个 Group
2. **通过拖放**添加两个子节点
3. 点击 "群组内布局"
4. 查看日志中节点数量

**预期结果**: 应该显示 2 个子节点，而不是 4 个。

---

## 🛠️ 修复方案

### 方案 A：删除重复调用（推荐）⭐

**文件**: `/src/components/graph/core/hooks/useNodeHandling.ts`
**行号**: Lines 186-187

**修改**:
```typescript
// 添加节点到store
addNode(newNode);
setSelectedNodeId(newNode.id);

// 🔧 删除这两行重复调用
// addNode(newNode);
// setSelectedNodeId(newNode.id);

// 如果节点属于群组，将节点添加到父群组
if (groupId) {
  // ...
}
```

**优点**:
- 最简单的修复
- 直接解决根本原因
- 无副作用

---

### 方案 B：在 `addNode` 中添加防重复检查

**文件**: `/src/stores/graph/nodes/basicOperations.ts`
**行号**: Line 32

**修改**:
```typescript
addNode: (node) => {
  const state = get();

  // 🔧 检查节点是否已存在
  const existing = state.nodes.find(n => n.id === node.id);
  if (existing) {
    console.warn(`⚠️ 节点 ${node.id} 已存在，跳过添加`);
    return state;  // 不添加
  }

  console.log('➕ 添加节点:', node.id, node);
  // ...
}
```

**优点**:
- 防御性编程
- 防止未来其他地方出现重复调用

**缺点**:
- 没有解决根本问题（重复调用仍然存在）
- 可能隐藏其他 bug

---

### 方案 C：组合方案（最稳妥）⭐⭐

同时应用方案 A 和方案 B：
1. 删除重复调用（解决根本问题）
2. 添加防重复检查（防止未来问题）

---

## 📊 影响范围

### 受影响的功能

1. ✅ **通过按钮创建节点** (`onNodeAdd`)
   - 所有通过 "Add Node" 按钮创建的节点都会重复
   - 无论是否在群组内

2. ❌ **通过拖放创建节点** (`onDrop`)
   - 不受影响（只调用一次 `addNode`）

3. ❌ **通过按钮创建群组** (`onGroupAdd`)
   - 不受影响（只调用一次 `addNode`）

4. ✅ **群组内布局**
   - 因为节点重复，导致布局异常（4个节点重叠在2个位置）

5. ✅ **历史记录**
   - 重复节点会被保存到历史记录
   - Undo/Redo 会恢复重复节点

---

## 🎯 修复后的预期行为

1. 用户选中 GroupA，点击 "Add Node" 创建 2 个子节点
2. `state.nodes` 中有 **2 个节点**（不是 4 个）
3. 点击 "群组内布局"，日志显示：
   ```
   📐 对群组 group_xxx 内的 2 个子节点进行布局
     └─ 目标节点详情:
        [0] id=node_xxx, 旧位置=(...)
        [1] id=node_yyy, 旧位置=(...)
   ```
4. 布局算法正确计算 2 个节点的位置
5. 前端显示 2 个节点在新位置

---

## 🔗 相关文件

| 文件 | 问题/修复 |
|------|-----------|
| `useNodeHandling.ts:186-187` | 🔴 重复调用 `addNode` |
| `basicOperations.ts:32-82` | ⚠️ 缺少防重复检查 |
| `GridCenterLayoutStrategy.ts:33-71` | ✅ 已添加去重逻辑（临时修复） |
| `historySlice.ts:28-43` | ⚠️ 会保存重复节点到历史 |

---

## ✅ 结论

**根本原因**: `useNodeHandling.ts` lines 186-187 的重复调用导致节点被添加两次。

**修复优先级**: 🔴 **高**（影响核心功能）

**推荐方案**: 方案 C（删除重复调用 + 添加防重复检查）

**修复时间**: < 5 分钟

**测试验证**: 创建 2 个群组子节点，点击群组内布局，确认只显示 2 个节点。
