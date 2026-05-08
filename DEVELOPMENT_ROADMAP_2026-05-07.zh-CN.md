# Ontology Canvas 后续开发路线图

日期：2026-05-07

## 1. 文档定位

这是当前唯一活跃的后续开发路线图。旧的 `FUTURE_PHASES_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` 和 `PHASE_3E_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` 已归档，只用于追溯历史，不再作为开发依据。

本路线图按新版 `prd.md` 重排，核心方向是：

```text
节点即容器
+ 子画布导航
+ LOD 大图浏览
+ 正交边系统
+ 本体语义模型
```

## 2. 全局门禁

任何后续开发开工前必须先做四件事：

1. 阅读 `ACTIVE_DOCS.zh-CN.md`，确认当前活跃文档。
2. 在 `ITERATION_LOG.md` 写本轮开工声明。
3. 明确本轮不变量、禁止事项和验收命令。
4. 完成后同步 `CODEBASE.md` 和 `ITERATION_LOG.md`。

归档目录 `_archive/` 默认不读。只有需要追溯历史决策时才允许读取，并必须在 `ITERATION_LOG.md` 说明原因。

## 3. 必读规则

### 3.1 所有任务默认必读

- `ACTIVE_DOCS.zh-CN.md`
- `prd.md`
- `UI_REFERENCE_INTERACTION_SPEC_2026-05-07.zh-CN.md`
- `FRONTEND_ARCHITECTURE_RULES.zh-CN.md`
- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md`
- `CANVAS_INTERACTION_PERFORMANCE_RESEARCH_2026-05-06.zh-CN.md`
- `CODEBASE.md` 相关章节
- `ITERATION_LOG.md` 最近一轮记录

### 3.2 UI 任务额外必读

- `UI_REFERENCE_INTERACTION_SPEC_2026-05-07.zh-CN.md`。
- `UI_iamge/` 下的参考图。
- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` §5/§6/§7/§8/§10。
- `prd.md` §3/§5/§6/§7/§8/§10。

UI 阶段不能只凭记忆改样式。开始 UI 开发前必须先列出参考图中本轮要落地的元素，例如节点状态、LOD 层级、边样式、Breadcrumb、MiniMap 或 Inspector。

### 3.4 UI 参考图阶段映射

| 参考图 | 主要落地阶段 | 不得提前跳过的前置条件 |
|--------|--------------|------------------------|
| 节点嵌套系统 | Phase A、Phase B、Phase E | 拖拽、resize、父子关系、折叠状态稳定 |
| 正交边系统 | Phase D | 节点尺寸、锚点、LOD 基本稳定 |
| LOD / 大图浏览系统 | Phase C | 节点 UI token 和 adapter LOD 输入稳定 |
| Sub 画布导航系统 | Phase E | 节点即容器数据结构和全局 Inspector 边界稳定 |

每轮 UI/交互任务必须在 `ITERATION_LOG.md` 中写明本轮参考图、采用元素、暂缓元素和验收路径。

新概念图对当前节点属性、边模型、Domain 过渡层、子画布和持久化 schema 的影响，见 `UI_REFERENCE_INTERACTION_SPEC_2026-05-07.zh-CN.md` §9。后续实现时不得把 methods、语义锚点、正交边 route、子画布导航历史等长期结构随意塞进 `metadata` 或 `display` 作为最终方案。

### 3.3 交互任务额外必读

- `NODE_DOMAIN_INTERACTION_CONTRACT_2026-05-06.zh-CN.md`
- `CANVAS_INTERACTION_PERFORMANCE_RESEARCH_2026-05-06.zh-CN.md` §7/§8/§10/§13。

交互任务必须保持：

- 本体 view 坐标为绝对坐标。
- ReactFlow 相对坐标只存在 adapter。
- 拖拽中不保存、不布局、不全图重算。
- resize 结束后提交本体 view。
- 边锚点写本体 `edgeViews`。

## 4. 总体顺序

后续阶段按以下顺序执行：

