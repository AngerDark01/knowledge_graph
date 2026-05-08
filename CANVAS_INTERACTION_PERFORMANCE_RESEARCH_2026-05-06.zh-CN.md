# 画布交互与性能优化研究

日期：2026-05-06

## 1. 文档定位

这份文档沉淀 Ontology Canvas 后续实现节点拖拽、Domain 嵌套、成组移动、LOD、视口裁剪和持久化同步时必须遵守的经验。

它不是产品交互规格的替代品。用户视角交互以 `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` 为准；旧项目技术契约以 `NODE_DOMAIN_INTERACTION_CONTRACT_2026-05-06.zh-CN.md` 为准。

本文件解决的问题是：

- 怎么让节点拖拽更顺滑。
- 怎么保留旧项目已经正确的 Domain 嵌套交互。
- 怎么避免性能优化时破坏父子关系、位置更新和边界扩展。
- 怎么把 Dify、React Flow、tldraw 这类项目的经验落到我们当前架构里。

## 2. 参考来源

### 2.1 外部资料

- React Flow 性能文档：`https://reactflow.dev/learn/advanced-use/performance`
- React Flow Sub Flows / 父子节点文档：`https://reactflow.dev/learn/layouting/sub-flows`
- tldraw 性能文档：`https://tldraw.dev/sdk-features/performance`

### 2.2 本地项目

Dify 本地代码：

- `/home/aseit/桌面/cloud/.dify/dify-main/web/app/components/workflow/index.tsx`
- `/home/aseit/桌面/cloud/.dify/dify-main/web/app/components/workflow/hooks/use-nodes-interactions.ts`
- `/home/aseit/桌面/cloud/.dify/dify-main/web/app/components/workflow/hooks/use-selection-interactions.ts`
- `/home/aseit/桌面/cloud/.dify/dify-main/web/app/components/workflow/hooks/use-nodes-sync-draft.ts`
- `/home/aseit/桌面/cloud/.dify/dify-main/web/app/components/workflow/store/workflow/workflow-draft-slice.ts`
- `/home/aseit/桌面/cloud/.dify/dify-main/web/app/components/workflow/nodes/iteration/use-interactions.ts`
- `/home/aseit/桌面/cloud/.dify/dify-main/web/app/components/workflow/nodes/loop/use-interactions.ts`
- `/home/aseit/桌面/cloud/.dify/dify-main/web/app/components/workflow/utils/node.ts`

原始项目存档：

- `/home/aseit/桌面/cloud/knowledge-graph`

当前项目：

- `/home/aseit/桌面/cloud/test/knowledge_graph`

## 3. 总结结论

画布性能问题不能只靠 `memo` 或减少样式解决。真正的关键是把交互拆成三层：

```text
拖拽中的临时视觉态
  -> ReactFlow / canvas engine 本地状态

拖拽结束后的语义提交
  -> ontology interaction model 批量生成 view patch

保存、历史、布局、边优化
  -> 在 commit 后 debounce / idle / 手动触发
```

对我们这个项目来说，最重要的结论是：

1. 本体 view 的节点和 Domain 位置继续采用画布绝对坐标。
2. ReactFlow 的 `parentId + relative position` 只存在 adapter 投影层。
3. 拖拽中不写持久化，不跑布局，不重算全图边，不刷新整张本体文档。
4. 拖拽结束时一次性提交本体 view patch。
5. 移动父 Domain 必须在同一个事务中平移所有后代 node/domain view。
6. Domain 边界扩展必须写回 `OntologyViewState.domainViews`，不能只写旧 graph store。
7. LOD 不能只传一个标记，节点 UI 必须真正减少 DOM。
8. UI token、交互规则、布局算法配置必须分离。

## 4. React Flow 经验

React Flow 适合作为当前 Ontology Canvas 的底座，但前提是不要把它当作语义真相源。

### 4.1 性能重点

React Flow 官方性能建议的核心可以归纳为：

- memoize 自定义节点和边组件。
- `nodeTypes`、`edgeTypes`、事件 handler、配置对象保持稳定引用。
- 不要在组件中直接订阅整张 `nodes` 或 `edges`。
- 选择、hover、临时状态不要导致所有节点重新渲染。
- 大图中通过隐藏节点、折叠和只渲染必要元素降低渲染量。

