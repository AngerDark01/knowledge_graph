# 开发优化 Todo

日期：2026-04-29

## 本地 Git 备份

已创建本地 git stash 备份，并已 apply 回当前工作区。

```text
stash: stash@{Wed Apr 29 13:44:03 2026}
message: codex-backup-before-optimization-20260429-134327
object: af24c3491674cdf57ccb0a7457656afe0dd803a0
```

恢复方式：

```bash
git stash list
git stash apply stash@{0}
```

## 完成标准

- Phase 0 正确性问题完成一批实际代码修复。
- 不移动大目录，不做大规模架构迁移。
- 保留现有用户改动，不回滚 `frontend/public/workspace/kg-editor:workspace.json` 和 `项目文档/项目本体结构.md`。
- 每轮修复后跑构建或等价验证。
- 修改后同步 `CODEBASE.md` / `ITERATION_LOG.md`。

## Phase 0 修复清单

| 状态 | 任务 | 文件 |
|------|------|------|
| DONE | 创建本地 git 备份 | git stash |
| DONE | 修复 `updateGroup({ nodeIds })` 返回嵌套数组 | `frontend/stores/graph/nodes/groupOperations.ts` |
| DONE | 删除 node 时同步删除 incident edges | `frontend/stores/graph/nodes/basicOperations.ts` |
| DONE | 删除 group/descendants 时同步删除 incident edges | `frontend/stores/graph/nodes/groupOperations.ts` |
| DONE | 修复 edge visibility 契约，区分 all/none/custom | `frontend/stores/graph/edgesSlice.ts`、`GraphPageContent.tsx`、`EdgeFilterControl.tsx` |
| DONE | 下线临时 Mermaid 导入链路 | `frontend/services/mermaid/*`、`frontend/components/graph/import/*`、后端 Mermaid converter |
| DONE | 清零前端 lint error | graph runtime model/store、workspace sync、storage、layout API、Markdown/test/dialog |
| DONE | 修复 Docker Compose Dockerfile 路径 | `docker-compose.yml` |
| DONE | 修复 Tailwind/shadcn 路径 | `frontend/tailwind.config.ts`、`frontend/components.json` |
| DONE | 跑验证 | `npm run build` 通过；`npm run lint` 仍失败，数量与既有基线一致 |
| DONE | 同步 CODEBASE/ITERATION_LOG | `CODEBASE.md`、`ITERATION_LOG.md` |

## 本轮验证记录

| 命令 | 结果 | 说明 |
|------|------|------|
| `rg` 静态回查 | PASS | 未再发现旧 edge 空数组过滤、旧 Dockerfile/src 路径 |
| `git diff --check` | PASS | 当前 diff 无空白错误 |
| `cd frontend && npm run build` | PASS | Next 生产构建通过 |
| `cd frontend && npm run lint` | FAIL | 仍为既有 lint 债务：159 errors / 96 warnings |
| `docker compose config` / `docker-compose config` | SKIP | 本机 Docker 没有 compose 子命令，且未安装 docker-compose |

## 本轮没有处理的残留问题

- `GraphPageContent` 整 store 订阅已在 Phase 2C 拆为 selector；Phase 3A 已完成 adapter LOD 标记和 viewport culling，后续仍需要 adapter cache 和节点 UI LOD 降级。
- `EdgeEditor` 仍然每次表单变化写全局 store，后续需要 draft + 显式保存。
- `history` 仍然是全量浅快照，后续需要 command/patch history。
- `persistenceMiddleware` 仍然订阅整个 graph store，后续需要持久化白名单。
- `pnpm-lock.yaml` 与 `package-lock.json` 并存，暂不在本轮选择包管理器。

## Phase 1 迁移说明

新的架构目录是目标形态，不做一次性大搬家。迁移顺序是：

1. 先抽纯规则：`domain/ontology/commands`。
2. 旧 store 调用新命令，保持 UI 和交互不变。
3. 再抽 command/use-case。
4. 再抽 ReactFlow adapter。
5. 最后移动 feature/ui 和清理 legacy。

## Phase 1 已完成

| 状态 | 任务 | 文件 |
|------|------|------|
| DONE | 新增 `domain/ontology` 命令出口 | `frontend/domain/ontology/index.ts`、`commands/index.ts` |
| DONE | 抽出边可见性纯规则 | `frontend/domain/ontology/commands/edgeVisibility.ts` |
| DONE | 抽出删除节点清边纯规则 | `frontend/domain/ontology/commands/graphConsistency.ts` |
| DONE | 让旧 edge slice 调用新命令 | `frontend/stores/graph/edgesSlice.ts` |
| DONE | 让旧 node/group 删除调用新命令 | `basicOperations.ts`、`groupOperations.ts` |
| DONE | 让边渲染过滤复用新规则 | `GraphPageContent.tsx` |
| DONE | 顺手修掉本轮触达文件里的低风险 lint 点 | `GraphPageContent.tsx`、`EdgeFilterControl.tsx` |
| DONE | 新增轻量架构边界检查 | `frontend/scripts/check-architecture-boundaries.mjs`、`package.json` |
| DONE | 新增 domain command 运行时测试 | `frontend/scripts/test-domain-commands.mjs`、`package.json` |
| DONE | 新增 Phase 1 一键验收命令 | `frontend/package.json` 的 `check:phase1` |

## Phase 1 完结结论

阶段 1 已完成。当前不是把所有目录一次性迁到目标架构，而是先完成第一条真实边界：

```text
旧 store / UI 调用方
  -> domain/ontology/commands 纯规则
  -> architecture boundary check
  -> runtime domain tests
```

这一阶段已经能防止 `domain/ontology` 被 React、ReactFlow、Zustand、fetch、CSS 反向污染，也能用脚本验证已抽出的纯规则没有回归。

## Phase 1 验证记录

| 命令 | 结果 | 说明 |
|------|------|------|
| `rg` 检查 `domain/ontology` 反向依赖 | PASS | 未引入 React、ReactFlow、Zustand、fetch、CSS |
| `cd frontend && npm run check:architecture` | PASS | 检查 4 个 `domain/ontology` 源文件 |
| `cd frontend && npm run test:domain` | PASS | 覆盖 edge visibility、incident edge cleanup、输入不可变性 |
| `cd frontend && npm run check:phase1` | PASS | 串联 architecture boundary 和 domain runtime tests |
| `git diff --check` | PASS | 当前 diff 无空白错误 |
| `cd frontend && npm run build` | PASS | Next 生产构建通过 |
| `cd frontend && npm run lint` | FAIL | 仍有历史债务，但降到 155 errors / 92 warnings |

## Phase 2A 已完成

| 状态 | 任务 | 文件 |
|------|------|------|
| DONE | 新增本体 schema version | `frontend/domain/ontology/model/schemaVersion.ts` |
| DONE | 新增本体节点、边、域、子图、图模型 | `frontend/domain/ontology/model/*.ts` |
| DONE | 新增 legacy graph -> ontology graph mapper | `frontend/domain/ontology/mappers/legacyGraphMapper.ts` |
| DONE | 新增 ontology graph validation | `frontend/domain/ontology/validation/graphValidation.ts` |
| DONE | 更新 domain 公开出口 | `frontend/domain/ontology/index.ts` |
| DONE | 新增本体模型运行时测试 | `frontend/scripts/test-ontology-model.mjs` |
| DONE | 新增 Phase 2 一键验收命令 | `frontend/package.json` 的 `check:phase2` |

## Phase 2A 完结结论

阶段 2A 已完成。当前已经有了不依赖 UI/store/ReactFlow 的语义层骨架：

```text
legacy Node/Group/Edge
  -> mapLegacyGraphToOntologyGraph()
  -> OntologyGraph
  -> validateOntologyGraph()
```

这一阶段没有替换旧画布运行态，目的是先把语义真相源建稳。后续 Phase 2B 再把 command/use-case 和 history 慢慢接进旧 store。

## Phase 2A 验证记录

| 命令 | 结果 | 说明 |
|------|------|------|
| `cd frontend && npm run check:phase2` | PASS | 检查 architecture boundary、Phase 1 domain tests、Phase 2 ontology tests |
| `cd frontend && npm run test:ontology` | PASS | 覆盖 mapper、validator、domain cycle、缺失 edge endpoint、空 relation |
| `cd frontend && npm run build` | PASS | Next 生产构建通过 |
| `cd frontend && npm run lint` | FAIL | 仍为历史 lint 债务基线，未作为 Phase 2A 阻断项 |