```text
Phase B：节点/容器 UI 产品化
  -> Phase A：交互与性能基线稳定
  -> Phase C：LOD、折叠与大图浏览
  -> Phase D：正交边与语义锚点
  -> Phase E：子画布导航与节点即容器
  -> Phase F：Feature 化、旧 UI/store 清理
  -> Phase G：算法 DTO、layout job、worker、history
  -> Phase H：Workspace 持久化、PG adapter
  -> Phase I：导入/导出/推理准备
```

关键顺序约束：

- 2026-05-07 用户已确认：先把最终节点/容器 UI 骨架基本完善，再在最终 UI 上修拖拽、resize、嵌套、折叠和显式归入；避免旧 UI 下测过的交互在新 UI 中重新失效。
- Phase A 已完成的拖拽/resize 基线修复继续保留，但 Phase A 剩余交互项后置到 Phase B UI 骨架稳定之后。
- UI 和交互未稳定，不进入算法重构。
- 正交边和语义锚点未明确，不做复杂边避障算法。
- 子画布导航未稳定，不做跨子图布局算法。
- 旧实现每个阶段都要清理，不等到最后统一大清理。
- `Canvas.graphData` 删除必须等 layout/history/edge optimizer 不再依赖旧 graph display object。

## 5. Phase A：交互与性能基线稳定

### 目标

把当前画布最影响手感和正确性的路径先稳定下来：

- 节点拖拽不回弹。
- Domain / 容器拖拽时后代跟随。
- resize 不再一卡一卡。
- 节点移动和 resize 后，边锚点自适应。
- 显式归入 Domain / 容器。
- Domain / 容器折叠状态可保存。

### 任务

1. Phase A0：浏览器基线实测。
   - 建立 20 / 100 / 300 节点测试画布。
   - 记录拖拽、父容器拖拽、resize、缩放、边锚点更新的主观卡顿点。
   - 明确卡顿来自 DOM、store 写入、边重算、保存还是 ReactFlow projection。
2. Phase A1：resize 顺滑性。
   - resize 中只保留本地视觉反馈，不写旧 graph store。
   - resize 结束后一次性提交本体 view 尺寸。
   - resize 结束后只级联受影响容器边界。
   - resize 结束后只增量重算相关边锚点。
3. Phase A2：拖拽与父子关系稳定。
   - 普通节点拖动后不回弹。
   - 父容器拖动时所有后代保持相对位移。
   - 已归属容器的子节点默认不能拖出父容器。
   - 多层容器边界按子内容必要扩展。
4. Phase A3：显式归入 / 移出容器。
   - Inspector 或控制面板列出当前层级可归入容器。
   - 点击归入后更新父子关系，并把节点放到容器内部合理位置。
   - 移出必须是显式动作，不通过普通拖拽悄悄改变归属。
   - 2026-05-08 第一批已完成：普通本体节点在 Inspector 的 Container 区直接显示可归入容器按钮；点击后写本体 `domainId/nodeIds`，自动放入目标容器内部空位，并同步旧 display cache；移出容器也走显式按钮。
   - 后续仍待：Domain / 容器自身归入父容器的显式入口、多层容器候选过滤、浏览器端大图交互验证和更精细的空位搜索。
5. Phase A4：容器折叠投影。
   - 折叠后内部节点不完整渲染。
   - 折叠摘要显示子节点、子容器、关系数量。
   - 展开后内部位置恢复。
   - 折叠状态保存到本体 view。
   - 2026-05-08 第一批已完成：折叠容器仍投影自身，内部后代节点不进入 ReactFlow nodes，连到隐藏后代或缺失端点的边不进入 ReactFlow edges；展开后仍从本体 view 恢复原始位置。
   - 后续仍待 Phase C：折叠容器的摘要边、跨容器关系聚合、远景容器外框缩小和 cluster 视图。
6. Phase A5：边锚点增量更新。
   - 节点移动、容器移动、resize 后只处理 incident edges。
   - 锚点结果写 `edgeViews`。
   - 当前仍可复用旧 optimizer，但输出不能只写旧 display cache。
7. Phase A6：交互测试补齐。
   - 拖拽不回弹。
   - 父容器拖拽带动后代。
   - resize 后尺寸持久化。
   - 显式归入 / 移出。
   - 折叠 / 展开。
   - 边锚点随节点变化。

### 清理要求