对应到本项目：

```text
错误方向：
  ClassNodeView 直接 useOntologyDocumentStore(state => state.document)

正确方向：
  adapter/blocks 计算 node view props
  ClassNodeView 只接收 props + token + callback
```

节点 UI 不能直接读取全局 store。否则 hover、selection、viewport、editing draft 这些状态变化很容易让所有节点重渲染。

### 4.2 父子节点经验

React Flow 的父子节点模型适合表达 Domain：

```text
parent node:
  type = domain

child node:
  parentId = domainId
  position = childAbsolute - parentAbsolute
  extent = "parent"
  expandParent = true
```

但这里有一个容易踩的坑：React Flow child 的 position 是相对父节点的，不能直接作为本体文档的真相坐标。

我们必须继续沿用旧项目的正确契约：

```text
OntologyViewState:
  absolute position

ReactFlow adapter:
  absolute -> relative

drag stop:
  relative -> constrained absolute -> ontology view patch
```

## 5. tldraw 经验

tldraw 更像无限画布引擎，不是本体图编辑器，但它的性能思想很有价值：

- 视口外 shape 不应该完整参与渲染。
- zoom 变化时要有 LOD，远景显示简化形态。
- store 更新要批处理，避免一次交互触发大量独立 patch。
- 高频交互不要把所有派生数据都同步到 React render tree。

对应到本项目：

```text
100% zoom:
  节点显示标题、类型、主要属性、字段行、状态

50% zoom:
  节点显示标题、类型、属性数量

20% zoom:
  节点显示标题或缩写、类型色条

10% zoom:
  节点显示最小块或点状标记
```

LOD 的验收不是 data 里有 `lodMode`，而是 DOM 真的变少。远景时不应该继续渲染完整字段列表、按钮、输入框和 hover 控件。

## 6. Dify 画布经验

Dify 的 workflow canvas 不等同于我们的本体 Domain，但它提供了几个可借鉴的工程拆法。

### 6.1 交互 hook 与同步 hook 分离

Dify 把节点交互集中在 `use-nodes-interactions.ts`，同步草稿集中在 `use-nodes-sync-draft.ts` 和 `workflow-draft-slice.ts`。

值得借鉴的点：

- 节点拖拽、连接、选择、复制、删除是交互层。
- 草稿同步是独立 hook。
- 默认同步通过 debounce，立即同步只在明确需要时触发。
- 页面隐藏时用 `sendBeacon` 做关闭前保存。
- 视口变化在 `onEnd` 后同步，而不是每帧同步。

对本项目的落位：

```text
features/ontology-canvas/model/interactions
  commitNodeDrag()
  commitDomainDrag()
  updateDomainBoundaryCascade()

features/ontology-canvas/state
  applyInteractionPatch()

data-layer/workspace
  saveOntologyCanvas()
```

交互 model 只产出 patch，不直接保存。保存由 data-layer/repository 在 commit 后 debounce。

### 6.2 拖拽中只处理必要视觉状态

Dify 在 `onNodeDrag` 中处理辅助线、嵌套容器限制等即时反馈；在 `onNodeDragStop` 才同步草稿和历史。

我们的版本要更克制：

- 拖拽中可以更新 ReactFlow 本地位置。
- 拖拽中可以显示辅助线、命中 Domain 高亮、边界预览。
- 拖拽中不写本体文档真相源。
- 拖拽中不保存 JSON。
- 拖拽中不触发 layout。
- 拖拽中不更新全量 history。

拖拽结束后执行一次事务：

```text
read ReactFlow final node
  -> relative position 转 absolute
  -> apply constraint
  -> update domain boundary cascade
  -> batch apply ontology view patch
  -> mark dirty
  -> debounced save
  -> push history entry
```

### 6.3 嵌套容器 padding 与尺寸扩展

Dify 的 Iteration / Loop 节点有类似容器节点的交互：

- child 使用 `parentId`。
- child 位置相对父节点。
- 拖动 child 时按父容器 padding 限制。
- child 尺寸变化后父容器可扩展。
- 连接时限制同层节点连接，避免跨容器连接混乱。

