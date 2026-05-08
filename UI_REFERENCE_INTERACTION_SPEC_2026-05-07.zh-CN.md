# UI 参考图交互规格

日期：2026-05-07

## 1. 文档定位

本文把 `UI_iamge/` 下四张参考图抽象成后续开发可执行的产品与实现约束。

它不是简单视觉稿说明，而是后续节点 UI、容器交互、LOD、正交边、子画布导航和性能优化的长期参考规格。后续涉及 UI 或画布交互的任务，必须先读本文，再读 `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md` 中对应阶段。

## 2. 参考图索引

| 文件 | 主题 | 对应能力 |
|------|------|----------|
| `UI_iamge/ChatGPT Image 2026年5月7日 14_47_59.png` | 节点嵌套系统 | 节点即容器、父节点内部画布、节点状态、进入/返回、内部工具 |
| `UI_iamge/ChatGPT Image 2026年5月7日 14_48_14.png` | 正交边系统 | 关系类型、正交路由、通用锚点、语义锚点、边聚合、边 LOD |
| `UI_iamge/ChatGPT Image 2026年5月7日 14_48_46.png` | LOD / 大图浏览系统 | 节点 LOD、边 LOD、内部空间 LOD、Cluster 聚合、MiniMap |
| `UI_iamge/ChatGPT Image 2026年5月7日 14_49_10.png` | Sub 画布导航系统 | 进入/退出子画布、Breadcrumb、跨画布引用、搜索定位、历史导航 |

## 3. 总体抽象

四张图共同表达的产品方向是：

```text
节点 = 本体实体 + 容器 + 可进入的内部画布 + 可降级显示的视图状态
边 = 语义关系 + 锚点 + 正交路径 + LOD 表达 + 跨画布引用
画布 = 可缩放的大图视图 + 子画布导航上下文 + 搜索定位系统
```

长期不再把 Domain 当作唯一分组实体。Domain 只是在当前实现阶段承接“容器 / 上下文边界 / 内部空间”的过渡能力，最终要迁移到“任意本体节点都可以成为容器节点”。

## 4. 图 1：节点嵌套系统

### 4.1 产品含义

节点不是普通卡片。用户看到一个节点时，应该能判断：

- 这是哪类本体实体，例如 Class / Property / Method。
- 它有多少字段、方法、子节点。
- 它当前是折叠节点、紧凑节点、最小节点还是远景 LOD。
- 它是否可以进入内部空间继续建模。

父节点折叠时显示为一个可读的节点卡片；父节点展开或进入后，内部是独立画布空间，不是简单字段列表。

### 4.2 必须保留的交互

- 双击节点或点击入口可以进入节点内部空间。
- 返回操作必须回到父画布，并保留父画布视口与选中上下文。
- 父节点拖动时，内部子节点必须保持相对关系整体位移。
- 在父节点内部创建子节点时，父子关系自动建立，父节点尺寸能容纳子节点。
- 折叠后只显示摘要，不渲染内部完整节点。
- 展开后内部节点恢复原位置。

### 4.3 节点外观状态

节点至少支持以下状态：

| 状态 | 显示内容 | 使用场景 |
|------|----------|----------|
| 完整节点 | 标题、类型、字段、方法、子节点数量、关键状态 | 近景编辑 |
| 紧凑节点 | 标题、类型、字段/方法/子节点数量 | 中近景浏览 |
| 最小节点 | 类型图标、标题、数量徽标 | 中景浏览 |
| 远景 LOD | 类型图标或颜色点 | 大图定位 |
| 选中 | 明确边框、高亮锚点、可见操作入口 | 当前操作对象 |
| 悬停 | 轻量高亮、显示快捷入口 | 探索与预操作 |
| 禁用 / 只读 | 降低对比度，保留结构信息 | 权限或锁定场景 |

### 4.4 数据和模型要求

后续模型需要支持：

- 节点类型、字段数量、方法数量、子节点数量。
- 节点是否拥有内部画布。
- 节点展开 / 折叠状态。
- 节点当前 LOD 视图状态。
- 节点内部画布的 viewport、selection、history 入口。
- 父子关系和内部子画布引用的双向一致性。

