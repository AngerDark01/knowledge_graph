# 架构优化设计方案

## 目标

把当前 demo 重构成一个模块边界清晰的 Ontology Canvas 代码库：

- UI 渲染可以独立调整，不影响图谱行为逻辑。
- 本体数据不再和 ReactFlow 的运行时对象耦合。
- Domain、Group、Subgraph、Relation 语义成为一等模型，而不是散落在节点属性里。
- 高频视图状态不会触发持久化和历史记录。
- 旧 demo 代码在替代路径建立后可以安全删除。

## 当前架构问题

1. 领域数据、ReactFlow 视图数据、编辑状态、选中状态、历史记录和持久化逻辑混在同一个 graph store 里。
2. `Node` 现在只是通用笔记模型，本体概念只以松散的 `attributes` 存在。
3. `Group` 同时承担视觉分组、嵌套容器、节点转换目标和潜在 Domain 边界，语义过载。
4. ReactFlow 适配逻辑嵌在 `GraphPageContent` 和 `nodeSyncUtils` 中，没有被隔离成渲染适配层。
5. UI 组件直接读写全局 store，导致展示层和业务修改逻辑耦合。
6. 样式 token 分散在 JSX、配置文件和硬编码数字常量中。
7. 历史记录和持久化基于整张图快照，而不是明确的图操作命令。

## 目标模块边界

依赖方向：

```text
app
  -> features
      -> domains
          -> platform
              -> shared
```

边界规则：

- `domains/ontology` 不允许 import React 或 ReactFlow。
- `features/ontology-canvas` 可以 import ReactFlow，但只能通过 adapter 模块使用。
- `shared/ui` 不允许 import graph 或 domain 模块。
- 持久化不能订阅整个 UI store，只消费明确的 graph document snapshot 或 patch。
- 组件负责渲染 props，命令负责修改数据。

## 推荐前端目录结构

```text
frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/
│       └── workspace/
├── domains/
│   └── ontology/
│       ├── model/
│       │   ├── graph.ts
│       │   ├── node.ts
│       │   ├── edge.ts
│       │   ├── domain.ts
│       │   └── subgraph.ts
│       ├── commands/
│       │   ├── nodeCommands.ts
│       │   ├── edgeCommands.ts
│       │   ├── domainCommands.ts
│       │   └── graphValidation.ts
│       ├── selectors/
│       │   ├── graphSelectors.ts
│       │   └── relationSelectors.ts
│       └── index.ts
├── features/
│   ├── ontology-canvas/
│   │   ├── components/
│   │   │   ├── OntologyCanvas.tsx
│   │   │   ├── ClassNodeView.tsx
│   │   │   ├── DomainNodeView.tsx
│   │   │   └── SemanticEdgeView.tsx
│   │   ├── adapters/
│   │   │   ├── reactFlowAdapter.ts
│   │   │   ├── reactFlowNodeTypes.ts
│   │   │   └── reactFlowEdgeTypes.ts
│   │   ├── state/
│   │   │   ├── graphDocumentStore.ts
│   │   │   ├── canvasViewStore.ts
│   │   │   ├── selectionStore.ts
│   │   │   └── editingStore.ts
│   │   ├── config/
│   │   │   ├── canvasTokens.ts
│   │   │   ├── nodeTokens.ts
│   │   │   └── relationStyleTokens.ts
│   │   └── index.ts
│   ├── workspace/
│   │   ├── components/
│   │   ├── state/
│   │   ├── persistence/
│   │   └── index.ts
│   └── mermaid-import/
│       ├── parser/
│       ├── converter/
│       └── index.ts
├── platform/
│   ├── storage/
│   ├── layout-engine/
│   ├── logger/
│   └── config/
├── shared/
│   ├── ui/
│   ├── hooks/
│   ├── lib/
│   └── types/
└── legacy/
    └── graph-demo/
```

`legacy/graph-demo` 是可选目录，但迁移阶段很有用。等新的 canvas 模块具备替代能力后，可以把旧 ReactFlow demo 组件移进去，避免旧代码继续污染主路径。

## 本体数据模型

先建立一等模型：