## Phase 2B 第一批已完成

| 状态 | 任务 | 文件 |
|------|------|------|
| DONE | 新增 ontology command result 和 warning 契约 | `frontend/domain/ontology/commands/graphCommands.ts` |
| DONE | 新增创建类图节点 command | `createClassNode` |
| DONE | 新增更新节点字段 command | `updateNodeFields` |
| DONE | 新增创建语义关系 command | `createSemanticRelation` |
| DONE | 新增移动节点到 Domain command | `moveNodeToDomain` |
| DONE | 删除旧 `visibleEdgeIds` 兼容字段和调用链 | `edgesSlice.ts`、`GraphPageContent.tsx`、`EdgeFilterControl.tsx`、`graphConsistency.ts` |
| DONE | 抽出测试脚本共享 TS module loader | `frontend/scripts/load-typescript-module.mjs` |
| DONE | 新增 ontology command 运行时测试 | `frontend/scripts/test-ontology-commands.mjs` |
| DONE | 扩展 Phase 2 一键验收命令 | `frontend/package.json` 的 `check:phase2` |

## Phase 2B 第一批验证记录

| 命令 | 结果 | 说明 |
|------|------|------|
| `rg "visibleEdgeIds|setVisibleEdgeIds" frontend` | PASS | 代码中已无旧 edge visibility 兼容字段引用 |
| `cd frontend && npm run check:phase2` | PASS | 16 个 `domain/ontology` 文件通过边界检查，domain/model/command 测试通过 |
| `cd frontend && npm run build` | PASS | Next 生产构建通过 |
| `cd frontend && npm run lint` | FAIL | 仍为历史 lint 债务基线 `155 errors / 92 warnings`，未扩大 |

## Phase 2B 编辑入口收敛已完成

| 状态 | 任务 | 文件 |
|------|------|------|
| DONE | 抽出编辑器 draft/model helper | `frontend/components/graph/editors/editorDrafts.ts` |
| DONE | 边编辑器删除输入即写全局 store 的旧 effect | `frontend/components/graph/editors/EdgeEditor.tsx` |
| DONE | 边自定义属性 JSON 改为 draft 校验，非法 JSON 不写 store | `EdgeEditor.tsx`、`editorDrafts.ts` |
| DONE | 节点编辑器修正 hook/表单状态结构，外层选数据、内层持 draft | `frontend/components/graph/editors/NodeEditor.tsx` |
| DONE | 节点分组变更不再直接 `updateNode({ groupId })` | `NodeEditor.tsx` |
| DONE | 结构化属性编辑器只回写父级 draft，不接触 graph store | `StructuredAttributeEditor.tsx` |
| DONE | 新增编辑器 draft 运行时测试 | `frontend/scripts/test-editor-drafts.mjs` |
| DONE | `check:phase2` 纳入编辑器 draft 测试 | `frontend/package.json` |

## Phase 2B 编辑入口验证记录

| 命令 | 结果 | 说明 |
|------|------|------|
| `rg "updateEdge\\(" frontend/components/graph/editors/EdgeEditor.tsx` | PASS | 只剩保存处理里的 `updateEdge`，没有输入即写 effect |
| `rg "setFormData|formData|useEffect" frontend/components/graph/editors/{EdgeEditor,NodeEditor,StructuredAttributeEditor}.tsx` | PASS | 三个编辑器文件无旧 formData/effect 同步草稿路径 |
| `rg "updateNode\\([^\\n]+groupId|groupId:\\s*undefined|setGroupId\\(" frontend/components/graph/editors/NodeEditor.tsx` | PASS | NodeEditor 不再直接用 `updateNode` 写 membership |
| `cd frontend && npm run test:editors` | PASS | 覆盖 edge/node draft、JSON 解析、payload 不含 groupId、属性转换 |
| `cd frontend && npx eslint components/graph/editors/EdgeEditor.tsx components/graph/editors/NodeEditor.tsx components/graph/editors/StructuredAttributeEditor.tsx components/graph/editors/editorDrafts.ts` | PASS | 本轮触达编辑器文件无 lint error |
| `cd frontend && npm run check:phase2` | PASS | 架构边界、domain/model/command/editor tests 全通过 |
| `cd frontend && npm run build` | PASS | Next 生产构建通过 |
| `git diff --check` | PASS | 当前 diff 无空白错误 |
| `cd frontend && npm run lint` | FAIL | 仍为历史 lint 债务；当前为 `145 errors / 92 warnings`，本轮触达编辑器文件不在失败列表 |

## Phase 2B Feature Model 边界迁移已完成

| 状态 | 任务 | 文件 |
|------|------|------|
| DONE | 新建 ontology canvas feature 公开出口 | `frontend/features/ontology-canvas/index.ts` |
| DONE | 新建 feature model/inspector 公开出口 | `frontend/features/ontology-canvas/model/index.ts`、`model/inspector/index.ts` |
| DONE | 将编辑器 draft/model helper 迁入 feature model | `frontend/features/ontology-canvas/model/inspector/editorDrafts.ts` |
| DONE | 删除旧 UI 目录下的 helper 实现 | `frontend/components/graph/editors/editorDrafts.ts` |
| DONE | 旧编辑器改为从 feature 公开出口导入 model helper | `EdgeEditor.tsx`、`NodeEditor.tsx`、`StructuredAttributeEditor.tsx` |
| DONE | 扩展架构边界检查到 feature model | `frontend/scripts/check-architecture-boundaries.mjs` |
| DONE | 编辑器 draft 测试改为加载 feature model 路径 | `frontend/scripts/test-editor-drafts.mjs` |

## Phase 2B Feature Model 验证记录

| 命令 | 结果 | 说明 |
|------|------|------|
| `cd frontend && npm run check:architecture` | PASS | 检查 `domain/ontology` 16 个文件、`features/ontology-canvas/model` 3 个文件 |
| `rg "components/graph/editors/editorDrafts|from './editorDrafts'" frontend` | PASS | 旧 editorDrafts 实现和相对导入已清理 |
| `cd frontend && npm run test:editors` | PASS | 测试已加载 feature model helper |
| `cd frontend && npx eslint ...features/ontology-canvas... components/graph/editors...` | PASS | 本轮新增 feature model 和触达编辑器文件无 lint error |
| `cd frontend && npm run check:phase2` | PASS | Phase 2 全量阶段检查通过 |
| `cd frontend && npm run build` | PASS | Next 生产构建通过 |
| `git diff --check` | PASS | 当前 diff 无空白错误 |
| `cd frontend && npm run lint` | FAIL | 仍为历史 lint 债务；当前为 `145 errors / 92 warnings` |

## Phase 2B Inspector Save Plan 收敛已完成

| 状态 | 任务 | 文件 |
|------|------|------|
| DONE | 新增 Inspector 保存计划模型 | `frontend/features/ontology-canvas/model/inspector/savePlans.ts` |
| DONE | EdgeEditor 保存改为执行 save plan | `frontend/components/graph/editors/EdgeEditor.tsx` |
| DONE | NodeEditor 保存改为执行普通字段 update + membership plan | `frontend/components/graph/editors/NodeEditor.tsx` |
| DONE | 测试覆盖 save plan | `frontend/scripts/test-editor-drafts.mjs` |

## Phase 2C Canvas Interaction 旧实现清理已完成

| 状态 | 任务 | 文件 |
|------|------|------|
| DONE | 新增画布交互 model 出口 | `frontend/features/ontology-canvas/model/interactions/index.ts` |
| DONE | 抽出节点展开/折叠 patch 和自定义展开尺寸判定 | `frontend/features/ontology-canvas/model/interactions/nodeExpansion.ts` |
| DONE | 抽出选中删除/清空画布计划 | `frontend/features/ontology-canvas/model/interactions/canvasDeletion.ts` |
| DONE | 删除 useNodeExpansion 本地重复状态和 effect 同步 | `frontend/components/graph/core/hooks/useNodeExpansion.ts` |
| DONE | 删除快捷键手动重复删 incident edges 的旧实现 | `frontend/components/graph/core/hooks/useKeyboardShortcuts.ts` |
| DONE | 清空画布复用 deletion plan | `frontend/components/graph/core/hooks/useViewportControls.ts` |
| DONE | 收敛连接 hook 和边组件的 `any`，修正 inline edge label update payload | `useEdgeHandling.ts`、`CustomEdge.tsx`、`CrossGroupEdge.tsx` |
| DONE | NoteNode 自定义展开尺寸判定复用 feature model，修复 memoization lint error | `frontend/components/graph/nodes/NoteNode.tsx` |
| DONE | nodeSyncUtils 移除本文件内 `any` | `frontend/components/graph/core/nodeSyncUtils.ts` |
| DONE | 新增交互模型运行时测试并纳入 Phase 2 | `frontend/scripts/test-canvas-interactions.mjs`、`frontend/package.json` |