### 4.5 UI 配置要求

以下内容必须进入 token 或配置文件：

- 节点宽高、padding、标题高度、分区高度。
- 类型图标、语义颜色、徽标样式。
- 选中、悬停、禁用、只读状态样式。
- 完整 / 紧凑 / 最小 / 远景 LOD 的阈值和尺寸。
- 内部空间入口、返回入口、工具栏尺寸。

## 5. 图 2：正交边系统

### 5.1 产品含义

边不是普通连线。边表达本体元素之间的语义关系，需要通过线型、颜色、箭头、端点符号、标签和锚点体现语义。

当前贝塞尔曲线只能作为过渡。目标边系统必须支持正交折线、语义锚点、关系类型、折叠摘要和 LOD 降级。

### 5.2 关系类型

第一版至少覆盖：

| 类型 | 表达 | 视觉要求 |
|------|------|----------|
| Association | 一般关联 | 实线 + 普通箭头或无箭头 |
| Dependency | 临时依赖 / 使用关系 | 虚线 + 空心箭头 |
| Inheritance | 继承 / 泛化 | 实线 + 三角箭头 |
| Realization | 接口实现 | 虚线 + 三角箭头 |
| Composition | 强组合 | 实线 + 实心菱形 |
| Aggregation | 聚合 | 实线 + 空心菱形 |
| Reference | 引用 / 指针 / 指向 | 点线或弱化线 |
| Event Flow | 事件流 | 事件色 + 方向箭头 |
| Data Flow | 数据流 | 数据色 + 方向箭头 |

### 5.3 正交路由规则

自动路由的优先级：

1. 不穿越节点主体。
2. 尽量连接合适锚点。
3. 避免边重叠。
4. 优先水平 / 垂直路径。
5. 减少折点数量。
6. 与节点边界保持最小间距。

路由算法不能在拖拽中全图运行。拖拽中可以使用轻量临时路径，拖拽结束后只增量重算受影响边。

### 5.4 锚点系统

锚点分两层：

- 通用锚点：Top / Right / Bottom / Left。
- 语义锚点：Field Anchor / Method Anchor / Event Anchor / Section Anchor。

验收要求：

- 节点移动或 resize 后，相关边锚点写入本体 `edgeViews`。
- 自动锚点和用户锁定锚点分开保存。
- 当节点 LOD 降级后，语义锚点可以退化到通用锚点，但不能丢失原始语义引用。

### 5.5 折叠和聚合

当容器折叠时：

- 内部边不完整渲染。
- 外部相关边聚合为摘要边。
- 摘要边显示关系数量和主要关系类型。
- 用户可以 hover 或点击查看聚合明细。

当两个节点之间存在多条同类或相关边时：

- 中远景自动聚合。
- 近景可以展开查看明细。
- 聚合策略要优先保留组合、继承、依赖等高语义权重关系。

## 6. 图 3：LOD / 大图浏览系统

### 6.1 产品含义

LOD 不是只改变视觉大小，而是实际减少渲染复杂度。缩放越远，节点、边、标签、内部空间和属性 DOM 都要逐级降级。

目标体验：

- 近景能编辑。
- 中景能理解结构。
- 远景能看分布。
- 超远景能看集群。

### 6.2 LOD 层级

| 缩放层级 | 节点显示 | 边显示 | 内部空间显示 |
|----------|----------|--------|--------------|
| 100% 近景 | 完整字段、方法、子节点、可操作按钮 | 完整路径、箭头、标签 | 可进入，可编辑 |
| 70% 中近景 | 主要数量、标题、类型、关键状态 | 完整路径，标签可见 | 显示摘要，可进入 |
| 40% 中景 | 标题、类型、数量徽标 | 简化路径，隐藏部分标签 | 仅显示统计信息 |
| 15% 远景 | 图标 / 类型色块 | 主关系线，隐藏标签 | 聚合为集群图标 |
| 5% 超远景 | 位置点 / 集群块 | 仅保留主干或聚合边 | 合并到区域 / 集群 |

### 6.3 Cluster 聚合

聚合规则应结合：

