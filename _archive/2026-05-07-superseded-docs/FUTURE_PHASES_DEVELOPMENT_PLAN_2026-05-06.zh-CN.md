# 后续阶段开发总计划

日期：2026-05-06

## 1. 文档定位

这份文档覆盖 Phase 3E 之后的所有后续阶段，不只约束节点/Domain 交互修复。

它用于回答：

- 后续每个阶段做什么。
- 每个阶段开始前必须读哪些文档。
- 每个阶段不能破坏哪些已经确定的契约。
- 每个阶段做到什么程度才能进入下一阶段。

`PHASE_3E_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` 仍然保留，作为 Phase 3E 的详细子计划。本文件是更高一级的总路线。

## 2. 全局开发门禁

任何后续阶段开工前，必须先完成四步：

1. 读阶段必读文档。
2. 在 `ITERATION_LOG.md` 写开工声明。
3. 明确本阶段不变量和禁止事项。
4. 明确本阶段验收命令。

开工声明模板：

```text
本轮阶段：
本轮任务：

必读文档已读：
- ...

本轮不变量：
- ...

本轮禁止事项：
- ...

本轮验收命令：
- ...
```

没有这段记录，不进入代码修改。

## 3. 基础必读文档

所有后续阶段默认必读：

1. `ACTIVE_DOCS.zh-CN.md`
2. `prd.md`
3. `FRONTEND_ARCHITECTURE_RULES.zh-CN.md`
4. `OPTIMIZATION_TODO_2026-04-29.zh-CN.md`
5. `CODEBASE.md` 的风险登记册
6. `ITERATION_LOG.md` 最近一轮记录
7. 本文档：`FUTURE_PHASES_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md`

涉及节点/Domain/画布交互时额外必读：

1. `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md`
2. `NODE_DOMAIN_INTERACTION_CONTRACT_2026-05-06.zh-CN.md`
3. `CANVAS_INTERACTION_PERFORMANCE_RESEARCH_2026-05-06.zh-CN.md`
4. `PHASE_3E_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md`

涉及算法/布局时额外必读：

1. `NODE_DOMAIN_INTERACTION_CONTRACT_2026-05-06.zh-CN.md` §7
2. `CANVAS_INTERACTION_PERFORMANCE_RESEARCH_2026-05-06.zh-CN.md` §7.6/§9/§10
3. `prd.md` §5/§6/§10
4. `CODEBASE.md` 中 layout / ELK / edge optimizer 风险项

涉及 workspace / subgraph / 持久化时额外必读：

1. `prd.md` §4/§7/§8/§10
2. `CODEBASE.md` 中 workspace / repository / `Canvas.graphData` 风险项
3. `frontend/types/workspace/ontologyCanvas.ts`
4. `frontend/data-layer/workspace/workspaceRepository.ts`

涉及导入/导出/本体 schema 时额外必读：

1. `prd.md` §1/§2/§3/§5
2. `domain/ontology/model/*`
3. `domain/ontology/validation/*`
4. 本体工程相关约束：先定义中立 `OntologyImportDraft`，不直接恢复 Mermaid 主线。

## 4. 总体阶段顺序

后续顺序调整为：

```text
Phase 3E：交互正确性、节点 UI 产品化、旧 graph store 初步退场
  -> Phase 4：UI feature 化和旧 UI 主体退场
  -> Phase 5：算法层 DTO / layout job / worker / patch history
  -> Phase 6：Workspace / Subgraph / Repository / PostgreSQL adapter
  -> Phase 7：Legacy 文件、脚本、schema、文档清理
  -> Phase 8：本体导入/导出/推理准备
```

不能跳过：

- Phase 3E-A 未完成，不进入 Phase 4。
- 节点 UI 未产品化，不进入 Phase 4 UI feature 化。
- UI 主体未 feature 化，不进入 Phase 5 算法重构。
- layout/history/edge optimizer 未脱离旧 graph store，不删除 `Canvas.graphData`。
- data-layer 未稳定，不做 PostgreSQL adapter。
- 本体导入协议未设计，不恢复 Mermaid 导入。

## 5. Phase 3E：运行态稳定

### 5.1 目标

让 Ontology Canvas 的核心运行态稳定：