可借鉴但不能照搬：

```text
Dify:
  ReactFlow position 本身就是运行态

我们:
  OntologyViewState absolute position 才是真相源
  ReactFlow relative position 只是渲染投影
```

所以我们不能把 Dify 的 `node.position` 直接当本体位置写入。我们要借鉴它的“容器约束、padding、同层关系限制、同步节奏”，而不是复制它的数据契约。

### 6.4 历史记录防抖

Dify 对 history 记录做 debounce，避免短时间内产生大量几乎相同的历史状态。

本项目后续 history 应改成 command/patch history：

```text
一次拖拽 = 一个 history entry
一次 Domain 移动 = 一个包含后代 offset 的 history entry
一次属性编辑保存 = 一个 history entry
hover / selection / viewport moving 不进 history
```

## 7. 对当前 Phase A 的实现建议

### 7.1 Phase A 先修交互正确性

新增纯 model：

```text
frontend/features/ontology-canvas/model/interactions/domainNesting.ts
```

建议函数：

```ts
commitNodeDrag(document, input) -> OntologyInteractionPatch
commitDomainDrag(document, input) -> OntologyInteractionPatch
commitNodeResize(document, input) -> OntologyInteractionPatch
updateDomainBoundaryCascade(document, domainId) -> OntologyInteractionPatch
projectReactFlowPositionToAbsolute(document, input) -> Point
collectDomainDescendantViewIds(document, domainId) -> { nodeIds; domainIds }
```

这个模块的边界：

- 不 import React。
- 不 import ReactFlow。
- 不 import Zustand。
- 不 import UI。
- 不直接 fetch/save。
- 只读 `OntologyDocumentState`，输出 patch。

### 7.2 store 增加批量 patch 入口

当前单独更新 node view / domain view 容易造成事务不完整。

需要新增：

```text
ontologyDocumentStore.applyInteractionPatch(patch)
```

patch 应能一次性包含：

- 多个 `nodeViews[id].position/size`。
- 多个 `domainViews[id].position/size/collapsed`。
- 受影响 edge view。
- revision increment。
- dirty flag。

父 Domain 移动必须成为一次 batch：

```text
Domain A position += offset
Domain B position += offset
Class C position += offset
Class D position += offset
```

不能先更新父 Domain，再等别的链路补后代。这正是当前回归的来源。

### 7.3 ReactFlow 事件接线

建议事件链路：

```text
onNodeDragStart
  记录 drag session：id、start absolute、parent domain、document revision

onNodeDrag
  ReactFlow 本地位置 + 可选辅助线/命中提示
  不写 ontology document

onNodeDragStop
  如果 revision 仍匹配：
    调用 commitNodeDrag / commitDomainDrag
    applyInteractionPatch
    sync legacy display cache
    mark dirty + debounce save
```

如果拖拽期间 document revision 变化，应该放弃旧拖拽结果或重新基于最新 document 计算，不能盲目覆盖。

### 7.4 Domain 内创建节点

从用户角度，“在 Domain 里创建节点”必须自动完成父子关系和边界处理。

建议实现：

```text
createOntologyClassNodeInDocument({
  domainId,
  preferredPosition
})
  -> choose position inside domain
  -> create node semantics
  -> create node view absolute position
  -> update domain membership
  -> update boundary cascade if needed
  -> batch patch
```

节点创建位置应是绝对坐标。adapter 投影时再转相对坐标。

### 7.5 Domain 归属变更

当前产品规格已把“拖进 Domain 自动归属”调整为“控制面板中选择可归入 Domain，点击后进入 Domain 并调整位置”。

这对性能更友好：

- 不需要拖拽中每帧做复杂 hit test。
- 避免用户误操作破坏父子关系。
- 可以在显式操作时一次性计算新父 Domain、约束位置、更新边界。

后续如果恢复拖放归属，也应使用空间索引或 candidate list，不要每帧全量扫描所有 Domain。

### 7.6 边和布局

拖拽期间：

- 不跑 ELK/Dagre。
- 不重新计算全图 edge route。
- 不更新所有 relation label。

