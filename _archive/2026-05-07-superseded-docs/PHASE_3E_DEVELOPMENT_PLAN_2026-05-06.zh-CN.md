# Phase 3E 开发执行计划

日期：2026-05-06

## 1. 文档定位

这份文档是 Phase 3E 的开发执行计划。它把节点/Domain 产品交互、技术交互契约和性能研究落成具体开发顺序、门禁规则、任务拆分和验收标准。

后续所有阶段的总计划见 `FUTURE_PHASES_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md`。本文档只负责 Phase 3E 的详细执行，不替代 Phase 4-8 的阶段门禁。

后续进入 Phase 3E 相关代码开发前，必须先读本文件和对应契约文档。不能只凭压缩后的上下文、记忆或上一轮聊天继续写。

## 2. 开发前必读规则

### 2.1 必读文档

任何涉及节点、Domain、拖拽、嵌套、节点 UI、LOD、布局、旧 graph store 退场的开发任务，开工前必须先阅读：

1. `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md`
2. `NODE_DOMAIN_INTERACTION_CONTRACT_2026-05-06.zh-CN.md`
3. `CANVAS_INTERACTION_PERFORMANCE_RESEARCH_2026-05-06.zh-CN.md`
4. 本文档：`PHASE_3E_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md`

其中：

- 产品交互规格决定“用户最终应该得到什么体验”。
- 技术交互契约决定“坐标、父子关系、拖拽、边界、view patch 不能怎么错”。
- 性能研究决定“拖拽节奏、同步节奏、LOD、视口裁剪、Dify 可借鉴经验怎么落地”。
- 本计划决定“先做什么、后做什么、做到什么程度才算完成”。

### 2.2 开工前记录

每次进入 Phase 3E 代码开发前，必须在 `ITERATION_LOG.md` 新增或补充本轮声明：

```text
本轮任务：
必读文档已读：
- NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md §...
- NODE_DOMAIN_INTERACTION_CONTRACT_2026-05-06.zh-CN.md §...
- CANVAS_INTERACTION_PERFORMANCE_RESEARCH_2026-05-06.zh-CN.md §...
- PHASE_3E_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md §...

本轮不变量：
本轮验收命令：
```

如果没有写这段声明，视为没有完成开发前置检查。

### 2.3 必读章节对应表

| 开发内容 | 必读章节 |
|----------|----------|
| Domain 内创建节点 | 产品规格 §4.1、技术契约 §2.7、性能研究 §7.4、本计划 §5.1 |
| 节点拖拽不回弹 | 产品规格 §3.1、技术契约 §2.4/§4.2/§5、性能研究 §6.2/§7.3、本计划 §4/§5.2 |
| 父 Domain 移动 | 产品规格 §4.5、技术契约 §2.5/§4.1/§5、性能研究 §7.2、本计划 §5.3 |
| Domain 自动扩展 | 产品规格 §4.4、技术契约 §2.6/§5、性能研究 §7.1、本计划 §5.4 |
| Domain 折叠 | 产品规格 §4.6、性能研究 §8/§10、本计划 §6.2 |
| 节点 UI 产品化 | 产品规格 §5/§6/§7、性能研究 §8、本计划 §6 |
| LOD 真实降 DOM | 产品规格 §5.2/§8、性能研究 §5/§8/§9、本计划 §6.3 |
| 旧 graph store 退场 | 技术契约 §3/§4/§5、性能研究 §11/§12、本计划 §7 |
| 布局算法继续重构 | 技术契约 §7、性能研究 §7.6、总计划 §7 |

## 3. Phase 3E 总目标

Phase 3E 的目标不是继续堆新功能，而是把 Ontology Canvas 的主运行态稳定下来：

```text
本体文档是真相源
  -> 本体 view 保存绝对坐标
  -> ReactFlow adapter 只负责相对投影
  -> 节点/Domain 交互由 model 输出批量 patch
  -> UI 只负责展示和触发事件
  -> 旧 graph store 逐步退为兼容缓存并最终删除
```

Phase 3E 不接受以下结果：

