# 递归布局和节点 Resize 完整执行逻辑分析

## 目录
1. [递归布局完整执行流程](#递归布局完整执行流程)
2. [节点 Resize 完整执行流程](#节点-resize-完整执行流程)
3. [问题分析](#问题分析)
4. [数据流图](#数据流图)

---

## 递归布局完整执行流程

### 1. 触发入口

**文件：** `src/components/graph/controls/LayoutControl.tsx`
**函数：** `handleRecursiveLayout()` (lines 220-325)

```typescript
const handleRecursiveLayout = useCallback(async () => {
  // 1. 检查是否正在处理
  if (isProcessing) return;

  // 2. 设置处理状态
  setIsProcessing(true);

  // 3. 创建布局管理器和策略
  const layoutManager = new LayoutManager();
  const gridCenterStrategy = new GridCenterLayoutStrategy();
  layoutManager.registerStrategy('grid-center-layout', gridCenterStrategy);

  // 4. 执行布局
  const layoutResult = await layoutManager.applyLayout(nodes, edges, {
    strategy: 'grid-center-layout',
    layoutMode: 'recursive',  // ← 关键：递归模式
    animate: true,
    useWeightedLayout: true,
    onProgress: (progress) => { ... }
  });

  // 5. 处理布局结果...
}, [nodes, edges, isProcessing, updateNode, updateEdge, setSelectedNodeId, updateGroupBoundary]);
```

### 2. 布局策略调度

**文件：** `src/services/layout/strategies/GridCenterLayoutStrategy.ts`
**函数：** `applyLayout()` (lines 181-347)

```typescript
async applyLayout(nodes, edges, options) {
  // 检查布局模式
  if (options?.layoutMode === 'recursive') {
    console.log('🌳 启动递归布局模式');
    return this.applyRecursiveLayout(nodes, edges, options);  // ← 进入递归布局
  }

  // ... 其他布局逻辑
}
```

### 3. 递归布局核心算法

**文件：** `src/services/layout/strategies/GridCenterLayoutStrategy.ts`
**函数：** `applyRecursiveLayout()` (lines 838-1019)

#### 执行步骤：

```
步骤 1: 构建嵌套层级树
  └─ NestingTreeBuilder.groupNodesByDepth(nodes)
  └─ 返回：Map<depth, nodes[]>
  └─ 计算最大深度 maxDepth

步骤 2: 创建工作节点副本
  └─ workingNodes = nodes.map(n => ({...n, position: {...n.position}}))

步骤 3: 从最深层向上逐层布局（depth = maxDepth → 1）
  for (depth = maxDepth; depth > 0; depth--) {
    groupsAtDepth = getGroupsAtDepth(depth)

    for (group in groupsAtDepth) {
      ① 检查子节点数量
      ② 调用 layoutSingleGroup(group.id, workingNodes, edges)
      ③ 合并布局结果到 workingNodes
      ④ 更新 allUpdatedPositions Map
    }
  }

步骤 4: 布局顶层节点
  └─ applyLayout(workingNodes, edges, {layoutMode: 'normal'})
  └─ 合并结果到 allUpdatedPositions

步骤 5: 调整父节点大小（关键！）
  └─ adjustParentNodeSizes(workingNodes, treeBuilder, depthGroups, maxDepth)
  └─ 从深到浅调整每个群组的 width、height、boundary

  for (node in adjustedNodes) {
    if (node.type === GROUP && (node.width || node.height)) {
      pos = allUpdatedPositions.get(node.id)
      ⚠️ 问题：这里只更新 Map 中的位置，但没有更新 position

      // 将尺寸信息存入 Map（作为特殊字段）
      pos.width = node.width
      pos.height = node.height
      pos.boundary = node.boundary
    }
  }

步骤 6: 优化边连接点
  └─ edgeOptimizer.optimizeEdgeHandles(adjustedNodes, edges)

步骤 7: 返回结果
  return {
    success: true,
    nodes: allUpdatedPositions,  // ← Map<nodeId, {x, y, width?, height?, boundary?}>
    edges: Map<edgeId, edge>,
    stats: {...}
  }
```

### 4. LayoutControl 处理布局结果

**文件：** `src/components/graph/controls/LayoutControl.tsx`
**函数：** `handleRecursiveLayout()` (lines 254-314)

```typescript
if (layoutResult.success) {
  // 1. 启用布局模式（禁用约束逻辑）
  useGraphStore.getState().setIsLayoutMode(true);

  // 2. 更新节点位置和大小
  for (const [nodeId, positionData] of layoutResult.nodes) {
    const updateData: any = {
      position: { x: positionData.x, y: positionData.y }
    };

    // 提取尺寸信息
    if (positionData.width !== undefined) {
      updateData.width = positionData.width;
    }
    if (positionData.height !== undefined) {
      updateData.height = positionData.height;
    }
    if (positionData.boundary !== undefined) {
      updateData.boundary = positionData.boundary;
    }

    updateNode(nodeId, updateData);  // ← 调用 Zustand store 更新
  }

  // 3. 更新边连接点
  layoutResult.edges.forEach((edgeData, edgeId) => {
    updateEdge(edgeId, {
      sourceHandle: edgeData.sourceHandle,
      targetHandle: edgeData.targetHandle
    });
  });

  // 4. 触发群组边界更新（100ms 延迟）
  const updatedGroupIds: string[] = [];
  for (const [nodeId, positionData] of layoutResult.nodes) {
    if (positionData.width !== undefined || positionData.height !== undefined) {
      const node = nodes.find(n => n.id === nodeId);
      if (node && node.type === 'group') {
        updatedGroupIds.push(nodeId);
      }
    }
  }

  if (updatedGroupIds.length > 0) {
    setTimeout(() => {
      updatedGroupIds.forEach(groupId => {
        updateGroupBoundary(groupId);  // ← 触发边界管理逻辑
      });
    }, 100);
  }

  // 5. 禁用布局模式
  useGraphStore.getState().setIsLayoutMode(false);
}
```

### 5. Store 更新节点

**文件：** `src/stores/graph/nodes/basicOperations.ts`
**函数：** `updateNode()` (lines 84-174)

```typescript
updateNode: (id, updates) => {
  const state = get();

  const newState = {
    nodes: state.nodes.map((node: Node | Group) => {
      if (node.id === id) {
        let updatedNode = {
          ...node,
          ...updates,
          position: safePosition(updates.position),
          updatedAt: new Date(),
        };

        // 如果更新了 width 或 height，同步到 style
        if (updates.width !== undefined || updates.height !== undefined) {
          const newWidth = updates.width ?? node.width ?? defaultWidth;
          const newHeight = updates.height ?? node.height ?? defaultHeight;

          updatedNode.style = {
            ...node.style,
            ...updates.style,
            width: newWidth,
            height: newHeight,
          };

          updatedNode.width = newWidth;
          updatedNode.height = newHeight;

          // 🔧 自动计算 boundary（如果没有提供）
          if (node.type === BlockEnum.GROUP && updates.boundary === undefined) {
            updatedNode.boundary = {
              minX: updatedNode.position.x,
              minY: updatedNode.position.y,
              maxX: updatedNode.position.x + newWidth,
              maxY: updatedNode.position.y + newHeight,
            };
          }
        }

        // 🔧 如果显式提供了 boundary，使用提供的值
        if (updates.boundary !== undefined && node.type === BlockEnum.GROUP) {
          updatedNode.boundary = updates.boundary;
        }

        return updatedNode;
      }
      return node;
    })
  };

  set(newState);
  return newState;
}
```

### 6. ReactFlow 视图同步

**文件：** `src/components/graph/core/GraphPageContent.tsx`

#### 6.1 processedNodes 计算 (lines 136-146)

```typescript
const processedNodes = useMemo(() => {
  // 如果正在拖拽，使用当前节点
  if (isDraggingRef.current) {
    return reactFlowNodes || [];
  }

  // 同步 store 到 ReactFlow
  const nodes = syncStoreToReactFlowNodes(storeNodes, selectedNodeId);
  console.log('🔄 同步节点到ReactFlow:', nodes.length);
  return nodes;
}, [storeNodes, selectedNodeId]);  // ⚠️ 依赖项：只依赖 storeNodes 和 selectedNodeId
```

#### 6.2 检测变化并更新 (lines 149-181)

```typescript
useEffect(() => {
  if (!isDraggingRef.current && processedNodes && reactFlowNodes) {
    const nodeIdsChanged = processedNodes.length !== reactFlowNodes.length || ...;

    let nodeChanged = false;
    if (!nodeIdsChanged) {
      for (let i = 0; i < processedNodes.length; i++) {
        const oldNode = reactFlowNodes.find(n => n.id === processedNodes[i].id);
        if (oldNode) {
          // 检查位置变化
          const positionChanged = oldNode.position.x !== processedNodes[i].position.x ||
                                 oldNode.position.y !== processedNodes[i].position.y;

          // 🔧 检查尺寸变化
          const sizeChanged = oldNode.style?.width !== processedNodes[i].style?.width ||
                             oldNode.style?.height !== processedNodes[i].style?.height;

          if (positionChanged || sizeChanged) {
            nodeChanged = true;
            break;
          }
        }
      }
    }

    if (nodeIdsChanged || nodeChanged) {
      setReactFlowNodes(processedNodes);  // ← 更新 ReactFlow 节点
    }
  }
}, [processedNodes, setReactFlowNodes, reactFlowNodes, isDraggingRef.current]);
```

### 7. 群组边界更新（延迟触发）

**文件：** `src/stores/graph/nodes/groupBoundaryOperations.ts`
**函数：** `updateGroupBoundary()` (lines 188-235)

```typescript
updateGroupBoundary: (groupId: string) => {
  // 清除旧定时器
  if (boundaryUpdateTimers.has(groupId)) {
    clearTimeout(boundaryUpdateTimers.get(groupId)!);
  }

  // 50ms 防抖
  const timer = setTimeout(() => {
    set((state: any) => {
      const group = state.nodes.find(n => n.id === groupId && n.type === BlockEnum.GROUP);

      if (!group) return state;

      // 收集需要更新的群组链
      const groupChain: string[] = [];
      let tempGroupId: string | undefined = groupId;
      while (tempGroupId) {
        groupChain.unshift(tempGroupId);
        const tempGroup = updatedNodes.find(n => n.id === tempGroupId);
        tempGroupId = tempGroup?.groupId;
      }

      console.log(`📏 需要更新的群组链（从顶层到当前）:`, groupChain);

      // 从最底层（当前群组）开始向上更新
      for (let i = groupChain.length - 1; i >= 0; i--) {
        const targetGroupId = groupChain[i];
        updatedNodes = updateSingleGroupBoundary(targetGroupId, updatedNodes);
      }

      return { nodes: updatedNodes };
    });

    boundaryUpdateTimers.delete(groupId);
  }, 50);

  boundaryUpdateTimers.set(groupId, timer);
}
```

**函数：** `updateSingleGroupBoundary()` (lines 24-190)

```typescript
const updateSingleGroupBoundary = (groupId: string, nodes: (Node | Group)[]): (Node | Group)[] => {
  const group = nodes.find(n => n.id === groupId && n.type === BlockEnum.GROUP);
  const groupNodes = nodes.filter(n => 'groupId' in n && n.groupId === groupId);

  if (groupNodes.length === 0) return nodes;

  // 计算子节点边界（绝对坐标）
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  groupNodes.forEach((node: Node | Group) => {
    const nodeWidth = safeNumber(node.width, 150) + NODE_VISUAL_PADDING;
    const nodeHeight = safeNumber(node.height, 100) + NODE_VISUAL_PADDING;
    const nodePos = safePosition(node.position);

    minX = Math.min(minX, nodePos.x);
    minY = Math.min(minY, nodePos.y);
    maxX = Math.max(maxX, nodePos.x + nodeWidth);
    maxY = Math.max(maxY, nodePos.y + nodeHeight);
  });

  // 计算需要的群组边界（包含 padding）
  const requiredMinX = minX - GROUP_PADDING.left;
  const requiredMinY = minY - GROUP_PADDING.top;
  const requiredMaxX = maxX + GROUP_PADDING.right;
  const requiredMaxY = maxY + GROUP_PADDING.bottom;

  // 检查是否需要扩展
  const needsExpandRight = requiredMaxX > currentMaxX;
  const needsExpandDown = requiredMaxY > currentMaxY;
  const needsExpandLeft = requiredMinX < currentGroupPos.x;
  const needsExpandUp = requiredMinY < currentGroupPos.y;

  // 计算新的群组位置和尺寸
  let newGroupX = currentGroupPos.x;
  let newGroupY = currentGroupPos.y;
  let newWidth = currentWidth;
  let newHeight = currentHeight;

  if (needsExpandRight) newWidth = requiredMaxX - currentGroupPos.x;
  if (needsExpandDown) newHeight = requiredMaxY - currentGroupPos.y;
  if (needsExpandLeft) {
    const deltaX = currentGroupPos.x - requiredMinX;
    newGroupX = requiredMinX;
    newWidth = currentWidth + deltaX;
  }
  if (needsExpandUp) {
    const deltaY = currentGroupPos.y - requiredMinY;
    newGroupY = requiredMinY;
    newHeight = currentHeight + deltaY;
  }

  // 更新节点
  return nodes.map((node: Node | Group) => {
    if (node.id === groupId) {
      return {
        ...node,
        position: { x: safeNumber(newGroupX), y: safeNumber(newGroupY) },
        width: safeNumber(newWidth, 300),
        height: safeNumber(newHeight, 200),
        boundary: {  // ← 🔧 修复：添加 boundary 更新
          minX: safeNumber(newGroupX),
          minY: safeNumber(newGroupY),
          maxX: safeNumber(newGroupX) + safeNumber(newWidth, 300),
          maxY: safeNumber(newGroupY) + safeNumber(newHeight, 200)
        },
        updatedAt: new Date()
      } as Group;
    }
    return node;
  });
};
```

---

## 节点 Resize 完整执行流程

### 1. Resize 控制器定义

**文件：** `src/components/graph/nodes/BaseNode.tsx` (lines 191-216)

```typescript
{/* 尺寸调整器 */}
{showResizeControl && (
  <div className={`
    hidden group-hover:block      // ← 默认隐藏，hover 显示
    ${selected ? '!block' : ''}   // ← 选中时强制显示
  `}>
    <NodeResizeControl
      position="bottom-right"
      className="!border-none !bg-transparent"
      minWidth={minWidth}
      minHeight={minHeight}
    >
      <div className="absolute bottom-[1px] right-[1px]">
        <svg>...</svg>  // ← 拖拽图标
      </div>
    </NodeResizeControl>
  </div>
)}
```

**GroupNode 配置：**
```typescript
<BaseNode
  id={id}
  data={data}
  isGroup={true}
  selected={selected}
  groupNode={groupNode}
  showResizeControl={true}  // ← 启用 resize
  minWidth={250}
  minHeight={200}
>
```

### 2. ReactFlow Resize 事件

**文件：** `src/components/graph/core/GraphPageContent.tsx`
**ReactFlow 配置：** (line 440)

```typescript
<ReactFlow
  nodesDraggable={true}        // ← 允许拖拽
  nodesConnectable={true}      // ← 允许连接
  elementsSelectable={true}    // ← 允许选中
  selectNodesOnDrag={false}

  onNodesChange={(changes) => {
    onNodesChange(changes);    // ← ReactFlow 内部处理 resize

    requestAnimationFrame(() => {
      changes.forEach((change: NodeChange) => {
        // 处理 dimensions 变化
        if (change.type === 'dimensions' && change.dimensions && !change.resizing) {
          // ...
        }
      });
    });
  }}
/>
```

### 3. Resize 变化处理

**文件：** `src/components/graph/core/GraphPageContent.tsx` (lines 472-511)

```typescript
if (change.type === 'dimensions' && change.dimensions && !change.resizing) {
  // 清除旧的 timeout
  if (resizeTimeoutRef.current[change.id]) {
    clearTimeout(resizeTimeoutRef.current[change.id]);
  }

  // 100ms 防抖
  resizeTimeoutRef.current[change.id] = setTimeout(() => {
    const currentNode = reactFlowInstance?.getNode(change.id);

    if (currentNode) {
      const newWidth = Number(change.dimensions!.width);
      const newHeight = Number(change.dimensions!.height);

      // 更新 store
      updateNode(change.id, {
        width: newWidth || 350,
        height: newHeight || 280,
        style: {
          ...(currentNode.style || {}),
          width: newWidth || 350,
          height: newHeight || 280,
        }
      });

      // 如果是群组，更新边界
      if (currentNode.type === 'group') {
        const storeGroup = storeNodes.find(n => n.id === change.id) as Group;

        updateGroupBoundary(change.id);  // ← 更新自身边界

        // 更新父群组边界
        if (storeGroup?.groupId) {
          console.log('📐 调整大小后更新父群组边界:', storeGroup.groupId);
          updateGroupBoundary(storeGroup.groupId);
        }
      }
    }

    delete resizeTimeoutRef.current[change.id];
  }, 100);
}
```

### 4. Resize 流程总结

```
1. 用户选中 Group 节点
   └─ selected={true}
   └─ Resize 控制器显示（className: !block）

2. 用户拖拽右下角图标
   └─ NodeResizeControl 捕获拖拽
   └─ ReactFlow 内部处理尺寸变化

3. ReactFlow 触发 onNodesChange 事件
   └─ change.type === 'dimensions'
   └─ change.dimensions = { width, height }
   └─ change.resizing = false（拖拽结束）

4. 100ms 防抖后执行
   └─ updateNode(id, { width, height, style })
   └─ 更新 Zustand store

5. updateNode 内部逻辑
   └─ 同步 width/height 到 style
   └─ 自动计算 boundary（如果是 Group 且未提供）

6. 触发 updateGroupBoundary
   └─ 更新自身边界
   └─ 更新父群组边界（递归向上）

7. Store 变化触发 processedNodes 重新计算
   └─ syncStoreToReactFlowNodes()
   └─ 包含新的 width/height

8. useEffect 检测尺寸变化
   └─ sizeChanged = true
   └─ setReactFlowNodes(processedNodes)

9. ReactFlow 重新渲染
   └─ 节点显示新尺寸
```

---

## 问题分析

### 问题 1: 递归布局后视图不更新

#### 现象
- 日志显示布局执行成功 ✅
- 节点数据更新成功 ✅
- 但视图没有变化 ❌

#### 根本原因（已修复）

**原因 1：useMemo 循环依赖**

```typescript
// ❌ 之前的代码
const processedNodes = useMemo(() => {
  ...
}, [storeNodes, selectedNodeId, reactFlowNodes, isDraggingRef.current]);
```

问题：
- `reactFlowNodes` 在依赖项中导致循环依赖
- `processedNodes` 变化 → `setReactFlowNodes` → `reactFlowNodes` 变化 → `processedNodes` 重新计算
- 导致状态混乱

**修复：**
```typescript
// ✅ 修复后
const processedNodes = useMemo(() => {
  ...
}, [storeNodes, selectedNodeId]);  // 移除 reactFlowNodes
```

#### 潜在问题（仍存在）

**问题：adjustParentNodeSizes 的结果没有正确传递**

在 `applyRecursiveLayout()` 的步骤 5 (lines 962-980):

```typescript
// 更新调整后的节点大小到结果中
for (const node of adjustedNodes) {
  if (node.type === BlockEnum.GROUP && (node.width || node.height)) {
    const currentPos = allUpdatedPositions.get(node.id);
    if (currentPos) {
      // ⚠️ 问题：这里只更新了 Map 的引用，没有创建新的位置对象
      allUpdatedPositions.set(node.id, currentPos);
    }

    const pos = allUpdatedPositions.get(node.id);
    if (pos) {
      (pos as any).width = node.width;
      (pos as any).height = node.height;
      (pos as any).boundary = node.boundary;
    }
  }
}
```

**分析：**
1. `adjustParentNodeSizes()` 返回了调整后的节点（包含新的 width/height/boundary）
2. 但这些信息只被添加到 `allUpdatedPositions` Map 的现有位置对象上
3. `allUpdatedPositions` 返回的是 `Map<nodeId, {x, y, width?, height?, boundary?}>`
4. LayoutControl 正确提取了这些信息并调用 `updateNode()`
5. Store 也正确更新了
6. **但是**，如果 `allUpdatedPositions` 中没有该节点的位置记录（例如顶层 Group 节点），则 width/height/boundary 不会被添加

**潜在修复：**
```typescript
// 建议修改
for (const node of adjustedNodes) {
  if (node.type === BlockEnum.GROUP) {
    // 确保 Map 中存在该节点的记录
    let pos = allUpdatedPositions.get(node.id);
    if (!pos) {
      // 如果不存在，创建一个新的位置记录
      pos = { x: node.position.x, y: node.position.y };
      allUpdatedPositions.set(node.id, pos);
    }

    // 更新尺寸信息
    if (node.width) (pos as any).width = node.width;
    if (node.height) (pos as any).height = node.height;
    if ((node as Group).boundary) (pos as any).boundary = (node as Group).boundary;
  }
}
```

### 问题 2: 节点无法 Resize

#### 现象
- 节点选中后看不到 resize 控制器
- 无法拖拽调整大小

#### 可能原因分析

**原因 1：CSS 样式问题**

BaseNode.tsx lines 193-196:
```typescript
<div className={`
  hidden group-hover:block      // Tailwind: 默认隐藏，hover 显示
  ${selected ? '!block' : ''}   // selected 时强制显示
`}>
```

问题：
- `hidden` 类优先级可能被其他样式覆盖
- `group-hover:block` 需要父元素有 `group` 类
- 检查 BaseNode 的容器是否有 `group` 类（line 144-158 中确实有）

**原因 2：ReactFlow 配置问题**

GraphPageContent.tsx:
```typescript
<ReactFlow
  nodesDraggable={true}        // ✓ 已启用
  nodesConnectable={true}      // ✓ 已启用
  elementsSelectable={true}    // ✓ 已启用
/>
```

配置正确 ✓

**原因 3：选中状态未正确传递**

检查路径：
1. GraphPageContent 传递 `selected` prop 给节点 ✓
2. GroupNode 接收并传递给 BaseNode ✓
3. BaseNode 使用 `selected` 控制显示 ✓

**原因 4：NodeResizeControl 被遮挡**

检查 z-index:
- BaseNode 容器 z-index：`z-[1]` (group) 或 `z-[2]` (node)
- Handles z-index：`50`
- 可能需要给 NodeResizeControl 设置更高的 z-index

**建议修复：**
```typescript
<div className={`
  ${selected || isHovering ? 'block' : 'hidden'}  // 简化逻辑
  absolute bottom-0 right-0 z-50                  // 添加 z-index
`}>
  <NodeResizeControl
    position="bottom-right"
    className="!border-none !bg-transparent !z-50"  // 添加 z-index
    minWidth={minWidth}
    minHeight={minHeight}
  >
```

**原因 5：拖拽冲突**

可能与 `isDraggingRef` 相关：
- 拖拽节点时，`isDraggingRef.current = true`
- processedNodes 返回 `reactFlowNodes`
- 可能导致 resize 操作被阻止

---

## 数据流图

### 递归布局数据流

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. 用户点击"递归布局全部"按钮                                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. LayoutControl.handleRecursiveLayout()                        │
│    - 创建 LayoutManager 和 GridCenterLayoutStrategy             │
│    - 调用 layoutManager.applyLayout({layoutMode: 'recursive'})  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. GridCenterLayoutStrategy.applyRecursiveLayout()              │
│    - 构建嵌套树：NestingTreeBuilder.groupNodesByDepth()        │
│    - 从深到浅布局：for (depth = maxDepth → 1)                  │
│    - 调整父节点大小：adjustParentNodeSizes()                    │
│    - 返回：Map<nodeId, {x, y, width?, height?, boundary?}>     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. LayoutControl 处理结果                                        │
│    - 提取 position、width、height、boundary                     │
│    - 调用 updateNode(nodeId, {position, width, height, boundary})│
│    - 100ms 后触发 updateGroupBoundary(groupId)                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. Zustand Store 更新                                            │
│    - basicOperations.updateNode()                               │
│    - 更新 nodes 数组                                             │
│    - 同步 width/height 到 style                                  │
│    - 自动计算或使用提供的 boundary                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. GraphPageContent 监听 storeNodes 变化                         │
│    - processedNodes = useMemo(..., [storeNodes, selectedNodeId])│
│    - syncStoreToReactFlowNodes(storeNodes)                      │
│    - 返回新的 ReactFlow 节点列表（包含 style.width/height）     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. useEffect 检测变化                                            │
│    - 比较 processedNodes 和 reactFlowNodes                      │
│    - 检查位置变化：position.x/y                                  │
│    - 检查尺寸变化：style.width/height                            │
│    - 如有变化 → setReactFlowNodes(processedNodes)               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8. ReactFlow 重新渲染                                            │
│    - 节点移动到新位置                                            │
│    - 节点显示新尺寸                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 9. updateGroupBoundary 触发（延迟 100ms）                        │
│    - 50ms 防抖                                                   │
│    - updateSingleGroupBoundary()                                │
│    - 计算子节点边界                                              │
│    - 扩展群组尺寸（如需要）                                      │
│    - 更新 boundary 字段                                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
                   循环回步骤 5
                  （Store 再次更新）
```

### Resize 数据流

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. 用户选中 Group 节点                                            │
│    - onClick → setSelectedNodeId(id)                            │
│    - selected={true} 传递给 GroupNode → BaseNode               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Resize 控制器显示                                             │
│    - className: ${selected ? '!block' : 'hidden'}               │
│    - NodeResizeControl 可见                                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. 用户拖拽右下角图标                                            │
│    - NodeResizeControl 捕获 drag 事件                           │
│    - ReactFlow 内部处理尺寸变化                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. ReactFlow 触发 onNodesChange                                  │
│    - change.type === 'dimensions'                               │
│    - change.dimensions = {width, height}                        │
│    - change.resizing = false（拖拽结束）                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. 100ms 防抖后执行                                              │
│    - updateNode(id, {width, height, style})                     │
│    - 如果是 Group → updateGroupBoundary(id)                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
                   同递归布局流程步骤 5-9
```

---

## 总结

### 关键文件清单

1. **UI 层**
   - `src/components/graph/controls/LayoutControl.tsx` - 布局按钮和处理器
   - `src/components/graph/core/GraphPageContent.tsx` - ReactFlow 容器和同步逻辑
   - `src/components/graph/nodes/BaseNode.tsx` - Resize 控制器
   - `src/components/graph/nodes/GroupNode.tsx` - Group 节点组件

2. **业务逻辑层**
   - `src/services/layout/strategies/GridCenterLayoutStrategy.ts` - 递归布局算法
   - `src/services/layout/utils/NestingTreeBuilder.ts` - 嵌套树构建

3. **数据层**
   - `src/stores/graph/nodes/basicOperations.ts` - 节点更新
   - `src/stores/graph/nodes/groupBoundaryOperations.ts` - 边界管理

4. **同步层**
   - `src/components/graph/core/nodeSyncUtils.ts` - Store 到 ReactFlow 同步

### 关键时机

- **递归布局**：立即执行 → 100ms 后触发边界更新
- **边界更新**：50ms 防抖
- **Resize**：100ms 防抖
- **视图同步**：useMemo 依赖 storeNodes 变化立即触发

### 关键检查点

1. ✅ `adjustParentNodeSizes()` 是否正确计算尺寸
2. ✅ `allUpdatedPositions` Map 是否包含所有节点（包括顶层 Group）
3. ✅ `updateNode()` 是否正确处理 boundary
4. ✅ `processedNodes` useMemo 依赖项是否正确
5. ✅ `useEffect` 是否检测尺寸变化
6. ❓ Resize 控制器是否正确显示（CSS/z-index）
7. ❓ `isDraggingRef` 是否影响 Resize