- 删除不再调用的旧 group move / boundary / node position 工具。
- 旧 graph store 只能作为显示缓存，不得参与最终位置判断。
- resize 相关旧 `updateNode()` 副作用必须持续清零。

### 出口标准

- 100 个节点内拖拽和 resize 主交互连续。
- 拖动、点击、缩放、保存再加载后节点不回弹。
- 容器移动后子节点和子容器不跳位。
- 折叠容器后 DOM 明显减少。
- `npm run check:phase2`、`lint`、`build` 通过。

## 6. Phase B：节点/容器 UI 产品化

### 目标

按 `UI_iamge/` 参考图，把节点从“普通卡片”升级为本体建模节点，把 Domain 过渡为“容器节点 / 内部空间入口”的视觉表达。

### 任务

1. Phase B0：参考图元素确认。
   - 开工声明中列出本轮采用图 1 的节点状态、入口、数量徽标、内部工具或图例元素。
   - 若用户提供新的 UI 图，先更新 `UI_REFERENCE_INTERACTION_SPEC_2026-05-07.zh-CN.md` 再动代码。
2. Phase B1：UI token 完整化。
   - `nodeViewTokens.ts`：节点尺寸、密度、分区、状态、LOD。
   - `domainViewTokens.ts`：容器边界、标题栏、折叠摘要、内部空间入口。
   - `canvasViewTokens.ts`：画布工具栏、子画布模式、MiniMap 容器。
   - `edgeViewTokens.ts`：关系类型颜色、线型、端点符号。
3. Phase B2：本体节点 UI。
   - 完整模式显示标题、类型、字段、方法、子节点数量。
   - 紧凑模式显示标题、类型、数量徽标。
   - 最小模式显示类型图标、标题、数量。
   - 远景模式只保留类型图标或颜色点。
   - 默认、选中、悬停、禁用、只读状态可区分。
4. Phase B3：容器节点 UI。
   - 容器标题和类型。
   - 子节点、子容器、关系数量。
   - 折叠摘要。
   - 进入内部空间入口。
   - 内部空间边界和工具栏视觉。
5. Phase B4：节点内结构编辑。
   - 节点上新增字段。
   - 字段名称、值、dataType 快速编辑。
   - Fields / Methods / Constraints / Interfaces 分区折叠。
   - 属性过多时自动进入摘要或折叠状态。
6. Phase B5：Inspector 同步。
   - 节点上快速编辑和右侧 Inspector 一致。
   - Inspector 修改后节点 UI 立即同步。
   - 所属容器调整走显式归入 / 移出命令。
7. Phase B6：旧 UI 退场准备。
   - `NoteNode` / `GroupNode` 只做 wrapper。
   - 产品 UI 进入 `features/ontology-canvas/ui`。
   - UI 组件不直接 import store、ReactFlow 或旧 graph 类型。

### 当前进展（2026-05-08）

- 已完成第一轮 UI-first 落地：`ClassNodeView` / `DomainNodeView` 基本替代旧节点和旧 Group 视觉。
- 已新增 `NodeAttributeEditor`：节点可按本体类型、Fields、Methods、Rules、Constraints、Interfaces 编辑结构化字段；Domain 使用普通 metadata 编辑。
- 已新增并接入 `NodeInspectorBlock`：右侧 Inspector 使用草稿 ViewModel 做即时预览，保存后写本体 document，再投影旧 display cache。
- Phase B4 已完成第一批：完整 LOD 下节点字段名、字段值、dataType 可在节点内行内编辑，失焦或回车后写入本体 `fields`；Fields / Methods / Rules / Interfaces / Relationships 分区可折叠，折叠状态保存到本体 `nodeViews.collapsedSections` 并随 legacy display cache 投影。
- Phase B4 已完成第二批：完整 LOD 下字段可切换 Field / Method / Rule / Constraint / Interface 分类，分类变更后字段会进入对应分区；字段可删除，并可在当前可见分区顺序内上移 / 下移。
- Phase B4 已完成第三批：完整 LOD 下 Fields / Methods / Rules / Interfaces 空分区也会出现在节点 ViewModel 中；节点顶栏加号继续新增普通 Field，各分区标题右侧加号可直接新增对应分类字段，例如 Method、Rule 或 Interface。
- Phase B 完成批：节点分区折叠后显示摘要，字段过多时用 `+N hidden` 进入摘要；节点和容器具备默认、hover、selected、readonly、disabled 状态表达，readonly/disabled 会关闭快速编辑入口；Domain / 容器完整 LOD 显示内部空间入口，并可通过 wrapper 按钮切换折叠状态，折叠状态写回本体 view。
- 已删除旧 `NodeEditor`、`ContentEditor`、`StructuredAttributeEditor`、`NoteNodeEdit` 和对应旧测试。
- 已归档 `frontend/components/graph/GRAPH_COMPONENTS_RESTRUCTURE_PLAN.md`，后续默认不读。

