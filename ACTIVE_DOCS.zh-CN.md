# 当前活跃文档索引

日期：2026-05-07

## 1. 目的

本文件用于防止项目文档继续堆积。后续开发前优先阅读“活跃文档”，归档文档只在追历史原因时查看，不再作为开发依据。

## 2. 活跃文档

| 文档 | 用途 | 使用规则 |
|------|------|----------|
| `prd.md` | 产品目标与长期形态 | 最高优先级；节点即容器、子画布、LOD、正交边、导航等方向以此为准 |
| `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md` | 当前唯一活跃后续开发路线图 | 后续阶段顺序、门禁、清理策略以此为准 |
| `UI_REFERENCE_INTERACTION_SPEC_2026-05-07.zh-CN.md` | 四张 UI 参考图的交互与落地规格 | UI、LOD、正交边、子画布导航任务必须先读；比直接看图更适合作为执行契约 |
| `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` | 当前节点/Domain 交互验收契约 | 短期修复嵌套、拖拽、resize、节点 UI 时必须先读 |
| `CANVAS_INTERACTION_PERFORMANCE_RESEARCH_2026-05-06.zh-CN.md` | 画布交互性能经验 | 处理拖拽、缩放、resize、边锚点、LOD 时必须先读 |
| `FRONTEND_ARCHITECTURE_RULES.zh-CN.md` | 通用前端分层与松耦合规则 | 所有前端改动必须遵守 |
| `CODEBASE.md` | 当前代码结构权威说明 | 每次代码改动后同步 |
| `ITERATION_LOG.md` | 迭代记录与上下文防丢 | 每轮开工前追加，完成后追加结果 |
| `UI_iamge/` | UI 参考图目录 | 节点 UI、LOD、正交边、子画布导航、MiniMap、Breadcrumb 等 UI 任务开工前必须查看 |

## 3. 归档文档

以下文件已移动到 `_archive/2026-05-07-superseded-docs/`，后续默认不再阅读：

- `ARCHITECTURE_OPTIMIZATION_PLAN.md`
- `ARCHITECTURE_OPTIMIZATION_PLAN.zh-CN.md`
- `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md`
- `CODEBASE_RESCAN_SUMMARY.zh-CN.md`
- `FRONTEND_REVIEW.md`
- `VALIDATION_RESULTS.md`
- `FUTURE_PHASES_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md`
- `PHASE_3E_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md`
- `OPTIMIZATION_TODO_2026-04-29.zh-CN.md`
- `frontend/修复总结.md`
- `frontend/修复说明.md`
- `frontend/快速修复指南.md`
- `frontend/新的经验.md`
- `frontend/经验总结.md`
- `frontend/经验补充.md`

归档原因：这些文件属于早期架构、审查、验证或经验快照，已被当前 PRD、产品交互规格、性能研究和 CODEBASE 覆盖。保留文件是为了追溯，不作为后续实现依据。

以下文件已移动到 `_archive/2026-05-08-ui-cleanup/`，后续默认不再阅读：

- `frontend/components/graph/GRAPH_COMPONENTS_RESTRUCTURE_PLAN.md`

归档原因：该文件描述的是旧 graph component 目录拆分方案，已被当前 `features/ontology-canvas` 分层、`NodeInspectorBlock` 和节点/容器 UI 规划取代。

## 4. 开发前阅读规则

涉及节点、Domain、子画布、LOD、边、拖拽、resize、UI 的任务，开工前必须至少阅读：

1. `prd.md`
2. `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md`
3. `UI_REFERENCE_INTERACTION_SPEC_2026-05-07.zh-CN.md`
4. `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md`
5. `CANVAS_INTERACTION_PERFORMANCE_RESEARCH_2026-05-06.zh-CN.md`
6. `FRONTEND_ARCHITECTURE_RULES.zh-CN.md`

涉及 UI 的任务还必须查看 `UI_iamge/`。

若任务涉及代码结构或重构，还必须同步阅读 `CODEBASE.md` 的相关章节。
