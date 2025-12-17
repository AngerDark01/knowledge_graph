# 知识图谱画布性能优化方案

## 📊 性能问题分析

### 当前问题
1. **节点数量多时调整边界卡顿** - 每次调整都会触发完整的边界计算和父群组递归更新
2. **拖动节点时体验不流畅** - 频繁的状态更新和组件重渲染导致延迟
3. **整体画布响应缓慢** - 所有节点都会渲染，即使不在视口内

### 识别的性能瓶颈

#### 1. **过度渲染问题** (frontend/components/graph/core/GraphPageContent.tsx)
- **位置**: 第134-145行 - `useEffect` 同步 store 到 ReactFlow
- **问题**: 每次 `storeNodes` 变化都会完整同步所有节点，即使只改变了一个节点
- **影响**: 节点数量 > 50 时明显卡顿

```typescript
// 当前实现 - 每次都完整同步
useEffect(() => {
  if (isDraggingRef.current) return;
  const processedNodes = syncStoreToReactFlowNodes(storeNodes, selectedNodeId);
  setReactFlowNodes(processedNodes as ReactFlowNode[]);
}, [storeNodes, selectedNodeId]); // storeNodes 是完整数组，引用总是变化
```

#### 2. **频繁的边界计算** (frontend/stores/graph/nodes/groupBoundaryOperations.ts)
- **位置**: 第22-188行 - `updateSingleGroupBoundary` 函数
- **问题**:
  - 缓存时间太短（100ms）
  - 递归更新所有祖先群组（第209-230行）
  - 每次拖拽都会触发多次边界计算
- **影响**: 嵌套群组 > 3 层时拖动延迟明显

```typescript
// 当前实现 - 缓存时间太短
const CACHE_TTL = 100; // 仅 100ms

// 递归更新所有祖先
for (let i = groupChain.length - 1; i >= 0; i--) {
  updatedNodes = updateSingleGroupBoundary(targetGroupId, updatedNodes);
}
```

#### 3. **未优化的 ReactFlow 配置** (frontend/components/graph/core/GraphPageContent.tsx)
- **位置**: 第350-439行 - ReactFlow 组件配置
- **问题**:
  - 未启用 `onlyRenderVisibleElements` - 所有节点都会渲染
  - 未使用 `elevateNodesOnSelect` - 选中节点时重新计算 z-index
  - 事件处理未优化节流
- **影响**: 节点数量 > 100 时滚动/缩放卡顿

#### 4. **组件未充分优化** (frontend/components/graph/nodes/)
- **BaseNode.tsx** (第91-219行) 和 **GroupNode.tsx** (第14-141行)
- **问题**:
  - 虽然使用了 `memo`，但 props 引用频繁变化
  - 每次渲染都创建新的内联样式对象
  - 没有使用 `useCallback` 优化事件处理器
- **影响**: 拖动时所有可见节点都可能重渲染

#### 5. **状态管理未批量更新** (frontend/stores/graph/)
- **问题**: Zustand store 的更新未使用批处理
- **影响**: 单次操作可能触发多次组件更新

## 🎯 优化方案

### 优先级 1: ReactFlow 内置优化（立竿见影）

#### 1.1 启用视口渲染优化
**文件**: `frontend/components/graph/core/GraphPageContent.tsx`

```typescript
<ReactFlow
  nodes={reactFlowNodes}
  edges={reactFlowEdges}
  // ✅ 新增：仅渲染可见元素（对大图性能提升显著）
  onlyRenderVisibleElements={true}

  // ✅ 新增：选中节点时提升层级（避免重新计算所有 z-index）
  elevateNodesOnSelect={true}

  // ✅ 新增：启用快照到网格（减少状态更新频率）
  snapToGrid={true}
  snapGrid={[15, 15]}

  // ... 其他配置
>
```

**预期效果**:
- 节点数 > 100 时，渲染性能提升 60-80%
- 滚动/缩放流畅度显著提升

