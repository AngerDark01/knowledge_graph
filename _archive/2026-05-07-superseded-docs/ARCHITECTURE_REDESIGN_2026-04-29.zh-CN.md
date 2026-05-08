# Ontology Canvas 新版架构设计与优化方案

日期：2026-04-29

本方案基于：

- `FRONTEND_ARCHITECTURE_RULES.zh-CN.md`
- `CODEBASE.md`
- `CODEBASE_RESCAN_SUMMARY.zh-CN.md`
- `FRONTEND_REVIEW.md`
- `VALIDATION_RESULTS.md`

## 1. 目标

把当前知识图谱 demo 重构为面向本体建模的 Ontology Canvas：

- 本体数据、画布视图、ReactFlow 运行态彻底分离。
- UI 可单独调整：尺寸、密度、颜色、组件实现不影响 model/algorithm。
- 算法模块可单独替换：ELK、边优化、未来推理/导入算法不碰 UI/store。
- 数据层唯一：加载、保存、迁移都通过统一 data-layer；导入协议暂缓，后续按本体 schema 重新设计。
- 大图性能可控：LOD、viewport culling、adapter cache、command history、worker layout。

## 2. 新依赖方向

```text
app/page
  -> features/*/blocks
      -> features/*/model
          -> domain/ontology
          -> core/algorithms
          -> data-layer

features/*/blocks -> features/*/ui
features/*/ui     -> shared/ui
```

禁止：

- `domain/ontology` import React、ReactFlow、Zustand、fetch、CSS。
- `core/algorithms` import React、ReactFlow、Zustand、workspace store、UI component。
- `features/*/ui` import feature model 或 store。
- 跨 feature import 内部文件，只能从 `index.ts` 公开出口导入。

## 3. 目标目录结构

```text
frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/
│       ├── workspace/
│       └── layout/
├── domain/
│   └── ontology/
│       ├── model/
│       │   ├── graph.ts
│       │   ├── node.ts
│       │   ├── edge.ts
│       │   ├── domain.ts
│       │   ├── subgraph.ts
│       │   └── schemaVersion.ts
│       ├── commands/
│       ├── selectors/
│       ├── validation/
│       ├── migrations/
│       └── index.ts
├── features/
│   ├── ontology-canvas/
│   │   ├── blocks/
│   │   │   ├── OntologyCanvasBlock.tsx
│   │   │   ├── CanvasToolbarBlock.tsx
│   │   │   └── InspectorBlock.tsx
│   │   ├── model/
│   │   │   ├── stores/
│   │   │   ├── commands/
│   │   │   ├── use-cases/
│   │   │   └── selectors/
│   │   ├── ui/
│   │   │   ├── ClassNodeView.tsx
│   │   │   ├── DomainNodeView.tsx
│   │   │   ├── SemanticEdgeView.tsx
│   │   │   └── CanvasControls.tsx
│   │   ├── adapters/
│   │   │   └── react-flow/
│   │   ├── config/
│   │   │   ├── viewTokens.ts
│   │   │   ├── relationTokens.ts
│   │   │   └── lodConfig.ts
│   │   └── index.ts
│   └── workspace/
│       ├── blocks/
│       ├── model/
│       ├── ui/
│       └── index.ts
├── core/
│   ├── algorithms/
│   │   ├── layout/
│   │   ├── import/
│   │   └── graph/
│   ├── mock/
│   └── contracts/
├── data-layer/
│   ├── workspace/
│   │   ├── workspaceRepository.ts
│   │   ├── storageAdapter.ts
│   │   └── migrations.ts
│   └── layout/
├── shared/
│   ├── ui/
│   ├── hooks/
│   ├── lib/
│   └── types/
└── legacy/
    └── graph-demo/
```

## 4. 核心模型

```ts
export type OntologyGraph = {
  id: string
  name: string
  schemaVersion: number
  nodes: Record<string, OntologyNode>
  edges: Record<string, OntologyEdge>
  domains: Record<string, OntologyDomain>
  subgraphs: Record<string, OntologySubgraph>
}

export type OntologyViewState = {
  nodeViews: Record<string, NodeViewState>
  domainViews: Record<string, DomainViewState>
  viewport: { x: number; y: number; zoom: number }
  lod: 'full' | 'compact' | 'outline' | 'dot'
  edgeVisibility: { mode: 'all' | 'none' | 'custom'; ids: string[] }
}
```

ReactFlow nodes/edges 不是真相源，只是 adapter 输出。

## 5. 状态拆分

```text
graphDocumentStore
  OntologyGraph
  schemaVersion
  graphRevision

canvasViewStore
  node positions/sizes
  viewport
  lod
  domain collapsed state
  edge visibility
  viewRevision

selectionStore
  selectedNodeIds
  selectedEdgeIds
  hoverId

editingStore
  form drafts
  inline editing id
  modal/dialog state
  pending command state

workspaceStore
  workspace tree
  currentSubgraph/canvas id
  dirty/saving status
```

持久化白名单：

```text
OntologyGraph
persisted OntologyViewState
workspace metadata
schemaVersion
```

禁止持久化 hover、selection、form draft、拖拽中的每一帧。

## 6. Command 层

所有图谱修改必须走 command：

```text
createClassNode
updateNodeFields
deleteNodeAndIncidentEdges
createSemanticRelation
updateRelationPredicate
moveNodeToDomain
collapseDomain
expandDomain
linkNodeToSubgraph
importGraph
applyLayoutPatch
```

返回统一结果：

```ts
type GraphCommandResult = {
  graph?: OntologyGraph
  view?: Partial<OntologyViewState>
  patch?: GraphPatch
  historyEntry?: HistoryEntry
  warnings?: string[]
}
```