- 新节点仍是旧普通卡片，只换文案。
- Domain 移动只动父框，不动后代。
- 节点拖拽后点击回弹。
- Domain 边界只写旧 graph store。
- 节点 UI 硬编码尺寸、间距、字号。
- LOD 只写 data 标记，DOM 不减少。
- 旧 graph store 继续参与最终位置判断。

## 4. 全局开发规则

### R1 先交互，再 UI，再算法

执行顺序固定：

```text
Phase 3E-A 交互正确性
  -> Phase 3E-B 节点 UI 产品化与配置化
  -> Phase 3E-C 清理主交互/显示路径旧 graph 真相源
  -> Phase 4 UI feature 化与旧 UI 退场
  -> Phase 5 布局算法 DTO / worker / patch history
```

不能在节点/Domain 嵌套交互和节点 UI 主体未稳定前继续做布局算法；布局会放大错误坐标、错误父子关系和错误尺寸来源。

### R2 拖拽中不提交真相源

拖拽中只允许：

- ReactFlow 本地视觉态。
- 辅助线。
- 命中 Domain 高亮。
- 临时边界预览。

拖拽中禁止：

- 保存 workspace JSON。
- 写整张 `OntologyDocumentState`。
- 同时写旧 graph store 和 ontology store 两套真相源。
- 自动布局。
- 全图边路径重算。
- history 全量 snapshot。

### R3 拖拽结束一次性提交

拖拽停止后统一执行：

```text
ReactFlow final position
  -> relative 转 absolute
  -> 约束到 Domain 内
  -> 计算 Domain boundary cascade
  -> 生成 OntologyInteractionPatch
  -> ontologyDocumentStore.applyInteractionPatch()
  -> 投影 legacy display cache
  -> mark dirty + debounce save
  -> 记录一个 history entry
```

### R4 本体 view 坐标绝对化

`OntologyViewState.nodeViews` 和 `OntologyViewState.domainViews` 中的位置始终是画布绝对坐标。

ReactFlow 的相对坐标只存在于 adapter 投影层：

```text
reactFlow.position = child.absolute - parent.absolute
```

任何把 ReactFlow child relative position 直接保存到本体 view 的实现都要拒绝。

### R5 Domain 事务必须批量提交

父 Domain 移动时，必须在同一个 patch 中更新：

- 父 Domain view。
- 所有后代 Domain view。
- 所有后代 node view。
- 必要的 edge view dirty 标记。

不能先更新父 Domain，后续再补子节点。这会造成回弹和子节点跑出 Domain。

### R6 UI 与交互隔离

节点 UI 不直接读 store，不直接写 document，不直接处理拖拽规则。

目标：

```text
model/interactions 负责交互规则
model/document     负责本体文档更新
adapters/react-flow 负责投影
blocks             负责接线
ui                 负责展示
config             负责尺寸/密度/token
```

### R7 旧实现及时清理

每完成一个新主线能力，都要检查并清理对应旧入口。

要求：

- 旧代码如果不再被使用，直接删除。
- 旧代码如果暂时保留，必须标注为 legacy bridge/cache，不能继续承担真相源。
- 不为旧图长期兼容牺牲新项目结构。

## 5. Phase 3E-A：节点/Domain 嵌套交互修复

### 5.1 任务 A1：新增本体交互 patch 模型

目标文件：

```text
frontend/features/ontology-canvas/model/interactions/domainNesting.ts
frontend/features/ontology-canvas/model/interactions/index.ts
frontend/scripts/test-domain-nesting-interactions.mjs
```

建议类型：

```ts
type OntologyInteractionPatch = {
  nodeViews?: Record<string, Partial<NodeViewState>>
  domainViews?: Record<string, Partial<DomainViewState>>
  edgeViews?: Record<string, Partial<EdgeViewState>>
  warnings?: string[]
}
```

必须实现：

- `collectDomainDescendantViewIds(document, domainId)`
- `projectReactFlowPositionToAbsolute(document, input)`
- `constrainNodePositionToDomain(document, input)`
- `updateDomainBoundaryCascade(document, domainId)`
- `commitNodeDrag(document, input)`
- `commitDomainDrag(document, input)`
- `commitNodeResize(document, input)`