**风险**: `onlyRenderVisibleElements` 可能导致节点进入视口时有短暂初始化延迟

---

#### 1.2 优化 Memoization
**文件**: `frontend/components/graph/core/GraphPageContent.tsx`

```typescript
// ✅ 优化：将 nodeTypes 和 edgeTypes 移到组件外部
const NODE_TYPES = {
  custom: NoteNode,
  group: GroupNode,
} as const;

const EDGE_TYPES = {
  default: CustomEdge,
  crossGroup: CrossGroupEdge,
} as const;

const GraphPageContent = ({ className }: GraphPageProps) => {
  // ❌ 删除组件内的 useMemo（已移至外部）
  // const nodeTypes = useMemo(() => ({ ... }), []);

  // ✅ 直接使用外部常量
  return <ReactFlow nodeTypes={NODE_TYPES} edgeTypes={EDGE_TYPES} ... />
};
```

**预期效果**: 消除不必要的对象创建和比较

---

### 优先级 2: 减少不必要的重渲染

#### 2.1 优化节点同步机制
**文件**: `frontend/components/graph/core/GraphPageContent.tsx`

**问题**: 当前每次 `storeNodes` 变化都完整同步

**方案**: 使用浅比较或深比较优化，仅在真正变化时同步

```typescript
// ✅ 新增：节点变化检测
const prevNodesRef = useRef<(Node | Group)[]>([]);

useEffect(() => {
  if (isDraggingRef.current) return;

  // 浅比较：检查节点数量和ID是否变化
  const nodesChanged =
    storeNodes.length !== prevNodesRef.current.length ||
    storeNodes.some((node, idx) => node.id !== prevNodesRef.current[idx]?.id);

  if (!nodesChanged) {
    // 仅更新选中状态（避免完整同步）
    setReactFlowNodes(prev =>
      prev.map(node => ({
        ...node,
        selected: node.id === selectedNodeId
      }))
    );
    return;
  }

  // 节点真正变化时才完整同步
  const processedNodes = syncStoreToReactFlowNodes(storeNodes, selectedNodeId);
  setReactFlowNodes(processedNodes as ReactFlowNode[]);
  prevNodesRef.current = storeNodes;
}, [storeNodes, selectedNodeId]);
```

**预期效果**: 减少 70% 的完整同步次数

---

#### 2.2 优化组件 Props
**文件**: `frontend/components/graph/nodes/BaseNode.tsx` & `GroupNode.tsx`

```typescript
// ✅ 优化：避免内联对象创建
const BaseNode: React.FC<BaseNodeProps> = memo(({ ... }) => {
  // ❌ 当前：每次渲染创建新对象
  // const containerStyle = { width: '100%', height: '100%' };

  // ✅ 优化：使用常量
  const containerStyle = CONTAINER_STYLE; // 定义在组件外部

  // ✅ 优化：memoize 事件处理器
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // ...
  }, [/* 依赖项 */]);

  return <div style={containerStyle} onClick={handleClick}>...</div>;
}, (prevProps, nextProps) => {
  // ✅ 自定义比较函数：仅在关键 props 变化时重渲染
  return (
    prevProps.id === nextProps.id &&
    prevProps.selected === nextProps.selected &&
    prevProps.data.title === nextProps.data.title &&
    // ... 其他关键属性
  );
});

// 外部常量定义
const CONTAINER_STYLE = { width: '100%', height: '100%' } as const;
```

**预期效果**: 减少 40-60% 的组件重渲染

---

### 优先级 3: 边界计算优化

#### 3.1 增加边界缓存时间并智能失效
**文件**: `frontend/stores/graph/nodes/groupBoundaryOperations.ts`

