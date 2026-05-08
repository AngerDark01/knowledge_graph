# Codebase 重新扫描摘要

日期：2026-04-29

本摘要用于在上下文压缩后保留本轮重扫的关键结论。权威细节仍以 `CODEBASE.md` 和 `ITERATION_LOG.md` 为准。

## 本轮新增约束基线

新增文件：

- `FRONTEND_ARCHITECTURE_RULES.zh-CN.md`

约束分两层：

1. 通用前端 Rules：page 只装配、feature 内部拆 model/ui/blocks、数据链路唯一、状态分层、UI token 零硬编码、性能与交互落位。
2. Ontology Canvas 项目 Rules：本体模型独立于 ReactFlow、adapter 唯一出口、图谱修改走 command、持久化白名单、schema migration、算法层纯净、legacy 隔离、import 边界工具化。

## 当前代码真实分层

当前项目仍按技术类型横向组织：

```text
frontend/
  app/
  components/
  stores/
  services/
  types/
  utils/
  config/
```

这与目标分层冲突：

```text
page
  -> feature/blocks
      -> feature/model
          -> domain/ontology
          -> core/algorithms
          -> data-layer
feature/ui -> ui-kit
```

## 算法模块扫描结论

已深读算法相关文件：

- `frontend/services/layout/LayoutManager.ts`
- `frontend/services/layout/strategies/ELKLayoutStrategy.ts`
- `frontend/services/layout/strategies/ELKGroupLayoutStrategy.ts`
- `frontend/services/layout/algorithms/EdgeOptimizer.ts`
- `frontend/services/layout/utils/ELKGraphConverter.ts`
- `frontend/services/layout/utils/ELKConfigBuilder.ts`
- `frontend/services/layout/utils/NestingTreeBuilder.ts`
- `frontend/services/layout/utils/GeometryUtils.ts`
- `frontend/services/layout/types/layoutTypes.ts`
- `frontend/config/layout.ts`
- `frontend/config/elk-algorithm.ts`

核心结论：

- 算法文件位置相对独立，但类型上仍直接消费旧 `Node | Group | Edge`。
- `LayoutNode = Node | Group`、`LayoutEdge = Edge` 只是别名，不是算法 DTO。
- ELK 转换器会读取 `isExpanded`、`customExpandedSize`、`groupId`、`width/height`、group padding。
- `frontend/config/layout.ts` 混合算法参数、UI 尺寸、标题栏高度、z-index 和动画时间。
- `LayoutManager.cancelCurrentOperation()` 不能真正取消已经进入 ELK 的布局计算。
- `ELKGroupLayoutStrategy.getDescendants()` 递归没有 visited set。
- `EdgeOptimizer` 有增量入口，但大批量时会回退全量计算。

架构判断：

```text
services/layout 不能直接整体搬到 platform/layout-engine。
应先拆为：
1. core/algorithms/layout       纯算法 DTO + 计算
2. platform/adapters/elk        第三方 ELK 适配
3. feature adapter              OntologyGraph/ViewState -> LayoutGraph
4. graph command                applyLayoutPatch
```

## Mermaid 导入扫描结论

已深读：

- `frontend/services/mermaid/MermaidParser.ts`
- `frontend/services/mermaid/MermaidConverter.ts`
- `frontend/services/mermaid/MermaidConverterService.ts`
- `frontend/services/mermaid/MermaidLayoutAdapter.ts`
- `frontend/services/mermaid/types.ts`

核心结论：

- `MermaidParser.parse()` 先 `mermaid.parse()`，再 `mermaid.render()`，但最终数据来自自写文本解析，`svg` 未使用。
- `MermaidConverter.convert()` 输出旧 `Node[]/Group[]/Edge[]`，不是 OntologyGraph。
- `MermaidConverterService.convertAndImport()` 同时做 parse、convert、createCanvas、switchCanvas、写 graph store、布局、保存 workspace、POST API。
- `MermaidLayoutAdapter` 使用 `strategy: 'elk'`，但当前策略注册 id 是 `elk-layout`，若使用会落入 fallback。

架构判断：

```text
Mermaid 导入必须拆成：
features/mermaid-import/model/parser
features/mermaid-import/model/converter
features/ontology-canvas/model/importGraphCommand
features/ontology-canvas/model/applyLayoutCommand
data-layer/workspaceRepository
```

## Graph Store 扫描结论

已深读：