command 层负责：

- 数据一致性。
- incident edges 清理。
- group/domain 双向关系同步。
- history entry。
- persistence patch。
- validation warnings。

## 7. ReactFlow Adapter

新增唯一渲染适配入口：

```text
features/ontology-canvas/adapters/react-flow/
  projectGraphToReactFlow.ts
  projectEdgesToReactFlow.ts
  reactFlowEventsToCommands.ts
  nodeTypes.ts
  edgeTypes.ts
  adapterCache.ts
```

输入：

```text
OntologyGraph
OntologyViewState
selectionStore snapshot
```

输出：

```text
ReactFlowNode[]
ReactFlowEdge[]
```

adapter 负责：

- `nodeById`。
- Domain collapse projection。
- LOD projection。
- viewport visible ids。
- edge visibility mode。
- stable object cache。
- conversion from absolute/relative positions。

`GraphPageContent` 未来只负责：

```text
读 blocks/model selector
调用 adapter
把 ReactFlow event 转 command
渲染 OntologyCanvas UI
```

## 8. 算法层

算法层必须使用中立 DTO。

```ts
type LayoutGraph = {
  nodes: LayoutNode[]
  edges: LayoutEdge[]
}

type LayoutNode = {
  id: string
  parentId?: string
  width: number
  height: number
}

type LayoutEdge = {
  id: string
  sourceId: string
  targetId: string
}

type LayoutPatch = {
  nodePositions: Record<string, { x: number; y: number }>
  nodeSizes?: Record<string, { width: number; height: number }>
  edgeHandles?: Record<string, { sourceHandle?: string; targetHandle?: string }>
  warnings?: string[]
}
```

重构目标：

- `LayoutManager` 不接收旧 `Node | Group | Edge`。
- `ELKGraphConverter` 只处理 `LayoutGraph -> ElkNode`。
- `EdgeOptimizer` 返回 `edgeHandles` patch。
- `NestingTreeBuilder` 使用 `parentId` DTO，并统一 visited set。
- `layoutConfig` 不引用 UI token。
- 大图布局进入 Web Worker 或 async job。
- layout result 应用前检查 graphRevision/viewRevision。

## 9. 导入协议

状态：暂缓。

Mermaid 导入已从当前主系统删除。原因是产品定位已经收敛到 Ontology Canvas，Mermaid Flowchart 不是本体图的核心表达语言；继续保留会让临时桥接能力污染架构边界。

未来如果需要导入，应先设计中立本体导入契约，而不是直接选择某一种外部图语言。

建议目标：

```text
features/ontology-import/model/parser
  parseSource(input) -> OntologyImportDraft

features/ontology-import/model/validation
  validateImportDraft(draft) -> warnings/errors

features/ontology-canvas/model/commands
  importGraph(draft)
  applyLayoutPatch(patch)

data-layer/workspace
  saveWorkspace()
```

输入源可以后续再定：自定义 JSON schema、RDF/OWL、Turtle、专用 DSL，或作为兼容层再支持 Mermaid。任何输入源都只能输出 draft，不允许直接写 store、直接布局或直接 fetch。

## 10. Data-layer

收敛为唯一出口：

```text
data-layer/workspace/workspaceRepository.ts
  loadWorkspace()
  saveWorkspace()
  saveCanvas()
  loadCanvas()
  loadOntologyCanvas()
  saveOntologyCanvas()
  migrateWorkspace()
```

底层可以复用：

```text
StorageManager
FileSystemAdapter
/api/workspace/load
/api/workspace/save
```

禁止：

- UI component 直接 fetch。
- feature service 直接 fetch。
- store middleware 直接 fetch。
- 临时导入功能直接 fetch。

所有直接 fetch `/api/workspace/save` 的路径应迁移到 repository。

### 10.1 本体文档持久化决策

当前阶段先把持久化目标从旧 `Canvas.graphData.nodes/edges` 改为本体文档 JSON，不直接上 PostgreSQL 表拆分。

目标保存契约：

```ts
type PersistedOntologyCanvas = {
  persistenceVersion: number
  graph: OntologyGraph
  view: PersistedOntologyViewState
  revision: number
  savedAt?: string
}
```

`PersistedOntologyViewState` 只允许保存：

```text
nodeViews
domainViews
edgeViews
viewport
lod
edgeVisibility
```

禁止保存：

```text
selection
hover
editing draft
context menu
dialog state
dragging transient state
```

执行原则：

1. DONE：`workspaceRepository` 是前端唯一数据出口；画布、组件、store middleware 不直接 fetch。
2. DONE：第一阶段 adapter 写 JSON 文件，路径仍复用现有 `/api/workspace/load|save` 和 `public/workspace/*.json`。
3. 后续接 PostgreSQL 时只替换 repository 底层 adapter，不改 `features/ontology-canvas`、ReactFlow adapter 和 UI。
4. PostgreSQL 第一版建议用 `ontology_canvas_documents(document JSONB)` 保存完整本体文档；等搜索、统计、权限或协作需要明确后，再拆 `nodes/edges/domains` 索引表。
5. DONE：旧 `graphData` 只作为迁移输入和临时显示桥输出，不再作为新持久化真相源；旧迁移逻辑集中在 `frontend/utils/workspace/canvasSync.ts`。

## 11. UI 配置与样式

拆两类 token：

```text
viewTokens
  size
  spacing
  font
  radius
  density

styleTokens
  semantic color
  shadow
  transition
  animation
```

算法配置：