```ts
export type OntologyGraph = {
  id: string
  name: string
  nodes: Record<string, OntologyNode>
  edges: Record<string, OntologyEdge>
  domains: Record<string, OntologyDomain>
  subgraphs: Record<string, OntologySubgraph>
  schemaVersion: number
}

export type OntologyNode = {
  id: string
  name: string
  kind: 'Class' | 'Concept' | 'Function' | 'Component' | 'Interface'
  fields: OntologyField[]
  constraints: OntologyConstraint[]
  domainId?: string
  subgraphId?: string
}

export type OntologyEdge = {
  id: string
  sourceId: string
  targetId: string
  predicate: string
  direction: 'forward' | 'both' | 'none'
  domain?: string
  range?: string
  metadata?: Record<string, unknown>
}

export type OntologyViewState = {
  nodeViews: Record<string, NodeView>
  domainViews: Record<string, DomainView>
  viewport: { x: number; y: number; zoom: number }
  lod: 'full' | 'compact' | 'outline' | 'dot'
}
```

关键拆分：

- `OntologyGraph` 是语义数据。
- `OntologyViewState` 是画布和 UI 数据。
- ReactFlow nodes/edges 是 adapter 推导出的渲染结果，绝不能作为数据源头。

## 状态架构

把当前 `useGraphStore` 拆成四类 store：

```text
graphDocumentStore
  只保存语义图谱数据

canvasViewStore
  保存 viewport、zoom、LOD、visible bounds、节点位置和尺寸

selectionStore
  保存 selectedNodeIds、selectedEdgeIds、hoverId

editingStore
  保存草稿、行内编辑状态、弹窗状态、待提交命令状态
```

持久化只订阅：

```text
graphDocumentStore.graph
canvasViewStore.persistedViewState
workspaceStore.currentCanvasId
```

持久化不应该订阅 hover、selection、临时表单草稿，也不应该在每一帧拖拽时保存。

## 命令层

用明确的 graph command 替代到处直接调用 `updateNode()` / `updateEdge()`：

```text
createClassNode
updateNodeFields
moveNodeToDomain
deleteNodeAndIncidentEdges
createSemanticRelation
updateRelationPredicate
collapseDomain
expandDomain
linkNodeToSubgraph
```

每个命令返回：

```ts
type GraphCommandResult = {
  graph: OntologyGraph
  view?: Partial<OntologyViewState>
  historyEntry?: HistoryEntry
  warnings?: string[]
}
```

这样历史记录、持久化、校验和 UI 刷新都会变成显式行为，而不是隐藏在组件或 store 副作用里。

## UI 配置

用 token 模块替代组件里的硬编码数值：

```ts
export const nodeTokens = {
  classNode: {
    width: 320,
    minHeight: 180,
    headerHeight: 36,
    fieldRowHeight: 24,
    padding: 12,
    radius: 6,
    fontSize: {
      title: 14,
      body: 12,
    },
  },
  domainNode: {
    minWidth: 360,
    minHeight: 240,
    headerHeight: 32,
    padding: 20,
  },
}
```

组件规则：

- View 组件通过 props 或 context 接收 tokens。
- Tailwind class 只负责布局基础能力。
- 数字尺寸来自 token 或 config 文件。
- 语义颜色来自 relation/domain style maps。

## 渲染适配层

ReactFlow adapter 的职责：

```text
OntologyGraph + OntologyViewState
  -> ReactFlowNode[]
  -> ReactFlowEdge[]
```

adapter 必须提供：

- `nodeById` map。
- 根据 viewport 和 Domain 折叠状态计算 `visibleNodeIds`。
- LOD 投影。
- 带明确 visibility mode 的 edge filtering。
- 未变化节点的稳定对象缓存。

ReactFlow 组件只接收已经适配好的 nodes/edges。它不应该知道本体关系在底层如何存储。

## 性能设计

第一阶段最低要求：

- 在验证行为后启用 ReactFlow 的 `onlyRenderVisibleElements`。
- 使用 store selector，避免订阅整个 store。
- 用 `nodeById` 替代全量 edge source/target 查找。
- 增加 LOD 层级：
  - full：标题、类型、字段、约束。
  - compact：标题、类型、字段数量。
  - outline：色块和标签。
  - dot：点或聚合标记。
- 拖拽和行内编辑期间暂停持久化。
- 移除渲染路径上的 `console` 日志。

更大一轮优化：

- adapter 结果缓存，缓存 key 使用 graph revision + view revision。
- 用命令历史替代整图快照历史。
- 布局计算移入 Web Worker，或改为显式异步任务。

## 删除和清理候选

替代路径建立后可以删除或移动：