Phase B 已阶段完成。后续不再以旧 UI 做适配；下一阶段切回 Phase A，在当前节点/容器 UI 上验证并修复拖拽、resize、父容器拖动、显式归入 / 移出和边锚点增量更新。真正进入/返回子画布、Breadcrumb、MiniMap、搜索定位属于 Phase E。

### 清理要求

- 旧 `NoteNode` / `GroupNode` 只能作为 wrapper，不能继续承载产品 UI。
- UI 组件不得直接 import store。
- 样式尺寸不得散落硬编码。

### 出口标准

- 改节点样式不改 interaction model。
- 改容器样式不改父子关系规则。
- UI 图片中的主要节点状态和 LOD 形态已有对应实现或明确 TODO。

## 7. Phase C：LOD、折叠与大图浏览

### 目标

让 500 节点内可编辑，2000 节点可浏览。

### 任务

1. Phase C0：LOD 配置落地。
   - 明确 100% / 70% / 40% / 15% / 5% 阈值。
   - 阈值进入 `canvasInteractionConfig` 或同等配置，不写死在组件。
   - LOD 状态由 adapter 统一计算，UI 只消费 props。
   - 普通节点显示尺寸进入 `nodeViewTokens.lodDisplayDimensions`，由 ReactFlow adapter 投影为显示尺寸，不写回本体 view 的真实尺寸。
   - ReactFlow 因 LOD style 改变产生的 `dimensions` 自动测量事件不得被当作用户 resize 保存；只有收到用户 resize 起点后的 resize end 才能提交本体 view 尺寸。
2. Phase C1：节点真实降 DOM。
   - 100%：完整字段、方法、子节点、操作入口。
   - 70%：主要数量和关键状态。
   - 40%：标题、类型、数量徽标。
   - 15%：图标和类型色。
   - 5%：位置点或 Cluster。
   - 远景拖拽结束必须把 LOD 显示坐标换算回真实节点坐标，避免保存后位置漂移。
   - 缩小后再放大必须恢复近景尺寸；如果不能恢复，说明 LOD 显示尺寸污染了真实尺寸，必须立即修正。
3. Phase C2：容器 / 内部空间 LOD。
   - 近景可进入内部空间。
   - 中景只显示摘要。
   - 远景聚合为集群图标。
   - 超远景合并到区域 / 集群。
   - 容器 / Domain 外框缩小必须和隐藏或聚合内部子节点一起做，不能只缩外框，否则会破坏嵌套视觉和父子边界判断。
4. Phase C3：边 LOD。
   - 远景隐藏 label。
   - 低权重边隐藏或弱化。
   - 平行边聚合。
   - 折叠容器外部关系摘要。
5. Phase C4：Cluster 聚合。
   - 按节点数量、空间占比、缩放级别和语义类型聚合。
   - 集群显示名称、数量、主要类型分布和可展开入口。
6. Phase C5：MiniMap。
   - 当前视口。
   - 集群区域。
   - 高亮节点。
   - 点击定位、拖动视口、缩放和重置。
7. Phase C6：性能验收。
   - 500 节点内可编辑。
   - 2000 节点可浏览。
   - 远景 DOM 数量明显下降，不只是 CSS 缩小。

### 清理要求

- 删除“只传 LOD 标记但 DOM 不减少”的假 LOD。
- 大图浏览路径不得渲染完整属性列表。

### 出口标准