```text
layoutAlgorithmConfig
  node gap
  rank direction
  edge spacing
  max depth
  batch threshold
```

禁止 UI token 和算法 config 混在一个文件。

## 12. Phase 0：先修正确性

状态：2026-04-29 已完成第一批，不做大规模目录迁移。

必须先做：

1. DONE：修复 `updateGroup({ nodeIds })` 嵌套数组 bug。
2. DONE：修复 edge visibility：改为 `{ mode, ids }`。
3. DONE：删除 node/group 时同步删除 incident edges。
4. DONE：临时 Mermaid 导入链路已在 2026-04-30 下线，后续导入协议按本体 schema 重新设计。
5. DONE：修复 Docker Compose Dockerfile 路径。
6. DONE：修复 Tailwind/shadcn `src/*` 路径。
7. DONE：移除主画布同步、拖拽、resize、节点 store 操作里的高频调试 console。
8. TODO：统一 npm 或 pnpm。
9. TODO：移除剩余生产路径上的大块 console，尤其是 workspace save/API/layout 诊断输出。

## 13. Phase 1：边界工具化

迁移策略：目标目录不是一次性生成完整空壳，而是每次只落一个可运行边界。旧代码先调用新边界，等调用点稳定后再移动 UI/feature。

状态：2026-04-29 已完结。阶段 1 的验收标准不是“目录全部迁完”，而是先形成一个可运行、可验证、可防退化的新架构边界。

已完成：

1. DONE：新建 `frontend/domain/ontology/commands`，承接边可见性和删除节点清边这类纯规则。
2. DONE：旧 `graph store` 先调用 `domain/ontology` 命令，避免一口气迁移 ReactFlow/UI/store。
3. DONE：新增 `npm run check:architecture`，防止 `domain/ontology` 反向依赖 React、ReactFlow、Zustand、fetch、CSS。
4. DONE：新增 `npm run test:domain`，用运行时断言覆盖边可见性、incident edge 清理、输入不可变性。
5. DONE：新增 `npm run check:phase1`，串联边界检查和 domain command 测试，作为 Phase 1 的一键验收命令。

验收结果：

1. PASS：`cd frontend && npm run check:phase1`。
2. PASS：`cd frontend && npm run build`。
3. PASS：`git diff --check`。
4. FAIL：`cd frontend && npm run lint` 仍是历史债务基线，当前为 `155 errors / 92 warnings`，不阻断 Phase 1 完结，但必须进入后续专项。

阶段 1 留给后续强化的非阻断项：

1. 将轻量脚本升级为 CI/ESLint import boundary。
2. 禁止跨 feature 内部导入。
3. 禁止 `ui -> model`、`shared -> feature`、`core/algorithms -> store/ui/fetch`。
4. 建立或确认 path alias：

```text
@/domain/*
@/features/*
@/core/*
@/data-layer/*
@/shared/*
```

## 14. Phase 2：领域模型和 command

状态：2026-04-30 已完成 Phase 2A、Phase 2B 第一批、编辑入口收敛、feature model 边界迁移、Inspector save plan 收敛，以及 Phase 2C 的画布交互旧实现清理、LayoutControl 控制层收敛、ELK 配置/转换器/策略类型收敛、临时 Mermaid 导入下线、graph runtime 类型债务清理、旧 Node/Group 转换兼容链路删除、GraphPageContent edge sync O(E*N) 收敛、ReactFlow adapter projection 边界迁移。阶段 2 不一次性替换旧 store，而是先把“语义真相源”的模型边界、纯 command 边界、旧 UI 写入口的副作用边界、feature model 边界、算法入口类型边界和渲染 adapter 边界建出来，让旧图数据有稳定迁移入口。

Phase 2A 已完成：

1. DONE：新建 `domain/ontology/model`，定义 `OntologyGraph`、`OntologyNode`、`OntologyEdge`、`OntologyDomain`、`OntologySubgraph` 和 schema version。
2. DONE：新建 `domain/ontology/mappers`，提供 legacy graph -> ontology graph mapper。
3. DONE：新建 `domain/ontology/validation`，提供 graph validation，覆盖缺失端点、空关系、domain/subgraph 引用、domain parent cycle。
4. DONE：新增 `npm run test:ontology`，用 runtime 断言覆盖 mapper 与 validator。
5. DONE：新增 `npm run check:phase2`，串联 architecture boundary、Phase 1 domain tests、Phase 2 ontology tests。

Phase 2B 第一批已完成：

1. DONE：新建 command layer，统一 `createClassNode`、`updateNodeFields`、`createSemanticRelation`、`moveNodeToDomain` 等语义操作。
2. DONE：移除旧 `visibleEdgeIds` 兼容链路，旧 edge visibility 不再与 `edgeVisibility { mode, ids }` 并存。
3. DONE：抽出测试脚本共享 TypeScript module loader，删除脚本内重复 loader 实现。
4. DONE：新增 `npm run test:ontology:commands`，并纳入 `npm run check:phase2`。

Phase 2B 编辑入口收敛已完成：

1. DONE：`EdgeEditor` 删除输入即写全局 store 的旧 effect，改为本地 draft + 显式保存/重置。
2. DONE：`NodeEditor` 删除直接 `updateNode({ groupId })` 的旧 membership 路径，分组变更统一走 `addNodeToGroup/removeNodeFromGroup`。
3. DONE：抽出 `editorDrafts.ts`，把 draft 创建、JSON 解析、标签解析、属性转换、update payload 构造从 TSX 中移出。
4. DONE：`StructuredAttributeEditor` 只回写父级 draft，不直接接触 graph store。
5. DONE：新增 `npm run test:editors`，并纳入 `npm run check:phase2`。

