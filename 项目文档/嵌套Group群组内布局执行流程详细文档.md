# 嵌套Group群组内布局执行流程详细文档

## 1. 概述

本文档详细描述了当用户选中一个多层嵌套的Group节点并点击"群组内布局"按钮时，系统执行的所有步骤和涉及的函数。为了便于理解，我们以一个示例场景来说明整个流程：

- GroupA (选中的最外层群组)
  - Note1 (GroupA的子节点)
  - Note2 (GroupA的子节点)
  - GroupB (嵌套在GroupA内的子群组)
    - NoteD (GroupB的子节点)

## 2. 触发过程

### 2.1 UI层触发
当用户在画布上选中GroupA节点并点击"群组内布局"按钮时，`LayoutControl`组件中的`handleGroupLayout`函数被触发。

**涉及文件**: `src/components/graph/controls/LayoutControl.tsx`
**触发函数**: `handleGroupLayout`

```tsx
const handleGroupLayout = useCallback(async () => {
  if (isProcessing) {
    console.log("Layout already in progress");
    return;
  }

  if (!selectedNodeId || !isGroupSelected) {
    console.warn("No group selected for layout");
    return;
  }

  if (childrenCount === 0) {
    console.warn("Selected group has no children to layout");
    return;
  }

  // 初始化布局管理器和策略
  const layoutManager = new LayoutManager();
  const gridCenterStrategy = new GridCenterLayoutStrategy();
  layoutManager.registerStrategy('grid-center-layout', gridCenterStrategy);

  // 执行布局算法
  const layoutResult = await layoutManager.applyLayout(
    nodes,
    edges,
    {
      strategy: 'grid-center-layout',
      targetGroupId: selectedNodeId,  // 指定GroupA为布局目标
      layoutScope: 'group',
      animate: true,
      useWeightedLayout: true
    }
  );
  // ...
}, [nodes, edges, isProcessing, selectedNodeId, isGroupSelected, childrenCount, updateNode, updateEdge, updateGroupBoundary]);
```

### 2.2 参数传递与验证
在触发`handleGroupLayout`后，系统会进行多个验证步骤：
1. 检查是否有正在进行的布局操作（`isProcessing`）
2. 验证选中的节点是否为群组类型（`isGroupSelected`）
3. 检查群组是否包含子节点（`childrenCount > 0`）
4. 如果验证通过，继续执行；否则，输出警告信息并返回

## 3. 布局管理器阶段

### 3.1 布局管理器调用
`LayoutManager`类的`applyLayout`方法被调用，这个类负责管理和调度不同的布局策略。

**涉及文件**: `src/services/layout/LayoutManager.ts`
**主函数**: `applyLayout`

```ts
async applyLayout(nodes: (Node | Group)[], edges: Edge[], options?: LayoutOptions): Promise<LayoutResult> {
  // 检查是否已有进行中的操作
  if (this.currentOperation) {
    console.warn('Layout operation already in progress, cancelling previous operation');
    this.cancelCurrentOperation();
  }

  // 重置取消标志
  this.isOperationCancelled = false;

  // 创建新的操作Promise
  this.currentOperation = this.executeLayout(nodes, edges, options);

  try {
    const result = await this.currentOperation;
    return result;
  } finally {
    // 清除当前操作引用
    this.currentOperation = undefined;
  }
}
```

### 3.2 策略执行
布局管理器会根据选项调用相应的布局策略。由于传入了`targetGroupId: selectedNodeId`（即GroupA的ID），系统会选择群组内布局模式。

## 4. 布局策略执行阶段

### 4.1 策略选择与初始化
在`GridCenterLayoutStrategy`中，由于检测到`options?.targetGroupId`存在且不为null，系统跳过递归布局检查，直接进入群组内部布局逻辑。

**涉及文件**: `src/services/layout/strategies/GridCenterLayoutStrategy.ts`
**主函数**: `applyLayout`

