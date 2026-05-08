# CODEBASE

## 1. 项目概览

知识图谱编辑器 demo（verified），根 README 描述为前后端分离项目：

- 前端：Next.js 16.0.1、React 19.2.0、TypeScript 5、ReactFlow 11.11.4、Zustand 5.0.8、ELK 0.11.0、Tailwind CSS 4。
- 后端：Python 3.10 容器目标、Flask 3.0.3、Flask-RESTX 1.3.0、SQLAlchemy 2.0.31、Celery 5.4.0、Redis 5.0.8、PostgreSQL 驱动。
- 前端开发命令：`cd frontend && npm run dev`，默认 Next 端口 3000。
- Phase 1 架构验收命令：`cd frontend && npm run check:phase1`，串联 `check:architecture` 和 `test:domain`。
- Phase 2/3 验收命令：`cd frontend && npm run check:phase2`，串联架构边界、domain command、ontology model/mapper/validation、ontology commands、ontology document model、ontology document store、ontology legacy bridge、编辑器草稿模型测试、Domain 嵌套交互测试、画布交互测试、LayoutControl 测试、ELK layout model 测试、ReactFlow adapter projection 测试和 workspace repository 持久化测试。
- 后端开发命令：`cd backend && python app.py` 或容器内 `python run_server.py`，README 声明端口 5001。
- Docker 编排：`docker-compose.yml` 计划启动 frontend、backend、Postgres 15、Redis 7；2026-04-29 Phase 0 已把 build context/dockerfile 修正到根目录 `Dockerfile.frontend` / `Dockerfile.backend`。

关键约束与方向：

- `FRONTEND_ARCHITECTURE_RULES.zh-CN.md` 是本轮新增的架构约束基线：通用层要求 page 只装配、feature 内部强拆 model/ui/blocks、数据链路唯一、UI token 零硬编码；项目层要求本体模型独立于 ReactFlow、渲染 adapter 唯一出口、图谱修改走 command、算法层纯计算、持久化白名单和 legacy 隔离。
- `ACTIVE_DOCS.zh-CN.md` 是当前文档入口：后续默认只读活跃文档，归档目录只用于追溯。`prd.md` 是长期产品方向，已把目标收敛为“节点即容器 / 子画布 / LOD / 正交边 / 导航”。
- `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md` 是当前唯一活跃后续开发路线图：交互与性能基线稳定 → 节点/容器 UI 产品化 → LOD 大图浏览 → 正交边与语义锚点 → 子画布导航 → feature 化与旧 UI/store 清理 → 算法 DTO/worker/history → workspace/PG adapter → 导入导出。2026-05-07 已按四张 UI 参考图进一步细化阶段任务和验收顺序。旧 `FUTURE_PHASES...` 和 `PHASE_3E...` 已归档，不再作为开发依据。
- 2026-05-08 的 UI-first 续作已经完成 Phase B 阶段交付：右侧 Inspector 现在直接编辑结构化字段、方法、规则、接口和容器归属；完整 LOD 下节点内部字段名、字段值、dataType、字段分类、删除和当前分区内排序可直接操作，节点顶栏和 Fields / Methods / Rules / Interfaces 分区均可新增对应字段，分区折叠状态保存到 `OntologyNodeViewState.collapsedSections`，折叠后显示摘要；节点和容器具备 hover/selected/readonly/disabled 状态表达；Domain / 容器可在最终 UI 中切换折叠并显示内部空间入口；旧 `NodeEditor` / `ContentEditor` / `StructuredAttributeEditor` / `NoteNodeEdit` 已删除。
- `UI_REFERENCE_INTERACTION_SPEC_2026-05-07.zh-CN.md` 是四张 UI 参考图的长期执行规格，定义节点嵌套、正交边、LOD 大图、子画布导航的产品含义、模型影响、token 要求和验收方法。2026-05-07 已补充对当前实现的影响评估：现有 `OntologyNode` 基础字段可保留，但 methods/sections、relation type、semantic anchor、node-owned child canvas、per-subcanvas viewport/navigation history 需要分阶段模型演进。
- `UI_iamge/` 是后续 UI 阶段的参考图目录，节点 UI、LOD、正交边、子画布导航、MiniMap、Breadcrumb 等任务开工前必须查看；执行时优先读 UI 规格，再看原图。
- Phase 3D 后，workspace 持久化主线是 `Canvas.ontologyDocument: PersistedOntologyCanvas`；旧 `Canvas.graphData` 只作为 ReactFlow 显示缓存和旧数据迁移输入。
- 后续代码开发必须先读 `ACTIVE_DOCS.zh-CN.md` 和 `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md`，并在 `ITERATION_LOG.md` 写明本轮已读章节、不变量和验收命令；没有记录不进入代码修改。
- 画布核心依赖 ReactFlow，以 DOM/SVG 渲染复杂节点和边；大量类图式节点时需要 LOD、视口裁剪、状态拆分和 memo 策略。
- 当前配置层已修复一批迁移残留：Tailwind content 扫描改为真实根级源码目录，shadcn CSS 路径改为 `app/globals.css`。
- 包管理器存在混用风险：`package-lock.json`、`pnpm-lock.yaml` 并存，Dockerfile 使用 npm。

## 2. 目录结构图

以下目录图排除了 `node_modules`、`.git`、`.next`、锁文件和虚拟环境。覆盖进度不放在本文件，见 `ITERATION_LOG.md`。

```text
knowledge_graph/
├── README.md — 根项目说明，描述 Next.js + Flask 知识图谱编辑器和默认运行方式。
├── CODEBASE.md — 本次生成的项目情报文档，不包含覆盖进度。
├── ITERATION_LOG.md — 本次生成的扫描迭代日志和覆盖进度表。
├── ACTIVE_DOCS.zh-CN.md — 当前活跃文档索引，定义后续默认阅读文档和归档文档边界。
├── prd.md — 新版产品 PRD，定义节点即容器、子画布、正交边、LOD、大图浏览和导航系统。
├── DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md — 当前唯一活跃后续开发路线图，按新版 PRD 重排阶段顺序和清理策略。
├── UI_REFERENCE_INTERACTION_SPEC_2026-05-07.zh-CN.md — 四张 UI 参考图的交互规格，沉淀节点嵌套、正交边、LOD 和子画布导航的执行契约。
├── FRONTEND_ARCHITECTURE_RULES.zh-CN.md — 本次沉淀的通用前端 Rules 与 Ontology Canvas 项目级约束。
├── NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md — 用户视角的节点/Domain 产品交互规格，定义 Domain 创建、移动、折叠、节点属性展示、节点上新增属性和 UI 配置化验收。
├── NODE_DOMAIN_INTERACTION_CONTRACT_2026-05-06.zh-CN.md — 技术交互契约，沉淀旧项目绝对坐标、ReactFlow 相对投影、Domain 后代 offset、边界级联和当前回归原因。
├── CANVAS_INTERACTION_PERFORMANCE_RESEARCH_2026-05-06.zh-CN.md — 画布交互与性能研究，沉淀 React Flow、tldraw、Dify 和旧项目经验。
├── UI_iamge/ — UI 参考图目录，后续节点 UI、LOD、正交边、子画布导航、MiniMap、Breadcrumb 开发前必须查看。
├── _archive/2026-05-07-superseded-docs/ — 已归档的旧架构、旧 TODO、旧计划、审查、验证和前端经验快照；后续默认不作为开发依据。
├── docker-compose.yml — 编排前端、后端、Postgres、Redis；build context 指向根目录 Dockerfile。
├── Dockerfile.frontend — 根目录前端镜像定义，使用 Node 18、npm ci、npm run build/start。
├── Dockerfile.backend — 根目录后端镜像定义，使用 Python 3.10、requirements.txt、run_server.py。
├── tsconfig.tsbuildinfo — TypeScript 构建缓存，属于生成文件候选。
├── backend/
│   ├── app.py — 后端应用入口候选，待确认 Flask app 和路由注册。
│   ├── app_factory.py — 后端应用工厂候选，待确认扩展与配置初始化。
│   ├── run_server.py — 后端容器启动脚本候选，待确认 host/port。
│   ├── requirements.txt — Python 依赖清单。
│   ├── test_mermaid_converter.py — 已删除：临时 Mermaid 转换测试脚本，当前本体图主线不保留导入实现。
│   ├── configs/
│   │   └── app_config.py — 后端应用配置候选，待确认环境变量。
│   ├── controllers/
│   │   └── mermaid.py — 已删除：临时 Mermaid API 控制器，后续导入协议重新设计。
│   ├── extensions/
│   │   └── __init__.py — 后端扩展聚合候选。
│   └── services/
│       └── graph/
│           └── mermaid_converter.py — 已删除：临时 Mermaid 转换逻辑，后续不作为本体导入主线。
├── frontend/
│   ├── README.md — 前端项目说明，描述 ReactFlow/Zustand 图编辑功能。
│   ├── package.json — 前端依赖和 dev/build/start/lint/check:architecture/test:domain/test:ontology/test:ontology:commands/test:ontology:document-store/test:editors/test:canvas:interactions/test:layout:control/test:layout:elk/test:react-flow-adapter/test:workspace:repository/check:phase1/check:phase2 脚本。
│   ├── package-lock.json — npm 锁文件，和 pnpm 锁并存。
│   ├── pnpm-lock.yaml — pnpm 锁文件，和 npm 锁并存。
│   ├── tsconfig.json — 前端 TS 配置，启用 strict、allowJs、根级 `@/*` 路径别名。
│   ├── next.config.ts — Next 配置，目前为空配置。
│   ├── eslint.config.mjs — ESLint flat config，仅继承 Next core-web-vitals/typescript。
│   ├── postcss.config.mjs — Tailwind 4 PostCSS 插件配置。
│   ├── tailwind.config.ts — Tailwind 配置；content 扫描 app/components/hooks/lib/services/stores/types/utils。
│   ├── components.json — shadcn/ui 配置；CSS 路径指向 `app/globals.css`。
│   ├── debug-edge-arrows.js — 边箭头调试脚本候选。
│   ├── test-api.js — 已删除：旧 CommonJS API 临时测试脚本，未接入 npm scripts。
│   ├── test-mermaid.ts — 已删除：临时 Mermaid parser 测试脚本。
│   ├── test-mermaid-parser.ts — 已删除：临时 Mermaid parser 测试脚本。
│   ├── push-to-github.ps1 — Windows PowerShell 推送脚本候选。
│   ├── push-to-github.bat — Windows bat 推送脚本候选。
│   ├── scripts/
│   │   ├── check-architecture-boundaries.mjs — 轻量架构边界检查脚本，当前保护 domain/ontology、feature model 和 ReactFlow adapter。
│   │   ├── load-typescript-module.mjs — 共享 TypeScript module loader，供轻量运行时测试脚本复用。
│   │   ├── test-domain-commands.mjs — 轻量 domain command 运行时测试脚本，覆盖 Phase 1 纯规则。
│   │   ├── test-ontology-model.mjs — 轻量 ontology model 运行时测试脚本，覆盖 Phase 2A mapper 与 validation。
│   │   ├── test-ontology-commands.mjs — 轻量 ontology command 运行时测试脚本，覆盖 Phase 2B 语义命令。
│   │   ├── test-ontology-document-model.mjs — 轻量 ontology document model 测试脚本，覆盖 Phase 3B document state/use-case 和节点 ViewModel 空字段分区投影。
│   │   ├── test-ontology-document-store.mjs — 轻量 ontology document store 测试脚本，覆盖 replace/apply/interaction patch/view/viewport/delete。
│   │   ├── test-ontology-legacy-bridge.mjs — 轻量 ontology legacy bridge 测试脚本，覆盖本体文档到旧画布展示运行态的临时投影。
│   │   ├── test-editor-drafts.mjs — 轻量编辑器草稿模型测试脚本，覆盖 Phase 2B 编辑入口收敛。
│   │   ├── test-domain-nesting-interactions.mjs — 轻量 Domain 嵌套交互测试脚本，覆盖 ReactFlow 相对坐标转绝对坐标、Domain 后代平移、节点约束、展开状态和边界级联。
│   │   ├── test-canvas-interactions.mjs — 轻量画布交互模型测试脚本，覆盖 Phase 2C 展开/删除计划、Phase 3E-B 默认字段生成、分区分类默认值、字段行内更新 helper、resize 提交闸门和显式归入/移出容器。
│   │   ├── test-layout-control-model.mjs — 轻量布局控制模型测试脚本，覆盖 Phase 2C LayoutControl 收敛。
│   │   ├── test-elk-layout-model.mjs — 轻量 ELK 布局模型测试脚本，覆盖配置、转换、展开尺寸和坐标提取。
│   │   ├── test-react-flow-adapter.mjs — 轻量 ReactFlow adapter projection 测试脚本，覆盖节点/边投影、节点 ViewModel 空分区、LOD、视口裁剪、容器折叠隐藏后代、端点边过滤、跨组边和循环 groupId 降级。
│   │   └── test-workspace-repository.mjs — 轻量 workspace repository 测试脚本，覆盖本体 JSON 快照、默认 workspace schema 和 fetch 出口。
│   ├── app/
│   │   ├── layout.tsx — Next 根布局候选。
│   │   ├── page.tsx — Next 首页和工作区初始化候选。
│   │   ├── page.legacy.tsx — 旧版首页候选。
│   │   ├── globals.css — 全局样式和 Tailwind 入口候选。
│   │   ├── favicon.ico — favicon 静态资源。
│   │   └── api/
│   │       ├── layout/route.ts — 布局 API 路由候选。
│   │       └── workspace/
│   │           ├── load/route.ts — 工作区加载 API 候选。
│   │           └── save/route.ts — 工作区保存 API 候选。
│   ├── domain/
│   │   └── ontology/
│   │       ├── index.ts — Ontology domain 公开出口，导出 commands、model、mappers、validation。
│   │       ├── commands/
│   │           ├── index.ts — Ontology commands 公开出口。
│   │           ├── edgeVisibility.ts — 边可见性纯规则，负责 all/none/custom 模式。
│   │           ├── graphCommands.ts — 本体图语义命令，负责节点、字段、关系、Domain 移动和本体元素删除。
│   │           └── graphConsistency.ts — 图一致性纯规则，负责删除节点时清理 incident edges。
│   │       ├── model/
│   │       │   ├── index.ts — Ontology model 公开出口。
│   │       │   ├── schemaVersion.ts — 本体 schema version 常量和类型。
│   │       │   ├── node.ts — 本体节点、字段和字段分类类型。
│   │       │   ├── edge.ts — 本体语义边和方向类型。
│   │       │   ├── domain.ts — 本体 Domain/分组边界类型。
│   │       │   ├── subgraph.ts — 本体子图导航类型。
│   │       │   └── graph.ts — OntologyGraph 聚合模型和创建函数。
│   │       ├── mappers/
│   │       │   ├── index.ts — Ontology mapper 公开出口。
│   │       │   └── legacyGraphMapper.ts — 旧 Node/Group/Edge 到 OntologyGraph 的纯转换器。
│   │       └── validation/
│   │           ├── index.ts — Ontology validation 公开出口。
│   │           └── graphValidation.ts — OntologyGraph 一致性校验器。
│   ├── features/
│   │   └── ontology-canvas/
│   │       ├── index.ts — ontology canvas feature 公开出口，当前导出 model、state、legacy graph adapter 和 ReactFlow adapter。
│   │       ├── adapters/
│   │       │   ├── legacy-graph/
│   │       │   │   ├── index.ts — legacy graph adapter 公开出口。
│   │       │   │   └── documentBridge.ts — 本体文档和旧 Node/Group 展示运行态之间的临时桥接层。
│   │       │   └── react-flow/
│   │       │       ├── index.ts — ReactFlow adapter 公开出口。
│   │       │       └── projection.ts — 旧 graph runtime 到 ReactFlow nodes/edges 的投影器。
│   │       ├── config/
│   │       │   ├── index.ts — ontology canvas config 公开出口。
│   │       │   ├── domainViewTokens.ts — 本体 Domain / 容器节点 UI 尺寸、间距、摘要和语义色 token。
│   │       │   └── nodeViewTokens.ts — 本体节点 UI 尺寸、间距、字号、LOD 阈值和语义色 token。
│   │       ├── state/
│   │       │   ├── index.ts — ontology canvas state 公开出口。
│   │       │   └── ontologyDocumentStore.ts — 当前运行时本体文档 Zustand store。
│   │       ├── ui/
│   │       │   ├── index.ts — ontology canvas UI 公开出口；不从 feature 根出口再导出，避免纯 model 脚本加载 TSX。
│   │       │   ├── ClassNodeView.tsx — 纯本体类图节点 UI，消费节点 ViewModel 并按 LOD 渲染完整/紧凑/轮廓/点状视图。
│   │       │   ├── DomainNodeView.tsx — 纯本体 Domain / 容器节点 UI，消费容器 ViewModel 并按折叠/LOD 渲染摘要。
│   │       │   ├── NodeAttributeEditor.tsx — 纯节点属性/结构化字段编辑 UI，按 node/domain mode 编辑字段分区或普通元数据。
│   │       │   ├── NodeFieldList.tsx — 纯字段列表 UI，展示/行内编辑字段名、值、类型、分类、删除、排序、分类徽标和语义色。
│   │       │   ├── NodeMetricList.tsx — 纯节点统计 UI，展示字段、方法、子节点、关系等数量徽标。
│   │       │   └── NodeSection.tsx — 纯节点分区 UI，支持可选折叠按钮和分区动作按钮。
│   │       ├── blocks/
│   │       │   └── NodeInspectorBlock.tsx — 右侧 Inspector block，联通旧 store、ontology document 和纯 UI 预览。
│   │       └── model/
│   │           ├── index.ts — ontology canvas model 公开出口。
│   │           ├── document/
│   │           │   ├── index.ts — ontology document model 公开出口。
│   │           │   ├── ontologyDocument.ts — 本体文档状态、视图状态、创建/更新/删除 use-case。
│   │           │   └── persistence.ts — 本体文档运行态与 PersistedOntologyCanvas JSON 快照互转。
│   │           ├── inspector/
│   │           │   ├── index.ts — inspector model 公开出口。
│   │           │   ├── editorDrafts.ts — 编辑器纯模型 helper，负责 draft、解析和 store update payload 构造。
│   │           │   └── savePlans.ts — Inspector 保存计划，负责校验、payload 和 membership plan。
│   │           ├── interactions/
│   │               ├── index.ts — 画布交互 model 公开出口。
│   │               ├── domainNesting.ts — Phase 3E-A 本体 view 嵌套交互事务，生成节点拖拽、Domain 拖拽、resize/expand、显式归入容器空位放置和边界级联 patch。
│   │               ├── nodeFields.ts — Phase B4 节点字段交互纯模型，生成唯一字段名、按分类默认字段、字段行内编辑 patch、删除和排序。
│   │               ├── nodeExpansion.ts — 节点展开/折叠计划和自定义展开尺寸判定。
│   │               ├── resizeCommitGate.ts — resize 提交闸门，区分用户 resize 与 LOD 自动尺寸测量。
│   │               └── canvasDeletion.ts — 画布选中删除/清空计划，避免重复删 incident edges。
│   │           ├── view/
│   │               ├── index.ts — 节点 ViewModel 公开出口。
│   │               ├── domainViewModel.ts — 本体 Domain / 容器展示模型 mapper，聚合子节点、子容器、关系和内部空间摘要。
│   │               └── nodeViewModel.ts — 本体节点展示模型 mapper，聚合字段、方法、规则、接口、关系和子画布摘要。
│   │           └── layout/
│   │               ├── index.ts — 布局控制 model 公开出口。
│   │               └── layoutControl.ts — LayoutControl 纯 helper，负责策略 options、节点/边 patch、群组子节点筛选。
│   ├── components/
│   │   ├── ErrorBoundary.tsx — React 错误边界候选。
│   │   ├── Providers.tsx — ReactFlow Provider 聚合候选。
│   │   ├── ui/ — shadcn/Radix 基础 UI primitives。
│   │   ├── workspace/ — 工作区三栏布局与侧栏画布树。
│   │   └── graph/ — 图画布、节点、边、编辑器、控制组件；临时 Mermaid 导入 UI 和旧节点编辑器已删除。
│   │       ├── controls/
│   │       │   └── LayoutControl.tsx — 布局控制按钮，调用 feature model helper 和 LayoutManager。
│   │       └── editors/
│   │           ├── EdgeEditor.tsx — 边属性编辑器，使用本地 draft 和显式保存。
│   │           ├── NodeEditor.tsx — 已删除：旧节点/分组属性编辑器，UI 已迁入 ontology-canvas Inspector。
│   │           ├── ContentEditor.tsx — 已删除：旧内容编辑器。
│   │           └── StructuredAttributeEditor.tsx — 已删除：旧结构化属性键值编辑器。
│   ├── data-layer/
│   │   └── workspace/
│   │       ├── index.ts — workspace data-layer 公开出口。
│   │       └── workspaceRepository.ts — workspace JSON load/save 唯一前端 fetch 出口和 ontology canvas 持久化 helper。
│   ├── config/ — 图、布局、ELK、常量配置文件。
│   ├── hooks/ — 跨组件 hooks 候选。
│   ├── lib/ — 通用工具函数候选。
│   ├── public/ — 默认 SVG 静态资源和工作区 JSON。
│   ├── services/ — 布局、存储服务；临时 Mermaid 导入 service 已删除。
│   │   └── layout/
│   │       └── utils/
│   │           └── ELKRuntime.ts — elkjs 动态模块适配器，按需创建 ELK engine。
│   │           └── layoutDebug.ts — 布局服务调试日志开关，仅 `NEXT_PUBLIC_LAYOUT_DEBUG=true` 时输出。
│   ├── stores/ — Zustand graph/workspace store。
│   ├── types/ — graph/workspace/layout 类型契约。
│   │   └── workspace/
│   │       └── ontologyCanvas.ts — PersistedOntologyCanvas schema、持久化 view 白名单和空本体文档工厂。
│   └── utils/ — graph/workspace/validation 工具。
├── 项目文档/ — 旧项目文档；Mermaid 研究资料和示例已移入 `_archive/mermaid-import-legacy/`，不属于当前系统能力。
```

## 3. 架构全景

### C4 Level 1 - 系统上下文

```text
┌──────────────┐
│   User       │
│ 建模/编辑图谱 │
└──────┬───────┘
       │ browser
       ▼
┌───────────────────────────────┐
│ Knowledge Graph Editor         │
│ Next.js 前端 + 本地 API Routes │
└──────┬──────────────┬─────────┘
       │              │
       │ optional     │ file JSON
       ▼              ▼
┌──────────────┐   ┌────────────────────────────┐
│ Flask Backend│   │ public/workspace/*.json     │
│ Flask Backend│   │ workspace/canvas persistence│
└──────┬───────┘   └────────────────────────────┘
       │
       ▼
┌──────────────┐   ┌──────────────┐
│ PostgreSQL   │   │ Redis/Celery │
│ planned DB   │   │ planned async│
└──────────────┘   └──────────────┘
```

### C4 Level 2 - 前端容器

```text
┌─────────────────────────────────────────────────────────────┐
│ Next App Router                                              │
│ ┌──────────────┐   ┌──────────────────────────────────────┐  │
│ │ app/layout   │──▶│ Providers/ErrorBoundary/Toaster       │  │
│ └──────────────┘   └──────────────────────────────────────┘  │
│        │                                                     │
│        ▼                                                     │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ app/page                                                │  │
│ │ fetch /api/workspace/load -> workspaceStore -> graphStore│  │
│ └──────────────┬──────────────────────────────────────────┘  │
│                ▼                                             │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ WorkspaceLayout                                         │  │
│ │ LeftSidebar ─ GraphPageContent ─ RightSidebar            │  │
│ └──────────────┬──────────────────────────────────────────┘  │
│                ▼                                             │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ Zustand Stores                                          │  │
│ │ workspaceStore + graphStore + persistenceMiddleware      │  │
│ └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### C4 Level 3 - Graph 编辑核心

```text
┌───────────────────────────────────────────────────────────────┐
│ GraphPageContent                                               │
│ ┌──────────────┐   ┌─────────────────┐   ┌──────────────────┐ │
│ │ graphStore   │──▶│ ReactFlow Adapter│──▶│ ReactFlow nodes   │ │
│ │ Node/Group   │   │ LOD + culling    │   │ custom/group node │ │
│ │ Edge         │   │ edge filtering   │   │ custom edges      │ │
│ └──────┬───────┘   └─────────────────┘   └──────────────────┘ │
│        │                                                       │
│        ├── Ontology document use-case -> legacy display bridge │
│        ├── Node hooks: add/drop/drag/resize/update             │
│        ├── Edge hooks: connect/filter/edit                     │
│        ├── Layout services: ELK + EdgeOptimizer                │
│        └── Workspace sync: save/load current canvas JSON       │
└───────────────────────────────────────────────────────────────┘
```

## 4. 模块与文件详解

### `frontend/app/layout.tsx`

职责：Next.js 根布局，加载全局 CSS，并为所有页面包裹错误边界、ReactFlow Provider 和 toast 容器。它决定 ReactFlow 上下文是全应用级而不是画布级。

关键导出：
- `metadata`：页面标题和描述。
- `RootLayout({ children })`：根布局组件。

对外依赖：`@/components/Providers`、`@/components/ui/sonner`、`@/components/ErrorBoundary`。

注意事项：`html lang="en"` 与 UI 中文文案不一致；Provider 边界过大，未来多画布或多编辑器实例可能需要局部化。

### `frontend/app/page.tsx`

职责：客户端首页入口，通过 workspace repository 加载工作区文件，初始化 user/workspace store，再将当前 canvas 的本体文档/显示缓存加载进 graph store。它还保留了 legacy layout 分支。

关键导出：
- `Home()`：默认页面组件。

内部组件：
- `LegacyLayout()`：旧版单画布布局回退。

对外依赖：`@/components/workspace/WorkspaceLayout`、`@/stores/workspace`、`@/types/workspace/models`、`@/utils/workspace/canvasSync`、`@/data-layer/workspace`、`@/components/graph/core`。

注意事项：Phase 3D 后页面不再直接 fetch `/api/workspace/load`，而是调用 `loadWorkspaceStorage()`；页面仍直接初始化 store，后续应下沉到 workspace feature block/use-case。`NEXT_PUBLIC_USE_NEW_LAYOUT` 仍影响布局选择，graph 持久化开关语义耦合问题留到后续 store 退场。

### `frontend/components/Providers.tsx`

职责：为子树提供 ReactFlow 上下文。

关键导出：
- `Providers({ children })`：默认导出的 Provider 组件。

对外依赖：无内部依赖。

注意事项：当前只有 ReactFlowProvider，没有主题、服务端状态或依赖注入边界；Provider 全局化会让未来“多个独立图编辑器实例”不够干净。

### `frontend/components/workspace/WorkspaceLayout.tsx`

职责：组装三栏工作区 UI：左侧画布树、中间图编辑器、右侧属性/工具栏。

关键导出：
- `WorkspaceLayout`：工作区布局组件。

对外依赖：`./sidebar/LeftSidebar`、`./sidebar/RightSidebar`、`@/components/graph/core`。

注意事项：标题、颜色、尺寸类名写在组件里，缺少独立 layout token/config；布局组件直接绑定具体 graph feature，不利于替换画布实现。

### `frontend/components/graph/core/index.ts`

职责：graph core 的 barrel 文件，导出主画布组件和 hooks。

关键导出：
- `GraphPageContent`：命名导出和默认导出。
- `* from './hooks'`：透出 core hooks。

对外依赖：`./GraphPageContent`、`./hooks`。

注意事项：直接导出所有 hooks 容易扩大公共 API；未来建议显式导出受支持的 hook。

### `frontend/types/graph/models.ts`

职责：定义当前图编辑器核心数据模型和 Zod schema，包括 Node、Group、Edge。

关键导出：
- `BlockEnum`：`node` / `group` 两种块类型。
- `CommonNodeType<T>`：ReactFlow-like 通用节点字段。
- `Node`：通用笔记节点模型。
- `Group`：嵌套分组模型。
- `Edge`：图边模型。
- `NodeSchema`、`GroupSchema`、`EdgeSchema`：Zod 校验 schema。

对外依赖：无内部依赖。

注意事项：模型混合了领域数据、ReactFlow 视图状态、CSS style 和编辑状态；Phase 2C 已把开放 `any` 收敛为 `unknown`/`Record<string, unknown>`，并删除旧 Node/Group 转换缓存字段；Phase B4 临时保留 `collapsedSections` 用于旧 display cache 承载节点分区折叠投影，真实持久化来源仍是 `OntologyNodeViewState.collapsedSections`。`[key: string]: unknown` 仍允许遗留运行态字段进入图模型，后续应随旧 graph display object 退场继续收紧。

### `frontend/types/workspace/models.ts`

职责：定义用户、画布、画布树、工作区模型和默认值。Phase 3D 后 Canvas 同时包含本体持久化真相源 `ontologyDocument` 和旧 ReactFlow 显示缓存 `graphData`。

关键导出：
- `User`、`Canvas`、`CanvasTreeNode`、`Workspace`：工作区相关 TypeScript 类型。
- `UserSchema`、`CanvasSchema`、`CanvasTreeNodeSchema`、`WorkspaceSchema`：Zod schema。
- `DEFAULT_USER`、`DEFAULT_CANVAS`：默认工作区数据。

对外依赖：`@/types/graph/models`、`./ontologyCanvas`。

注意事项：`Canvas.ontologyDocument` 是新持久化真相源；`Canvas.graphData` 仍直接嵌入完整旧展示对象，只用于当前 ReactFlow 显示桥和旧数据迁移。schema 对 Node/Group/Edge 使用 passthrough 简化校验，契约较松；彻底删除 `graphData` 前，需要 layout/history/edge optimizer 不再消费旧 `Node|Group|Edge`。

### `frontend/types/workspace/ontologyCanvas.ts`

职责：定义本体画布 JSON 持久化契约，包含 semantic graph、可保存 view state、revision 和 savedAt。它是 workspace 文件中 `Canvas.ontologyDocument` 的 schema 来源，Phase B4 起 `nodeViews` 可保存节点内部分区折叠状态。

关键导出：
- `PERSISTED_ONTOLOGY_CANVAS_VERSION`：当前本体画布持久化版本。
- `PersistedOntologyCanvasSchema`：Zod schema，验证 graph、node/domain/edge views、viewport、lod 和 edgeVisibility。
- `PersistedOntologyCanvas`：由 schema 推导的持久化快照类型。
- `createEmptyPersistedOntologyCanvas(id, name, savedAt?)`：创建空本体图、Root subgraph 和默认 view state。

对外依赖：`zod`。

注意事项：该文件故意不 import feature/document runtime，避免 workspace 类型层反向依赖 UI 或 Zustand。它只描述可保存 JSON，不保存 selection、hover、draft、context menu、dragging 等瞬时状态；`collapsedSections` 属于持久化视图状态，不属于节点语义字段。

### `frontend/stores/graph/index.ts`

职责：创建 graph Zustand store，聚合 nodes、edges、canvas view、history 四类 slice，并按环境变量决定是否挂载持久化中间件。

关键导出：
- `GraphStore`：合并后的 store 类型。
- `useGraphStore`：全局 graph store hook。

对外依赖：`./nodes`、`./edgesSlice`、`./canvasViewSlice`、`./historySlice`、`./persistenceMiddleware`。

注意事项：多个状态域被合并成一个 store；自动持久化条件绑定到 `NEXT_PUBLIC_USE_NEW_LAYOUT`，不是独立 persistence flag；组件若直接 `useGraphStore()` 读取大对象，容易造成无关 re-render。

### `frontend/components/graph/core/GraphPageContent.tsx`

职责：ReactFlow 主容器，连接 `ontologyDocumentStore`、旧 graph 显示桥、节点/边组件、交互 hooks、键盘快捷键、缩放状态、拖拽/删除/resize 事件和边优化。Phase 3B 后，ReactFlow nodes/edges 优先从 `OntologyDocumentState` 投影，不再每次从旧 graph store 快照重建本体文档。Phase 3E-A 后，节点/Domain 拖拽停止与尺寸提交优先调用本体 interaction patch，再把本体 document 投影成旧 display cache。2026-05-07 后，节点 resize 的自定义展开尺寸写入本体 node view，边锚点优化写入本体 `edgeViews`，不再只写旧 display cache。

关键导出：
- `GraphPageContent({ className })`：主画布组件。
- `default memo(GraphPageContent)`：memo 后默认导出。

对外依赖：`@/stores/graph`、`@/stores/workspace`、`../nodes`、`../edges/*`、`./hooks/*`、`@/features/ontology-canvas`、`@/services/layout/algorithms/EdgeOptimizer`、`@/config/graph.config`。

注意事项：Phase 2C 已将主组件的 graph store 读取拆为 selector，避免 `useGraphStore()` 整 store 订阅；nodes/edges projection 已迁到 `features/ontology-canvas/adapters/react-flow`。Phase 3E-A 后，`onNodeDragStop` 不再调用旧 `handleGroupMove/updateNodePosition/updateGroupBoundary` 作为最终位置真相源，而是调用 `commitDomainDrag/commitNodeDrag`，由 `ontologyDocumentStore.applyInteractionPatch()` 一次性提交绝对坐标和 Domain 边界 patch。2026-05-08 后，远景普通节点的 ReactFlow 显示 position 会因 LOD 外框缩小而居中偏移，`onNodeDragStop` 在提交前会通过 `resolveReactFlowNodePersistedPosition()` 反算真实坐标，避免缩放状态下拖拽后本体 view 位置漂移。旧 graph store 仍作为 display cache、旧编辑器兼容和 Phase 5 前的部分算法输入；每次 interaction patch 成功后由本体 document 投影回旧 nodes/edges。2026-05-07 起，`optimizeEdgesAfterViewChange()` 仍临时复用旧 `EdgeOptimizer` 的计算，但输出改成 `OntologyInteractionPatch.edgeViews`；Domain 移动会把后代 node/domain view id 一并作为受影响集合，resize 结束也会触发相关边锚点重算。Phase A 第一批已新增 `isResizingRef`，ReactFlow resize 过程中跳过本体投影同步，避免旧尺寸投影覆盖本地 resize 视觉态；resize 结束后才提交本体 view 尺寸、级联边界并触发相关边锚点优化。2026-05-08 第二批新增 `createResizeCommitGate()`，只有某节点先收到 `dimensions.resizing === true`，后续 `dimensions.resizing === false` 才会写本体尺寸；LOD style 变化触发的自动 dimensions 测量会被忽略，避免缩小后放大无法恢复。Phase 3A 已在容器内维护 `projectionBounds` 和 zoom LOD，ReactFlow `onMove` 经 `requestAnimationFrame` 节流后更新视口投影；节点数超过 80 且已获取视口时，adapter 只投影视口扩展范围内的节点，边只保留两端均可见的关系。新 UI 交互稳定第一批让折叠容器的内部后代不再进入投影，连到隐藏后代的边也被过滤。后续仍需加入 projection cache、Domain/边 LOD、摘要边聚合、正交边和算法 DTO。

### `frontend/components/graph/nodes/NoteNode.tsx`

职责：legacy ReactFlow custom node wrapper。Phase 3E-B 后它不再渲染旧 Markdown Note 卡片，而是接入 `features/ontology-canvas/ui/ClassNodeView` 展示本体节点 ViewModel、字段分区、统计徽标、描述和 LOD；Phase B4 后继续负责把节点内字段行内编辑、分区新增、分区折叠、旧 display cache、节点展开 hook 和“新增字段”语义命令接起来。

关键导出：
- `default memo(NoteNode)`：ReactFlow custom node 组件。

内部函数：
- `stringifyFieldValue(value)`：把 legacy attributes 字段值转成可展示字符串。
- `createFieldRowsFromAttributes(attributes)`：把 legacy projection attributes 转成 fallback `NodeFieldViewItem[]`，仅在 adapter 未提供 `ontologyViewModel` 时兜底。
- `handleAddField(category?)`：从当前本体 document 读取节点，按目标分类追加默认字段，调用 `updateOntologyNodeInDocument()`，成功后投影旧 display cache。
- `handleFieldChange(fieldId, patch)`：把节点内字段名/值/dataType/category 行内编辑提交为 `updateOntologyField()` + `updateOntologyNodeInDocument()`，成功后投影旧 display cache。
- `handleFieldDelete(fieldId)`：把节点内字段删除提交为 `deleteOntologyField()` + `updateOntologyNodeInDocument()`，成功后投影旧 display cache。
- `handleFieldMove(fieldId, direction, orderedFieldIds)`：把节点内字段排序提交为 `moveOntologyField()` + `updateOntologyNodeInDocument()`，成功后投影旧 display cache。
- `handleToggleSection(sectionId)`：切换 `view.nodeViews[nodeId].collapsedSections`，并同步旧 display cache 以便保存/加载期间维持折叠投影。

对外依赖：`react`、`reactflow` 类型、`@/stores/graph`、`@/stores/workspace`、`../core/hooks`、`@/types/graph/models`、`@/features/ontology-canvas`、`@/features/ontology-canvas/config`、`@/features/ontology-canvas/ui`。

注意事项：这是过渡 wrapper，不是最终 feature block。2026-05-07 已移除手动 resize 后由 `NoteNode` 渲染 effect 写旧 `updateNode(customExpandedSize)` 的路径；自定义展开尺寸改由 `GraphPageContent.onNodesChange(dimensions)` 提交到本体 node view。Phase B1 后，节点主显示数据优先来自 adapter 投影的 `data.ontologyViewModel`，字段新增、按分区新增、行内编辑、分类切换、删除和排序写 `OntologyDocumentState.graph.nodes[nodeId].fields`，分区折叠写 `OntologyDocumentState.view.nodeViews[nodeId].collapsedSections`。旧 graph store 只接收投影结果。

### `frontend/components/graph/nodes/GroupNode.tsx`

职责：legacy ReactFlow group node wrapper。Phase B2 后它不再渲染旧蓝色 group 标题栏、不再做标题双击编辑；它从 graph display cache 读取当前 group fallback 状态，把 adapter 投影的 `ontologyDomainViewModel` 透传给 `DomainNodeView`，并把容器折叠切换写回本体 domain view 后同步旧 display cache。

关键导出：
- `default memo(GroupNode)`：ReactFlow group node 组件。

对外依赖：`react`、`reactflow` 类型、`@/stores/graph`、`@/stores/workspace`、`@/types/graph/models`、`@/features/ontology-canvas`、`@/features/ontology-canvas/config`、`@/features/ontology-canvas/ui`、`./BaseNode`。

注意事项：这是过渡 wrapper，不是最终 feature block。标题编辑、显式归入/移出后续应进入 Inspector / command / feature block；折叠切换已经不直接 `updateNode()`，而是通过 `useOntologyDocumentStore.updateDomainView()` 写 `OntologyDocumentState.view.domainViews[domainId].collapsed`，然后投影旧 graph display cache。

### `frontend/components/graph/nodes/BaseNode.tsx`

职责：ReactFlow 节点外壳，只承载连接 handle、resize control 和外层定位。Phase B2 新增透明 surface，并删除旧 fallback 编辑 UI，让 `ClassNodeView` / `DomainNodeView` 自己承担产品视觉。

关键导出：
- `default memo(BaseNode)`：节点外壳组件。
- `BaseNodeProps`：外壳 props，包含 `surface?: 'legacy' | 'transparent'`。

对外依赖：`react`、`reactflow`、`@/stores/graph`、`@/types/graph/models`、`@/utils/validation`。

注意事项：BaseNode 仍保留 `surface="legacy"` 的旧外壳 class 作为过渡兼容，但主产品路径 `NoteNode` 和 `GroupNode` 已传 `surface="transparent"`；标题/内容/属性编辑不再放在 BaseNode。

### `frontend/features/ontology-canvas/index.ts`

职责：Ontology Canvas feature 的主要公开出口。当前导出 model 层、config 层、state 层、legacy graph adapter 和 ReactFlow adapter，供旧 graph UI 逐步接入目标 feature 边界。

关键导出：
- `* from './model'`。
- `* from './config'`。
- `* from './state'`。
- `* from './adapters/legacy-graph'`。
- `* from './adapters/react-flow'`。

对外依赖：`./model`、`./config`、`./state`、`./adapters/legacy-graph`、`./adapters/react-flow`。

注意事项：后续 feature 内部文件不应被跨 feature 深 import；旧组件应优先通过该出口接入可复用 model/use-case/adapter。UI TSX 不从 feature 根出口导出，避免 Node 轻量脚本加载 `features/ontology-canvas/index.ts` 时解析 JSX；UI 组件通过 `features/ontology-canvas/ui` 子出口接入。Legacy graph adapter 是 Phase 3B 的临时隔离层，用于让新增入口先写 `OntologyDocumentState`，再投影给旧画布显示；它不是新的语义真相源。

### `frontend/features/ontology-canvas/config/index.ts`

职责：Ontology Canvas config 层公开出口。

关键导出：
- `* from './domainViewTokens'`。
- `* from './nodeViewTokens'`。

对外依赖：`./domainViewTokens`、`./nodeViewTokens`。

注意事项：config 层允许被 UI 和 legacy wrapper 使用，但不应被布局算法直接读取；算法尺寸后续应通过 Layout DTO adapter 明确传入。

### `frontend/features/ontology-canvas/config/domainViewTokens.ts`

职责：集中维护本体 Domain / 容器节点 UI 的尺寸、间距、统计摘要、折叠表达、状态 rail、内部空间入口和语义色 token。

关键导出：
- `ontologyDomainViewTokens`：Domain / 容器节点最小尺寸、展开/折叠尺寸、summary 数量、metric tone、状态 rail、内部空间入口和 CSS 变量。
- `OntologyDomainCssVars`、`OntologyDomainMetricTone`：token 类型。

对外依赖：`../model/view` 类型、`react` 类型。

注意事项：config 层只描述视觉和密度，不直接服务布局算法；后续布局算法需要尺寸时应通过 Layout DTO adapter 传入。

### `frontend/features/ontology-canvas/config/nodeViewTokens.ts`

职责：集中维护本体节点 UI 的尺寸、间距、字号、字段/分区数量阈值、分区摘要、状态 rail、内部空间入口、字段行内编辑控件、字段分类/排序/删除控件、LOD 密度和语义色 token，避免节点组件内继续硬编码基础数值。

关键导出：
- `ontologyNodeViewTokens`：节点最小尺寸、展开/折叠尺寸、字段/分区/统计显示限制、分区摘要限制、字段 type/category/actions/input 尺寸、`lodDisplayDimensions`、metric tone、状态 rail 和 CSS 变量。
- `getOntologyNodeTypeTone(type)`：按本体节点类型返回语义色调。
- `OntologyNodeCssVars`、`OntologyNodeTypeTone`、`OntologyNodeMetricTone`：token 类型。

对外依赖：`@/domain/ontology` 类型、`../model/view` 类型、`react` 类型。

注意事项：当前第一批 token 先服务 ClassNodeView 和 legacy NoteNode wrapper。`lodDisplayDimensions` 只控制 ReactFlow adapter 的普通节点远景显示尺寸，不覆盖本体 view 保存的真实 width/height；Domain / 容器外框缩小要等 Phase C 容器聚合或隐藏内部子节点时一起做。后续 LOD 阈值、canvas interaction config 应继续拆到同一 feature config 层。

### `frontend/features/ontology-canvas/ui/index.ts`

职责：Ontology Canvas UI 子出口，集中暴露纯展示组件。该出口允许 legacy wrapper 显式接入 UI，但不从 feature 根出口再导出 TSX。

关键导出：
- `ClassNodeView`。
- `DomainNodeView`。
- `NodeAttributeEditor`。
- `NodeFieldList`。
- `NodeMetricList`。
- `NodeSection`。

对外依赖：`./ClassNodeView`、`./DomainNodeView`、`./NodeAttributeEditor`、`./NodeFieldList`、`./NodeMetricList`、`./NodeSection`。

注意事项：保持 UI 与 model/store 分离；Node 轻量运行时测试应继续从 feature 根出口或 model 出口加载纯 TS，不加载该 TSX 出口。

### `frontend/features/ontology-canvas/ui/ClassNodeView.tsx`

职责：纯本体类图节点展示组件。它消费 `OntologyNodeViewModel`，把旧 Note 卡片替换为可表达本体类型、字段/方法/规则/接口/关系分区、统计徽标、子画布提示、描述、校验状态、LOD 降级、hover/selected/readonly/disabled 状态、节点上新增属性入口、分区新增入口、字段行内编辑/分类/删除/排序入口、分区折叠摘要和内部空间入口的节点 UI。

关键导出：
- `ClassNodeView(props)`：本体节点展示组件。
- `ClassNodeViewProps`：组件 props 类型。

对外依赖：`lucide-react`、`@/domain/ontology` 类型、`../config`、`../model/view` 类型、`./NodeFieldList`、`./NodeMetricList`、`./NodeSection`。

注意事项：组件不 import store、ReactFlow、data-layer 或 interaction model；新增字段、按分区新增字段、字段更新、字段删除、字段排序、分区折叠、节点展开和进入内部空间只通过 `onAddField/onFieldChange/onFieldDelete/onFieldMove/onToggleSection/onToggleExpand/onEnterSubcanvas` 回调交给 wrapper/block 层处理。readonly/disabled 状态会关闭快速编辑入口。LOD 为 `dot` 时只渲染类型标记，`outline` 渲染标题和少量徽标，`compact` 只渲染数量摘要，`full` 才渲染可编辑字段行、可折叠分区、折叠摘要、内部空间入口和分区新增按钮。

### `frontend/features/ontology-canvas/ui/DomainNodeView.tsx`

职责：纯本体 Domain / 容器节点展示组件。它消费 `OntologyDomainViewModel`，展示容器标题、类型、子节点/子容器/关系数量、折叠摘要、内部空间入口、hover/selected/readonly/disabled 状态和 LOD 降级视图。

关键导出：
- `DomainNodeView(props)`：Domain / 容器节点展示组件。
- `DomainNodeViewProps`：组件 props 类型。

对外依赖：`lucide-react`、`react` 类型、`../config`、`../model/view` 类型。

注意事项：组件不 import store、ReactFlow、data-layer 或 interaction model；折叠状态通过 props 表达，切换只调用 `onToggleCollapsed`，真实写入由 wrapper/block 层处理。内部空间入口只调用 `onEnterInternalSpace`，真正子画布导航仍属于 Phase E。LOD 为 `dot` 时只渲染容器图标，`outline` 渲染标题和数量，`compact` 渲染 metric 摘要，`full` 才渲染 preview items、折叠摘要和内部空间入口。

### `frontend/features/ontology-canvas/ui/NodeFieldList.tsx`

职责：纯字段列表 UI，展示字段名、值、数据类型、分类徽标和语义色；完整 LOD 下可通过输入框行内编辑字段名、值和 dataType，并通过 select / icon buttons 切换字段分类、删除字段和在当前可见分区内上移/下移。

关键导出：
- `NodeFieldList({ fields, editable, onFieldChange, onFieldDelete, onFieldMove })`：字段列表组件。
- `NodeFieldViewItem`：字段展示项类型。
- `NodeFieldChangePatch`：字段行内编辑 patch 类型。
- `NodeFieldEditableCategory`：节点内可编辑字段分类类型。
- `NodeFieldMoveDirection`：字段排序方向类型。

对外依赖：`react`、`../config`、`../model/view` 类型。

注意事项：空字段列表返回 null，不在 UI 内部写 store 或生成默认字段；字段新增、保存、删除和排序由 `nodeFields.ts`、`updateOntologyNodeInDocument()` 和 wrapper/block 层负责。行内编辑使用 uncontrolled input + ref，失焦或 Enter 才提交，避免每次按键写全局 document；relationship 行只展示不编辑。分类切换会先提交当前输入草稿，再提交 category patch。

### `frontend/features/ontology-canvas/ui/NodeMetricList.tsx`

职责：纯节点统计 UI，展示 Fields、Methods、Child Nodes、Relations、Rules、Interfaces 等数量徽标，支撑参考图中的紧凑节点和节点底部统计条。

关键导出：
- `NodeMetricList({ metrics, limit, tokens, compact })`：统计徽标列表组件。

对外依赖：`react` 类型、`../config`、`../model/view` 类型。

注意事项：只消费 `OntologyNodeViewMetric[]` 和 token，不计算本体语义；紧凑模式显示 label/value，非紧凑模式只显示图标和数量，用于减少节点 DOM。

### `frontend/features/ontology-canvas/ui/NodeSection.tsx`

职责：纯节点分区 UI，统一分区标题、右侧 meta、内容布局、可选折叠按钮、可选动作按钮和折叠摘要区域。

关键导出：
- `NodeSection({ title, meta, children, collapsible, collapsed, collapsedSummary, onToggleCollapsed, onAction })`。

对外依赖：`lucide-react`、`react` 类型、`../config`。

注意事项：只消费 CSS token 变量和回调，不拥有字段折叠、新增分类或语义规则；折叠状态由 `OntologyNodeViewState.collapsedSections` 管理，分区新增的目标 category 由 `ClassNodeView` 映射后通过回调传出。

### `frontend/features/ontology-canvas/ui/NodeAttributeEditor.tsx`

职责：Ontology Canvas 的结构化属性/字段编辑 UI。`mode="node"` 时编辑本体节点类型，以及 Fields / Methods / Rules / Constraints / Interfaces 分区字段；`mode="domain"` 时退回普通 metadata 键值编辑。

关键导出：
- `NodeAttributeEditor(props)`：节点或 Domain 属性编辑组件。
- `NodeAttributeEditorProps`、`NodeAttributeEditorMode`：组件 props 和模式类型。

对外依赖：`lucide-react`、shadcn `Button/Input/Select`、`@/domain/ontology` 类型、`../model/inspector` 的属性 draft helper、`../config` 的 node tokens。

注意事项：组件不 import store、ReactFlow 或 document store；它只把 UI 输入转换为 draft attributes。节点模式会把字段保存为 `{ value, dataType, category }` 结构，供 `buildOntologyFieldsFromAttributes()` 转成本体 `fields[]`。

### `frontend/features/ontology-canvas/blocks/NodeInspectorBlock.tsx`

职责：右侧 Inspector 的 feature block，负责从旧 graph store 读取当前选中节点/边界对象，从 ontology document 构造预览 ViewModel，并把保存动作和普通节点显式归入 / 移出容器动作提交到 ontology document 后再投影旧 display cache。

关键导出：
- `NodeInspectorBlock({ nodeId })`：选中节点/Domain 的右侧检查器 block。
- `NodeInspectorBlockProps`：block props 类型。

对外依赖：`@/stores/graph`、`@/stores/workspace`、`../state`、`../model/document`、`../model/interactions`、`../model/view`、`../model/inspector`、`../adapters/react-flow`、`../ui`。

注意事项：这是 block 层，允许接 store 和 command；纯 UI 继续留在 `features/ontology-canvas/ui`。2026-05-08 后，Inspector 预览使用草稿生成临时 ViewModel，因此编辑标题、类型、字段分区、字段值时侧栏预览会立即同步，不再等待保存后才变化。同日新 UI 交互稳定阶段新增普通节点 Container 快捷按钮：点击容器名直接调用本体 node domain command，再用 `createNodeDomainPlacementPatch()` 把节点放入目标容器内部空位并同步旧 display cache；普通拖拽仍不隐式改变归属。

### `frontend/features/ontology-canvas/adapters/legacy-graph/index.ts`

职责：legacy graph adapter 的公开出口，集中暴露本体文档与旧画布展示运行态之间的临时桥接函数。

关键导出：
- `createOntologyDocumentFromLegacyGraph()`：从旧 graph nodes/edges 构造 `OntologyDocumentState`。
- `projectOntologyNodeToLegacyNode()`：把 `OntologyNode + NodeViewState` 投影为当前 ReactFlow 旧 `Node` 展示对象。
- `projectOntologyDomainToLegacyGroup()`：把 `OntologyDomain + DomainViewState` 投影为当前旧 `Group` 展示对象。
- `projectOntologyEdgeToLegacyEdge()`：把 `OntologyEdge + EdgeViewState` 投影为当前旧 `Edge` 展示对象。
- `isLegacyOntologyClassDisplay()`、`isLegacyOntologyDomainDisplay()`：旧展示对象类型守卫。
- `LegacyGraphDocumentInput`、`LegacyOntologyDisplayNode`、`LegacyProjectionOptions`：桥接输入和投影 options 类型。

对外依赖：`./documentBridge`。

注意事项：这是明确命名的临时 adapter；允许理解旧 `Node/Group`，但不允许读写 store。后续主 ReactFlow adapter 输入切到 `OntologyGraph + OntologyViewState` 后，应整体删除或降级为迁移测试夹具。

### `frontend/features/ontology-canvas/adapters/legacy-graph/documentBridge.ts`

职责：把旧 graph runtime 快照转成 `OntologyDocumentState`，并把本体 document use-case 的结果临时投影成旧 `Node/Group`，供当前 ReactFlow 画布在运行态切换完成前显示。

关键导出：
- `createOntologyDocumentFromLegacyGraph(input)`：调用 `mapLegacyGraphToOntologyGraph()` 构造 semantic graph，并从旧 position/width/height/sourceHandle/targetHandle 抽取 view state。
- `projectOntologyNodeToLegacyNode(document, nodeId, options?)`：读取 `OntologyNode` 和 `view.nodeViews[nodeId]`，生成旧展示 `Node`，并用 `attributes.ontologyType/ontologyNodeId` 标记语义来源。
- `projectOntologyDomainToLegacyGroup(document, domainId, options?)`：读取 `OntologyDomain` 和 `view.domainViews[domainId]`，生成旧展示 `Group` 和 boundary。
- `projectOntologyEdgeToLegacyEdge(document, edgeId, options?)`：读取 `OntologyEdge` 和 `view.edgeViews[edgeId]`，生成旧展示 `Edge`，并同步 `relation/relationship/ontologyEdgeId`。
- `isLegacyOntologyClassDisplay(node)`、`isLegacyOntologyDomainDisplay(node)`：基于旧 `BlockEnum` 的类型守卫。

对外依赖：`../../../../domain/ontology`、`../../../../types/graph/models`、`../../model/document/ontologyDocument`。

注意事项：该文件是当前唯一允许新增 UI 入口把本体 document 结果转回旧 `BlockEnum.NODE/GROUP` 的桥。Phase B1 后，`projectOntologyNodeToLegacyNode()` 会把 `buildOntologyNodeViewModel(document, node.id)` 放入 `data.ontologyViewModel`，供 NoteNode wrapper 透传给纯 UI；Phase B4 后也会把 `view.collapsedSections` 投影到旧 Node 顶层，供旧 display cache 保存/加载时不丢失节点分区折叠状态。Phase B2 后，`projectOntologyDomainToLegacyGroup()` 会把 `buildOntologyDomainViewModel(document, domain.id)` 放入 `data.ontologyDomainViewModel`，供 GroupNode wrapper 透传给纯 UI。这些都是投影显示数据，不是新的持久化真相源。`includeMembership:false` 用于新增入口先 add display node，再让旧 `addNodeToGroup()` 维护 `groupId + nodeIds`，避免旧 store 因提前带 `groupId` 而跳过 parent `nodeIds` 更新。

### `frontend/features/ontology-canvas/adapters/react-flow/index.ts`

职责：ReactFlow adapter 的公开出口，只暴露节点/边 projection 需要的函数和类型，避免把内部 helper 全量泄漏到 feature 根出口。

关键导出：
- `createGraphNodeLookup()`：构建 node id 到旧 graph node 的 Map。
- `projectNodesToReactFlowNodes()`：旧 graph nodes 投影为 ReactFlow nodes。
- `projectEdgesToReactFlowEdges()`：旧 graph edges 投影为 ReactFlow edges。
- `resolveRenderableNodeIds()`：基于折叠容器状态解析当前可投影节点 id 集合。
- `resolveReactFlowLodMode()`：按 zoom 解析节点渲染层级。
- `resolveReactFlowNodeDisplaySize()`：按 LOD 解析普通节点显示尺寸。
- `resolveReactFlowNodePersistedPosition()`：把 LOD 显示坐标换算回真实持久化坐标。
- `sortNodesByNestingLevel()`、`convertToRelativePosition()`、`convertToAbsolutePosition()`：projection 支撑工具。
- `ReactFlowLodMode`、`ReactFlowViewportBounds`、`ReactFlowNodeProjectionOptions`、`ReactFlowEdgeProjectionOptions`：projection options 类型。

对外依赖：`./projection`。

注意事项：该出口不导出内部 `LegacyGraphNode`，避免和 layout model 的同名 legacy 类型冲突。

### `frontend/features/ontology-canvas/adapters/react-flow/projection.ts`

职责：把 `OntologyDocumentState` 或旧 graph runtime 的 `Node | Group | Edge` 投影为 ReactFlow 的 nodes/edges。Phase 3B 后，`GraphPageContent` 优先调用 document projection；旧 graph projection 函数保留用于测试和过渡桥。

关键导出：
- `safeNumber()`：projection 内部数值兜底。
- `createGraphNodeLookup(nodes)`：构建 `Map<string, Node|Group>`，供 edge projection 和拖拽路径复用。
- `convertToRelativePosition()` / `convertToAbsolutePosition()`：父子 group 坐标转换。
- `sortNodesByNestingLevel(nodes)`：按 group 嵌套深度排序，父节点先于子节点；对循环 groupId 做降级避免递归爆栈。
- `resolveReactFlowLodMode(zoom)`：把 zoom 映射为 `full/compact/outline/dot`。
- `resolveReactFlowNodeDisplaySize(node, lodMode)`：普通节点按 LOD 返回显示尺寸，Group/Domain 仍返回真实尺寸。
- `resolveReactFlowNodePersistedPosition(node, lodMode, displayPosition)`：把居中后的 LOD 显示坐标反算回真实节点坐标。
- `hasCollapsedAncestor(node, nodeById)`：判断节点是否位于已折叠 Group/Domain 后代链中。
- `resolveRenderableNodeIds(nodes, nodeById?)`：返回不被折叠祖先隐藏的节点 id 集合。
- `projectNodesToReactFlowNodes(nodes, options)`：按 selection、LOD 和 viewport culling 生成 ReactFlowNode 数组。
- `projectEdgesToReactFlowEdges(edges, nodes, options)`：按 edge visibility 和 visible node ids 过滤并生成 ReactFlowEdge 数组。
- `projectOntologyDocumentToReactFlowNodes(document, options)`：从本体文档投影 ReactFlow nodes。
- `projectOntologyDocumentToReactFlowEdges(document, options)`：从本体文档投影 ReactFlow edges。

对外依赖：`../../../../types/graph/models`、`../../../../domain/ontology/commands/edgeVisibility`、`../../model/document/ontologyDocument`、`../legacy-graph/documentBridge`、`reactflow` 类型。

注意事项：adapter 不 import store、组件、fetch 或 CSS，受 `check-architecture-boundaries.mjs` 保护；Phase 3A 已加入 LOD 标记和 viewport culling。2026-05-08 后，普通节点在 compact/outline/dot 下会使用 `lodDisplayDimensions` 缩小 ReactFlow style，并把显示位置居中到真实节点 bounds 上；真实 width/height 不写回本体 view。远景拖拽结束必须调用 `resolveReactFlowNodePersistedPosition()` 反算坐标。同日新 UI 交互稳定第一批让折叠 Group/Domain 的后代节点不进入 ReactFlow nodes，相关隐藏端点边不进入 ReactFlow edges；折叠不删除本体 document 中的节点、Domain 或关系。每次投影仍会创建新数组/对象，后续 adapter cache、container aggregation 和摘要边聚合应继续落在此目录。

### `frontend/features/ontology-canvas/model/index.ts`

职责：Ontology Canvas model 层公开出口。

关键导出：
- `* from './document'`。
- `* from './inspector'`。
- `* from './interactions'`。
- `* from './layout'`。
- `* from './view'`。

对外依赖：`./document`、`./inspector`、`./interactions`、`./layout`、`./view`。

注意事项：该目录被 architecture boundary 脚本保护，禁止依赖 React、UI component、store、fetch 和 CSS。

### `frontend/features/ontology-canvas/model/view/index.ts`

职责：Ontology Canvas view model 子域公开出口。

关键导出：
- `* from './domainViewModel'`。
- `* from './nodeViewModel'`。

对外依赖：`./domainViewModel`、`./nodeViewModel`。

注意事项：view model 属于纯 model 层，只做展示数据聚合，不 import UI/store/ReactFlow。

### `frontend/features/ontology-canvas/model/view/domainViewModel.ts`

职责：把 `OntologyDocumentState` 中的 Domain、子节点、子 Domain、关系和 view 折叠状态聚合成容器 UI 可消费的 `OntologyDomainViewModel`。

关键导出：
- `buildOntologyDomainViewModel(document, domainId)`：读取本体 Domain、Domain view、相关节点和相关边，生成容器展示模型。
- `OntologyDomainViewModel`、`OntologyDomainViewMetric`、`OntologyDomainViewPreviewItem`、`OntologyDomainViewCounts`：容器展示模型类型。
- `OntologyDomainViewTone`：容器语义色调类型。

对外依赖：`../document/ontologyDocument` 类型、`@/domain/ontology` 类型。

注意事项：该文件不改本体 schema；短期通过 `domain.nodeIds/domainIds`、node.domainId、edge.domainId 和 `view.collapsed` 派生容器摘要。后续 Phase E 的“任意节点即容器”需要把 Domain 过渡能力升级为节点拥有内部子画布的明确 schema。

### `frontend/features/ontology-canvas/model/view/nodeViewModel.ts`

职责：把 `OntologyDocumentState` 中的节点、字段、关系和子图引用聚合成节点 UI 可消费的 `OntologyNodeViewModel`。它是 UI 参考图落地的第一层 adapter：现有本体字段仍保留，但先按 Fields / Methods / Rules / Interfaces / Relationships / Subcanvas 进行展示切片。

关键导出：
- `buildOntologyNodeViewModel(document, nodeId)`：读取本体节点，按字段分类、incident edges 和 subgraph 信息生成展示模型。
- `OntologyNodeViewModel`、`OntologyNodeViewSection`、`OntologyNodeViewItem`、`OntologyNodeViewMetric`、`OntologyNodeViewCounts`：节点展示模型类型。
- `OntologyNodeViewSectionKind`、`OntologyNodeViewTone`：分区和语义色调类型。

对外依赖：`../document/ontologyDocument` 类型、`@/domain/ontology` 类型。

注意事项：该文件不改本体 schema，不把 methods/subcanvas 直接塞入 metadata；短期通过字段 category、incident edges 和 `subgraphId` 派生 UI 所需摘要。后续 Phase B4/E 需要把真实方法、子画布 viewport/history、语义锚点等升级为明确 schema。

### `frontend/features/ontology-canvas/model/inspector/index.ts`

职责：Inspector/属性面板 model 子域公开出口。

关键导出：
- `* from './editorDrafts'`。
- `* from './savePlans'`。

对外依赖：`./editorDrafts`、`./savePlans`。

注意事项：这是右侧属性面板迁入 feature pack 的第一步；当前还没有 blocks/ui 目录。

### `frontend/features/ontology-canvas/model/inspector/editorDrafts.ts`

职责：编辑器纯模型 helper，集中处理 Node/Edge 编辑草稿、JSON 解析、标签解析、属性键值转换、旧 graph store update payload 构造，以及本体字段/节点类型转换。

关键导出：
- `EdgeEditorDraft`、`NodeEditorDraft`、`AttributeItem`：编辑器草稿类型。
- `createEdgeEditorDraft(edge)`、`parseCustomPropertiesText(text)`、`buildEdgeUpdate(edge, draft, customProperties)`。
- `createNodeEditorDraft(node)`、`parseTagsText(tags)`、`buildNodeValidationCandidate(node, draft)`、`buildNodeUpdate(draft)`。
- `buildOntologyNodeType(attributes)`：从 attributes 中解析本体节点类型。
- `buildOntologyFieldsFromAttributes(nodeId, attributes)`：把结构化属性转换为 `OntologyField[]`，过滤 ontology bridge 元字段。
- `createAttributeItems(attributes)`、`buildAttributesFromItems(items)`、`serializeAttributes(attributes)`。

对外依赖：`../../../types/graph/models` 的类型导入、`../../../domain/ontology` 的类型导入。

注意事项：这是 Phase 2B 编辑入口收敛的小 model 层，已从旧 `components/graph/editors` 迁入目标 feature 目录；`buildNodeUpdate()` 有意不返回 `groupId`，分组关系必须走 `addNodeToGroup/removeNodeFromGroup`。

### `frontend/features/ontology-canvas/model/inspector/savePlans.ts`

职责：Inspector 保存用例的纯模型层。它把 Edge/Node draft 转成显式保存计划，让 TSX 只负责执行 plan，不再拥有 JSON 错误、节点校验、membership diff、旧 update payload 和 ontology command input 拼装逻辑。

关键导出：
- `createEdgeInspectorSavePlan(edge, draft)`：解析自定义属性并返回 `{ ok, edgeId, update }` 或错误。
- `createNodeInspectorSavePlan(nodeId, node, draft)`：校验节点内容并返回普通字段 update、membership plan 和 ontology node/domain update input。
- `createNodeMembershipPlan(nodeId, previousGroupId, nextGroupId)`：比较旧/新 groupId，返回 none/move/remove。
- `createNodeRemoveFromGroupPlan(nodeId)`：生成 remove membership plan。

对外依赖：`../../../../utils/validation`、`../../../../types/graph/models`、`../document` 类型、`./editorDrafts`。

注意事项：该文件仍复用旧 `validateNodeContent()`，这是允许的临时桥接；后续应把校验规则迁入 domain/ontology 或 feature model schema，避免 feature model 依赖旧 utils。

### `frontend/features/ontology-canvas/model/interactions/index.ts`

职责：Ontology Canvas 画布交互 model 公开出口，当前承接 Domain 嵌套交互事务、展开/折叠和删除计划。

关键导出：
- `* from './canvasDeletion'`。
- `* from './domainNesting'`。
- `* from './nodeFields'`。
- `* from './nodeExpansion'`。
- `* from './resizeCommitGate'`。

对外依赖：`./canvasDeletion`、`./domainNesting`、`./nodeFields`、`./nodeExpansion`、`./resizeCommitGate`。

注意事项：该目录只导出纯函数和类型，不接触 ReactFlow、Zustand 或 UI 组件。

### `frontend/features/ontology-canvas/model/interactions/resizeCommitGate.ts`

职责：提供 resize 提交闸门，区分用户真实 resize 与 ReactFlow 因 LOD style 改变产生的自动 `dimensions` 测量事件。

关键导出：
- `createResizeCommitGate()`：创建内存闸门，记录正在 resize 的节点 id，并只允许对应 resize end 提交。
- `ResizeCommitGate`：闸门接口类型。

对外依赖：无。

注意事项：这是纯 model helper，不 import React 或 ReactFlow。GraphPageContent 使用它保护 `onNodesChange(dimensions)`：没有先收到 `resizing: true` 的 dimensions end 一律视为自动测量，不写本体 view 尺寸。

### `frontend/features/ontology-canvas/model/interactions/domainNesting.ts`

职责：Phase 3E-A 的本体 view 嵌套交互事务模型。它把旧项目中“store 绝对坐标 + ReactFlow 相对投影 + Domain 后代 offset + 边界级联”的契约迁入本体文档层，输入 `OntologyDocumentState`，输出 `OntologyInteractionPatch`。

关键导出：
- `collectDomainDescendantViewIds(document, domainId)`：收集 Domain 后代 node/domain view id，并用 visited set 防循环。
- `projectReactFlowPositionToAbsolute(document, input)`：把 ReactFlow relative position 转成本体 view absolute position。
- `constrainNodePositionToDomain(document, input)`：把节点位置约束在父 Domain padding 内。
- `updateDomainBoundaryCascade(document, domainId, config?)`：基于 direct children 的 absolute bounds 级联扩展当前 Domain 及祖先 Domain。
- `createNodeDomainPlacementPatch(document, input)`：显式归入容器后，为普通节点选择目标 Domain 内部空位，并级联扩展目标 Domain。
- `commitNodeDrag(document, input)`：节点拖拽停止事务，输出约束后 node view position 和受影响 Domain 边界 patch。
- `commitDomainDrag(document, input)`：Domain 拖拽停止事务，平移 Domain 自己和所有后代 node/domain view，并更新父 Domain 边界。
- `commitNodeResize(document, input)`、`commitDomainResize(document, input)`：尺寸变化事务，输出 view size/expanded patch 并级联父 Domain。
- `applyOntologyInteractionPatch(document, patch)`：一次性把 interaction patch 合并进 document view，并只增加一次 revision。

对外依赖：`../document/ontologyDocument` 类型导入。

注意事项：该文件是纯 model，架构检查已覆盖其不能 import React、ReactFlow、Zustand、UI、fetch。默认 padding/min size 作为 interaction config 暂存在该模块，后续 Phase 3E-B/Phase 4 应迁入 feature config，并继续禁止算法层直接读取 UI token。

### `frontend/features/ontology-canvas/model/interactions/nodeFields.ts`

职责：Phase B4 的节点字段交互纯模型。它负责为“节点上新增属性”生成唯一字段名和按分类默认的 `OntologyField`，并把节点内行内编辑、分类切换、删除和排序操作归一化为新的 `fields[]`，让 UI/legacy wrapper 不直接拼语义字段结构。

关键导出：
- `createUniqueOntologyFieldName(existingFields, prefix?)`：基于已有字段名生成不冲突的新字段名。
- `getDefaultOntologyFieldInputForCategory(category?)`：把 attribute / behavior / rule / constraint / interface 映射为默认 namePrefix、dataType 和 category。
- `createDefaultOntologyField(input)`：按输入生成默认字段，缺省为 attribute/string。
- `appendDefaultOntologyField(node, input?)`：向 OntologyNode fields 追加默认字段并返回新数组。
- `updateOntologyField(fields, fieldId, patch)`：按 field id 更新字段名、值、dataType 或分类；空字段名会保留旧数组，空值/dataType 会归一化为 undefined。
- `deleteOntologyField(fields, fieldId)`：按 field id 删除字段，未命中时返回原数组引用。
- `moveOntologyField(fields, fieldId, direction, orderedFieldIds?)`：按全局或当前可见分区顺序交换字段位置。
- `CreateDefaultOntologyFieldInput`：默认字段输入类型。
- `DefaultOntologyFieldCategoryInput`：分类默认字段输入类型。
- `UpdateOntologyFieldPatch`：字段更新 patch 类型。
- `MoveOntologyFieldDirection`：字段排序方向类型。

对外依赖：`@/domain/ontology` 类型导入。

注意事项：该文件是纯 model，不写 document/store；调用方必须继续通过 `updateOntologyNodeInDocument()` 写语义文档。`getDefaultOntologyFieldInputForCategory()` 只提供 UI 动作到语义字段默认值的稳定映射，不读取 token 或 ViewModel。`updateOntologyField()`、`deleteOntologyField()`、`moveOntologyField()` 未产生有效变化时返回原数组引用，调用方可据此跳过无效 command。

### `frontend/features/ontology-canvas/model/interactions/nodeExpansion.ts`

职责：把节点展开状态解析、展开/折叠尺寸计划、自定义展开尺寸持久化判定从 UI hook 中移出。

关键导出：
- `resolveNodeExpandedState(node, fallback)`：从节点顶层或 data 中解析展开状态。
- `createNodeExpansionPatch(node, nextExpanded, config)`：根据默认尺寸或自定义展开尺寸生成展开/折叠尺寸计划。
- `getCustomExpandedSizeToPersist(node, config)`：判断当前尺寸是否是用户手动调整后的展开尺寸。
- `NodeExpansionConfig`、`NodeExpansionSize`、`ExpandableNodeLike`、`NodeExpansionPatch`：交互模型类型。

对外依赖：无。

注意事项：尺寸配置由调用方传入，model 不硬依赖 UI token；Phase 2C 后 `useNodeExpansion` 不再保留本地 duplicate state。Phase 3E-A 后，`useNodeExpansion.toggleExpand()` 用该计划调用 `commitNodeResize()`，由本体 interaction patch 写入 `expanded/width/height` 并级联 Domain 边界，旧 graph store 只接收投影后的 display cache。

### `frontend/features/ontology-canvas/model/interactions/canvasDeletion.ts`

职责：为选中删除和清空画布生成删除计划，避免 UI 层重复遍历边并手动清理 incident edges。

关键导出：
- `createCanvasSelectionDeletionPlan(nodes, edges)`：返回选中节点 ID 和需要单独删除的选中边 ID。
- `createCanvasClearPlan(nodes, edges)`：返回清空画布时要删的节点 ID 和不被节点删除覆盖的悬空边 ID。
- `CanvasDeletionPlan`、`DeletableNodeRef`、`DeletableEdgeRef`：删除计划类型。

对外依赖：无。

注意事项：`deleteNode()` 已在 store/domain consistency 中清理 incident edges，因此 plan 会过滤掉将被节点删除覆盖的边，防止旧的重复删边逻辑回流。

### `frontend/features/ontology-canvas/model/layout/index.ts`

职责：Ontology Canvas 布局控制 model 公开出口。

关键导出：
- `* from './layoutControl'`。

对外依赖：`./layoutControl`。

注意事项：这是 Phase 2C 把 LayoutControl 中的策略 options、patch 构造和 group child 筛选移出 TSX 的入口。

### `frontend/features/ontology-canvas/model/layout/layoutControl.ts`

职责：为旧 LayoutControl 提供纯 model helper，集中处理 ELK 策略 options、群组选中判断、直接子节点筛选、layout result 到 graph store patch 的转换。

关键导出：
- `createCanvasLayoutOptions()`、`createGroupLayoutOptions(groupId)`：生成全画布/群组布局 options。
- `isGroupNode(node)`：判断旧 graph node 是否为 Group。
- `getDirectGroupChildren(nodes, groupId)`：筛选直接属于某 group 的节点/子 group。
- `createLayoutNodeUpdate(positionData, includeStyleSize)`：把布局位置/尺寸/边界转换为 `updateNode()` patch。
- `createLayoutEdgeUpdate(edgeData)`：把布局边 handle 结果转换为 `updateEdge()` patch。

对外依赖：`../../../../types/graph/models` 的类型导入。

注意事项：该 helper 仍服务旧 graph store 模型，不是最终 Layout DTO；它先把 UI 控制层里的 `any` 和重复 patch 拼装收住，后续 Phase 5 再迁到算法 DTO。

### `frontend/components/graph/controls/LayoutControl.tsx`

职责：布局控制按钮组件，触发全画布布局、选中群组内部布局和后续边连接点优化。

关键导出：
- `LayoutControl({ className })`：默认导出的布局控制组件。

对外依赖：`@/stores/graph`、`@/services/layout`、`@/features/ontology-canvas`、`../../ui/button`、Heroicons。

注意事项：Phase 2C 后，策略 options、layout node/edge patch、group child 筛选已迁到 feature model；组件仍直接调用 `LayoutManager`、`EdgeOptimizer` 和 graph store actions，后续应进入 feature blocks/adapter。

### `frontend/components/graph/editors/EdgeEditor.tsx`

职责：右侧边属性编辑器。外层从 graph store 选择当前 edge，内层表单维护本地 draft，点击保存后才调用 `updateEdge()`。

关键导出：
- `EdgeEditor({ edgeId })`：默认导出的边编辑器组件。

内部组件：
- `EdgeEditorForm({ edge, updateEdge })`：持有本地 draft 和提交错误，渲染关系标签、颜色、线型、权重、方向、自定义属性和保存/重置按钮。

对外依赖：`@/stores/graph`、`@/components/ui/button`、`@/types/graph/models`、`@/features/ontology-canvas`。

注意事项：Phase 2B 已删除旧 `useEffect([formData, edge, updateEdge])` 输入即写 store 逻辑；Phase 2B save plan 收敛后，保存 payload 由 `createEdgeInspectorSavePlan()` 生成；Phase 3D 后未 hydration fallback 统一走 `getActiveOntologyDocument()`，本文件不再直接创建 legacy document；无效 JSON 只停留在 draft，不写全局边、不污染 history/persistence。

### `frontend/components/graph/editors/NodeEditor.tsx`

职责：已删除。旧右侧节点/分组属性编辑器已经由 `features/ontology-canvas/blocks/NodeInspectorBlock.tsx` 接管。

关键导出：
- 无。文件已从源码删除。

内部组件：
- 无。旧 `NodeEditorForm` 已删除。

对外依赖：无。

注意事项：2026-05-08 UI-first 清理后，节点/Domain 编辑入口统一进入 `NodeInspectorBlock`。旧文件的分组保存、属性编辑和重置逻辑不再作为开发依据。

### `frontend/components/graph/editors/StructuredAttributeEditor.tsx`

职责：已删除。旧结构化属性键值编辑器已经由 `features/ontology-canvas/ui/NodeAttributeEditor.tsx` 接管。

关键导出：
- 无。文件已从源码删除。

对外依赖：无。

注意事项：新编辑器按本体字段分区编辑，不再把节点属性当普通 JSON 键值表处理。

### `frontend/components/graph/editors/ContentEditor.tsx`

职责：已删除。旧内容编辑器不再作为节点编辑入口。

关键导出：
- 无。文件已从源码删除。

对外依赖：无。

注意事项：节点标题、摘要、正文和结构化字段现在通过 `NodeInspectorBlock` 统一编辑。

### `frontend/components/graph/core/nodeSyncUtils.ts`

职责：已删除。旧文件曾将 store 中的 Node/Group 转为 ReactFlowNode，包括安全数值处理、父子相对坐标转换、嵌套层级排序、style/data 注入。

关键导出：
- 无。文件已从源码删除。

对外依赖：无。

注意事项：Phase 2C 后逻辑迁入 `frontend/features/ontology-canvas/adapters/react-flow/projection.ts`，避免旧 `components/graph/core` 继续承载业务 projection。

### `frontend/services/layout/LayoutManager.ts`

职责：布局算法统一入口，注册可用布局策略，按 options 选择策略并包装执行耗时、错误和取消标志。

关键导出：
- `ILayoutManager`：布局管理器接口。
- `LayoutManager`：默认布局管理器实现。

对外依赖：`../../types/graph/models`、`./types/layoutTypes`、`../../config/graph.config`、`./strategies/ELKLayoutStrategy`、`./strategies/ELKGroupLayoutStrategy`、`./utils/layoutDebug`。

注意事项：布局入口直接消费旧 `Node | Group | Edge`，尚无中立 Layout DTO；构造时注册策略实例但 ELK engine 已改为策略执行时懒加载，策略注册日志已改为 `NEXT_PUBLIC_LAYOUT_DEBUG=true` 才输出；`cancelCurrentOperation()` 只设置布尔标志，不能取消已经进入 ELK 的异步计算。

### `frontend/services/layout/strategies/ELKLayoutStrategy.ts`

职责：ELK 自动布局策略，懒加载 `elkjs/lib/elk.bundled.js`，将旧图模型转成 ELK graph，调用 ELK 布局并提取节点位置。

关键导出：
- `ELKLayoutStrategy`：实现 `ILayoutStrategy` 的 ELK 策略类。

对外依赖：`../../../types/graph/models`、`../types/layoutTypes`、`../utils/ELKGraphConverter`、`../utils/ELKRuntime`、`../utils/layoutDebug`。

注意事项：策略本身不直接写 store，符合“返回结果不直接改图”的方向；ELK engine 只在首次 `applyLayout()` 时创建，避免构建/SSR 阶段副作用；执行日志已收敛到 `logLayoutDebug()`，默认生产构建不输出；`validateConfig()` 目前恒返回 true，ELK 实例无 timeout/cancel 信号。

### `frontend/services/layout/algorithms/EdgeOptimizer.ts`

职责：根据源/目标节点中心点角度计算最佳 source/target handle，并支持全量、单条、受影响节点批量优化。

关键导出：
- `HandlePosition`：`top/right/bottom/left`。
- `OptimizedEdge`：在旧 `Edge` 基础上附加 handle 字段。
- `IEdgeOptimizer`：边优化接口。
- `EdgeOptimizer`：边连接点优化实现。

对外依赖：`../../../types/graph/models`、`../utils/GeometryUtils`、`../../../config/graph.config`。

注意事项：算法每次都从旧节点模型读取 `position/width/height`，仍然与 UI/ReactFlow 视图字段耦合；返回 `OptimizedEdge[]` 而不是 patch，后续应改为 `edgeHandles` patch。

### `frontend/services/layout/strategies/ELKGroupLayoutStrategy.ts`

职责：针对指定 group 执行内部子图布局，抽取 group 后代节点和内部边，构建 ELK 子图，执行布局后把相对坐标转换回画布绝对坐标。

关键导出：
- `ELKGroupLayoutStrategy`：实现 `ILayoutStrategy` 的 group 内部布局策略。

对外依赖：`../../../types/graph/models`、`../types/layoutTypes`、`../utils/ELKGraphConverter`、`../utils/ELKConfigBuilder`、`../utils/ELKRuntime`、`../utils/layoutDebug`、`../../../config/layout`。

注意事项：必须传入 `options.groupId`；`getDescendants()` 递归无 visited set；子图边过滤已改为 `Set` membership，避免旧 O(E*N) 扫描；坐标提取日志已收敛到 debug 开关。

### `frontend/services/layout/utils/ELKGraphConverter.ts`

职责：将旧项目 `Node | Group | Edge` 转为 ELK graph，并从 ELK layout 结果提取节点位置和尺寸。

关键导出：
- `ElkNode`：ELK 节点 DTO。
- `ElkEdge`：ELK 边 DTO。
- `ELKGraphConverter`：静态转换器。

对外依赖：`../../../types/graph/models`、`../types/layoutTypes`、`../../../config/layout`、`./ELKConfigBuilder`、`./layoutDebug`。

注意事项：转换器读取 `groupId`、`isExpanded`、`customExpandedSize`、`width/height` 和 UI padding，说明算法输入仍绑定旧视觉模型；Phase 2C 已删除未使用的旧 `nodeMap` 参数链路，并用类型化 `Node.customExpandedSize` 访问替代 unsafe cast；转换和提取日志已收敛到 debug 开关。

### `frontend/services/layout/utils/ELKConfigBuilder.ts`

职责：根据布局场景生成 ELK options，包括 layered、force、stress、tree、radial、compact、spacious、debug 等配置。

关键导出：
- `ELKConfigBuilder`：静态配置构造器。

对外依赖：`../../../config/elk-algorithm`、`../types/layoutTypes`。

注意事项：配置构造器本身较纯，Phase 2C 已收紧为 `ELKLayoutOptions = Record<string, string | number | boolean>`；`mergeConfig()` 仍允许用户配置覆盖任意 ELK key，后续需要白名单/schema。

### `frontend/services/layout/utils/ELKRuntime.ts`

职责：集中处理 `elkjs/lib/elk.bundled.js` 动态 import 的模块形状差异，并返回策略层可消费的 ELK engine。

关键导出：
- `ELKEngine`：最小运行时接口，当前只要求 `layout(graph)`，可选 `terminateWorker()`。
- `createELKEngine()`：动态 import elkjs，解析 constructor，创建 ELK engine。

对外依赖：`./ELKGraphConverter` 的 `ElkNode` 类型、动态导入 `elkjs/lib/elk.bundled.js`。

注意事项：该文件是策略层和第三方 elkjs 包之间的隔离点；目前只做模块形状校验，不做 worker timeout/cancel 管理。

### `frontend/services/layout/utils/layoutDebug.ts`

职责：布局服务调试日志开关，避免 LayoutManager/ELK 策略在构建或生产运行时直接输出普通日志。

关键导出：
- `isLayoutDebugEnabled()`：检查 `NEXT_PUBLIC_LAYOUT_DEBUG === "true"`，并兼容没有 `process` 的轻量测试 VM。
- `logLayoutDebug(...args)`：仅 debug flag 开启时调用 `console.log`。

对外依赖：无。

注意事项：这是日志出口，不是业务 telemetry；默认关闭，Phase 3B 第四批后 Next build 不再输出布局策略注册日志。

### `frontend/services/layout/utils/NestingTreeBuilder.ts`

职责：分析旧 Node/Group 的 groupId 关系，计算嵌套深度、检测循环、按深度分组并构建嵌套树节点。

关键导出：
- `NestingTreeNode`：嵌套树节点结构。
- `NestingTreeBuilder`：嵌套层级树构建器。

对外依赖：`../../../types/graph/models`、`../../../config/graph.config`。

注意事项：`calculateDepth()` 有 visited set 和最大深度限制；`buildTree()` 返回所有树节点列表而不是只返回 root nodes；内部缓存依赖每次入口方法先重建 `nodeMap`。

### `frontend/services/layout/utils/GeometryUtils.ts`

职责：提供布局算法用的基础几何计算，包括距离、矩形重叠、中心点、节点边界、包围盒、最小平移向量。

关键导出：
- `GeometryUtils`：静态几何工具类。

对外依赖：`../../../types/graph/models`。

注意事项：多数方法是纯函数；`getBounds(node)` 直接依赖旧 `Node | Group`，且默认宽高硬编码为 `350/280`。

### `frontend/services/layout/types/layoutTypes.ts`

职责：定义布局系统的节点/边别名、选项、结果和策略接口。

关键导出：
- `LayoutNode`：当前等同于 `Node | Group`。
- `LayoutEdge`：当前等同于 `Edge`。
- `ELKLayoutDirection`、`ELKLayoutOptionValue`、`ELKLayoutOptions`：ELK 配置最小契约。
- `LayoutProgress`、`LayoutNodePosition`、`LayoutEdgeUpdate`：布局进度、节点位置/尺寸/边 handle patch 类型。
- `LayoutOptions`：布局选项。
- `LayoutResult`：布局返回结果。
- `ILayoutStrategy`：布局策略接口。

对外依赖：`../../../types/graph/models`。

注意事项：Phase 2C 已移除该文件的开放 `[key:string]: any`、result map `any` 和 `elkOptions` 的开放 unknown；但布局类型仍不是独立 DTO，只是旧 graph 模型别名，算法层仍需在 Phase 5 迁到 `LayoutGraph`。

### `frontend/types/layout/node.ts`

职责：旧布局节点 DTO 候选类型，描述 id、type、position、width/height、parentId、children、isGroup 和 data。

关键导出：
- `LayoutNode`：旧独立布局节点接口。

对外依赖：无。

注意事项：当前主布局服务使用 `services/layout/types/layoutTypes.ts`，该目录属于旧/重复 layout 类型候选；Phase 2C 已将 `data` 从 `any` 收紧为 `Record<string, unknown>`。

### `frontend/types/layout/edge.ts`

职责：旧布局边 DTO 候选类型，描述 source/target、handle、type 和 data。

关键导出：
- `LayoutEdge`：旧独立布局边接口。

对外依赖：无。

注意事项：Phase 2C 已移除未使用的 `LayoutNode` import，并将 `data` 从 `any` 收紧为 `Record<string, unknown>`。

### `frontend/types/layout/strategy.ts`

职责：旧布局策略接口候选，定义布局 options/result/strategy 契约。

关键导出：
- `LayoutProgress`、`LayoutNodePosition`、`LayoutEdgeUpdate`：旧策略辅助类型。
- `LayoutOptions`、`LayoutResult`、`ILayoutStrategy`：旧策略契约。

对外依赖：`./node`、`./edge`。

注意事项：当前主布局服务不直接使用该文件；Phase 2C 已移除开放 `[key:string]: any`、edge result `any` 和 `validateConfig(config:any)`。

### `frontend/config/layout.ts`

职责：集中定义布局配置、padding 配置、z-index 配置和 `calculateZIndex()`。

关键导出：
- `LAYOUT_CONFIG`：布局、尺寸、碰撞、递归、性能、内存配置。
- `PADDING_CONFIG`：group padding 和 node visual padding。
- `Z_INDEX_CONFIG`：节点/组/边层级配置。
- `calculateZIndex(nestingDepth, isGroup, isSelected)`：计算 z-index。
- `LayoutConfig`：布局配置类型。

对外依赖：`./constants`。

注意事项：配置模块混合算法参数、UI 尺寸、标题栏高度、z-index 和动画时间；未来应拆成 algorithm config 与 view tokens。

### `frontend/config/elk-algorithm.ts`

职责：定义 ELK 算法参数，包括 layered、force、stress、tree、radial、compact、spacious 和 common 配置。

关键导出：
- `ELK_ALGORITHM_CONFIG`：ELK 参数常量。

对外依赖：无内部依赖。

注意事项：整体较适合迁移到算法配置层；`common.debugMode` 当前为 true，可能造成不必要的算法调试开销。

### `frontend/services/mermaid/*`

状态：已删除。

原职责：临时 Mermaid Flowchart 导入链路，包含 parser、旧图模型 converter、导入 service、layout adapter 和类型契约。

删除原因：当前产品定位回到 Ontology Canvas。Mermaid 不是本体图的核心表达语言，继续保留会把临时桥接能力误塑造成系统主导入协议；后续导入能力应基于本体 schema / DSL / RDF-OWL 映射重新设计。

影响：活跃前端代码不再 import `@/services/mermaid/*`，`frontend/package.json` 已移除 `mermaid` 依赖。

### `frontend/components/graph/import/*` / `frontend/hooks/useMermaidImport.ts` / `frontend/components/graph/controls/MermaidImportControl.tsx`

状态：已删除。

原职责：提供 Mermaid 文本输入、文件上传、导入 dialog/control 和导入 hook。

删除原因：下线临时 Mermaid 导入入口，避免 UI 继续暴露未定型导入协议。

影响：`Toolbar.tsx` 已移除 Mermaid 导入按钮和 dialog 状态。

### `backend/controllers/mermaid.py` / `backend/services/graph/mermaid_converter.py` / `backend/test_mermaid_converter.py`

状态：已删除。

原职责：后端临时 Mermaid 转换 API、转换服务和测试脚本。

删除原因：后端 Mermaid API 未接入当前前端主链路，且与本体图导入方向不一致；后续导入协议重新设计时再建立新的后端契约。

### `项目文档/_archive/mermaid-import-legacy/*`

状态：历史归档。

原职责：保存 Mermaid 导入研究报告、实现方案和独立示例脚本。

隔离原因：这些资料不参与当前前端/后端运行，也不应被视为 Ontology Canvas 的导入协议。归档目录保留历史可追溯性，同时避免主项目文档误导后续架构判断。

影响：当前系统仍然不提供导入能力；未来导入能力必须先定义 `OntologyImportDraft`、schema version、validation warnings 和 command apply 边界。

### `frontend/app/api/workspace/load/route.ts`

职责：Next API GET 路由，从 `public/workspace/{key}` 读取 workspace JSON 并校验返回。

关键导出：
- `GET(request: NextRequest)`：加载 workspace 文件。

对外依赖：`fs/promises`、`path`、`@/types/workspace/storage`、`@/lib/utils`。

注意事项：默认 key 是 `kg-editor:workspace.json`；文件不存在返回 404；所有异常统一返回 500。

### `frontend/app/api/workspace/save/route.ts`

职责：Next API POST 路由，校验请求体中的 storage data 并写入 `public/workspace/{key}`。

关键导出：
- `POST(request: NextRequest)`：保存 workspace 文件。

对外依赖：`fs/promises`、`path`、`@/types/workspace/storage`、`@/lib/utils`。

注意事项：保存时打印完整请求体和验证数据，大图下日志会很重；Date 序列化 replacer 对已被 Zod transform 后的数据有效。

### `frontend/app/api/layout/route.ts`

职责：Next API layout 路由，POST 执行布局并返回 positions，GET 返回支持的策略列表。

关键导出：
- `POST(request: NextRequest)`：执行布局。
- `GET(request: NextRequest)`：查询 layout strategies。

对外依赖：`@/types/graph/models`、`@/services/layout`。

注意事项：Phase 2C 已将 `options` 从 `any` 收敛到 `LayoutOptions`；模块顶层创建 `new LayoutManager()`，会在 route 加载时注册策略并写日志；Phase 2C 后不会再因此触发 ELK engine 初始化；GET 描述中的 `canvas-layout/group-layout/recursive-layout` 与当前实际策略 `elk-layout/elk-group-layout` 不一致。

### `frontend/services/storage/StorageManager.ts`

职责：封装 workspace/canvas 的持久化读写，默认使用 `FileSystemAdapter`。

关键导出：
- `StorageManager`：持久化管理器类。
- `storageManager`：默认单例。

对外依赖：`@/types/workspace/storage`、`@/types/workspace/models`、`./adapters/FileSystemAdapter`。

注意事项：Phase 2C 已把 `removeFromTree()` 的树节点类型收敛为 `CanvasTreeNode[]`；这是统一 data-layer 的候选，但当前 canvasSync、persistenceMiddleware 仍绕过它直接 fetch；版本不匹配只 warn，迁移 TODO 未实现。

### `frontend/services/storage/adapters/FileSystemAdapter.ts`

职责：通过 Next API `/api/workspace/load|save` 实现文件系统存储适配器。

关键导出：
- `FileSystemAdapter`：实现 `StorageAdapter` 和文件系统接口。

对外依赖：`@/types/workspace/storage`。

注意事项：`remove()`、`clear()`、`deleteFile()` 未实现；load 失败返回 null，save 失败抛 Error。

### `frontend/types/workspace/storage.ts`

职责：定义 storage version、storage key、StorageData schema 和 storage adapter 接口。

关键导出：
- `STORAGE_VERSION`、`STORAGE_KEYS`。
- `StorageData`、`StorageDataSchema`。
- `StorageAdapter`、`FileSystemAdapter` 接口。

对外依赖：`zod`、`./models`。

注意事项：`timestamp` 支持 Date/string 并 transform 为 Date；缺少 schema migration registry。

### `frontend/domain/ontology/index.ts`

职责：Ontology domain 的公开出口。Phase 1 当前只导出 commands，后续会继续承接 model、selectors、validation 和 migrations。

关键导出：
- `* from './commands'`：导出本体命令工具。

对外依赖：`./commands`。

注意事项：这是目标架构目录的第一块真实代码；当前旧 store 仍存在，只是开始调用 domain 层纯规则。

### `frontend/domain/ontology/commands/index.ts`

职责：Ontology commands 的公开出口。

关键导出：
- `* from './edgeVisibility'`。
- `* from './graphCommands'`。
- `* from './graphConsistency'`。

对外依赖：`./edgeVisibility`、`./graphCommands`、`./graphConsistency`。

注意事项：禁止在该目录引入 React、ReactFlow、Zustand、fetch 或 CSS。

### `frontend/domain/ontology/commands/edgeVisibility.ts`

职责：维护边可见性状态的纯函数集合，统一处理 `all/none/custom` 三种模式和 legacy visible ids 派生。

关键导出：
- `EdgeVisibilityMode`、`EdgeVisibility`、`EdgeIdentity`。
- `createAllEdgeVisibility()`：创建全部可见状态。
- `createNoEdgeVisibility()`：创建全部隐藏状态。
- `createCustomEdgeVisibility(ids, edges?)`：创建自定义可见状态，并可按已知边过滤。
- `normalizeEdgeVisibility(visibility, edges?)`：规范化缺省或 custom 状态。
- `getVisibleEdgeIds(edges, visibility?)`：从可见性状态派生可见边 ID。
- `isEdgeVisible(edgeId, visibility?)`：判断单条边是否应显示。
- `addEdgeToVisibility(visibility, edgeId)`：新增边后维护 custom visibility。
- `removeEdgeIdsFromVisibility(visibility, edgeIds)`：删除边后维护 custom visibility。
- `toggleEdgeInVisibility(edgeId, edges, visibility?)`：切换单条边可见性并进入 custom 模式。

对外依赖：无内部依赖。

注意事项：该文件使用结构化 `EdgeIdentity`，不依赖旧 `Edge` 模型，因此后续可被 OntologyGraph 复用。

### `frontend/domain/ontology/commands/graphConsistency.ts`

职责：维护图数据一致性的纯函数集合。当前先承接删除节点/分组时同步删除 incident edges 的规则。

关键导出：
- `EdgeConnection`：最小边连接契约。
- `removeEdgesConnectedToNodes(edges, nodeIds)`：删除 source/target 命中节点集合的边。
- `removeEdgesConnectedToNodesWithVisibility(edges, nodeIds, visibility?)`：删除 incident edges，同时同步结构化 edge visibility。

对外依赖：`./edgeVisibility`。

注意事项：该文件仍是 Phase 1 小边界，后续 command 层应继续吸收 group membership、domain collapse、subgraph link 等一致性规则。

### `frontend/domain/ontology/commands/graphCommands.ts`

职责：提供 Phase 2B 的本体图语义命令。它只接收和返回 `OntologyGraph`，不写 store、不触碰 UI、不发请求。

关键导出：
- `OntologyCommandWarning`、`OntologyCommandResult`：命令结果和 warning 契约。
- `CreateClassNodeInput`、`UpdateNodeFieldsInput`、`UpdateOntologyNodeInput`、`UpdateOntologyDomainInput`、`CreateSemanticRelationInput`、`UpdateSemanticRelationInput`、`MoveNodeToDomainInput`、`DeleteOntologyElementsInput`：命令输入契约。
- `CreateDomainInput`：创建本体 Domain 的命令输入契约。
- `createDomain(graph, input)`：创建 `OntologyDomain`，并同步父 domain membership。
- `createClassNode(graph, input)`：创建类图式本体节点，并同步 domain/subgraph membership。
- `updateNodeFields(graph, input)`：替换节点内部字段。
- `updateOntologyNode(graph, input)`：更新节点 name/type/description/fields/tags/metadata，并同步 Domain membership。
- `updateOntologyDomain(graph, input)`：更新 Domain name/parent/collapsed/metadata，并同步父 Domain membership，阻止自引用和循环父级。
- `createSemanticRelation(graph, input)`：创建语义关系边，并加入包含 source/target 的 subgraph。
- `updateSemanticRelation(graph, input)`：更新语义关系名称、方向、Domain 和 metadata。
- `deleteOntologyElements(graph, input)`：删除节点、Domain 或边；删除 Domain 时级联删除子 Domain、节点和 incident edges，并同步 subgraph refs。
- `moveNodeToDomain(graph, input)`：移动节点到目标 domain，或从所有 domain 移除。

对外依赖：`../model`。

注意事项：命令失败不抛业务异常，而是返回 `changed:false` 和 warning；这便于后续 UI/use-case 层统一展示可恢复错误。`deleteOntologyElements()` 是 Phase 3B 新增的关键清理命令，用于让 ReactFlow 删除和键盘删除不再只删旧 graph store。Phase 3C 后，节点/Domain Inspector 保存时先走 `updateOntologyNode()` / `updateOntologyDomain()`，旧 graph store 不再反向重建本体文档。

### `frontend/features/ontology-canvas/model/document/index.ts`

职责：Ontology Canvas document model 子域公开出口。

关键导出：
- `* from './ontologyDocument'`。
- `* from './persistence'`。

对外依赖：`./ontologyDocument`、`./persistence`。

注意事项：这是 Phase 3B 本体运行态切换的第一块 feature model 出口，不允许依赖旧 graph store、ReactFlow 或 UI。

### `frontend/features/ontology-canvas/model/document/ontologyDocument.ts`

职责：定义 `OntologyDocumentState` 与 `OntologyViewState`，把语义图 `OntologyGraph` 和视图状态分开；提供创建节点/Domain/关系、更新节点/Domain/关系、更新 view state、更新 viewport 和删除本体元素的 document use-case。

关键导出：
- `OntologyDocumentState`：包含 `graph`、`view` 和 `revision`。
- `OntologyViewState`：包含 `nodeViews`、`domainViews`、`edgeViews`、`viewport`、`lod`、`edgeVisibility`。
- `OntologyNodeViewState`、`OntologyDomainViewState`、`OntologyEdgeViewState`：节点、Domain、边的视图状态；节点 view 额外保存 `customExpandedSize` 和 `collapsedSections`，边 view 保存 `sourceHandle/targetHandle`。
- `createOntologyViewState(graph, view?)`：为 graph 补齐缺省 view state。
- `createOntologyDocumentState(input)`：创建本体文档状态。
- `createOntologyClassNodeInDocument(document, input)`：调用 `createClassNode()`，并同步 node view。
- `createOntologyDomainInDocument(document, input)`：调用 `createDomain()`，并同步 domain view。
- `createOntologyRelationInDocument(document, input)`：调用 `createSemanticRelation()`，并同步 edge view handle。
- `updateOntologyNodeInDocument(document, input)`：调用 `updateOntologyNode()`，更新语义节点并推进 revision。
- `updateOntologyDomainInDocument(document, input)`：调用 `updateOntologyDomain()`，更新语义 Domain；若 collapsed 更新则同步 domain view。
- `updateOntologyRelationInDocument(document, input)`：调用 `updateSemanticRelation()`，并保留/更新 edge view handle。
- `updateOntologyNodeViewInDocument(document, input)`：更新节点 position/size/expanded/customExpandedSize/collapsedSections。
- `updateOntologyDomainViewInDocument(document, input)`：更新 Domain position/size/collapsed。
- `updateOntologyViewportInDocument(document, input)`：更新视口 x/y/zoom。
- `deleteOntologyElementsInDocument(document, input)`：调用 `deleteOntologyElements()`，并清理 node/domain/edge view records。

对外依赖：`../../../../domain/ontology`。

注意事项：该文件不 import `@/types/graph/models`，不创建 `BlockEnum.NODE/GROUP`；position/width/height/customExpandedSize/collapsedSections 只进入 view state，不写入 `OntologyNode` 语义对象。Phase 3C 后 Inspector 保存直接调用 document update use-case，不再从旧 graph store rehydrate 本体文档。

### `frontend/features/ontology-canvas/model/document/persistence.ts`

职责：封装运行时 `OntologyDocumentState` 与 workspace 持久化 JSON 快照之间的转换。它让 document runtime 不直接暴露给文件存储格式，也为后续 PostgreSQL adapter 保持稳定边界。

关键导出：
- `createPersistedOntologyCanvas(document, savedAt?)`：把当前 `graph/view/revision` 打包成 `PersistedOntologyCanvas`，并写入 `savedAt`。
- `restoreOntologyDocumentFromPersistedCanvas(snapshot, fallback)`：从持久化快照恢复 `OntologyDocumentState`，用 fallback 补 canvas id/name/viewport。

对外依赖：`@/types/workspace/ontologyCanvas`、`./ontologyDocument`。

注意事项：该文件不 fetch、不读写 store，只做对象转换。持久化快照内只保存 `OntologyGraph` 和白名单 `OntologyViewState`，不保存 selection/hover/editing draft。

### `frontend/features/ontology-canvas/state/index.ts`

职责：Ontology Canvas state 层公开出口。

关键导出：
- `* from './ontologyDocumentStore'`。

对外依赖：`./ontologyDocumentStore`。

注意事项：state 层和纯 model 层分离；`features/ontology-canvas/model` 仍被架构脚本保护为不依赖 Zustand/store/UI。

### `frontend/features/ontology-canvas/state/ontologyDocumentStore.ts`

职责：当前运行时本体文档 store，持有 `OntologyDocumentState`、来源 canvas、hydration 状态，并提供对 document command result、interaction patch 和 view state 的应用入口。

关键导出：
- `OntologyDocumentSource`：记录更新来源 canvas 和原因。
- `useOntologyDocumentStore`：Zustand store hook，包含 `replaceDocument()`、`applyCommandResult()`、`applyInteractionPatch()`、`updateNodeView()`、`updateDomainView()`、`updateViewport()`、`deleteElements()`。

对外依赖：`zustand`、`../model/document`、`../model/interactions`。

注意事项：这是 Phase 3B 的运行时真相源切换点。它不直接 import 旧 graph store；旧 graph 到本体文档的初始化在 workspace/canvas bridge 中完成，旧展示对象投影仍放在 `adapters/legacy-graph`。后续移除旧 graph store 时，应优先让 UI blocks 只读该 store 和独立 selection/editing store。

### `frontend/domain/ontology/model/schemaVersion.ts`

职责：定义当前本体图数据 schema version，是后续 migration 和 workspace schema 演进的版本锚点。

关键导出：
- `ONTOLOGY_SCHEMA_VERSION`：当前版本号，值为 `1`。
- `OntologySchemaVersion`：由常量派生的版本类型。

对外依赖：无。

注意事项：Phase 2A 只建立版本锚点，尚未实现 migrations registry。

### `frontend/domain/ontology/model/node.ts`

职责：定义本体节点和节点内部字段契约，表达类图式节点的名称、类型、字段、标签、所属 domain/subgraph 和元数据。

关键导出：
- `OntologyNodeType`：`Class/Concept/Function/Component/Information/Interface/Constraint`。
- `OntologyFieldCategory`：`attribute/rule/constraint/interface/behavior`。
- `OntologyField`：节点内部字段契约。
- `OntologyNode`：语义节点契约。

对外依赖：无。

注意事项：该模型不包含 ReactFlow position/style/selected 等视图字段；UI 尺寸、折叠和位置应进入 view state/adapter。

### `frontend/domain/ontology/model/edge.ts`

职责：定义本体语义边契约，表达 source、target、relation、direction 和可选 domain 归属。

关键导出：
- `OntologyRelationDirection`：`unidirectional/bidirectional/undirected`。
- `OntologyEdge`：语义关系边契约。

对外依赖：无。

注意事项：`relation` 是语义谓词名，不是纯显示 label；后续 RDF/OWL 导出应基于该字段。

### `frontend/domain/ontology/model/domain.ts`

职责：定义 Domain/域边界模型，用于表达一组节点和子域的上下文边界、归属和折叠状态。

关键导出：
- `OntologyDomain`：包含 `nodeIds/domainIds/parentDomainId/collapsed` 的域模型。

对外依赖：无。

注意事项：Domain 是语义/上下文分组，不等同于 ReactFlow group node；渲染时应由 adapter 投影成画布分组。

### `frontend/domain/ontology/model/subgraph.ts`

职责：定义子图导航模型，用于表达一个可进入的图谱视图或节点内部结构图。

关键导出：
- `OntologySubgraph`：包含 root node、domain、nodeIds、edgeIds 的子图契约。

对外依赖：无。

注意事项：Phase 2A 只建立契约；workspace/canvas tree 还没有迁移到该模型。

### `frontend/domain/ontology/model/graph.ts`

职责：聚合 OntologyGraph 根模型，并提供默认创建函数。

关键导出：
- `OntologyGraph`：语义图根对象，包含 nodes、edges、domains、subgraphs。
- `CreateOntologyGraphInput`：创建图谱的输入契约。
- `createOntologyGraph(input)`：填充 schemaVersion 和缺省空 records。

对外依赖：`./schemaVersion`、`./domain`、`./edge`、`./node`、`./subgraph`。

注意事项：records 是当前语义真相源形态；顺序、坐标、尺寸不在该模型内。

### `frontend/domain/ontology/model/index.ts`

职责：Ontology model 的 barrel 出口。

关键导出：
- `* from './domain'`
- `* from './edge'`
- `* from './graph'`
- `* from './node'`
- `* from './schemaVersion'`
- `* from './subgraph'`

对外依赖：各 model 文件。

注意事项：后续新增 model 文件时应从这里统一暴露，避免调用方跨目录深 import。

### `frontend/domain/ontology/mappers/index.ts`

职责：Ontology mapper 的 barrel 出口。

关键导出：
- `* from './legacyGraphMapper'`。

对外依赖：`./legacyGraphMapper`。

注意事项：mapper 是迁移适配层，不应把 legacy 类型泄漏成新的语义模型。

### `frontend/domain/ontology/mappers/legacyGraphMapper.ts`

职责：把旧项目的 `Node/Group/Edge` 形状转换为新的 `OntologyGraph`。该文件不 import 旧 `@/types/graph/models`，而是声明最小 legacy shape，避免把 React/CSS 类型传入 domain 层。

关键导出：
- `LegacyGraphBlockType`、`LegacyGraphBlock`、`LegacyGraphEdge`、`LegacyGraphInput`：最小旧图输入契约。
- `mapLegacyGraphToOntologyGraph(input)`：转换旧图为本体图。

对外依赖：`../model/graph`、`../model/domain`、`../model/edge`、`../model`、`../model/subgraph`。

注意事项：mapper 保留语义数据，不迁移 position/style/selection；旧 group 被映射为 `OntologyDomain`，旧 node 被映射为 `OntologyNode`，旧 edge 被映射为 `OntologyEdge`。

### `frontend/domain/ontology/validation/index.ts`

职责：Ontology validation 的 barrel 出口。

关键导出：
- `* from './graphValidation'`。

对外依赖：`./graphValidation`。

注意事项：后续 node/domain/edge 子校验可继续通过该出口统一暴露。

### `frontend/domain/ontology/validation/graphValidation.ts`

职责：校验 `OntologyGraph` 的基础一致性，包括 record key/id 一致、节点字段、边端点、domain/subgraph 引用、domain parent cycle 和 schemaVersion。

关键导出：
- `OntologyValidationSeverity`、`OntologyValidationIssue`、`OntologyValidationResult`。
- `validateOntologyGraph(graph)`：返回 `{ valid, issues }`。

对外依赖：`../model/schemaVersion`、`../model/graph`。

注意事项：当前只做结构一致性校验，不做 OWL/RDF 语义推理；后续可增加 relation domain/range、cardinality、disjointness 等本体公理校验。

### `frontend/scripts/check-architecture-boundaries.mjs`

职责：轻量架构边界检查脚本，不依赖第三方包。当前检查 `domain/ontology`、`features/ontology-canvas/model` 和 `features/ontology-canvas/adapters`，防止这些层反向依赖不该碰的 UI、store、fetch 或 CSS。

关键导出：无，作为 Node CLI 脚本执行。

内部函数：
- `collectSourceFiles(directory)`：递归收集 `.js/.jsx/.mjs/.ts/.tsx` 源文件。
- `getImportedModules(source)`：用正则提取静态 import/export、动态 import 和 require 的模块名。
- `checkRule(rule)`：按规则检查指定目录的 import 和代码模式。

对外依赖：Node 内置 `fs/promises`、`path`、`process`。

注意事项：这是 Phase 1/2 的轻量护栏，不替代后续 ESLint import boundary；adapter 规则允许 ReactFlow DTO，但禁止 store/UI/fetch/CSS；当 `core/data-layer` 目录落地后，应继续扩展 `boundaryRules`。

### `frontend/scripts/test-domain-commands.mjs`

职责：轻量 domain command 运行时测试脚本，不引入测试框架。它通过共享 TypeScript module loader 加载 `domain/ontology/commands`，用断言覆盖 Phase 1 抽出的纯规则。

关键导出：无，作为 Node CLI 脚本执行。

内部函数：
- `resolveLocalModule(specifier, parentDirectory)`：解析本地相对模块，支持 `.ts/.tsx/.js/.mjs/index.ts`。
- `loadTypeScriptModule(filePath)`：用 TypeScript `transpileModule` 转 CommonJS，再在 VM 中执行并缓存 exports。
- `toPlainValue(value)`：把 VM 上下文对象转成普通 JSON 值，避免原型差异影响断言。
- `assertDeepPlainEqual(actual, expected, message)`：普通化后执行深等断言。

对外依赖：Node 内置 `assert/strict`、`path`、`process`，以及 `./load-typescript-module.mjs`。

注意事项：这是 Phase 1 的最小 runtime safety net，不替代后续 Vitest/Jest 单元测试；Phase 2B 已移除 `visibleEdgeIds` 兼容断言，只断言结构化 `edgeVisibility`。

### `frontend/scripts/load-typescript-module.mjs`

职责：为轻量 runtime 测试脚本提供共享 TypeScript module loader，避免每个测试脚本复制 `ts.transpileModule + vm.runInNewContext` 逻辑。

关键导出：
- `createTypeScriptModuleLoader(importMetaUrl)`：返回 `{ loadTypeScriptModule, resolveLocalModule }`。

对外依赖：Node 内置 `module`、`fs`、`path`、`vm`，以及项目 devDependency `typescript`。

注意事项：这是测试脚本工具，不进入生产 bundle；Phase 3D 后支持 `@/` 路径别名和 VM 内 mock fetch，用于测试 data-layer repository；后续引入正式测试框架后可删除。

### `frontend/scripts/test-ontology-model.mjs`

职责：轻量 ontology model 运行时测试脚本，不引入测试框架。它通过共享 TypeScript module loader 加载 `domain/ontology/index.ts`，验证 Phase 2A 的本体模型、legacy mapper 和 graph validation。

关键导出：无，作为 Node CLI 脚本执行。

内部函数：
- `resolveLocalModule(specifier, parentDirectory)`：解析本地相对模块。
- `loadTypeScriptModule(filePath)`：转译并执行 TypeScript 模块，返回 CommonJS exports。
- `toPlainValue(value)`：把 VM 对象转成普通 JSON 值。
- `assertDeepPlainEqual(actual, expected, message)`：普通化后执行深等断言。

对外依赖：Node 内置 `assert/strict`、`path`、`process`，以及 `./load-typescript-module.mjs`。

注意事项：脚本样本包含嵌套 domain、Function/Information/Component 三类节点、关系谓词、invalid edge 和 domain parent cycle；后续 command/use-case 增加后应转入正式测试框架。

### `frontend/scripts/test-ontology-commands.mjs`

职责：轻量 ontology command 运行时测试脚本，覆盖 Phase 2B 语义命令行为。

关键导出：无，作为 Node CLI 脚本执行。

内部函数：
- `createBaseGraph()`：构造一个包含两个 domain、三个节点、root subgraph 的 legacy graph，并映射为 `OntologyGraph`。
- `toPlainValue(value)`：把 VM 对象转成普通 JSON 值。
- `assertDeepPlainEqual(actual, expected, message)`：普通化后执行深等断言。

对外依赖：Node 内置 `assert/strict`、`path`、`process`，以及 `./load-typescript-module.mjs`。

注意事项：该脚本验证 command 成功路径和 warning 路径，包括 createDomain、createClassNode、updateNodeFields、createSemanticRelation 和 moveNodeToDomain；不替代后续正式 command 单元测试。

### `frontend/scripts/test-ontology-document-model.mjs`

职责：轻量 ontology document model 运行时测试脚本，覆盖 Phase 3B 第一批的本体文档状态和创建节点/Domain use-case。

关键导出：无，作为 Node CLI 脚本执行。

内部函数：
- `toPlainValue(value)`：把 VM 对象转成普通 JSON 值。
- `assertDeepPlainEqual(actual, expected, message)`：普通化后执行深等断言。

对外依赖：Node 内置 `assert/strict`、`path`、`process`，以及 `./load-typescript-module.mjs`。

注意事项：该脚本断言 position/width/height 只进入 `OntologyViewState`，不写入 `OntologyNode` 语义对象；同时覆盖 duplicate node warning 和 graph validation。

### `frontend/scripts/test-ontology-document-store.mjs`

职责：轻量 ontology document store 运行时测试脚本，覆盖 store replace、command result、interaction patch、view update、viewport 和 delete 路径。

关键导出：无，作为 Node CLI 脚本执行。

内部函数：
- `toPlainValue(value)`：把 VM 对象转成普通 JSON 值。

对外依赖：Node 内置 `assert/strict`、`path`、`process`，以及 `./load-typescript-module.mjs`。

注意事项：Phase 3E-A 后该脚本新增 `applyInteractionPatch()` 断言，确保拖拽/resize 的批量 view patch 能一次写入 `ontologyDocumentStore`。
2026-05-08 后，该脚本覆盖 `createResizeCommitGate()`，确保 LOD 自动 dimensions change 不会被误提交为用户 resize；同日新增显式归入 / 移出容器断言，覆盖 `updateOntologyNodeInDocument()` 写 `domainId/nodeIds`、`createNodeDomainPlacementPatch()` 自动放入目标容器空位并扩展边界。

### `frontend/scripts/test-ontology-legacy-bridge.mjs`

职责：轻量 ontology legacy bridge 运行时测试脚本，覆盖 Phase 3B 第二批新增的“本体文档结果临时投影到旧画布展示运行态”的桥接层。

关键导出：无，作为 Node CLI 脚本执行。

内部函数：
- `toPlainValue(value)`：把 VM 对象转成普通 JSON 值。
- `assertDeepPlainEqual(actual, expected, message)`：普通化后执行深等断言。

对外依赖：Node 内置 `assert/strict`、`path`、`process`，以及 `./load-typescript-module.mjs`。

注意事项：该脚本断言旧 Domain/Node 的位置、尺寸、edge handles 能进入 `OntologyViewState`；同时断言 `projectOntologyNodeToLegacyNode()` / `projectOntologyDomainToLegacyGroup()` 在 `includeMembership:false` 下不会提前写入 `groupId`，以便旧 store 的 membership action 继续维护 parent `nodeIds`。

### `frontend/scripts/test-editor-drafts.mjs`

职责：轻量编辑器草稿模型运行时测试脚本，覆盖 Phase 2B 编辑入口收敛的纯 helper 行为。

关键导出：无，作为 Node CLI 脚本执行。

内部函数：
- `toPlainValue(value)`：把 VM 对象转成普通 JSON 值，避免跨上下文原型影响深等断言。

对外依赖：Node 内置 `assert/strict`、`path`、`process`，以及 `./load-typescript-module.mjs`。

注意事项：该脚本验证 edge draft、customProperties JSON 解析、edge update payload、node draft、node update payload 不含 `groupId`、属性键值对象转换；它是当前编辑器 TSX 重构的最小安全网。

### `frontend/scripts/test-domain-nesting-interactions.mjs`

职责：轻量 Domain 嵌套交互运行时测试脚本，覆盖 Phase 3E-A 的关键交互契约。

关键导出：无，作为 Node CLI 脚本执行。

测试内容：
- `collectDomainDescendantViewIds()` 能收集多层 Domain 后代 node/domain view。
- `projectReactFlowPositionToAbsolute()` 能把 child relative position 加父 Domain absolute position。
- `constrainNodePositionToDomain()` 能把节点约束到父 Domain padding 内。
- `commitNodeDrag()` 提交约束后的 node view position，且不原地修改 document。
- `commitDomainDrag()` 平移父 Domain 和所有后代 node/domain view，并扩展父 Domain 边界。
- `commitNodeResize()` 触发 Domain boundary cascade，并在展开/折叠场景写入 `expanded`。
- `applyOntologyInteractionPatch()` 只增加一次 revision。

对外依赖：Node 内置 `assert/strict`、`path`、`process`，以及 `./load-typescript-module.mjs`。

注意事项：这是当前防止节点回弹、Domain 移动后子节点跑出外部的最小安全网；后续接入正式测试框架时应转成单元测试。

### `frontend/scripts/test-workspace-repository.mjs`

职责：轻量 workspace repository 运行时测试脚本，覆盖 Phase 3D 本体 JSON 持久化边界。

关键导出：无，作为 Node CLI 脚本执行。

测试内容：
- 默认 `DEFAULT_CANVAS` 包含 `ontologyDocument`。
- `createPersistedOntologyCanvas()` 与 `restoreOntologyDocumentFromPersistedCanvas()` 保留 graph/view/revision。
- `workspaceRepository.loadOntologyCanvas()` / `saveOntologyCanvas()` 正确读写 canvas 快照。
- `StorageDataSchema` 能解析默认 workspace JSON。
- mock `fetch` 后，`loadWorkspaceStorage()` / `saveWorkspace()` 只请求 workspace repository 管理的 API。

对外依赖：Node 内置 `assert/strict`、`fs/promises`、`path`、`process`，以及 `./load-typescript-module.mjs`。

注意事项：该脚本通过 `globalThis.fetch` mock repository 请求，依赖 `load-typescript-module.mjs` 支持 `@/` 别名和 VM fetch 代理。

### `frontend/stores/graph/persistenceMiddleware.ts`

职责：Zustand 中间件，订阅 graph store 变化并防抖同步当前 canvas，再通过 workspace persistence helper 保存当前工作区。

关键导出：
- `persistenceMiddleware`：包装 Zustand StateCreator 的中间件。

对外依赖：`@/lib/utils`、动态导入 `@/utils/workspace/canvasSync`、动态导入 `@/utils/workspace/persistence`。

注意事项：Phase 3D 后本文件不再直接 fetch workspace API；保存路径为 `saveCurrentCanvasData()` -> `persistWorkspace()` -> `workspaceRepository.saveWorkspace()`。它仍订阅整个 graph store，没有筛选需要保存的数据域；保存失败只 console，不向 UI 暴露。

### `frontend/utils/workspace/canvasSync.ts`

职责：在 workspace store、`ontologyDocumentStore` 与旧 graph store 显示桥之间同步当前 canvas。Phase 3D 后保存优先写 `Canvas.ontologyDocument`，并投影旧 `graphData` 作为 ReactFlow 显示缓存。

关键导出：
- `getActiveOntologyDocument({ canvasId, fallbackName? })`：返回当前 hydration document；若没有，则优先从 workspace canvas 的 `ontologyDocument` 恢复，最后才从旧 graph store 快照迁移。
- `saveCurrentCanvasData()`：把当前 `OntologyDocumentState` 保存为 `PersistedOntologyCanvas`，并投影旧 `graphData`。
- `loadCanvasData(canvasId)`：优先从目标 Canvas `ontologyDocument` 恢复本体文档，再投影旧 graph store 显示对象。
- `switchToCanvas(targetCanvasId)`：保存当前 canvas，切换 currentCanvasId，加载目标 canvas，并通过 repository 持久化。

对外依赖：`@/stores/graph`、`@/stores/workspace`、`@/types/workspace/models`、`@/data-layer/workspace`、`@/features/ontology-canvas`、`./persistence`。

注意事项：这是当前唯一允许 `createOntologyDocumentFromLegacyGraph()` 的运行时迁移点；组件层 fallback 已收口到 `getActiveOntologyDocument()`。旧 `graphData` 只作为 migration/display cache，不再是新持久化真相源；彻底删除需要先迁移 layout/history/edge optimizer。

### `frontend/utils/workspace/persistence.ts`

职责：把当前 workspace store 快照持久化到数据层。Phase 3D 后它是 store/UI 调用 repository 的薄封装，不再直接 fetch API。

关键导出：
- `persistWorkspace()`：读取 `useWorkspaceStore.getState()`，组装 `Workspace` DTO，并调用 `saveWorkspace()`。

对外依赖：`@/stores/workspace`、`@/data-layer/workspace`。

注意事项：该函数不主动调用 `saveCurrentCanvasData()`，调用方需要先同步当前 canvas；这样避免 `persistence.ts` 与 `canvasSync.ts` 形成保存递归。

### `frontend/data-layer/workspace/index.ts`

职责：workspace data-layer 公开出口。

关键导出：
- `* from './workspaceRepository'`。

对外依赖：`./workspaceRepository`。

注意事项：应用层应从这里导入 workspace repository 能力，避免深 import 后续 adapter 实现。

### `frontend/data-layer/workspace/workspaceRepository.ts`

职责：workspace JSON 加载/保存的唯一前端 fetch 出口，并提供本体 canvas 快照读写 helper。第一版底层仍调用 Next API Routes，后续 PostgreSQL 只替换本文件或其 adapter。

关键导出：
- `createWorkspaceStorageData(workspace, timestamp?)`：把 `Workspace` 包装为 `StorageData`。
- `loadWorkspaceStorage(options?)`：GET `/api/workspace/load?key=...`，404 返回 null，其余错误抛出。
- `saveWorkspaceStorage(data, options?)`：POST `/api/workspace/save`，成功返回 true，失败抛出。
- `loadWorkspace(options?)`：读取 storage 并返回 `workspace`。
- `saveWorkspace(workspace, options?)`：包装 storage 后保存。
- `loadOntologyCanvas(canvas)`：读取 `canvas.ontologyDocument`。
- `saveOntologyCanvas(canvas, ontologyDocument)`：写回 `ontologyDocument` 和 viewport。
- `migrateOntologyCanvas(canvas)`：为过渡期 canvas 补齐 `graphData` 和 viewport 默认值。

对外依赖：`@/types/workspace/models`、`@/types/workspace/storage`、`@/types/workspace/ontologyCanvas`。

注意事项：静态扫描确认 `/api/workspace/load|save` 的 fetch 只剩本文件；repository 当前仍与 Next API 路径耦合，后续可抽 adapter。`StorageDataSchema.parse()` 后在 repository 边界显式转为 `StorageData`，因为 runtime schema 对旧 display `Node/Group/Edge` 是简化校验。

### `frontend/stores/graph/edgesSlice.ts`

职责：维护 graph store 的 edges、edge CRUD、edge 查询和 edge 可见性。

关键导出：
- `createEdgesSlice(set, get)`：创建边状态和操作。
- `EdgesSlice`：边 slice 类型。

对外依赖：`@/types/graph/models`、`@/domain/ontology`。

注意事项：Phase 0 已新增 `edgeVisibility: { mode: 'all' | 'none' | 'custom'; ids: string[] }`，解决空数组无法区分“全部可见”和“全部隐藏”的问题；Phase 1 已把 visibility 规则抽到 `domain/ontology/commands/edgeVisibility.ts`；Phase 2B 已删除旧 `visibleEdgeIds` 兼容字段；Phase 2C 已移除 `set/get` 的 `any`。UI 可见性操作仍会写 history，后续应迁到 view state。

### `frontend/stores/graph/canvasViewSlice.ts`

职责：维护 graph store 的 viewport 和 canvasSize。

关键导出：
- `createCanvasViewSlice(set)`：创建 viewport/canvasSize 状态和操作。
- `CanvasViewSlice`：视图 slice 类型。

对外依赖：无内部依赖。

注意事项：Phase 2C 已移除未使用导入和 `set` 的 `any`，viewport 现在由 `canvasSync` 直接按 graph store 类型读取；后续仍应把 viewport/selection 迁出持久化图数据。

### `frontend/stores/graph/historySlice.ts`

职责：维护 undo/redo 历史，保存最多 50 个 nodes/edges 快照。

关键导出：
- `HistoryState`：history 状态和操作类型。
- `createHistorySlice(set, get, api)`：创建 history slice。

对外依赖：`../../types/graph/models`、`./index`。

注意事项：history 只浅拷贝 nodes/edges 数组，不深拷贝对象；快照包含完整图，节点多时内存压力大；只保存 nodes/edges，不保存 viewport/selection/edgeVisibility。

### `frontend/stores/workspace/index.ts`

职责：创建 workspace Zustand store，聚合 user slice 和 canvas slice，并启用 devtools。

关键导出：
- `useWorkspaceStore`：全局 workspace store hook。

对外依赖：`./userSlice`、`./canvasSlice`。

注意事项：workspace store 自身没有持久化 middleware；保存动作由 graph persistence 或 canvasSync 手动触发，职责边界不清。

### `frontend/stores/workspace/canvasSlice.ts`

职责：维护 canvases、canvasTree、currentCanvasId，提供创建、删除、重命名、切换、折叠、viewport 更新和初始化操作。

关键导出：
- `CanvasSlice`：canvas 状态和操作类型。
- `createCanvasSlice(set, get)`：创建 canvas slice。

对外依赖：`@/types/workspace/models`、`@/types/workspace/ontologyCanvas`。

注意事项：Phase 3D 后 `createCanvas()` 会为新画布生成空 `PersistedOntologyCanvas`，使新画布从创建起就有本体 JSON 真相源；内部仍直接 `parentCanvas.children.push()`，有原地修改 state 对象风险；`switchCanvas()` 只改 ID，不负责保存旧图或加载新图；tree 与 canvases 维护两份层级数据，存在一致性压力。

### `frontend/stores/graph/nodes/index.ts`

职责：聚合节点相关 slices，包括基础节点操作、group 操作、位置约束和 group 边界更新。

关键导出：
- `NodesSlice`：所有节点相关 slice 的交叉类型。
- `createNodesSlice(set, get)`：创建并合并节点相关操作。

对外依赖：`./types`、`./basicOperations`、`./groupOperations`、`./constraintOperations`、`./groupBoundaryOperations`。

注意事项：按技术动作拆分，但最终混成一个大 slice；Domain/Group/Node 语义没有边界。Phase 2C 已删除旧 Node/Group 互转 slice，不再把转换缓存字段混入 graph store。

### `frontend/stores/graph/nodes/types.ts`

职责：定义节点操作 slice 类型、布局模式类型，以及位置/数值安全工具和 group 内位置约束。

关键导出：
- `GROUP_PADDING`、`NODE_VISUAL_PADDING`：从配置导出的布局常量。
- `safeNumber()`、`safePosition()`、`toRecord()`、`isGraphBoundary()`、`constrainNodeToGroupBoundary()`：通用约束工具。
- `GraphStoreSet`、`GraphStoreGet`：nodes store 局部 set/get 类型，替代旧 `any`。
- `NodeOperationsSlice`、`GroupOperationsSlice`、`ConstraintOperationsSlice`、`LayoutOperationsSlice`、`GroupBoundaryOperationsSlice`：操作类型。

对外依赖：`@/types/graph/models`、`@/config/constants`、`@/config/layout`。

注意事项：Phase 2C 已把 `safeNumber/safePosition` 输入改为 `unknown`，并新增 record/boundary guard；`constrainNodeToGroupBoundary()` 内部仍硬编码 Node 350x280、Group 300x200 默认尺寸，和配置存在重复。

### `frontend/stores/graph/nodes/basicOperations.ts`

职责：维护 nodes、selection、layout mode，提供 add/update/delete/get 节点和 selection 操作。

关键导出：
- `createBasicOperationsSlice(set, get)`：基础节点操作 slice。

对外依赖：`@/types/graph/models`、`@/config/graph.config`、`@/domain/ontology`、`./types`。

注意事项：`updateNode()` 职责过重，混合校验、尺寸同步、style 同步、boundary 更新、group 约束、history；Phase 0 已让 `deleteNode()` 同步删除 incident edges 并更新 edge visibility；Phase 1 已把删除清边规则抽到 `domain/ontology/commands/graphConsistency.ts`；Phase 2C 已删除本 slice 的高频调试 `console.log`；selection 更新仍在 graph store 中，会触发自动保存。

### `frontend/stores/graph/nodes/constraintOperations.ts`

职责：处理节点位置更新和 group 移动。

关键导出：
- `createConstraintOperationsSlice(set)`：位置约束操作 slice。

对外依赖：`@/types/graph/models`、`./types`、`@/utils/graph/recursiveMoveHelpers`。

注意事项：group 移动会对所有 descendants 应用偏移，依赖 `Group.nodeIds` 正确性；位置更新没有 history snapshot，但仍会触发 persistence middleware。Phase 2C 已删除拖拽/移动路径中的调试 `console.log`。

### `frontend/stores/graph/nodes/groupOperations.ts`

职责：处理 group CRUD、添加/移除节点到 group、嵌套校验和位置约束。

关键导出：
- `createGroupOperationsSlice(set)`：group 操作 slice。

对外依赖：`@/types/graph/models`、`@/config/graph.config`、`./types`、`@/utils/graph/nestingHelpers`、`@/domain/ontology`。

注意事项：Phase 0 已修复 `updateGroup({ nodeIds })` 的嵌套数组 bug，并让 `deleteGroup()` 同步删除 group/descendants 的 incident edges；Phase 1 已把删除清边规则抽到 `domain/ontology/commands/graphConsistency.ts`；Phase 2C 已删除 group CRUD/membership 路径中的调试 `console.log`；group 操作 history 行为仍不一致。

### `frontend/stores/graph/nodes/groupBoundaryOperations.ts`

职责：根据 group 内子节点位置和尺寸自动扩张 group 边界，并递归更新祖先 group。

关键导出：
- `createGroupBoundaryOperationsSlice(set)`：group 边界更新 slice。

内部状态：
- `boundaryCache: Map<string, BoundaryCache>`：100ms TTL 的边界缓存。

对外依赖：`@/types/graph/models`、`./types`、`@/config/layout`。

注意事项：缓存 key 只包含 child IDs，不包含 child position/size，可能复用过期边界；Phase 2C 已删除拖拽/resize 边界计算路径中的调试 `console.log`。

### `frontend/stores/graph/nodes/conversionOperations.ts`

职责：已删除。旧实现支持普通节点和 group 互相转换，并通过隐藏子节点/边实现可恢复转换；当前本体图主线不再保留该兼容能力。

关键导出：
- 无。文件已从源码删除。

对外依赖：无。

注意事项：Phase 2C 已删除该 slice、UI 入口和模型缓存字段；活跃前端代码不再消费 `_hiddenByConversion`、`_parentConvertedId`、`convertedFrom`、`savedChildren`、`savedEdges`、`originalPosition`、`originalSize`。

### `frontend/utils/graph/recursiveMoveHelpers.ts`

职责：提供 group 移动时 descendants 偏移、descendant ID 收集、绝对位置计算和边界验证。

关键导出：
- `applyOffsetToDescendants(groupId, offset, nodes)`。
- `collectAllDescendantIds(groupId, nodes)`。
- `getAbsolutePosition(nodeId, nodes)`。
- `validateAllNodesInBounds(nodes)`。

对外依赖：`@/types/graph/models`、`./nestingHelpers`。

注意事项：递归依赖 group.nodeIds 正确性；调用方节点 store 的移动路径调试日志已清理，但该工具自身仍需在后续检查是否有未受控日志或循环风险。

### `frontend/utils/graph/nestingHelpers.ts`

职责：提供 group 嵌套深度、循环嵌套检测、祖先/后代遍历、最近公共祖先和祖先判断。

关键导出：
- `getNestingDepth()`、`hasCircularNesting()`、`getAllNestedNodeIds()`、`getAncestorPath()`、`getAllDescendants()`、`validateNestingDepth()`、`getMaxInternalDepth()`、`getLowestCommonAncestor()`、`isAncestor()`。

对外依赖：`@/types/graph/models`、`@/config/graph.config`。

注意事项：递归函数没有统一 visited set；如果数据已损坏或循环检查被绕过，可能递归失控。

## 5. 函数索引与算法实现

### `RootLayout({ children }: { children: React.ReactNode }): JSX.Element`

行为：渲染 HTML/body，包裹错误边界、ReactFlow Provider、children 和 toast。

算法实现：
1. 设置 `<html lang="en">`。
2. 在 body 上应用全局字体抗锯齿 class。
3. 用 `ErrorBoundary` 包住 `Providers`，再渲染页面 children。
4. 在 children 后渲染 `Toaster`。

副作用：无直接 I/O；影响全应用 React 组件树上下文。

失败行为：子组件渲染异常由 `ErrorBoundary` 捕获，RootLayout 自身没有 try/catch。

调用关系：Called by Next.js App Router；Calls `ErrorBoundary`、`Providers`、`Toaster`。

### `Home(): JSX.Element`

行为：初始化工作区并选择新/旧布局。

算法实现：
1. 初始化本地 `isLoading=true`。
2. 在 `useEffect` 中定义并调用 `initWorkspace()`。
3. `initWorkspace()` 请求 `/api/workspace/load`。
4. 若响应成功，解析 JSON 的 `workspace`，写入 user 和 workspace store。
5. 动态导入 `canvasSync`，调用 `loadCanvasData(workspace.currentCanvasId)` 把当前画布写入 graph store。
6. 若响应失败或抛异常，调用 `initDefaultWorkspace()` 写入默认用户与默认画布。
7. finally 将 `isLoading` 设为 false。
8. loading 时返回 `LoadingOverlay`。
9. 若 `NEXT_PUBLIC_USE_NEW_LAYOUT === 'false'`，返回 `LegacyLayout`，否则返回 `WorkspaceLayout`。

副作用：HTTP GET `/api/workspace/load`；写入 workspace Zustand store；动态导入并写入 graph Zustand store；写浏览器 console。

失败行为：fetch 非 ok 或异常时降级默认工作区；不会向用户展示具体错误。

调用关系：Called by Next.js App Router；Calls `useWorkspaceStore.initializeWorkspace`、`useWorkspaceStore.setUser`、`loadCanvasData`、`WorkspaceLayout`。

### `Providers({ children }: { children: React.ReactNode }): JSX.Element`

行为：用 `ReactFlowProvider` 包裹 children。

算法实现：
1. 接收 children。
2. 返回 `<ReactFlowProvider>{children}</ReactFlowProvider>`。

副作用：创建 ReactFlow 上下文。

失败行为：无显式失败处理。

调用关系：Called by `RootLayout`；Calls `ReactFlowProvider`。

### `WorkspaceLayout(): JSX.Element`

行为：渲染工作区三栏布局。

算法实现：
1. 创建满屏 flex 容器。
2. 渲染 `LeftSidebar`。
3. 渲染中间列，包含硬编码 header 和 `GraphPage`。
4. 渲染 `RightSidebar`。

副作用：无直接 I/O；组合 UI 组件。

失败行为：无显式失败处理，子组件异常依赖上层 ErrorBoundary。

调用关系：Called by `Home`；Calls `LeftSidebar`、`GraphPage`、`RightSidebar`。

### `safeNumber(value: any, defaultValue: number = 0): number`

行为：将任意输入转成有限 number，否则返回默认值。

算法实现：
1. 调用 `Number(value)` 得到 `num`。
2. 判断 `typeof num === 'number'`、非 `NaN`、有限值。
3. 通过校验则返回 `num`，否则返回 `defaultValue`。

副作用：无。

失败行为：不抛异常，所有非法值降级为默认值。

调用关系：Called by `convertToRelativePosition`、`convertToAbsolutePosition`、`projectNodesToReactFlowNodes` 和其 viewport culling helper。

### `sortNodesByNestingLevel(nodes: (Node | Group)[]): (Node | Group)[]`

行为：按节点嵌套深度排序，保证父节点在子节点之前，满足 ReactFlow parentId 渲染要求。

算法实现：
1. 遍历 `nodes` 构建 `nodeMap: Map<id, node>`。
2. 创建 `depthCache: Map<id, depth>`。
3. 定义递归 `getDepth(nodeId)`：若缓存存在直接返回。
4. 若节点不存在或无 `groupId`，深度记为 0。
5. 若存在父组，深度为 `1 + getDepth(groupId)` 并写入缓存。
6. 若递归中再次遇到 visiting 中的节点，说明 groupId 成环，将该节点深度降级为 0。
7. 复制 nodes 数组并按 `getDepth(a.id) - getDepth(b.id)` 排序。

副作用：无外部副作用。

失败行为：若出现循环 groupId，按 0 深度降级，不抛异常，避免递归爆栈。

调用关系：Called by `projectNodesToReactFlowNodes`。

### `resolveReactFlowLodMode(zoom: number): ReactFlowLodMode`

行为：根据 ReactFlow zoom 解析当前节点展示层级。

算法实现：
1. 若 `zoom >= 0.85`，返回 `full`。
2. 若 `zoom >= 0.45`，返回 `compact`。
3. 若 `zoom >= 0.2`，返回 `outline`。
4. 其他情况返回 `dot`。

副作用：无。

失败行为：不抛异常；调用方应传入有效 zoom，非法 zoom 会按比较结果落到 `dot`。

调用关系：Called by `GraphPageContent` and `test-react-flow-adapter.mjs`。

### `resolveReactFlowNodeDisplaySize(node: LegacyGraphNode, lodMode: ReactFlowLodMode, safeNumberImpl = safeNumber): { width: number; height: number }`

行为：根据节点真实尺寸和 LOD 模式返回 ReactFlow 当前应使用的显示尺寸。

算法实现：
1. 读取节点真实尺寸；普通节点默认 `350x280`，Group/Domain 默认 `300x200`。
2. 若节点是 Group/Domain，直接返回真实尺寸，避免容器未聚合前缩小外框导致子节点穿出。
3. 若 `lodMode === full`，直接返回真实尺寸。
4. 从 `ontologyNodeViewTokens.lodDisplayDimensions` 读取 compact/outline/dot 目标显示尺寸。
5. 返回 `Math.min(真实尺寸, 配置显示尺寸)`，避免小节点被 LOD 放大。

副作用：无。

失败行为：非法数字通过 `safeNumberImpl` 降级为默认尺寸；缺失 LOD 配置时返回真实尺寸。

调用关系：Called by `projectNodesToReactFlowNodes`、`resolveReactFlowNodePersistedPosition` and `test-react-flow-adapter.mjs`。

### `resolveReactFlowNodePersistedPosition(node: LegacyGraphNode, lodMode: ReactFlowLodMode, displayPosition: { x: number; y: number }, safeNumberImpl = safeNumber): { x: number; y: number }`

行为：把 LOD 缩小后居中显示的 ReactFlow position 反算成应写回本体 view 的真实节点 position。

算法实现：
1. 读取节点真实尺寸。
2. 调用 `resolveReactFlowNodeDisplaySize()` 读取当前 LOD 显示尺寸。
3. 计算居中偏移：`(真实宽高 - 显示宽高) / 2`。
4. 从 ReactFlow display position 中减去居中偏移。
5. 返回与输入 display position 同一坐标系下的真实 position；子节点输入是父级相对坐标，返回也保持父级相对坐标。

副作用：无。

失败行为：非法数字通过 `safeNumberImpl` 降级；Group/Domain 因显示尺寸等于真实尺寸，返回原 position。

调用关系：Called by `GraphPageContent.onNodeDragStop` and `test-react-flow-adapter.mjs`; Calls `resolveReactFlowNodeDisplaySize`。

### `hasCollapsedAncestor(node: LegacyGraphNode, nodeById: Map<string, LegacyGraphNode>): boolean`

行为：判断某个节点的父级链路中是否存在已折叠 Group/Domain，用于容器折叠后阻止内部后代继续进入 ReactFlow 渲染树。

算法实现：
1. 从 `node.groupId` 开始向上读取父级 id。
2. 用 `visited` 记录已访问父级，避免损坏数据形成循环时无限遍历。
3. 若父级节点不存在，返回 `false`，不把孤立节点误判为折叠后代。
4. 若父级是 `BlockEnum.GROUP` 且 `collapsed === true`，返回 `true`。
5. 继续沿父级的 `groupId` 向上查找，直到链路结束或命中循环。
6. 未找到折叠祖先时返回 `false`。

副作用：无。

失败行为：父级缺失或循环时不抛异常；父级缺失按未隐藏处理，循环通过 `visited` 截断。

调用关系：Called by `resolveRenderableNodeIds` and `resolveVisibleNodeIds`。

### `resolveRenderableNodeIds(nodes: readonly LegacyGraphNode[], nodeById = createGraphNodeLookup(nodes)): Set<string>`

行为：返回当前应该进入 ReactFlow 投影的节点 id 集合；折叠容器自身保留，位于折叠容器内部的所有后代节点被排除。

算法实现：
1. 接收旧 graph runtime nodes 和可选 `nodeById` lookup。
2. 遍历每个节点，调用 `hasCollapsedAncestor(node, nodeById)`。
3. 过滤掉存在折叠祖先的节点。
4. 将剩余节点 id 放入 `Set<string>`。
5. 返回可渲染 id 集合，供 node projection 和 edge projection 共用。

副作用：无。

失败行为：父子链路损坏时沿用 `hasCollapsedAncestor()` 的降级行为；不会修改输入 nodes。

调用关系：Called by `resolveVisibleNodeIds`、`projectEdgesToReactFlowEdges` and `test-react-flow-adapter.mjs`; Calls `hasCollapsedAncestor`。

### `projectNodesToReactFlowNodes(nodes, options, convertToRelativePositionImpl, safeNumberImpl): ReactFlowNode[]`

行为：把旧 graph runtime 节点投影为 ReactFlow nodes，并在大图场景支持视口裁剪、容器折叠隐藏后代、LOD 标记和普通节点 LOD 显示尺寸缩小。

算法实现：
1. 调用 `createGraphNodeLookup(nodes)` 构建 `nodesMap`。
2. 调用 `sortNodesByNestingLevel()` 确保父节点先于子节点。
3. 调用 `resolveVisibleNodeIds()` 解析最终可投影 id；未启用视口裁剪时使用 `resolveRenderableNodeIds()`，启用裁剪时先计算视口内节点和祖先，再排除折叠祖先隐藏的后代。
4. visible node ids 包含视口内节点、当前选中节点，以及这些节点的所有父级 group/domain；但处于折叠容器内部的后代不会因为选中或边关系被重新带回。
5. 遍历排序后的节点，跳过不在 visible node ids 内的节点。
6. 调用 `resolveReactFlowNodeDisplaySize()` 得到 ReactFlow style 尺寸；普通节点会在 compact/outline/dot 下缩小，Group/Domain 保持真实尺寸。
7. 将缩小后的普通节点显示位置居中到真实 bounds 上，避免远景点位从原左上角漂移。
8. 对 Group：用 `nodesMap` 查父组，计算相对/绝对 display position，设置 ReactFlow `type='group'`、`parentId`、`extent`、style、data。
9. 对普通 Node：用 `nodesMap` 查父组，计算 display position，设置 ReactFlow `type='custom'`、`parentId`、style、data。
10. 在 node `data` 中注入 `lodMode`，供 UI 按 full/compact/outline/dot 降级渲染。
11. 返回新建的 ReactFlowNode 数组。

副作用：无 I/O；但每次调用都会创建新对象数组，后续仍需要 adapter cache。

失败行为：非法数字通过 `safeNumberImpl` 降级；`sortNodesByNestingLevel()` 对循环 groupId 做 0 深度降级，避免递归爆栈。

调用关系：Called by `GraphPageContent` nodes projection memo and `test-react-flow-adapter.mjs`; Calls `createGraphNodeLookup`、`sortNodesByNestingLevel`、`convertToRelativePositionImpl`、`safeNumberImpl`。

### `projectEdgesToReactFlowEdges(edges, nodes, options): ReactFlowEdge[]`

行为：把旧 graph runtime 边投影为 ReactFlow edges，并按结构化 edge visibility、visible node ids 和折叠容器可渲染端点过滤。

算法实现：
1. 读取 `options.nodeById`；不存在时调用 `createGraphNodeLookup(nodes)`。
2. 若传入 `options.visibleNodeIds` 则使用该集合；否则调用 `resolveRenderableNodeIds(nodes, nodeById)`，把折叠容器后代和缺失端点排除在可渲染集合外。
3. 遍历 `edges`，用 `isEdgeVisible(edge.id, edgeVisibility)` 过滤。
4. 继续过滤掉 source 或 target 不在可见 / 可渲染节点集合中的边。
5. 对可见 edge，用 `nodeById.get(edge.source/target)` O(1) 查 source/target node。
6. 若 source/target 都有不同 `groupId`，设置 ReactFlow edge type 为 `crossGroup`；否则为 `default`。
7. 设置 `selected` 与 `zIndex: 1000`。
8. 返回新建的 ReactFlowEdge 数组。

副作用：无 I/O；每次调用创建新数组和 edge 对象。

失败行为：缺失 source/target node 时默认不会进入可渲染集合，因此相关 edge 不投影；edge visibility 缺省时视为全可见。

调用关系：Called by `GraphPageContent` edge projection memo and `test-react-flow-adapter.mjs`; Calls `isEdgeVisible`、`createGraphNodeLookup`、`resolveRenderableNodeIds`。

### `LayoutManager.applyLayout(nodes: (Node | Group)[], edges: Edge[], options?: LayoutOptions): Promise<LayoutResult>`

行为：串行化布局请求，若已有布局操作则先标记取消，再执行新的布局计算。

算法实现：
1. 判断 `this.currentOperation` 是否存在。
2. 若存在，输出 warn 并调用 `cancelCurrentOperation()` 设置取消标志。
3. 将 `isOperationCancelled` 重置为 false。
4. 调用私有 `executeLayout(nodes, edges, options)`，把 Promise 保存到 `currentOperation`。
5. 等待 Promise 完成并返回结果。
6. 在 finally 中清空 `currentOperation`。

副作用：写 console.warn；修改实例字段 `currentOperation/isOperationCancelled`；间接触发布局策略计算。

失败行为：自身不 catch，失败由 `executeLayout()` 捕获并包装为 `success:false` 的 `LayoutResult`。

调用关系：Called by `LayoutControl` 等布局触发方；Calls `executeLayout`、`cancelCurrentOperation`。

### `LayoutManager.executeLayout(nodes: (Node | Group)[], edges: Edge[], options?: LayoutOptions): Promise<LayoutResult>`

行为：选择布局策略，执行策略布局并统一补充耗时统计。

算法实现：
1. 若 `isOperationCancelled` 为 true，直接返回 cancelled 结果。
2. 用 `performance.now()` 记录开始时间。
3. 调用 `selectStrategy(options)` 获取 strategy id。
4. 从 `strategies` map 获取策略，不存在则抛 `Error("Unknown layout strategy")`。
5. 调用 `strategy.applyLayout(nodes, edges, options)` 执行具体布局。
6. 计算总耗时并写入 `result.stats.duration`。
7. 返回策略结果。
8. catch 中把异常消息包装进 `errors`，返回空 nodes/edges map。

副作用：写 console.log；读取 `performance.now()`；调用具体策略可能动态导入 ELK。

失败行为：未知策略、ELK 加载失败、转换失败等异常会被 catch，返回 `success:false`，不向外抛出。

调用关系：Called by `applyLayout`；Calls `selectStrategy`、`ILayoutStrategy.applyLayout`。

### `ELKLayoutStrategy.applyLayout(nodes: (Node | Group)[], edges: Edge[], options?: LayoutOptions): Promise<LayoutResult>`

行为：把旧图数据转换成 ELK 图，执行 ELK 布局并返回节点位置。

算法实现：
1. 记录开始时间并输出节点/边数量日志。
2. 调用 `getELK()`，若尚未创建 engine，则通过 `ELKRuntime.createELKEngine()` 动态 import elkjs 并缓存 Promise。
3. 调用 `ELKGraphConverter.toELKGraph(nodes, edges, options)` 生成 ELK 输入图。
4. 调用 `elk.layout(elkGraph)` 执行布局。
5. 调用 `ELKGraphConverter.fromELKLayout(elkLayout)` 提取节点位置 map。
6. 计算总耗时，返回 `success:true`、节点位置、空边 map、stats。
7. catch 中返回 `success:false`、空 map 和错误消息。

副作用：首次真正布局时动态导入 ELK；执行过程写多条 console；占用主线程/worker 取决于 elkjs 实现。

失败行为：ELK 动态导入失败会抛 `Error("Failed to load ELK library...")`；布局执行异常被 catch 并转换为 `LayoutResult.errors`。

调用关系：Called by `LayoutManager.executeLayout`；Calls `getELK`、`ELKGraphConverter.toELKGraph`、`elk.layout`、`ELKGraphConverter.fromELKLayout`。

### `EdgeOptimizer.optimizeBatch(nodes: (Node | Group)[], edges: Edge[], affectedNodeIds?: Set<string>): OptimizedEdge[]`

行为：按受影响节点优化相关边 handle，超过阈值时退回全量优化。

算法实现：
1. 若 `EDGE_OPTIMIZATION_CONFIG.ENABLED` 为 false，直接返回原始 edges。
2. 若传入 `affectedNodeIds`，过滤 source/target 命中的边；否则所有边都待优化。
3. 若待优化边数量超过 `PERFORMANCE.BATCH_THRESHOLD`，调用 `optimizeEdgeHandles(nodes, edges)` 全量优化。
4. 构建 `nodeMap`，key 为 node id。
5. 遍历待优化边，查 source/target 节点。
6. source/target 均存在时调用 `calculateBestHandles()`，把结果写入 `optimizedEdgeMap`。
7. source/target 缺失时保留原边。
8. 最后遍历原 edges，命中优化 map 则替换，否则保留原对象。

副作用：无 I/O；会创建 Map 和新 edge 对象。

失败行为：缺失节点时静默保留原边；配置阈值导致大批量场景回退全量计算。

调用关系：Called by graph edge sync/布局后处理候选；Calls `calculateBestHandles`、`optimizeEdgeHandles`。

### `EdgeOptimizer.calculateBestHandles(sourceNode: Node | Group, targetNode: Node | Group): { sourceHandle: HandlePosition; targetHandle: HandlePosition }`

行为：根据两个节点中心点的方向角选择源节点和目标节点的连接边。

算法实现：
1. 从 source/target 的 `position`、`width`、`height` 计算节点矩形。
2. 调用 `GeometryUtils.getCenter()` 获取中心点。
3. 用 `Math.atan2()` 计算 source center 指向 target center 的角度。
4. 调用 `normalizeAngle()` 将角度规整到 `[-Math.PI, Math.PI]`。
5. 根据 `EDGE_OPTIMIZATION_CONFIG.ANGLE_THRESHOLDS.QUADRANT` 判断目标位于右/下/上/左哪个象限。
6. 目标在右侧时 sourceHandle=right、targetHandle=left；下方时 bottom/top；上方时 top/bottom；左侧时 left/right。
7. 返回 handle 组合。

副作用：无。

失败行为：节点缺少 width/height 时使用 `LAYOUT_CONFIG.nodeSize.defaultNode`；节点 position 缺失会在访问属性时抛运行时异常。

调用关系：Called by `optimizeEdgeHandles`、`optimizeSingleEdge`、`optimizeBatch`；Calls `GeometryUtils.getCenter`、`normalizeAngle`。

### `ELKGroupLayoutStrategy.applyLayout(nodes: (Node | Group)[], edges: Edge[], options?: LayoutOptions): Promise<LayoutResult>`

行为：对指定 group 的内部子图运行 ELK 布局，并返回子节点绝对坐标和可能的 group 尺寸更新。

算法实现：
1. 记录开始时间。
2. 调用 `getELK()`，首次执行时通过 `ELKRuntime.createELKEngine()` 动态 import elkjs 并缓存 Promise。
3. 从 `options.groupId` 读取目标 group id；缺失则抛错。
4. 在 `nodes` 中查找目标节点，并要求 `type === BlockEnum.GROUP`。
5. 调用 `extractSubgraph(nodes, edges, targetGroupId)` 收集后代节点、目标 group 自身和内部边。
6. 若子图无内部节点，返回空成功结果。
7. 调用 `createSubgraph(targetGroup, subgraphNodes, subgraphEdges, options)` 构造 ELK 输入。
8. 调用 `elk.layout(elkGraph)` 执行布局。
9. 调用 `extractLayoutResults(elkLayout, targetGroup)` 把 ELK 相对坐标转成画布绝对坐标。
10. 调用 `findTargetGroupLayoutResult()` 捕获目标 group 自身尺寸并写入结果。
11. 返回 `success:true`、node position map 和 stats。
12. catch 中返回 `success:false`、错误消息和空结果。

副作用：首次真正布局时动态导入 ELK；大量 console 输出；读取 `performance.now()`。

失败行为：缺少 groupId、目标不是 group、ELK layout 异常时返回 `success:false`；循环 groupId 可能在 `getDescendants()` 中无限递归。

调用关系：Called by `LayoutManager.executeLayout`；Calls `getELK`、`extractSubgraph`、`createSubgraph`、`elk.layout`、`extractLayoutResults`、`findTargetGroupLayoutResult`。

### `ELKGraphConverter.toELKGraph(nodes: (Node | Group)[], edges: Edge[], options?: LayoutOptions): ElkNode`

行为：把项目旧图模型转换成 ELK 根图。

算法实现：
1. 输出转换开始日志。
2. 过滤出没有 `groupId` 的顶层节点。
3. 创建根节点 `id='root'`。
4. 调用 `getDefaultLayoutOptions(options)` 生成根布局配置。
5. 调用 `buildChildren(topLevelNodes, nodes)` 递归构造 ELK children。
6. 调用 `convertEdges(edges)` 转换边 source/target。
7. 调用 `countNodes(elkGraph)` 统计节点数量并输出日志。
8. 返回 ELK 根图。

副作用：写 console；无外部 I/O。

失败行为：无 try/catch；非法节点尺寸通过默认尺寸兜底；循环 groupId 不会在该函数中显式检测。

调用关系：Called by `ELKLayoutStrategy.applyLayout` 和 `test-elk-layout-model.mjs`；Calls `getDefaultLayoutOptions`、`buildChildren`、`convertEdges`、`countNodes`。

### `ELKGraphConverter.fromELKLayout(elkLayout: ElkNode): Map<string, LayoutNodePosition>`

行为：递归提取 ELK layout 返回的节点位置和尺寸。

算法实现：
1. 创建结果 map。
2. 调用 `extractPositions(elkLayout, result, 0, 0)`。
3. `extractPositions()` 遇到 root 时跳过 root 自身，递归处理 root children。
4. 对普通节点计算 `absoluteX = parentX + (elkNode.x || 0)`，`absoluteY = parentY + (elkNode.y || 0)`。
5. 将 x/y 和可选 width/height 写入结果 map。
6. 若存在 children，继续用当前 absoluteX/Y 作为父坐标递归。
7. 返回结果 map。

副作用：写 console；无外部 I/O。

失败行为：ELK 返回缺失 x/y 时使用 0；缺失 children 时自然结束。

调用关系：Called by `ELKLayoutStrategy.applyLayout` 和 `test-elk-layout-model.mjs`；Calls `extractPositions`。

### `ELKConfigBuilder.getAutoConfig(nodeCount: number, hasNesting: boolean, isDirected: boolean = true): ELKLayoutOptions`

行为：根据节点数量和有向性选择布局配置。

算法实现：
1. 若 `nodeCount < 20`，返回 compact config。
2. 若 `nodeCount > 100`，返回 spacious config。
3. 若 `isDirected` 为 true，返回 DOWN layered config。
4. 否则返回 force config。

副作用：无。

失败行为：不校验 nodeCount 合法性；`hasNesting` 参数当前未参与分支判断。

调用关系：Called by潜在布局策略/控制层；Calls `getCompactConfig`、`getSpacingConfig`、`getLayeredConfig`、`getForceConfig`。

### `ELKConfigBuilder.mergeConfig(baseConfig: ELKLayoutOptions, userConfig?: ELKLayoutOptions): ELKLayoutOptions`

行为：把用户提供的 ELK 配置覆盖到基础配置上，保持原先“用户配置优先”的语义。

算法实现：
1. 接收基础配置对象。
2. 若 `userConfig` 存在，则将其属性展开到基础配置之后。
3. 返回新对象，不原地修改 `baseConfig`。

副作用：无。

失败行为：不做 key 白名单校验；非法但类型允许的 ELK key 会继续传给 ELK 执行阶段。

调用关系：Called by `ELKGraphConverter.getDefaultLayoutOptions` 和 `test-elk-layout-model.mjs`。

### `createELKEngine(): Promise<ELKEngine>`

行为：动态加载 `elkjs/lib/elk.bundled.js`，解析不同打包形态下的 constructor，并创建 ELK engine。

算法实现：
1. `await import('elkjs/lib/elk.bundled.js')` 获取动态模块。
2. 调用 `resolveELKConstructor()`：先读一层 `default`，若该值还带 `default` 再读内层，兼容 CJS/ESM/Turbopack 包装形态。
3. 若没有 default 包装，则使用模块自身作为候选。
4. 校验候选值必须是 function，否则抛 `Error("Invalid ELK module shape")`。
5. 用解析出的 constructor 创建并返回 ELK engine。

副作用：动态加载第三方 elkjs 包；创建 ELK engine 实例。

失败行为：模块形状不符合预期时抛 `Invalid ELK module shape`；import 失败会向调用方传播，并由 strategy 包装为布局失败。

调用关系：Called by `ELKLayoutStrategy.getELK`、`ELKGroupLayoutStrategy.getELK`。

### `NestingTreeBuilder.calculateDepth(nodeId: string, visited: Set<string> = new Set()): number`

行为：递归计算指定节点的嵌套深度。

算法实现：
1. 若 `depthCache` 已有 nodeId，直接返回缓存深度。
2. 若 `visited` 已包含 nodeId，说明出现循环；根据 `NESTING_CONFIG.ENABLE_CIRCULAR_CHECK` 决定抛错或 warn 后返回 0。
3. 从 `nodeMap` 获取节点；不存在则 warn 并返回 0。
4. 若节点没有 `groupId`，缓存并返回深度 0。
5. 复制 visited，加入当前 nodeId。
6. 递归计算父 group 深度。
7. 当前深度 = 父深度 + 1。
8. 若超过 `NESTING_CONFIG.MAX_DEPTH`，warn 并缓存最大深度。
9. 缓存并返回深度。

副作用：写 `depthCache`；可能写 console.warn；循环检查开启时抛 Error。

失败行为：循环时按配置抛错或返回 0；节点不存在返回 0；超过最大深度截断。

调用关系：Called by `groupNodesByDepth`、`buildTree`、自身递归。

### `NestingTreeBuilder.buildTree(nodes: (Node | Group)[]): NestingTreeNode[]`

行为：基于 groupId 构建包含深度、parentId、children 的树节点列表。

算法实现：
1. 用 nodes 重建 `nodeMap` 并清空 `depthCache`。
2. 创建 `treeNodes` 数组和 `treeNodeMap`。
3. 第一遍遍历 nodes：调用 `calculateDepth(node.id)` 得到深度。
4. 根据 `node.type === BlockEnum.GROUP` 判断 isGroup。
5. 构造 `NestingTreeNode` 并写入 map 与数组。
6. 第二遍遍历 treeNodes：若存在 parentId，找到父 tree node 并 push 到其 children。
7. 返回全部 treeNodes。

副作用：重置实例缓存和 nodeMap。

失败行为：`calculateDepth()` 可能抛循环错误；孤儿 parentId 会被静默忽略。

调用关系：Called by布局/嵌套分析候选；Calls `calculateDepth`。

### `GeometryUtils.getEnclosingBounds(nodes: (Node | Group)[]): { minX: number; minY: number; maxX: number; maxY: number }`

行为：计算一组节点的包围盒。

算法实现：
1. 若 nodes 为空，返回全 0 边界。
2. 初始化 minX/minY 为 Infinity，maxX/maxY 为 -Infinity。
3. 遍历 nodes，调用 `getBounds(node)` 获取每个节点边界。
4. 用 Math.min/Math.max 累积最小和最大边界。
5. 返回最终边界对象。

副作用：无。

失败行为：节点 position 缺失时 `getBounds()` 会运行时出错；width/height 缺失时使用硬编码默认值。

调用关系：Calls `getBounds`。

### `calculateZIndex(nestingDepth: number, isGroup: boolean, isSelected: boolean = false): number`

行为：根据嵌套深度、节点类型和选中状态计算 z-index。

算法实现：
1. 若 isGroup 为 true，使用 `Z_INDEX_CONFIG.BASE_GROUP`，否则使用 `BASE_NODE`。
2. 嵌套增量 = `nestingDepth * Z_INDEX_CONFIG.NESTING_INCREMENT`。
3. 选中增量 = `isSelected ? SELECTED_BOOST : 0`。
4. 返回三者之和。

副作用：无。

失败行为：不校验 nestingDepth；负数会降低 z-index。

调用关系：Called by graph view / node sync 候选。

### Mermaid import functions

状态：已删除。

原函数范围：`MermaidParser.parse()`、`MermaidParser.parseLine()`、`MermaidConverter.convert()`、`MermaidConverterService.convertAndImport()` 以及相关 UI/hook/backend converter 函数。

删除原因：Mermaid 导入是临时能力，不再作为 Ontology Canvas 的主线导入协议维护。

后续方向：如果需要导入，应先定义本体导入契约，例如 `OntologyImportDraft`、schema version、class/relation/domain/subgraph 映射规则、校验 warning 和事务式 apply command，再决定是否支持 Mermaid、RDF/OWL、JSON Schema 或专用 DSL 作为输入源。

### `workspace/load GET(request: NextRequest): Promise<NextResponse>`

行为：读取 workspace JSON 文件并返回校验后的 storage data。

算法实现：
1. 从 query string 读取 `key`，默认 `kg-editor:workspace.json`。
2. 用 `getProjectRoot()/public/workspace/key` 构造文件路径。
3. 调用 `fs.access(filePath)` 检查存在。
4. 不存在时返回 404 `{ error:'文件不存在' }`。
5. 调用 `fs.readFile(filePath, 'utf-8')`。
6. `JSON.parse(content)`。
7. `StorageDataSchema.parse(parsed)` 校验和转换日期。
8. 返回校验数据，状态 200。
9. catch 中返回 500 和错误 details。

副作用：读取本地文件；写 console.error。

失败行为：文件不存在返回 404；JSON parse/Zod 校验/FS 异常返回 500。

调用关系：Called by `FileSystemAdapter.load` and direct fetch callers；Calls `getProjectRoot`、`fs.access`、`fs.readFile`、`StorageDataSchema.parse`。

### `workspace/save POST(request: NextRequest): Promise<NextResponse>`

行为：保存 workspace storage data 到本地 JSON 文件。

算法实现：
1. 调用 `request.json()` 读取 body。
2. 检查 `body.data` 是否存在；缺失返回 400。
3. 读取 `body.key`，默认 `kg-editor:workspace.json`。
4. 用 `StorageDataSchema.safeParse(body.data)` 校验。
5. 校验失败返回 400 和格式化错误。
6. 创建 `public/workspace` 目录。
7. 构造 `filePath = dirPath/key`。
8. `JSON.stringify(validatedData, dateReplacer, 2)` 序列化。
9. `fs.writeFile(filePath, serializedData, 'utf-8')`。
10. 返回 `{ success:true }`。
11. catch 中返回 500 和错误 details。

副作用：读取 request body；写本地文件；创建目录；写大量 console。

失败行为：缺 data/校验失败返回 400；FS 或未知异常返回 500。

调用关系：Called by `FileSystemAdapter.save`、`persistenceMiddleware`、`canvasSync`、`persistWorkspace`。

### `layout POST(request: NextRequest): Promise<NextResponse>`

行为：通过 API 执行布局并返回节点位置。

算法实现：
1. 读取 request JSON 中的 `nodes`、`edges`、`strategy`、`options`。
2. 校验 nodes/edges 是数组，否则返回 400。
3. 记录开始时间。
4. 调用模块级 `layoutManager.applyLayout(nodes, edges, { strategy, ...options })`。
5. 若成功，将 `result.nodes: Map` 转为普通 positions object。
6. 返回 `{ success:true, positions, stats }`。
7. 若布局失败，返回 500 和 `result.errors/stats`。
8. catch 中返回 500 和内部错误消息。

副作用：模块加载时已实例化 LayoutManager；请求时可能执行 ELK 布局；写 console.error。

失败行为：输入非法返回 400；布局失败或异常返回 500。

调用关系：Called by potential frontend layout API clients；Calls `LayoutManager.applyLayout`。

### `StorageManager.saveWorkspace(workspace: Workspace): Promise<void>`

行为：构造 storage data 并通过 adapter 保存完整 workspace。

算法实现：
1. 构造 `{ version: STORAGE_VERSION, workspace, timestamp: new Date() }`。
2. 调用 `this.adapter.save(STORAGE_KEYS.WORKSPACE, storageData)`。
3. catch 中 console.error 并重新抛出异常。

副作用：调用 adapter 写入；写 console.error。

失败行为：adapter.save 失败时重新抛出。

调用关系：Called by `saveCanvas`、`deleteCanvas` and potential app data-layer；Calls `adapter.save`。

### `FileSystemAdapter.save(key: string, data: unknown): Promise<void>`

行为：通过 `/api/workspace/save` 保存数据。

算法实现：
1. 调用私有 `serialize(data)`，把 Date 转 ISO string。
2. `JSON.parse(serialized)` 得到普通对象。
3. POST `${basePath}/save`，body 为 `{ key, data }`。
4. 若 response 非 ok，尝试读取 error JSON 并抛 Error。
5. catch 中 console.error 后重新抛出。

副作用：HTTP POST；JSON 序列化/反序列化；写 console.error。

失败行为：非 ok 或 fetch 异常抛 Error。

调用关系：Called by `StorageManager.saveWorkspace` and saveToFile；Calls `fetch`、`serialize`。

### `persistenceMiddlewareImpl<T>(f, options?): StateCreator<T, [], []>`

行为：包装 Zustand store，在任意 store 变化后防抖保存 workspace。

算法实现：
1. 读取 `options.debounceMs`，默认 500ms。
2. 定义异步 `saveToWorkspace()`。
3. `saveToWorkspace()` 动态导入 `saveCurrentCanvasData()`，先把当前 `OntologyDocumentState` 写回 workspace canvas 的 `ontologyDocument`，并投影旧 display `graphData`。
4. 动态导入 `persistWorkspace()`，由 repository 保存 workspace JSON。
5. 如果 `persistWorkspace()` 返回 false，则 console.error；否则 console.log 自动保存成功。
6. 创建 `debouncedSave = debounce(saveToWorkspace, debounceMs)`。
7. 调用 `store.subscribe(() => debouncedSave())` 订阅整个 store。
8. 返回原始 state creator `f(set, get, store)`。

副作用：订阅 Zustand store；写 workspace store；通过 repository 间接 HTTP POST workspace API；写 console。

失败行为：所有异常被 catch 并 console.error，不向调用方传播。

调用关系：Called by `useGraphStore` creation；Calls `saveCurrentCanvasData`、`persistWorkspace`。

### `createPersistedOntologyCanvas(document: OntologyDocumentState, savedAt = new Date()): PersistedOntologyCanvas`

行为：把运行时本体文档打包为可保存 JSON 快照。

算法实现：
1. 读取 document 的 `graph`、`view` 和 `revision`。
2. 写入 `persistenceVersion: 1`。
3. 将 `savedAt` 转成 ISO 字符串。
4. 返回 `PersistedOntologyCanvas`。

副作用：无。

失败行为：不主动校验 graph/view；调用方可用 `PersistedOntologyCanvasSchema` 做 runtime 验证。

调用关系：Called by `saveCurrentCanvasData` and workspace repository tests。

### `restoreOntologyDocumentFromPersistedCanvas(snapshot: PersistedOntologyCanvas, fallback): OntologyDocumentState`

行为：从持久化本体快照恢复运行时 document。

算法实现：
1. 优先读取 snapshot.graph 的 id/name；缺失时用 fallback id/name。
2. 将 snapshot.graph 复制为运行时 graph。
3. 将 snapshot.view 的 node/domain/edge views、viewport、lod、edgeVisibility 作为 view 输入。
4. 调用 `createOntologyDocumentState()` 补齐 graph 中缺失的 view records。
5. 保留 snapshot.revision。

副作用：无。

失败行为：假定 snapshot 已经过 schema 验证；异常会由下游对象访问或 document 创建抛出。

调用关系：Called by `createDocumentFromCanvas` and workspace repository tests。

### `saveCurrentCanvasData(): void`

行为：将当前本体文档保存回 workspace store 当前 canvas，并同步旧 graphData 显示缓存。

算法实现：
1. 读取 workspace store 的 `currentCanvasId` 和 canvases。
2. 在 canvases 中查找当前 canvas；不存在则 warn 并返回。
3. 读取 `ontologyDocumentStore`；如果已 hydrate 且来源 canvas 匹配，则使用当前 document。
4. 如果没有匹配的 hydrate document，则调用 `createDocumentFromCanvas(currentCanvas)`：优先恢复 `canvas.ontologyDocument`，否则从旧 `graphData` 迁移。
5. 调用 `createPersistedOntologyCanvas(document)` 生成 `ontologyDocument`。
6. 调用 ReactFlow/legacy projection，把 document 投影为旧 `graphData.nodes/edges`。
7. 调用 `saveOntologyCanvas(currentCanvas, persistedSnapshot)` 更新 ontologyDocument、viewportState、updatedAt。
8. map canvases 替换当前 canvas。
9. 调用 `workspaceStore.initializeWorkspace(updatedCanvases, canvasTree, currentCanvasId)`。

副作用：写 workspace store；可能写 console.warn。

失败行为：当前 canvas 不存在时 warn 并提前返回；其他异常未捕获。

调用关系：Called by `persistenceMiddlewareImpl.saveToWorkspace`、`switchToCanvas`。

### `getActiveOntologyDocument(input: { canvasId: string; fallbackName?: string }): OntologyDocumentState`

行为：为组件和 hooks 提供统一的当前 document 兜底来源，避免组件层散落旧 graphData 迁移逻辑。

算法实现：
1. 读取 `ontologyDocumentStore`。
2. 如果已 hydrate 且 `sourceCanvasId` 等于 input.canvasId，直接返回 store document。
3. 否则读取 workspace store，查找同 id canvas。
4. 若找到 canvas，则调用 `createDocumentFromCanvas(canvas)`，优先恢复 `ontologyDocument`。
5. 若 workspace 也没有 canvas，则读取旧 graph store nodes/edges/viewport，并调用 `createOntologyDocumentFromLegacyGraph()` 作为最终降级。

副作用：读取 Zustand store；不写 store、不发请求。

失败行为：输入 canvas 不存在时仍可从旧 graph store 迁移；迁移异常会向调用方传播。

调用关系：Called by `GraphPageContent`、`useNodeHandling`、`useEdgeHandling`、`CustomEdge`、`EdgeEditor`。

### `loadCanvasData(canvasId: string): void`

行为：把目标 canvas 的本体文档加载进 `ontologyDocumentStore`，并投影旧 graph store 显示对象。

算法实现：
1. 读取 workspace store。
2. 按 `canvasId` 查找目标 canvas。
3. 不存在则 console.error 并返回。
4. 调用 `createDocumentFromCanvas(targetCanvas)`：优先恢复 `ontologyDocument`，否则迁移旧 `graphData`。
5. 将 document 投影为旧 `graphData.nodes/edges`。
6. 调用 `useOntologyDocumentStore.replaceDocument(document, { canvasId, reason:'workspace-load' })`。
7. 调用 `useGraphStore.setState()` 替换旧显示 `nodes`、`edges`，清空 selectedNodeId/selectedEdgeId。

副作用：写 ontology document store；写 graph store；可能触发 graph store 持久化中间件。

失败行为：canvas 不存在时只 console.error，不抛异常。

调用关系：Called by `Home.initWorkspace`、`switchToCanvas`。

### `switchToCanvas(targetCanvasId: string): Promise<void>`

行为：切换当前 canvas。

算法实现：
1. 读取 workspace store 和 currentCanvasId。
2. 如果目标就是当前 canvas，直接返回。
3. 调用 `saveCurrentCanvasData()` 保存当前 canvas。
4. 调用 `workspaceStore.switchCanvas(targetCanvasId)` 切换 currentCanvasId。
5. 调用 `loadCanvasData(targetCanvasId)` 写入 graph store。
6. 调用 `persistWorkspace()`，由 repository 保存整个 workspace。
7. 捕获保存异常并 console.error。

副作用：写 workspace store；写 graph store；通过 repository 间接 HTTP POST workspace API；写 console.error。

失败行为：持久化异常被 catch，不传播；目标 canvas 不存在时 `loadCanvasData` 只报错，函数仍继续尝试持久化 workspace。

调用关系：Called by canvas tree UI（待精读）；Calls `saveCurrentCanvasData`、`workspaceStore.switchCanvas`、`loadCanvasData`、`persistWorkspace`。

### `persistWorkspace(): Promise<boolean>`

行为：保存当前 workspace store 快照。

算法实现：
1. 读取 `useWorkspaceStore.getState()`。
2. 构造 `Workspace` DTO：userId、currentCanvasId、canvases、canvasTree。
3. 调用 `saveWorkspace(workspaceDTO)`。
4. 成功时返回 true。
5. 异常时 console.error 并返回 false。

副作用：通过 workspace repository 保存 JSON；写 console.error。

失败行为：repository 异常被 catch 并转换为 false。

调用关系：Called by graph `persistenceMiddlewareImpl`、`switchToCanvas` and sidebar dialogs；Calls `saveWorkspace`。

### `loadWorkspaceStorage(options?): Promise<StorageData | null>`

行为：从 workspace API 加载并验证 storage data。

算法实现：
1. 解析 key，默认 `kg-editor:workspace.json`。
2. GET `/api/workspace/load?key=...`。
3. 若响应 404，返回 null。
4. 若响应非 ok，尝试读取错误 JSON 并抛 Error。
5. 对响应 JSON 调用 `StorageDataSchema.parse()`。
6. 在 repository 边界把 parse 结果视为 `StorageData` 返回。

副作用：HTTP GET workspace API。

失败行为：非 404 错误抛 Error；schema 解析失败抛 ZodError。

调用关系：Called by `Home.initWorkspace` and repository tests；Calls `fetch`、`StorageDataSchema.parse`。

### `saveWorkspaceStorage(data: StorageData, options?): Promise<boolean>`

行为：通过 workspace API 保存 storage data。

算法实现：
1. POST `/api/workspace/save`。
2. body 包含 `{ key, data }`，key 默认 `kg-editor:workspace.json`。
3. 响应非 ok 时读取错误 JSON 并抛 Error。
4. 成功返回 true。

副作用：HTTP POST workspace API。

失败行为：非 ok 或 fetch 异常抛 Error。

调用关系：Called by `saveWorkspace` and repository tests；Calls `fetch`。

### `edgeVisibility.ts` commands

签名：

```ts
createAllEdgeVisibility(): EdgeVisibility
createNoEdgeVisibility(): EdgeVisibility
createCustomEdgeVisibility<TEdge extends EdgeIdentity>(ids: readonly string[], edges?: readonly TEdge[]): EdgeVisibility
normalizeEdgeVisibility<TEdge extends EdgeIdentity>(visibility?: EdgeVisibility, edges?: readonly TEdge[]): EdgeVisibility
getVisibleEdgeIds<TEdge extends EdgeIdentity>(edges: readonly TEdge[], visibility?: EdgeVisibility): string[]
isEdgeVisible(edgeId: string, visibility?: EdgeVisibility): boolean
addEdgeToVisibility(visibility: EdgeVisibility | undefined, edgeId: string): EdgeVisibility
removeEdgeIdsFromVisibility(visibility: EdgeVisibility | undefined, edgeIds: Iterable<string>): EdgeVisibility
toggleEdgeInVisibility<TEdge extends EdgeIdentity>(edgeId: string, edges: readonly TEdge[], visibility?: EdgeVisibility): EdgeVisibility
```

算法实现：
1. `createAllEdgeVisibility()` / `createNoEdgeVisibility()` 返回无 ids 的 `all` 或 `none` 状态。
2. `createCustomEdgeVisibility()` 先对 ids 去重；如果传入 edges，则只保留仍存在的 edge id。
3. `normalizeEdgeVisibility()` 对空 visibility 降级为 `all`；对 custom 执行去重/过滤；对 all/none 清空 ids。
4. `getVisibleEdgeIds()` 根据 mode 派生 ids：all 返回所有 edge.id，none 返回空数组，custom 返回规范化后的 ids。
5. `isEdgeVisible()` 对单条边做轻量判断：无 visibility 或 all 为 true，none 为 false，custom 检查 ids。
6. `addEdgeToVisibility()` 只在 custom 模式把新 edge id 加入 ids；all/none 保持原语义。
7. `removeEdgeIdsFromVisibility()` 只在 custom 模式移除被删除的 edge ids；all/none 保持原语义。
8. `toggleEdgeInVisibility()` 先通过 `getVisibleEdgeIds()` 得到当前可见集合，再增删目标 id，最后返回 custom visibility。

副作用：无。纯函数，不写 store、不写 DOM、不发请求。

失败行为：无显式异常；传入未知 edge id 时，若提供 edges，会在 custom 创建阶段被过滤掉。

调用关系：Called by `createEdgesSlice`、`createBasicOperationsSlice.deleteNode`、`createGroupOperationsSlice.deleteGroup`、`GraphPageContent` edge filter；Calls none external。

### `graphConsistency.ts` commands

签名：

```ts
removeEdgesConnectedToNodes<TEdge extends EdgeConnection>(edges: readonly TEdge[], nodeIds: Iterable<string>): IncidentEdgeRemovalResult<TEdge>
removeEdgesConnectedToNodesWithVisibility<TEdge extends EdgeConnection>(edges: readonly TEdge[], nodeIds: Iterable<string>, visibility?: EdgeVisibility): IncidentEdgeRemovalWithVisibilityResult<TEdge>
```

算法实现：
1. `removeEdgesConnectedToNodes()` 把 nodeIds 转成 Set。
2. 遍历 edges；若 edge.source 或 edge.target 命中 Set，把 edge.id 放入 removedEdgeIds。
3. 未命中的 edge 原样放入 remainingEdges，保持 edge 对象引用和顺序。
4. 返回 `{ edges: remainingEdges, removedEdgeIds }`。
5. `removeEdgesConnectedToNodesWithVisibility()` 先调用 `removeEdgesConnectedToNodes()`。
6. 再调用 `removeEdgeIdsFromVisibility()` 清理 custom visibility 中已删除的 edge id。
7. 返回剩余 edges、removedEdgeIds 和新的结构化 `edgeVisibility`。

副作用：无。纯函数，不写 store、不写 history、不发请求。

失败行为：不存在的 node id 不会命中任何边；空 edges 返回空结果。

调用关系：Called by `deleteNode` / `deleteGroup`; Calls `removeEdgeIdsFromVisibility`。

### `createOntologyGraph(input: CreateOntologyGraphInput): OntologyGraph`

行为：创建本体图根对象，填充当前 schemaVersion 和缺省空 records。

算法实现：
1. 读取 `input.id` 和 `input.name` 作为图谱身份。
2. 将 `schemaVersion` 固定写为 `ONTOLOGY_SCHEMA_VERSION`。
3. 若 input 未提供 nodes/edges/domains/subgraphs，则分别使用空对象。
4. 原样保留可选 `metadata`。
5. 返回完整 `OntologyGraph`。

副作用：无，纯函数。

失败行为：不做输入校验；空 id/name 会由 `validateOntologyGraph()` 报告。

调用关系：Called by `mapLegacyGraphToOntologyGraph`; Calls none external。

### `createDomain(graph: OntologyGraph, input: CreateDomainInput): OntologyCommandResult`

行为：创建一个本体 Domain，并按需同步父 Domain 的 `domainIds`。

算法实现：
1. 若 `graph.domains[input.id]` 已存在，返回 `DOMAIN_ID_DUPLICATE` warning。
2. 若 name 为空，返回 `DOMAIN_NAME_EMPTY` warning。
3. 若 `parentDomainId === id`，返回 `DOMAIN_PARENT_SELF` warning。
4. 若输入 parentDomainId 不存在，返回 `DOMAIN_PARENT_MISSING` warning。
5. 构造 `OntologyDomain`，`nodeIds/domainIds` 默认为空数组，`collapsed` 默认 false。
6. 将新 Domain 写入 `graph.domains`。
7. 若存在 parentDomainId，调用 `addDomainToParent()` 把新 domain id 加入父 domain.domainIds。
8. 返回新 graph，`changed:true`。

副作用：无，纯函数。

失败行为：业务失败不抛异常，返回 `changed:false` 和 warning，不写入半个 Domain。

调用关系：Called by `createOntologyDomainInDocument` and `test-ontology-commands.mjs`; Calls `addDomainToParent`。

### `createClassNode(graph: OntologyGraph, input: CreateClassNodeInput): OntologyCommandResult`

行为：创建一个本体类图式节点，并按需同步 domain 和 subgraph membership。

算法实现：
1. 若 `graph.nodes[input.id]` 已存在，返回 `NODE_ID_DUPLICATE` warning，graph 不变。
2. 若 name 为空，返回 `NODE_NAME_EMPTY` warning。
3. 若输入 domainId/subgraphId 不存在，返回对应 missing warning。
4. 调用 `assertNoDuplicateFields()` 检查字段 ID 是否重复。
5. 构造 `OntologyNode`，type 默认 `Class`，fields/tags 默认空数组。
6. 如果提供 domainId，调用 `addNodeToDomain()` 把 node id 加入 domain.nodeIds。
7. 如果提供 subgraphId，调用 `addNodeToSubgraph()` 把 node id 加入 subgraph.nodeIds。
8. 返回包含新 nodes/domains/subgraphs 的新 graph，`changed:true`。

副作用：无，纯函数。

失败行为：业务失败不抛异常，返回 `changed:false` 和 warning。

调用关系：Called by `test-ontology-commands.mjs` and future use-case/store adapter; Calls `assertNoDuplicateFields`、`addNodeToDomain`、`addNodeToSubgraph`。

### `createOntologyViewState(graph: OntologyGraph, view?: Partial<OntologyViewState>): OntologyViewState`

行为：为本体图补齐视图状态，确保每个 semantic node/domain/edge 都有对应 view record。

算法实现：
1. 复制调用方传入的 `nodeViews/domainViews/edgeViews`，没有则使用空对象。
2. 遍历 `graph.nodes`，若缺少 node view，则创建默认 position `{x:0,y:0}` 和默认尺寸 `350x280`。
3. 遍历 `graph.domains`，若缺少 domain view，则创建默认 position `{x:0,y:0}`、默认尺寸 `300x200` 和 domain.collapsed。
4. 遍历 `graph.edges`，若缺少 edge view，则创建只含 id 的 edge view。
5. viewport 默认 `{x:0,y:0,zoom:1}`，lod 默认 `full`，edgeVisibility 默认 `{mode:'all',ids:[]}`。
6. 返回完整 `OntologyViewState`。

副作用：无。

失败行为：非法 metadata 中的位置或尺寸通过安全数值兜底，不抛异常。

调用关系：Called by `createOntologyDocumentState` and `test-ontology-document-model.mjs`。

### `createOntologyDocumentState(input: CreateOntologyDocumentInput): OntologyDocumentState`

行为：创建 Phase 3B 的本体文档状态，把 `OntologyGraph` 和 `OntologyViewState` 放在同一个 document shell 中。

算法实现：
1. 若 input.graph 存在，直接作为 semantic graph。
2. 若 input.graph 不存在，调用 `createOntologyGraph({ id, name })` 创建空图。
3. 调用 `createOntologyViewState(graph, input.view)` 补齐视图状态。
4. revision 使用 input.revision，缺省为 0。
5. 返回 `{ graph, view, revision }`。

副作用：无。

失败行为：不做业务校验；graph 有问题时交给 `validateOntologyGraph()`。

调用关系：Called by `test-ontology-document-model.mjs`; Calls `createOntologyGraph`、`createOntologyViewState`。

### `createOntologyClassNodeInDocument(document: OntologyDocumentState, input: CreateOntologyClassNodeInDocumentInput): OntologyDocumentCommandResult`

行为：在本体文档中创建类图式节点，语义数据写入 `OntologyGraph`，位置/尺寸写入 `OntologyViewState.nodeViews`。

算法实现：
1. 将 input 转为 `CreateClassNodeInput`，type 默认 `Class`。
2. 调用 domain command `createClassNode(document.graph, commandInput)`。
3. 若 command 未改变 graph，返回原 document、`changed:false` 和 warnings。
4. 若成功，复制 document.view，并在 `nodeViews[input.id]` 写入 position、width、height。
5. revision 加 1。
6. 返回新 document 和 command warnings。

副作用：无。

失败行为：重复 id、空 name、缺失 domain/subgraph、重复 field id 均不抛异常，透传 command warning。

调用关系：Called by `test-ontology-document-model.mjs`、`useNodeHandling.onNodeAdd/onDrop`; Calls `createClassNode`。

### `createOntologyDomainInDocument(document: OntologyDocumentState, input: CreateOntologyDomainInDocumentInput): OntologyDocumentCommandResult`

行为：在本体文档中创建 Domain，语义层写入 `OntologyDomain`，视图层写入 domain position/size/collapsed。

算法实现：
1. 将 input 转为 `CreateDomainInput`。
2. 调用 domain command `createDomain(document.graph, commandInput)`。
3. 若 command 未改变 graph，返回原 document、`changed:false` 和 warnings。
4. 若成功，复制 document.view，并在 `domainViews[input.id]` 写入 position、width、height、collapsed。
5. revision 加 1。
6. 返回新 document 和 command warnings。

副作用：无。

失败行为：重复 id、空 name、缺失父 Domain、自指父 Domain 均不抛异常，透传 command warning。

调用关系：Called by `test-ontology-document-model.mjs`、`useNodeHandling.onGroupAdd`; Calls `createDomain`。

### `updateOntologyNodeInDocument(document: OntologyDocumentState, input: UpdateOntologyNodeInDocumentInput): OntologyDocumentCommandResult`

行为：在 document 层更新本体节点语义数据，不改变 node view 的 position/size。

算法实现：
1. 调用 `updateOntologyNode(document.graph, input)`。
2. 若 command 未改变 graph，返回原 document、`changed:false` 和 warnings。
3. 若成功，保留原 `document.view`。
4. revision 加 1。
5. 返回新 document 和 command warnings。

副作用：无。

失败行为：节点缺失、空名称、缺失 Domain、重复字段等失败均透传 command warning。

调用关系：Called by `NodeInspectorBlock.handleSave` and `test-ontology-document-model.mjs`; Calls `updateOntologyNode`。

### `updateOntologyDomainInDocument(document: OntologyDocumentState, input: UpdateOntologyDomainInDocumentInput): OntologyDocumentCommandResult`

行为：在 document 层更新本体 Domain 语义数据，并在 collapsed 改变时同步 Domain view。

算法实现：
1. 调用 `updateOntologyDomain(document.graph, input)`。
2. 若 command 未改变 graph，返回原 document、`changed:false` 和 warnings。
3. 若 input.collapsed 存在且目标 domain view 存在，同步更新 `view.domainViews[domainId].collapsed`。
4. revision 加 1。
5. 返回新 document 和 command warnings。

副作用：无。

失败行为：Domain 缺失、空名称、缺失父 Domain、自指父 Domain、循环父链均透传 command warning。

调用关系：Called by `NodeInspectorBlock.handleSave` and `test-ontology-document-model.mjs`; Calls `updateOntologyDomain`。

### `deleteOntologyElements(graph: OntologyGraph, input: DeleteOntologyElementsInput): OntologyCommandResult`

行为：删除本体节点、Domain 或关系；删除 Domain 时级联收集子 Domain 和节点，并删除相关 incident edges。

算法实现：
1. 遍历 input.ids，分别识别 node、domain、edge；domain 通过递归收集 `domainIds` 和 `nodeIds`。
2. 遍历 graph.edges，把 source/target 命中删除节点或 domainId 命中删除 Domain 的边加入删除集合。
3. 若没有任何命中，返回 `changed:false` 和 `DELETE_TARGET_MISSING` warning。
4. 重建 nodes/domains/edges：删除命中实体，并从保留 Domain 中移除已删除 node/domain 引用。
5. 重建 subgraphs：移除已删除 nodeIds/edgeIds。
6. 返回新 graph；缺失 id 作为非阻断 warning 返回。

副作用：无。

失败行为：不存在的 id 不抛异常；全部缺失时 `changed:false`，部分缺失时 `changed:true` 且带 warning。

调用关系：Called by `deleteOntologyElementsInDocument` and `test-ontology-commands.mjs`; Calls `collectDomainDescendants`、`removeDeletedReferencesFromDomains`、`removeDeletedReferencesFromSubgraphs`。

### `updateOntologyNodeViewInDocument(document: OntologyDocumentState, input: UpdateOntologyNodeViewInDocumentInput): OntologyDocumentState`

行为：更新节点 view record 的 position、width、height、expanded，语义节点不变。

算法实现：
1. 读取 `document.view.nodeViews[input.nodeId]`。
2. 若 view 不存在，直接返回原 document。
3. 合并 position/width/height/expanded，数值用旧值兜底。
4. revision 加 1 并返回新 document。

副作用：无。

失败行为：缺失 view 时不抛异常，不改变 document。

调用关系：Called by `ontologyDocumentStore.updateNodeView` and `test-ontology-document-model.mjs`。

### `deleteOntologyElementsInDocument(document: OntologyDocumentState, input: DeleteOntologyElementsInDocumentInput): OntologyDocumentCommandResult`

行为：在 document 层删除本体元素，并同步清理 `nodeViews/domainViews/edgeViews` 和 view edge visibility ids。

算法实现：
1. 调用 `deleteOntologyElements(document.graph, input)`。
2. 若 command 未改变 graph，返回原 document 和 warnings。
3. 过滤 node/domain/edge view records，仅保留新 graph 中仍存在的 id。
4. 过滤 `view.edgeVisibility.ids`，移除已删除 edge id。
5. revision 加 1，返回新 document。

副作用：无。

失败行为：透传 command warning；缺失 id 不抛异常。

调用关系：Called by `ontologyDocumentStore.deleteElements` and `test-ontology-document-model.mjs`; Calls `deleteOntologyElements`。

### `useOntologyDocumentStore`

行为：Zustand store hook，保存当前 canvas 的 `OntologyDocumentState` 并提供运行时更新入口。

算法实现：
1. 初始创建空 `OntologyDocumentState`，`hydrated:false`，`sourceCanvasId:null`。
2. `replaceDocument(document, source)` 直接替换 document，并记录 source canvas。
3. `applyCommandResult(result, source)` 只在 `result.changed` 时写入新 document。
4. `applyInteractionPatch(patch, source)` 调用 `applyOntologyInteractionPatch()`；如果 patch 无 view 变化则返回 null，否则写入新 document 并返回新 document。
5. `updateNodeView/updateDomainView/updateViewport` 调用对应 document 纯函数后写回 store。
6. `deleteElements(input, source)` 调用 `deleteOntologyElementsInDocument()`，成功时写回 store 并返回 true。

副作用：写 `features/ontology-canvas/state/ontologyDocumentStore.ts` 内的 Zustand 客户端状态；不写旧 graph store、不发请求。

失败行为：command result 未改变或删除目标不存在时返回 false；不抛异常。

调用关系：Called by `GraphPageContent`、`useNodeHandling`、`useEdgeHandling`、`EdgeEditor`、`CustomEdge`、`useKeyboardShortcuts`、`useViewportControls`、`canvasSync` and `test-ontology-document-store.mjs`; Calls document model pure functions and `applyOntologyInteractionPatch`。

### `createOntologyDocumentFromLegacyGraph(input: LegacyGraphDocumentInput): OntologyDocumentState`

行为：从当前旧 graph runtime 快照构造本体文档状态，作为 Phase 3B 新增 UI 入口调用 ontology document use-case 前的临时 facade。

算法实现：
1. 遍历旧 `Node | Group`，把 `BlockEnum.GROUP` 映射为 legacy mapper 可读的 `type:'group'`，其他节点映射为 `type:'node'`。
2. 把旧 title/content/attributes/tags/summary/groupId/collapsed/nodeIds/createdAt/updatedAt 复制到 mapper input。
3. 遍历旧 edges，把 source/target/label/groupId/data/createdAt/updatedAt 复制到 mapper input。
4. 调用 `mapLegacyGraphToOntologyGraph()` 得到 `OntologyGraph`。
5. 从旧节点抽取 `position/width/height/isExpanded`，写入 `view.nodeViews`。
6. 从旧 group 抽取 `position/width/height/collapsed`，写入 `view.domainViews`。
7. 从旧 edge 抽取 `sourceHandle/targetHandle`，写入 `view.edgeViews`。
8. 调用 `createOntologyDocumentState()` 合并 semantic graph 和 view state。

副作用：无。只读取传入快照，不读写 store。

失败行为：非法数值通过 safeNumber 兜底；mapper 可能保留无效 edge，后续由 validation 报告。

调用关系：Called by `useNodeHandling.createDocumentSnapshot` and `test-ontology-legacy-bridge.mjs`; Calls `mapLegacyGraphToOntologyGraph`、`createOntologyDocumentState`。

### `projectOntologyNodeToLegacyNode(document: OntologyDocumentState, nodeId: string, options?: LegacyProjectionOptions): Node | undefined`

行为：把新创建的 `OntologyNode + OntologyNodeViewState` 临时投影为旧 `Node` 展示对象，供当前 ReactFlow 旧运行态显示。

算法实现：
1. 从 `document.graph.nodes[nodeId]` 和 `document.view.nodeViews[nodeId]` 读取 semantic node 与 view node。
2. 缺任意一项则返回 undefined。
3. 把 `node.type` 写入旧 `attributes.ontologyType`，把 node id 写入 `attributes.ontologyNodeId`。
4. 把 `node.fields` 转为旧 attributes 的 `{ value, dataType, category }` 结构。
5. 构造旧 `Node`：`type: BlockEnum.NODE`，position/width/height 来自 view，title/content/tags/summary 来自 semantic node。
6. 若 `options.includeMembership !== false` 且 node 有 domainId，则写入旧 `groupId`；新增入口会传 false，让旧 `addNodeToGroup()` 维护 membership。
7. createdAt/updatedAt 使用 options.now 或当前时间。

副作用：无。只返回旧展示对象，不写 store。

失败行为：document 中缺 semantic node 或 view node 时返回 undefined。

调用关系：Called by `useNodeHandling.onNodeAdd/onDrop` and `test-ontology-legacy-bridge.mjs`; Calls `createLegacyFieldAttributes`。

### `projectOntologyDomainToLegacyGroup(document: OntologyDocumentState, domainId: string, options?: LegacyProjectionOptions): Group | undefined`

行为：把新创建的 `OntologyDomain + OntologyDomainViewState` 临时投影为旧 `Group` 展示对象。

算法实现：
1. 从 `document.graph.domains[domainId]` 和 `document.view.domainViews[domainId]` 读取 semantic domain 与 view domain。
2. 缺任意一项则返回 undefined。
3. 从 view position/width/height 计算旧 group boundary。
4. 构造旧 `Group`：`type: BlockEnum.GROUP`，title 为 domain.name，nodeIds 合并 domain.nodeIds 和 domain.domainIds，collapsed 来自 view。
5. 写入 `attributes.ontologyType = 'Domain'` 和 `attributes.ontologyDomainId` 标记语义来源。
6. 若 `options.includeMembership !== false` 且 domain 有 parentDomainId，则写入旧 `groupId`；新增入口会传 false，让旧 `addNodeToGroup()` 更新 parent nodeIds。
7. createdAt/updatedAt 使用 options.now 或当前时间。

副作用：无。只返回旧展示对象，不写 store。

失败行为：document 中缺 semantic domain 或 view domain 时返回 undefined。

调用关系：Called by `useNodeHandling.onGroupAdd` and `test-ontology-legacy-bridge.mjs`; Calls none external。

### `updateNodeFields(graph: OntologyGraph, input: UpdateNodeFieldsInput): OntologyCommandResult`

行为：替换指定本体节点的字段列表。

算法实现：
1. 查找 `graph.nodes[input.nodeId]`。
2. 不存在则返回 `NODE_MISSING` warning，graph 不变。
3. 调用 `assertNoDuplicateFields()` 检查字段 ID 是否重复。
4. 构造新的 nodes record，仅替换目标 node 的 `fields`。
5. 返回新 graph，`changed:true`。

副作用：无。

失败行为：节点缺失或字段重复时不抛异常，返回 warning。

调用关系：Called by `test-ontology-commands.mjs` and future inspector/save command; Calls `assertNoDuplicateFields`。

### `updateOntologyNode(graph: OntologyGraph, input: UpdateOntologyNodeInput): OntologyCommandResult`

行为：更新本体节点的语义字段，并在同一个 command 内维护 Domain membership。

算法实现：
1. 查找 `graph.nodes[input.nodeId]`，不存在则返回 `NODE_MISSING`。
2. 若 input.name 存在但为空，返回 `NODE_NAME_EMPTY`。
3. 若 input.domainId 为非空字符串但目标 Domain 不存在，返回 `NODE_DOMAIN_MISSING`。
4. 若 input.fields 存在，调用 `assertNoDuplicateFields()` 检查字段 ID。
5. 用 `input.domainId !== undefined` 区分“不变”和“移动/移除”：`null` 表示从所有 Domain 移除。
6. 需要变更 Domain 时，先调用 `removeNodeFromAllDomains()` 清理旧引用，再按需 `addNodeToDomain()`。
7. 合并 name/type/description/fields/tags/metadata，metadata 与旧 metadata 浅合并。
8. 返回新 graph，`changed:true`。

副作用：无。

失败行为：业务失败不抛异常，返回 warning；不会写入半更新节点。

调用关系：Called by `updateOntologyNodeInDocument` and `test-ontology-commands.mjs`; Calls `assertNoDuplicateFields`、`removeNodeFromAllDomains`、`addNodeToDomain`。

### `updateOntologyDomain(graph: OntologyGraph, input: UpdateOntologyDomainInput): OntologyCommandResult`

行为：更新本体 Domain 的语义字段，并维护父 Domain 的 `domainIds`。

算法实现：
1. 查找 `graph.domains[input.domainId]`，不存在则返回 `DOMAIN_MISSING`。
2. 若 input.name 存在但为空，返回 `DOMAIN_NAME_EMPTY`。
3. 若 parentDomainId 指向自己，返回 `DOMAIN_PARENT_SELF`。
4. 若 parentDomainId 为非空字符串但不存在，返回 `DOMAIN_PARENT_MISSING`。
5. 调用 `wouldCreateDomainCycle()` 检查父链，防止循环嵌套。
6. 用 `input.parentDomainId !== undefined` 区分“不变”和“移动/移除”：`null` 表示移到根层。
7. 需要变更父 Domain 时，先调用 `removeDomainFromAllParents()` 清理旧父引用，再按需 `addDomainToParent()`。
8. 合并 name/parentDomainId/collapsed/metadata，metadata 与旧 metadata 浅合并。
9. 返回新 graph，`changed:true`。

副作用：无。

失败行为：业务失败不抛异常，返回 warning；不会写入半更新 Domain。

调用关系：Called by `updateOntologyDomainInDocument` and `test-ontology-commands.mjs`; Calls `wouldCreateDomainCycle`、`removeDomainFromAllParents`、`addDomainToParent`。

### `createSemanticRelation(graph: OntologyGraph, input: CreateSemanticRelationInput): OntologyCommandResult`

行为：创建一条本体语义关系边。

算法实现：
1. 若 edge id 已存在，返回 `EDGE_ID_DUPLICATE` warning。
2. 校验 source/target 节点存在，缺失时返回 `EDGE_SOURCE_MISSING` 或 `EDGE_TARGET_MISSING`。
3. 校验 relation 非空。
4. 若输入 domainId 存在但 graph.domains 不存在该 ID，返回 `EDGE_DOMAIN_MISSING`。
5. 调用 `inferRelationDomainId()`：优先使用输入 domainId，否则当 source/target 同属一个 domain 时自动推导。
6. 构造 `OntologyEdge`，direction 默认 `unidirectional`。
7. 调用 `addEdgeToContainingSubgraphs()`，把 edge 加入同时包含 source/target 的 subgraph。
8. 返回新 graph，`changed:true`。

副作用：无。

失败行为：业务失败不抛异常，返回 warning；不会写入半条 edge。

调用关系：Called by `test-ontology-commands.mjs` and future relation editor; Calls `inferRelationDomainId`、`addEdgeToContainingSubgraphs`。

### `moveNodeToDomain(graph: OntologyGraph, input: MoveNodeToDomainInput): OntologyCommandResult`

行为：将节点移动到目标 domain；若不传 domainId，则从所有 domain 移除。

算法实现：
1. 查找目标 node，不存在则返回 `NODE_MISSING` warning。
2. 若传入 domainId 但 domain 不存在，返回 `NODE_DOMAIN_MISSING` warning。
3. 调用 `removeNodeFromAllDomains()` 从所有 domain.nodeIds 中移除 nodeId。
4. 若传入 domainId，调用 `addNodeToDomain()` 加入目标 domain。
5. 更新 node.domainId 为目标 domainId 或 undefined。
6. 返回新 graph，`changed:true`。

副作用：无。

失败行为：节点或 domain 缺失时不改变 graph。

调用关系：Called by `test-ontology-commands.mjs` and future domain move use-case; Calls `removeNodeFromAllDomains`、`addNodeToDomain`。

### `mapLegacyGraphToOntologyGraph(input: LegacyGraphInput): OntologyGraph`

行为：把旧图数据转换为新的本体语义图。

算法实现：
1. 初始化 `nodes` 和 `domains` 两个 record。
2. 遍历 `input.nodes`：`type === 'group'` 时调用 `mapLegacyGroup()` 生成 `OntologyDomain`；否则调用 `mapLegacyNode()` 生成 `OntologyNode`。
3. 调用 `attachDomainMembership()`，把旧 group 的 `nodeIds` 拆成语义 node membership 和 child domain membership。
4. 遍历 `input.edges`，调用 `mapLegacyEdge()` 生成 `OntologyEdge`，并通过 source/target domain 推导 edge domainId。
5. 调用 `createRootSubgraph()` 生成覆盖所有语义 nodes/edges 的 root subgraph。
6. 调用 `createOntologyGraph()` 返回带 schemaVersion 的语义图，并标记 metadata source 为 `legacy-graph`。

副作用：无，纯函数；不修改 legacy 输入对象。

失败行为：不会丢弃缺失端点的 edge；缺失 source/target 会保留到输出中，交给 `validateOntologyGraph()` 报告。

调用关系：Called by `test-ontology-model.mjs` and future migration/use-case; Calls `mapLegacyNode`、`mapLegacyGroup`、`attachDomainMembership`、`mapLegacyEdge`、`createRootSubgraph`、`createOntologyGraph`。

### `mapAttributesToFields(nodeId: string, attributes?: Record<string, unknown>): OntologyField[]`

行为：把旧节点 attributes 转为类图式节点内部字段。

算法实现：
1. 若 attributes 缺失，返回空数组。
2. 遍历 attributes entries，过滤 `ontologyType/nodeType/kind` 这类节点类型字段。
3. 如果属性值是对象，优先读取对象内的 `value/dataType/category`。
4. 如果属性值不是对象，把原始值作为字段值。
5. 通过 `toStableString()` 把字段值转成稳定字符串。
6. 通过 `toDataType()` 或显式 dataType 写入字段类型。
7. 通过 `normalizeFieldCategory()` 归一化字段分类，默认 `attribute`。

副作用：无。

失败行为：复杂对象值使用 `JSON.stringify()`；不可序列化对象会由 JSON.stringify 抛错。

调用关系：Called by `mapLegacyNode`; Calls `isRecord`、`toStableString`、`toDataType`、`normalizeFieldCategory`。

### `validateOntologyGraph(graph: OntologyGraph): OntologyValidationResult`

行为：校验本体图结构一致性，返回所有 issue 而不是遇到第一个错误就中断。

算法实现：
1. 初始化 `issues` 数组。
2. 校验 graph id/name 非空。
3. 校验 graph schemaVersion 等于 `ONTOLOGY_SCHEMA_VERSION`。
4. 调用 `validateNodes()` 校验 node record key/id、name、domainId、field id/name。
5. 调用 `validateEdges()` 校验 edge record key/id、source/target 是否存在、relation 非空、domainId 是否存在。
6. 调用 `validateDomains()` 校验 domain key/id、name、parentDomainId、nodeIds、domainIds 和自包含。
7. `validateDomains()` 内部调用 `validateDomainCycles()` 检测 parentDomainId 链上的环。
8. 调用 `validateSubgraphs()` 校验 subgraph key/id、rootNodeId、domainId、nodeIds、edgeIds。
9. 根据 issues 中是否存在 error 返回 `valid` 布尔值。

副作用：无，纯函数。

失败行为：不抛业务异常；循环 domain 会产生 `DOMAIN_PARENT_CYCLE` issue；缺失引用会产生对应 error issue。

调用关系：Called by `test-ontology-model.mjs` and future command/repository boundary; Calls `validateNodes`、`validateEdges`、`validateDomains`、`validateSubgraphs`。

### `validateDomainCycles(graph: OntologyGraph, issues: OntologyValidationIssue[]): void`

行为：检测 domain parent 链中的循环引用。

算法实现：
1. 创建 `visiting` 和 `visited` 两个 Set。
2. 对每个 domain id 调用递归 `visit(domainId, path)`。
3. 若当前 domain 已在 visiting 中，说明 parent 链形成环，追加 `DOMAIN_PARENT_CYCLE`。
4. 若当前 domain 已 visited，直接返回。
5. 将当前 domain 放入 visiting。
6. 若 parentDomainId 存在且能在 graph.domains 中找到，继续递归访问 parent。
7. 递归返回后从 visiting 删除当前 domain，并加入 visited。

副作用：向传入的 `issues` 数组追加 issue。

失败行为：缺失 parent 不在这里报错，由 `validateDomains()` 的 parent missing 分支处理。

调用关系：Called by `validateDomains`; Calls itself recursively。

### `test-ontology-model.mjs`

签名：

```js
resolveLocalModule(specifier: string, parentDirectory: string): string
loadTypeScriptModule(filePath: string): Record<string, unknown>
toPlainValue(value: unknown): unknown
assertDeepPlainEqual(actual: unknown, expected: unknown, message: string): void
```

算法实现：
1. 复用轻量 TypeScript module loader，把 `domain/ontology/index.ts` 转译为 CommonJS 并在 VM 中执行。
2. 构造包含嵌套 domain、Function/Information/Component 节点和两条语义边的 legacy graph 样本。
3. 调用 `mapLegacyGraphToOntologyGraph()` 得到新 `OntologyGraph`。
4. 断言 schemaVersion、node type、domainId、字段映射、domain membership、edge relation/domainId、root subgraph。
5. 调用 `validateOntologyGraph()` 断言合法图没有 issues。
6. 构造缺失 source 且 relation 为空的 invalid graph，断言出现 `EDGE_SOURCE_MISSING` 和 `EDGE_RELATION_EMPTY`。
7. 构造 domain parent cycle，断言出现 `DOMAIN_PARENT_CYCLE`。

副作用：读取本地源文件；在 VM 中执行转译后的模块；成功时写 stdout。

失败行为：模块解析失败、断言失败或 VM 执行失败都会让 `npm run test:ontology` 非 0 退出。

调用关系：Called by `npm run test:ontology` and `npm run check:phase2`; Calls `mapLegacyGraphToOntologyGraph`、`validateOntologyGraph`。

### `test-ontology-commands.mjs`

签名：

```js
createBaseGraph(): OntologyGraph
toPlainValue(value: unknown): unknown
assertDeepPlainEqual(actual: unknown, expected: unknown, message: string): void
```

算法实现：
1. 通过共享 loader 加载 `domain/ontology/index.ts`。
2. `createBaseGraph()` 构造包含两个 domain、三个节点、root subgraph 的 legacy graph，并映射为 `OntologyGraph`。
3. 调用 `createClassNode()` 创建 `class-a`，断言节点、domain membership 和 subgraph membership。
4. 用重复 ID 再次调用 `createClassNode()`，断言返回 `NODE_ID_DUPLICATE` warning 且 graph 引用不变。
5. 调用 `updateNodeFields()` 替换字段，并用重复 field ID 断言 `NODE_FIELD_ID_DUPLICATE`。
6. 调用 `createSemanticRelation()` 创建关系，断言 relation、自动 domainId 和 root subgraph edgeIds。
7. 用缺失 source 调用 `createSemanticRelation()`，断言 `EDGE_SOURCE_MISSING`。
8. 调用 `moveNodeToDomain()` 把 component 从 domain-b 移到 domain-a，再调用一次无 domainId 的移动将其移出所有 domain。
9. 最后调用 `validateOntologyGraph()` 确认命令更新后的图仍然有效。

副作用：通过共享 loader 读取并执行本地 ontology 源文件；成功时写 stdout。

失败行为：任一断言失败或模块加载失败会让 `npm run test:ontology:commands` 非 0 退出。

调用关系：Called by `npm run test:ontology:commands` and `npm run check:phase2`; Calls ontology mapper、commands、validator。

### `check-architecture-boundaries.mjs`

签名：

```js
collectSourceFiles(directory: string): Promise<string[]>
getImportedModules(source: string): string[]
checkRule(rule: BoundaryRule): Promise<{ rule: string; filesChecked: number; violations: Violation[] }>
```

算法实现：
1. 定义 `boundaryRules`，当前包含 `domain/ontology must stay framework independent`、`features/ontology-canvas/model must stay UI and store independent` 和 `features/ontology-canvas/adapters must stay UI and store independent`。
2. `domain/ontology` 规则禁止导入 React、ReactDOM、ReactFlow、Zustand、Next、`@/app`、`@/components`、`@/hooks`、`@/services`、`@/stores` 和 CSS。
3. `features/ontology-canvas/model` 规则禁止导入 React、ReactDOM、ReactFlow、Zustand、Next、`@/app`、`@/components`、`@/hooks`、`@/services`、`@/stores`、feature 内 `ui/blocks/adapters` 和 CSS。
4. `features/ontology-canvas/adapters` 规则允许 ReactFlow 类型/DTO，但禁止 Zustand、Next、`@/app`、`@/components`、`@/hooks`、`@/stores` 和 CSS。
5. 三条规则都禁止源码中出现 `fetch(...)`。
6. `collectSourceFiles()` 从规则 root 递归读取目录，只收集 `.js/.jsx/.mjs/.ts/.tsx`。
7. `getImportedModules()` 用四组正则提取 static import/export、dynamic import、require 的模块名。
8. `checkRule()` 逐文件读取源码，检查 forbidden imports 和 forbidden patterns。
9. 汇总所有 violations，逐条打印命中的规则、文件和原因。
10. 若存在 violations，`process.exit(1)`；否则输出检查通过。

副作用：读取本地文件；写 stdout/stderr；违规时设置进程退出码 1。

失败行为：规则 root 不存在或文件读取失败会让脚本抛错并以非 0 退出；边界违规也以非 0 退出。

调用关系：Called by `npm run check:architecture`; Calls Node `fs/promises.readdir/readFile`。

### `load-typescript-module.mjs`

签名：

```js
createTypeScriptModuleLoader(importMetaUrl: string): {
  loadTypeScriptModule(filePath: string): Record<string, unknown>
  resolveLocalModule(specifier: string, parentDirectory: string): string
}
```

算法实现：
1. 为调用脚本创建独立 `moduleCache` 和 `nodeRequire`。
2. `resolveLocalModule()` 根据父目录和相对 specifier 构造候选路径，依次尝试原路径、`.ts/.tsx/.js/.mjs` 和 `index.ts`。
3. `loadTypeScriptModule()` 先按绝对路径查 cache，命中则返回 exports。
4. 读取 TypeScript 源码后调用 `ts.transpileModule()` 转为 CommonJS。
5. 创建 CommonJS module 容器，并提前放进 cache 支持简单循环依赖。
6. 构造 `localRequire()`：`@/` 别名从 frontend 根目录解析，相对导入继续走 loader，第三方/Node 内置模块走 `createRequire()`。
7. 用 `vm.runInNewContext()` 执行编译产物，并把 `fetch` 代理到 `globalThis.fetch` 以支持 repository 测试 mock。
8. 返回 loader 函数。

副作用：读取本地源文件；在 VM 中执行转译后的模块。

失败行为：模块解析、文件读取、转译或 VM 执行失败会向调用脚本抛错。

调用关系：Called by `test-domain-commands.mjs`、`test-ontology-model.mjs`、`test-ontology-commands.mjs`; Calls `ts.transpileModule`、`vm.runInNewContext`。

### `test-domain-commands.mjs`

签名：

```js
toPlainValue(value: unknown): unknown
assertDeepPlainEqual(actual: unknown, expected: unknown, message: string): void
```

算法实现：
1. 通过 `createTypeScriptModuleLoader()` 加载 `edgeVisibility.ts` 与 `graphConsistency.ts`。
2. 构造三条测试 edge。
3. 断言 all/none/custom visibility、去重、未知 edge 过滤、toggle、incident edge removal 和 custom visibility 清理。
4. 最后断言原始 `edges` 输入数组长度仍为 3，确认 domain commands 不修改输入数组。

副作用：通过共享 loader 读取并执行本地 domain command 源文件；断言失败时进程非 0 退出；成功时写 stdout。

失败行为：模块解析失败、TypeScript 转译执行失败或任一断言失败都会抛错并让 `npm run test:domain` 失败。

调用关系：Called by `npm run test:domain`、`npm run check:phase1` and `npm run check:phase2`; Calls `edgeVisibility` commands、`graphConsistency` commands。

### `test-react-flow-adapter.mjs`

签名：

```js
toPlainValue(value: unknown): unknown
```

算法实现：
1. 通过 `createTypeScriptModuleLoader()` 加载 `features/ontology-canvas/adapters/react-flow/index.ts`。
2. 构造两个 group 和两个 group 内节点。
3. 断言 `projectNodesToReactFlowNodes()` 会把 parent group 排在 child node 前，并把 child node 转为父组内相对坐标。
4. 断言 LOD 阈值、节点默认尺寸、选中状态、ReactFlow node type 和 `data.lodMode` 正确。
5. 构造 viewport culling 场景，断言屏幕外未选中节点被裁掉，屏幕外选中节点和其父 group 被保留。
6. 构造跨 group edge，断言 `projectEdgesToReactFlowEdges()` 按 visibility 过滤、设置 `crossGroup` type、selected 和 zIndex。
7. 断言 `visibleNodeIds` 会过滤端点不可见的边，`mode: none` 时边投影为空。
8. 构造循环 groupId，断言 `sortNodesByNestingLevel()` 不会递归爆栈。

副作用：通过共享 loader 读取并执行本地 adapter 源文件；断言失败时进程非 0 退出；成功时写 stdout。

失败行为：模块解析失败、TypeScript 转译执行失败或任一断言失败都会抛错并让 `npm run test:react-flow-adapter` 失败。

调用关系：Called by `npm run test:react-flow-adapter` and `npm run check:phase2`; Calls ReactFlow adapter projection functions。

### `createEdgesSlice(set: any, get: any): EdgesSlice`

行为：创建边相关状态和操作集合。

关键操作算法：
1. `addEdge(edge)`：读取当前 state，追加 edge；调用 `addEdgeToVisibility()` 维护结构化 visibility；然后写 history snapshot。
2. `updateEdge(id, updates)`：map edges，命中 ID 时浅合并 updates 和 updatedAt，然后写 history snapshot。
3. `deleteEdge(id)`：过滤 edges；调用 `removeEdgeIdsFromVisibility()` 维护结构化 visibility；然后写 history snapshot。
4. `getEdgesByGroupId(groupId)`：按 sourceGroupId/targetGroupId 过滤。
5. `getCrossGroupEdges()`：过滤 `edge.data?.isCrossGroup === true`。
6. `getInternalGroupEdges(groupId)`：过滤非跨组且 source/target group 命中。
7. `setCustomEdgeVisibility(ids)`：调用 `createCustomEdgeVisibility(ids, edges)` 进入 custom mode。
8. `showAllEdges()`：调用 `createAllEdgeVisibility()`，并写 history。
9. `hideAllEdges()`：调用 `createNoEdgeVisibility()`，并写 history。
10. `toggleEdgeVisibility(id)`：调用 `toggleEdgeInVisibility()`，切到 custom 模式后增删目标 id，并写 history。

副作用：写 graph store；多处调用 `addHistorySnapshot()`。

失败行为：无显式异常处理；传入不存在 ID 时 update/delete 只是无效果。

调用关系：Called by `useGraphStore` creation and UI/actions；Calls `addHistorySnapshot`。

### `createHistorySlice(set, get, _api): HistoryState`

行为：创建 undo/redo 快照状态。

算法实现：
1. 初始 `history=[]`、`historyIndex=-1`、`maxSize=50`。
2. `addHistorySnapshot()` 读取当前 nodes/edges。
3. 复制 history 数组并删除当前 index 之后的 redo 分支。
4. push `{ nodes: [...nodes], edges: [...edges] }`。
5. 超过 maxSize 时 shift 最早快照。
6. 更新 history 和 historyIndex。
7. `undo()` 若可撤销，读取前一个 snapshot，替换 nodes/edges。
8. `redo()` 若可重做，读取后一个 snapshot，替换 nodes/edges。

副作用：写 graph store 的 history/nodes/edges。

失败行为：canUndo/canRedo 为 false 时静默无操作。

调用关系：Called by graph slice operations；Calls none external。

### `createCanvasSlice(set, get): CanvasSlice`

行为：创建工作区 canvas 状态和 CRUD 操作。

算法实现：
1. 初始化默认 canvas、canvasTree、currentCanvasId。
2. `createCanvas(name, parentId)` 构造新 Canvas。
3. 在 set 回调中复制 canvases 数组并追加新 Canvas。
4. 如果存在 parentId，查找父 canvas 并将新 ID push 到父 canvas.children。
5. 递归更新 canvasTree，把新 tree node 插到父节点或根节点。
6. `deleteCanvas(canvasId)` 递归收集待删除 canvas ID，过滤 canvases 和 canvasTree，必要时更新 currentCanvasId。
7. `renameCanvas(canvasId, newName)` 同步更新 canvases 和 canvasTree 名称。
8. `switchCanvas(canvasId)` 只更新 currentCanvasId。
9. `toggleCanvasCollapse(canvasId)` 同步翻转 canvases 和 canvasTree 的 isCollapsed。
10. `updateCanvasViewport(canvasId, viewport)` 更新指定 canvas viewportState。
11. `initializeWorkspace(canvases, tree, currentId)` 直接替换三项状态。

副作用：写 workspace store。

失败行为：多数操作对不存在 ID 静默无效；`switchCanvas` 不校验目标是否存在。

调用关系：Called by workspace UI and `canvasSync`; Calls `nanoid`。

### `createBasicOperationsSlice(set: any, get: any): NodeOperationsSlice & LayoutOperations`

行为：创建基础节点操作。

算法实现：
1. 初始化 nodes、selectedNodeId、selectedEdgeId、isLayoutMode。
2. `setSelectedNodeId/setSelectedEdgeId` 直接写 selection。
3. `addNode(node)` 检查重复 ID，按类型选择默认尺寸，sanitize position/size。
4. 如果节点有 groupId 且非布局模式，查父 group 并约束到边界。
5. 追加节点并添加 history snapshot。
6. `updateNode(id, updates)` 校验空 title，判断是否只更新 position/size/style。
7. map nodes，命中节点后合并 updates/data，sanitize position，更新 updatedAt。
8. 若更新 width/height，同步 style.width/style.height，并为 group 自动更新 boundary。
9. 若有 groupId 且非布局模式，再次约束位置。
10. set 新 nodes；非 position/size/style 更新才写 history。
11. `deleteNode(id)` 调用 `removeEdgesConnectedToNodesWithVisibility()` 过滤 source/target 命中该节点的 incident edges，并同步 edge visibility 后写 history。

副作用：写 graph store；多处写 history；重复 ID 时写 console.error。

失败行为：重复 ID 时 console.error 并返回当前 state；不存在 ID 的 update/delete 静默无效果。

调用关系：Called by `createNodesSlice`; Calls `constrainNodeToGroupBoundary`、`addHistorySnapshot`。

### `createGroupOperationsSlice(set: any, get: any): GroupOperationsSlice`

行为：创建 group CRUD 和 group membership 操作。

算法实现：
1. `addGroup(group)` 若有父 group，先检测循环和嵌套深度。
2. sanitize group position/size，必要时约束到父 group 内。
3. 追加 group 到 nodes。
4. `updateGroup(id, updates)` 先定位目标 group；若不存在则返回原 state。
5. 若 `updates.nodeIds` 存在，先在 map 外计算 added/removed IDs，再 map nodes，确保每个 map 分支只返回单个 node/group。
6. 命中 group 后合并 updates/data/style/position/size；added 子节点写入 `groupId`，removed 子节点清理匹配的 `groupId`。
7. `deleteGroup(id)` 用 `getAllDescendants()` 找 group 和所有后代，过滤删除 nodes；再调用 `removeEdgesConnectedToNodesWithVisibility()` 删除 source/target 命中后代集合的 incident edges，并同步 edge visibility。
8. `addNodeToGroup(nodeId, groupId)` 检测 group 嵌套合法性，从旧 group 移除，给节点设置新 groupId，再更新目标 group.nodeIds。
9. `removeNodeFromGroup(nodeId)` 删除节点 groupId，并从所有 group.nodeIds 中移除该节点。

副作用：写 graph store。

失败行为：循环/深度非法时返回原 state；不存在 ID 多数静默无效果。

调用关系：Called by `createNodesSlice`; Calls `hasCircularNesting`、`validateNestingDepth`、`getAllDescendants`、`constrainNodeToGroupBoundary`。

### `createGroupBoundaryOperationsSlice(set: any, get: any): GroupBoundaryOperationsSlice`

行为：创建自动更新 group 边界的操作。

算法实现：
1. 内部定义 `updateSingleGroupBoundary(groupId, nodes)`。
2. 查找目标 group；不存在返回原 nodes。
3. 找出直接子节点 `groupNodes`；为空返回原 nodes。
4. 读取当前 group 位置和尺寸。
5. 用直接子节点 ID 排序拼接为 cache key，并查 100ms TTL 缓存。
6. 若缓存可用，使用缓存边界判断是否需要扩张；如果无需扩张直接返回。
7. 遍历子节点，按 position + width/height + visual padding 计算 min/max。
8. 计算包含 padding 的 required bounds。
9. 判断左右上下是否需要扩张。
10. 计算新 group position/width/height，保证最小 300x200。
11. map nodes 更新目标 group 的 position/size/boundary/updatedAt。
12. `updateGroupBoundary(groupId)` 收集从当前 group 到顶层祖先的 groupChain。
13. 从当前 group 向祖先依次调用 `updateSingleGroupBoundary()`。

副作用：写 graph store；更新模块级 `boundaryCache`。

失败行为：布局模式或 group 不存在时返回原 state。

调用关系：Called by GraphPageContent resize/drag and layout controls；Calls `safePosition`、`safeNumber`。

### `frontend/stores/graph/nodes/conversionOperations.ts`

状态：已删除。

删除原因：旧 Node/Group 双向转换通过隐藏节点、隐藏边和恢复缓存字段实现兼容；这些字段会污染 graphData 和本体语义模型，并给渲染过滤增加额外分支。用户已明确旧图兼容不是目标，Phase 2C 删除该链路。

### `getAllDescendants(nodeId: string, nodes: (Node | Group)[]): (Node | Group)[]`

行为：递归获取节点自己和所有嵌套后代。

算法实现：
1. 按 nodeId 查找节点；不存在返回空数组。
2. 初始化 descendants 为 `[node]`。
3. 如果节点是 group 且有 nodeIds，遍历每个 childId。
4. 对 childId 递归调用 `getAllDescendants()`。
5. 将 childDescendants 展开追加到 descendants。
6. 返回 descendants。

副作用：无。

失败行为：无 cycle guard；循环数据会导致无限递归/栈溢出。

调用关系：Called by group delete、conversion、recursive move；Calls itself。

### `createEdgeEditorDraft(edge?: Edge | null): EdgeEditorDraft`

行为：从旧 `Edge` 模型创建边编辑器本地草稿。

算法实现：
1. 读取 `edge.data.customProperties`，缺省为空对象。
2. label 优先使用 `edge.label`，其次使用 `customProperties.relationship`。
3. 读取 color、strokeWidth、strokeDasharray、weight、strength、direction，缺省到当前编辑器默认值。
4. 将 customProperties 格式化为 JSON 文本，供 textarea 编辑。
5. 返回不写 store 的 `EdgeEditorDraft`。

副作用：无。

失败行为：不抛异常；缺失 edge 或字段时使用默认值。

调用关系：Called by `EdgeEditorForm` 初始化和 reset；Calls `JSON.stringify`。

### `parseCustomPropertiesText(text: string): CustomPropertiesParseResult`

行为：把边编辑器自定义属性 textarea 文本解析成 JSON 对象。

算法实现：
1. trim 输入文本。
2. 空文本返回 `{ ok:true, value:{} }`。
3. 尝试 `JSON.parse()`。
4. 若解析结果不是非数组对象，返回 `{ ok:false, error }`。
5. 合法对象返回 `{ ok:true, value }`。
6. JSON 解析异常返回 `{ ok:false, error }`。

副作用：无。

失败行为：解析失败不抛异常，返回错误结果给 UI 禁止保存。

调用关系：Called by `EdgeEditorForm` useMemo 和测试脚本。

### `buildEdgeUpdate(edge: Edge, draft: EdgeEditorDraft, customProperties: Record<string, unknown>): Partial<Edge>`

行为：把边编辑器草稿转换为旧 graph store 的 `updateEdge()` payload。

算法实现：
1. 设置 `label = draft.label`。
2. 浅合并原 `edge.data`。
3. 写入 color、strokeWidth、strokeDasharray、weight、strength、direction。
4. 合并原 customProperties 和解析后的 customProperties。
5. 最后强制写入 `relationship = draft.label`，让关系标签成为语义字段的最终值。
6. 返回 `Partial<Edge>`，不修改原 edge。

副作用：无。

失败行为：调用方必须先确保 customProperties 已解析成功；函数自身不做 JSON parse。

调用关系：Called by `EdgeEditorForm.handleSave` 和 `test-editor-drafts.mjs`。

### `createEdgeInspectorSavePlan(edge: Edge, draft: EdgeEditorDraft): EdgeInspectorSavePlan`

行为：把边编辑器 draft 转成可执行保存计划。

算法实现：
1. 调用 `parseCustomPropertiesText(draft.customPropertiesText)`。
2. 解析失败时返回 `{ ok:false, error }`，不构造 update payload。
3. 解析成功时调用 `buildEdgeUpdate(edge, draft, parsed.value)`。
4. 返回 `{ ok:true, edgeId: edge.id, update }`。

副作用：无。

失败行为：非法 JSON 或非对象 JSON 不抛异常，返回错误 plan。

调用关系：Called by `EdgeEditorForm.handleSave` 和 `test-editor-drafts.mjs`；Calls `parseCustomPropertiesText`、`buildEdgeUpdate`。

### `createNodeEditorDraft(node?: EditableGraphNode | null): NodeEditorDraft`

行为：从旧 Node/Group 创建节点编辑器本地草稿。

算法实现：
1. 读取 title、content、groupId、summary，缺省为空字符串。
2. 将 tags 数组 join 为逗号文本。
3. 读取 attributes，缺省为空对象。
4. 返回 `NodeEditorDraft`。

副作用：无。

失败行为：缺失 node 或字段时使用空值。

调用关系：Called by `NodeInspectorBlock` 初始化和 reset；Calls none。

### `buildNodeUpdate(draft: NodeEditorDraft): Partial<EditableGraphNode>`

行为：把节点编辑器草稿转换为旧 graph store 的普通字段更新 payload。

算法实现：
1. 复制 title、content、summary。
2. 调用 `parseTagsText()` 将逗号文本转为去空标签数组。
3. 复制 attributes。
4. 写入 `validationError: undefined` 清理旧校验错误。
5. 故意不返回 `groupId`，把 membership 更新留给 group operations。

副作用：无。

失败行为：不抛异常；空标签文本返回空数组。

调用关系：Called by `createNodeInspectorSavePlan` 和 `test-editor-drafts.mjs`；Calls `parseTagsText`。

### `createNodeMembershipPlan(nodeId: string, previousGroupId?: string, nextGroupId?: string): NodeMembershipPlan`

行为：比较节点旧 groupId 与 draft groupId，返回显式 membership plan。

算法实现：
1. 将空字符串归一化为 `undefined`。
2. 如果旧/新 groupId 相同，返回 `{ type:'none' }`。
3. 如果新 groupId 存在，返回 `{ type:'move', nodeId, groupId }`。
4. 如果新 groupId 为空，返回 `{ type:'remove', nodeId }`。

副作用：无。

失败行为：不抛异常；只做字符串归一化和分支选择。

调用关系：Called by `createNodeInspectorSavePlan`、`createNodeRemoveFromGroupPlan` 和测试脚本。

### `createNodeInspectorSavePlan(nodeId: string, node: EditableGraphNode, draft: NodeEditorDraft): NodeInspectorSavePlan`

行为：把节点编辑器 draft 转成旧 display 普通字段 update、membership plan 和本体节点/Domain 更新输入。

算法实现：
1. 调用 `buildNodeValidationCandidate(node, draft)`。
2. 调用 `validateNodeContent(candidate)`。
3. 校验失败时返回 `{ ok:false, errors }`。
4. 校验成功时调用 `buildNodeUpdate(draft)`，生成旧 display 更新 payload。
5. 调用 `createNodeMembershipPlan(nodeId, node.groupId, draft.groupId)`。
6. 如果编辑对象是旧 Group，则生成 `{ kind:'domain', input: UpdateOntologyDomainInDocumentInput }`。
7. 如果编辑对象是旧 Node，则调用 `buildOntologyNodeType()` 和 `buildOntologyFieldsFromAttributes()`，生成 `{ kind:'node', input: UpdateOntologyNodeInDocumentInput }`。
8. 返回 `{ ok:true, nodeId, update, membership, ontology }`。

副作用：无。

失败行为：校验失败不写 store，错误交给 UI 展示。

调用关系：Called by `NodeInspectorBlock.handleSave` 和 `test-editor-drafts.mjs`；Calls `buildNodeValidationCandidate`、`validateNodeContent`、`buildNodeUpdate`、`createNodeMembershipPlan`、`buildOntologyNodeType`、`buildOntologyFieldsFromAttributes`。

### `collectDomainDescendantViewIds(document: OntologyDocumentState, domainId: string): DomainDescendantViewIds`

行为：收集指定 Domain 的所有后代 node/domain view id，供 Domain 拖拽批量平移使用。

算法实现：
1. 初始化 nodeIds、domainIds、warnings 和 visitedDomainIds。
2. 从目标 domainId 开始递归读取 `document.graph.domains[currentDomainId]`。
3. 如果 domain 已在 visited 中，记录 cycle warning 并停止该分支。
4. 遍历 domain.nodeIds，仅当 graph node 和 node view 都存在时加入 nodeIds，否则记录 missing view warning。
5. 遍历 domain.domainIds，仅当 graph domain 和 domain view 都存在时加入 domainIds，并递归访问子 Domain。
6. 返回去重后的 nodeIds/domainIds 和 warnings。

副作用：无。纯函数，不修改 document。

失败行为：缺失 domain/view 不抛异常，返回 warnings。

调用关系：Called by `commitDomainDrag` and `test-domain-nesting-interactions.mjs`。

### `projectReactFlowPositionToAbsolute(document, input): { position; warnings }`

行为：把 ReactFlow 节点相对坐标转成 `OntologyViewState` 使用的画布绝对坐标。

算法实现：
1. 对 input.position 做 safe number 归一化。
2. 如果没有 parentDomainId，直接返回归一化 position。
3. 读取父 Domain view。
4. 父 view 缺失时返回原 position 和 warning。
5. 父 view 存在时返回 `{ x: relative.x + parent.x, y: relative.y + parent.y }`。

副作用：无。

失败行为：父 Domain view 缺失不抛异常，返回 warning 并降级为原 position。

调用关系：Called by `commitNodeDrag`、`commitDomainDrag` and tests。

### `constrainNodePositionToDomain(document, input): { position; warnings }`

行为：把节点 absolute position 约束到父 Domain 的 padding 内部。

算法实现：
1. 从 input.domainId 或 `graph.nodes[nodeId].domainId` 解析父 Domain。
2. 无父 Domain 时直接返回原 position。
3. 读取 node view 和 domain view；缺失时返回 warning。
4. 根据 interaction config 读取 padding、节点尺寸、Domain 位置和尺寸。
5. 计算允许的 minX/minY/maxX/maxY。
6. 对 position 做 clamp；当节点尺寸大于可用空间时回到 minX/minY。

副作用：无。

失败行为：缺失 view 不抛异常，返回 warning 和原 position。

调用关系：Called by `commitNodeDrag`、`commitNodeResize` and tests。

### `resolveNodePlacementInDomain(document, nodeId, domainId, config): { position; warnings }`

行为：为“显式归入容器”的普通节点选择目标 Domain 内部空位，优先避开已有直接子节点和子 Domain。

算法实现：
1. 读取目标 Domain、Domain view 和 node view；缺失时返回当前节点位置或 `{0,0}` 并记录 warning。
2. 根据 Domain view、padding、节点尺寸计算内部起点 `minX/minY`。
3. 用节点宽度和固定 gap 计算可用列数，至少保留一列。
4. 收集目标 Domain 的直接子节点和子 Domain bounds，排除正在放置的 nodeId。
5. 从左上角开始按网格生成候选点。
6. 对每个候选点计算 bounds，若不与已有 bounds 重叠则返回该点。
7. 如果候选点都重叠，把节点放到下一行，后续由边界级联扩展 Domain。

副作用：无。

失败行为：缺失 view 不抛异常；返回 warning 并降级为可用位置。

调用关系：Called by `createNodeDomainPlacementPatch`。

### `createNodeDomainPlacementPatch(document, input): OntologyInteractionPatch`

行为：在本体 graph 父子关系已经变更后，为新归入 Domain 的普通节点生成位置 patch 和目标 Domain 边界级联 patch。

算法实现：
1. 若 input.domainId 为空，返回空 patch；移出容器时保留节点绝对位置。
2. 解析 interaction config。
3. 调用 `resolveNodePlacementInDomain()` 获取目标 Domain 内部空位。
4. 生成 `nodeViews[nodeId].position` patch。
5. 将 node patch 临时应用到 document view。
6. 调用 `updateDomainBoundaryCascade()` 从目标 Domain 向祖先级联扩展边界。
7. 合并 node patch、domain patch 和 warnings 返回。

副作用：无。调用方负责先更新 graph membership，再应用 view patch。

失败行为：目标 Domain 或 node view 缺失时返回 warning；不会修改输入 document。

调用关系：Called by `NodeInspectorBlock.handleSave`、`NodeInspectorBlock.handleApplyContainer` and `test-canvas-interactions.mjs`; Calls `resolveNodePlacementInDomain`、`updateDomainBoundaryCascade`。

### `updateDomainBoundaryCascade(document, domainId, config?): OntologyInteractionPatch`

行为：从指定 Domain 开始向祖先级联计算并返回 Domain 边界扩展 patch。

算法实现：
1. 初始化 workingDocument、patch 和 visitedDomainIds。
2. 对当前 Domain 读取 direct node/domain children 的 absolute bounds。
3. 根据 child bounds 和 padding 计算 requiredMin/requiredMax。
4. 新 Domain 左上角取当前位置和 requiredMin 的较小值，右下角取当前右下角和 requiredMax 的较大值。
5. 若位置或尺寸变化，写入 `patch.domainViews[domainId]`。
6. 将本轮 patch 临时应用到 workingDocument，用更新后的子 Domain bounds 继续计算父 Domain。
7. 遇到父链 cycle 时记录 warning 并停止。

副作用：无。只返回 patch。

失败行为：缺失 view 或循环不抛异常，返回 warnings。

调用关系：Called by `createNodeDomainPlacementPatch`、`commitNodeDrag`、`commitDomainDrag`、`commitNodeResize`、`commitDomainResize` and tests。

### `commitNodeDrag(document, input): OntologyInteractionPatch`

行为：节点拖拽停止事务，输出本体 view 的最终位置和受影响 Domain 边界 patch。

算法实现：
1. 校验 graph node 和 node view 存在。
2. 通过 `projectReactFlowPositionToAbsolute()` 把 ReactFlow final position 转为 absolute position。
3. 通过 `constrainNodePositionToDomain()` 取得约束后的最终坐标。
4. 生成 node view position patch。
5. 如果节点属于 Domain，把 node patch 临时应用到 document。
6. 调用 `updateDomainBoundaryCascade()` 生成父 Domain 和祖先 Domain 的边界 patch。
7. 合并 node patch、domain patch 和 warnings 返回。

副作用：无。调用方负责应用 patch。

失败行为：缺失 node/view 返回 warning-only patch，不抛异常。

调用关系：Called by `GraphPageContent.onNodeDragStop` and `test-domain-nesting-interactions.mjs`。

### `commitDomainDrag(document, input): OntologyInteractionPatch`

行为：Domain 拖拽停止事务，平移 Domain 自己和所有后代 node/domain view。

算法实现：
1. 校验 graph domain 和 domain view 存在。
2. 通过 `projectReactFlowPositionToAbsolute()` 将 ReactFlow final position 转为 absolute position。
3. 用新旧 absolute position 计算 offset。
4. 调用 `collectDomainDescendantViewIds()` 收集所有后代。
5. 为 Domain 自己写入新 position。
6. 对所有后代 node/domain view position 加同一个 offset。
7. 如果该 Domain 有父 Domain，则临时应用 drag patch 后调用 `updateDomainBoundaryCascade(parentDomainId)`。
8. 合并 drag patch、父边界 patch 和 warnings 返回。

副作用：无。

失败行为：缺失 domain/view 返回 warning-only patch，不抛异常。

调用关系：Called by `GraphPageContent.onNodeDragStop` and `test-domain-nesting-interactions.mjs`。

### `commitNodeResize(document, input): OntologyInteractionPatch`

行为：节点尺寸变化事务，更新 node view width/height/expanded/customExpandedSize 并触发父 Domain 边界级联。

算法实现：
1. 校验 graph node 和 node view 存在。
2. 用 safe number 合成 node view width/height patch。
3. 如果 input.expanded 已传入，把展开状态写入同一 node view patch。
4. 如果 input.customExpandedSize 已传入，把自定义展开尺寸写入同一 node view patch。
5. 如果 input.position 存在，则先约束到父 Domain 内。
6. 节点无父 Domain 时直接返回 node patch。
7. 节点有父 Domain 时临时应用 node patch。
8. 调用 `updateDomainBoundaryCascade(parentDomainId)` 合并父级边界 patch。

副作用：无。

失败行为：缺失 node/view 返回 warning-only patch。

调用关系：Called by `GraphPageContent.onNodesChange(dimensions)`、`useNodeExpansion.toggleExpand` and tests。

### `commitDomainResize(document, input): OntologyInteractionPatch`

行为：Domain 尺寸变化事务，更新 domain view width/height/collapsed/position，并在嵌套 Domain 场景更新父级边界。

算法实现：
1. 校验 graph domain 和 domain view 存在。
2. 用 input 或当前 view 合成 domain view patch。
3. 若 Domain 没有父 Domain，直接返回 patch。
4. 若有父 Domain，临时应用 domain patch。
5. 调用 `updateDomainBoundaryCascade(parentDomainId)` 合并父级边界 patch。

副作用：无。

失败行为：缺失 domain/view 返回 warning-only patch。

调用关系：Called by `GraphPageContent.onNodesChange(dimensions)`。

### `applyOntologyInteractionPatch(document, patch): OntologyDocumentState`

行为：把 interaction patch 一次性合并到 document view，并只增加一次 revision。

算法实现：
1. 检查 patch 是否包含 nodeViews/domainViews/edgeViews 变化。
2. 无变化时返回原 document 引用。
3. 对每类 view record 做浅复制。
4. 对存在的 view id 合并 patch；缺失 view id 忽略。
5. 返回新 document，view 替换为合并后的 view，revision + 1。

副作用：无。

失败行为：缺失 view id 被忽略，不抛异常。

调用关系：Called by `ontologyDocumentStore.applyInteractionPatch` and tests。

### `NodeInspectorBlock.handleSave(): void`

行为：校验 Inspector 编辑草稿，先写本体文档；如果普通节点容器归属在保存中变更，则补节点容器内放置 patch；最后把旧 graph store 作为 display bridge 投影更新。

算法实现：
1. 调用 `createNodeInspectorSavePlan(nodeId, node, draft)`。
2. 保存计划失败时写本地 `error`，清空 `feedback` 并停止。
3. 从 `useOntologyDocumentStore.getState().document` 读取当前本体文档。
4. `plan.ontology.kind === 'domain'` 时调用 `updateOntologyDomainInDocument()`。
5. `plan.ontology.kind === 'node'` 时调用 `updateOntologyNodeInDocument()`。
6. 本体 command 返回未变更时写 `feedback = "No changes"` 并停止。
7. 调用 `applyOntologyCommandResult()` 写入 `ontologyDocumentStore`。
8. 若保存的是普通节点且 membership 发生 move/remove，调用 `createNodeDomainPlacementPatch()`；move 会把节点放入目标容器内部，remove 保留绝对位置。
9. 有 placement patch 时调用 `applyInteractionPatch()` 写本体 view；随后调用 `projectOntologyDocumentToLegacyGraphNodes/Edges()`，把当前本体 document 投影回旧 display cache。
10. 写 `feedback = "Saved"` 并清空 `error`。

副作用：写 `ontologyDocumentStore`；用本体投影替换旧 graph store display nodes/edges；更新本地 feedback/error。

失败行为：校验失败或本体 command warning 不写旧 graph store；UI 保留 draft 并显示错误/无变化反馈。

调用关系：Called by `NodeInspectorBlock` 保存按钮；Calls `createNodeInspectorSavePlan`、`updateOntologyNodeInDocument`、`updateOntologyDomainInDocument`、`createNodeDomainPlacementPatch`、`useOntologyDocumentStore.applyCommandResult`、`useOntologyDocumentStore.applyInteractionPatch`、`projectOntologyDocumentToLegacyGraphNodes`、`projectOntologyDocumentToLegacyGraphEdges`。

### `NodeInspectorBlock.handleApplyContainer(domainId: string | null): void`

行为：普通节点在 Inspector Container 区点击容器按钮或移出按钮时，立即显式变更容器归属，并同步节点位置和旧 display cache。

算法实现：
1. 若没有选中节点或选中的是 Domain/Group，则直接返回。
2. 从 `ontologyDocumentStore` 读取当前 document 和当前节点的真实 domainId。
3. 若目标 domainId 与当前 domainId 相同，写入轻量 feedback 并停止。
4. 调用 `updateOntologyNodeInDocument({ nodeId, domainId })` 更新本体 graph 的 `node.domainId` 与目标 Domain `nodeIds`。
5. command 未变更时显示 warning/error 并停止。
6. 调用 `applyOntologyCommandResult()` 写入本体 document store。
7. 基于更新后的 document 调用 `createNodeDomainPlacementPatch()`；归入时选择目标容器内部空位，移出时返回空 patch。
8. 调用 `applyInteractionPatch()` 应用位置 / 边界 patch。
9. 更新 Inspector draft.groupId、feedback/error，并把当前本体 document 投影回旧 display cache。

副作用：写 `ontologyDocumentStore`；替换旧 graph store display nodes/edges；更新本地 draft、feedback 和 error。

失败行为：目标 Domain 缺失或 command warning 时不改旧 display cache；已在目标容器内时只显示反馈。

调用关系：Called by Container 区域快捷按钮和移出按钮；Calls `updateOntologyNodeInDocument`、`createNodeDomainPlacementPatch`、`applyOntologyCommandResult`、`applyInteractionPatch`、`projectOntologyDocumentToLegacyGraphNodes`、`projectOntologyDocumentToLegacyGraphEdges`。

### `buildAttributesFromItems(items: AttributeItem[]): Record<string, unknown>`

行为：把结构化属性编辑器的键值列表转换回属性对象。

算法实现：
1. 初始化空对象。
2. 遍历每个 item。
3. 空 key 跳过。
4. 尝试 `JSON.parse(item.value)`，成功则保留 number/object/boolean/null 等 JSON 类型。
5. 解析失败则把 value 当字符串保存。
6. 返回属性对象。

副作用：无。

失败行为：单个 value 解析失败不阻断，降级为字符串。

调用关系：Called by `NodeAttributeEditor` domain metadata mode 和 `test-editor-drafts.mjs`。

### `createNodeExpansionPatch(node, nextExpanded, config): NodeExpansionPatch`

行为：根据目标展开状态生成节点展开/折叠尺寸计划。

算法实现：
1. 如果 `nextExpanded=true`，优先读取 `node.customExpandedSize`。
2. 没有自定义展开尺寸时使用 `config.expandedSize`。
3. 如果 `nextExpanded=false`，使用 `config.collapsedSize`。
4. 返回 `{ isExpanded, width, height, data:{ isExpanded } }`，供当前 legacy display cache 和本体 interaction patch 接线复用。

副作用：无。

失败行为：不抛异常；缺失 node 时使用 config。

调用关系：Called by `useNodeExpansion.toggleExpand`、`test-canvas-interactions.mjs` 和展开/折叠相关测试。

### `getCustomExpandedSizeToPersist(node, config): NodeExpansionSize | null`

行为：判断当前展开节点尺寸是否应该保存为用户自定义展开尺寸。2026-05-07 后，该函数可在已有 customExpandedSize 时继续检测新尺寸，支持用户再次 resize 后更新自定义展开尺寸。

算法实现：
1. node 为空或未展开时返回 null。
2. width/height 不是有限数字时返回 null。
3. 当前尺寸等于收缩尺寸或默认展开尺寸时返回 null。
4. 如果已有 customExpandedSize 且与当前 width/height 相同，返回 null，避免无意义写入。
5. 否则返回 `{ width, height }`。

副作用：无。

失败行为：非法尺寸降级为 null，不抛异常。

调用关系：Called by `GraphPageContent.onNodesChange(dimensions)` 和 `test-canvas-interactions.mjs`。

### `createResizeCommitGate(): ResizeCommitGate`

行为：创建 resize 提交闸门，只允许真实用户 resize end 触发本体尺寸提交。

算法实现：
1. 在闭包中创建 `activeResizeNodeIds: Set<string>`。
2. `markResizing(nodeId)` 将节点 id 放入 active set，表示已收到用户 resize 起点。
3. `shouldCommitResizeEnd(nodeId)` 先检查该 id 是否存在；不存在时返回 false，说明这是 LOD/style 自动 dimensions 测量。
4. 若存在，删除该 id 并返回 true，允许调用方提交一次 resize patch。
5. `clear(nodeId)` 用于节点删除或取消场景，移除 active id。
6. `hasActiveResize()` 返回 active set 是否非空，供 GraphPageContent 判断是否应跳过 projection 同步。

副作用：只修改闭包内 Set，无外部 I/O。

失败行为：未知 node id 返回 false，不抛异常。

调用关系：Called by `GraphPageContent.onNodesChange(dimensions)` 和 `test-canvas-interactions.mjs`。

### `createUniqueOntologyFieldName(existingFields, prefix = 'attribute'): string`

行为：为节点新增字段生成不与现有字段名冲突的默认名称。

算法实现：
1. 把已有字段名 trim + lowercase 后放入 Set。
2. 取 `prefix.trim()` 作为基础名，空 prefix 降级为 `attribute`。
3. 如果基础名未被占用，直接返回基础名。
4. 从 2 开始递增，查找 `baseName + index`。
5. 找到第一个未占用名称后返回。

副作用：无。

失败行为：不抛异常；空 prefix 自动降级。

调用关系：Called by `createDefaultOntologyField` and `test-canvas-interactions.mjs`。

### `getDefaultOntologyFieldInputForCategory(category = 'attribute'): DefaultOntologyFieldCategoryInput`

行为：把节点分区新增动作传入的字段分类转换成默认字段创建参数。

算法实现：
1. category 为 `behavior` 时返回 `{ category, dataType: 'function', namePrefix: 'method' }`。
2. category 为 `rule` 时返回 `{ category, dataType: 'text', namePrefix: 'rule' }`。
3. category 为 `constraint` 时返回 `{ category, dataType: 'text', namePrefix: 'constraint' }`。
4. category 为 `interface` 时返回 `{ category, dataType: 'string', namePrefix: 'interface' }`。
5. 其他情况统一降级为普通属性 `{ category: 'attribute', dataType: 'string', namePrefix: 'attribute' }`。

副作用：无。

失败行为：不抛异常；缺省或未知调用路径降级为普通 attribute 默认值。

调用关系：Called by `NoteNode.handleAddField` and `test-canvas-interactions.mjs`。

### `createDefaultOntologyField(input): OntologyField`

行为：创建一个默认本体字段，用于节点上的快速新增属性入口。

算法实现：
1. 调用 `createUniqueOntologyFieldName()` 生成字段名。
2. 字段 id 优先使用 input.fieldId。
3. 未提供 fieldId 时用 `${nodeId}:field:${fieldName}`。
4. dataType 优先使用 input.dataType，缺省默认 `string`。
5. category 优先使用 input.category，缺省默认 `attribute`。
6. 返回完整 `OntologyField`。

副作用：无。

失败行为：不抛异常；缺省值自动补齐。

调用关系：Called by `appendDefaultOntologyField`。

### `appendDefaultOntologyField(node, input = {}): OntologyField[]`

行为：在不修改原 node 的前提下，为节点 fields 追加一个默认字段。

算法实现：
1. 读取 node.id 和 node.fields。
2. 调用 `createDefaultOntologyField()` 生成新字段。
3. 返回 `[...node.fields, newField]`。

副作用：无。

失败行为：不抛异常；调用方负责通过 document command 校验和写入。

调用关系：Called by `NoteNode.handleAddField` and `test-canvas-interactions.mjs`。

### `updateOntologyField(fields, fieldId, patch): OntologyField[]`

行为：把节点内字段行内编辑或分类切换 patch 应用到指定字段，并保持字段数组不可变。

算法实现：
1. 遍历 `fields`，仅处理 id 等于 `fieldId` 的字段。
2. 如果 patch 提供 name，则 trim；trim 后为空时返回原字段并保持 `changed=false`。
3. 如果 patch 提供 value 或 dataType，则 trim 后写入；空字符串归一化为 `undefined`。
4. category 未提供时保留原分类。
5. 对比新旧字段的 name/value/dataType/category，只有真实变化时设置 `changed=true`。
6. 遍历结束后，若 `changed=true` 返回新数组；否则返回原数组引用，供调用方跳过 document command。

副作用：无。

失败行为：字段 id 缺失或字段名为空时返回原数组引用，不抛异常。

调用关系：Called by `NoteNode.handleFieldChange` and `test-canvas-interactions.mjs`。

### `deleteOntologyField(fields, fieldId): OntologyField[]`

行为：从节点字段数组中删除指定字段。

算法实现：
1. 遍历 `fields`，过滤掉 id 等于 `fieldId` 的字段。
2. 如果过滤后长度和原长度一致，说明未命中字段，返回原数组引用。
3. 否则返回过滤后的新数组。

副作用：无。

失败行为：字段 id 缺失时返回原数组引用，不抛异常。

调用关系：Called by `NoteNode.handleFieldDelete` and `test-canvas-interactions.mjs`。

### `moveOntologyField(fields, fieldId, direction, orderedFieldIds?): OntologyField[]`

行为：移动节点字段顺序；若提供当前可见分区的字段 id 顺序，则按分区内顺序移动，否则按完整 fields 相邻位置移动。

算法实现：
1. 在完整 `fields` 中查找当前 field index，缺失时返回原数组引用。
2. 如果传入 `orderedFieldIds`，先过滤出仍存在于 fields 中的 id，并查找当前 field 在该 scoped order 中的位置。
3. scoped order 命中时，根据 direction 取上一个或下一个 scoped field id，并映射回完整 fields 的 index。
4. scoped order 未命中时，按完整 fields 相邻 index 计算目标位置。
5. 目标位置越界或等于当前位置时返回原数组引用。
6. 复制 fields 数组，交换 currentIndex 和 targetIndex 两个字段，返回新数组。

副作用：无。

失败行为：字段 id 缺失、目标越界或移动无效时返回原数组引用，不抛异常。

调用关系：Called by `NoteNode.handleFieldMove` and `test-canvas-interactions.mjs`。

### `buildOntologyNodeViewModel(document, nodeId): OntologyNodeViewModel | undefined`

行为：从本体 document 生成节点 UI 的分区化展示模型，供节点组件按 LOD 渲染。

算法实现：
1. 读取 `document.graph.nodes[nodeId]`，节点不存在时返回 `undefined`。
2. 按 `OntologyField.category` 将字段切成 Fields(attribute)、Methods(behavior)、Rules(rule/constraint)、Interfaces(interface) 分区；这四个字段分区即使为空也会保留，供完整 LOD 显示空态和分区新增入口。
3. 扫描 `document.graph.edges`，收集 source 或 target 命中当前节点的 incident edges。
4. 将 incident edges 转成 Relationships 分区项，展示 relation、另一端节点名称和 in/out/both/link 方向摘要。
5. 如果节点带 `subgraphId`，读取对应 subgraph，统计除自身以外的 child node 数量。
6. 汇总 counts：fields、methods、rules、interfaces、relationships、childNodes。
7. 生成 metrics：Fields、Methods、Child Nodes、Relations 固定存在，Rules/Interfaces 仅在数量大于 0 时追加。
8. 返回 title、type、description、tags、sections、metrics、counts、hasSubcanvas 和 subcanvasLabel。

副作用：无。

失败行为：节点不存在返回 `undefined`；缺失 subgraph 时 childNodes 为 0，但 `hasSubcanvas` 仍按 node.subgraphId 表达。

调用关系：Called by `projectOntologyNodeToLegacyNode`; Calls field section helpers and relationship item helpers。

### `buildOntologyDomainViewModel(document, domainId): OntologyDomainViewModel | undefined`

行为：从本体 document 生成 Domain / 容器 UI 的摘要展示模型，供容器组件按折叠状态和 LOD 渲染。

算法实现：
1. 读取 `document.graph.domains[domainId]` 和 `document.view.domainViews[domainId]`，缺失时返回 `undefined`。
2. 统计 direct child node 数量：`domain.nodeIds.length`。
3. 统计 direct child domain 数量：`domain.domainIds.length`。
4. 扫描 `document.graph.edges`，收集 edge.domainId 命中、source/target 直属节点命中、source/target node.domainId 命中或 source/target 所属子 Domain 命中的关系。
5. 用 Set 去重后得到 relationships 数量。
6. 从 metadata 的 legacySummary / legacyContent 读取描述兜底。
7. 生成 previewItems：先收集直属节点，再收集直属 Domain，截断为最多 5 个预览项。
8. 返回 title、typeLabel、collapsed、parentDomainId、counts、metrics、previewItems、hasInternalSpace 和 internalSpaceLabel。

副作用：无。

失败行为：Domain 或 Domain view 缺失时返回 `undefined`；缺失子节点/子 Domain 引用会在 previewItems 中被过滤。

调用关系：Called by `projectOntologyDomainToLegacyGroup`; Calls domain relationship count and preview item helpers。

### `NoteNode.handleAddField(category?): void`

行为：节点上新增属性入口的接线逻辑，负责把 UI 回调转成语义字段写入。

算法实现：
1. 从 `useOntologyDocumentStore.getState().document` 读取当前 document。
2. 根据 ReactFlow node id 查找本体节点。
3. 节点不存在时直接返回。
4. 调用 `getDefaultOntologyFieldInputForCategory(category)` 取得目标分类的 namePrefix、dataType 和 category 默认值。
5. 调用 `appendDefaultOntologyField()` 生成下一版 fields。
6. 调用 `updateOntologyNodeInDocument(document, { nodeId, fields })` 生成 command result。
7. 调用 `ontologyDocumentStore.applyCommandResult()` 写入本体 document。
8. 写入成功后，把最新 document 投影为旧 graph nodes/edges display cache。

副作用：写 `ontologyDocumentStore.document`；通过 `useGraphStore.setState()` 更新旧 display cache。

失败行为：节点缺失时静默返回；command result 未变更时不更新旧 display cache。

调用关系：Called by `ClassNodeView.onAddField` callback；Calls `appendDefaultOntologyField`、`updateOntologyNodeInDocument`、`applyCommandResult`、legacy projection functions。

### `NoteNode.handleFieldChange(fieldId, patch): void`

行为：节点内字段行内编辑和分类切换的接线逻辑，负责把 UI 提交转成语义字段写入。

算法实现：
1. 从 `useOntologyDocumentStore.getState().document` 读取当前 document。
2. 根据 ReactFlow node id 查找本体节点，缺失时返回。
3. 调用 `updateOntologyField(ontologyNode.fields, fieldId, patch)` 生成下一版 fields。
4. 如果 helper 返回原数组引用，说明没有有效变化，直接返回。
5. 调用 `updateOntologyNodeInDocument(document, { nodeId, fields })` 生成 command result。
6. 调用 `ontologyDocumentStore.applyCommandResult()` 写入本体 document。
7. 写入成功后，把最新 document 投影为旧 graph nodes/edges display cache。

副作用：写 `ontologyDocumentStore.document`；通过 `useGraphStore.setState()` 更新旧 display cache。

失败行为：节点缺失、字段缺失、空字段名或 command 未变更时静默跳过，不抛异常。

调用关系：Called by `ClassNodeView.onFieldChange` callback；Calls `updateOntologyField`、`updateOntologyNodeInDocument`、`applyCommandResult`、legacy projection functions。

### `NoteNode.handleFieldDelete(fieldId): void`

行为：节点内字段删除的接线逻辑，负责把 UI 删除动作转成语义字段写入。

算法实现：
1. 从 `useOntologyDocumentStore.getState().document` 读取当前 document。
2. 根据 ReactFlow node id 查找本体节点，缺失时返回。
3. 调用 `deleteOntologyField(ontologyNode.fields, fieldId)` 生成下一版 fields。
4. 如果 helper 返回原数组引用，说明没有有效变化，直接返回。
5. 调用 `updateOntologyNodeInDocument(document, { nodeId, fields })` 生成 command result。
6. 调用 `ontologyDocumentStore.applyCommandResult()` 写入本体 document。
7. 写入成功后，把最新 document 投影为旧 graph nodes/edges display cache。

副作用：写 `ontologyDocumentStore.document`；通过 `useGraphStore.setState()` 更新旧 display cache。

失败行为：节点缺失、字段缺失或 command 未变更时静默跳过，不抛异常。

调用关系：Called by `ClassNodeView.onFieldDelete` callback；Calls `deleteOntologyField`、`updateOntologyNodeInDocument`、`applyCommandResult`、legacy projection functions。

### `NoteNode.handleFieldMove(fieldId, direction, orderedFieldIds): void`

行为：节点内字段排序的接线逻辑，负责把 UI 上移/下移动作转成语义字段写入。

算法实现：
1. 从 `useOntologyDocumentStore.getState().document` 读取当前 document。
2. 根据 ReactFlow node id 查找本体节点，缺失时返回。
3. 调用 `moveOntologyField(ontologyNode.fields, fieldId, direction, orderedFieldIds)` 生成下一版 fields。
4. 如果 helper 返回原数组引用，说明移动无效，直接返回。
5. 调用 `updateOntologyNodeInDocument(document, { nodeId, fields })` 生成 command result。
6. 调用 `ontologyDocumentStore.applyCommandResult()` 写入本体 document。
7. 写入成功后，把最新 document 投影为旧 graph nodes/edges display cache。

副作用：写 `ontologyDocumentStore.document`；通过 `useGraphStore.setState()` 更新旧 display cache。

失败行为：节点缺失、字段缺失、移动越界或 command 未变更时静默跳过，不抛异常。

调用关系：Called by `ClassNodeView.onFieldMove` callback；Calls `moveOntologyField`、`updateOntologyNodeInDocument`、`applyCommandResult`、legacy projection functions。

### `NoteNode.handleToggleSection(sectionId): void`

行为：切换节点内部分区折叠状态，并保存到本体 node view。

算法实现：
1. 从当前 document 读取 `view.nodeViews[nodeId].collapsedSections`，缺失时按空数组处理。
2. 如果 sectionId 已存在，则过滤移除。
3. 如果 sectionId 不存在，则追加到数组末尾。
4. 调用 `ontologyDocumentStore.updateNodeView({ nodeId, collapsedSections })` 写入本体 view。
5. 写入后把 document 投影为旧 graph display cache，确保旧缓存也携带折叠状态。

副作用：写 `ontologyDocumentStore.document.view.nodeViews[nodeId].collapsedSections`；通过 `useGraphStore.setState()` 更新旧 display cache。

失败行为：node view 缺失时 `updateOntologyNodeViewInDocument()` 返回原 document；函数不抛异常。

调用关系：Called by `ClassNodeView.onToggleSection` callback；Calls `updateNodeView` and legacy projection functions。

### `ClassNodeView(props): JSX.Element`

行为：渲染本体类图式节点 UI，并按 LOD 降低 DOM。

算法实现：
1. 优先使用 `props.viewModel`；缺失时由 legacy fallback props 生成只含 Fields 的临时 ViewModel。
2. 根据本体节点 type 调用 `getOntologyNodeTypeTone()` 取得语义色 token。
3. 合并 `ontologyNodeViewTokens.cssVars` 和类型色 token。
4. 根据 selected、显式 status 和本地 hover 状态解析展示状态；readonly/disabled 会关闭快速编辑入口。
5. 根据 isExpanded 选择 collapsed/expanded section 和 item 显示上限，并用 `collapsedSectionIds` 判断分区是否折叠。
6. 为每个分区生成摘要：空分区显示 empty label，有内容时显示总数、隐藏数量和前几个字段名。
7. `lodMode === dot` 时只渲染类型首字母标记，不渲染标题、统计和字段 DOM。
8. `lodMode === outline` 时渲染类型标记、标题、类型和可选子节点数量，不渲染字段 DOM。
9. `lodMode === compact` 时渲染标题、类型和 metric 摘要，不渲染分区字段行。
10. `lodMode === full` 时渲染 metric 摘要、内部空间入口、Fields/Methods/Rules/Interfaces/Relationships 分区、可编辑字段行、字段分类/删除/排序控件、可选描述、展开按钮、顶栏新增字段按钮、分区新增按钮、分区折叠按钮和折叠摘要。

副作用：无；点击按钮只调用传入 callback。

失败行为：未知 type 降级为 Class 色调；空字段不渲染字段列表。

调用关系：Called by `NoteNode.renderNodeContent`; Calls `NodeMetricList`、`NodeFieldList`、`NodeSection`、`getOntologyNodeTypeTone`。

### `createSectionSummary(sectionItems, emptyLabel, hiddenItemCount, tokens): string`

行为：为节点分区折叠态和字段过多态生成短摘要。

算法实现：
1. 如果分区没有 items，返回分区 empty label。
2. 取前 `tokens.sectionSummaryItemLimit` 个 item 名称并用逗号连接。
3. 如果存在 hiddenItemCount，返回总数、隐藏数量和名称摘要。
4. 没有隐藏项时返回总数和名称摘要。

副作用：无。

失败行为：空 items 不抛异常，直接返回 empty label。

调用关系：Called by `ClassNodeView`。

### `DomainNodeView(props): JSX.Element`

行为：渲染本体 Domain / 容器节点 UI，并按折叠状态和 LOD 降低 DOM。

算法实现：
1. 优先使用 `props.viewModel`；缺失时由 fallback props 生成空容器 ViewModel。
2. 合并 `ontologyDomainViewTokens.cssVars` 到容器根元素。
3. 根据 selected、显式 status 和本地 hover 状态解析展示状态；readonly/disabled 会降低对比度并关闭按钮动作。
4. 计算 totalChildren = childNodes + childDomains，并生成 containedSummary。
5. `lodMode === dot` 时只渲染容器图标。
6. `lodMode === outline` 时渲染容器图标、标题、类型和总子项数量。
7. `lodMode === compact` 时渲染标题区域和 metric 摘要，不渲染 preview items。
8. `lodMode === full && !collapsed` 时渲染 metric 摘要、preview items、可选描述和内部空间入口。
9. `lodMode === full && collapsed` 时渲染 metric 摘要和折叠摘要，不渲染内部完整 preview items。
10. 若传入 `onToggleCollapsed` 或 `onEnterInternalSpace`，对应按钮只调用回调，不直接写 store。

副作用：无。

失败行为：缺失 ViewModel 降级为空 Domain；validationError 只展示，不抛异常。

调用关系：Called by `GroupNode`; Calls local `DomainMetricList` and token helpers。

### `createContainedSummary(model, totalChildren, tokens): string`

行为：为 Domain / 容器折叠态生成摘要文本。

算法实现：
1. 如果 totalChildren 和 relationships 都为 0，返回空内部空间摘要。
2. 取前 `tokens.summaryItemLimit` 个 preview item 标题。
3. 生成子项总数和关系数量摘要。
4. 如果存在 preview 标题，则拼接到摘要末尾。

副作用：无。

失败行为：previewItems 为空时只返回数量摘要，不抛异常。

调用关系：Called by `DomainNodeView`。

### `GroupNode.handleToggleCollapsed(): void`

行为：Domain / 容器节点上的折叠按钮接线逻辑，负责把 UI 回调转成语义 view state 写入。

算法实现：
1. 从 `useOntologyDocumentStore.getState().document` 读取当前本体 document。
2. 优先读取 `document.view.domainViews[id].collapsed`，缺失时用旧 graph groupNode.collapsed 兜底。
3. 调用 `useOntologyDocumentStore.updateDomainView({ domainId, collapsed: !currentCollapsed })` 写本体 domain view。
4. 读取更新后的 document。
5. 调用 legacy projection functions，把 document 投影回旧 graph nodes/edges display cache。

副作用：写 `OntologyDocumentState.view.domainViews[domainId].collapsed`；通过 `useGraphStore.setState()` 更新旧 display cache。

失败行为：domain view 缺失时 `updateOntologyDomainViewInDocument()` 返回原 document；函数不抛异常。

调用关系：Called by `DomainNodeView.onToggleCollapsed`; Calls `updateDomainView` and legacy projection functions。

### `createCanvasSelectionDeletionPlan(nodes, edges): CanvasDeletionPlan`

行为：为 Delete/Backspace 快捷键生成删除计划。

算法实现：
1. 收集 `selected=true` 的 node ids。
2. 构建 selected node id Set。
3. 收集 `selected=true` 的 edge ids，但过滤掉 source/target 已在 selected node Set 中的边。
4. 返回 `{ nodeIds, edgeIds }`。

副作用：无。

失败行为：缺失 source/target 按空字符串处理，不抛异常。

调用关系：Called by `useKeyboardShortcuts` 和 `test-canvas-interactions.mjs`。

### `createCanvasClearPlan(nodes, edges): CanvasDeletionPlan`

行为：为清空画布生成删除计划。

算法实现：
1. 收集所有 node ids。
2. 构建 node id Set。
3. 收集 source/target 不在 node Set 中的 dangling edge ids。
4. 返回 `{ nodeIds, edgeIds }`。

副作用：无。

失败行为：缺失 source/target 按空字符串处理，不抛异常。

调用关系：Called by `useViewportControls` 和 `test-canvas-interactions.mjs`。

### `createCanvasLayoutOptions(): { animate: true; strategy: string }`

行为：生成全画布布局的默认 options。

算法实现：
1. 返回 `animate: true`。
2. 返回策略 ID `elk-layout`。
3. 不读取 UI 或 store 状态。

副作用：无。

失败行为：无。

调用关系：Called by `LayoutControl.handleLayout` 和 `test-layout-control-model.mjs`。

### `createGroupLayoutOptions(groupId: string): { animate: true; strategy: string; groupId: string }`

行为：生成群组内部布局的默认 options。

算法实现：
1. 接收目标 groupId。
2. 返回 `animate: true`。
3. 返回策略 ID `elk-group-layout`。
4. 把 groupId 写入 options，供 `ELKGroupLayoutStrategy` 使用。

副作用：无。

失败行为：不校验 groupId 是否真实存在，调用方负责前置判断。

调用关系：Called by `LayoutControl.handleGroupLayout` 和 `test-layout-control-model.mjs`。

### `createLayoutNodeUpdate(positionData, includeStyleSize): LegacyLayoutNodeUpdate`

行为：把 layout result 中的节点位置/尺寸/边界转换为旧 graph store 的 `updateNode()` patch。

算法实现：
1. 总是写入 `position: { x, y }`。
2. `width` 存在时写入 update。
3. `height` 存在时写入 update。
4. `boundary` 存在时写入 update。
5. `includeStyleSize=true` 且存在 width/height 时，额外生成 `style.width/style.height`。
6. 返回 patch，不修改输入。

副作用：无。

失败行为：不抛异常；缺失可选字段时跳过。

调用关系：Called by `LayoutControl.handleLayout`、`LayoutControl.handleGroupLayout` 和 `test-layout-control-model.mjs`。

### `createLayoutEdgeUpdate(edgeData): LegacyLayoutEdgePatch`

行为：把 layout/edge optimizer 输出的 handle 信息转换为旧 graph store 的 `updateEdge()` patch。

算法实现：
1. 读取 `sourceHandle`。
2. 读取 `targetHandle`。
3. 返回 `{ sourceHandle, targetHandle }`。

副作用：无。

失败行为：不抛异常；缺失 handle 时返回 undefined 字段。

调用关系：Called by `LayoutControl` 的布局结果应用和边优化结果应用。

## 6. 完整数据流链路

### Flow F-001: 应用启动加载当前工作区

触发点：用户访问 `/`，Next.js 渲染 `frontend/app/page.tsx::Home`。

1. `frontend/app/page.tsx::Home`
   - 入参：无显式 props。
   - 出参：React element。
   - 副作用：注册 `useEffect`，持有 `isLoading` 本地状态。

2. `frontend/app/page.tsx::initWorkspace`（Home 内部异步函数）
   - 入参：闭包捕获 `initializeWorkspace: (canvases, tree, currentId) => void`、`setUser: (user) => void`。
   - 出参：`Promise<void>`。
   - 副作用：调用 `loadWorkspaceStorage()`；不直接 fetch API。

3. `data-layer/workspace::loadWorkspaceStorage()`
   - 入参：默认 key `kg-editor:workspace.json`。
   - 出参：`StorageData | null`。
   - 副作用：HTTP GET `/api/workspace/load?key=kg-editor%3Aworkspace.json`；使用 `StorageDataSchema` 验证 JSON。

4. 成功分支：`setUser({ id, name, createdAt })`
   - 入参：`id: string`、`name: string`、`createdAt: Date`。
   - 出参：void。
   - 副作用：写入 workspace store 的 user slice。

5. 成功分支：`initializeWorkspace(workspace.canvases, workspace.canvasTree, workspace.currentCanvasId)`
   - 入参：`canvases: Canvas[]`、`canvasTree: CanvasTreeNode[]`、`currentCanvasId: string`。
   - 出参：void。
   - 副作用：替换 workspace store 中的 canvases/tree/currentCanvasId。

6. 成功分支：调用 `loadCanvasData(workspace.currentCanvasId)`
   - 入参：`canvasId: string`。
   - 出参：void。
   - 副作用：优先从 `Canvas.ontologyDocument` 恢复 `OntologyDocumentState`，写入 `ontologyDocumentStore`；再投影旧 `graphData` 写入 graph store 显示桥。

7. 失败分支：`initDefaultWorkspace()`
   - 入参：无。
   - 出参：void。
   - 副作用：写入默认 user、默认 canvas 和默认 canvasTree；默认 canvas 已包含空 `ontologyDocument`，随后调用 `loadCanvasData(DEFAULT_CANVAS.id)`。

8. `setIsLoading(false)`
   - 入参：`false`。
   - 出参：void。
   - 副作用：触发 Home 重新渲染，最终显示 `WorkspaceLayout` 或 `LegacyLayout`。

### Flow F-002: Graph Store 同步到 ReactFlow 渲染节点

触发点：graph store `nodes/edges/edgeVisibility/selection` 变化，或 ReactFlow viewport/zoom 变化。

1. `frontend/components/graph/core/GraphPageContent.tsx::useGraphStore(selector)`
   - 入参：多个 selector，分别读取 nodes、edges、edgeVisibility、selection 和 action。
   - 出参：`storeNodes`、`edges`、`edgeVisibility`、selection、actions。
   - 副作用：比旧整 store 订阅更窄，但 selection/action 仍和画布容器同处一层。

2. `GraphPageContent::nodes sync useEffect`
   - 入参：adapter memo 返回的 `projectedNodes: ReactFlowNode[]`。
   - 出参：无。
   - 副作用：拖拽或 resize 中跳过同步；非交互中调用 `setReactFlowNodes(projectedNodes)`，避免投影覆盖 ReactFlow 本地拖拽/resize 视觉态。

3. `GraphPageContent::updateProjectionViewport / scheduleProjectionViewportUpdate`
   - 入参：ReactFlow viewport `{ x, y, zoom }` 与 graph container DOMRect。
   - 出参：`projectionBounds: { minX,minY,maxX,maxY }`、`zoomValue`。
   - 副作用：`onMove` 经 `requestAnimationFrame` 节流更新，`onMoveEnd/onInit/zoom` 立即更新；改变 projection memo 的输入。

4. `features/ontology-canvas/adapters/react-flow::projectNodesToReactFlowNodes`
   - 入参：`storeNodes`、`selectedNodeId`、`lodMode`、`projectionBounds`、`cullingEnabled`、`viewportPadding`。
   - 出参：`ReactFlowNode[]`。
   - 副作用：无 I/O；大图且有视口时只返回视口扩展范围内节点、选中节点及其父级 group。compact/outline/dot 下普通节点 style width/height 使用 LOD 显示尺寸，并将显示 position 居中到真实节点 bounds。

5. `features/ontology-canvas/adapters/react-flow::projectEdgesToReactFlowEdges`
   - 入参：`edges`、`edgeVisibility`、`selectedEdgeId`、`storeNodeById: Map<string, Node|Group>`、`visibleNodeIds`。
   - 出参：`ReactFlowEdge[]`。
   - 副作用：无 I/O；用 Map 查 source/target，删除旧 O(E*N) `storeNodes.find()`；大图裁剪时过滤端点不可见的边。

6. `GraphPageContent::nodes/edges sync useEffect`
   - 入参：adapter 返回的 ReactFlow nodes/edges。
   - 出参：无。
   - 副作用：调用 `setReactFlowNodes(processedNodes)` / `setReactFlowEdges(processedEdges)`。

7. `ReactFlow`
   - 入参：`nodes={reactFlowNodes}`。
   - 出参：渲染节点。
   - 副作用：ReactFlow 更新画布 DOM/SVG。

### Flow F-003: Graph Store 自动保存到工作区文件

触发点：graph store 任意状态变化。

1. `persistenceMiddlewareImpl::store.subscribe`
   - 入参：Zustand store change。
   - 出参：无。
   - 副作用：调用 `debouncedSave()`。

2. `persistenceMiddlewareImpl::saveToWorkspace`
   - 入参：无显式参数，闭包读取 store。
   - 出参：`Promise<void>`。
   - 副作用：动态导入并调用 `saveCurrentCanvasData()`。

3. `canvasSync::saveCurrentCanvasData`
   - 入参：无。
   - 出参：void。
   - 副作用：将 graph store nodes/edges 写回 workspace store 当前 canvas。

4. `persistenceMiddlewareImpl::fetch('/api/workspace/save')`
   - 入参：`{ version, workspace, timestamp }`。
   - 出参：HTTP Response。
   - 副作用：请求 Next API Route 写入工作区 JSON。

### Flow F-004: 用户切换 Canvas

触发点：画布树 UI 调用 `switchToCanvas(targetCanvasId)`（具体调用点待精读）。

1. `canvasSync::switchToCanvas(targetCanvasId)`
   - 入参：`targetCanvasId: string`。
   - 出参：`Promise<void>`。
   - 副作用：读取 workspace store currentCanvasId。

2. `canvasSync::saveCurrentCanvasData`
   - 入参：无。
   - 出参：void。
   - 副作用：将当前 graph store 写回当前 canvas。

3. `workspaceStore.switchCanvas`
   - 入参：`targetCanvasId: string`。
   - 出参：void。
   - 副作用：更新 workspace store currentCanvasId。

4. `canvasSync::loadCanvasData`
   - 入参：`canvasId: string`。
   - 出参：void。
   - 副作用：用目标 canvas graphData 替换 graph store nodes/edges/selection。

5. `fetch('/api/workspace/save')`
   - 入参：最新 workspace。
   - 出参：HTTP Response。
   - 副作用：保存工作区文件；同时第4步 graph store setState 还可能触发 F-003 自动保存。

### Flow F-005: 导入协议入口（待设计）

状态：当前无活跃实现。

历史说明：旧 Mermaid 导入链路已删除，`Toolbar` 不再暴露导入入口，前端和后端活跃代码中不再引用 Mermaid parser/converter/service。

未来边界：
1. 先定义 `OntologyImportDraft`，表达 class、relation、domain、subgraph、view hints 和 schema version。
2. 输入源 parser 只能输出 draft，不直接写 store、不直接布局、不直接 fetch。
3. command 层校验 draft，返回 graph/view patch、warnings 和 history entry。
4. data-layer 统一保存 workspace，失败时有明确 dirty 状态或回滚策略。

### Flow F-006: StorageManager 保存工作区

触发点：调用 `storageManager.saveWorkspace(workspace)` 或实例方法。

1. `StorageManager::saveWorkspace`
   - 入参：`workspace: Workspace`。
   - 出参：`Promise<void>`。
   - 副作用：构造 `StorageData`，包含 `version/timestamp/workspace`。

2. `FileSystemAdapter::save`
   - 入参：`key: 'kg-editor:workspace.json'`、`data: StorageData`。
   - 出参：`Promise<void>`。
   - 副作用：POST `/api/workspace/save`。

3. `workspace/save route::POST`
   - 入参：`{ key, data }`。
   - 出参：`NextResponse<{ success:true }>` 或错误。
   - 副作用：校验 `StorageDataSchema`，写入 `public/workspace/{key}`。

4. 失败处理
   - 入参：非 ok response 或异常。
   - 出参：异常向 `StorageManager.saveWorkspace` 传播。
   - 副作用：调用链可感知失败，但当前主要业务路径没有统一使用该 manager。

### Flow F-006B: Phase 3D Workspace Repository 本体 JSON 保存

触发点：graph persistence middleware 防抖保存、切换 canvas、侧栏创建/删除/重命名画布后调用 `persistWorkspace()`。

1. `canvasSync::saveCurrentCanvasData()`（graph store 自动保存和切换 canvas 时）
   - 入参：当前 workspace store、ontology document store。
   - 出参：void。
   - 副作用：把当前 document 保存为 `Canvas.ontologyDocument`，并同步旧 `graphData` 显示缓存。

2. `utils/workspace/persistence::persistWorkspace()`
   - 入参：无显式参数。
   - 出参：`Promise<boolean>`。
   - 副作用：读取 workspace store，构造 `Workspace` DTO。

3. `data-layer/workspace::saveWorkspace(workspace)`
   - 入参：`Workspace`，包含 canvases、canvasTree、currentCanvasId、userId。
   - 出参：`Promise<boolean>`。
   - 副作用：调用 `createWorkspaceStorageData()` 包装 version/timestamp。

4. `data-layer/workspace::saveWorkspaceStorage(data)`
   - 入参：`StorageData`。
   - 出参：`Promise<boolean>`。
   - 副作用：POST `/api/workspace/save`，body 为 `{ key:'kg-editor:workspace.json', data }`。

5. `workspace/save route::POST`
   - 入参：repository POST body。
   - 出参：`NextResponse<{ success:true }>` 或错误。
   - 副作用：`StorageDataSchema.safeParse()` 校验 `ontologyDocument` 和旧 `graphData`；写入 `public/workspace/kg-editor:workspace.json`。

6. 失败处理
   - 入参：repository 抛出的 Error 或 route validation error。
   - 出参：`persistWorkspace()` 返回 false；middleware 或切换画布路径 console.error。
   - 副作用：不回滚 store；当前没有 dirty/saving UI 状态。

### Flow F-007: 删除节点/分组的一致性清理

触发点：ReactFlow 删除节点、右键/编辑器删除节点或分组，最终调用 graph store 的 `deleteNode(id)` / `deleteGroup(id)`。

1. `basicOperations::deleteNode(id)` 或 `groupOperations::deleteGroup(id)`
   - 入参：`id: string`。
   - 出参：Zustand partial state。
   - 副作用：读取当前 `nodes/edges/edgeVisibility`；后续写 graph store 和 history。

2. `groupOperations::getAllDescendants(id, state.nodes)`（仅 deleteGroup）
   - 入参：`groupId: string`、`nodes: (Node|Group)[]`。
   - 出参：待删除 group 和所有后代节点对象。
   - 副作用：无。

3. `graphConsistency::removeEdgesConnectedToNodesWithVisibility(edges, nodeIds, visibility)`
   - 入参：`edges: Edge[]`、`nodeIds: Iterable<string>`、`visibility?: EdgeVisibility`。
   - 出参：`{ edges, removedEdgeIds, edgeVisibility }`。
   - 副作用：无，纯计算。

4. `graphConsistency::removeEdgesConnectedToNodes(edges, nodeIds)`
   - 入参：最小 `EdgeConnection[]` 和 node id 集合。
   - 出参：剩余 edges 和 removed edge ids。
   - 副作用：无。

5. `edgeVisibility::removeEdgeIdsFromVisibility(visibility, removedEdgeIds)`
   - 入参：当前 visibility 和已删除边 ID。
   - 出参：清理后的 visibility；all/none 保持模式，custom 删除无效 id。
   - 副作用：无。

6. store `set(newState)` + `addHistorySnapshot()`
   - 入参：过滤后的 nodes、edges、edgeVisibility。
   - 出参：void。
   - 副作用：写 graph store；写 history 快照；可能触发 persistence middleware。

### Flow F-008: 边可见性过滤

触发点：用户点击边过滤控件或渲染层同步 edges 到 ReactFlow。

1. `EdgeFilterControl::applyFilter`
   - 入参：`filterType`、`customFilter`、当前 edges/nodes。
   - 出参：void。
   - 副作用：调用 `setCustomEdgeVisibility(ids)` 或 `showAllEdges()`。

2. `edgesSlice::setCustomEdgeVisibility(ids)` / `showAllEdges()` / `hideAllEdges()` / `toggleEdgeVisibility(id)`
   - 入参：目标 edge ids 或 edge id。
   - 出参：newState。
   - 副作用：写 graph store；show/hide/toggle 仍会写 history。

3. `edgeVisibility.ts` command
   - 入参：当前 edges、visibility、目标 ids/id。
   - 出参：新的 `EdgeVisibility`；渲染层按需用 `isEdgeVisible()` 判断单条边。
   - 副作用：无。

4. `GraphPageContent` edge sync effect
   - 入参：`edges`、`edgeVisibility`。
   - 出参：ReactFlow edges。
   - 副作用：调用 `setReactFlowEdges()`。

5. `edgeVisibility::isEdgeVisible(edge.id, visibility)`
   - 入参：edge id 和 visibility。
   - 出参：boolean。
   - 副作用：无。

### Flow F-009: Legacy Graph 映射到 OntologyGraph 并校验

触发点：Phase 2A 测试或未来迁移流程调用 `mapLegacyGraphToOntologyGraph(input)`。

1. `legacyGraphMapper::mapLegacyGraphToOntologyGraph`
   - 入参：`LegacyGraphInput { id:string; name:string; nodes:LegacyGraphBlock[]; edges:LegacyGraphEdge[] }`。
   - 出参：`OntologyGraph`。
   - 副作用：无，纯转换。

2. `legacyGraphMapper::mapLegacyNode`
   - 入参：旧 `node` block，包含 title/content/attributes/tags/groupId。
   - 出参：`OntologyNode`。
   - 副作用：无。

3. `legacyGraphMapper::mapAttributesToFields`
   - 入参：`nodeId:string`、`attributes?:Record<string, unknown>`。
   - 出参：`OntologyField[]`。
   - 副作用：无；将旧 attributes 转成本体节点字段。

4. `legacyGraphMapper::mapLegacyGroup`
   - 入参：旧 `group` block，包含 title/nodeIds/groupId/collapsed。
   - 出参：`OntologyDomain`。
   - 副作用：无。

5. `legacyGraphMapper::attachDomainMembership`
   - 入参：legacy blocks、ontology nodes record、ontology domains record。
   - 出参：void。
   - 副作用：只修改本函数内部新建的 domains record，把旧 group.nodeIds 拆成 nodeIds/domainIds。

6. `legacyGraphMapper::mapLegacyEdge`
   - 入参：旧 edge、ontology nodes record、ontology domains record。
   - 出参：`OntologyEdge`。
   - 副作用：无；推导 relation、direction、domainId。

7. `legacyGraphMapper::createRootSubgraph`
   - 入参：graphId、ontology nodes record、ontology edges record。
   - 出参：`OntologySubgraph`。
   - 副作用：无；生成 `${graphId}:root` 子图。

8. `graph::createOntologyGraph`
   - 入参：图谱 id/name、nodes/edges/domains/subgraphs、metadata。
   - 出参：带 schemaVersion 的 `OntologyGraph`。
   - 副作用：无。

9. `graphValidation::validateOntologyGraph`
   - 入参：`OntologyGraph`。
   - 出参：`OntologyValidationResult { valid:boolean; issues:OntologyValidationIssue[] }`。
   - 副作用：无；调用 nodes/edges/domains/subgraphs 子校验并汇总 issues。

### Flow F-010: OntologyGraph 语义命令更新

触发点：Phase 2B 测试或未来 use-case/store adapter 调用 ontology commands。

1. `graphCommands::createDomain`
   - 入参：`OntologyGraph`、`CreateDomainInput`。
   - 出参：`OntologyCommandResult`。
   - 副作用：无；新增 Domain，并按需更新 parent domain.domainIds。

2. `graphCommands::createClassNode`
   - 入参：`OntologyGraph`、`CreateClassNodeInput`。
   - 出参：`OntologyCommandResult`。
   - 副作用：无；新增 node，并按需更新 domain/subgraph membership。

3. `graphCommands::updateNodeFields`
   - 入参：`OntologyGraph`、`UpdateNodeFieldsInput`。
   - 出参：`OntologyCommandResult`。
   - 副作用：无；替换 node.fields。

4. `graphCommands::createSemanticRelation`
   - 入参：`OntologyGraph`、`CreateSemanticRelationInput`。
   - 出参：`OntologyCommandResult`。
   - 副作用：无；新增 edge，并加入同时包含 source/target 的 subgraph。

5. `graphCommands::moveNodeToDomain`
   - 入参：`OntologyGraph`、`MoveNodeToDomainInput`。
   - 出参：`OntologyCommandResult`。
   - 副作用：无；更新 node.domainId 和 domain.nodeIds。

6. `graphValidation::validateOntologyGraph`
   - 入参：command result graph。
   - 出参：`OntologyValidationResult`。
   - 副作用：无；确认 command 后图结构仍一致。

### Flow F-011: Ontology Document 创建节点/Domain 并桥接到当前画布

触发点：用户在右侧 Toolbar 点击 Add Class / Add Domain，或把节点拖放到画布。

1. `Toolbar`
   - 入参：`selectedNodeId` 和 graph store nodes。
   - 出参：Add Class / Add Domain 按钮文案，以及选中 Domain 的上下文提示。
   - 副作用：无；只通过 `isLegacyOntologyDomainDisplay()` 判断选中对象是否是 Domain 展示对象。

2. `useNodeHandling::onNodeAdd/onGroupAdd/onDrop`
   - 入参：用户点击或拖放事件、`ontologyDocumentStore` 当前 document；若 document 未 hydrate，则 fallback 读取旧 graph store nodes/edges 快照。
   - 出参：新增节点/Domain 的位置、id、名称和 parent domain id。
   - 副作用：调用 `ontologyDocumentStore.applyCommandResult()` 写本体文档；随后仍调用旧 graph store `addNode()`、`addNodeToGroup()` 和 selection action 作为当前显示桥。

3. `ontologyDocumentStore::replaceDocument / createOntologyDocumentFromLegacyGraph`
   - 入参：旧 graph nodes/edges 快照。
   - 出参：`OntologyDocumentState`。
   - 副作用：workspace 加载或 fallback 初始化时写本体 document store；把旧 graph 快照映射成 semantic graph + view state。

4. `createOntologyDocumentState`
   - 入参：`id/name`，可选 `OntologyGraph` 和 `Partial<OntologyViewState>`。
   - 出参：`OntologyDocumentState`。
   - 副作用：无；补齐 graph 对应的 node/domain/edge view state。

5. `createOntologyDomainInDocument`
   - 入参：`OntologyDocumentState`、Domain id/name/parent/position/size。
   - 出参：`OntologyDocumentCommandResult`。
   - 副作用：无；调用 `createDomain()` 更新 semantic graph，同时把位置/尺寸写入 `view.domainViews`。

6. `createOntologyClassNodeInDocument`
   - 入参：`OntologyDocumentState`、node id/name/type/domain/subgraph/fields/position/size。
   - 出参：`OntologyDocumentCommandResult`。
   - 副作用：无；调用 `createClassNode()` 更新 semantic graph，同时把位置/尺寸写入 `view.nodeViews`。

7. `projectOntologyNodeToLegacyNode/projectOntologyDomainToLegacyGroup`
   - 入参：document command result、created id、`includeMembership:false`。
   - 出参：旧 `Node` 或 `Group` 展示对象。
   - 副作用：无；只负责临时投影，语义来源已写入 attributes metadata。

8. `graphStore.addNode` / `graphStore.addNodeToGroup`
   - 入参：旧展示对象和可选 parent domain id。
   - 出参：当前 ReactFlow 旧运行态可渲染的 nodes。
   - 副作用：写 graph store、selection、history/persistence；这是 Phase 3B 后续要替换的显示桥残留。

### Flow F-011B: OntologyDocumentStore 到 ReactFlow 投影和视图更新

触发点：workspace 加载、用户新增/编辑、拖拽、resize、删除、清空或移动视口。

1. `canvasSync::loadCanvasData`
   - 入参：workspace canvas id。
   - 出参：旧 graph store nodes/edges 与 `OntologyDocumentState`。
   - 副作用：调用 `useOntologyDocumentStore.replaceDocument()` 初始化本体文档，同时保留旧 graph store 显示数据。

2. `GraphPageContent::useOntologyDocumentStore(selector)`
   - 入参：`document/sourceCanvasId/hydrated`。
   - 出参：当前投影输入 document。
   - 副作用：若 document 未 hydrate 或 canvas 来源不一致，则 fallback 通过 `createOntologyDocumentFromLegacyGraph()` 初始化一次。

3. `projectOntologyDocumentToReactFlowNodes/Edges`
   - 入参：`OntologyDocumentState`、selection、LOD、viewport bounds、edge visibility。
   - 出参：ReactFlow nodes/edges。
   - 副作用：无；内部通过 legacy display projection 作为当前过渡桥。

4. `GraphPageContent` 交互回写
   - 入参：ReactFlow drag stop、dimension change、edge/node remove、viewport move end/init。
   - 出参：`OntologyInteractionPatch`、`OntologyViewState` 或删除后的 `OntologyGraph`。
   - 副作用：drag stop 先用 `resolveReactFlowNodePersistedPosition()` 把 LOD 显示坐标换回真实坐标，再调用 `commitNodeDrag/commitDomainDrag`；dimension change 先经过 `createResizeCommitGate()` 判断，只有先收到用户 resize 起点的 node id 才调用 `commitNodeResize/commitDomainResize`，LOD style 自动测量直接忽略；随后通过 `ontologyDocumentStore.applyInteractionPatch()` 一次性写本体 view，成功后把本体 document 投影成旧 graph store display cache。viewport 仍调用 `updateViewport`，删除仍调用 `deleteElements` 并同步旧 display store。

5. `canvasSync::saveCurrentCanvasData`
   - 入参：workspace current canvas。
   - 出参：当前 workspace canvas graphData/viewportState。
   - 副作用：若本体 document 已 hydrate 且来源 canvas 匹配，则优先从 `OntologyDocumentState` 投影旧 `graphData.nodes/edges` 保存；否则 fallback 旧 graph store。

### Flow F-012: 右侧编辑器草稿保存与显式容器归属

触发点：用户在右侧属性面板编辑节点或边并点击保存，或在普通节点 Inspector 的 Container 区点击“Move to / Remove from container”。

1. `RightSidebar`
   - 入参：`selectedNodeId` 或 `selectedEdgeId`。
   - 出参：渲染 `NodeInspectorBlock` 或 `EdgeEditor`。
   - 副作用：无直接 I/O；读取 graph store selection。

2. `EdgeEditor::EdgeEditor`
   - 入参：`edgeId:string`。
   - 出参：`EdgeEditorForm`。
   - 副作用：通过 selector 读取目标 edge 和 `updateEdge` action。

3. `EdgeEditorForm`
   - 入参：`edge: Edge`、`updateEdge`。
   - 出参：边属性表单。
   - 副作用：维护本地 `EdgeEditorDraft`，输入变化不写 graph store。

4. `savePlans::createEdgeInspectorSavePlan`
   - 入参：`edge: Edge`、`draft: EdgeEditorDraft`。
   - 出参：`{ ok:true; edgeId; update }` 或 `{ ok:false; error }`。
   - 副作用：无；内部解析 JSON 并调用 `buildEdgeUpdate()`，非法 JSON 阻止保存。

5. `edgesSlice::updateEdge`
   - 入参：edge id 和 update payload。
   - 出参：newState。
   - 副作用：写 graph store edges、updatedAt、history，并可能触发 persistence middleware。

6. `NodeInspectorBlock`
   - 入参：`nodeId:string`。
   - 出参：节点/Domain Inspector、草稿预览、结构化属性编辑器。
   - 副作用：通过 selector 读取目标 node、旧 display nodes、workspace canvas id 和 ontology document。

7. `NodeAttributeEditor`
   - 入参：draft attributes 和 `mode=node/domain`。
   - 出参：字段/方法/规则/接口分区编辑 UI 或 Domain metadata 编辑 UI。
   - 副作用：只回写父级 `NodeEditorDraft.attributes`，不写 store。

8. `savePlans::createNodeInspectorSavePlan`
   - 入参：当前 node id、node 和 draft。
   - 出参：`{ ok:true; nodeId; update; membership; ontology }` 或 `{ ok:false; errors }`。
   - 副作用：无；内部校验节点内容、构造普通字段 update、membership plan 和本体节点/Domain update input。

9. 本体保存分支：`updateOntologyNodeInDocument` / `updateOntologyDomainInDocument`
   - 入参：`OntologyDocumentState` 和 plan.ontology.input。
   - 出参：`OntologyDocumentCommandResult`。
   - 副作用：无；纯函数返回新本体文档，失败时返回 warning；普通节点 domainId 变化时同步更新本体 `node.domainId` 和目标 Domain `nodeIds`。

10. `ontologyDocumentStore::applyCommandResult`
   - 入参：document command result 和 source canvas。
   - 出参：boolean。
   - 副作用：写 `ontologyDocumentStore.document`，让 ReactFlow adapter 的下一次投影来自新本体文档。

11. `interactions::createNodeDomainPlacementPatch`（仅普通节点 membership 变化）
   - 入参：第 10 步后的 `OntologyDocumentState`、nodeId、目标 domainId。
   - 出参：`OntologyInteractionPatch`。
   - 副作用：无；归入容器时选择目标 Domain 内部空位并级联边界，移出容器时返回空 patch 保留绝对位置。

12. `ontologyDocumentStore::applyInteractionPatch`（仅第 11 步有 view patch）
   - 入参：placement patch 和 source canvas。
   - 出参：更新后的 `OntologyDocumentState | null`。
   - 副作用：写 `view.nodeViews/domainViews`，确保归入后节点出现在容器内部。

13. `projectOntologyDocumentToLegacyGraphNodes/Edges`
   - 入参：保存后的 `OntologyDocumentState`。
   - 出参：旧 graph display nodes/edges。
   - 副作用：无；只把本体 document 投影为当前 ReactFlow 过渡显示缓存。

14. `useGraphStore.setState({ nodes, edges })`
   - 入参：第 13 步投影结果。
   - 出参：newState。
   - 副作用：替换旧 display bridge，保证右侧 Inspector 保存或显式归入 / 移出后节点 UI 和画布同步；语义真相源仍是第 9-12 步的本体文档。

### Flow F-012: 画布快捷键删除和节点展开

触发点：用户按 Delete/Backspace，或点击 NoteNode 的展开/折叠按钮。

1. `useKeyboardShortcuts::keydown handler`
   - 入参：ReactFlow instance 当前 nodes/edges。
   - 出参：无。
   - 副作用：只在焦点不在 input/textarea 时处理删除。

2. `canvasDeletion::createCanvasSelectionDeletionPlan`
   - 入参：ReactFlow nodes/edges。
   - 出参：`CanvasDeletionPlan { nodeIds, edgeIds }`。
   - 副作用：无；过滤掉会被节点删除覆盖的 incident edges。

3. `nodesSlice::deleteNode` / `edgesSlice::deleteEdge`
   - 入参：plan 中的 nodeIds/edgeIds。
   - 出参：newState。
   - 副作用：删除节点时由 `removeEdgesConnectedToNodesWithVisibility()` 统一清理 incident edges 和 edgeVisibility。

4. `NoteNode::toggleExpand`
   - 入参：当前节点 id、展开状态、节点尺寸配置。
   - 出参：无。
   - 副作用：调用 `useNodeExpansion.toggleExpand()`。

5. `nodeExpansion::createNodeExpansionPatch`
   - 入参：当前 node、目标展开状态、尺寸 config。
   - 出参：`NodeExpansionPatch`。
   - 副作用：无；只生成展开状态和目标尺寸计划。

6. `domainNesting::commitNodeResize`
   - 入参：当前 `OntologyDocumentState`、node id、目标 width/height 和 expanded。
   - 出参：`OntologyInteractionPatch`。
   - 副作用：无；若节点在 Domain 内，patch 会包含父 Domain 和祖先 Domain 的边界级联更新。

7. `ontologyDocumentStore::applyInteractionPatch`
   - 入参：`OntologyInteractionPatch` 和 canvas source。
   - 出参：更新后的 `OntologyDocumentState | null`。
   - 副作用：写本体 `view.nodeViews[nodeId].expanded/width/height`，只增加一次 revision。

8. `legacy-graph::projectOntologyDocumentToLegacyGraphNodes/Edges`
   - 入参：更新后的本体 document。
   - 出参：旧 graph display cache。
   - 副作用：`useGraphStore.setState({ nodes, edges })` 同步展示缓存；旧 graph store 不再拥有展开尺寸和 Domain 边界真相源。

9. `ClassNodeView::onAddField`
   - 入参：用户点击节点顶栏新增字段按钮，或点击 Fields / Methods / Rules / Interfaces 分区标题右侧新增按钮；分区按钮会传出目标 category。
   - 出参：无。
   - 副作用：只调用 `NoteNode.handleAddField()` callback；UI 组件本身不写 store。

10. `nodeFields::getDefaultOntologyFieldInputForCategory`
   - 入参：目标 `OntologyFieldCategory | undefined`。
   - 出参：默认 namePrefix、dataType 和 category；未传时为普通 attribute。
   - 副作用：无；把 Methods / Rules / Interfaces 分区新增动作固定映射到本体字段默认值。

11. `nodeFields::appendDefaultOntologyField`
   - 入参：当前 `OntologyNode` 和分类默认值。
   - 出参：追加默认字段后的 `OntologyField[]`。
   - 副作用：无；生成唯一 `attribute/attribute2/...`、`method/method2/...`、`rule/rule2/...` 或 `interface/interface2/...` 字段名。

12. `updateOntologyNodeInDocument`
   - 入参：当前 document、`{ nodeId, fields }`。
   - 出参：`OntologyDocumentCommandResult`。
   - 副作用：无；更新 semantic graph 中的 node.fields。

13. `ontologyDocumentStore::applyCommandResult`
   - 入参：字段更新 command result 和 canvas source。
   - 出参：boolean。
   - 副作用：写本体 document；成功后 `NoteNode` 把 document 投影成旧 display cache。

14. `NodeFieldList` 行内输入
   - 入参：用户在 full LOD 字段行中编辑 name/value/dataType，失焦或按 Enter；或选择字段 category。
   - 出参：`NodeFieldChangePatch`。
   - 副作用：无；input 只在本地 DOM 中暂存草稿，提交前不写 store；category select 会先提交当前草稿再提交分类变更。

15. `NoteNode.handleFieldChange`
   - 入参：field id 和 `NodeFieldChangePatch`。
   - 出参：无。
   - 副作用：调用本体字段 helper 和 document command；成功后同步旧 display cache。

16. `nodeFields::updateOntologyField`
   - 入参：当前 `OntologyField[]`、field id、patch。
   - 出参：更新后的 `OntologyField[]`，或无有效变化时返回原数组引用。
   - 副作用：无；trim 字段名，空 value/dataType 归一化为 undefined，category 变更会影响下一次 ViewModel 分区投影。

17. `NodeFieldList` 删除 / 排序按钮
   - 入参：用户点击删除、上移或下移图标。
   - 出参：field id、move direction 和当前可见分区的 field id 顺序。
   - 副作用：无；只调用 `ClassNodeView.onFieldDelete/onFieldMove`。

18. `NoteNode.handleFieldDelete` / `NoteNode.handleFieldMove`
   - 入参：field id，或 field id + direction + orderedFieldIds。
   - 出参：无。
   - 副作用：调用 `deleteOntologyField()` 或 `moveOntologyField()`，再通过 document command 写本体 `fields[]`，成功后同步旧 display cache。

19. `NodeSection` 折叠按钮
   - 入参：用户点击 Fields/Methods/Rules/Interfaces/Relationships 分区标题按钮。
   - 出参：section id。
   - 副作用：无；只调用 `ClassNodeView.onToggleSection`。

20. `NoteNode.handleToggleSection`
   - 入参：section id。
   - 出参：无。
   - 副作用：写本体 `view.nodeViews[nodeId].collapsedSections`，并把最新 document 投影成旧 display cache。

21. `DomainNodeView` 折叠按钮
   - 入参：用户点击容器节点标题区的折叠 / 展开按钮。
   - 出参：无。
   - 副作用：无；只调用 `GroupNode.handleToggleCollapsed`。

22. `GroupNode.handleToggleCollapsed`
   - 入参：当前 group id 和当前本体 domain view collapsed 状态。
   - 出参：无。
   - 副作用：通过 `ontologyDocumentStore.updateDomainView()` 写 `view.domainViews[domainId].collapsed`，再把最新 document 投影为旧 graph display cache。

23. `ClassNodeView` / `DomainNodeView` 内部空间入口
   - 入参：用户点击节点或容器上的内部空间入口。
   - 出参：无。
   - 副作用：当前 Phase B 只暴露 `onEnterSubcanvas/onEnterInternalSpace` 回调契约；真正子画布导航、Breadcrumb 和历史恢复放在 Phase E。

### Flow F-013: LayoutControl 触发布局并应用结果

触发点：用户点击“应用布局”或“布局群组内部”按钮。

1. `LayoutControl::handleLayout` / `handleGroupLayout`
   - 入参：graph store 中的 nodes、edges、selectedNodeId。
   - 出参：无。
   - 副作用：设置 `isProcessing`，全画布布局会清空 selection。

2. `layoutControl::createCanvasLayoutOptions` / `createGroupLayoutOptions`
   - 入参：全画布无入参；群组布局入参为 groupId。
   - 出参：`LayoutOptions` 兼容对象。
   - 副作用：无；策略 ID 由 feature model 统一生成。

3. `LayoutManager.applyLayout`
   - 入参：旧 graph nodes、edges 和 layout options。
   - 出参：`LayoutResult { success, nodes, edges, errors, stats }`。
   - 副作用：调用 ELK layout strategy；strategy 首次执行时按需动态加载 elkjs，写 console。

4. 成功分支：`layoutControl::createLayoutNodeUpdate`
   - 入参：layout result 中的 node position/size/boundary。
   - 出参：`updateNode()` patch。
   - 副作用：无；群组内部布局会额外写 style size。

5. 成功分支：`nodesSlice::updateNode`
   - 入参：nodeId 与 node patch。
   - 出参：newState。
   - 副作用：写 nodes/history/persistence；布局模式期间跳过 group boundary 约束。

6. 成功分支：`layoutControl::createLayoutEdgeUpdate` + `edgesSlice::updateEdge`
   - 入参：layout result 或 EdgeOptimizer 输出的 handle 信息。
   - 出参：edge patch 与 newState。
   - 副作用：写 edge sourceHandle/targetHandle。

7. 群组布局额外分支：`updateGroupBoundary(targetGroupId)`
   - 入参：目标 group id。
   - 出参：void/newState。
   - 副作用：更新 group boundary。

## 7. 外部集成详情

初步识别：

- Next.js 本地 API Routes：`/api/layout`、`/api/workspace/load`、`/api/workspace/save`（待精读）。
- 后端 Flask API：README 声明运行于 `http://localhost:5001`，Docker compose 注入 `NEXT_PUBLIC_API_BASE_URL=http://localhost:5001`。
- PostgreSQL：compose 中 `postgres:15`，`DATABASE_URL=postgresql://user:password@db:5432/kg_editor`。
- Redis：compose 中 `redis:7-alpine`，`REDIS_URL=redis://redis:6379`。
- 文件系统持久化：`frontend/public/workspace/kg-editor:workspace.json` 由 `/api/workspace/load|save` 读写；前端调用面已收口到 `data-layer/workspace/workspaceRepository.ts`。

## 8. 数据模型与契约

### Ontology Model

`OntologyGraph`

| 字段 | 类型 | 约束/说明 |
|------|------|-----------|
| `id` | `string` | 图谱 ID，不能为空，validator 报 `GRAPH_ID_EMPTY` |
| `name` | `string` | 图谱名称，不能为空 |
| `schemaVersion` | `number` | 当前必须等于 `ONTOLOGY_SCHEMA_VERSION = 1` |
| `nodes` | `Record<string, OntologyNode>` | 语义节点真相源，key 必须等于 node.id |
| `edges` | `Record<string, OntologyEdge>` | 语义关系真相源，key 必须等于 edge.id |
| `domains` | `Record<string, OntologyDomain>` | 语义域/上下文边界，key 必须等于 domain.id |
| `subgraphs` | `Record<string, OntologySubgraph>` | 子图导航结构，key 必须等于 subgraph.id |
| `metadata` | `Record<string, unknown>?` | 迁移来源等非核心信息 |

`OntologyNode`

| 字段 | 类型 | 约束/说明 |
|------|------|-----------|
| `id` | `string` | 节点 ID |
| `name` | `string` | 节点显示/语义名称，不能为空 |
| `type` | `OntologyNodeType` | `Class/Concept/Function/Component/Information/Interface/Constraint` |
| `description` | `string?` | 描述文本，legacy mapper 从 summary/content 派生 |
| `fields` | `OntologyField[]` | 类图式节点内部字段 |
| `tags` | `string[]` | 标签 |
| `domainId` | `string?` | 所属 `OntologyDomain`，validator 要求存在 |
| `subgraphId` | `string?` | 节点可跳转子图 ID，Phase 2A 未强校验 |

`OntologyField`

| 字段 | 类型 | 约束/说明 |
|------|------|-----------|
| `id` | `string` | 节点内字段 ID，同一节点内不能重复 |
| `name` | `string` | 字段名，不能为空 |
| `value` | `string?` | 字段值，legacy mapper 转成稳定字符串 |
| `dataType` | `string?` | 数据类型，如 string/number/array/object/text |
| `category` | `OntologyFieldCategory` | `attribute/rule/constraint/interface/behavior` |

`OntologyEdge`

| 字段 | 类型 | 约束/说明 |
|------|------|-----------|
| `id` | `string` | 边 ID |
| `source/target` | `string` | 必须指向存在的 `OntologyNode` |
| `relation` | `string` | 关系谓词，不能为空 |
| `direction` | `OntologyRelationDirection` | `unidirectional/bidirectional/undirected` |
| `domainId` | `string?` | 所属 domain，若存在必须有效 |

`OntologyDomain`

| 字段 | 类型 | 约束/说明 |
|------|------|-----------|
| `id` | `string` | domain ID |
| `name` | `string` | domain 名称，不能为空 |
| `nodeIds` | `string[]` | 包含的语义节点 ID，必须存在 |
| `domainIds` | `string[]` | 子 domain ID，必须存在且不能等于自身 |
| `parentDomainId` | `string?` | 父 domain，必须存在且不能形成 parent cycle |
| `collapsed` | `boolean` | 持久化的折叠意图 |

`OntologySubgraph`

| 字段 | 类型 | 约束/说明 |
|------|------|-----------|
| `id` | `string` | 子图 ID |
| `name` | `string` | 子图名称 |
| `rootNodeId` | `string?` | 子图入口节点，若存在必须有效 |
| `domainId` | `string?` | 子图所属 domain，若存在必须有效 |
| `nodeIds` | `string[]` | 子图内节点 ID |
| `edgeIds` | `string[]` | 子图内边 ID |

`OntologyNodeViewState`

| 字段 | 类型 | 约束/说明 |
|------|------|-----------|
| `id` | `string` | 对应 ontology node id |
| `position` | `{ x: number; y: number }` | 本体 view 绝对坐标真相源 |
| `width/height` | `number` | 用户保存的真实节点尺寸，不能被 LOD 显示尺寸污染 |
| `expanded` | `boolean?` | 节点展开状态 |
| `customExpandedSize` | `{ width; height }?` | 用户自定义展开尺寸 |
| `collapsedSections` | `string[]?` | 节点内部 Fields/Methods/Rules/Interfaces/Relationships 分区折叠状态 |

### Graph Model

`BlockEnum`

| 值 | 含义 |
|----|------|
| `node` | 普通节点 |
| `group` | 分组节点 |

`Node`

| 字段 | 类型 | 约束/说明 |
|------|------|-----------|
| `id` | `string` | 必填，节点 ID |
| `type` | `BlockEnum.NODE` | 固定为 `node` |
| `position` | `{ x: number; y: number }` | 必填，当前以绝对坐标保存，渲染时可能转相对坐标 |
| `title` | `string` | Zod schema 要求非空 |
| `content` | `string?` | Markdown/文本内容 |
| `attributes` | `Record<string, unknown>?` | 通用结构化属性，尚非本体字段模型 |
| `tags` | `string[]?` | 标签 |
| `summary` | `string?` | 摘要 |
| `groupId` | `string?` | 所属 Group |
| `isExpanded` | `boolean?` | 展开状态 |
| `customExpandedSize` | `{ width: number; height: number }?` | 用户自定义展开尺寸 |
| `collapsedSections` | `string[]?` | 旧 display cache 中的节点分区折叠投影，真相源仍是 `OntologyNodeViewState` |
| `style` | `CSSProperties?` | 视图样式混入模型 |
| `createdAt/updatedAt` | `Date` | Zod schema 要求 Date |

`Group`

| 字段 | 类型 | 约束/说明 |
|------|------|-----------|
| `id` | `string` | 必填 |
| `type` | `BlockEnum.GROUP` | 固定为 `group` |
| `title` | `string` | Zod schema 要求非空 |
| `collapsed` | `boolean` | 折叠标志 |
| `nodeIds` | `string[]` | 直接包含的 Node 或 Group ID |
| `groupId` | `string?` | 父 Group，支持嵌套 |
| `boundary` | `{ minX; minY; maxX; maxY }` | Group 边界 |
| `attributes/tags/summary/style` | mixed | 与 Node 类似 |

`Edge`

| 字段 | 类型 | 约束/说明 |
|------|------|-----------|
| `id` | `string` | 必填 |
| `source/target` | `string` | 节点 ID |
| `sourceHandle/targetHandle` | `string?` | ReactFlow handle ID |
| `label` | `string?` | 关系显示标签 |
| `groupId` | `string?` | 所属分组候选 |
| `data.direction` | `'unidirectional' \| 'bidirectional' \| 'undirected'?` | 方向性 |
| `data.customProperties` | `Record<string, unknown>?` | 任意扩展属性 |

本体差距：当前已有 `OntologyNode.fields[]`，但还没有 `OntologyNode.kind`、一等 `RelationType`、`predicate`、`domain/range`、`axiom`、字段排序和字段分类迁移命令等结构。

### Graph View / History Contract

| 状态 | 类型 | 说明 |
|------|------|------|
| `viewport` | `{ x: number; y: number; zoom: number }` | graph store 中存在；Phase 2C 后 canvasSync 按类型读取 |
| `canvasSize` | `{ width: number; height: number }` | 当前画布尺寸 |
| `history` | `{ nodes: (Node|Group)[]; edges: Edge[] }[]` | 最多 50 个全图快照，浅拷贝数组 |
| `edgeVisibility` | `{ mode: 'all' \| 'none' \| 'custom'; ids: string[] }` | Phase 0 新增的边可见性真相源 |

### Workspace Model

`PersistedOntologyCanvas`

| 字段 | 类型 | 约束/说明 |
|------|------|-----------|
| `persistenceVersion` | `number` | 当前为 1 |
| `graph` | `OntologyGraph` | 本体语义真相源 |
| `view.nodeViews/domainViews/edgeViews` | records | 只保存位置、尺寸、collapsed/expanded、node collapsedSections、handle 和显示数据 |
| `view.viewport` | `{ x; y; zoom }` | 持久化视口 |
| `view.lod` | `'full' \| 'compact' \| 'outline' \| 'dot'` | 当前 LOD 模式 |
| `view.edgeVisibility` | `{ mode; ids }` | 边显示白名单状态 |
| `revision` | `number` | document 修订号 |
| `savedAt` | `string?` | 保存时间 ISO 字符串 |

`Canvas`

| 字段 | 类型 | 约束/说明 |
|------|------|-----------|
| `id` | `string` | 必填 |
| `name` | `string` | Zod 要求非空 |
| `parentId` | `string \| null` | 支持画布树层级 |
| `children` | `string[]` | 子画布 ID |
| `ontologyDocument` | `PersistedOntologyCanvas?` | Phase 3D 新增，workspace 持久化真相源 |
| `graphData.nodes` | `(Node \| Group)[]` | 旧 ReactFlow 显示缓存，不再是真相源 |
| `graphData.edges` | `Edge[]` | 旧 ReactFlow 显示缓存，不再是真相源 |
| `viewportState` | `{ x: number; y: number; zoom: number }` | 画布视口 |
| `isCollapsed` | `boolean` | 画布树折叠状态 |
| `createdAt/updatedAt` | `Date` | schema 支持 Date 或可 coercion 的字符串 |

`Workspace`

| 字段 | 类型 | 约束/说明 |
|------|------|-----------|
| `userId` | `string` | 当前用户 ID |
| `currentCanvasId` | `string` | 当前画布 |
| `canvases` | `Canvas[]` | 所有画布 |
| `canvasTree` | `CanvasTreeNode[]` | 树形导航结构 |

## 9. 风险与隐患登记册

| 严重级别 | 位置 | 触发条件 | 影响 | 建议修复 |
|----------|------|----------|------|----------|
| FIXED | `docker-compose.yml` 服务 `frontend.build` / `backend.build` | 执行 `docker-compose up -d` | 原 compose 查找 `./frontend/Dockerfile` 和 `./backend/Dockerfile`，但实际文件在根目录 | Phase 0 已修正为根目录 context + `Dockerfile.frontend` / `Dockerfile.backend` |
| FIXED | `frontend/tailwind.config.ts` `content` | 依赖 Tailwind 扫描生成样式 | 原配置扫描 `./src/**`，实际源码不在 `src` | Phase 0 已改为扫描真实源码目录 |
| FIXED | `frontend/components.json` `tailwind.css` | 使用 shadcn CLI 或新增 UI primitive | 原配置指向 `src/app/globals.css`，实际是 `app/globals.css` | Phase 0 已修正为 `app/globals.css` |
| P1 | `frontend/package-lock.json` + `frontend/pnpm-lock.yaml` | 安装依赖或 Docker 构建 | 不同包管理器解析依赖树，可能出现本地和容器版本漂移 | 明确 npm 或 pnpm 单一策略，删除另一套锁文件并调整 README/Dockerfile |
| P1 | `frontend/types/graph/models.ts` `CommonNodeType` | 任意模块向节点写入未声明字段 | Phase 2C 已把 `[key: string]: any` 收敛为 `unknown`，并删除旧转换缓存字段；但领域模型、ReactFlow 运行时字段和 view state 仍混在一个旧 graph model 中 | 拆分 Domain Model、View Model、ReactFlow Adapter Model，最终去掉开放索引 |
| FIXED | `frontend/components/graph/core/hooks/useNodeHandling.ts` `onNodeAdd/onGroupAdd/onDrop` | 用户新增节点、Domain 或拖放节点 | 原新增主链路直接创建旧 `BlockEnum.NODE/GROUP`，没有调用 `createClassNode()` 或写入本体文档；这会把旧 runtime 固化成事实真相源 | Phase 3B 第二批已改为先构造 `OntologyDocumentState`，再调用 `createOntologyClassNodeInDocument()` / `createOntologyDomainInDocument()`；旧 `Node/Group` 只由 `legacy-graph` adapter 临时投影用于当前画布显示 |
| FIXED | `frontend/components/graph/core/GraphPageContent.tsx` `onNodeDragStop` / `onNodesChange(dimensions)` | 用户拖动 Domain、拖动 Domain 内节点、resize 节点/Domain，或缩放触发 LOD style change | Phase 3D 后 ReactFlow 投影真相源是 `OntologyDocumentState`，但 Domain 移动的后代 offset、节点约束后的最终坐标、Domain 边界级联曾主要写旧 graph store；resize 中也可能被本体投影覆盖 ReactFlow 本地尺寸，导致点击或重新投影后节点回弹、子节点跑出 Domain、resize 手感一卡一卡；LOD 显示尺寸缩小后，远景拖拽还可能把显示左上角误写成真实位置；ReactFlow 自动 dimensions 测量也可能把 LOD 小尺寸误写为真实尺寸，造成放大不恢复 | Phase 3E-A 已新增 `domainNesting.ts` 本体 view 交互事务；Phase A 第一批已让 nodes sync 在 drag/resize 中跳过投影覆盖，resize 结束后通过 `commitNodeResize/commitDomainResize` 一次性提交本体 view、级联边界和边锚点；2026-05-08 后 drag stop 会把 LOD 显示坐标反算回真实坐标再提交，且 `createResizeCommitGate()` 会忽略没有用户 resize 起点的自动 dimensions 测量 |
| FIXED | `frontend/components/graph/core/hooks/useNodeExpansion.ts` `toggleExpand` | 节点在 Domain 内展开/折叠导致尺寸变化 | 原展开/折叠仍直接写旧 graph store，并只单点写本体 node view，未触发 Domain 边界级联；下一次投影可能让 Domain 尺寸回退或裁掉展开节点 | Phase 3E-A 已改为 `createNodeExpansionPatch()` 生成目标尺寸，再调用 `commitNodeResize()` 写本体 `expanded/width/height` 和 Domain boundary cascade；旧 graph store 只接收本体 document 投影后的 display cache |
| P1 | `frontend/services/layout/algorithms/EdgeOptimizer.ts` + `GraphPageContent.optimizeEdgesAfterViewChange` | 拖拽或 resize 后触发边锚点优化 | 2026-05-07 已把输出从旧 `updateEdge()` 改为本体 `edgeViews` patch，锚点不再被下一次本体投影覆盖；但 optimizer 输入仍读取旧 graph display objects，且边渲染仍是贝塞尔，不是 PRD 目标正交边 | Phase D 实现正交边、语义锚点和边 LOD；Phase G 再把 edge optimizer 改为本体 DTO 输入 |
| FIXED | `frontend/components/graph/nodes/NoteNode.tsx` 旧 Note 卡片 UI / 节点上新增属性和行内编辑缺失 | 用户查看本体节点、从节点上快速新增属性、直接改字段、切换分类、删除/排序字段、按分区新增字段、折叠字段分区或查看节点状态 | 原节点 UI 仍偏 Markdown Note，不能直接表达本体类型/字段；节点上没有真实新增字段入口、字段行内编辑、分类切换、删除、排序、按分区新增、分区折叠摘要或状态表达；如果继续由 UI 直接拼旧 attributes，后续参考图里的方法/关系/子画布摘要会再次和交互逻辑耦合 | Phase B 已完成节点 UI 产品化：`ClassNodeView` 展示 Fields/Methods/Rules/Interfaces/Relationships/Child Nodes 统计和 LOD；节点顶栏和分区按钮通过 `getDefaultOntologyFieldInputForCategory + appendDefaultOntologyField + updateOntologyNodeInDocument` 写本体 fields；`NodeFieldList` 支持行内编辑 name/value/dataType/category、删除和分区内排序；分区折叠保存到本体 `nodeViews.collapsedSections`，折叠后显示摘要；hover/selected/readonly/disabled 状态已有 Phase B 表达 |
| FIXED | `frontend/components/graph/nodes/BaseNode.tsx` / `GroupNode.tsx` / legacy node editors | 用户使用 BaseNode fallback 编辑、编辑 Domain 标题、折叠 Domain、显式归入/移出容器或打开旧节点编辑器 | Phase B2 已让 NoteNode/GroupNode 使用 `surface="transparent"`，GroupNode 不再渲染旧标题栏或直接 `updateNode()`；2026-05-08 已删除旧 `NodeEditor`、`ContentEditor`、`StructuredAttributeEditor` 和 `NoteNodeEdit` | 节点/Domain 编辑入口统一走 `NodeInspectorBlock`；Domain 折叠切换由 `DomainNodeView -> GroupNode.handleToggleCollapsed -> ontologyDocumentStore.updateDomainView` 写本体 view；普通节点显式归入/移出由 Inspector Container 快捷按钮写本体 `domainId/nodeIds` 并用 `createNodeDomainPlacementPatch()` 调整位置；后续只在最终 UI 上继续补 Domain 自身父容器归属和交互性能 |
| P0 | `ITERATION_LOG.md` 后续阶段开工记录 | 上下文压缩、恢复会话或继续后续代码开发 | 如果未先阅读 `ACTIVE_DOCS`、当前路线图和 UI 参考规格，容易重新偏向旧 graph store、把 ReactFlow 相对坐标当真相源、跳过 UI 图、提前做算法、绕过 data-layer，或恢复临时导入主线 | 开工前必须按 `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md` 记录已读章节、本轮不变量、禁止事项和验收命令；UI 任务还必须记录已读 `UI_REFERENCE_INTERACTION_SPEC_2026-05-07.zh-CN.md` 并查看 `UI_iamge/`；没有记录不进入代码修改 |
| P0 | `UI_REFERENCE_INTERACTION_SPEC_2026-05-07.zh-CN.md` / `UI_iamge/` | 开始节点 UI、LOD、正交边、子画布导航任务 | 如果只看旧产品规格或旧 Phase 文档，可能把四张 UI 图中的节点状态、边类型、LOD 层级、MiniMap、Breadcrumb 和搜索定位遗漏 | UI/交互任务开工声明必须列出本轮采用哪张图、采用哪些元素、暂缓哪些元素；完成后回写落地和暂缓项 |
| P1 | `frontend/domain/ontology/model/node.ts` / `edge.ts` / `subgraph.ts` | 按新概念图继续实现节点 UI、正交边或子画布导航 | 当前节点模型有 `fields[]/subgraphId` 雏形，边模型只有自由字符串 `relation`，子图只有 `nodeIds/edgeIds`；如果后续继续把 methods、语义锚点、route points、navigation history 都塞进 `metadata/display`，会形成新的隐形旧实现 | 按 `UI_REFERENCE_INTERACTION_SPEC_2026-05-07.zh-CN.md` §9 分层处理：短期 UI 映射，中期补明确 view state，Phase D/E 做 schema 演进和迁移 |
| P1 | `frontend/stores/graph/*` 旧 graph store | 布局、历史、边优化仍读取旧 display objects | Phase 3D 后持久化真相源已转为 `Canvas.ontologyDocument`，主画布投影/新增/关系/节点编辑/视图更新优先走本体文档；旧 graph store 仍作为 ReactFlow 显示桥和 layout/history/edge optimizer 输入存在 | 继续迁移 layout、history、edge optimizer 到本体 DTO 或 command patch，最后删除旧 graph store 和 `Canvas.graphData` |
| P1 | `frontend/domain/ontology/mappers/legacyGraphMapper.ts` `mapLegacyGraphToOntologyGraph` | 旧 edge 指向 group 或已缺失节点 | mapper 会保留该 edge 到 OntologyGraph，validator 会报缺失端点；当前还没有自动修复/降级策略 | Phase 2B command/import 流程应在 apply 前处理 invalid edges，给 UI 返回 warnings |
| P1 | `frontend/stores/graph/index.ts` `ENABLE_AUTO_PERSISTENCE` | 关闭新布局或调整持久化策略 | `NEXT_PUBLIC_USE_NEW_LAYOUT` 同时控制 UI 布局和持久化中间件，语义耦合 | 新增 `NEXT_PUBLIC_ENABLE_GRAPH_PERSISTENCE` 或应用配置对象 |
| P2 | `frontend/components/workspace/WorkspaceLayout.tsx` `WorkspaceLayout` | 调整 UI 尺寸、标题、布局样式 | 布局参数硬编码在 JSX 中，不利于配置化和 UI 单独调整 | 建立 `ui-tokens` / `layout.config.ts`，布局组件只消费配置 |
| FIXED | `frontend/components/graph/core/GraphPageContent.tsx` edge sync effect | 用户点击“隐藏全部边”后旧 `visibleEdgeIds=[]` | 原渲染层把空数组解释为“不过滤，全部显示” | Phase 0 已让渲染层优先读取 `edgeVisibility.mode`；Phase 2B 已删除旧字段 |
| FIXED | `frontend/components/graph/core/GraphPageContent.tsx` `useGraphStore()` 整 store 订阅 | 任意 graph store 状态变化 | 原主画布容器订阅整个 store，selection/history/持久化相关变化也会重渲染主画布 | Phase 2C 已拆为独立 selector；后续仍需把 selection/view/persistence 拆 store |
| FIXED | `frontend/components/graph/core/GraphPageContent.tsx` edge sync effect | 边数和节点数增长 | 原每条边都 `storeNodes.find()` 查 source/target，形成 O(E*N) 映射 | Phase 2C 已用 `storeNodeById: Map` 做 O(1) 查找；后续进入 adapter 缓存 |
| FIXED | `frontend/components/graph/core/GraphPageContent.tsx` / `features/ontology-canvas/adapters/react-flow/projection.ts` ReactFlow projection | 节点数量超过 80 且画布可获取视口，用户缩放到 compact/outline/dot，或用户折叠 Domain/容器 | 原每次同步都把全部 nodes/edges 投给 ReactFlow，屏幕外复杂节点也进入渲染树；早期 LOD 只改变内部内容，普通节点外框仍保持近景尺寸；容器折叠后内部后代仍可能完整投影 | Phase 3A 已加入 viewport bounds、RAF 节流、节点裁剪和端点边过滤；Phase C0 第一批已让普通节点外框按 `lodDisplayDimensions` 缩小并保持中心点稳定；新 UI 交互稳定第一批已让折叠容器隐藏内部后代，并过滤隐藏端点 / 缺失端点边；后续仍需 cache、容器聚合、摘要边和边 LOD |
| FIXED | `frontend/components/graph/nodes/GroupNode.tsx` LOD 展示 | 缩放到 0.85 以下，或查看/折叠容器 | 原 Domain/Group UI 仍是旧蓝色 group 标题栏，未按 compact/outline/dot 降级，也不能表达容器摘要、状态或内部空间入口 | Phase B 已新增 `DomainNodeView` 和 `buildOntologyDomainViewModel()`；GroupNode 透传 `ontologyDomainViewModel`、collapsed 和 lodMode，容器 UI 按 full/compact/outline/dot 渲染摘要，并具备 hover/selected/readonly/disabled 状态、折叠摘要和内部空间入口 |
| P1 | `features/ontology-canvas/adapters/react-flow/projection.ts` 容器 LOD display size | 缩放到远景且 Domain/容器未折叠或尚未进入聚合视图 | 如果像普通节点一样直接缩小 Domain 外框，仍可见的内部子节点会看起来跑出父容器，且 ReactFlow parent extent / 嵌套边界判断会产生错觉 | Phase A4 第一批已解决“折叠时隐藏内部后代”；Phase C2 仍需做容器摘要、聚合视图、摘要边和远景容器外框缩小，完成后再允许 Group/Domain 使用独立 LOD display size |
| P1 | `frontend/stores/graph/persistenceMiddleware.ts` `store.subscribe` | 拖拽、选中、resize、history 等高频操作 | 任意 graph store 变化都触发防抖保存，Phase 3D 已改为保存 ontologyDocument 但仍会产生不必要 I/O 和 workspace store 替换 | 仅订阅本体 document/view revision；拖拽中暂停；引入 dirty/saving 状态 |
| FIXED | `frontend/utils/workspace/canvasSync.ts` `saveCurrentCanvasData` | 保存/切换 canvas | 原实现读取 `(graphStore as any).viewport`，若真实字段不匹配会丢失视口 | Phase 2C 已改为按 graph store 类型读取 `viewport/nodes/edges` |
| FIXED | `frontend/stores/graph/edgesSlice.ts` `hideAllEdges` + `GraphPageContent` edge filter | 用户执行 hide all edges | 原 `visibleEdgeIds=[]` 同时表达 none/all，功能不可用 | Phase 0 已引入显式 edge visibility mode；Phase 2B 已删除旧字段 |
| P1 | `frontend/stores/workspace/canvasSlice.ts` `createCanvas` | 在父 canvas 下创建子 canvas | `parentCanvas.children.push()` 直接修改已有 canvas 对象，可能破坏 Zustand 不可变更新假设 | 用 map 复制父 canvas：`children: [...c.children, newCanvas.id]` |
| P1 | `frontend/stores/graph/historySlice.ts` `addHistorySnapshot` | 大图频繁编辑 | 每次保存全量 nodes/edges 浅快照，内存增长快，且对象突变会污染历史 | 改为命令栈/patch history，或至少 structuredClone 持久字段 |
| P2 | `frontend/stores/graph/edgesSlice.ts` `showAllEdges/hideAllEdges/toggleEdgeVisibility` | 用户只改变边过滤视图 | UI 过滤进入 undo/redo 历史，撤销语义混乱 | 将 view state 移出 graph history，或标记非持久 UI action |
| FIXED | `frontend/stores/graph/nodes/groupOperations.ts` `updateGroup` | 调用 `updateGroup(id, { nodeIds })` | 原 map 回调返回整个 `updatedNodes` 数组，导致 `nodes` 变成嵌套数组 | Phase 0 已把 nodeIds 同步计算移到 map 外，每个分支只返回单个节点 |
| FIXED | `frontend/stores/graph/nodes/basicOperations.ts` `deleteNode` / `groupOperations.ts` `deleteGroup` | 删除有连边的节点或 group | 原实现只删除 nodes，不删除相关 edges，留下孤儿边 | Phase 0 已同步过滤 source/target 命中删除集合的 edges |
| P1 | `frontend/stores/graph/nodes/groupBoundaryOperations.ts` `updateSingleGroupBoundary` | 100ms 内同一组子节点移动或 resize | 缓存 key 只有 nodeIds，不含 position/size，可能复用过期边界 | cache key 加入 child position/size/version，或移除该缓存 |
| FIXED | `frontend/stores/graph/nodes/conversionOperations.ts` 旧 Node/Group 转换链路 | Group 转 Node 后保存/导出 graphData | 原 `_hiddenByConversion` 等 UI 字段进入持久化数据和语义图 | Phase 2C 已删除转换 slice、UI 按钮、adapter 过滤和模型缓存字段；旧 workspace JSON 里的历史字段后续可做数据迁移清理 |
| P1 | `frontend/utils/graph/nestingHelpers.ts` `getAllDescendants` | 数据损坏或循环嵌套绕过校验 | 递归无 visited set，可能栈溢出 | 所有递归遍历增加 visited set 和循环错误返回 |
| FIXED | `frontend/components/graph/editors/EdgeEditor.tsx` 旧 `useEffect([formData, edge, updateEdge])` | 用户编辑边表单任意字段 | 原实现每次输入都写全局 edge、写 history、触发 persistence | Phase 2B 已改为本地 draft + 显式保存，JSON 不合法时不写 store |
| FIXED | `frontend/components/graph/editors/NodeEditor.tsx` 旧 `handleSave/handleRemoveFromGroup` | 用户从右侧编辑器修改 Group | 原实现直接写 `node.groupId`，不维护 `Group.nodeIds`，导致父子关系双写不一致 | Phase 2B 已让 membership 改动走 `addNodeToGroup/removeNodeFromGroup`，普通 `updateNode` payload 不含 `groupId` |
| FIXED | `frontend/components/graph/editors/NodeEditor.tsx` `handleSave` legacy sync | 用户编辑节点标题、属性或分组 | Phase 3B 为避免打断旧编辑器，NodeEditor 保存后仍从旧 graph store 重新 hydrate 本体文档；这会让旧 graph model 继续影响节点编辑语义 | Phase 3C 已新增 `updateOntologyNodeInDocument` / `updateOntologyDomainInDocument` 和 ontology save plan；NodeEditor 保存直接写 ontology document，旧 graph store 只接收 display update |
| FIXED | `frontend/components/graph/core/hooks/useNodeExpansion.ts` 旧本地展开状态 effect | store 中节点展开状态变化 | 原 hook 持有本地 `isExpanded` 并在 effect 里同步 setState，造成重复状态和级联 render 风险 | Phase 2C 改为从 store/node data 派生状态，展开 patch 由 feature model 生成 |
| FIXED | `frontend/components/graph/core/hooks/useKeyboardShortcuts.ts` 旧删除路径 | 用户选中节点后按 Delete/Backspace | 原快捷键先遍历边手动删 incident edges，再删节点；与 `deleteNode()` 的一致性清理重复 | Phase 2C 改为 `createCanvasSelectionDeletionPlan()`，incident edges 统一交给 `deleteNode()` |
| FIXED | `frontend/components/graph/core/nodeSyncUtils.ts` unsafe adapter typing / 旧转换过滤 | store nodes 投影到 ReactFlow nodes | 原 adapter 内多处 `any` 掩盖 `_hiddenByConversion`、parent group 和 style 字段边界，且 projection 放在 legacy component core 目录 | Phase 2C 已删除旧文件，projection 迁入 `features/ontology-canvas/adapters/react-flow`，并删除旧转换隐藏字段过滤 |
| FIXED | `frontend/features/ontology-canvas/adapters` 架构边界缺失 | 后续继续添加 adapter 文件 | adapter 若直接 import store/components/fetch，会再次把 UI/功能/数据层耦合起来 | Phase 2C 已将 adapters 纳入 `check-architecture-boundaries.mjs`，允许 ReactFlow DTO，禁止 store/UI/fetch/CSS |
| FIXED | `frontend/components/graph/controls/LayoutControl.tsx` 控制层 patch 拼装 | 用户触发全画布或群组内部布局 | 原 TSX 内直接拼 layout options、节点 update patch、边 update patch，并用多处 `any` 读取 width/height/boundary/groupId | Phase 2C 已迁到 `features/ontology-canvas/model/layout/layoutControl.ts`，组件只执行 layout 和 store action |
| FIXED | `frontend/services/layout/strategies/*` 构造期 ELK 初始化 | Next build / SSR / API route 加载 layout manager | 原策略构造时立即动态导入并初始化 elkjs，构建静态页时会触发服务端副作用和 ELK load error | Phase 2C 改为 `getELK()` 懒加载，只有真正执行布局时才创建 engine |
| FIXED | `frontend/services/layout/utils/ELKGraphConverter.ts` unused `nodeMap` / unsafe expanded size cast | 旧图转换成 ELK graph | 原转换器构建未使用的 `nodeMap`，并用 `any` 读取 `customExpandedSize` | Phase 2C 删除无用参数链路，并按 `BlockEnum.NODE` 类型化读取 `Node.customExpandedSize` |
| FIXED | `frontend/services/layout/utils/ELKConfigBuilder.ts` option 返回 `Record<string, any>` | 生成 ELK 配置或合并用户配置 | 原配置构造器公开 `any`，调用方无法知道 ELK option 值类型 | Phase 2C 新增 `ELKLayoutOptions = Record<string, string | number | boolean>` 并贯穿 builder/converter |
| FIXED | `frontend/components/graph/editors/*` legacy node editor UI 目录 | 后续迁移到 `features/ontology-canvas` | 旧节点/内容/属性编辑 UI 容易把节点语义重新拉回旧 graph store 和普通 JSON 属性 | 2026-05-08 已删除 `NodeEditor`、`ContentEditor`、`StructuredAttributeEditor`；节点/Domain Inspector 迁入 `features/ontology-canvas/blocks`，纯属性 UI 迁入 `features/ontology-canvas/ui`。旧目录暂时只保留 `EdgeEditor` |
| FIXED | `frontend/components/graph/core/GraphPageContent.tsx` / `stores/graph/nodes/*` 热路径调试日志 | 节点拖拽、resize、同步、group 边界更新 | 原主画布和节点 store 在高频交互路径输出大量 `console.log`，影响性能并污染日志 | Phase 2C 已清理 `GraphPageContent`、basic/constraint/group/groupBoundary operations 中的调试 `console.log` |
| P2 | `frontend/components/graph/edges/CustomEdge.tsx` `useEffect` window listener | 边数量增长 | 每条边一个 window event listener，绕开 React 数据流 | 用 selected/editingEdgeId UI state 或 ReactFlow edge event 管理 |
| P1 | `frontend/services/layout/LayoutManager.ts` `cancelCurrentOperation` | 用户连续触发大图布局或切换画布时 | 取消只设置布尔标志，无法中断已经进入 ELK 的异步计算，旧布局结果可能晚到并覆盖新状态 | 引入 layout job id / AbortSignal / worker terminate，应用结果前校验当前 revision |
| P1 | `frontend/services/layout/LayoutManager.ts` / `ELKLayoutStrategy.ts` 参数类型 | 布局算法接收旧 `Node | Group | Edge` | 算法层被 UI/ReactFlow 字段绑住，后续本体模型、Domain、Subgraph 难以独立演进 | 建立 `LayoutGraph` DTO 和 adapter，算法只消费中立节点/边尺寸和层级 |
| P2 | `frontend/services/layout/strategies/ELKLayoutStrategy.ts` `validateConfig` | 传入非法 ELK/layout options | 校验函数恒返回 true，错误延后到 ELK 执行阶段，失败信息不可控 | 为 layout options 写 schema 校验，错误在 command 层返回 structured warning |
| P2 | `frontend/services/layout/algorithms/EdgeOptimizer.ts` `optimizeBatch` | 大量 affected edges 超过阈值 | 回退全量优化，可能在拖拽/缩放等高频路径造成卡顿 | 返回 edge handle patch，按 affected edge 增量计算；大图放 worker 或 idle task |
| P1 | `frontend/services/layout/strategies/ELKGroupLayoutStrategy.ts` `getDescendants` | groupId 数据出现循环引用 | 递归无 visited set，可能无限递归或栈溢出 | 增加 visited set 和循环错误，复用统一 graph validation |
| FIXED | `frontend/services/layout/strategies/ELKGroupLayoutStrategy.ts` `extractSubgraph` | 大 group 内节点/边数量增长 | 原实现使用 `subgraphNodes.some()` 过滤每条边，复杂度约 O(E*N) | Phase 2C 已先构建 `subgraphNodeIds: Set<string>`，再 O(E) 过滤边 |
| P1 | `frontend/services/layout/utils/ELKGraphConverter.ts` `getDefaultWidth/getDefaultHeight` | 节点 UI 展开状态变化或字段结构调整 | 布局转换读取 `isExpanded/customExpandedSize`，算法层依赖 UI 运行时字段 | 建立 `LayoutNode` DTO，由 adapter 预先决定尺寸，算法只读 width/height |
| P2 | `frontend/services/layout/utils/ELKConfigBuilder.ts` `mergeConfig` | 传入任意但类型合法的 `elkOptions` | Phase 2C 已收紧 value 类型，但任意用户配置仍可覆盖核心 ELK key，可能破坏布局或制造难复现行为 | 对 `elkOptions` 做白名单/schema 校验，并区分 safe overrides 与 internal config |
| P1 | `frontend/services/layout/types/layoutTypes.ts` `LayoutNode/LayoutEdge` | 迁移到本体模型或替换渲染引擎 | 布局系统类型只是旧 `Node | Group | Edge` 别名，算法层无法独立演进 | 新增 `LayoutGraph`、`LayoutNodeDTO`、`LayoutEdgeDTO`，由 adapter 转换 |
| P1 | `frontend/config/layout.ts` `LAYOUT_CONFIG/PADDING_CONFIG/Z_INDEX_CONFIG` | 调整 UI 密度、标题高度或 z-index | 算法配置和视觉 token 混在同一文件，改 UI 可能意外改变布局算法 | 拆成 `features/ontology-canvas/config/viewTokens.ts` 与 `core/algorithms/layout/layoutConfig.ts` |
| P2 | `frontend/services/layout/utils/GeometryUtils.ts` `getBounds` | 新节点尺寸不同或 UI token 改变 | 默认宽高硬编码 `350/280`，与实际 node token/config 可能漂移 | 让调用方传入 LayoutNodeDTO 的 width/height，GeometryUtils 不读取旧模型 |
| P2 | `frontend/config/elk-algorithm.ts` `ELK_ALGORITHM_CONFIG.common.debugMode` | 生产环境执行 ELK 布局 | debugMode 默认为 true，可能带来日志或算法调试开销 | 按环境或 debug flag 注入，不在默认算法配置中开启 |
| FIXED | `frontend/services/mermaid/*` / `components/graph/import/*` / backend Mermaid converter | 用户误把 Mermaid 当成本体图主导入协议 | 临时导入功能会把 parser、旧图转换、store、layout、persistence 和 HTTP 绑成主链路，偏离 Ontology Canvas 定位 | 2026-04-30 已删除前端/后端 Mermaid 导入实现和 `mermaid` 依赖；未来导入从本体 schema/DSL 契约重新设计 |
| P2 | `frontend/app/api/layout/route.ts` 模块顶层 `new LayoutManager()` | API route 被加载 | 顶层实例化 LayoutManager 仍会创建策略实例；Phase 3B 已把策略注册日志收敛到 debug flag，但冷启动仍有不必要对象创建 | 懒加载 LayoutManager，或将布局任务移到 worker/data-layer 明确入口 |
| P2 | `frontend/app/api/layout/route.ts` `getStrategyDescription` | 调用 GET `?action=strategies` | 返回描述包含未注册的旧策略 id，真实策略和 UI 展示不一致 | 从 LayoutManager 注册表暴露 metadata，删除硬编码旧策略描述 |
| FIXED | `frontend/app/api/workspace/save/route.ts` `POST` | 保存大图 workspace | 原实现打印完整请求体和验证数据，控制台输出巨大且可能泄露用户数据 | Phase 3B 第四批已删除普通调试日志，保留错误分支 console.error |
| FIXED | `frontend/utils/workspace/canvasSync.ts` / `persistence.ts` / `persistenceMiddleware.ts` | 任意保存工作区路径 | 原多处直接 fetch `/api/workspace/save`，绕过统一数据层，导致数据出口不唯一 | Phase 3D 已建立 `workspaceRepository`；静态扫描确认前端直接 workspace API fetch 只剩 `data-layer/workspace/workspaceRepository.ts` |
| P2 | `frontend/services/storage/adapters/FileSystemAdapter.ts` `remove/clear/deleteFile` | 需要删除 workspace 或清理数据 | 接口声明已实现但方法只 warn，不执行删除 | 增加 delete API route 或把接口标为 unsupported capability |
| P1 | `frontend/types/workspace/models.ts` `Canvas.graphData` display cache | 保存历史工作区或旧样例数据 | Phase 3D 已新增 `ontologyDocument` 真相源，但旧 `graphData` 仍在 schema 和 JSON 中作为显示缓存，可能继续携带旧展示字段 | Phase 3E 只清理主交互/显示路径并登记算法迁移范围；Phase 5/6 完成 layout/history/edge optimizer 与 workspace schema 迁移后，删除 `Canvas.graphData`，workspace 只保存 ontology document + workspace tree |