Phase 2B feature model 边界迁移已完成：

1. DONE：新建 `frontend/features/ontology-canvas/model/inspector`，承接右侧属性面板 draft/model helper。
2. DONE：删除旧 `components/graph/editors/editorDrafts.ts`，避免旧 UI 目录残留业务 helper。
3. DONE：旧 `EdgeEditor/NodeEditor/StructuredAttributeEditor` 改为从 `@/features/ontology-canvas` 导入 model helper。
4. DONE：`check:architecture` 增加 `features/ontology-canvas/model` 边界规则，禁止 model 依赖 React、UI、store、fetch、CSS。

Phase 2B Inspector save plan 收敛已完成：

1. DONE：新增 `features/ontology-canvas/model/inspector/savePlans.ts`，把 Edge/Node 保存 payload、JSON 错误、节点校验、membership diff 从 TSX 移入 feature model。
2. DONE：`EdgeEditor` 只执行 `createEdgeInspectorSavePlan()` 返回的计划，不再自己拼 update payload。
3. DONE：`NodeEditor` 只执行 `createNodeInspectorSavePlan()` 返回的普通字段 update 和 membership plan，不再自己做校验/分组差异。
4. DONE：`test:editors` 覆盖 save plan，确保普通字段 update 不含 `groupId`。

Phase 2C 画布交互旧实现清理已完成：

1. DONE：新增 `features/ontology-canvas/model/interactions`，承接节点展开 patch、自定义展开尺寸判定、选中删除/清空计划。
2. DONE：`useNodeExpansion` 删除本地 `isExpanded` 状态和同步 effect，改为从 store/node data 派生状态。
3. DONE：`useKeyboardShortcuts` 删除手动遍历 incident edges 的旧实现，删除计划过滤掉会被节点删除覆盖的边。
4. DONE：`useViewportControls` 复用清空计划，避免 UI hook 内继续用 `any` 遍历节点/边。
5. DONE：`nodeSyncUtils` 移除本文件内 `any`，并删除旧转换隐藏字段过滤。
6. DONE：新增 `npm run test:canvas:interactions`，并纳入 `npm run check:phase2`。

Phase 2C LayoutControl 控制层收敛已完成：

1. DONE：新增 `features/ontology-canvas/model/layout/layoutControl.ts`，承接布局策略 options、节点/边 patch、群组子节点筛选。
2. DONE：`LayoutControl.tsx` 删除本轮触达的 `any`，不再在 TSX 里直接拼 width/height/boundary/style patch。
3. DONE：`services/layout/types/layoutTypes.ts` 收紧 layout result 和 options 类型，移除开放 `[key:string]: any`。
4. DONE：旧 `types/layout/*` 重复类型里的 `any` 已收紧为 `unknown`/明确 patch 类型。
5. DONE：新增 `npm run test:layout:control`，并纳入 `npm run check:phase2`。

Phase 2C ELK 配置与转换器类型收敛已完成：

1. DONE：新增 `ELKLayoutOptions = Record<string, string | number | boolean>`，让 ELK 配置不再公开 `any`。
2. DONE：`ELKConfigBuilder` 返回明确 ELK option 类型，`mergeConfig()` 保持覆盖行为但收紧输入输出。
3. DONE：`ELKGraphConverter` 删除未使用的旧 `nodeMap` 参数链路，读取展开尺寸时使用 `Node.customExpandedSize` 类型。
4. DONE：新增 `ELKRuntime.ts`，集中处理 `elkjs` 动态模块适配；ELK 策略改为布局执行时才懒加载，避免构建/SSR 阶段副作用。
5. DONE：`ELKGroupLayoutStrategy.extractSubgraph()` 用 `Set` 过滤边，删除旧 O(E*N) `some()` 扫描。
6. DONE：新增 `npm run test:layout:elk`，并纳入 `npm run check:phase2`。

Phase 2C 临时 Mermaid 导入下线已完成：

1. DONE：删除前端 Mermaid 导入 UI、hook、service、临时测试脚本。
2. DONE：删除后端未挂载的 Mermaid controller/converter/test。
3. DONE：移除前端 `mermaid` npm 依赖。
4. DONE：`Toolbar` 不再暴露导入入口。
5. DONE：未来导入能力改为“本体导入协议待设计”，不在当前阶段实现。
6. DONE：历史 Mermaid 研究资料和示例脚本已归档到 `项目文档/_archive/mermaid-import-legacy/`，不再位于主文档区。

Phase 2C 旧转换链路与渲染热路径收敛已完成：

1. DONE：删除 `frontend/stores/graph/nodes/conversionOperations.ts`，`nodes/index.ts` 不再聚合 conversion slice。
2. DONE：删除 NoteNode/GroupNode 中的 Node/Group 转换交互入口，UI 不再暴露旧兼容能力。
3. DONE：删除 graph model 中的转换缓存字段：`convertedFrom`、`isConverted`、`savedChildren`、`savedEdges`、`originalPosition`、`originalSize`。
4. DONE：`nodeSyncUtils` 和 `GraphPageContent` 不再识别 `_hiddenByConversion` / `_parentConvertedId`。
5. DONE：`GraphPageContent` store 读取拆为 selector，并用 `storeNodeById: Map` 收敛 edge sync 端点查找，删除旧 O(E*N) `storeNodes.find()`。
6. DONE：清理 `GraphPageContent`、basic/constraint/group/groupBoundary operations 的高频调试 `console.log`。

Phase 2C ReactFlow adapter 边界迁移已完成：

