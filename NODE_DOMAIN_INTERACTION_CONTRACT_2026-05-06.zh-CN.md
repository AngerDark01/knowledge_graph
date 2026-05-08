# 节点与 Domain 嵌套交互契约

日期：2026-05-06

## 1. 本轮结论

本文件是技术交互契约，解释如何保证节点和 Domain 交互不回归。真正从用户角度定义“应该交付什么体验”的文档是 `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md`。

后续开发优先级以产品交互规格为准：先满足用户可感知的创建、嵌套、拖拽、折叠、属性查看和编辑体验，再选择内部实现方式。

节点 UI 这一轮确实还没有重做。当前主要改动集中在本体数据、ReactFlow adapter、持久化和旧 graph store 退场准备上。

用户反馈的 Domain 嵌套交互回归是真问题，不是预期行为。旧项目 `/home/aseit/桌面/cloud/knowledge-graph` 的嵌套交互逻辑本身是成立的，核心性能问题来自渲染、状态同步和计算成本，而不是坐标/嵌套交互契约错误。

当前项目的问题在于：画布渲染真相源已经切到 `OntologyDocumentState`，但部分拖拽、边界扩展、父子同步逻辑仍只完整写入旧 graph store。旧 store 更新后并不再驱动画布投影，所以一旦下一次由本体文档重新投影 ReactFlow 节点，就会出现节点回弹、子节点跑出 Domain、Domain 移动后子孙位置不跟随等现象。

这属于 Phase 3 运行态切换过程中的交互契约迁移缺口，必须在继续布局算法重构前修复。

## 2. 旧项目的正确交互契约

旧项目采用的是“store 绝对坐标 + ReactFlow 相对投影”的设计。

### 2.1 坐标契约

旧 graph store 中所有 `Node | Group` 的 `position` 都是画布绝对坐标。

ReactFlow 渲染时，如果节点属于某个父 Group：

```text
 store position: absolute
 ReactFlow parentId: groupId
 ReactFlow position: child.absolute - parent.absolute
 ReactFlow extent: parent
 ReactFlow expandParent: true
```

也就是说，子节点在 store 里不是相对坐标；相对坐标只存在于 ReactFlow 投影层。

拖拽结束时，ReactFlow 返回的嵌套节点位置是相对父节点的位置，旧项目会立刻转换回绝对坐标：

```text
 absolute = reactFlowRelative + parentGroup.absolute
 updateNodePosition(id, absolute)
```

这是点击后不回弹的关键。

### 2.2 父子关系契约

节点属于 Group/Domain 时必须维护双向关系：

```text
 child.groupId = parentGroup.id
 parentGroup.nodeIds includes child.id
```

Group 嵌套 Group 也使用同一套规则：

```text
 childGroup.groupId = parentGroup.id
 parentGroup.nodeIds includes childGroup.id
```

旧项目不会直接在创建节点时手写 `groupId` 作为最终状态，而是先创建绝对坐标节点，再调用 `addNodeToGroup()`。这个函数负责：

1. 从旧父 Group 的 `nodeIds` 移除节点。
2. 校验 Group 嵌套循环和最大深度。
3. 把子节点位置约束到新父 Group 边界内。
4. 写入子节点 `groupId`。
5. 把子节点 id 写入父 Group `nodeIds`。

### 2.3 ReactFlow 投影契约

旧项目的 `syncStoreToReactFlowNodes()` 做了三件关键事：

1. 建立 `nodesMap`，用于 O(1) 查找父 Group。
2. 按嵌套深度排序，保证父 Group 一定排在子节点之前。
3. 对有 `groupId` 的节点设置：

```text
 parentId: groupId
 extent: "parent"
 expandParent: true
 position: absolute - parent.absolute
```

父节点先出现和相对坐标转换缺一不可。否则 ReactFlow 的嵌套约束会失效。

### 2.4 普通节点拖拽契约

普通节点拖拽停止后，旧项目执行：