验收：

- 纯 model，不 import React、ReactFlow、Zustand、UI、fetch。
- 有 visited set，坏数据不会无限递归。
- 输入 document 不被原地修改。

### 5.2 任务 A2：节点拖拽提交

目标：

用户拖动节点后，点击节点、点击画布、缩放、保存再加载，都不会回弹。

实现要求：

1. `onNodeDragStart` 记录 drag session。
2. `onNodeDrag` 不写本体 document。
3. `onNodeDragStop` 调用 `commitNodeDrag()`。
4. 提交到本体 view 的位置必须是约束后的 absolute position。
5. 触发受影响 Domain boundary cascade。
6. 旧 graph store 只接收本体文档投影结果，不参与最终位置判断。

测试场景：

- 普通节点移动。
- Domain 内子节点移动。
- 子节点拖向 Domain 外，被约束回内部。
- 子节点移动导致父 Domain 扩展。
- 多层 Domain 中内层扩展后外层跟随扩展。

### 5.3 任务 A3：父 Domain 拖拽提交

目标：

拖动父 Domain 时，内部节点和子 Domain 像一个整体被搬走。

实现要求：

1. 计算 offset：

```text
offset = newDomainAbsolutePosition - oldDomainAbsolutePosition
```

2. 收集所有后代 node/domain view。
3. 父 Domain、子 Domain、子节点全部应用同一个 offset。
4. 一个 `applyInteractionPatch()` 完成提交。
5. 移动后点击任意子节点不回弹。

测试场景：

- Domain A 内有 Class A。
- Domain A 内有 Domain B，Domain B 内有 Class C。
- Domain A 有父 Domain P。
- 移动 Domain A 后所有后代位置一起平移。

### 5.4 任务 A4：Domain 边界级联

目标：

Domain 自动扩展结果写回 `OntologyViewState.domainViews`。

实现要求：

- 基于子节点和子 Domain 的 absolute position/size 计算包围盒。
- 向右/向下扩展时增加 width/height。
- 向左/向上扩展时调整 position 并增加 width/height。
- 多层 Domain 从当前 Domain 向祖先级联。
- 缓存 key 如后续引入，必须包含 child position/size/revision，不能只包含 child ids。

测试场景：

- 子节点靠右导致父 Domain width 扩展。
- 子节点靠下导致父 Domain height 扩展。
- 子节点向左导致父 Domain position.x 改变并保持包围。
- 内层 Domain 扩展导致外层 Domain 扩展。

### 5.5 任务 A5：GraphPageContent 接线收敛

目标文件：

```text
frontend/components/graph/core/GraphPageContent.tsx
frontend/features/ontology-canvas/state/ontologyDocumentStore.ts
frontend/features/ontology-canvas/adapters/legacy-graph/documentBridge.ts
frontend/utils/workspace/canvasSync.ts
```

实现要求：

- 新增 `ontologyDocumentStore.applyInteractionPatch()`。
- `GraphPageContent` 拖拽停止后优先调用本体 interaction model。
- 旧 graph store 的 `handleGroupMove/updateNodePosition/updateGroupBoundary` 不再作为最终位置和边界真相源。
- 如果旧 display cache 仍需同步，只能由本体 document 投影生成。

静态回查：

```bash
rg -n "handleGroupMove|updateGroupBoundary|updateNodePosition" frontend/components/graph/core frontend/features/ontology-canvas frontend/utils/workspace
```

允许短期存在，但调用点必须是 legacy display sync 或待迁移标注，不能继续承担主交互真相源。

### 5.6 Phase 3E-A 验收命令

至少运行：

```bash
cd frontend && npm run test:domain:nesting
cd frontend && npm run test:react-flow-adapter
cd frontend && npm run check:phase2
cd frontend && npm run lint
cd frontend && npm run build
git diff --check
```

如果新增脚本名不同，必须在 `package.json` 中写清楚，并更新本文件。