1. DONE：新增 `features/ontology-canvas/adapters/react-flow/projection.ts`，承接 nodes/edges 到 ReactFlow DTO 的 projection。
2. DONE：删除旧 `components/graph/core/nodeSyncUtils.ts`，不再让 legacy component core 承担投影逻辑。
3. DONE：`GraphPageContent` 改为调用 `projectNodesToReactFlowNodes()` / `projectEdgesToReactFlowEdges()`，主组件只负责接线和事件处理。
4. DONE：`check-architecture` 增加 adapter 边界规则：adapter 允许 ReactFlow DTO，但禁止 store、UI、fetch 和 CSS。
5. DONE：新增 `npm run test:react-flow-adapter`，覆盖父子相对坐标、跨组边类型、visibility 过滤、循环 groupId 降级，并纳入 `check:phase2`。

Phase 3A ReactFlow adapter 性能投影已完成：

1. DONE：`GraphPageContent` 维护 `projectionBounds` 和 zoom LOD，不再只维护一个显示 zoom。
2. DONE：ReactFlow `onMove` 通过 `requestAnimationFrame` 节流更新投影视口，`onMoveEnd/onInit/zoom` 立即校准。
3. DONE：adapter 支持 `full/compact/outline/dot` LOD mode，并注入到 node data。
4. DONE：节点数超过 80 且已有视口时启用 viewport culling，只投影视口扩展范围内节点、选中节点及其父级 group。
5. DONE：edge projection 支持 `visibleNodeIds`，裁掉端点不可见的边。
6. DONE：`test-react-flow-adapter` 覆盖 LOD、节点裁剪、选中节点保留、父级 group 保留和边端点过滤。

Phase 3B 本体运行态切换计划：

> 这是补齐的关键关卡：旧 `Node/Group/Edge + BlockEnum` 不能等到 Phase 7 才清理。Phase 7 只处理残留文件和历史入口；真正的运行态切换必须在 Phase 3 完成，否则后续 UI、算法、性能都会继续围绕旧模型优化。

目标状态：

```text
OntologyGraph            语义真相源：Class / Concept / Function / Component / ...
OntologyViewState        视图状态：位置、尺寸、折叠、viewport、LOD、选中
ReactFlow Adapter        渲染适配：OntologyGraph + ViewState -> ReactFlow nodes/edges
Legacy Graph Mapper      只做一次性迁移，不再参与新增/编辑主链路
```

执行顺序：

1. DONE：新增 `OntologyDocumentState` / `OntologyViewState` 的 feature model 类型，明确语义数据和视图数据的存储边界。
2. DONE：新增 `ontologyDocumentStore`，承接当前本体文档、来源 canvas、hydration 状态、command result、view update、viewport update 和 delete 应用；`legacy-graph` adapter 只做当前 ReactFlow 显示桥。
3. DONE：新增 `createOntologyClassNodeInDocument()`，调用 `createClassNode()`，默认类型为 `Class`，并允许后续选择 `Concept/Function/Component/Information/Interface/Constraint`；`onNodeAdd/onDrop` 已接入。
4. DONE：新增 `createDomain()` 与 `createOntologyDomainInDocument()`，创建 `OntologyDomain + DomainViewState`；`onGroupAdd` 已接入。
5. DONE：新增/编辑关系已先走 `createOntologyRelationInDocument()` / `updateOntologyRelationInDocument()`，语义字段为 `OntologyEdge.relation`；旧 `Edge.label/customProperties.relationship` 只作为当前展示桥接。
6. PARTIAL：ReactFlow adapter 已新增 `OntologyDocumentState -> ReactFlow nodes/edges` 投影入口，`GraphPageContent` 已直接从 `ontologyDocumentStore.document` 投影；旧 graph store 仍承接现有 ReactFlow 显示对象和部分编辑兼容。
7. PARTIAL：默认 workspace 已替换为干净本体示例数据，并新增 `ontologyDocument` 持久化真相源；旧 `graphData.nodes/edges` 仅作为当前 ReactFlow 显示缓存，后续随旧 graph store 退场删除。
8. PARTIAL：已删除未使用的 `components/graph/core/utils/*` 旧工具目录；`frontend/types/graph/models.ts`、`stores/graph/nodes/*`、`stores/graph/edgesSlice.ts` 仍是显示桥和旧编辑兼容残留。
9. PARTIAL：单节点/单 Domain 的直接拖拽、resize、展开、viewport、Delete/Backspace、清空画布已接入 `OntologyViewState` 或删除本体元素；但 2026-05-06 复查确认旧项目的嵌套事务契约尚未完整迁移，尤其是 Domain 移动的后代 offset、节点约束后的最终坐标、Domain 边界级联扩展同步仍缺本体 view patch。
10. DONE：布局和 workspace 主路径普通调试日志已清理，布局内部日志只在 `NEXT_PUBLIC_LAYOUT_DEBUG=true` 时输出。

Phase 3B 验收标准：

1. DONE：新增节点语义源不再直接产生 `BlockEnum.NODE`，而是先创建 `OntologyNode` 并进入 `ontologyDocumentStore`；当前仍通过 `legacy-graph` adapter 临时投影旧 `Node` 给现有画布显示。
2. DONE：新增 Domain 语义源不再直接产生旧 `BlockEnum.GROUP`，而是先创建 `OntologyDomain + DomainViewState` 并进入 `ontologyDocumentStore`；当前仍通过 `legacy-graph` adapter 临时投影旧 `Group` 给现有画布显示。
3. DONE：新增/编辑关系的语义源已是 `OntologyEdge.relation` 并进入 `ontologyDocumentStore`；旧 label/relationship 仍用于当前 edge UI 展示。
4. PARTIAL：主画布渲染 adapter 已可输入 `OntologyDocumentState` 并由 `GraphPageContent` 从 `ontologyDocumentStore` 接入；旧 graph store 仍作为显示桥和部分旧编辑兼容。
5. PARTIAL：默认 workspace 已清理成最小本体示例并包含 `ontologyDocument`；旧 `graphData.nodes/edges` 仍作为显示缓存保留。
6. 过渡期 `rg "BlockEnum.NODE|BlockEnum.GROUP|@/types/graph/models"` 在新增入口和 Toolbar 中无命中；只允许 `legacy-graph` adapter、legacy mapper、迁移脚本、旧数据测试命中。最终运行态切换后删除 `legacy-graph` adapter。