## Phase 2C 验证记录

| 命令 | 结果 | 说明 |
|------|------|------|
| `cd frontend && npm run test:canvas:interactions` | PASS | 覆盖展开 patch、自定义展开尺寸、选中删除计划、清空计划 |
| `cd frontend && npm run check:architecture` | PASS | 检查 `domain/ontology` 16 个文件、`features/ontology-canvas/model` 7 个文件 |
| `cd frontend && npx eslint ...本轮触达文件...` | PASS | 本轮新增/触达文件无 lint error，旧组件仍有 warning |
| `cd frontend && npm run check:phase2` | PASS | Phase 2 阶段检查包含 canvas interaction 测试 |
| `cd frontend && npm run build` | PASS | Next 生产构建通过 |
| `git diff --check` | PASS | 当前 diff 无空白错误 |
| `cd frontend && npm run lint -- --quiet` | FAIL | 历史 lint 债务继续存在，但 error 从 `145` 降到 `122` |

## Phase 2C LayoutControl 控制层收敛已完成

| 状态 | 任务 | 文件 |
|------|------|------|
| DONE | 新增布局控制 feature model helper | `frontend/features/ontology-canvas/model/layout/layoutControl.ts` |
| DONE | 新增布局控制 model 出口 | `frontend/features/ontology-canvas/model/layout/index.ts` |
| DONE | LayoutControl 复用 helper，删除本轮触达的 `any` patch 拼装 | `frontend/components/graph/controls/LayoutControl.tsx` |
| DONE | 收紧主布局服务 options/result 类型 | `frontend/services/layout/types/layoutTypes.ts` |
| DONE | 收紧旧重复 layout 类型中的 `any` | `frontend/types/layout/node.ts`、`edge.ts`、`strategy.ts` |
| DONE | 新增布局控制 model 运行时测试并纳入 Phase 2 | `frontend/scripts/test-layout-control-model.mjs`、`frontend/package.json` |

## Phase 2C LayoutControl 验证记录

| 命令 | 结果 | 说明 |
|------|------|------|
| `cd frontend && npm run test:layout:control` | PASS | 覆盖布局 options、group 判断、子节点筛选、node/edge patch |
| `cd frontend && npm run check:architecture` | PASS | 检查 `domain/ontology` 16 个文件、`features/ontology-canvas/model` 9 个文件 |
| `cd frontend && npx eslint ...本轮触达文件...` | PASS | LayoutControl、layout model、layout types 无 lint error |
| `cd frontend && npm run check:phase2` | PASS | Phase 2 阶段检查包含 layout control 测试 |
| `cd frontend && npm run build` | PASS | Next 生产构建通过 |
| `git diff --check` | PASS | 当前 diff 无空白错误 |
| `cd frontend && npm run lint -- --quiet` | FAIL | 历史 lint 债务继续存在，但 error 从 `122` 降到 `94` |

## Phase 2C ELK 配置与转换器类型收敛已完成

| 状态 | 任务 | 文件 |
|------|------|------|
| DONE | 新增 ELK option 最小类型契约 | `frontend/services/layout/types/layoutTypes.ts`、`frontend/types/layout/strategy.ts` |
| DONE | `ELKConfigBuilder` 移除公开 `any` 返回值 | `frontend/services/layout/utils/ELKConfigBuilder.ts` |
| DONE | `ELKGraphConverter` 移除 `Record<string, any>` 和 `customExpandedSize` unsafe cast | `frontend/services/layout/utils/ELKGraphConverter.ts` |
| DONE | 删除转换器中未使用的旧 `nodeMap` 参数链路 | `frontend/services/layout/utils/ELKGraphConverter.ts` |
| DONE | 抽出 ELK 运行时适配器，策略文件不再直接持有动态模块 `any` | `frontend/services/layout/utils/ELKRuntime.ts`、`ELKLayoutStrategy.ts`、`ELKGroupLayoutStrategy.ts` |
| DONE | ELK 策略改为执行布局时才加载 `elkjs`，避免构建/SSR 阶段副作用 | `ELKLayoutStrategy.ts`、`ELKGroupLayoutStrategy.ts` |
| DONE | 群组子图边过滤从 O(E*N) 降为 Set-based O(E) | `frontend/services/layout/strategies/ELKGroupLayoutStrategy.ts` |
| DONE | 新增 ELK 布局模型运行时测试并纳入 Phase 2 | `frontend/scripts/test-elk-layout-model.mjs`、`frontend/package.json` |

## Phase 2C ELK 验证记录

| 命令 | 结果 | 说明 |
|------|------|------|
| `cd frontend && npm run test:layout:elk` | PASS | 覆盖 ELK 配置、merge、group 转换、展开尺寸、坐标提取 |
| `cd frontend && npx eslint ...本轮触达文件...` | PASS | ELK config/converter/strategy/types/test 无 lint error |
| `cd frontend && node --input-type=module -e "...createELKEngine()"` | PASS | 确认 ELK runtime 能创建带 `layout` 函数的 engine |
| `cd frontend && npm run check:phase2` | PASS | Phase 2 阶段检查包含 ELK layout model 测试 |
| `cd frontend && npm run build` | PASS | 首次构建发现 ELK 构造期加载错误，修为懒加载后重跑通过 |
| `git diff --check` | PASS | 当前 diff 无空白错误 |
| `cd frontend && npm run lint -- --quiet` | FAIL | 历史 lint 债务继续存在，但 error 从 `94` 降到 `70` |

## Phase 2C 临时 Mermaid 导入下线已完成

| 状态 | 任务 | 文件 |
|------|------|------|
| DONE | 删除前端 Mermaid 导入 UI 入口 | `frontend/components/graph/import/*`、`frontend/components/graph/controls/MermaidImportControl.tsx` |
| DONE | Toolbar 移除导入按钮和 dialog 状态 | `frontend/components/graph/controls/Toolbar.tsx` |
| DONE | 删除 Mermaid 导入 hook 和前端 service | `frontend/hooks/useMermaidImport.ts`、`frontend/services/mermaid/*` |
| DONE | 删除前端 Mermaid 临时测试脚本 | `frontend/test-mermaid.ts`、`frontend/test-mermaid-parser.ts` |
| DONE | 删除后端未挂载的 Mermaid converter/API/test | `backend/controllers/mermaid.py`、`backend/services/graph/mermaid_converter.py`、`backend/test_mermaid_converter.py` |
| DONE | 移除前端 `mermaid` npm 依赖并更新 lockfile | `frontend/package.json`、`frontend/package-lock.json` |
| DONE | 导入协议改为“待设计”，旧架构文档已归档 | `_archive/2026-05-07-superseded-docs/ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` |
| DONE | 归档历史 Mermaid 研究文档和示例脚本 | `项目文档/_archive/mermaid-import-legacy/` |

## Phase 2C Mermaid 下线验证记录

| 命令 | 结果 | 说明 |
|------|------|------|
| `rg "Mermaid|mermaid|useMermaidImport|MermaidImport" frontend backend ...` | PASS | 活跃前后端代码无 Mermaid 引用 |
| `rg '"mermaid"|@mermaid-js' frontend/package.json frontend/package-lock.json` | PASS | 前端依赖和 lockfile 已无 mermaid 包 |
| `cd frontend && npx eslint components/graph/controls/Toolbar.tsx --quiet` | PASS | Toolbar 下线导入入口后无 lint error |
| `cd frontend && npm run check:phase2` | PASS | 阶段 2 主线测试通过 |
| `python -m compileall backend` | PASS | 后端基础语法通过；命令扫描了 venv，输出较多 |
| `cd frontend && npm run build` | PASS | Next 生产构建通过 |
| `git diff --check` | PASS | 当前 diff 无空白错误 |
| `cd frontend && npm run lint -- --quiet` | FAIL | 历史 lint 债务继续存在，但 error 从 `70` 降到 `61` |