```ts
async applyLayout(
  nodes: (Node | Group)[],
  edges: Edge[],
  options?: GridCenterLayoutStrategy
): Promise<LayoutResult> {
  // ...
  // 检测是否为群组内部布局
  if (options?.targetGroupId) {
    const parentGroup = nodes.find(n =>
      n.id === options.targetGroupId && n.type === BlockEnum.GROUP
    ) as Group | undefined;

    if (!parentGroup) {
      throw new Error(`目标群组 ${options.targetGroupId} 不存在`);
    }

    console.log(`📐 对群组 ${parentGroup.id} 内的 ${targetNodes.length} 个子节点进行布局`);
    // ...
  }
}
```

### 4.2 目标节点筛选
系统调用`getTargetNodes`函数来筛选出GroupA的所有直接子节点，这些节点包括：
- Note1
- Note2
- GroupB

**重要**: NoteD不会被包含在内，因为它不是GroupA的直接子节点，而是GroupB的子节点。

**涉及函数**: `getTargetNodes`

```ts
private getTargetNodes(
  allNodes: (Node | Group)[],
  options?: GridCenterLayoutOptions
): (Node | Group)[] {
  const targetGroupId = options?.targetGroupId;

  let filteredNodes: (Node | Group)[];

  if (!targetGroupId) {
    // 全画布布局逻辑
    filteredNodes = allNodes.filter(node =>
      !('groupId' in node) || !(node as Node).groupId
    );
  } else {
    // 群组内部布局逻辑：返回指定群组的直接子节点
    filteredNodes = allNodes.filter(node =>
      'groupId' in node && (node as Node).groupId === targetGroupId
    );
  }
  
  // 去重处理
  const uniqueNodes = new Map<string, Node | Group>();
  filteredNodes.forEach(node => {
    if (!uniqueNodes.has(node.id)) {
      uniqueNodes.set(node.id, node);
    }
  });

  return Array.from(uniqueNodes.values());
}
```

### 4.3 群组内部网格布局计算
系统使用`calculateGroupGridLayout`函数在GroupA的边界内对Note1、Note2和GroupB进行网格布局。

**涉及函数**: `calculateGroupGridLayout`

```ts
private calculateGroupGridLayout(
  nodes: (Node | Group)[],
  parentGroup: Group,
  options?: GridCenterLayoutOptions
): (Node | Group)[] {
  if (nodes.length === 0) return nodes;

  const padding = LAYOUT_CONFIG.group;
  const groupWidth = parentGroup.width || LAYOUT_CONFIG.nodeSize.groupNode.width;
  const groupHeight = parentGroup.height || LAYOUT_CONFIG.nodeSize.groupNode.height;

  // 1. 计算可用空间（相对于群组内部）
  const availableWidth = groupWidth - padding.paddingLeft - padding.paddingRight;
  const availableHeight = groupHeight - padding.paddingTop - padding.paddingBottom;

  // 2. 获取节点尺寸
  const nodeWidths = nodes.map(n => n.width || LAYOUT_CONFIG.nodeSize.defaultNode.width);
  const nodeHeights = nodes.map(n => n.height || LAYOUT_CONFIG.nodeSize.defaultNode.height);
  const avgNodeWidth = nodeWidths.reduce((a, b) => a + b, 0) / nodes.length;
  const avgNodeHeight = nodeHeights.reduce((a, b) => a + b, 0) / nodes.length;

  // 3. 智能计算最优列数
  const minSpacing = 20;
  const estimatedCols = Math.floor(availableWidth / (avgNodeWidth + minSpacing));
  const optimalCols = Math.max(1, Math.min(estimatedCols, Math.ceil(Math.sqrt(nodes.length))));
  const rows = Math.ceil(nodes.length / optimalCols);

  console.log(`  └─ 群组内布局: ${nodes.length}个节点, ${optimalCols}列 x ${rows}行, 可用空间: ${Math.round(availableWidth)}x${Math.round(availableHeight)}`);

  // 4. 计算自适应间距
  // ...

  // 5. 计算网格在可用空间中的起始偏移（居中对齐）
  // ...

  // 6. 使用相对位置布局每个节点
  return nodes.map((node, index) => {
    const row = Math.floor(index / optimalCols);
    const col = index % optimalCols;

    const nodeWidth = nodeWidths[index];
    const nodeHeight = nodeHeights[index];

    // 计算相对于群组内部padding区域的相对位置
    const relativeX = offsetX + col * (avgNodeWidth + horizontalSpacing) + nodeWidth / 2;
    const relativeY = offsetY + row * (avgNodeHeight + verticalSpacing) + nodeHeight / 2;

    // 转换为相对于群组左上角的位置（加上padding）
    const groupRelativeX = padding.paddingLeft + relativeX;
    const groupRelativeY = padding.paddingTop + relativeY;

    // 转换为画布绝对位置
    const absoluteX = parentGroup.position.x + groupRelativeX;
    const absoluteY = parentGroup.position.y + groupRelativeY;

    return {
      ...node,
      position: { x: absoluteX, y: absoluteY }
    };
  });
}
```