拖拽结束后：

- 只标记受影响节点关联边 dirty。
- 立即重算必要端点。
- 重路径或避障可以放 idle/worker。

布局算法：

- 只能手动触发或异步触发。
- 输入是中立 DTO。
- 输出是 ontology view patch。
- 应用前检查 revision。

## 8. 节点 UI 的性能落位

节点 UI 要拆成三类文件：

```text
features/ontology-canvas/ui/
  ClassNodeView.tsx
  DomainNodeView.tsx
  NodeFieldList.tsx
  NodeSection.tsx

features/ontology-canvas/config/
  nodeViewTokens.ts
  domainViewTokens.ts
  canvasInteractionConfig.ts
  lodConfig.ts

features/ontology-canvas/model/interactions/
  domainNesting.ts
```

规则：

- UI 组件只收 props、token、callback。
- 节点宽高、padding、字号、属性行高、折叠阈值来自 config/token。
- 颜色、阴影、状态样式来自语义 token。
- 节点 UI 不直接 import interaction model。
- interaction model 不 import UI token。
- 布局算法不读 UI token，只读 adapter 生成的 layout DTO。

LOD 具体要求：

| LOD | 节点 UI |
|-----|---------|
| full | 标题、类型、属性分区、关键字段、状态、快速新增属性入口 |
| compact | 标题、类型、属性数量、异常/状态摘要 |
| outline | 标题或缩写、类型色条、最小状态 |
| dot | 最小块/点，不渲染属性 DOM |

## 9. 性能红线

以下行为禁止进入最终主线：

1. 拖拽中保存 workspace JSON。
2. 拖拽中把整张 `OntologyDocumentState` clone 一遍。
3. 拖拽中每帧写旧 graph store 和 ontology store 两套真相源。
4. 拖拽父 Domain 只移动父框，不移动本体 view 后代。
5. Domain 边界扩展只写旧 graph store，不写本体 `domainViews`。
6. 节点 UI 直接订阅全局 document。
7. 远景 LOD 仍渲染完整属性 DOM。
8. selection / hover 变化导致所有节点重渲染。
9. 自动布局在拖拽中运行。
10. 大图 hit test 每帧全量扫描所有节点和 Domain。

## 10. 验收清单

### 10.1 正确性

- 拖动节点后点击节点不回弹。
- 拖动节点后点击画布不回弹。
- 拖动父 Domain 后，所有子节点和子 Domain 保持相对位置。
- 父 Domain 移动后点击任意子节点不回弹。
- Domain 内创建节点后，节点自动归属该 Domain。
- 节点被约束在 Domain 内时，保存的是约束后的最终位置。
- Domain 自动扩展后，保存再加载尺寸不丢失。
- 多层 Domain 边界扩展能向祖先级联。

### 10.2 性能

- 拖拽中没有保存请求。
- 拖拽中没有布局任务。
- 拖拽中没有全图边路径重算。
- 视口外节点不完整渲染。
- 远景 LOD 节点 DOM 明显减少。
- history 一次拖拽只产生一条记录。
- 500 节点内可编辑，2000 节点可浏览。

### 10.3 架构

- `domainNesting.ts` 只依赖本体 model/type。
- `ClassNodeView` / `DomainNodeView` 不直接 import store。
- UI token 和算法 config 分离。
- data-layer 仍是唯一保存出口。
- legacy graph store 不再参与最终位置判断。

## 11. 对后续阶段的影响

### Phase A：交互与性能基线稳定

优先级最高。先修正确性，再继续布局算法。

必须完成：

- 本体 view interaction model。
- 批量 interaction patch。
- Domain 移动后代 offset。
- 节点约束后坐标提交。
- Domain 边界级联同步。
- 对应 runtime tests。
- 浏览器实测 resize / drag / edge anchor 顺滑性。
- 容器折叠后真实减少内部渲染。

### Phase B：节点/容器 UI 产品化

在交互正确性修完后做。

必须完成：

- 本体节点 UI 显示属性。
- 节点上新增属性入口。
- 属性折叠。
- LOD 真实降 DOM。
- token/config 独立。
- 按 `UI_REFERENCE_INTERACTION_SPEC_2026-05-07.zh-CN.md` 落地节点状态、入口和数量徽标。

