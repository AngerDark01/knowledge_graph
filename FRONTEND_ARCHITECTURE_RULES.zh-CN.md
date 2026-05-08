# 前端架构 Rules

本文档沉淀两层约束：

1. **通用前端 Rules**：适用于后续前端项目，强调松耦合、可替换、可单独调整。
2. **Ontology Canvas 项目级 Rules**：针对当前知识图谱 / 本体建模画布项目补充，重点约束本体模型、渲染适配、算法模块、持久化和遗留代码。

决策优先级：

```text
清晰边界 > 临时方便
松耦合 > 局部优雅
真实行为 > 想象设计
可单独调整 > 一次性写死
明确约束 > 隐式约定
```

## 一、通用前端 Rules

### R1 分层与依赖方向

```text
page(壳) -> feature(包) -> core(基础设施) -> data-layer(数据出口)
page     -> ui-kit
feature  -> ui-kit
```

单向不可逆。禁止反向依赖，禁止跨 feature import 内部文件。共享层只能向下稳定。

### R2 页面入口只做装配

route 页面只挂 blocks + 读路由参数。不写请求、状态编排、ws、数据层调用。页面是壳，不是业务中心。

### R3 一个页面一个 feature pack

页面归属必须唯一。子视图、抽屉、面板收进所属 pack。跨页面稳定复用才允许升级独立 pack。

### R4 feature 内部三层强拆

```text
feature/src/
  model/   -> 数据、状态、逻辑。不 import 任何 UI。
  ui/      -> 纯展示组件，只收 props，不碰接口，不碰 model。
  blocks/  -> 接线层，从 model 拿数据，从 ui 拿组件。
  index.ts -> 唯一公开出口。
```

判定：

- 改 UI 不碰 model。
- 改逻辑不碰 ui。
- 换数据源只改 model。

### R5 UI 拆分：配置 vs 样式，零硬编码

- **配置**：尺寸、间距、字号、圆角、布局模式 -> token + variant/size props。
- **样式**：颜色、阴影、动画、过渡 -> 只消费语义 token。

禁止组件内写死基础数值。判定：改一个值要搜多个文件，就必须进 token。

```css
/* 禁 */ padding: 12px; color: #1a1a2e;
/* 对 */ padding: var(--space-md); color: var(--color-text-strong);
```

### R6 数据链路唯一

前端只通过统一数据层获取数据。不在组件里直接拼请求、直连后端协议、维护重复类型定义。缺能力先补数据层，不在 UI 侧 hack。

### R7 状态分层

| 归属 | 管理方式 | 约束 |
|------|----------|------|
| 服务端数据 | 请求缓存层（React Query 等） | 唯一真相源，不复制到客户端 store |
| 全局客户端状态 | 状态管理库（Zustand 等） | 只存本地 UI 状态 |
| 表单状态 | 表单库 + schema 校验 | 表单内闭环 |
| 局部 UI 状态 | useState / useReducer | 组件内闭环 |

服务端数据和客户端状态不混。流式/实时状态必须和真实事件对齐，不本地伪造。

### R8 Mock 规则

- 数据形状必须贴近真实数据层返回。
- Mock 放 `core/mock` 或 `feature/model/mock`，不写死在 JSX。
- 替换真实接口时只改数据源，不重写页面结构。

### R9 性能约束

渲染控制：

- 列表/表格强制虚拟滚动，阈值自定，推荐 > 50 条。
- 重计算用 `useMemo`，事件处理用 `useCallback`，依赖项必须精确。
- 禁止在渲染路径上做深拷贝、大数组 sort/filter、`JSON.parse`。
- 组件拆分粒度以“独立更新边界”为准：一个区域的状态变化不应触发无关区域重渲染。

加载策略：

- 路由级 lazy + Suspense，非首屏 feature 按需加载。
- 图片/媒体资源 lazy load，视口外不加载。
- 大型第三方库（图表、编辑器、地图）独立 chunk，用到时才加载。

数据获取：

- 请求缓存层设合理 `staleTime`，避免重复请求。
- 分页/无限滚动场景用 cursor，不一次拉全量。
- 实时数据用增量推送，不轮询全量。

资源控制：

- `scroll`、`resize`、`input` 等事件监听必须 throttle/debounce。
- WebSocket/EventSource 组件卸载时必须断开。
- 定时器、订阅、副作用必须在 cleanup 中释放。
- 避免内存泄漏：闭包不持有大对象引用，卸载后不 `setState`。

度量：

- 首屏 LCP < 2s，交互 INP < 200ms 作为基线目标。
- 主 chunk 不超过 200KB gzip。
- 新增依赖必须评估体积影响，优先选轻量替代。

### R10 交互落位

- 主动作：页头右侧固定位。
- 危险动作：不放列表高频区。
- 空态：必须给下一步动作。
- 错误：局部优先局部处理，系统级才升全局。
- 视觉密度：工具软件标准，紧凑档位优先。

### R11 松耦合验证

- 换数据源 -> 只改 model。
- 换 UI 风格 -> 只改 token。
- 换组件实现 -> blocks/model 不动。
- 改视觉密度 -> 改 token，不逐个组件改。
- 加新页面 -> 不改现有 feature。

## 二、Ontology Canvas 项目级 Rules

### P1 本体模型独立于渲染引擎

本体、节点、关系、Domain、Subgraph 是领域模型，不能绑定 ReactFlow。

```text
OntologyNode  != ReactFlow Node
OntologyEdge  != ReactFlow Edge
OntologyGraph != ReactFlow runtime state
```

约束：

- `domain/ontology` 不 import React、ReactFlow、DOM、CSS。
- ReactFlow nodes/edges 只能由 adapter 生成。
- 后续如果换成 Canvas/WebGL，不应重写本体数据结构。