- 缩放时节点 DOM 逐级减少。
- 普通节点远景外框随 LOD 变小，但本体 view 保存的真实 width/height 不被覆盖。
- 远景下边和容器明显降复杂度。
- 视口外节点不完整渲染。

## 8. Phase D：正交边与语义锚点

### 目标

把当前贝塞尔边升级为 PRD 里的正交边系统。

### 任务

1. Phase D0：关系类型和 token。
   - Association / Dependency / Inheritance / Realization。
   - Composition / Aggregation / Reference。
   - Event Flow / Data Flow。
   - 线型、颜色、箭头、端点符号进入 `edgeViewTokens.ts`。
2. Phase D1：`SemanticEdgeView`。
   - 正交折线。
   - label。
   - hover / selected / locked 状态。
   - 端点符号。
   - 近景完整路径，中远景简化路径。
3. Phase D2：通用锚点。
   - Top / Right / Bottom / Left。
   - 自动选择更合理出入方向。
   - 节点移动或 resize 后增量更新。
4. Phase D3：语义锚点。
   - Field Anchor。
   - Method Anchor。
   - Event Anchor。
   - Section Anchor。
   - LOD 降级时保留语义引用，显示可退化。
5. Phase D4：正交路由。
   - 不穿越节点。
   - 尽量减少折点。
   - 边与边、边与节点保持最小间距。
   - 拖拽中不全图重算，结束后增量重算。
6. Phase D5：边聚合。
   - 多条同类边自动聚合。
   - hover 或点击显示明细。
   - 容器折叠后内部边聚合为摘要边。
7. Phase D6：边交互。
   - 创建边。
   - 选中边。
   - 移动锚点。
   - 添加折点。
   - 删除折点。
   - 改变关系类型。
   - 锁定边。
   - 跳转到目标节点或子画布。

### 清理要求

- 旧 `CustomEdge` / `CrossGroupEdge` 逐步退出产品主线。
- 边样式进入 `edgeViewTokens.ts`，不能硬编码在组件。

### 出口标准

- 节点移动后边从更合理方向出入。
- 正交边替代默认贝塞尔边。
- 关系类型能通过线型和端点表达。

## 9. Phase E：子画布导航与节点即容器

### 目标

把“Domain 作为过渡容器”升级为“任意节点都可以拥有内部子画布”。

### 任务

1. Phase E0：节点即容器数据结构。
   - node `childCanvasId` 或内部画布引用。
   - 子画布独立 viewport。
   - 子画布 selection、LOD、折叠状态可保存。
   - 旧 Domain 逐步迁移为容器视图，不再作为唯一分组机制。
2. Phase E1：进入 / 返回。
   - 双击节点进入。
   - 节点入口按钮进入。
   - `Enter` 快捷进入。
   - Back / `Esc` 返回父画布。
   - 返回后恢复父画布离开前的 viewport 和 selection。
3. Phase E2：Breadcrumb。
   - 显示 `Root > Order > Customer > Address` 形式路径。
   - 当前层级高亮。
   - 点击祖先层级跳转。
   - 路径过长时折叠中间层级。
4. Phase E3：跨画布引用。
   - 区分同画布边、进入/返回边、跨画布引用边。
   - 点击引用边定位目标子画布。
   - 进入目标后高亮目标节点或锚点。
5. Phase E4：搜索定位。
   - 搜索节点、字段、方法、引用。
   - 结果显示完整路径。
   - 点击结果自动进入目标子画布并高亮目标。
6. Phase E5：历史导航。
   - 后退、前进、回到上一次位置。
   - 历史项记录 canvasId、nodeId、viewport、selection、时间。
7. Phase E6：MiniMap 与鸟瞰。
   - MiniMap 跟随当前子画布。
   - 支持点击定位、拖动视口、缩放、重置。
   - 保持和 Breadcrumb、搜索结果的上下文一致。

### 清理要求

- 不做 iframe 式 UI 套娃。
- 全局 Inspector 保持唯一。
- 子画布不重复整套侧栏和右侧面板。

### 出口标准

- 进入 / 返回子画布不会丢失父画布上下文。
- Breadcrumb 能表达当前位置。
- 子画布状态可保存再恢复。

## 10. Phase F：Feature 化、旧 UI/store 清理

### 目标