### Phase F：Feature 化、旧 UI/store 清理

在交互、UI、LOD、正交边和子画布主线稳定后继续。

必须完成：

- layout/history/edge optimizer 改用本体 DTO 或 view patch。
- 删除 `Canvas.graphData` 显示缓存。
- 删除旧 Node/Group 真相源路径。

算法 DTO、layout job、worker 和 patch history 放到 `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md` 的 Phase G，不在交互和 UI 尚未稳定时提前执行。

## 12. 当前判断

当前项目不是“优化过头”导致交互被故意删掉，而是运行态迁移做到一半：ReactFlow 显示真相源切到了 `OntologyDocumentState`，但嵌套事务仍有一部分只完整写入旧 graph store。

修复方向不是回滚到旧项目，而是把旧项目正确的交互契约搬到新的本体 interaction model 里：

```text
旧项目正确交互
  -> 抽象成本体 view patch 规则
  -> 批量提交到 OntologyDocumentState
  -> ReactFlow adapter 只负责投影
  -> UI 只负责展示
```

这样既保留你旧项目调好的嵌套体验，也能继续推进性能、架构和旧实现清理。

## 13. 2026-05-07 补充：resize、边锚点和参考图约束

### 13.1 resize 顺滑性

节点放大缩小卡顿，通常来自三类问题：

- resize 过程中每一帧写 store、保存或投影整图。
- 节点组件在尺寸变化后用 `useEffect` 追加写旧状态，造成二次渲染。
- 完整节点 DOM 太重，resize 时属性列表、阴影、标签、边和编辑入口一起刷新。

当前项目规则：

- resize 过程中允许 ReactFlow 做本地交互反馈。
- 只在 resize 结束后提交本体 view 尺寸。
- 自定义展开尺寸写入本体 `nodeViews.customExpandedSize`，不再由节点 UI 渲染后写旧 graph store。
- resize 结束后才触发容器边界级联和相关边锚点增量重算。

### 13.2 边锚点自适应

旧项目中已有 `EdgeOptimizer.calculateBestHandles()`：根据源/目标节点中心点角度选择 `top/right/bottom/left` 锚点。这个思路应保留，但写入目标必须变化：

```text
旧路径：EdgeOptimizer -> updateEdge(old graph store)
新路径：EdgeOptimizer -> OntologyInteractionPatch.edgeViews -> 本体 view -> ReactFlow 投影
```

验收标准：

- 节点移动后，相关边能从左侧、右侧、顶部、底部之间切换到更合适锚点。
- Domain / 容器移动时，后代节点相关边也纳入增量重算。
- resize 后，因节点尺寸变化导致中心点变化时，相关边也能重算锚点。
- 锚点结果不能只存在临时显示缓存，否则下一次本体投影会丢失。

### 13.3 正交边长期目标

当前 `CustomEdge` 仍使用贝塞尔曲线。参考图中目标是正交边系统：

- 方形折线，而不是柔性曲线。
- 支持关系类型线型：Association、Dependency、Inheritance、Composition、Aggregation、Reference、Event Flow、Data Flow。
- 支持通用锚点和语义锚点：节点边界、Field、Method、Section。
- 远景 LOD 下隐藏标签、合并平行边、只保留主关系。

因此边优化分两步：

1. 短期：恢复并本体化动态锚点选择。
2. 后续：将边渲染从贝塞尔迁到正交边和语义锚点。

### 13.4 参考图对 LOD 的约束

参考图明确了五级 LOD：

| 缩放 | 显示策略 |
|------|----------|
| 100% | 完整节点：字段、方法、子节点、可编辑入口 |
| 70% | 摘要节点：字段/方法数量、主要标题 |
| 40% | 标题节点：图标、标题、少量计数 |
| 15% | 图标节点：类型图标或小型状态 |
| 5% | 聚合 Cluster：区域、类型或关系聚合 |

当前只完成节点 UI 的基础 `full/compact/outline/dot` 降级，尚未完成 Cluster 聚合、Domain/容器 LOD、边 LOD 和 MiniMap LOD。