- 本体文档是真相源。
- 本体 view 保存绝对坐标。
- ReactFlow adapter 只负责投影。
- 节点/Domain 交互由 model 输出批量 patch。
- 节点 UI 变成本体节点 UI。
- 旧 graph store 退为 display cache，并开始退场。

### 5.2 子阶段

Phase 3E-A：节点/Domain 嵌套交互修复。

- 详见 `PHASE_3E_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` §5。
- 先写 `domainNesting.ts` 和测试。
- 再接 `ontologyDocumentStore.applyInteractionPatch()`。
- 最后接 `GraphPageContent` 拖拽提交链路。

Phase 3E-B：节点 UI 产品化与配置化。

- 详见 `PHASE_3E_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` §6。
- 新增 `ClassNodeView`、`DomainNodeView`、tokens、LOD。
- 节点上支持属性查看和新增入口。

Phase 3E-C：旧 graph store 继续退场。

- 详见 `PHASE_3E_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` §7。
- 清理主交互和显示路径对旧 graph store 真相源的依赖。
- layout/history/edge optimizer 只登记待迁移范围，正式 DTO/patch 改造放到 Phase 5。
- 为后续删除 `Canvas.graphData` 准备静态扫描和迁移清单。

### 5.3 出口标准

进入 Phase 4 前必须满足：

- 节点拖拽不回弹。
- 父 Domain 移动时后代跟随。
- Domain 边界级联写回 `OntologyViewState.domainViews`。
- 节点 UI 能显示本体类型和关键属性。
- LOD 至少在 UI 层真实减少 DOM。
- 旧 graph store 不再参与拖拽最终位置判断。

## 6. Phase 4：UI feature 化与旧 UI 退场

### 6.1 开工必读

- 全局必读文档。
- 产品交互规格 §5/§6/§7/§8。
- 性能研究 §8/§9/§10。
- 前端 Rules R4/R5/R9/R10。

### 6.2 目标

把 UI 调整能力从交互和数据模型中拆出来：

```text
page
  -> feature blocks
      -> model / adapters / ui / config
```

### 6.3 子阶段

Phase 4A：Canvas blocks。

- 新增或完善 `OntologyCanvasBlock`、`CanvasToolbarBlock`、`NodeInspectorBlock`。
- route page 只做装配和读路由参数。
- `GraphPageContent` 逐步变成 blocks/container，而不是业务中心。

Phase 4B：纯 UI 组件。

- `ClassNodeView` 只收 props/events/tokens。
- `DomainNodeView` 只收 props/events/tokens。
- `SemanticEdgeView` 不直接 update store。
- 右侧 Inspector UI 只收 draft props 和 callbacks。

Phase 4C：UI token / density。

- 节点尺寸、属性行高、字号、间距、圆角、LOD 阈值进入 config。
- 颜色、阴影、状态样式消费语义 token。
- 改 UI 密度不改 model。

Phase 4D：LOD / collapse UI。

- full/compact/outline/dot 真实减少 DOM。
- Domain collapse 后内部节点不完整渲染。
- 展开后恢复原位置。

Phase 4E：旧 UI 退场。

- 旧 `NoteNode/GroupNode` 退出产品 UI 主体。
- 旧 `components/graph/editors/*` 迁到 feature blocks/ui。
- 旧 graph 目录只保留短期 adapter 或删除。

### 6.4 禁止事项

- UI 组件直接 import store。
- UI 组件直接 fetch。
- UI 组件硬编码基础尺寸/颜色。
- 为了 UI 方便把交互规则写进节点组件。

### 6.5 出口标准

- 改节点 UI 不影响拖拽/嵌套 model。
- 改 Domain 规则不影响节点展示。
- 改右侧编辑栏不影响 adapter。
- UI LOD 真实减少 DOM。

## 7. Phase 5：算法层 DTO、任务化与历史

### 7.1 开工必读

- 全局必读文档。
- 技术交互契约 §7。
- 性能研究 §7.6/§9/§10。
- `CODEBASE.md` 中 layout / ELK / edge optimizer / history 风险。

### 7.2 目标

把算法从 UI、ReactFlow、旧 graph store 中拆出来：

```text
OntologyGraph + OntologyViewState
  -> LayoutGraphDTO / EdgeOptimizationDTO
  -> algorithm result
  -> OntologyViewState patch
```

### 7.3 子阶段

Phase 5A：Layout DTO。