- `frontend/app/page.legacy.tsx`
- `frontend/debug-edge-arrows.js`
- `frontend/test-api.js`
- `frontend/push-to-github.ps1`
- `frontend/push-to-github.bat`
- 未使用的默认 public SVG：`next.svg`、`vercel.svg`、`file.svg`、`window.svg`、`globe.svg`
- 选择 npm 或 pnpm 后，删除重复 lockfile。
- 旧中文修复说明在提炼有用决策到 ADR 后可以归档或删除。

暂时不要删除：

- Mermaid import services：隔离后仍可作为导入功能使用。
- 现有 layout services：可以迁移到 `platform/layout-engine`。
- Workspace tree：清理后可服务于 Subgraph 导航。

## 重构阶段

### Phase 0: 稳定基础

在大规模移动文件前先修正确性问题：

1. 修复 `updateGroup({ nodeIds })` 造成嵌套数组的 bug。
2. 修复 edge visibility mode。
3. 删除节点或分组时，同时删除 incident edges。
4. 修复 Docker Compose 路径。
5. 修复 Tailwind/shadcn 路径。
6. 统一选择一个包管理器。

### Phase 1: 定义领域模型

1. 新增 `domains/ontology/model/*`。
2. 增加从旧 `Node/Group/Edge` 到新模型的 mapper。
3. 增加 graph validation tests。
4. 保持旧 UI 可运行。

### Phase 2: 拆分状态

1. 创建 `graphDocumentStore`、`canvasViewStore`、`selectionStore`、`editingStore`。
2. 把持久化移动到 workspace feature。
3. 把历史记录移动到命令层。
4. 停止保存 selection、hover 和 form drafts。

### Phase 3: ReactFlow Adapter

1. 把 `nodeSyncUtils` 移到 `features/ontology-canvas/adapters`。
2. 增加稳定的 `nodeById`。
3. 增加明确的 edge visibility mode。
4. 增加 LOD 投影。
5. 增加 Domain collapse 投影。

### Phase 4: 组件拆分

1. 把 `NoteNode` 转成 `ClassNodeView`。
2. 把 `GroupNode` 转成 `DomainNodeView`。
3. 把 `CustomEdge` 转成 `SemanticEdgeView`。
4. 把 store 写入移动到 container/command handlers。
5. 使用共享的 `IconButton`、`Field`、`SegmentedControl`、`ColorSwatch`。

### Phase 5: 功能清理

1. 把 Mermaid import 移到 `features/mermaid-import`。
2. 把 layout engine 移到 `platform/layout-engine`。
3. 把 workspace tree 移到 `features/workspace`。
4. 把 UI primitives 移到 `shared/ui`。
5. 退役 legacy demo 文件。

## ADR

### ADR-001: Ontology Model 是唯一数据源

状态：Proposed

决策：分开存储 ontology graph 和 canvas view state。ReactFlow nodes/edges 只作为 adapter 推导出的渲染结果。

影响：

- UI 可以变化，而不需要重写语义数据。
- RDF/OWL 导出可以直接读取语义图。
- adapter 层负责处理 ReactFlow 的运行时细节和特殊约束。

### ADR-002: 使用按功能组织的前端结构

状态：Proposed

决策：从按类型组织的 `components/stores/services/types`，迁移到 feature/domain 模块。

影响：

- 相关文件放在一起。
- 可以逐步建立 import 边界。
- legacy 文件可以逐步迁移，不需要一次性重写。

### ADR-003: 基于命令修改图谱

状态：Proposed

决策：用 graph commands 替代任意 store updates。

影响：

- 历史记录更可靠。
- 持久化只保存有意义的图谱变化。
- orphan edges、过期 group membership 这类问题更容易被预防。

## 第一批实现 Backlog

推荐顺序：

1. 先为当前已知 bug 补测试：
   - `hideAllEdges` 应隐藏所有边。
   - `updateGroup({ nodeIds })` 应保持 `nodes` 为扁平数组。
   - 删除 node 应删除 incident edges。
   - 移动 node 到 group 时，应同步 `node.groupId` 和 `group.nodeIds`。
2. 修复这些 bug。
3. 创建 `domains/ontology/model`。
4. 创建 `features/ontology-canvas/config` tokens。
5. 在现有 `GraphPageContent` 后面引入 adapter function。
6. 先把一个 node view 改成 pure props 版本，作为试点。