### P2 Adapter 是唯一渲染转换口

```text
OntologyGraph + OntologyViewState
        ↓
render adapter
        ↓
ReactFlow nodes / edges
```

约束：

- 组件不直接拼 ReactFlow node。
- store 不把 ReactFlow 专用对象作为真相源。
- LOD、viewport culling、Domain collapse、edge visibility 都在 adapter 里处理。
- adapter 输出对象尽量稳定，未变化节点不生成新对象。

### P3 图谱修改必须走 Command

禁止 UI 里直接调用底层写操作：

```text
updateNode
updateEdge
setNodes
setEdges
```

改用业务命令：

```text
createClassNode
updateNodeFields
createSemanticRelation
deleteNodeAndIncidentEdges
moveNodeToDomain
collapseDomain
expandDomain
linkNodeToSubgraph
applyLayoutPatch
importGraph
```

每个 command 同时负责数据变更、校验、历史记录、持久化 patch 和警告信息。

### P4 持久化白名单

允许持久化：

```text
ontology graph
node positions
domain collapsed state
viewport snapshot
workspace metadata
schemaVersion
```

禁止持久化：

```text
hover
selection
临时表单草稿
拖拽中的每一帧位置
弹窗开关
右键菜单状态
```

拖拽、缩放、行内编辑期间不得同步写入持久化。

### P5 Schema Version + Migration

所有可保存的数据必须带：

```ts
schemaVersion: number
```

约束：

- 每次数据结构变化必须写 migration。
- 加字段必须有默认补齐。
- 删字段必须有迁移策略。
- 导入旧 workspace 不能直接失败。

### P6 算法层必须纯净

算法模块不 import：

```text
React
ReactFlow
Zustand store
fetch
workspace store
UI component
```

算法只接收输入，返回结果：

```ts
layout(input, config) -> LayoutResult
convert(input, schema) -> ConvertResult
validate(graph) -> ValidationResult
```

算法不直接改 store、不保存文件、不弹 toast、不切换画布。

### P7 算法不直接消费 UI 模型

布局、边优化、嵌套树、导入转换不应直接依赖混有 UI 状态的 `Node | Group | Edge`。

推荐中立 DTO：

```ts
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
```

转换链路：

```text
OntologyGraph / LayoutGraph
        ↓
algorithm adapter
        ↓
ELK / edge optimizer / nesting tree
        ↓
patch result
```

### P8 算法只返回 patch，不直接改图

自动布局、边优化、Mermaid 导入、未来本体推理都只返回 patch/result：

```ts
type GraphPatch = {
  nodePositions?: Record<string, { x: number; y: number }>
  edgeHandles?: Record<string, { sourceHandle?: string; targetHandle?: string }>
  graphChanges?: unknown[]
  warnings?: string[]
}
```

由 command 层统一应用 patch，保证 history、undo、persistence 一致。

### P9 外部算法库必须隔离

ELK、Mermaid 等第三方算法库不能散落在业务代码里。

```text
core/algorithms/layout/adapters/elkAdapter.ts
core/algorithms/import/adapters/mermaidAdapter.ts
```

换布局库或解析器时，不应波及 feature UI 和 page。

### P10 重算法必须异步、可取消、可度量

布局、导入、推理都必须支持：

- 可取消。
- 有 timeout。
- 有 duration。
- 有 structured warnings/errors。
- 大图场景可迁移到 Web Worker。

禁止在拖拽路径同步跑全图布局或全图边路径重算。

### P11 算法配置独立于 UI token

UI token 控制视觉：

```text
字号、间距、圆角、颜色、阴影、动画
```

算法 config 控制计算：

```text
node gap
rank direction
edge spacing
max nesting depth
batch threshold
layout strategy
```

两类配置不能混用。改视觉密度不应意外改变算法结果。

### P12 Mermaid 导入是 use case，不是大 service

Mermaid 导入应拆成：

```text
features/mermaid-import/model/
  parseMermaid
  convertMermaidToOntologyGraph

features/ontology-canvas/model/
  importGraphCommand
  applyLayoutCommand

data-layer/
  saveWorkspace
```

导入算法只负责“把 Mermaid 变成图”，不负责“怎么存、怎么切页面、怎么更新 UI”。

### P13 Legacy 隔离规则

遗留代码统一移动到：

```text
legacy/
  graph-demo/
```

约束：

- 新代码禁止 import legacy 内部文件。
- legacy 只能被临时入口引用。
- 每个 legacy 文件要么迁移，要么删除，要么明确保留理由。
- 新功能不能继续往 legacy 里加。

### P14 Import 边界必须工具化

规则必须进入工具约束，不只写在文档里。

必须禁止：

- 跨 feature import 内部路径。
- `ui` import `model`。
- `model` import `ui`。
- `shared` import `feature`。
- 循环依赖。

建议工具：

```text
eslint no-restricted-imports
eslint-plugin-boundaries
dependency-cruiser
tsconfig paths
```

### P15 图编辑器专属性能红线

```text
100+ 节点必须启用 LOD
200+ 节点必须启用 viewport culling
拖拽期间不得触发全图持久化
缩放期间不得重算完整边路径
布局计算不得在拖拽路径同步执行
```

边查找必须使用 `nodeById`，不得在渲染路径中对所有节点反复 `find`。

### P16 算法测试资产

算法层必须有独立测试资产，不能只靠 UI 手动验证。

最低覆盖：

- 小图。
- 有向图。
- 有 group 的图。
- 嵌套 group。
- 循环嵌套。
- 孤儿边。
- 大图性能样本。
- Mermaid 异常输入。

布局算法可以测试结构约束和错误处理，不强求像素级坐标完全一致。