把旧 graph 目录从产品主线中退掉，形成清晰的 feature pack：

```text
features/ontology-canvas/
  model/
  ui/
  blocks/
  adapters/
  config/
  state/
```

### 任务

1. `OntologyCanvasBlock` 接管画布接线。
2. `NodeInspectorBlock` 接管右侧编辑栏接线。
3. `GraphPageContent` 从业务中心变成 adapter/container 或被替换。
4. 旧编辑器迁入 feature blocks/ui。
5. selection / hover / editing / viewport 状态拆分。
6. 删除不再使用的旧 graph components/hooks/store。

### 清理要求

- 每迁移一个入口，立即删除旧入口。
- 不保留双主线。
- 旧 graph store 只允许作为明确标注的短期 display cache。

### 出口标准

- 页面入口只装配 blocks。
- feature 内 model/ui/blocks 分层清楚。
- 跨 feature 不 import 内部文件。

## 11. Phase G：算法 DTO、layout job、worker、history

### 目标

在交互/UI/子画布稳定后，再做算法层重构。

### 任务

1. Layout DTO：
   - `LayoutGraphDTO`
   - `LayoutNodeDTO`
   - `LayoutEdgeDTO`
2. Edge Optimization DTO。
3. Layout job：
   - job id。
   - document revision。
   - cancel / timeout。
   - worker。
4. Patch history：
   - 不再保存全量 nodes/edges snapshot。
   - 拖拽一次只产生一条 history。
5. 增量布局：
   - 手动触发。
   - 不在拖拽中布局。

### 清理要求

- layout/history/edge optimizer 不再消费旧 `Node | Group | Edge`。
- 算法不读 UI token。

### 出口标准

- 算法只消费 DTO。
- 算法输出本体 view patch。
- 大图布局不会阻塞主线程。

## 12. Phase H：Workspace 持久化与 PG adapter

### 目标

当前先保存 JSON 本体文档，后续替换为 PostgreSQL adapter。

### 任务

1. workspace repository 继续作为唯一前端数据出口。
2. 默认 workspace 去掉旧 display cache。
3. 子画布状态持久化。
4. PG adapter 第一版：
   - graph JSONB。
   - view JSONB。
   - revision。
   - workspace tree。

### 清理要求

- UI/store 不直接 fetch workspace API。
- 删除 `Canvas.graphData` 前必须完成 Phase G 依赖迁移。

### 出口标准

- JSON adapter 和 PG adapter 可以替换。
- 保存/加载不依赖旧 graph display object。

## 13. Phase I：导入、导出与推理准备

### 目标

本阶段不恢复 Mermaid 主线，而是重新设计本体导入/导出协议。

### 任务

1. 定义 `OntologyImportDraft`。
2. 定义本体 schema / DSL 草案。
3. 导出 JSON / RDF / OWL 的最小路径。
4. 为后续推理准备：
   - Class。
   - Property。
   - Relation。
   - Domain / Range。
   - Constraint / Axiom。

### 清理要求

- Mermaid 归档资料不回主线。
- 导入协议必须先通过 schema，再进入 UI。

### 出口标准

- 导入/导出不绕过本体 model。
- 能解释数据如何映射到 OntologyGraph。

## 14. 当前最近三步

当前从 2026-05-08 Phase B 阶段完成后，下一步按这个顺序做：

1. **新 UI 交互稳定阶段（路线图 Phase A 收尾）**：在新 UI 上验证 resize、drag、父容器拖动和边锚点增量更新；普通节点显式归入 / 移出容器和容器折叠投影第一批已完成，后续补浏览器大图验证、摘要边和容器聚合。
2. **Phase C 第一批**：按图 3 做真实 LOD 降 DOM、容器摘要、Cluster 雏形和 MiniMap 基础。
3. **Phase D 第一批**：按图 2 做正交边、通用锚点和关系类型 token。
4. **Phase E 第一批**：按图 4 做子画布进入/返回、Breadcrumb、搜索定位和历史导航。
5. **Phase F 第一批**：清理旧 wrapper / graph store 依赖，把产品 UI 和交互入口进一步迁出 legacy graph 目录。

算法、worker、history、PG adapter 都排在交互/UI/LOD/边/子画布之后。