这个函数会：
1. 计算GroupA内部可用的布局空间（扣除边界padding）
2. 根据Note1、Note2和GroupB的尺寸计算最优的网格布局
3. 将这三个节点在GroupA内部进行网格排列

### 4.4 碰撞检测与解决
在网格布局计算完成后，系统会调用`resolveCollisions`函数来解决节点之间可能存在的重叠问题。

**涉及函数**: `resolveCollisions`

### 4.5 嵌套节点位置更新
由于GroupB将被移动，其内部的NoteD需要相应调整位置以保持正确的嵌套关系。系统调用`updateNestedNodePositions`函数来处理这种嵌套结构的位置更新。

**涉及函数**: `updateNestedNodePositions`

```ts
private updateNestedNodePositions(
  originalNodes: (Node | Group)[],
  positionedNodes: (Node | Group)[],
  layoutedNodeIds?: Set<string>
): (Node | Group)[] {
  // ...
  
  // 对于每个嵌套节点，计算其绝对位置
  for (const nestedNode of nestedNodes) {
    // 如果该节点刚被布局算法显式处理，直接使用新位置
    if (layoutedNodeIds && layoutedNodeIds.has(nestedNode.id)) {
      const layoutedNode = positionedNodeMap.get(nestedNode.id);
      if (layoutedNode) {
        // 直接使用布局算法给出的新位置，不重新计算
        resultNodes.push(layoutedNode);
        continue;
      }
    }

    // 否则，根据父节点的新位置计算嵌套节点的绝对位置
    const absolutePosition = this.calculateAbsolutePosition(
      nestedNode,
      originalNodeMap,
      positionedNodeMap
    );

    // 将计算出的绝对位置应用到节点
    resultNodes.push({
      ...nestedNode,
      position: absolutePosition
    });
  }

  // ...
}
```

这个函数确保NoteD会跟随GroupB移动，因为NoteD的位置是相对于其父节点GroupB计算的。

## 5. 群组边界更新阶段

### 5.1 边界更新触发
布局计算完成后，`LayoutControl`会调用`updateGroupBoundary`函数来更新GroupA的边界，使其能够完全包含重新排列后的子节点。

**涉及函数**: `updateGroupBoundary` (在`groupBoundaryOperations.ts`中)

```ts
updateGroupBoundary: (groupId: string) => {
  // 优化：清除该群组的旧定时器
  if (boundaryUpdateTimers.has(groupId)) {
    clearTimeout(boundaryUpdateTimers.get(groupId)!);
  }

  // 优化：使用防抖，避免频繁更新（50ms内的多次调用合并为一次）
  const timer = setTimeout(() => {
    set((state: any) => {
      const group = state.nodes.find((node: Node | Group) =>
        node.id === groupId && node.type === BlockEnum.GROUP
      ) as Group;

      if (!group) {
        console.log(`⚠️ 群组 ${groupId} 未找到`);
        return state;
      }

      // 使用循环向上递归更新所有祖先群组
      let updatedNodes = state.nodes;

      // 收集需要更新的群组链（从当前群组到最顶层）
      const groupChain: string[] = [];
      let tempGroupId: string | undefined = groupId;
      while (tempGroupId) {
        groupChain.unshift(tempGroupId); // 添加到数组开头，这样最顶层的在前面
        const tempGroup = updatedNodes.find((n: Node | Group) => n.id === tempGroupId) as Group | undefined;
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

    // 清除定时器引用
    boundaryUpdateTimers.delete(groupId);
  }, 50); // 50ms 防抖延迟

  // 保存定时器引用
  boundaryUpdateTimers.set(groupId, timer);
}
```