Phase 2B 后续继续做：

1. 已前移到 Phase 3B：新建旧 graph runtime 到 `OntologyGraph + OntologyViewState` 的迁移/视图映射策略，明确 semantic graph 与 view state 的拆分边界。
2. 用 command history 或 patch history 替代全量 snapshot history。
3. 设计 `OntologyImportDraft` 和导入 command 边界，暂不绑定具体输入语言。
4. 已前移到 Phase 3B：把旧 store 的语义写操作改为调用 ontology commands，优先处理新增节点、Domain、关系谓词。

## 15. Phase 3：Adapter 和状态拆分

1. PARTIAL：Phase 3B 已新增 `OntologyDocumentState/OntologyViewState`、document use-case、`ontologyDocumentStore` 和新增/关系/视图更新主入口；`selectionStore`、`editingStore`、command history 仍待拆出。
2. DONE：`nodeSyncUtils` 和 edge sync effect 已合并进 ReactFlow adapter。
3. DONE：adapter 已加入 LOD 标记、viewport visible ids 和基础 viewport culling。
4. PARTIAL：Phase 3C 已把 NodeEditor 保存改为纯本体 command/document 写入；新增节点/Domain/关系 UI 入口、删除、viewport 更新已切到 ontology document store。拖拽和 resize 的简单 view 写入已接入，但 Domain 嵌套交互契约仍需补齐事务化 patch，旧 graph store 不能继续承担最终坐标和边界真相源。
5. DONE：Phase 3D 第一批已新增 `PersistedOntologyCanvas`、workspace repository 和 JSON 持久化主线；页面、store middleware、workspace util 不再直接 fetch workspace API。
6. PARTIAL：ReactFlow adapter 已新增 `OntologyDocumentState` 输入投影，并在 `GraphPageContent` 从 `ontologyDocumentStore` 接入；后续需要让旧 graph store 完全退出显示桥。
7. TODO：继续加入 collapse projection 和 adapter cache；节点 UI 还需要真正消费 LOD 来降低 DOM。
8. GraphPageContent 改为 blocks/container。

### 15.1 近期执行顺序修订

根据 2026-05-06 讨论，持久化可以先落成本体 JSON 文档，后续再把 repository adapter 切到 PostgreSQL。但在改持久化 schema 前，必须先切断 NodeEditor 的 legacy rehydrate 路径，避免旧 graph store 继续反灌本体文档。

新的近期顺序：

1. DONE：Phase 3C 已新增 `updateOntologyNodeInDocument()`、`updateOntologyDomainInDocument()` 与 node inspector ontology save plan；NodeEditor 保存直接写 `OntologyDocumentState`，不再从旧 graph store rehydrate。
2. DONE：Phase 3D 第一批已新增 `PersistedOntologyCanvas` JSON 契约和 `workspaceRepository`，保存/加载优先读写 `OntologyGraph + OntologyViewState`；旧 `graphData` 只由 `canvasSync` 迁移或投影。
3. Phase 3E-A：先修复节点/Domain 嵌套交互契约。用户视角的产品验收标准见 `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md`，技术坐标和状态契约见 `NODE_DOMAIN_INTERACTION_CONTRACT_2026-05-06.zh-CN.md`，外部资料与 Dify 参考经验见 `CANVAS_INTERACTION_PERFORMANCE_RESEARCH_2026-05-06.zh-CN.md`，具体开发执行门禁见 `PHASE_3E_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md`。这一步必须在布局算法 DTO 前完成，否则布局会建立在错误的坐标/边界状态上。
4. Phase 3E-B：节点 UI 产品化与配置化，先把本体节点展示、节点上新增属性、属性折叠、UI token/config 边界定稳。
5. Phase 3E-C：继续退场旧 graph store，清理主交互/显示路径对旧 graph 真相源的依赖，并登记 layout、edge optimizer、history 的 Phase 5 迁移清单；不在 3E-C 正式做算法 DTO/worker/history。
6. Phase 4：UI feature 化收尾，清理旧 UI 入口并补齐 LOD 真实降 DOM。
7. Phase 5：算法 DTO、layout job、worker 和 patch history。
8. Phase 6：Workspace/Subgraph/Repository/PostgreSQL adapter。
9. Phase 7：Legacy 文件、脚本、schema、文档清理。
10. Phase 8：本体导入、导出与推理准备。

从 2026-05-06 起，所有后续阶段统一参考 `FUTURE_PHASES_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md`。该文档定义 Phase 3E 到 Phase 8 的开工门禁、阶段拆分、禁止事项和出口标准。当前阶段顺序明确为先修交互，再完成 UI 产品化/feature 化，之后再进入算法 DTO/worker/history。

### 15.2 节点/Domain 嵌套交互契约修订

新增五份约束文档：

- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md`：从用户角度定义节点、Domain、属性、折叠、编辑栏、UI 配置和性能体验的交付标准。
- `NODE_DOMAIN_INTERACTION_CONTRACT_2026-05-06.zh-CN.md`：从技术角度定义绝对坐标、ReactFlow 相对投影、后代 offset、边界级联和本体 view patch 规则。
- `CANVAS_INTERACTION_PERFORMANCE_RESEARCH_2026-05-06.zh-CN.md`：沉淀 React Flow、tldraw、Dify 和旧项目的画布交互/性能经验，作为 Phase 3E-A/3E-B 的实现约束。
- `PHASE_3E_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md`：Phase 3E 详细执行计划和开发前必读门禁，防止上下文压缩后偏离交互契约。
- `FUTURE_PHASES_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md`：Phase 3E 到 Phase 8 的后续阶段总计划，统一约束交互、UI、算法、workspace、legacy 清理和导入导出阶段。

后续阶段开发前置规则：

1. 任何涉及节点、Domain、拖拽、嵌套、节点 UI、LOD、布局、workspace、subgraph、repository、legacy 清理和导入导出的任务，开工前必须阅读 `FUTURE_PHASES_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` 中对应阶段的必读文档。
2. 开工前必须在 `ITERATION_LOG.md` 写明本轮已读章节、本轮不变量和验收命令。
3. 如果没有完成前置阅读记录，不进入代码修改。
4. 如果代码实现和产品规格、技术契约、性能研究冲突，以产品规格和技术契约为准，先暂停修订方案，不直接写代码。

2026-05-06 复查 `/home/aseit/桌面/cloud/knowledge-graph` 原始存档后，确认旧项目正确交互依赖以下不变量：

```text
本体/旧 store 中的位置 = 画布绝对坐标
ReactFlow 嵌套投影位置 = child.absolute - parent.absolute
拖拽提交 = ReactFlow 相对坐标转回绝对坐标
Domain 移动 = Domain 自己和所有后代绝对坐标一起应用 offset
节点移动/resize = 约束后坐标 + Domain 边界级联更新
```

当前 Phase 3B/3D 已把渲染真相源切到 `OntologyDocumentState`，但 `GraphPageContent` 中部分交互仍只把完整结果写入旧 graph store。本体 view 只收到局部 patch，导致点击或重新投影后出现回弹、子节点跑出 Domain、Domain 移动后后代不跟随。

新增 Phase 3E-A，优先完成：

1. 新增纯 model 层 `domainNesting` / `viewInteraction` 模块，禁止 import UI、ReactFlow、Zustand、fetch。
2. `commitNodeDrag()` 输出约束后的 node view 和受影响 Domain boundary patch。
3. `commitDomainDrag()` 计算 Domain offset，并批量更新所有后代 node/domain view。
4. `updateDomainBoundaryCascade()` 将旧 `updateGroupBoundary()` 的正确边界逻辑迁入本体 view，并修正缓存 key 只含 child ids 的风险。
5. 拖拽中只保留 ReactFlow 本地视觉态和必要辅助线；拖拽停止后一次性提交本体交互事务，不在拖拽中保存、布局或全图重算边。
6. `GraphPageContent` 拖拽停止后优先提交本体交互事务，再由本体 document 投影旧 display cache；旧 graph store 不再作为最终位置判断源。
7. 增加运行时测试覆盖 Domain 移动、嵌套 Domain 移动、节点约束、边界级联、ReactFlow 相对投影。

### 15.3 节点 UI 与编辑解耦补充

用户视角要求：本体节点不能只是普通卡片。节点本身要能直接表达标题、类型、属性列表、字段类型、约束/接口/行为等分区，并支持在节点上快速新增属性。

因此 Phase 4 的 UI feature 化要继承两个前置目标：

1. 节点产品化：`ClassNodeView` 不再是旧 `NoteNode` 换名，而是支持本体属性展示、属性新增入口、属性分区折叠和 LOD 降级。
2. UI 可配置：节点宽高、标题高度、属性行高、字号、间距、圆角、折叠阈值、LOD 阈值进入 feature config/token；颜色、阴影、状态样式消费语义 token。

边界要求：

```text
交互 model：负责创建、嵌套、拖拽、边界、折叠规则
节点 UI：只负责展示 props 和触发事件
右侧编辑栏：负责完整编辑，不拥有节点交互规则
配置/token：负责尺寸、密度、样式，不写死在组件里
```

验收判断：

- 改节点 UI 样式，不改拖拽/嵌套 model。
- 改 Domain 嵌套规则，不改节点展示组件。
- 改右侧编辑栏，不改画布 adapter。
- 调整节点密度，只改 token/config，不逐个组件搜索修改。

## 16. Phase 4：UI feature 化与旧 UI 退场

详细执行门禁见 `FUTURE_PHASES_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` §6。

Phase 4 的核心目标：

```text
page
  -> feature blocks
      -> model / adapters / ui / config