1. 读取 ReactFlow 当前节点。
2. 如果节点在 Group 中，把 ReactFlow 相对坐标转为绝对坐标。
3. 调用 `updateNodePosition(id, absolutePosition)`。
4. `updateNodePosition()` 在非布局模式下把节点约束到父 Group 边界内。
5. 如果节点有父 Group，调用 `updateGroupBoundary(parentGroupId)`。
6. 更新与该节点相关的边连接点。

注意：约束后的坐标才是真正应进入下一次投影的坐标。

### 2.5 Domain/Group 拖拽契约

拖动 Group/Domain 时，旧项目不是只移动父框。它会计算 offset：

```text
 offset = newGroupAbsolutePosition - oldGroupAbsolutePosition
```

然后：

1. 更新 Group 自己的绝对坐标。
2. 找到所有后代节点和后代 Group。
3. 对所有后代绝对坐标应用同一个 offset。
4. 如果当前 Group 还有父 Group，更新父 Group 边界。
5. 更新关联边连接点。

这保证“父框移动时，内部结构整体跟着移动”，并且 store 里的所有位置仍然保持绝对坐标。

### 2.6 边界更新契约

`updateGroupBoundary(groupId)` 基于子节点绝对坐标计算子节点包围盒。

如果子节点超出当前 Group：

```text
 向右/向下扩展：只增加 width/height
 向左/向上扩展：调整 group.position，并增加 width/height
```

然后从当前 Group 往祖先 Group 递归更新，保证多层嵌套边界一致。

旧实现里有一个性能风险：边界缓存 key 只包含 child ids，不包含 child position/size，因此在高频拖动时可能复用过期边界。这个是性能优化点，不应通过删除边界契约来解决。

### 2.7 新增和拖放契约

选中 Group 后点击新增：

1. 按父 Group 绝对坐标和 padding 计算新节点绝对坐标。
2. 创建节点，但不直接最终写死 membership。
3. 调用 `addNodeToGroup()` 建立双向关系和边界约束。

拖放创建：

1. 通过 `screenToFlowPosition()` 得到画布绝对坐标。
2. 用绝对坐标查找包含该点的最小 Group。
3. 创建节点。
4. 如命中 Group，调用 `addNodeToGroup()`。

## 3. 当前项目的实际链路

当前项目的画布显示主链路已经变为：

```text
 ontologyDocumentStore.document
   -> projectOntologyDocumentToLegacyGraphNodes()
   -> projectNodesToReactFlowNodes()
   -> ReactFlow nodes
```

旧 graph store 仍存在，但它已经不再是 ReactFlow 投影真相源。它现在主要承担：

1. 旧组件兼容。
2. 旧布局、历史、边优化输入。
3. 过渡期 display bridge。

新增节点和新增 Domain 已经先写入本体文档，再投影旧 display node 给旧 graph store，这个方向是对的。

普通节点拖拽当前做了两份写入：

```text
 updateNodePosition(node.id, absolutePosition)       // 写旧 graph store
 updateOntologyNodeView({ nodeId, position })        // 写本体 view
```

Domain 拖拽当前做的是：

```text
 handleGroupMove(domainId, absolutePosition)         // 写旧 graph store，并平移旧 store 后代
 updateOntologyDomainView({ domainId, position })    // 只写本体 Domain 自己
```

这里已经和旧契约不一致：本体文档中的后代 `nodeViews/domainViews` 没有一起应用 offset。

另外，当前 `updateGroupBoundary()` 只更新旧 graph store 的 Group 边界，不会把新的 Domain position/width/height 同步回 `OntologyDomainViewState`。因此普通节点拖动或 resize 触发旧边界扩展后，下一次本体投影会丢掉这次边界扩展。

## 4. 当前回归原因

### 4.1 Domain 移动后子节点跑到外部

旧契约要求 Domain 移动时所有后代绝对坐标一起平移。

当前项目只把后代平移写进旧 graph store，没有写入本体 `view.nodeViews/domainViews`。由于 ReactFlow 下一次投影来自本体文档，子节点仍使用旧绝对坐标，而父 Domain 已经变成新绝对坐标：

```text
 child.relative = child.oldAbsolute - domain.newAbsolute
```