- `frontend/stores/graph/index.ts`
- `frontend/stores/graph/nodes/basicOperations.ts`
- `frontend/stores/graph/nodes/groupOperations.ts`
- `frontend/stores/graph/nodes/conversionOperations.ts`
- `frontend/stores/graph/edgesSlice.ts`
- `frontend/stores/graph/historySlice.ts`
- `frontend/stores/graph/persistenceMiddleware.ts`

核心结论：

- `useGraphStore` 混合 semantic graph、selection、layoutMode、edge visibility、viewport、history、persistence。
- `NEXT_PUBLIC_USE_NEW_LAYOUT` 同时控制布局和持久化启用，语义耦合。
- `deleteNode()` 和 `deleteGroup()` 不删除 incident edges。
- `updateGroup(id, { nodeIds })` 存在嵌套数组 P0 bug。
- `visibleEdgeIds=[]` 既被 `hideAllEdges()` 使用，又在渲染层被解释为 all visible。
- history 是全量浅快照，不是 command/patch history。
- persistence 订阅整个 graph store，不符合持久化白名单。

## ReactFlow 渲染链扫描结论

已深读：

- `frontend/components/graph/core/GraphPageContent.tsx`
- `frontend/components/graph/core/nodeSyncUtils.ts`
- `frontend/components/graph/core/hooks/useNodeHandling.ts`
- `frontend/components/graph/core/hooks/useEdgeHandling.ts`
- `frontend/components/graph/core/hooks/useSelectionHandling.ts`
- `frontend/components/graph/core/hooks/useViewportControls.ts`
- `frontend/components/graph/nodes/NoteNode.tsx`
- `frontend/components/graph/nodes/GroupNode.tsx`
- `frontend/components/graph/edges/CustomEdge.tsx`

核心结论：

- 当前 adapter 分散在 `nodeSyncUtils` 和 `GraphPageContent` 的 edge sync effect。
- `GraphPageContent` 无 selector 订阅整个 graph store。
- edge sync 每条边都 `storeNodes.find()` 查源/目标，O(E*N)。
- `NoteNode`、`GroupNode`、`CustomEdge` 都直接读写 graph store，不是纯 UI。
- `CustomEdge` 每条边注册一个 window event listener。
- UI 尺寸、颜色、marker、label 样式大量硬编码。

## Data-layer 扫描结论

已深读：

- `frontend/app/api/workspace/load/route.ts`
- `frontend/app/api/workspace/save/route.ts`
- `frontend/app/api/layout/route.ts`
- `frontend/stores/workspace/*`
- `frontend/utils/workspace/canvasSync.ts`
- `frontend/utils/workspace/persistence.ts`
- `frontend/services/storage/StorageManager.ts`
- `frontend/services/storage/adapters/FileSystemAdapter.ts`
- `frontend/types/workspace/*`

核心结论：

- `/api/workspace/load|save` 直接读写 `public/workspace/{key}`。
- `StorageManager/FileSystemAdapter` 已经是 data-layer 雏形，但主业务路径没有统一使用。
- `canvasSync`、`persistenceMiddleware`、`persistWorkspace`、`MermaidConverterService` 都直接 fetch `/api/workspace/save`。
- `/api/layout` 顶层实例化 `LayoutManager`，且 strategy metadata 过期。
- `Canvas.graphData` 直接保存旧 Node/Group/Edge，schema 使用 passthrough，临时 UI 字段会被持久化。

## 当前最高优先级风险

P0：

- `updateGroup({ nodeIds })` 会把 nodes 变成嵌套数组。
- `hideAllEdges()` 不生效。
- 删除节点/组后留下孤儿边。
- Docker Compose Dockerfile 路径错误。

P1：

- Graph store 混合领域数据、UI 状态、history、persistence。
- 算法层依赖旧 UI 模型，没有 DTO。
- Mermaid 导入大 service 混合过多职责。
- ReactFlow adapter 分散，edge sync O(E*N)。
- 持久化路径重复且不走唯一 data-layer。
- UI token 和算法 config 混用。

## 新版架构设计应覆盖

新版方案必须显式包含：

- `domain/ontology` 本体模型。
- `features/ontology-canvas/model/ui/blocks/adapters/config`。
- `core/algorithms/layout/import/graph` 纯算法层。
- `data-layer/workspaceRepository` 唯一数据出口。
- ReactFlow adapter 唯一入口。
- Graph command 层。
- 状态拆分和持久化白名单。
- 算法 DTO、GraphPatch、layout job 可取消/可度量。
- Phase 0 correctness fixes。