### 5.2 单个群组边界更新
`updateSingleGroupBoundary`函数计算GroupA的边界，使其能够包含重新排列后的所有子节点（Note1、Note2和GroupB）。

**涉及函数**: `updateSingleGroupBoundary`

```ts
const updateSingleGroupBoundary = (groupId: string, nodes: (Node | Group)[]): (Node | Group)[] => {
  const group = nodes.find((node: Node | Group) =>
    node.id === groupId && node.type === BlockEnum.GROUP
  ) as Group;

  if (!group) {
    console.log(`⚠️ 群组 ${groupId} 未找到`);
    return nodes;
  }

  const groupNodes = nodes.filter((node: Node | Group) =>
    'groupId' in node && node.groupId === groupId
  );

  if (groupNodes.length === 0) {
    console.log(`📏 群组 ${groupId} 内无节点，保持当前尺寸`);
    return nodes;
  }

  // 计算所有子节点的边界（绝对坐标）
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

  // ... 根据需要调整群组的大小和位置

  // 更新节点
  return nodes.map((node: Node | Group) => {
    if (node.id === groupId) {
      return {
        ...node,
        position: { x: safeNumber(newGroupX), y: safeNumber(newGroupY) },
        width: safeNumber(newWidth, 300),
        height: safeNumber(newHeight, 200),
        boundary: {
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
}
```

## 6. 结果应用与UI更新阶段

### 6.1 布局结果应用
在`LayoutControl`中，系统会将计算出的布局结果应用到实际的节点上。

```tsx
if (layoutResult.success) {
  // 启用布局模式以防止约束逻辑干扰
  useGraphStore.getState().setIsLayoutMode(true);

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

  console.log(`✅ 群组布局完成，更新了 ${layoutResult.nodes.size} 个节点`);

  // 🔧 触发群组边界更新以确保父群组大小及时调整
  console.log(`🔧 触发群组边界更新: ${selectedNodeId}`);
  updateGroupBoundary(selectedNodeId);

  // 额外的边优化
  // ...
}
```

### 6.2 布局模式设置
系统会设置`isLayoutMode`为true，以防止在布局过程中应用其他约束逻辑，然后在操作完成后重置为false。

### 6.3 UI更新
ReactFlow会接收到节点位置更新的通知，并重新渲染受影响的节点。

## 7. 特殊情况说明

### 7.1 嵌套结构的处理
- NoteD作为GroupB的子节点，不会被直接参与GroupA的网格布局计算
- 但当GroupB移动时，NoteD会跟随其父群组移动，保持相对位置
- 这种处理方式保持了嵌套结构的完整性

### 7.2 群组尺寸调整
- 群组A可能会因为子节点的重新排列而调整尺寸
- 边界更新机制确保群组A能够完全包含所有子节点
- 如果子节点分布需要更大的空间，群组A会相应扩大

## 8. 性能优化措施

1. **防抖机制**: `updateGroupBoundary`使用50ms延迟防抖来避免频繁更新
2. **异步处理**: 布局算法异步执行，不阻塞UI线程
3. **批量更新**: 节点位置批量更新，减少UI重渲染次数
4. **缓存机制**: 在边界更新中使用缓存避免重复计算

## 9. 总结

选中嵌套GroupA并点击"群组内布局"的完整流程包括：
1. UI触发和参数验证
2. 布局管理器调度
3. 布局策略执行（获取直接子节点、网格布局计算、碰撞解决）
4. 嵌套节点位置更新
5. 群组边界更新
6. 结果应用到UI

整个过程确保了嵌套结构的完整性，同时实现了对选中群组内部节点的有效重新排列。