```typescript
// ✅ 优化：延长缓存时间
const CACHE_TTL = 500; // 从 100ms 延长到 500ms

// ✅ 新增：缓存失效策略
interface BoundaryCacheEntry {
  timestamp: number;
  nodeIds: string;
  positions: string; // 新增：节点位置哈希
  boundary: { minX: number; minY: number; maxX: number; maxY: number };
}

const calculatePositionHash = (nodes: (Node | Group)[]): string => {
  return nodes
    .map(n => `${n.id}:${n.position.x},${n.position.y}`)
    .sort()
    .join('|');
};

// 在 updateSingleGroupBoundary 中
const positionHash = calculatePositionHash(groupNodes);
const cached = boundaryCache.get(groupId);

if (cached &&
    cached.nodeIds === nodeIdsKey &&
    cached.positions === positionHash &&  // ✅ 检查位置是否变化
    (now - cached.timestamp) < CACHE_TTL) {
  // 使用缓存...
}
```

**预期效果**: 减少 50% 的边界计算次数

---

#### 3.2 防抖边界更新
**文件**: `frontend/components/graph/core/GraphPageContent.tsx`

```typescript
// ✅ 新增：防抖边界更新
const updateBoundaryDebounced = useMemo(
  () => debounce((groupId: string) => {
    updateGroupBoundary(groupId);
  }, 150), // 150ms 防抖
  [updateGroupBoundary]
);

// 在 onNodeDragStop 中使用
const onNodeDragStop = useCallback((event, node) => {
  // ... 位置更新 ...

  if (storeNode.groupId) {
    // ✅ 使用防抖版本
    updateBoundaryDebounced(storeNode.groupId);
  }
}, [/* 依赖项 */]);
```

**预期效果**: 拖动时减少 70% 的边界更新调用

---

### 优先级 4: 批量状态更新

#### 4.1 使用 Zustand 批量更新
**文件**: `frontend/stores/graph/nodes/basicOperations.ts` 等

```typescript
import { unstable_batchedUpdates } from 'react-dom';

// ✅ 包装批量更新
const batchUpdate = (callback: () => void) => {
  unstable_batchedUpdates(callback);
};

// 在需要多次更新的操作中使用
export const handleGroupMove = (groupId: string, newPosition: Position) => {
  batchUpdate(() => {
    set((state) => {
      // 多次状态更新...
    });
  });
};
```

**预期效果**: 减少 30-50% 的渲染次数

---

### 优先级 5: 事件节流

#### 5.1 节流拖拽事件
**文件**: `frontend/components/graph/core/GraphPageContent.tsx`

```typescript
import { throttle } from 'lodash'; // 或自定义实现

// ✅ 新增：节流的拖拽处理
const onNodeDragThrottled = useMemo(
  () => throttle((event, node, nodes) => {
    // 处理拖拽中的实时更新（如果需要）
    console.log('Dragging:', node.id);
  }, 50), // 每 50ms 最多执行一次
  []
);

<ReactFlow
  onNodeDrag={onNodeDragThrottled}
  // ...
/>
```

**预期效果**: 拖动时减少 60% 的事件处理次数

---

## 📈 实施计划

### 阶段 1: 快速优化（1-2天）
1. ✅ 启用 `onlyRenderVisibleElements` 和 `elevateNodesOnSelect`
2. ✅ 将 `nodeTypes` 和 `edgeTypes` 移到组件外部
3. ✅ 增加边界缓存时间到 500ms

**预期收益**: 性能提升 40-60%

### 阶段 2: 渲染优化（3-5天）
1. ✅ 实现节点同步的浅比较优化
2. ✅ 优化 BaseNode 和 GroupNode 的 memo 和 props
3. ✅ 实现事件处理器的 useCallback 优化

**预期收益**: 额外性能提升 20-30%

### 阶段 3: 高级优化（5-7天）
1. ✅ 实现边界更新的防抖
2. ✅ 实现 Zustand 批量更新
3. ✅ 实现拖拽事件节流
4. ✅ 添加性能监控和分析工具