## Phase 2C Graph Runtime 类型债务清理已完成

| 状态 | 任务 | 文件 |
|------|------|------|
| DONE | 旧 graph model 的开放 `any` 收敛为 `unknown` / `Record<string, unknown>` | `frontend/types/graph/models.ts` |
| DONE | nodes store 的 `set/get/state` 类型收敛，删除节点操作中的 `any` | `frontend/stores/graph/nodes/*` |
| DONE | conversion 隐藏字段先显式化以清 lint，随后在旧转换链路删除阶段彻底删除 | `frontend/stores/graph/nodes/conversionOperations.ts` |
| DONE | edges/canvas view store 去掉 `any` | `frontend/stores/graph/edgesSlice.ts`、`frontend/stores/graph/canvasViewSlice.ts` |
| DONE | workspace sync 去掉 graphData/viewport 的 `any` 断言 | `frontend/utils/workspace/canvasSync.ts` |
| DONE | storage manager 删除画布树递归使用 `CanvasTreeNode[]` | `frontend/services/storage/StorageManager.ts` |
| DONE | layout API request options 改为 `LayoutOptions` | `frontend/app/api/layout/route.ts` |
| DONE | Markdown renderer、node editor test、delete dialog 收尾 lint error | `MarkdownRenderer.tsx`、`node-editor.test.tsx`、`DeleteCanvasDialog.tsx` |
| DONE | 删除旧 CommonJS 临时 API 测试脚本 | `frontend/test-api.js` |

## Phase 2C Graph Runtime 类型债务验证记录

| 命令 | 结果 | 说明 |
|------|------|------|
| `cd frontend && npm run lint -- --quiet` | PASS | lint error 从 `61` 降到 `0` |
| `cd frontend && npm run lint` | PASS | `0 errors / 41 warnings`，剩余 warning 是历史未使用项和 hook dependency |
| `cd frontend && npm run build` | PASS | Next 生产构建通过 |
| `cd frontend && npm run check:phase2` | PASS | 阶段 2 主线测试通过 |
| `git diff --check` | PASS | 当前 diff 无空白错误 |

## Phase 2C 旧转换链路删除与渲染热路径收敛已完成

| 状态 | 任务 | 文件 |
|------|------|------|
| DONE | 删除旧 Node/Group 转换 slice | `frontend/stores/graph/nodes/conversionOperations.ts` |
| DONE | nodes slice 不再聚合 conversion operations | `frontend/stores/graph/nodes/index.ts` |
| DONE | 删除 graph model 转换缓存字段 | `frontend/types/graph/models.ts` |
| DONE | 删除 NoteNode/GroupNode 转换 UI 入口 | `frontend/components/graph/nodes/NoteNode.tsx`、`GroupNode.tsx` |
| DONE | nodeSyncUtils 不再过滤旧转换隐藏字段 | `frontend/components/graph/core/nodeSyncUtils.ts` |
| DONE | GraphPageContent 不再过滤旧转换隐藏边，并拆 selector | `frontend/components/graph/core/GraphPageContent.tsx` |
| DONE | edge sync 从每条边 `storeNodes.find()` 改为 `storeNodeById` Map | `frontend/components/graph/core/GraphPageContent.tsx` |
| DONE | 清理主画布和节点 store 高频调试日志 | `GraphPageContent.tsx`、`basicOperations.ts`、`constraintOperations.ts`、`groupOperations.ts`、`groupBoundaryOperations.ts` |

## Phase 2C 旧转换链路删除与热路径收敛验证记录

| 命令 | 结果 | 说明 |
|------|------|------|
| `rg "convertNodeToGroup|convertGroupToNode|ConversionOperations|_hiddenByConversion|_parentConvertedId|convertedFrom|isConverted|savedChildren|savedEdges|originalPosition|originalSize" frontend/components frontend/stores frontend/types frontend/features frontend/services frontend/domain` | PASS | 活跃前端代码无旧转换链路引用 |
| `rg "console\\.log|lastDraggedNodeRef" ...触达热路径文件...` | PASS | 主画布和节点 store 触达热路径无调试 log/ref 残留 |
| `cd frontend && npx eslint ...触达文件... --quiet` | PASS | 本轮触达文件无 lint error |
| `cd frontend && npm run lint -- --quiet` | PASS | 0 errors |
| `cd frontend && npm run lint` | PASS | `0 errors / 28 warnings` |
| `cd frontend && npm run build` | PASS | Next 生产构建通过 |
| `cd frontend && npm run check:phase2` | PASS | 阶段 2 主线测试通过 |
| `git diff --check` | PASS | 当前 diff 无空白错误 |

## Phase 2C ReactFlow Adapter 边界迁移已完成

| 状态 | 任务 | 文件 |
|------|------|------|
| DONE | 新增 ReactFlow adapter projection 出口 | `frontend/features/ontology-canvas/adapters/react-flow/index.ts` |
| DONE | 将节点/边投影逻辑迁入 feature adapter | `frontend/features/ontology-canvas/adapters/react-flow/projection.ts` |
| DONE | 删除旧 core 投影工具 | `frontend/components/graph/core/nodeSyncUtils.ts` |
| DONE | GraphPageContent 改为调用 adapter projection | `frontend/components/graph/core/GraphPageContent.tsx` |
| DONE | adapter 边界纳入架构检查 | `frontend/scripts/check-architecture-boundaries.mjs` |
| DONE | 新增 ReactFlow adapter 运行时测试并纳入 Phase 2 | `frontend/scripts/test-react-flow-adapter.mjs`、`frontend/package.json` |

## Phase 2C ReactFlow Adapter 验证记录

| 命令 | 结果 | 说明 |
|------|------|------|
| `cd frontend && npm run test:react-flow-adapter` | PASS | 覆盖节点相对坐标、排序、默认尺寸、跨组边、visibility none/custom、循环 groupId 降级 |
| `cd frontend && npm run check:architecture` | PASS | 新增 adapter 边界检查，当前检查 adapters 2 个文件 |
| `cd frontend && npx eslint ...adapter/GraphPageContent/test/boundary... --quiet` | PASS | 本轮触达文件无 lint error |
| `cd frontend && npm run check:phase2` | PASS | Phase 2 主线测试已包含 ReactFlow adapter 测试 |
| `cd frontend && npm run lint -- --quiet` | PASS | 0 errors |
| `cd frontend && npm run lint` | PASS | `0 errors / 28 warnings` |
| `cd frontend && npm run build` | PASS | 首次构建发现 feature 根出口类型命名冲突，收窄 adapter 公开类型后重跑通过 |
| `git diff --check` | PASS | 当前 diff 无空白错误 |

## Phase 3A ReactFlow Adapter 性能投影已完成

| 状态 | 任务 | 文件 |
|------|------|------|
| DONE | 新增 ReactFlow LOD mode 解析 | `frontend/features/ontology-canvas/adapters/react-flow/projection.ts` |
| DONE | 新增 viewport bounds / padding / visible node ids 投影选项 | `projection.ts` |
| DONE | 节点投影按视口裁剪，并保留选中节点和父级 group | `projection.ts` |
| DONE | 边投影按可见端点过滤 | `projection.ts` |
| DONE | GraphPageContent 接入 projection bounds、LOD 和 RAF 节流 viewport 更新 | `frontend/components/graph/core/GraphPageContent.tsx` |
| DONE | adapter 测试覆盖 LOD、viewport culling、selected outside node、ancestor group、edge endpoint filtering | `frontend/scripts/test-react-flow-adapter.mjs` |

## Phase 3A 验证记录

| 命令 | 结果 | 说明 |
|------|------|------|
| `cd frontend && npm run test:react-flow-adapter` | PASS | 覆盖 LOD、视口裁剪、选中节点保留、父级 group 保留、边端点过滤 |
| `cd frontend && npm run check:architecture` | PASS | adapter 边界仍保持独立，未引入 store/UI/fetch/CSS |
| `cd frontend && npx eslint ...adapter/GraphPageContent/test... --quiet` | PASS | 本轮触达代码无 lint error |
| `cd frontend && npm run check:phase2` | PASS | 阶段主线检查通过 |
| `cd frontend && npm run lint -- --quiet` | PASS | 0 errors |
| `cd frontend && npm run lint` | PASS | `0 errors / 28 warnings`，未扩大 warning 基线 |
| `cd frontend && npm run build` | PASS | Next 生产构建通过 |
| `git diff --check` | PASS | 当前 diff 无空白错误 |