```

拆分：

1. Phase 4A：新增或完善 `OntologyCanvasBlock`、`CanvasToolbarBlock`、`NodeInspectorBlock`；route page 只装配。
2. Phase 4B：`ClassNodeView`、`DomainNodeView`、`SemanticEdgeView` 都改为只收 props/events/tokens。
3. Phase 4C：节点尺寸、属性行高、字号、间距、圆角、LOD 阈值进入 config；颜色和状态样式消费语义 token。
4. Phase 4D：full/compact/outline/dot 真实减少 DOM，Domain collapse 后内部节点不完整渲染。
5. Phase 4E：旧 `NoteNode/GroupNode`、旧 `components/graph/editors/*` 退出产品 UI 主体或迁入 feature。

出口标准：

- 改节点 UI 不影响拖拽/嵌套 model。
- 改 Domain 规则不影响节点展示。
- 改右侧编辑栏不影响 adapter。
- UI LOD 真实减少 DOM。

## 17. Phase 5：算法层 DTO、任务化与历史

详细执行门禁见 `FUTURE_PHASES_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` §7。

Phase 5 的核心目标：

```text
OntologyGraph + OntologyViewState
  -> LayoutGraphDTO / EdgeOptimizationDTO
  -> algorithm result
  -> OntologyViewState patch
```

拆分：

1. Phase 5A：建立 `LayoutGraphDTO`、`LayoutNodeDTO`、`LayoutEdgeDTO`，禁止把旧 `Node|Group|Edge` 或 ReactFlow node 传入算法。
2. Phase 5B：`ELKGraphConverter` 和 `LayoutManager` 改为只消费 DTO，layout config 与 UI token 分离。
3. Phase 5C：layout job 引入 job id、document revision、cancel、timeout、duration、warnings。
4. Phase 5D：大图布局进入 Web Worker 或 async job，布局结果应用前校验 revision。
5. Phase 5E：`EdgeOptimizer` 输入中立 DTO，输出 edge view patch 或 handle patch；拖拽中不全图重算。
6. Phase 5F：history 从全量旧 graph snapshot 改为 command/patch history。

出口标准：

- layout/history/edge optimizer 不再依赖旧 `Node|Group|Edge` 作为真相输入。
- 布局输出是本体 view patch。
- 大图布局不阻塞拖拽。
- `Canvas.graphData` 删除条件进一步满足。

## 18. Phase 6：Workspace、Subgraph 与 Repository

详细执行门禁见 `FUTURE_PHASES_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` §8。

Phase 6 不再承担“从旧 graphData 切到本体文档”的第一步，这个动作已前移到 Phase 3D。Phase 6 处理更完整的 workspace/subgraph/data-layer 能力。

拆分：

1. Phase 6A：Subgraph navigation，支持节点链接子图、进入/返回/breadcrumb。
2. Phase 6B：workspace 和 ontology canvas schema version/migrations 完整化。
3. Phase 6C：`workspaceRepository.loadOntologyCanvas/saveOntologyCanvas` 保持唯一前端调用面。
4. Phase 6D：PostgreSQL adapter 第一版保存完整 JSONB 文档，不急着拆 nodes/edges/domains 表。
5. Phase 6E：子图链接、当前子图、子图视口、子图层级可保存。

出口标准：

- 子图导航可用。
- repository 是唯一数据出口。
- JSON/PG adapter 可替换。
- workspace schema migration 可测试。

## 19. Phase 7：Legacy 清理

详细执行门禁见 `FUTURE_PHASES_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` §9。

说明：Phase 7 只做“文件和入口残留清理”，不承担运行态切换。旧 `Node/Group/Edge + BlockEnum` 主链路必须在 Phase 3E/4/5/6 完成退场。

拆分：

1. Phase 7A：删除 `Canvas.graphData`、默认 workspace display cache 和旧 graph model 中不再使用的字段。
2. Phase 7B：删除 `page.legacy.tsx`、不再使用的旧 graph components/hooks/store、debug/test/push 临时脚本。
3. Phase 7C：旧修复说明提炼为 ADR 或归档；Mermaid 历史资料继续留在 archive。
4. Phase 7D：明确 npm 或 pnpm，删除另一套 lockfile，清理生成缓存和临时文件。
5. Phase 7E：架构边界脚本升级为更完整的 import boundary，并纳入后续验收。

出口标准：

- 主路径无旧 graph 真相源。
- 默认 workspace 只有本体文档。
- 文档、脚本、依赖清晰。
- `npm run lint/build/check` 通过。

## 19.1 Phase 8：本体导入、导出与推理准备

详细执行门禁见 `FUTURE_PHASES_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` §10。

Phase 8 在主画布、数据层、算法层稳定后再启动。

拆分：

1. Phase 8A：设计中立导入契约：`parseSource(input) -> OntologyImportDraft`。
2. Phase 8B：优先支持项目自定义本体 JSON schema，不先恢复 Mermaid。
3. Phase 8C：实现 RDF/OWL/Turtle 导出 draft，不在 UI 层拼字符串。
4. Phase 8D：增强 domain/range、关系类型、字段类型等规则校验，为推理机或图数据库准备。

禁止：

- parser 直接写 store。
- 导入功能直接调用布局。
- 导入功能直接 fetch。
- 没有本体 schema 就恢复 Mermaid。

## 20. 测试与验收

Phase 0 测试：

- `updateGroup({ nodeIds })` 保持 nodes 扁平。
- hide all edges 真正隐藏全部。
- delete node/group 删除 incident edges。
- 临时导入入口不出现在主 UI。

算法测试：

- 小图、有向图、group、嵌套 group、循环嵌套、孤儿边、大图样本。

性能验收：

- 100+ 节点启用 LOD：Phase 3A 已完成 adapter LOD 标记，UI 降级渲染待后续接入。
- 200+ 节点启用 viewport culling：Phase 3A 当前阈值为 80，已先启用基础视口裁剪。
- 拖拽期间不触发全图持久化。
- edge sync 不再 O(E*N)。

构建验收：

- `npm run build` 通过。
- lint error 已在 Phase 2C graph runtime 类型债务清理后降为 `0 errors`；旧转换链路删除、热路径日志清理、ReactFlow adapter 边界迁移后，普通 `npm run lint` 当前为 `0 errors / 28 warnings`，主要是历史未使用项和 hook dependency。
- 后端 Python 基础语法继续通过。