- 节点数量阈值。
- 空间占比。
- 当前缩放级别。
- 语义聚合关系，例如同类型、同模块、同父容器。

聚合结果应能展示：

- 集群名称。
- 子节点数量。
- 主要类型分布。
- 主要关系数量。
- 是否可展开 / 进入。

### 6.4 MiniMap 要求

MiniMap 不是装饰，而是大图导航工具。它需要表达：

- 当前视口。
- 集群区域。
- 当前选中或高亮节点。
- 不同语义区域的颜色。
- 拖拽视口、点击定位、缩放、重置。

## 7. 图 4：Sub 画布导航系统

### 7.1 产品含义

用户进入节点内部后，不应该感觉丢失上下文。系统必须同时表达：

- 当前所在层级。
- 从根画布到当前子画布的路径。
- 如何返回上层。
- 跨画布引用关系在哪里。
- 搜索结果在哪个子画布中。

### 7.2 进入 / 返回

进入规则：

- 双击节点或点击入口进入子画布。
- `Enter` 可作为快捷进入。
- 进入后工具栏切换到子画布模式。
- 进入时保留父画布视口、展开状态、选中状态。

返回规则：

- Back 按钮返回父画布。
- `Esc` 可返回上级。
- Breadcrumb 任意层级可点击跳转。
- 返回后恢复离开前的父画布视图。

### 7.3 Breadcrumb

Breadcrumb 必须：

- 显示完整层级路径。
- 当前层级高亮。
- 支持点击任意祖先层级跳转。
- 路径过长时折叠中间层级，但不能隐藏当前节点和根节点。

### 7.4 跨画布引用

跨画布边需要区分：

- 同画布普通边。
- 进入 / 返回边。
- 引用边。
- 当前画布外部边。

用户点击跨画布引用时：

- 先定位目标所在画布。
- 再进入目标子画布。
- 最后高亮目标节点或锚点。

### 7.5 搜索定位

搜索范围至少包括：

- 节点。
- 字段。
- 方法。
- 引用关系。

搜索结果必须显示完整路径，例如 `Root > Order > Service > PaymentService`。点击结果后，系统自动进入目标子画布并高亮目标。

### 7.6 历史导航

需要保存用户的画布访问历史：

- 后退。
- 前进。
- 返回上一次位置。
- 清空历史。

历史项应记录画布 id、节点 id、viewport、selection 和时间。

## 8. 对开发路线图的约束

四张图要求后续开发顺序调整为：

1. 先修交互正确性和手感：拖拽、resize、父子关系、折叠、边锚点。
2. 再做节点/容器 UI：节点状态、类型图标、字段/方法/子节点、配置 token。
3. 再做真实 LOD：DOM 减少、边降级、聚合、MiniMap。
4. 再做正交边：关系类型、锚点、路由、聚合。
5. 再做子画布导航：进入/返回、Breadcrumb、搜索、历史。
6. 最后再做算法 DTO、worker、history 和 PG adapter。

不得在 UI/交互未稳定前提前进入布局算法重构。

## 9. 对当前实现的影响评估

本节基于 2026-05-07 当前代码状态评估四张概念图对已有节点属性、结构和其他实现的影响。

结论：

```text
不是推倒现有节点模型，
而是把现有“本体节点雏形”扩展成“节点即容器 + 结构化分区 + 语义锚点 + 子画布导航”的完整模型。
```

当前 `OntologyNode` 已有 `id/name/type/description/fields/tags/domainId/subgraphId/metadata`，可以承接第一批本体节点 UI；但概念图要求的方法、子节点、内部画布、语义锚点、导航历史和 LOD 聚合不能长期都塞进 `metadata`。这些需要按路线图分阶段进入明确模型或 view state。

### 9.1 影响矩阵