## Phase 3B 本体运行态切换计划

这部分是根据 2026-04-30 讨论补齐的明确关卡：旧 `Node/Group/Edge + BlockEnum` 不等到 Phase 7 才清理。Phase 7 只做残留文件和历史入口清理；Phase 3B 负责把主运行态切到本体模型。

| 状态 | 任务 | 目标文件/目录 |
|------|------|---------------|
| DONE | 定义 `OntologyDocumentState` 与 `OntologyViewState`，拆开语义图和视图状态 | `frontend/features/ontology-canvas/model/document/ontologyDocument.ts` |
| DONE | 建立本体图 document store，承接加载、投影、新增/编辑、视图更新和删除主状态；旧 graph store 暂作 ReactFlow 显示桥 | `features/ontology-canvas/state/ontologyDocumentStore.ts` |
| DONE | 新增节点 model use-case 调用 `createClassNode()`，默认创建 `OntologyNode.type = "Class"`，新增按钮和拖放入口已接入 | `createOntologyClassNodeInDocument()`、`useNodeHandling.ts` |
| DONE | 新增 Domain command/use-case：`OntologyDomain + DomainViewState`，新增 Domain 入口已接入 | `createDomain()`、`createOntologyDomainInDocument()`、`useNodeHandling.ts` |
| DONE | 新增/编辑关系改为 `createSemanticRelation()` / `updateSemanticRelation()` 与 `OntologyEdge.relation`，旧 label 只做展示桥接 | edge handling、edge editor save plan |
| PARTIAL | ReactFlow adapter 输入改为 `OntologyGraph + OntologyViewState`；当前 GraphPageContent 已直接从 `ontologyDocumentStore.document` 投影，旧 graph store 仍承接显示对象和部分编辑器兼容 | `features/ontology-canvas/adapters/react-flow`、`GraphPageContent.tsx` |
| PARTIAL | 默认 workspace 改为干净本体图示例，旧 demo 大图已删除；持久化 schema 仍待改成 `OntologyGraph + OntologyViewState` | `frontend/public/workspace/kg-editor:workspace.json` |
| PARTIAL | 主链路删除旧 `BlockEnum.NODE/GROUP` 依赖，只允许 legacy mapper/migration/test 保留；当前已删除未使用 core utils，旧 graph store 仍待退场 | `types/graph/models.ts`、`stores/graph/*` |

## Phase 3B 第一批验证记录

| 命令 | 结果 | 说明 |
|------|------|------|
| `cd frontend && npm run test:ontology:commands` | PASS | 覆盖 `createDomain()`、重复 Domain、缺失父 Domain、原有节点/关系命令 |
| `cd frontend && npm run test:ontology:document` | PASS | 覆盖 document state、Domain view、Class/Function node view、重复节点 warning |
| `cd frontend && npm run check:architecture` | PASS | feature model 仍不依赖 UI/store/fetch/CSS |
| `cd frontend && npx eslint ...本轮触达文件... --quiet` | PASS | 本轮新增/触达文件无 lint error |
| `cd frontend && npm run check:phase2` | PASS | 阶段主线检查已包含 `test:ontology:document` |
| `cd frontend && npm run lint -- --quiet` | PASS | 0 errors |
| `cd frontend && npm run lint` | PASS | `0 errors / 28 warnings` |
| `cd frontend && npm run build` | PASS | Next 生产构建通过 |
| `git diff --check` | PASS | 当前 diff 无空白错误 |

## Phase 3B 第二批：新增入口本体化与 legacy bridge 已完成

| 状态 | 任务 | 文件 |
|------|------|------|
| DONE | 新增 `legacy-graph` adapter，隔离旧 graph snapshot -> `OntologyDocumentState` 和 document -> 旧展示对象的临时投影 | `frontend/features/ontology-canvas/adapters/legacy-graph/*` |
| DONE | 新增节点按钮先调用 `createOntologyClassNodeInDocument()`，再临时投影旧 Node 显示 | `frontend/components/graph/core/hooks/useNodeHandling.ts` |
| DONE | 拖放创建节点先调用本体 document use-case，并把目标 Domain 作为 `domainId` | `useNodeHandling.ts` |
| DONE | 新增 Domain 按钮先调用 `createOntologyDomainInDocument()`，再临时投影旧 Group 显示 | `useNodeHandling.ts` |
| DONE | Toolbar 文案从 Node/Group 调整为 Class/Domain，并移除旧 `BlockEnum` 判断 | `frontend/components/graph/controls/Toolbar.tsx` |
| DONE | 新增 legacy bridge 测试并纳入 `check:phase2` | `frontend/scripts/test-ontology-legacy-bridge.mjs`、`frontend/package.json` |

## Phase 3B 第二批验证记录

| 命令 | 结果 | 说明 |
|------|------|------|
| `cd frontend && npm run test:ontology:legacy-bridge` | PASS | 覆盖旧 graph -> document view state、document -> 旧 Node/Group 展示投影、membership 投影开关 |
| `cd frontend && npx eslint ...legacy bridge/useNodeHandling/Toolbar/test... --quiet` | PASS | 本轮新增/触达文件无 lint error |
| `cd frontend && npm run check:phase2` | PASS | 阶段主线检查已包含 legacy bridge 测试 |
| `cd frontend && npm run lint -- --quiet` | PASS | 0 errors |
| `cd frontend && npm run lint` | PASS | `0 errors / 26 warnings` |
| `cd frontend && npm run build` | PASS | 首次发现 feature 根出口 `LegacyGraphNode` 类型名冲突，改名 `LegacyOntologyDisplayNode` 后重跑通过 |
| `git diff --check` | PASS | 当前 diff 无空白错误 |
| `rg ...useNodeHandling/Toolbar old labels/BlockEnum` | PASS | 新增入口和 Toolbar 不再直接引用 `BlockEnum.NODE/GROUP` 或 Add Node/Add Group 文案 |

## Phase 3B 第三批：关系语义化、adapter document 输入、默认数据清理已完成

| 状态 | 任务 | 文件 |
|------|------|------|
| DONE | 新增 `updateSemanticRelation()`，补齐关系编辑 command | `frontend/domain/ontology/commands/graphCommands.ts` |
| DONE | 新增 document 级创建/更新关系 use-case | `frontend/features/ontology-canvas/model/document/ontologyDocument.ts` |
| DONE | 新增旧 edge 展示投影，保留 `OntologyEdge.relation` 到旧 label/customProperties 的桥接 | `frontend/features/ontology-canvas/adapters/legacy-graph/documentBridge.ts` |
| DONE | 连接创建先走 `createOntologyRelationInDocument()`，再临时投影旧 Edge | `frontend/components/graph/core/hooks/useEdgeHandling.ts` |
| DONE | 右侧 EdgeEditor 和边内联编辑先走 `updateOntologyRelationInDocument()` | `EdgeEditor.tsx`、`CustomEdge.tsx` |
| DONE | ReactFlow adapter 新增 `OntologyDocumentState -> ReactFlow` 投影入口，GraphPageContent 已接入 document snapshot | `features/ontology-canvas/adapters/react-flow/projection.ts`、`GraphPageContent.tsx` |
| DONE | 默认 workspace 从旧 demo 大图替换为最小本体示例 | `frontend/public/workspace/kg-editor:workspace.json` |
| DONE | 删除无外部引用的旧 graph core utils | `frontend/components/graph/core/utils/*` |
| DONE | 清零 ESLint warning | 多个低风险未使用符号清理 |

## Phase 3B 第三批验证记录

| 命令 | 结果 | 说明 |
|------|------|------|
| `cd frontend && npm run test:ontology:commands` | PASS | 覆盖 `updateSemanticRelation()` |
| `cd frontend && npm run test:ontology:document` | PASS | 覆盖 document create/update relation |
| `cd frontend && npm run test:ontology:legacy-bridge` | PASS | 覆盖 ontology edge -> legacy edge 投影 |
| `cd frontend && npm run test:react-flow-adapter` | PASS | 覆盖 `OntologyDocumentState -> ReactFlow` 投影 |
| `node -e JSON.parse(...)` | PASS | 默认 workspace JSON 可解析，包含 3 nodes / 1 edge |
| `rg core/utils ...` | PASS | 删除的旧 core utils 无活跃引用 |
| `cd frontend && npm run check:phase2` | PASS | 阶段主线检查全通过 |
| `cd frontend && npm run lint` | PASS | 0 errors / 0 warnings |
| `cd frontend && npm run build` | PASS | Next 生产构建通过 |
| `git diff --check` | PASS | 当前 diff 无空白错误 |