结果就是子节点在 ReactFlow 中相对父 Domain 偏移错误，表现为跑到 Domain 外部或位置错乱。

### 4.2 节点拖动后点击又回到原位置

这个现象说明 ReactFlow 本地状态和本体文档状态没有在同一次交互里提交成一致结果。

已确认的高风险点：

1. 当前画布 `onNodesChange()` 只更新 ReactFlow 本地 nodes；位置提交主要发生在 `onNodeDragStop()`。
2. `onNodeDragStop()` 仍依赖旧 graph store 查找 `storeNode/groupId`。如果旧 display bridge 与本体文档不同步，拖拽提交可能提前返回，导致本体 view 没更新。
3. `updateNodePosition()` 对旧 store 做边界约束，但 `updateOntologyNodeView()` 写入的是约束前的 `absolutePosition`，约束结果没有回写本体。
4. `updateGroupBoundary()` 的边界扩展结果没有同步本体 view。

因此一旦点击、选中、缩放或保存触发本体文档重新投影，ReactFlow 会被旧的 `OntologyViewState` 覆盖，表现为回弹。

### 4.3 这是优化 bug 还是后续计划

这是迁移不完整导致的交互 bug。

文档中原来把“拖拽、resize、展开、viewport 已同步更新 OntologyViewState”标为完成，但现在看这个判断过粗：只覆盖了单节点/单 Domain 的直接 view 更新，没有覆盖旧项目真正依赖的嵌套交互事务：

```text
 Domain move -> descendants offset
 node move -> constrained final position
 node move/resize -> domain boundary cascade
 boundary cascade -> ontology domain view patch
```

所以它不是“可以以后随便做的 UI 优化”，而是当前 Phase A 必须优先补上的正确性修复。

## 5. 保持交互不变的性能优化方案

外部资料、Dify 本地实现和旧项目经验的综合研究见 `CANVAS_INTERACTION_PERFORMANCE_RESEARCH_2026-05-06.zh-CN.md`。本节保留技术不变量，研究文档补充拖拽节奏、同步策略、LOD、视口裁剪和 Dify 可借鉴工程拆法。

性能优化不能破坏以下不变量：

1. 本体 view 中的位置仍采用绝对坐标。
2. ReactFlow 嵌套节点只在 adapter 投影时转为相对坐标。
3. Domain 移动必须平移所有后代绝对坐标。
4. 节点移动必须提交约束后的最终坐标。
5. Domain 边界扩展必须同步到本体 `domainViews`。
6. membership 必须保持 `node.domainId/domain.nodeIds` 或 `domain.parentDomainId/domain.domainIds` 双向一致。

建议拆出一个纯 model 层交互模块：

```text
 features/ontology-canvas/model/interactions/domainNesting.ts
```

它只处理本体文档和 view patch，不 import React、ReactFlow、Zustand 或 UI。

建议能力：

1. `commitNodeDrag(document, input)`
   输入节点 id、ReactFlow position、父 Domain id，输出约束后的 node view 和受影响 Domain boundary patch。

2. `commitDomainDrag(document, input)`
   输入 Domain id、新绝对坐标，计算 offset，并批量更新 Domain 自己及所有后代 node/domain view。

3. `updateDomainBoundaryCascade(document, domainId)`
   基于子节点绝对坐标计算当前 Domain 边界，并向祖先递归更新。

4. `projectReactFlowPositionToAbsolute(document, nodeId, reactFlowPosition)`
   统一处理 ReactFlow 相对坐标到本体绝对坐标的转换。

5. `collectDomainDescendantViewIds(document, domainId)`
   用 `OntologyDomain.nodeIds/domainIds` 递归收集后代，必须带 visited set，避免坏数据循环。

性能策略：

1. 拖拽中不每帧写 document，只让 ReactFlow 维护本地拖动状态。
2. 拖拽停止时一次性提交本体 view patch。
3. `ontologyDocumentStore` 增加批量 view patch action，避免一次拖拽触发多次 store set。
4. adapter 投影继续保持 viewport culling，但必须保留可见子节点的所有祖先 Domain。
5. LOD 继续传入 `lodMode`，后续节点 UI 真正按 LOD 降低 DOM，而不是只写 data。
6. Domain boundary 缓存 key 必须包含子节点 position/size/version，不能只按 child ids。
7. layout 算法后续只消费中立 `LayoutGraphDTO`，并输出本体 view patch，不直接改 ReactFlow/旧 graph store。