## 6. Phase 3E-B：节点 UI 产品化与配置化

### 6.1 任务 B1：节点 UI token/config

目标文件：

```text
frontend/features/ontology-canvas/config/nodeViewTokens.ts
frontend/features/ontology-canvas/config/domainViewTokens.ts
frontend/features/ontology-canvas/config/lodConfig.ts
frontend/features/ontology-canvas/config/canvasInteractionConfig.ts
```

配置负责：

- 节点默认宽高。
- Domain 默认宽高。
- padding。
- 标题高度。
- 属性行高。
- 字号。
- 圆角。
- 分区间距。
- 折叠阈值。
- LOD 阈值。

样式负责：

- 语义颜色。
- 边框。
- 阴影。
- hover/selected/invalid 状态。
- 过渡和动画。

禁止：

- 在节点组件里硬编码 `12px`、`#1a1a2e` 这类基础值。
- 布局算法直接读取 UI token。

### 6.2 任务 B2：ClassNodeView / DomainNodeView

目标文件：

```text
frontend/features/ontology-canvas/ui/ClassNodeView.tsx
frontend/features/ontology-canvas/ui/DomainNodeView.tsx
frontend/features/ontology-canvas/ui/NodeFieldList.tsx
frontend/features/ontology-canvas/ui/NodeSection.tsx
```

Class 节点必须显示：

- 标题。
- 本体类型。
- 关键属性。
- 属性数量。
- 字段类型/值摘要。
- 状态或校验提示。
- 选中/hover 时的新增属性入口。

Domain 节点必须显示：

- Domain 标题。
- 折叠/展开状态。
- 子节点数量。
- 子 Domain 数量。
- 关系数量摘要。

UI 组件规则：

- 只收 props、token、callback。
- 不直接 import store。
- 不直接 import interaction model。
- 不直接 fetch。

### 6.3 任务 B3：LOD 真实降 DOM

LOD 模式：

| 模式 | 展示 |
|------|------|
| full | 标题、类型、属性分区、关键字段、状态、快速新增属性入口 |
| compact | 标题、类型、属性数量、状态摘要 |
| outline | 标题或缩写、类型色条、最小状态 |
| dot | 最小块/点，不渲染属性 DOM |

验收：

- `full -> compact -> outline -> dot` DOM 数量递减。
- dot 模式不渲染属性列表。
- outline 模式不渲染新增属性按钮。
- compact 模式不渲染每个字段的完整输入控件。

### 6.4 任务 B4：节点快速新增属性

目标：

用户能从节点自身快速新增属性，复杂编辑仍走右侧编辑栏。

实现要求：

- 节点 UI 只触发 `onAddField(nodeId)`。
- blocks 接线到 model/inspector 或 document command。
- 新增属性后节点 UI 和右侧编辑栏一致。
- 新增属性导致尺寸变化时，触发 Domain boundary cascade。

### 6.5 Phase 3E-B 验收命令

至少运行：

```bash
cd frontend && npm run test:ontology:document
cd frontend && npm run test:canvas:interactions
cd frontend && npm run test:react-flow-adapter
cd frontend && npm run check:phase2
cd frontend && npm run lint
cd frontend && npm run build
git diff --check
```

如果涉及视觉交互，应增加 Playwright 或等价浏览器验证：

```text
打开画布
缩放到 full/compact/outline/dot
确认节点 DOM 和显示内容按 LOD 降级
```

## 7. Phase 3E-C：旧 graph store 主路径退场准备

### 7.1 任务 C1：主交互路径不再依赖旧 graph 真相源

目标：

拖拽、创建、删除、编辑、折叠、边界扩展等主交互路径不再把旧 graph store 当最终真相源。

要求：

- `GraphPageContent` 的拖拽提交以本体 interaction patch 为准。
- `useNodeHandling` / `useEdgeHandling` 只通过本体 document use-case 改语义数据。
- 旧 graph store 只接收本体 document 投影出的 display cache。
- 静态扫描旧 `updateNodePosition/handleGroupMove/updateGroupBoundary` 调用点，确认不再承担最终坐标和边界真相源。