## Phase 3B 第四批：OntologyDocumentStore 运行时主线已完成

| 状态 | 任务 | 文件 |
|------|------|------|
| DONE | 新增 `ontologyDocumentStore`，保存当前本体文档、来源 canvas、hydration 状态，并提供 command result / node view / domain view / viewport / delete 应用入口 | `frontend/features/ontology-canvas/state/ontologyDocumentStore.ts` |
| DONE | workspace 加载时同步初始化本体文档；保存时优先从本体文档投影旧 graphData，减少旧 graph store 真相源角色 | `frontend/utils/workspace/canvasSync.ts` |
| DONE | GraphPageContent 改为从 `ontologyDocumentStore.document` 投影 ReactFlow nodes/edges，并在 fallback 情况下从 legacy graph 初始化一次 | `frontend/components/graph/core/GraphPageContent.tsx` |
| DONE | 新增节点、Domain、拖放创建、关系创建、关系编辑、内联关系编辑应用 command result 到本体 store | `useNodeHandling.ts`、`useEdgeHandling.ts`、`EdgeEditor.tsx`、`CustomEdge.tsx` |
| PARTIAL | 简单拖拽、resize、展开、viewport、Delete/Backspace、清空画布已接入 `OntologyViewState` 或删除本体元素；但 Domain 嵌套事务尚未完整迁移，需补 Domain 移动后代 offset、节点约束后坐标、Domain 边界级联同步 | `GraphPageContent.tsx`、`ontologyDocumentStore.ts`、待新增 interaction model |
| DONE | 新增本体删除 command 和 document 删除 use-case，删除 Domain 时级联清理子 Domain、节点、incident relations、subgraph refs 和 view records | `graphCommands.ts`、`ontologyDocument.ts` |
| DONE | 新增 document store 运行时测试并纳入 `check:phase2` | `frontend/scripts/test-ontology-document-store.mjs`、`frontend/package.json` |
| DONE | 将布局服务和 workspace 初始化/保存路径的普通 `console.log` 清理掉；布局调试日志改为 `NEXT_PUBLIC_LAYOUT_DEBUG=true` 才输出 | `layoutDebug.ts`、layout strategies、workspace routes/utils |

## Phase 3B 第四批验证记录

| 命令 | 结果 | 说明 |
|------|------|------|
| `cd frontend && npm run check:phase2` | PASS | 新增 `test:ontology:document-store`，覆盖 store replace/apply/view/viewport/delete |
| `cd frontend && npm run lint` | PASS | ESLint 0 errors / 0 warnings；仅 npm 输出 baseline-browser-mapping 版本提醒 |
| `cd frontend && npm run build` | PASS | Next 生产构建通过；布局策略注册日志已不再输出 |
| `git diff --check` | PASS | 当前 diff 无空白错误 |
| `rg "console\\.log" frontend/app frontend/components/graph/core frontend/services/layout frontend/utils/workspace` | PASS | 除 `layoutDebug.ts` 的显式 debug 出口外，生产主路径普通 log 已清理 |

## Phase 3B 验收标准

| 检查 | 期望 |
|------|------|
| 新增节点 | DONE：语义源先创建 `OntologyNode` 并进入 `ontologyDocumentStore`，旧 `BlockEnum.NODE` 只做当前显示桥接 |
| 新增 Domain | DONE：语义源先创建 `OntologyDomain + DomainViewState` 并进入 `ontologyDocumentStore`，旧 `BlockEnum.GROUP` 只做当前显示桥接 |
| 新增关系 | DONE：语义源已创建/更新 `OntologyEdge.relation` 并进入 `ontologyDocumentStore`，旧 label/relationship 只做展示桥接 |
| 主画布 adapter | PARTIAL：GraphPageContent 已从 `ontologyDocumentStore.document` 投影，旧 graph store 仍承接现有 ReactFlow 显示对象和部分右侧编辑兼容 |
| 默认数据 | PARTIAL：默认 workspace 已是干净本体示例，但 schema 仍是旧 graphData 展示格式 |
| 静态扫描 | Phase 3B 过渡期 `BlockEnum.NODE/GROUP` 只允许出现在 `legacy-graph` adapter、legacy mapper、migration、旧数据测试；最终运行态切换后再删除 `legacy-graph` adapter |

## Phase 3C / 3D 近期计划

根据 2026-05-06 讨论，持久化策略调整为：先保存本体文档 JSON，后续再把 repository adapter 改成 PostgreSQL。为了避免旧 graph store 污染新持久化格式，执行顺序必须先 NodeEditor 本体化，再改保存格式。

### Phase 3C：NodeEditor 纯本体保存

| 状态 | 任务 | 目标文件/目录 |
|------|------|---------------|
| DONE | 新增节点更新 command/use-case：`updateOntologyNodeInDocument()`，支持 name/type/fields/metadata/Domain membership 更新 | `frontend/domain/ontology/commands/graphCommands.ts`、`features/ontology-canvas/model/document/ontologyDocument.ts` |
| DONE | 新增 Domain 更新 command/use-case：`updateOntologyDomainInDocument()`，支持 Domain 名称、父 Domain、collapsed 和 metadata 更新 | `graphCommands.ts`、`ontologyDocument.ts` |
| DONE | 新增 node inspector ontology save plan，把旧 NodeEditor draft 转成本体节点/Domain 更新 + membership 变更 | `features/ontology-canvas/model/inspector/*` |
| DONE | NodeEditor 保存直接写 `ontologyDocumentStore`，再更新旧 display node；删除保存后的 legacy rehydrate 路径 | `frontend/components/graph/editors/NodeEditor.tsx` |
| DONE | 测试覆盖节点标题、类型、字段、Domain membership 保存，以及不再从旧 graph store 重建 document | `frontend/scripts/test-ontology-commands.mjs`、`test-ontology-document-model.mjs`、`test-ontology-document-store.mjs`、`test-editor-drafts.mjs` |
| DONE | 静态扫描确认 NodeEditor 保存路径不再调用 legacy document rehydrate | `rg` 验证 |

Phase 3C 验收：

- DONE：NodeEditor 保存后的语义真相源是 `OntologyDocumentState`。
- DONE：旧 graph store 只接收 display 更新，不参与语义重建。
- DONE：`check:phase2`、`npm run lint`、`npm run build` 通过。

Phase 3C 验证记录：

| 命令 | 结果 | 说明 |
|------|------|------|
| `cd frontend && npm run check:phase2` | PASS | 覆盖 ontology command/document/store/editor/adapter/layout 主线测试 |
| `cd frontend && npm run lint` | PASS | ESLint 0 errors / 0 warnings；仅 npm 输出 baseline-browser-mapping 数据提醒 |
| `cd frontend && npm run build` | PASS | Next 生产构建通过 |
| `git diff --check` | PASS | 当前 diff 无空白错误 |
| `rg "node-editor-legacy-sync|createOntologyDocumentFromLegacyGraph" frontend/components/graph/editors/NodeEditor.tsx` | PASS | NodeEditor 中已无旧 rehydrate 调用 |

### Phase 3D：本体 JSON 持久化