| 概念图能力 | 当前承载情况 | 影响等级 | 后续动作 |
|------------|--------------|----------|----------|
| 节点标题 / 类型 / 描述 | `OntologyNode.name/type/description` 已支持 | 低 | 保留现有字段，补齐更多 node type |
| Fields 属性列表 | `OntologyNode.fields[]` 已支持 | 低 | 继续使用；字段快速编辑和分区折叠补 view state |
| Methods 方法列表 | 目前只能用 `fields.category='behavior'` 近似表达 | 中 | Phase B 先 UI 映射，后续决定是否新增 `methods[]` 或统一 `sections[]` |
| Constraints / Interfaces / Events 分区 | `fields.category` 有 rule/constraint/interface/behavior | 中 | Phase B 做分区 UI；Phase I 前再决定是否形成更强 schema |
| 子节点数量 | 当前可从 Domain 或 Subgraph 关系推导，但没有 node-owned child list | 中 | Phase E 把节点内部子画布作为正式关系，不在节点上重复维护随意数组 |
| 节点即容器 | 当前是 Domain 过渡容器 + node.subgraphId 雏形 | 高 | Phase E 将 `subgraphId` 明确升级为 `childCanvasId/internalCanvasRef` 语义 |
| Domain / 容器嵌套 | `OntologyDomain.nodeIds/domainIds/parentDomainId` 已支持 | 中 | Phase A/B 继续用作过渡；Phase E 后迁移为容器节点能力 |
| 节点展开 / 折叠 / 自定义尺寸 | `OntologyNodeViewState.expanded/customExpandedSize` 已支持 | 低 | 保留；补 section collapse 和 container collapse |
| 节点 LOD | 当前有全局 `view.lod`，节点 UI 已消费 full/compact/outline/dot | 中 | Phase C 改成真实按 zoom/viewport 计算，避免全局一刀切 |
| 禁用 / 只读 / 锁定状态 | 当前没有明确字段 | 中 | 若是权限/治理语义，进 graph metadata 或权限模型；若只是视觉状态，进 view state |
| 正交边关系类型 | 当前 `OntologyEdge.relation` 是自由字符串 | 高 | Phase D 新增 relation type 枚举或 relation schema，不能只靠 label |
| 通用锚点 | `OntologyEdgeViewState.sourceHandle/targetHandle` 可临时承载 | 中 | Phase D 升级为结构化 anchor ref |
| Field / Method / Section 语义锚点 | 当前没有结构化锚点引用 | 高 | Phase D 新增 anchor target：nodeId + section/field/method id |
| 边路径 / 折点 / 锁定 | 当前 `edgeViews.display` 可临时放，但不应长期依赖 | 高 | Phase D 将 route points、locked、manual handles 独立成 edge view schema |
| 边聚合 / 边 LOD | 当前没有正式模型 | 中 | Phase C/D 先 adapter 计算，必要摘要进入 view state |
| 子画布 viewport | 当前只有全局 `view.viewport` | 高 | Phase E 给每个 sub canvas 独立 viewport、selection、LOD |
| Breadcrumb / 历史导航 | 当前没有正式模型 | 高 | Phase E 新增 navigation state，不放入节点语义字段 |
| 搜索定位 | 当前没有索引结构 | 中 | Phase E 先从 graph/subgraph 动态构造，后续大图再建索引 |
| MiniMap / Cluster | 当前没有正式模型 | 中 | Phase C 由 adapter/selector 计算，持久化只保留必要视图偏好 |

### 9.2 对节点属性的直接影响

现有节点字段可以继续保留：

```text
id
name
type
description
fields[]
tags[]
domainId
subgraphId
metadata
```

短期不建议立刻删除或重命名这些字段。原因是它们已经支撑当前本体文档、持久化、节点 UI 和旧 display cache 过渡。

但后续必须补齐以下能力：

- `OntologyNodeType` 需要扩展到 PRD 中的 Property / Method / Service / Module / Event / Workflow / Agent 等类型。
- `fields[]` 需要明确是“字段分区”还是“通用 section item”。如果继续承载 methods/events，需要更清晰的 `category`、签名、返回值、参数、可见性等结构。
- `subgraphId` 需要明确语义：它是“节点所在子图”还是“节点拥有的内部画布”。长期建议拆成更明确的 `canvasId` / `childCanvasId` / `internalCanvasRef`，避免一个字段表达两个方向。
- 子节点数量不应手写到节点属性里，应由子画布或容器 membership 推导，避免双写不一致。

### 9.3 对 view state 的影响

当前 view state 已经保存：