**预期收益**: 额外性能提升 10-20%

---

## 🔍 性能监控

### 添加性能指标追踪

**文件**: `frontend/components/graph/core/GraphPageContent.tsx`

```typescript
// ✅ 新增：性能监控
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      console.log(`🎨 Render time: ${(endTime - startTime).toFixed(2)}ms`);
    };
  }
}, [reactFlowNodes, reactFlowEdges]);

// ✅ 新增：帧率监控
const [fps, setFps] = useState(60);

useEffect(() => {
  let frameCount = 0;
  let lastTime = performance.now();

  const measureFps = () => {
    frameCount++;
    const currentTime = performance.now();

    if (currentTime >= lastTime + 1000) {
      setFps(frameCount);
      frameCount = 0;
      lastTime = currentTime;
    }

    requestAnimationFrame(measureFps);
  };

  const id = requestAnimationFrame(measureFps);
  return () => cancelAnimationFrame(id);
}, []);
```

---

## 📚 参考资料

### React Flow 官方文档
- [Performance Best Practices](https://reactflow.dev/learn/advanced-use/performance) - React Flow 性能优化指南
- [Stress Test Example](https://reactflow.dev/examples/nodes/stress) - 大规模节点压力测试

### 性能优化最佳实践
- [The Ultimate Guide to Optimize React Flow Performance](https://medium.com/@lukasz.jazwa_32493/the-ultimate-guide-to-optimize-react-flow-project-performance-42f4297b2b7b) - React Flow 性能优化完整指南
- [React Flow Performance Discussion](https://github.com/xyflow/xyflow/discussions/4975) - 大规模图形性能讨论
- [Synergy Codes Performance Guide](https://www.synergycodes.com/blog/guide-to-optimize-react-flow-project-performance) - React Flow 性能优化电子书

### 状态管理优化
- [Zustand Batch Updates](https://thinkthroo.com/blog/ReactDOMunstablebatchedUpdates-in-zustand) - Zustand 批量更新
- [Selective State Updates](https://app.studyraid.com/en/read/11286/352093/selective-state-updates) - 选择性状态更新
- [React State Batch Update Guide](https://medium.com/swlh/react-state-batch-update-b1b61bd28cd2) - React 状态批量更新

### 通用 React 性能
- [React App Performance Optimization 2025](https://www.zignuts.com/blog/react-app-performance-optimization-guide) - React 应用性能优化指南
- [React State Management 2025](https://www.zignuts.com/blog/react-state-management-2025) - 2025 状态管理对比

---

## 🎯 预期成果

### 优化前（估算）
- 节点数 50: 拖动延迟 100-200ms，边界调整 200-300ms
- 节点数 100: 拖动延迟 300-500ms，边界调整 500-1000ms
- 节点数 200+: 明显卡顿，FPS < 30

### 优化后（目标）
- 节点数 50: 拖动延迟 < 50ms，边界调整 < 100ms
- 节点数 100: 拖动延迟 < 100ms，边界调整 < 200ms
- 节点数 200: 拖动延迟 < 150ms，边界调整 < 300ms
- 节点数 500+: 可用，FPS > 30

### 整体性能提升
- **渲染性能**: 提升 70-90%
- **交互响应**: 提升 60-80%
- **内存使用**: 降低 30-40%
- **用户体验**: 显著改善

---

## ⚠️ 注意事项

1. **渐进式优化**: 建议按阶段实施，每个阶段都进行性能测试
2. **A/B 测试**: 对关键优化（如 `onlyRenderVisibleElements`）进行 A/B 测试
3. **向后兼容**: 保持 API 兼容性，避免破坏现有功能
4. **性能监控**: 添加性能指标追踪，持续优化
5. **用户反馈**: 在实际使用场景中验证优化效果

---

**文档版本**: 1.0
**创建日期**: 2025-12-17
**最后更新**: 2025-12-17