| 状态 | 任务 | 目标文件/目录 |
|------|------|---------------|
| DONE | 定义 `PersistedOntologyCanvas` schema，包含 `graph/view/revision/savedAt`，持久化 view 白名单只保留 node/domain/edge views、viewport、lod、edgeVisibility | `frontend/types/workspace/ontologyCanvas.ts` |
| DONE | 新增 `createPersistedOntologyCanvas()` / `restoreOntologyDocumentFromPersistedCanvas()`，隔离运行时 document 与持久化 snapshot | `features/ontology-canvas/model/document/persistence.ts` |
| DONE | 新增 `workspaceRepository.loadOntologyCanvas/saveOntologyCanvas/migrateOntologyCanvas`，作为唯一数据出口 | `frontend/data-layer/workspace/workspaceRepository.ts` |
| DONE | 第一版 repository adapter 仍写 JSON 文件，复用现有 workspace API；禁止 UI/store 直接 fetch save/load | `frontend/app/page.tsx`、`frontend/utils/workspace/*`、`frontend/stores/graph/persistenceMiddleware.ts` |
| DONE | workspace 保存/加载优先使用 `OntologyGraph + OntologyViewState`，旧 `graphData.nodes/edges` 仅作为迁移输入或临时显示桥输出 | `canvasSync.ts`、workspace models |
| DONE | 组件层 legacy fallback 收口：旧 graphData -> `OntologyDocumentState` 只允许集中在 `canvasSync.ts` | `GraphPageContent.tsx`、`useNodeHandling.ts`、`useEdgeHandling.ts`、`CustomEdge.tsx`、`EdgeEditor.tsx` |
| DONE | 默认 workspace JSON 补充 `ontologyDocument`，旧 `graphData` 降级为显示缓存 | `frontend/public/workspace/kg-editor:workspace.json` |
| DONE | 测试覆盖新 JSON 读写、默认 workspace schema、repository fetch 出口和 ontology canvas helper | `frontend/scripts/test-workspace-repository.mjs` |
| TODO | 彻底删除 `Canvas.graphData` 显示缓存，需要先完成 Phase 3E 主交互/显示路径清理、Phase 5 layout/history/edge optimizer 迁移，以及 Phase 6 workspace schema 收口 | Phase 5/6 |

Phase 3D 验收：

- DONE：默认 workspace 文件已保存 `ontologyDocument` 本体文档 JSON，旧 `Canvas.graphData.nodes/edges` 只作为显示缓存。
- DONE：`workspaceRepository` 是唯一前端保存/加载入口。
- DONE：后续 PostgreSQL 只需要替换 repository adapter，不改 ontology canvas feature。

Phase 3D 验证记录：

| 命令 | 结果 | 说明 |
|------|------|------|
| `cd frontend && npm run test:workspace:repository` | PASS | 覆盖 repository load/save、默认 workspace JSON schema、ontology canvas helper |
| `cd frontend && npm run check:phase2` | PASS | 阶段主线检查包含 workspace repository 测试 |
| `cd frontend && npm run lint` | PASS | ESLint 0 errors / 0 warnings；仅 npm baseline-browser-mapping 数据提醒 |
| `cd frontend && npm run build` | PASS | Next 生产构建通过 |
| `git diff --check` | PASS | 当前 diff 无空白错误 |
| `rg -n "/api/workspace/(save|load)|fetch\\(" frontend/app frontend/components frontend/stores frontend/utils frontend/data-layer -g '*.{ts,tsx}'` | PASS | workspace API fetch 只剩 `data-layer/workspace/workspaceRepository.ts` |
| `rg -n "createOntologyDocumentFromLegacyGraph\\(" frontend/app frontend/components frontend/stores frontend/utils frontend/data-layer -g '*.{ts,tsx}'` | PASS | 旧 graphData 迁移只剩 `frontend/utils/workspace/canvasSync.ts` |

### Phase 3E-A：节点/Domain 嵌套交互修复

新增原因：2026-05-06 对比原始存档 `/home/aseit/桌面/cloud/knowledge-graph` 后确认，旧项目正确交互依赖“store/view 绝对坐标 + ReactFlow 相对投影 + Domain 移动平移所有后代 + 边界级联”的契约。当前渲染真相源已经变成 `OntologyDocumentState`，但部分交互仍只完整写入旧 graph store，导致节点回弹和子节点跑出 Domain。

用户视角产品验收标准见 `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md`。技术契约见 `NODE_DOMAIN_INTERACTION_CONTRACT_2026-05-06.zh-CN.md`。交互性能与 Dify/React Flow/tldraw 参考经验见 `CANVAS_INTERACTION_PERFORMANCE_RESEARCH_2026-05-06.zh-CN.md`。后续阶段顺序、执行门禁、任务拆分和验收顺序见 `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md`。

Phase 3E 开发前必读门禁：

| 状态 | 规则 | 记录位置 |
|------|------|----------|
| TODO | 代码开发前阅读产品规格、技术契约、性能研究和 Phase 3E 执行计划的对应章节 | `ITERATION_LOG.md` |
| TODO | 在开工记录中写明本轮不变量、禁止事项和验收命令 | `ITERATION_LOG.md` |
| TODO | 如果本轮实现触碰节点/Domain/拖拽/LOD/布局/legacy store，必须先确认属于 3E-A、3E-B 还是 3E-C | `ITERATION_LOG.md` |
| TODO | 每完成一个新主线能力，检查并删除或隔离对应旧实现 | 本 todo + `CODEBASE.md` |

| 状态 | 任务 | 目标文件/目录 |
|------|------|---------------|
| TODO | 新增本体 view 交互纯 model，承接 ReactFlow 相对坐标转绝对坐标、节点约束、Domain 边界级联、Domain 后代 offset | `frontend/features/ontology-canvas/model/interactions/domainNesting.ts` |
| TODO | 拖拽事件链路改为“拖拽中视觉态、拖拽结束批量提交本体 patch”，禁止拖拽中保存、布局、全图边重算 | `GraphPageContent.tsx`、`ontologyDocumentStore.ts` |
| TODO | 为 Domain 移动写测试：移动父 Domain 时所有后代 node/domain view 绝对坐标一起平移 | `frontend/scripts/test-domain-nesting-interactions.mjs` |
| TODO | 为节点拖拽写测试：提交本体 view 的是约束后的最终坐标，不是 ReactFlow 原始位置 | 同上 |
| TODO | 为边界级联写测试：节点移动/resize 触发 Domain view position/width/height 更新，并向祖先递归 | 同上 |
| TODO | `GraphPageContent` 拖拽停止优先调用本体交互事务；旧 graph store 只接收从本体文档投影出的 display cache | `frontend/components/graph/core/GraphPageContent.tsx`、`canvasSync.ts` |
| TODO | 静态扫描旧 graph store 不再承担拖拽最终坐标/边界真相源 | `rg` 验证 |
| TODO | 验证 ReactFlow adapter 仍保持 parentId/extent/expandParent 和相对坐标投影 | `test-react-flow-adapter` |

Phase 3E-A 验收：

- Domain 内节点不会出现在 Domain 外部。
- 移动节点后不会因点击/选中/重新投影回弹。
- 移动 Domain 时内部节点和子 Domain 跟随移动。
- Domain 边界扩展结果保存在 `OntologyViewState.domainViews`。
- 所有验证命令通过：`npm run check:phase2`、`npm run lint`、`npm run build`、`git diff --check`。

### Phase 3E-B：节点 UI 产品化与配置化

新增原因：用户明确要求本体节点不应只是旧卡片，节点本身要能显示和新增属性；节点 UI、节点交互逻辑、右侧编辑栏和样式配置必须隔离，避免后续调 UI 时破坏交互。

| 状态 | 任务 | 目标文件/目录 |
|------|------|---------------|
| TODO | 新增节点 UI 配置/token，集中管理节点宽高、标题高度、属性行高、字号、间距、圆角、LOD 阈值 | `frontend/features/ontology-canvas/config/*` |
| TODO | 新建纯展示 `ClassNodeView`，展示本体标题、类型、属性列表、属性数量、状态，并消费 tokens | `features/ontology-canvas/ui/ClassNodeView.tsx` |
| TODO | 新建纯展示 `DomainNodeView`，展示 Domain 标题、折叠摘要、节点数量、关系数量，并消费 tokens | `features/ontology-canvas/ui/DomainNodeView.tsx` |
| TODO | 节点上新增属性入口，只触发事件，不直接写 store；实际保存走 model/command | `ClassNodeView`、`blocks`、`model/inspector` |
| TODO | 属性分区折叠状态进入本体 view 或节点 UI view state，支持保存和 LOD 降级 | `model/document`、`ui` |
| TODO | LOD 不只传 data 标记，节点 UI 在 compact/outline/dot 模式真实减少属性行、按钮、输入控件 DOM | `ui`、`config/lodConfig.ts` |
| TODO | 右侧编辑栏和节点快速编辑状态一致，互不覆盖 | `NodeInspectorBlock`、`model/inspector` |
| TODO | 旧 `NoteNode/GroupNode` 退场或降为 legacy adapter 内部兼容，不再作为产品 UI 主体 | `components/graph/nodes/*` |

Phase 3E-B 验收：