- 新增 `LayoutGraphDTO`、`LayoutNodeDTO`、`LayoutEdgeDTO`。
- adapter 从本体 document 生成 DTO。
- DTO 只包含算法需要的 id、parentId、width、height、edge endpoints、层级信息。
- 禁止把 ReactFlow node、旧 Node/Group、UI style 传入算法。

Phase 5B：ELK / layout converter 纯化。

- `ELKGraphConverter` 只接收 Layout DTO。
- `LayoutManager` 不再接收旧 graph nodes/edges。
- layout 配置和 UI token 分离。

Phase 5C：Layout job。

- 引入 job id、document revision、cancel/timeout/duration/warnings。
- 布局结果应用前校验 revision。
- 连续触发布局时旧 job 结果不能覆盖新 document。

Phase 5D：Worker / async layout。

- 大图布局进入 Web Worker 或等价 async job。
- 主线程只负责提交任务和应用 patch。
- 拖拽中不触发布局。

Phase 5E：Edge optimizer patch。

- edge optimizer 输入中立 DTO。
- 输出 edge view patch 或 handle patch。
- 拖拽结束后只处理 affected edges。
- 大图 edge routing 放 idle/worker。

Phase 5F：Command / patch history。

- 一次用户意图对应一条 history。
- 拖拽、Domain 移动、字段保存、折叠/展开都进入 patch history。
- hover、selection、context menu、drag transient、viewport moving 不进 history。

### 7.4 禁止事项

- layout 直接改 ReactFlow nodes。
- layout 直接改旧 graph store。
- layout 读取 UI token。
- worker result 不校验 revision 就应用。
- edge optimizer 在拖拽中全图重算。

### 7.5 出口标准

- layout/history/edge optimizer 不再依赖旧 `Node | Group | Edge` 作为真相输入。
- 布局输出是本体 view patch。
- 大图布局不会阻塞拖拽。
- `Canvas.graphData` 删除条件满足。

## 8. Phase 6：Workspace、Subgraph 与 Repository

### 8.1 开工必读

- 全局必读文档。
- 架构文档 §10/§18。
- `CODEBASE.md` 中 workspace、repository、`Canvas.graphData`、storage 风险项。
- 当前 workspace 类型和 repository 实现。

### 8.2 目标

把工作区和子图导航变成本体层级能力，而不是旧 canvas tree 的简单存储。

### 8.3 子阶段

Phase 6A：Subgraph navigation。

- 节点可链接到子图。
- Domain 可包含子图入口。
- 支持进入/返回/breadcrumb。
- 不把所有细节塞进一张无限画布。

Phase 6B：Workspace schema migrations。

- workspace 和 ontology canvas schema version 完整化。
- 旧 JSON 自动迁移到新 schema。
- migration 只在 data-layer 或 migration 层执行。

Phase 6C：Repository adapter 稳定。

- 前端继续只调用 `workspaceRepository.loadOntologyCanvas/saveOntologyCanvas`。
- JSON 文件 adapter 和未来 PG adapter 使用同一接口。
- UI/store 不直接 fetch workspace API。

Phase 6D：PostgreSQL adapter 第一版。

- 第一版建议保存完整 JSONB 文档：

```text
ontology_canvas_documents(
  id,
  workspace_id,
  document JSONB,
  revision,
  updated_at
)
```

- 不急着拆 nodes/edges/domains 表。
- 需要搜索、统计、权限、协作后再加索引表。

Phase 6E：Subgraph persistence。

- 子图链接、当前子图、子图视口、子图层级可保存。
- 切换子图不丢当前文档修改。

### 8.4 禁止事项

- UI 直接调用后端 API。
- 为 PG adapter 改 feature/model/UI 调用面。
- 在 workspace 层保存 hover/selection/editing draft。
- 在子图导航里恢复旧 graphData 真相源。

### 8.5 出口标准

- 子图导航可用。
- repository 是唯一数据出口。
- JSON/PG adapter 可替换。
- workspace schema migration 可测试。

## 9. Phase 7：Legacy 清理

### 9.1 开工必读

- 全局必读文档。
- `CODEBASE.md` 风险登记册。
- `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` 已完成和暂缓项。

### 9.2 目标

删除已经不再承担主线能力的旧代码、旧文档、旧脚本和旧 schema。