## 6. 修复优先级

### P0：补齐本体交互事务

先写测试，再修代码：

1. Domain A 内有 Class A，移动 Domain A 后，Class A 的本体绝对坐标也按相同 offset 平移。
2. Domain A 内有 Domain B，Domain B 内有 Class C，移动 Domain A 后，Domain B 和 Class C 都平移。
3. 拖动 Class A 到 Domain 边界外，提交后的本体 node view 使用约束后的坐标。
4. Class A 移动或 resize 导致 Domain A 扩展时，本体 domain view 的 position/width/height 同步更新。
5. 多层 Domain 边界扩展会向祖先级联。
6. ReactFlow adapter 投影仍保持 parentId/extent/expandParent 和相对坐标正确。

### P1：减少旧 graph store 参与度

修完 P0 后，`GraphPageContent` 的拖拽提交应优先调用本体交互 model。旧 graph store 只接收由本体文档投影出的 display cache，不能再作为判断最终位置和边界的真相源。

### P2：节点 UI 与 LOD

节点 UI 还没有重做。后续迁到：

```text
 features/ontology-canvas/ui/ClassNodeView.tsx
 features/ontology-canvas/ui/DomainNodeView.tsx
 features/ontology-canvas/blocks/OntologyCanvasBlock.tsx
```

UI 组件只收 props、token 和事件回调，不直接碰 store、document、fetch、layout 算法。

## 7. 对布局算法的要求

布局算法必须建立在上述交互契约上：

1. 输入使用绝对坐标和尺寸。
2. Domain/节点层级来自本体 graph 的 `domainId/parentDomainId` 与 `nodeIds/domainIds`。
3. 输出只能是 view patch：

```text
 nodeViews[id].position
 domainViews[id].position
 domainViews[id].width/height
 edgeViews[id].sourceHandle/targetHandle
```

4. 布局结果应用前必须校验 document revision，避免旧布局结果覆盖用户最新拖拽。
5. 自动布局不在拖拽中执行，只能手动触发或 worker 异步执行。

## 8. 代码定位

旧项目关键文件：

- `/home/aseit/桌面/cloud/knowledge-graph/frontend/components/graph/core/nodeSyncUtils.ts`
- `/home/aseit/桌面/cloud/knowledge-graph/frontend/components/graph/core/GraphPageContent.tsx`
- `/home/aseit/桌面/cloud/knowledge-graph/frontend/stores/graph/nodes/constraintOperations.ts`
- `/home/aseit/桌面/cloud/knowledge-graph/frontend/stores/graph/nodes/groupOperations.ts`
- `/home/aseit/桌面/cloud/knowledge-graph/frontend/stores/graph/nodes/groupBoundaryOperations.ts`
- `/home/aseit/桌面/cloud/knowledge-graph/frontend/components/graph/core/hooks/useNodeHandling.ts`
- `/home/aseit/桌面/cloud/knowledge-graph/frontend/utils/graph/recursiveMoveHelpers.ts`
- `/home/aseit/桌面/cloud/knowledge-graph/frontend/utils/graph/nestingHelpers.ts`

当前项目关键文件：

- `frontend/components/graph/core/GraphPageContent.tsx`
- `frontend/components/graph/core/hooks/useNodeHandling.ts`
- `frontend/features/ontology-canvas/adapters/react-flow/projection.ts`
- `frontend/features/ontology-canvas/adapters/legacy-graph/documentBridge.ts`
- `frontend/features/ontology-canvas/model/document/ontologyDocument.ts`
- `frontend/features/ontology-canvas/state/ontologyDocumentStore.ts`
- `frontend/stores/graph/nodes/constraintOperations.ts`
- `frontend/stores/graph/nodes/groupOperations.ts`
- `frontend/stores/graph/nodes/groupBoundaryOperations.ts`