- 节点上能看到本体类型和关键属性。
- 节点上能发起新增属性。
- 属性多时可以折叠，不撑爆画布。
- 改节点尺寸、间距、字号只改 config/token。
- 改节点 UI 不影响 Domain 拖拽、嵌套、边界更新。
- 缩放远景时节点 UI 真实降 DOM，而不是只在 data 里写 LOD。

### Phase 3E-C：旧 graph store 继续退场

| 状态 | 任务 | 目标文件/目录 |
|------|------|---------------|
| TODO | 清理主拖拽、resize、创建、删除、显示投影路径中旧 graph store 作为最终真相源的残留 | `GraphPageContent.tsx`、`canvasSync.ts`、stores bridge |
| TODO | 静态扫描并登记 layout/history/edge optimizer 仍读取旧 `Node|Group|Edge` 的调用点，形成 Phase 5 迁移清单 | `CODEBASE.md`、`ITERATION_LOG.md` |
| TODO | 明确 `Canvas.graphData` 仍只是短期 display cache，不在 Phase 3E-C 删除 schema | workspace models / canvasSync |
| TODO | 确认默认 workspace 和新增主路径只依赖 `ontologyDocument` 真相源 | workspace seed / repository |

## 后续阶段总门禁

详细总计划见 `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md`。从后续任意阶段起，不能只依据本 todo 的粗略任务直接开工，必须先按路线图完成开工声明。

| 状态 | 阶段 | 门禁 |
|------|------|------|
| TODO | Phase 4 | 开工前阅读 UI/LOD/节点产品化相关必读文档，并确认 Phase 3E-A/B 出口标准已满足 |
| TODO | Phase 5 | 开工前阅读算法/布局相关必读文档，并在 `ITERATION_LOG.md` 记录本轮不变量、禁止事项、验收命令 |
| TODO | Phase 6 | 开工前阅读 workspace/subgraph/repository 相关必读文档，并确认 data-layer 仍是唯一出口 |
| TODO | Phase 7 | 开工前完成静态扫描计划，列出要删除的 legacy 文件和保留原因 |
| TODO | Phase 8 | 开工前完成本体导入/导出契约设计，不恢复 Mermaid 临时导入主线 |

### Phase 4：UI feature 化与旧 UI 退场

| 状态 | 任务 | 目标文件/目录 |
|------|------|---------------|
| TODO | `GraphPageContent` 拆成 `OntologyCanvasBlock/CanvasToolbarBlock/NodeInspectorBlock` 接线层 | `features/ontology-canvas/blocks/*` |
| TODO | `ClassNodeView/DomainNodeView/SemanticEdgeView` 保持纯展示，只收 props/events/tokens | `features/ontology-canvas/ui/*` |
| TODO | 节点尺寸、属性行高、字号、间距、圆角、LOD 阈值进入 config/token | `features/ontology-canvas/config/*` |
| TODO | full/compact/outline/dot LOD 真实减少 DOM | `features/ontology-canvas/ui/*` |
| TODO | 旧 `NoteNode/GroupNode` 和旧 editors 退出产品 UI 主体或迁入 feature | `components/graph/*` |

Phase 4 验收：

- 改 UI 不影响交互 model。
- UI 组件不直接 import store/fetch。
- UI token 和算法 config 分离。
- LOD 降 DOM 可验证。

### Phase 5：算法层 DTO、任务化与历史

| 状态 | 任务 | 目标文件/目录 |
|------|------|---------------|
| TODO | 新增 `LayoutGraphDTO/LayoutNodeDTO/LayoutEdgeDTO`，由本体文档生成布局输入 | layout adapter / `core/algorithms` |
| TODO | `ELKGraphConverter` 和 `LayoutManager` 改为只消费 Layout DTO | `frontend/services/layout/*` |
| TODO | layout job 引入 job id、document revision、cancel、timeout、duration、warnings | layout manager / worker |
| TODO | 大图布局进入 Web Worker 或 async job，结果应用前校验 revision | layout worker |
| TODO | `EdgeOptimizer` 输入中立 DTO，输出 edge view patch 或 handle patch | edge optimizer adapter |
| TODO | history 从全量旧 graph snapshot 改为 command/patch history | history model |

Phase 5 验收：

- layout/history/edge optimizer 不再依赖旧 `Node|Group|Edge` 作为真相输入。
- 布局输出是本体 view patch。
- 大图布局不阻塞拖拽。
- 拖拽中不触发布局或全图边优化。

### Phase 6：Workspace、Subgraph 与 Repository

| 状态 | 任务 | 目标文件/目录 |
|------|------|---------------|
| TODO | 节点可链接子图，支持进入/返回/breadcrumb | workspace/subgraph feature |
| TODO | workspace 和 ontology canvas schema version/migrations 完整化 | workspace models / migrations |
| TODO | 保持 `workspaceRepository.loadOntologyCanvas/saveOntologyCanvas` 唯一前端调用面 | `data-layer/workspace` |
| TODO | PostgreSQL adapter 第一版保存完整 JSONB 文档 | backend/data-layer adapter |
| TODO | 子图链接、当前子图、子图视口、子图层级可保存 | workspace persistence |

Phase 6 验收：

- 子图导航可用。
- JSON/PG adapter 可替换。
- UI/store 不直接 fetch workspace API。
- workspace schema migration 有测试。

### Phase 7：Legacy 清理

| 状态 | 任务 | 目标文件/目录 |
|------|------|---------------|
| TODO | 删除 `Canvas.graphData` 和默认 workspace display cache | workspace models / default JSON |
| TODO | 删除 `page.legacy.tsx` 和不再使用的旧 graph components/hooks/store | frontend old paths |
| DONE | 旧修复说明和过时架构/审查/验证快照已归档，活跃文档入口改为 `ACTIVE_DOCS.zh-CN.md` | `_archive/2026-05-07-superseded-docs/` |
| TODO | 明确 npm 或 pnpm，删除另一套 lockfile | package manager |
| TODO | 架构边界脚本升级为更完整 import boundary | `frontend/scripts/check-architecture-boundaries.mjs` |

Phase 7 验收：

- 主路径无旧 graph 真相源。
- 默认 workspace 只有本体文档。
- 文档、脚本、依赖清晰。
- `npm run lint/build/check` 通过。

### Phase 8：本体导入、导出与推理准备

| 状态 | 任务 | 目标文件/目录 |
|------|------|---------------|
| TODO | 设计 `OntologyImportDraft` 和 parser/validation/apply 契约 | ontology import feature |
| TODO | 优先支持项目自定义本体 JSON schema，不恢复 Mermaid 主线 | import parser |
| TODO | 设计 RDF/OWL/Turtle 导出 draft | export model |
| TODO | 增强 domain/range、关系类型、字段类型校验 | ontology validation |

Phase 8 验收：

- 导入只输出 draft。
- apply 只走 command。
- 导出只读 OntologyGraph。
- 不在 UI 层拼 RDF/OWL。

### 后续 PostgreSQL Adapter 原则

- 第一版 PG 不急着拆表，建议 `ontology_canvas_documents.document JSONB` 保存完整本体文档。
- 需要搜索、统计、权限、协作或审计后，再拆 `ontology_nodes/ontology_edges/ontology_domains` 等索引表。
- 前端不感知 PG；接口保持 `loadOntologyCanvas/saveOntologyCanvas`。

## 暂缓任务

- 删除 `pnpm-lock.yaml`：暂缓，避免在第一批修复里做包管理器破坏性选择。
- 大规模目录迁移：暂缓，等 Phase 0 正确性稳定后再做。
- ReactFlow adapter 重构：nodes/edges projection 边界、LOD 标记和 viewport culling 已完成；collapse projection、adapter cache、节点 UI LOD 降级继续暂缓到下一批。
- 算法 DTO 重构：继续暂缓到后续阶段；当前只完成 ELK option 最小类型和运行时懒加载，尚未建立中立 `LayoutGraph` DTO。
- 导入协议重建：暂缓；当前只保留“OntologyImportDraft / schema / DSL 待设计”的架构边界，不实现具体导入语言。
- command history 替换：暂缓到 Phase 3B 主链路切到 `OntologyGraph` 后，再基于本体 command 做 patch/history。
- 编辑器 UI/blocks 大迁移：暂缓；model helper 已迁到 `features/ontology-canvas/model`，后续再迁纯 UI 和 blocks 接线层。