Phase 7 只做残留清理，不承担运行态切换。运行态切换必须在 Phase 3E/4/5/6 完成。

### 9.3 子阶段

Phase 7A：旧 schema 清理。

- 删除 `Canvas.graphData`。
- 删除默认 workspace 中 display cache。
- 删除旧 graph model 中不再使用的字段。

Phase 7B：旧文件清理。

- 删除 `page.legacy.tsx`。
- 删除不再使用的旧 graph components/hooks/store。
- 删除 debug/test/push 临时脚本。

Phase 7C：旧文档归档。

- 继续维护 `ACTIVE_DOCS.zh-CN.md`，新增过时文档必须及时归档。
- Mermaid 历史资料继续留在 archive，不回主线。

Phase 7D：包管理和生成文件。

- 明确 npm 或 pnpm。
- 删除另一套 lockfile。
- 清理生成缓存和临时文件。

Phase 7E：边界检查升级。

- 架构边界脚本升级为更完整的 import boundary。
- CI 或本地验收纳入后续阶段检查。

### 9.4 禁止事项

- 未静态扫描就删除文件。
- 删除用户未明确同意保留的工作区数据。
- 用 destructive git 命令回滚用户改动。
- 为了清理破坏可运行主线。

### 9.5 出口标准

- 主路径无旧 graph 真相源。
- 默认 workspace 只有本体文档。
- 文档、脚本、依赖清晰。
- `npm run lint/build/check` 通过。

## 10. Phase 8：本体导入、导出与推理准备

### 10.1 开工必读

- 全局必读文档。
- 架构文档 §9。
- `domain/ontology/model/*`。
- `domain/ontology/validation/*`。
- 本体工程约束：导入/导出必须围绕 OntologyGraph，不围绕临时图语言。

### 10.2 目标

在主画布、数据层、算法层稳定后，再设计导入/导出和推理准备能力。

### 10.3 子阶段

Phase 8A：中立导入契约。

```text
parseSource(input) -> OntologyImportDraft
validateImportDraft(draft) -> warnings/errors
applyImportDraft(draft) -> ontology command patch
```

Phase 8B：自定义 JSON schema。

- 第一版导入源优先考虑项目自定义本体 JSON。
- 不先恢复 Mermaid。

Phase 8C：RDF/OWL/Turtle 导出。

- OntologyGraph -> RDF/OWL/Turtle draft。
- relation/domain/range/fields 映射清晰。
- 不在 UI 层拼字符串。

Phase 8D：规则/校验增强。

- Domain/range 校验。
- 关系类型约束。
- 字段类型约束。
- 后续可为推理机或图数据库做准备。

### 10.4 禁止事项

- 解析器直接写 store。
- 导入功能直接调用布局。
- 导入功能直接 fetch。
- 还没设计本体 schema 就恢复 Mermaid。
- UI 组件里拼 RDF/OWL。

### 10.5 出口标准

- 导入只输出 draft。
- apply 只走 command。
- 导出只读 OntologyGraph。
- 未来可接 RDF/OWL/SPARQL，不污染画布主线。

## 11. 阶段转换检查表

每个阶段结束时必须回答：

1. 本阶段的真相源是什么，是否唯一。
2. 本阶段有没有新增旧实现堆积。
3. 本阶段有没有违反 feature/model/ui/blocks 分层。
4. 本阶段有没有直接 fetch、直接写 store、直接写 ReactFlow runtime。
5. 本阶段有没有新增硬编码 UI token。
6. 本阶段是否更新了 `CODEBASE.md` 和 `ITERATION_LOG.md`。
7. 本阶段是否运行了对应测试、lint、build、diff check。

## 12. 当前下一步

当前仍然先进入 Phase 3E-A。

但从现在开始，Phase 4、Phase 5、Phase 6、Phase 7、Phase 8 都必须按本文档执行前置阅读和开工记录。

执行顺序固定为：

1. Phase 4 先完成 UI feature 化。
2. Phase 5 再做算法层 DTO/worker/history。

下一轮代码任务建议不变：

1. 写 Phase 3E-A 开工声明。
2. 新增 `domainNesting.ts` 纯 model。
3. 新增 `test-domain-nesting-interactions.mjs`。
4. 先覆盖 Domain 后代收集、Domain move offset、ReactFlow relative 转 absolute。