### 7.2 任务 C2：legacy display bridge 降级

目标：

`legacy-graph` adapter 只保留短期显示缓存能力，不再反向重建本体文档。

要求：

- document -> legacy display 是允许方向。
- legacy graph -> document 只允许在旧数据迁移入口集中出现。
- 组件层不得直接调用旧 graph rehydrate。
- `canvasSync.ts` 是旧 graphData 迁移集中点。

### 7.3 任务 C3：列出 Phase 5 算法迁移清单

目标：

不在 Phase 3E-C 直接做算法 DTO，但要列出后续 Phase 5 必须迁移的旧依赖。

清单至少包含：

- layout 输入旧 `Node | Group | Edge` 的调用点。
- edge optimizer 读取旧 display objects 的调用点。
- history 全量旧 graph snapshot 的调用点。
- `Canvas.graphData` display cache 的保留原因和删除条件。

### 7.4 任务 C4：删除 `Canvas.graphData` 显示缓存的前置清单

目标：

本阶段只准备删除条件，不直接做算法相关迁移。

前置条件：

- ReactFlow adapter 能直接从本体 document 投影。
- 主交互路径不依赖旧 graph store。
- 默认 workspace 的旧 display cache 有可替代生成方式。
- layout/history/edge optimizer 的旧依赖已登记到 Phase 5。

删除动作放到 Phase 7，除非 Phase 5/6 已提前完成全部前置条件。

## 8. Phase 4/5 前置门禁

进入 Phase 4 UI feature 化前必须满足：

- Phase 3E-A 正确性全部通过。
- Phase 3E-B 节点 UI 主体已本体化。
- 拖拽中不会保存、布局、全图边重算。
- `OntologyDocumentState` 是节点位置、Domain 边界、节点属性真相源。
- 旧 graph store 不再参与拖拽最终位置判断。

进入 Phase 5 算法 DTO/worker/history 前必须满足：

- Phase 4 UI feature 化完成。
- UI token/config 和算法 config 已分离。
- 节点和 Domain UI 尺寸来源稳定，可由 adapter 生成 Layout DTO。
- LOD/collapse 不再依赖旧节点 DOM 全量渲染。

否则不能开始 layout worker、patch history、算法 DTO 的大规模重构。

## 9. 开发检查清单

每轮实现前：

- 已读本计划和对应契约章节。
- 已在 `ITERATION_LOG.md` 写明本轮必读章节。
- 已明确本轮修改属于 Phase 3E-A、3E-B 还是 3E-C。
- 已确认不会绕过 data-layer 保存。
- 已确认不会把 UI token 和算法配置混在一起。

每轮实现中：

- 先写或更新测试。
- 再实现 model。
- 再接 store/block。
- 最后接 UI/adapter。
- 每完成一个新主线能力，检查旧实现能否删除。

每轮交付前：

- 运行本轮对应测试。
- 运行 `npm run lint`。
- 运行 `npm run build`。
- 运行 `git diff --check`。
- 更新 `ITERATION_LOG.md`。
- 如果改了架构事实，同步 `CODEBASE.md`。

## 10. 当前下一步

下一步应进入 Phase 3E-A，不做 UI、不做布局算法。

推荐第一轮任务：

1. 新增 `domainNesting.ts` 纯 model。
2. 新增 `test-domain-nesting-interactions.mjs`。
3. 覆盖 Domain 后代收集、Domain move offset、ReactFlow relative 转 absolute。
4. 暂不接 `GraphPageContent`。

推荐第二轮任务：

1. 增加节点约束和边界级联测试。
2. 实现 `commitNodeDrag()` 和 `updateDomainBoundaryCascade()`。
3. 新增 `ontologyDocumentStore.applyInteractionPatch()`。

推荐第三轮任务：

1. 接入 `GraphPageContent.onNodeDragStop`。
2. 让旧 graph store 只吃本体投影 display cache。
3. 验证节点不回弹、Domain 移动后代跟随。

这三轮完成后，再进入节点 UI 产品化。