- node position / width / height / expanded / customExpandedSize。
- domain position / width / height / collapsed。
- edge sourceHandle / targetHandle / display。
- viewport / lod / edgeVisibility。

概念图要求后续新增或细化：

- 节点分区折叠状态，例如 Fields / Methods / Constraints / Interfaces 分别折叠。
- 节点只读、锁定、禁用等视图状态。
- 每个子画布自己的 viewport、selection、LOD 和历史位置。
- 正交边 route points、manual/auto anchor、locked edge、bundled edge summary。
- Cluster / MiniMap 的计算结果不应默认持久化，除非是用户手动保存的区域或视图偏好。

原则：

- 语义事实进 graph。
- 坐标、尺寸、折叠、锚点、视口进 view。
- hover、临时拖拽态、临时搜索输入不持久化。

### 9.4 对边模型的影响

当前 `OntologyEdge` 只有：

```text
id
source
target
relation
direction
domainId
metadata
```

这能承载“有一条关系”，但不能完整承载概念图里的“正交边系统”。

后续 Phase D 至少需要拆清：

- `relationType`：Association / Dependency / Inheritance / Composition 等。
- `relation` 或 `label`：用户可读文本。
- `sourceAnchor` / `targetAnchor`：通用锚点或语义锚点。
- `route`：正交边折点和自动 / 手动状态。
- `aggregation`：多边聚合摘要。

短期可以继续把 sourceHandle/targetHandle 写入 `edgeViews`，但不能把所有正交边数据长期放在 `display: Record<string, unknown>` 里。

### 9.5 对 Domain / 子画布的影响

当前 Domain 仍然有价值，因为它已经承接了嵌套、父子关系、折叠和边界计算。短期不要为了“节点即容器”马上删除 Domain。

正确迁移路径是：

1. Phase A/B：继续稳定 Domain / 容器交互和 UI。
2. Phase E：引入“任意节点拥有内部子画布”的正式模型。
3. 将 Domain 逐步降级为一种容器视图或兼容层。
4. 删除旧 graph store 和旧 Group 真相源，而不是删除还在承接交互正确性的 Domain 能力。

### 9.6 对持久化 schema 的影响

当前持久化版本是 `PERSISTED_ONTOLOGY_CANVAS_VERSION = 1`，schema 使用 `passthrough()`，所以短期可以兼容新增字段。

但正式落地以下能力时应升级 schema version：

- node type 扩展并需要迁移旧 type。
- `subgraphId` 拆分为明确的内部画布引用。
- edge relation type、semantic anchor、route points 正式化。
- 子画布 viewport / navigation history 持久化。
- 删除 `Canvas.graphData` 显示缓存。

不要用 passthrough 当长期设计。它只能帮助迁移期不丢数据，不能替代清晰 schema。

### 9.7 执行结论

新概念图对现有实现的影响分三层：

1. **立即可用**：标题、类型、描述、字段、标签、基础 LOD、节点尺寸、Domain 折叠、基础边 handle。
2. **需要补模型但不急着破坏现有数据**：methods、sections、node type 扩展、section collapse、只读/锁定、relation type、semantic anchor。
3. **需要阶段性 schema 演进**：节点即容器、子画布独立 viewport、Breadcrumb/history、正交边 route、edge bundling、删除旧 graphData。

所以后续开发不能只改 UI，也不能马上大改 schema。正确节奏仍是：

```text
Phase A 稳交互
-> Phase B 产品化节点 UI，同时暴露模型缺口
-> Phase C 真实 LOD
-> Phase D 正交边和语义锚点模型
-> Phase E 子画布导航和节点即容器 schema
-> Phase F/G 再清旧实现和算法 DTO
```

## 10. 后续验收方法

后续每个 UI 或交互任务开工时，必须在 `ITERATION_LOG.md` 写明：

- 本轮参考了哪张图。
- 本轮采用图中的哪些元素。
- 本轮明确不做哪些元素。
- 本轮不变量。
- 本轮验收命令或浏览器验收路径。

交付时必须回写：

- 已落地元素。
- 暂缓元素。
- 是否同步 `CODEBASE.md`。
- 是否需要调整路线图。
