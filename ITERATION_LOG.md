# ITERATION_LOG

## [第1轮] 2026-04-28

### A. 本轮目标（阅读前声明）

**目标文件：**
- `README.md`（原因：项目根说明，确认整体定位、运行方式和技术栈）
- `frontend/package.json`（原因：前端依赖、脚本、框架版本）
- `frontend/tsconfig.json`（原因：路径别名、类型检查边界）
- `frontend/next.config.ts`（原因：Next.js 构建配置）
- `frontend/eslint.config.mjs`（原因：当前静态检查规则）
- `backend/requirements.txt`（原因：后端依赖）
- `Dockerfile.frontend` / `Dockerfile.backend` / `docker-compose.yml`（原因：运行容器与端口契约）

**本轮想弄清楚：**
- 项目的真实技术栈和运行入口是什么。
- 前后端是否都有可复用基础，还是需要优先削减旧代码。
- 当前代码库按文件清单看，哪些目录属于源码，哪些属于文档、测试或遗留脚本。

**初始覆盖进度表：**

| 文件 | 状态 | 阅读次数 | 备注 |
|------|------|----------|------|
| `Dockerfile.frontend` | PENDING | 0 | 容器构建入口，待确认前端运行方式 |
| `tsconfig.tsbuildinfo` | PENDING | 0 | TypeScript 构建缓存，待确认是否应从源码扫描中排除 |
| `Dockerfile.backend` | PENDING | 0 | 后端容器构建入口，待确认 Python 服务运行命令 |
| `docker-compose.yml` | PENDING | 0 | 编排配置，待确认服务、端口和依赖 |
| `README.md` | PENDING | 0 | 根项目说明，待确认项目定位 |
| `backend/test_mermaid_converter.py` | PENDING | 0 | 后端 Mermaid 转换测试，待精读 |
| `backend/services/graph/mermaid_converter.py` | PENDING | 0 | 后端 Mermaid 转换服务，待精读算法 |
| `backend/app.py` | PENDING | 0 | 后端应用入口，待确认路由注册 |
| `backend/requirements.txt` | PENDING | 0 | 后端依赖清单，待确认框架版本 |
| `backend/app_factory.py` | PENDING | 0 | 后端 app factory，待确认配置和扩展初始化 |
| `backend/run_server.py` | PENDING | 0 | 后端启动脚本，待确认端口 |
| `backend/extensions/__init__.py` | PENDING | 0 | 后端扩展聚合，待确认是否为空 |
| `backend/controllers/mermaid.py` | PENDING | 0 | 后端 Mermaid API 控制器，待精读数据流 |
| `项目文档/永久化存储表结构设计.md` | PENDING | 0 | 存储设计文档，待浅读 |
| `项目文档/Mermaid_研究报告.md` | PENDING | 0 | Mermaid 研究文档，待浅读 |
| `项目文档/项目本体结构.md` | PENDING | 0 | 旧项目本体说明，待浅读 |
| `项目文档/多画布功能开发计划表.md` | PENDING | 0 | 多画布计划文档，待浅读 |
| `项目文档/多画布管理统一实现方案V2.md` | PENDING | 0 | 多画布方案 V2，待浅读 |
| `项目文档/多画布知识图谱编辑器本体结构V2.md` | PENDING | 0 | 多画布本体结构 V2，待浅读 |
| `项目文档/多画布管理功能 - 统一实现方案.md` | PENDING | 0 | 多画布旧方案，待浅读 |
| `项目文档/Mermaid导入功能实现方案.md` | PENDING | 0 | Mermaid 导入方案，待浅读 |
| `backend/configs/app_config.py` | PENDING | 0 | 后端配置，待确认环境变量和默认值 |
| `项目文档/mermaid-examples/basic-parser.js` | PENDING | 0 | Mermaid 示例脚本，待确认是否遗留 |
| `项目文档/mermaid-examples/mermaid-parser-class.ts` | PENDING | 0 | Mermaid 示例解析类，待确认是否遗留 |
| `项目文档/mermaid-examples/test-examples.mmd` | PENDING | 0 | Mermaid 示例数据，待确认用途 |
| `项目文档/mermaid-examples/package.json` | PENDING | 0 | 示例目录依赖，待确认是否独立项目 |
| `项目文档/mermaid-examples/README.md` | PENDING | 0 | 示例目录说明，待浅读 |
| `frontend/services/layout/index.ts` | PENDING | 0 | 布局服务出口，待精读 |
| `frontend/services/layout/utils/index.ts` | PENDING | 0 | 布局工具出口，待确认导出边界 |
| `frontend/services/layout/utils/ELKConfigBuilder.ts` | PENDING | 0 | ELK 配置构建，待精读 |
| `frontend/services/layout/utils/NestingTreeBuilder.ts` | PENDING | 0 | 嵌套树构建，待精读算法 |
| `frontend/services/layout/utils/ELKGraphConverter.ts` | PENDING | 0 | ELK 图转换，待精读算法 |
| `frontend/services/layout/utils/GeometryUtils.ts` | PENDING | 0 | 几何工具，待精读 |
| `frontend/经验总结.md` | PENDING | 0 | 经验文档，待浅读 |
| `frontend/services/layout/types/layoutTypes.ts` | PENDING | 0 | 布局服务类型，待确认契约 |
| `frontend/新的经验.md` | PENDING | 0 | 经验文档，待浅读 |
| `frontend/package-lock.json` | PENDING | 0 | npm 锁文件，待判断是否应保留 |
| `frontend/push-to-github.ps1` | PENDING | 0 | 推送脚本，待确认是否遗留 |
| `frontend/test-mermaid.ts` | PENDING | 0 | Mermaid 测试脚本，待确认是否可运行 |
| `frontend/services/layout/LayoutManager.ts` | PENDING | 0 | 布局管理器，待精读 |
| `frontend/config/constants.ts` | PENDING | 0 | 前端常量，待确认 UI 配置集中度 |
| `frontend/config/elk.ts` | PENDING | 0 | ELK 配置聚合，待精读 |
| `frontend/config/README.md` | PENDING | 0 | 配置目录说明，待浅读 |
| `frontend/config/graph.config.ts` | PENDING | 0 | 图配置聚合，待确认硬编码替代点 |
| `frontend/config/elk-algorithm.ts` | PENDING | 0 | ELK 算法参数，待精读 |
| `frontend/config/layout.ts` | PENDING | 0 | 布局常量，待确认 UI/布局配置 |
| `frontend/test-mermaid-parser.ts` | PENDING | 0 | Mermaid parser 测试脚本，待确认 |
| `frontend/pnpm-lock.yaml` | PENDING | 0 | pnpm 锁文件，待判断包管理器冲突 |
| `frontend/package.json` | PENDING | 0 | 前端依赖脚本，待确认 |
| `frontend/services/storage/index.ts` | PENDING | 0 | 存储服务出口，待精读 |
| `frontend/hooks/index.ts` | PENDING | 0 | hooks 出口，待确认导出边界 |
| `frontend/hooks/useResizable.ts` | PENDING | 0 | 可调面板 hook，待精读 |
| `frontend/hooks/useMermaidImport.ts` | PENDING | 0 | Mermaid 导入 hook，待精读 |
| `frontend/postcss.config.mjs` | PENDING | 0 | PostCSS 配置，待确认 Tailwind 版本 |
| `frontend/debug-edge-arrows.js` | PENDING | 0 | 边箭头调试脚本，待确认是否废弃 |
| `frontend/修复说明.md` | PENDING | 0 | 修复说明，待浅读 |
| `frontend/lib/utils.ts` | PENDING | 0 | 通用工具，待精读 |
| `frontend/tsconfig.json` | PENDING | 0 | TS 配置，待确认 |
| `frontend/README.md` | PENDING | 0 | 前端说明，待浅读 |
| `frontend/services/storage/adapters/FileSystemAdapter.ts` | PENDING | 0 | 文件存储适配器，待精读 |
| `frontend/services/storage/StorageManager.ts` | PENDING | 0 | 存储管理器，待精读 |
| `frontend/eslint.config.mjs` | PENDING | 0 | ESLint 配置，待确认 |
| `frontend/components.json` | PENDING | 0 | shadcn/ui 配置，待确认 |
| `frontend/public/vercel.svg` | PENDING | 0 | 静态资源，待确认是否默认模板残留 |
| `frontend/utils/graph/test-utils.ts` | PENDING | 0 | 图测试工具，待确认是否仍可用 |
| `frontend/public/file.svg` | PENDING | 0 | 静态资源，待确认是否默认模板残留 |
| `frontend/public/window.svg` | PENDING | 0 | 静态资源，待确认是否默认模板残留 |
| `frontend/utils/graph/recursiveMoveHelpers.ts` | PENDING | 0 | 递归移动工具，待精读 |
| `frontend/public/next.svg` | PENDING | 0 | 静态资源，待确认是否默认模板残留 |
| `frontend/utils/graph/nestingHelpers.ts` | PENDING | 0 | 嵌套工具，待精读 |
| `frontend/app/layout.tsx` | PENDING | 0 | Next 根布局，待精读 |
| `frontend/app/page.tsx` | PENDING | 0 | Next 首页入口，待精读 |
| `frontend/public/workspace/kg-editor:workspace.json` | PENDING | 0 | 工作空间持久化数据，待确认格式 |
| `frontend/public/globe.svg` | PENDING | 0 | 静态资源，待确认是否默认模板残留 |
| `frontend/utils/workspace/canvasSync.ts` | PENDING | 0 | 画布同步工具，待精读数据流 |
| `frontend/utils/workspace/persistence.ts` | PENDING | 0 | 工作空间持久化工具，待精读 |
| `frontend/utils/validation.ts` | PENDING | 0 | 验证工具，待精读 |
| `frontend/经验补充.md` | PENDING | 0 | 经验文档，待浅读 |
| `frontend/services/mermaid/MermaidLayoutAdapter.ts` | PENDING | 0 | Mermaid 布局适配，待精读 |
| `frontend/services/mermaid/MermaidConverter.ts` | PENDING | 0 | Mermaid 转换器，待精读算法 |
| `frontend/快速修复指南.md` | PENDING | 0 | 快速修复文档，待浅读 |
| `frontend/services/mermaid/MermaidConverterService.ts` | PENDING | 0 | Mermaid 转换编排，待精读 |
| `frontend/next.config.ts` | PENDING | 0 | Next 配置，待确认 |
| `frontend/services/mermaid/MermaidParser.ts` | PENDING | 0 | Mermaid 解析器，待精读算法 |
| `frontend/services/mermaid/types.ts` | PENDING | 0 | Mermaid 类型，待确认契约 |
| `frontend/services/layout/algorithms/index.ts` | PENDING | 0 | 布局算法出口，待确认 |
| `frontend/services/layout/algorithms/EdgeOptimizer.ts` | PENDING | 0 | 边优化算法，待精读 |
| `frontend/components/ErrorBoundary.tsx` | PENDING | 0 | 错误边界，待审查 |
| `frontend/stores/graph/historySlice.ts` | PENDING | 0 | 历史切片，待精读 |
| `frontend/stores/graph/canvasViewSlice.ts` | PENDING | 0 | 视图切片，待精读 |
| `frontend/stores/graph/persistenceMiddleware.ts` | PENDING | 0 | 图持久化中间件，待精读 |
| `frontend/components/Providers.tsx` | PENDING | 0 | Provider 聚合，待确认 |
| `frontend/app/api/layout/route.ts` | PENDING | 0 | 布局 API 路由，待精读 |
| `frontend/stores/graph/nodes/index.ts` | PENDING | 0 | 节点切片聚合，待精读 |
| `frontend/stores/graph/nodes/groupBoundaryOperations.ts` | PENDING | 0 | group 边界操作，待精读算法 |
| `frontend/stores/graph/nodes/conversionOperations.ts` | PENDING | 0 | 节点/群组转换，待精读算法 |
| `frontend/stores/graph/nodes/basicOperations.ts` | PENDING | 0 | 基础节点操作，待精读 |
| `frontend/stores/graph/nodes/constraintOperations.ts` | PENDING | 0 | 约束操作，待精读 |
| `frontend/stores/graph/nodes/groupOperations.ts` | PENDING | 0 | 群组操作，待精读 |
| `frontend/stores/graph/nodes/types.ts` | PENDING | 0 | 节点操作类型，待确认契约 |
| `frontend/stores/graph/index.ts` | PENDING | 0 | 图 store 聚合，待精读 |
| `frontend/stores/graph/edgesSlice.ts` | PENDING | 0 | 边切片，待精读 |
| `frontend/test-api.js` | PENDING | 0 | API 测试脚本，待确认 |
| `frontend/tailwind.config.ts` | PENDING | 0 | Tailwind 配置，待确认 |
| `frontend/修复总结.md` | PENDING | 0 | 修复总结文档，待浅读 |
| `frontend/services/layout/strategies/index.ts` | PENDING | 0 | 布局策略出口，待确认 |
| `frontend/services/layout/strategies/ELKGroupLayoutStrategy.ts` | PENDING | 0 | ELK 分组布局策略，待精读算法 |
| `frontend/services/layout/strategies/ELKLayoutStrategy.ts` | PENDING | 0 | ELK 布局策略，待精读算法 |
| `frontend/stores/workspace/userSlice.ts` | PENDING | 0 | 用户工作区切片，待精读 |
| `frontend/types/workspace/storage.ts` | PENDING | 0 | 工作区存储类型，待确认契约 |
| `frontend/types/workspace/models.ts` | PENDING | 0 | 工作区模型，待确认契约 |
| `frontend/types/layout/algorithm.ts` | PENDING | 0 | 布局算法类型，待确认 |
| `frontend/types/layout/node.ts` | PENDING | 0 | 布局节点类型，待确认 |
| `frontend/stores/workspace/canvasSlice.ts` | PENDING | 0 | 画布工作区切片，待精读 |
| `frontend/stores/workspace/index.ts` | PENDING | 0 | 工作区 store 聚合，待精读 |
| `frontend/types/layout/index.ts` | PENDING | 0 | 布局类型出口，待确认 |
| `frontend/types/layout/strategy.ts` | PENDING | 0 | 布局策略类型，待确认 |
| `frontend/types/layout/edge.ts` | PENDING | 0 | 布局边类型，待确认 |
| `frontend/app/page.legacy.tsx` | PENDING | 0 | 旧首页入口，待判断保留价值 |
| `frontend/app/globals.css` | PENDING | 0 | 全局样式，待审查硬编码 |
| `frontend/push-to-github.bat` | PENDING | 0 | 推送脚本，待确认是否遗留 |
| `frontend/app/favicon.ico` | PENDING | 0 | favicon，待确认 |
| `frontend/components/ui/dialog.tsx` | PENDING | 0 | UI dialog primitive，待审查 |
| `frontend/components/ui/sonner.tsx` | PENDING | 0 | toast 组件，待审查 |
| `frontend/components/ui/label.tsx` | PENDING | 0 | label primitive，待审查 |
| `frontend/components/ui/select.tsx` | PENDING | 0 | select primitive，待审查 |
| `frontend/components/ui/context-menu.tsx` | PENDING | 0 | context menu primitive，待审查 |
| `frontend/components/ui/alert-dialog.tsx` | PENDING | 0 | alert dialog primitive，待审查 |
| `frontend/components/ui/card.tsx` | PENDING | 0 | card primitive，待审查 |
| `frontend/components/ui/input.tsx` | PENDING | 0 | input primitive，待审查 |
| `frontend/components/ui/button.tsx` | PENDING | 0 | button primitive，待审查 |
| `frontend/components/ui/loading-spinner.tsx` | PENDING | 0 | loading primitive，待审查 |
| `frontend/types/graph/models.ts` | PENDING | 0 | 图核心数据模型，待精读契约 |
| `frontend/app/api/workspace/load/route.ts` | PENDING | 0 | 工作区加载 API，待精读 |
| `frontend/components/ui/textarea.tsx` | PENDING | 0 | textarea primitive，待审查 |
| `frontend/app/api/workspace/save/route.ts` | PENDING | 0 | 工作区保存 API，待精读 |
| `frontend/components/graph/editors/index.ts` | PENDING | 0 | 编辑器出口，待确认 |
| `frontend/components/graph/editors/ContentEditor.tsx` | PENDING | 0 | 内容编辑器，待审查 |
| `frontend/components/graph/editors/StructuredAttributeEditor.tsx` | PENDING | 0 | 结构化属性编辑器，待审查 |
| `frontend/components/graph/editors/EdgeEditor.tsx` | PENDING | 0 | 边编辑器，待审查 |
| `frontend/components/graph/editors/NodeEditor.tsx` | PENDING | 0 | 节点编辑器，待审查 |
| `frontend/components/graph/GRAPH_COMPONENTS_RESTRUCTURE_PLAN.md` | PENDING | 0 | 图组件重构计划，待浅读 |
| `frontend/components/graph/edges/index.ts` | PENDING | 0 | 边组件出口，待确认 |
| `frontend/components/graph/edges/CrossGroupEdge.tsx` | PENDING | 0 | 跨组边组件，待审查 |
| `frontend/components/graph/edges/CustomEdge.tsx` | PENDING | 0 | 自定义边组件，待审查 |
| `frontend/components/graph/core/index.ts` | PENDING | 0 | graph core 出口，待确认 |
| `frontend/components/workspace/sidebar/CanvasContextMenu.tsx` | PENDING | 0 | 画布上下文菜单，待审查 |
| `frontend/components/workspace/sidebar/CanvasTreeItem.tsx` | PENDING | 0 | 画布树项，待审查 |
| `frontend/components/workspace/sidebar/ResizablePanel.tsx` | PENDING | 0 | 可调侧栏，待审查 |
| `frontend/components/workspace/sidebar/LeftSidebar.tsx` | PENDING | 0 | 左侧栏，待审查 |
| `frontend/components/workspace/sidebar/CanvasTree.tsx` | PENDING | 0 | 画布树，待审查 |
| `frontend/components/workspace/sidebar/CreateCanvasDialog.tsx` | PENDING | 0 | 创建画布弹窗，待审查 |
| `frontend/components/workspace/sidebar/RightSidebar.tsx` | PENDING | 0 | 右侧栏，待审查 |
| `frontend/components/workspace/sidebar/DeleteCanvasDialog.tsx` | PENDING | 0 | 删除画布弹窗，待审查 |
| `frontend/components/graph/nodes/NoteNode.tsx` | PENDING | 0 | 笔记节点组件，待审查 |
| `frontend/components/graph/nodes/index.ts` | PENDING | 0 | 节点组件出口，待确认 |
| `frontend/components/graph/nodes/BaseNode.tsx` | PENDING | 0 | 节点基础组件，待审查 |
| `frontend/components/graph/nodes/GroupNode.tsx` | PENDING | 0 | 组节点组件，待审查 |
| `frontend/components/graph/nodes/NoteNodeEdit.tsx` | PENDING | 0 | 笔记节点编辑组件，待审查 |
| `frontend/components/graph/test-exports.ts` | PENDING | 0 | 导出测试脚本，待确认 |
| `frontend/components/workspace/sidebar/RenameCanvasDialog.tsx` | PENDING | 0 | 重命名弹窗，待审查 |
| `frontend/components/workspace/WorkspaceLayout.tsx` | PENDING | 0 | 工作区布局，待审查 |
| `frontend/components/graph/core/GraphPageContent.tsx` | PENDING | 0 | 图画布主容器，待精读 |
| `frontend/components/graph/ui/SummaryView.tsx` | PENDING | 0 | 摘要视图，待审查 |
| `frontend/components/graph/ui/index.ts` | PENDING | 0 | graph UI 出口，待确认 |
| `frontend/components/graph/ui/Tag.tsx` | PENDING | 0 | 标签 UI，待审查 |
| `frontend/components/graph/ui/MarkdownRenderer.tsx` | PENDING | 0 | Markdown 渲染器，待审查 |
| `frontend/components/graph/ui/TagInput.tsx` | PENDING | 0 | 标签输入，待审查 |
| `frontend/components/graph/__tests__/history-control.test.tsx` | PENDING | 0 | 历史控件测试，待确认测试框架 |
| `frontend/components/graph/__tests__/node-editor.test.tsx` | PENDING | 0 | 节点编辑器测试，待确认 |
| `frontend/components/graph/__tests__/advanced-relation.test.tsx` | PENDING | 0 | 高级关系测试，待确认 |
| `frontend/components/graph/__tests__/content-editor.test.tsx` | PENDING | 0 | 内容编辑器测试，待确认 |
| `frontend/components/graph/core/utils/groupBoundaryManager.ts` | PENDING | 0 | group 边界管理，待精读 |
| `frontend/components/graph/core/utils/index.ts` | PENDING | 0 | core utils 出口，待确认 |
| `frontend/components/graph/core/utils/bindingStrategy.ts` | PENDING | 0 | 绑定策略，待精读 |
| `frontend/components/graph/core/utils/nodeUpdateHandler.ts` | PENDING | 0 | 节点更新处理，待精读 |
| `frontend/components/graph/core/utils/groupHandling.ts` | PENDING | 0 | group handling 工具，待精读 |
| `frontend/components/graph/core/utils/nodePositionConstraints.ts` | PENDING | 0 | 节点位置约束，待精读 |
| `frontend/components/graph/core/utils/groupMoveHandler.ts` | PENDING | 0 | group 移动处理，待精读 |
| `frontend/components/graph/core/nodeSyncUtils.ts` | PENDING | 0 | store 到 ReactFlow 同步，待精读 |
| `frontend/components/graph/import/MermaidFileUpload.tsx` | PENDING | 0 | Mermaid 文件上传，待审查 |
| `frontend/components/graph/core/hooks/useNodeHandling.ts` | PENDING | 0 | 节点操作 hook，待精读 |
| `frontend/components/graph/core/hooks/useKeyboardShortcuts.ts` | PENDING | 0 | 快捷键 hook，待精读 |
| `frontend/components/graph/import/MermaidImportDialog.tsx` | PENDING | 0 | Mermaid 导入弹窗，待审查 |
| `frontend/components/graph/import/MermaidTextInput.tsx` | PENDING | 0 | Mermaid 文本输入，待审查 |
| `frontend/components/graph/core/hooks/useEdgeHandling.ts` | PENDING | 0 | 边操作 hook，待精读 |
| `frontend/components/graph/core/hooks/useSelectionHandling.ts` | PENDING | 0 | 选择 hook，待精读 |
| `frontend/components/graph/core/hooks/useNodeExpansion.ts` | PENDING | 0 | 节点展开 hook，待精读 |
| `frontend/components/graph/core/hooks/index.ts` | PENDING | 0 | core hooks 出口，待确认 |
| `frontend/components/graph/core/hooks/useViewportControls.ts` | PENDING | 0 | 视图控制 hook，待精读 |
| `frontend/components/graph/controls/index.ts` | PENDING | 0 | 控件出口，待确认 |
| `frontend/components/graph/controls/LayoutControl.tsx` | PENDING | 0 | 布局控件，待审查和精读 |
| `frontend/components/graph/controls/Toolbar.tsx` | PENDING | 0 | 工具栏，待审查 |
| `frontend/components/graph/controls/HistoryControl.tsx` | PENDING | 0 | 历史控件，待审查 |
| `frontend/components/graph/controls/EdgeFilterControl.tsx` | PENDING | 0 | 边过滤控件，待审查 |
| `frontend/components/graph/controls/MermaidImportControl.tsx` | PENDING | 0 | Mermaid 导入控件，待审查 |
| `frontend/components/graph/controls/ZoomIndicator.tsx` | PENDING | 0 | 缩放指示器，待审查 |

### C. 本轮发现

**关键发现：**
- (verified) 根 README 将项目描述为 Next.js + Flask 前后端分离项目；前端默认端口 3000，后端默认端口 5001。
- (verified) `frontend/package.json` 使用 Next 16.0.1、React 19.2.0、ReactFlow 11.11.4、Zustand 5.0.8、ELK 0.11.0、Mermaid 11.12.2。
- (verified) 前端包管理存在混用信号：同时存在 `package-lock.json` 与 `pnpm-lock.yaml`，Dockerfile 使用 npm，README 又提示 pnpm/npm 两套历史写法。
- (verified) `docker-compose.yml` 指向 `./frontend/Dockerfile` 与 `./backend/Dockerfile`，但仓库实际文件是根目录 `Dockerfile.frontend` 和 `Dockerfile.backend`，容器编排当前不可直接按 README 成功构建。
- (verified) `tailwind.config.ts` 和 `components.json` 仍假设 `src/` 目录存在，但项目实际没有 `frontend/src`，源码在 `frontend/app`、`frontend/components` 等根级目录；这会导致样式扫描、shadcn 路径和真实结构不一致。
- (verified) `next.config.ts` 为空配置；目前没有显式处理 standalone 输出、跨域、图片域名或构建兼容策略。
- (verified) `backend/requirements.txt` 包含 Flask/SQLAlchemy/Celery/Redis/PostgreSQL 依赖，但第1轮尚未确认后端源码是否真的使用这些能力。

**修订的旧结论：**
- 原来可以按 README 认为 Docker Compose 已可用 → 现在确认 compose 的 Dockerfile 路径与实际仓库结构冲突，不能作为可信运行方式。

**新疑问：**
- 前端是以 App Router 根目录布局为准，还是曾从 `src/` 迁移后未清理配置？
- 后端声明了数据库、Redis、Celery，但是否只是模板残留？
- 多画布和本体画布能力到底落在当前哪些入口与 store 中？

**更新了 CODEBASE.md：**
- §1 项目概览骨架
- §2 目录结构图初稿
- §7 外部集成初步记录
- §9 初始风险登记

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `README.md` | PENDING | 浅读 | 1 | 确认项目定位、端口、前后端分离描述；尚未验证源码是否匹配说明 |
| `frontend/package.json` | PENDING | 浅读 | 1 | 确认 Next/React/ReactFlow/Zustand/ELK/Mermaid 版本和脚本；待结合源码确认实际使用 |
| `frontend/tsconfig.json` | PENDING | 浅读 | 1 | 确认严格模式、根级 `@/*` 别名和 `allowJs`；待评估 JS 遗留影响 |
| `frontend/next.config.ts` | PENDING | 浅读 | 1 | 确认为空配置，未配置构建或部署策略 |
| `frontend/eslint.config.mjs` | PENDING | 浅读 | 1 | 确认仅使用 Next core-web-vitals/typescript，尚未限制模块边界 |
| `frontend/postcss.config.mjs` | PENDING | 浅读 | 1 | 确认 Tailwind 4 PostCSS 插件 |
| `frontend/tailwind.config.ts` | PENDING | 浅读 | 1 | 发现 content 路径仍指向 `src/`，与实际目录冲突 |
| `frontend/components.json` | PENDING | 浅读 | 1 | 发现 shadcn 配置仍指向 `src/app/globals.css`，与实际目录冲突 |
| `backend/requirements.txt` | PENDING | 浅读 | 1 | 确认后端依赖集合，待判断是否模板残留 |
| `Dockerfile.frontend` | PENDING | 浅读 | 1 | 确认根目录前端 Dockerfile 使用 npm 和 Node 18 |
| `Dockerfile.backend` | PENDING | 浅读 | 1 | 确认根目录后端 Dockerfile 使用 Python 3.10 和 `run_server.py` |
| `docker-compose.yml` | PENDING | 浅读 | 1 | 发现 compose 构建路径与实际 Dockerfile 文件名不一致 |

**下一轮计划：**
- 阅读 `frontend/app/layout.tsx`、`frontend/app/page.tsx`、`frontend/components/Providers.tsx`、`frontend/components/workspace/WorkspaceLayout.tsx`、`frontend/components/graph/core/index.ts`、`frontend/types/graph/models.ts`、`frontend/types/workspace/models.ts`、`frontend/stores/graph/index.ts`，确认前端入口、Provider、核心模型和 store 聚合。

## [第2轮] 2026-04-28

### A. 本轮目标（阅读前声明）

**目标文件：**
- `frontend/app/layout.tsx`（原因：Next 根布局和全局 Provider 入口）
- `frontend/app/page.tsx`（原因：首页初始化工作区和加载画布数据）
- `frontend/components/Providers.tsx`（原因：ReactFlow Provider 边界）
- `frontend/components/workspace/WorkspaceLayout.tsx`（原因：工作区布局组合）
- `frontend/components/graph/core/index.ts`（原因：graph core 导出入口）
- `frontend/types/graph/models.ts`（原因：图核心数据契约）
- `frontend/types/workspace/models.ts`（原因：多画布/子图数据契约）
- `frontend/stores/graph/index.ts`（原因：graph store 聚合与持久化中间件）

**本轮想弄清楚：**
- 当前 UI 页面、工作区 store、graph store、ReactFlow Provider 的组合方式。
- 当前数据模型是否已接近 Ontology Canvas，还是仍是 Note/Group 通用图模型。
- store 是否已经拆分到足够松耦合，还是存在 UI 状态、图数据、持久化混杂的问题。

### C. 本轮发现

**关键发现：**
- (verified) `frontend/app/layout.tsx` 在根布局中包裹 `ErrorBoundary`、`ReactFlowProvider` 和 `Toaster`，ReactFlow Provider 是全应用级别，不是画布功能局部 Provider。
- (verified) `frontend/app/page.tsx` 是 client component，负责启动时 fetch `/api/workspace/load`、初始化 workspace store、动态导入 `canvasSync.loadCanvasData()` 并写入 graph store；页面层承担了数据加载、降级初始化、布局切换三类职责。
- (verified) `frontend/components/workspace/WorkspaceLayout.tsx` 是三栏布局：左侧画布树、中间 GraphPage、右侧编辑器/工具栏；布局中的尺寸、标题、颜色直接硬编码在 JSX className 中。
- (verified) `frontend/types/graph/models.ts` 当前核心模型只有 `BlockEnum.NODE` 与 `BlockEnum.GROUP`；`Node` 是 `title/content/attributes/tags/summary` 的通用笔记节点，不是本体类节点。
- (verified) `Edge` 当前用 `label`、`data.direction`、`data.customProperties` 表达关系信息；没有 relation type、predicate、domain/range、axiom 等一等字段。
- (verified) `Canvas` 支持 parent/children 层级和 `graphData.nodes/edges`，可以作为 Subgraph 导航底座，但当前与本体 Domain 概念没有明确关系。
- (verified) `useGraphStore` 将 nodes、edges、canvasView、history 和 persistence middleware 合并为一个 Zustand store；自动持久化开关复用 `NEXT_PUBLIC_USE_NEW_LAYOUT`，语义不清。

**修订的旧结论：**
- 原来可以把 Group 视为 Domain 雏形 → 现在确认 Group 只是视觉/嵌套容器，Domain 语义尚未建模，只能作为渲染基础复用。

**新疑问：**
- `GraphPageContent` 是否在同步 store 到 ReactFlow 时造成全量节点/边重建？
- `persistenceMiddleware` 是否订阅整个 graph store，导致 selection/viewport 等 UI 状态也触发保存？
- workspace store 的 canvas 切换和 graph store 的 replace/load 是否存在双写或竞态？

**更新了 CODEBASE.md：**
- §3 C4 Level 1/2/3 架构图初稿
- §4 已读入口/模型/store 文件详解
- §5 已读入口函数索引
- §6 工作区加载主链路初稿
- §8 图模型与工作区模型契约
- §9 增加模型层与 store 层风险

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/app/layout.tsx` | PENDING | 深度完整 | 1 | 完整读取根布局，确认 Provider 与错误边界包裹顺序 |
| `frontend/app/page.tsx` | PENDING | 深度完整 | 1 | 完整读取首页初始化流程，确认 fetch、默认降级和 legacy layout 分支 |
| `frontend/components/Providers.tsx` | PENDING | 深度完整 | 1 | 完整读取 Provider，确认仅包装 ReactFlowProvider |
| `frontend/components/workspace/WorkspaceLayout.tsx` | PENDING | 深度完整 | 1 | 完整读取三栏布局，确认 UI 尺寸/标题/颜色硬编码 |
| `frontend/components/graph/core/index.ts` | PENDING | 深度完整 | 1 | 完整读取 core 导出，确认默认导出 GraphPageContent 和 hooks |
| `frontend/types/graph/models.ts` | PENDING | (partial) | 1 | 完整读取模型定义，确认通用 Node/Group/Edge；待结合 store 操作确认约束是否一致 |
| `frontend/types/workspace/models.ts` | PENDING | (partial) | 1 | 完整读取 Canvas/Workspace schema，确认日期 coercion；待结合 API load/save 确认契约 |
| `frontend/stores/graph/index.ts` | PENDING | (partial) | 1 | 完整读取 store 聚合，确认 persistence middleware 与 slices 合并；待精读各 slice |

**下一轮计划：**
- 阅读 `frontend/components/graph/core/GraphPageContent.tsx`、`frontend/components/graph/core/nodeSyncUtils.ts`、`frontend/stores/graph/persistenceMiddleware.ts`、`frontend/utils/workspace/canvasSync.ts`，确认渲染同步、持久化和工作区切换的实际数据流。

## [第3轮] 2026-04-28

### A. 本轮目标（阅读前声明）

**目标文件：**
- `frontend/components/graph/core/GraphPageContent.tsx`（原因：ReactFlow 主容器，决定渲染/交互/状态同步方式）
- `frontend/components/graph/core/nodeSyncUtils.ts`（原因：store 节点转 ReactFlow 节点，影响性能和嵌套坐标）
- `frontend/stores/graph/persistenceMiddleware.ts`（原因：自动保存实现，影响状态耦合和频繁 I/O）
- `frontend/utils/workspace/canvasSync.ts`（原因：workspace store 与 graph store 的双向同步）

**本轮想弄清楚：**
- ReactFlow nodes/edges 是否每次由全量 store 转换生成。
- selection、drag、resize、edge edit 是否会触发自动保存和全局重渲染。
- 工作区切换时 graph store 和 workspace store 是否存在双写、重复保存或竞态。

### C. 本轮发现

**关键发现：**
- (verified) `GraphPageContent` 通过 `useGraphStore()` 一次性解构 nodes、edges、selection、actions 等多个字段，没有 selector；任意 graph store 更新都可能让主画布容器重渲染。
- (verified) store nodes 到 ReactFlow nodes 的同步在 `useEffect` 中全量执行：`syncStoreToReactFlowNodes(storeNodes, selectedNodeId)`，依赖 `storeNodes` 和 `selectedNodeId`；只改变选中节点也会重新映射全部节点。
- (verified) edges 同步也在 `useEffect` 中全量 filter/map，并且每条边用 `storeNodes.find()` 查 source/target；边数和节点数上升后会出现 O(E*N) 查找。
- (verified) `visibleEdgeIds.length === 0` 被解释为“全部边可见”；但 `edgesSlice.hideAllEdges()` 同样会设置空数组，存在隐藏全部边失效的逻辑风险。
- (verified) `persistenceMiddleware` 用 `store.subscribe(() => debouncedSave())` 订阅整个 graph store，selection、position、history、style 等任意变化都会触发 500ms 防抖保存。
- (verified) `saveCurrentCanvasData()` 读取 graph store，再调用 `workspaceStore.initializeWorkspace()` 替换整个 workspace；它还读取 `(graphStore as any).viewport`，但当前是否存在该字段待 `canvasViewSlice` 确认。
- (verified) `switchToCanvas()` 手动保存当前 canvas、切换 workspace 当前 ID、加载目标 canvas，再 POST `/api/workspace/save`；同时 `loadCanvasData()` 的 `useGraphStore.setState()` 也会触发 graph persistence middleware，存在重复保存。
- (verified) `nodeSyncUtils` 优化了 Map 查找和深度缓存，但仍然每次返回新的 ReactFlowNode 对象数组，且把 view style、data、selection 全部混合进转换结果。

**修订的旧结论：**
- 原来认为“性能问题主要来自节点 DOM 太复杂” → 现在确认还有更基础的全量订阅、全量映射、全量保存问题，DOM 只是最后一层表现。

**新疑问：**
- `canvasViewSlice` 是否真的维护 `viewport` 字段？如果字段名不一致，当前保存会永久写入 `{x:0,y:0,zoom:1}`。
- `edgesSlice` 的可见性语义是否和 EdgeFilterControl 一致？
- 节点 resize、group boundary 更新、history snapshot 是否还会放大 store 更新频率？

**更新了 CODEBASE.md：**
- §4 增加 GraphPageContent、nodeSyncUtils、persistenceMiddleware、canvasSync 模块详解
- §5 增加核心同步/保存函数算法
- §6 增加 ReactFlow 同步与 canvas 切换链路
- §9 增加渲染性能、自动保存和边可见性风险

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/components/graph/core/GraphPageContent.tsx` | PENDING | (partial) | 1 | 完整读取主画布容器，确认全量 store 订阅、全量 nodes/edges 映射；待结合 hooks/slices 完成调用链 |
| `frontend/components/graph/core/nodeSyncUtils.ts` | PENDING | 深度完整 | 1 | 完整读取坐标转换、嵌套排序和 ReactFlowNode 映射算法 |
| `frontend/stores/graph/persistenceMiddleware.ts` | PENDING | 深度完整 | 1 | 完整读取自动保存中间件，确认订阅整个 store 并 POST workspace |
| `frontend/utils/workspace/canvasSync.ts` | PENDING | (partial) | 1 | 完整读取 canvas 保存/加载/切换流程，确认重复保存和 viewport 字段疑点；待读 workspace/graph slices |

**下一轮计划：**
- 阅读 `frontend/stores/graph/edgesSlice.ts`、`frontend/stores/graph/canvasViewSlice.ts`、`frontend/stores/graph/historySlice.ts`、`frontend/stores/workspace/index.ts`、`frontend/stores/workspace/canvasSlice.ts`，确认边可见性、视口字段、历史记录和工作区切换实现。

## [第4轮] 2026-04-28

### A. 本轮目标（阅读前声明）

**目标文件：**
- `frontend/stores/graph/edgesSlice.ts`（原因：确认 visibleEdgeIds / hideAllEdges 语义）
- `frontend/stores/graph/canvasViewSlice.ts`（原因：确认 viewport 字段与 canvasSync 是否匹配）
- `frontend/stores/graph/historySlice.ts`（原因：确认 history 是否保存全量 nodes/edges）
- `frontend/stores/workspace/index.ts`（原因：确认 workspace store 聚合与持久化）
- `frontend/stores/workspace/canvasSlice.ts`（原因：确认 canvas CRUD、switchCanvas、initializeWorkspace）

**本轮想弄清楚：**
- `visibleEdgeIds=[]` 到底应表示“全部显示”还是“全部隐藏”。
- `canvasSync.saveCurrentCanvasData()` 读取的 `graphStore.viewport` 是否真实存在。
- history 和 workspace 是否使用全量对象快照，是否会加重大图内存和保存压力。

### C. 本轮发现

**关键发现：**
- (verified) `canvasViewSlice` 确实定义了 `viewport` 字段，因此 `canvasSync.saveCurrentCanvasData()` 读取 `(graphStore as any).viewport` 在运行时大概率可用，但类型层没有显式保护。
- (verified) `edgesSlice.hideAllEdges()` 将 `visibleEdgeIds` 设置为 `[]`；`GraphPageContent` 又把空数组解释为“全部可见”，P0 风险确认。
- (verified) `edgesSlice.showAllEdges()`、`hideAllEdges()`、`toggleEdgeVisibility()` 都会添加 history snapshot，这意味着纯 UI 过滤操作会污染撤销栈。
- (verified) `historySlice.addHistorySnapshot()` 保存 `{ nodes: [...nodes], edges: [...edges] }`，是数组浅拷贝，不是节点/边对象深拷贝；大图下内存压力高，且如果存在对象原地突变，历史会被污染。
- (verified) `workspace/canvasSlice.createCanvas()` 先复制 `state.canvases` 数组，再直接 `parentCanvas.children.push(newCanvas.id)` 修改父 Canvas 对象；这是 Zustand state 对象原地突变风险。
- (verified) `workspace/canvasSlice.switchCanvas()` 只设置 currentCanvasId，不加载 graph data；真实切换依赖外部 `canvasSync.switchToCanvas()`，store action 自身不完整。

**修订的旧结论：**
- 原来疑问是 viewport 字段可能不存在 → 现在确认字段存在，但类型用了 `any`，问题从“字段缺失”修订为“跨 store 契约未类型化”。

**新疑问：**
- 节点操作 slice 是否也存在浅拷贝、原地突变、全量 history snapshot 和过多 console 日志？
- Group boundary / conversion 操作是否是主要复杂度来源？

**更新了 CODEBASE.md：**
- §4 增加 edgesSlice、canvasViewSlice、historySlice、workspace store/canvas slice 详解
- §5 增加边可见性、history、canvas CRUD 算法
- §8 增加 graph view/history/workspace store 契约
- §9 增加 confirmed 风险

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/stores/graph/edgesSlice.ts` | PENDING | 深度完整 | 1 | 完整读取边 CRUD、过滤、可见性和 history 交互，确认 hideAllEdges 语义冲突 |
| `frontend/stores/graph/canvasViewSlice.ts` | PENDING | 深度完整 | 1 | 完整读取 viewport/canvasSize 状态，确认 viewport 字段存在 |
| `frontend/stores/graph/historySlice.ts` | PENDING | 深度完整 | 1 | 完整读取 undo/redo 快照逻辑，确认浅拷贝数组快照和 maxSize=50 |
| `frontend/stores/workspace/index.ts` | PENDING | 深度完整 | 1 | 完整读取 workspace store 聚合，确认仅 devtools，无独立持久化中间件 |
| `frontend/stores/workspace/canvasSlice.ts` | PENDING | 深度完整 | 1 | 完整读取 canvas CRUD，确认 createCanvas 原地 push 风险和 switchCanvas 不加载图数据 |

**下一轮计划：**
- 阅读 graph nodes slices：`basicOperations.ts`、`constraintOperations.ts`、`groupOperations.ts`、`groupBoundaryOperations.ts`、`conversionOperations.ts`、`nodes/index.ts`、`nodes/types.ts`，确认节点/组操作复杂度、状态突变、history 和边界更新策略。

## [第5轮] 2026-04-28

### A. 本轮目标（阅读前声明）

**目标文件：**
- `frontend/stores/graph/nodes/index.ts`（原因：节点 slice 聚合）
- `frontend/stores/graph/nodes/types.ts`（原因：节点操作契约和工具函数）
- `frontend/stores/graph/nodes/basicOperations.ts`（原因：基础节点 CRUD 和 update 行为）
- `frontend/stores/graph/nodes/constraintOperations.ts`（原因：拖拽位置和 group 移动）
- `frontend/stores/graph/nodes/groupOperations.ts`（原因：group CRUD 与嵌套操作）
- `frontend/stores/graph/nodes/groupBoundaryOperations.ts`（原因：group 边界自动扩张算法）
- `frontend/stores/graph/nodes/conversionOperations.ts`（原因：Node/Group 互转和隐藏边逻辑）

**本轮想弄清楚：**
- 节点操作是否有状态原地突变或全量更新。
- group 边界、递归移动和 conversion 是否混入了过多 UI/数据语义。
- 当前 Group 能否直接升级成 Domain，还是必须拆模型。

### C. 本轮发现

**关键发现：**
- (verified) `nodes/index.ts` 将 basic/group/constraint/boundary/conversion 全部混入一个 NodesSlice，操作边界按技术动作拆分，不按领域动作拆分。
- (verified) `basicOperations.updateNode()` 同时处理 title 验证、data 合并、position sanitize、style/width/height 同步、group boundary 自动计算、group 内位置约束和 history；职责过重。
- (verified) `groupOperations.updateGroup()` 在 `updates.nodeIds` 分支中，从 `state.nodes.map()` 的单个节点回调里返回 `updatedNodes` 整个数组，会导致 `nodes` 数组嵌套数组。这是确定性结构破坏风险。
- (verified) `basicOperations.deleteNode()` 只删除节点，不删除相关 edges；`groupOperations.deleteGroup()` 删除 group 和 descendants，也不删除相关 edges，会留下孤儿边。
- (verified) `groupOperations` 的 add/update/delete/addNodeToGroup/removeNodeFromGroup 没有统一添加 history snapshot；历史行为与 basicOperations/edgesSlice 不一致。
- (verified) `groupBoundaryOperations` 的缓存 key 只有 child node IDs，没有包含 child position/size；100ms 内同一组子节点位置变化时，可能复用过期边界。
- (verified) `conversionOperations` 通过 `_hiddenByConversion`、`_parentConvertedId` 这类 any 字段隐藏节点/边，本质是 UI 折叠/转换状态混入 graph data。
- (verified) `nestingHelpers.getAllDescendants()` 没有 cycle guard；如果数据已被破坏或循环校验被绕过，递归可能失控。

**修订的旧结论：**
- 原来还可以考虑“复用 Group 作为 Domain” → 现在确认 Group 操作层已有结构性 bug 和 UI/数据混杂，Domain 应该作为新领域模型建立，ReactFlow Group 只做渲染适配。

**新疑问：**
- 组件层是否也在节点组件内部直接读写整个 graph store，进一步加剧耦合？
- 布局服务是否依赖这些不稳定的 Group 结构？

**更新了 CODEBASE.md：**
- §4 增加 nodes slices 和 graph nesting utils 详解
- §5 增加 group update、boundary update、conversion、nesting 算法
- §9 增加 P0/P1 结构性风险

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/stores/graph/nodes/index.ts` | PENDING | 深度完整 | 1 | 完整读取节点 slice 聚合，确认技术动作混合为一个 NodesSlice |
| `frontend/stores/graph/nodes/types.ts` | PENDING | 深度完整 | 1 | 完整读取节点操作接口和边界约束工具，确认默认尺寸硬编码残留 |
| `frontend/stores/graph/nodes/basicOperations.ts` | PENDING | 深度完整 | 1 | 完整读取基础 CRUD，确认 updateNode 职责过重和 deleteNode 不清边 |
| `frontend/stores/graph/nodes/constraintOperations.ts` | PENDING | 深度完整 | 1 | 完整读取位置更新和 group 移动，确认递归移动依赖 nodeIds |
| `frontend/stores/graph/nodes/groupOperations.ts` | PENDING | 深度完整 | 1 | 完整读取 group CRUD，确认 updateGroup nodeIds 分支会破坏 nodes 结构 |
| `frontend/stores/graph/nodes/groupBoundaryOperations.ts` | PENDING | 深度完整 | 1 | 完整读取边界扩张算法，确认缓存 key 缺少位置/尺寸 |
| `frontend/stores/graph/nodes/conversionOperations.ts` | PENDING | 深度完整 | 1 | 完整读取 Node/Group 转换，确认隐藏状态通过 any 字段混入数据 |
| `frontend/utils/graph/recursiveMoveHelpers.ts` | PENDING | 深度完整 | 1 | 完整读取递归移动工具，确认移动所有 descendants 并写 updatedAt |
| `frontend/utils/graph/nestingHelpers.ts` | PENDING | 深度完整 | 1 | 完整读取嵌套深度/祖先/后代工具，确认递归函数缺少 cycle guard |

**下一轮计划：**
- 阅读节点/边组件和编辑器高风险文件：`BaseNode.tsx`、`NoteNode.tsx`、`GroupNode.tsx`、`CustomEdge.tsx`、`NodeEditor.tsx`、`EdgeEditor.tsx`，进入 frontend-code-reviewer 阶段前先掌握 UI 和 store 写入点。

## [第6轮] 2026-04-28

### A. 本轮目标（阅读前声明）

**目标文件：**
- `frontend/components/graph/nodes/BaseNode.tsx`（原因：所有节点 UI 基础和连接点）
- `frontend/components/graph/nodes/NoteNode.tsx`（原因：普通节点 UI、编辑、展开、store 写入）
- `frontend/components/graph/nodes/GroupNode.tsx`（原因：group UI、转换按钮、标题编辑）
- `frontend/components/graph/edges/CustomEdge.tsx`（原因：边渲染、标签编辑、自定义事件）
- `frontend/components/graph/editors/NodeEditor.tsx`（原因：右侧节点属性编辑器）
- `frontend/components/graph/editors/EdgeEditor.tsx`（原因：右侧边属性编辑器）

**本轮想弄清楚：**
- UI 组件是否直接读写全局 store，是否能拆成 container + pure view。
- 是否存在可访问性缺陷，如 icon button 无 aria-label、input 无 label。
- 是否存在渲染性能问题，如节点组件订阅整个 store、内联对象/函数过多。

### C. 本轮发现

**关键发现：**
- (verified) `NoteNode` 和 `GroupNode` 都直接 `useGraphStore()`，节点组件不是纯 UI；每个节点都有机会订阅整个 store。
- (verified) `EdgeEditor` 通过 `useEffect` 在 `formData` 变化时立即 `updateEdge()`，没有保存按钮或 debounce，会污染 history 和 persistence。
- (verified) `NodeEditor` 直接 `updateNode({ groupId })`，绕过 `addNodeToGroup/removeNodeFromGroup`，会造成 Node.groupId 和 Group.nodeIds 不一致。
- (verified) 多个 icon-only button 只提供 `title`，没有 `aria-label`。
- (verified) `CustomEdge` 为每条边注册 window 级 `edgeDoubleClick` listener，边越多 listener 越多。

**修订的旧结论：**
- 原来认为“UI 和功能未分离”主要集中在 GraphPageContent → 现在确认 Node/Group/Edge/Edit 组件也直接写 store，问题贯穿组件层。

**新疑问：**
- 当前 lint/build 是否已经能暴露未使用 imports、any、Hook dependency 等问题？
- 应该先修 bug，还是先建新架构目录后迁移？

**更新了 CODEBASE.md：**
- §9 已同步前端 review 关键风险。

**新增文档：**
- `FRONTEND_REVIEW.md`：前端审查报告，包含 Critical/Major/Minor findings 和具体位置。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/components/graph/nodes/BaseNode.tsx` | PENDING | 深度完整 | 1 | 完整读取 BaseNode，确认基础节点 UI 直接依赖 graph store 和尺寸硬编码 |
| `frontend/components/graph/nodes/NoteNode.tsx` | PENDING | 深度完整 | 1 | 完整读取 NoteNode，确认节点订阅 store、icon-only 按钮无 aria-label、尺寸硬编码 |
| `frontend/components/graph/nodes/GroupNode.tsx` | PENDING | 深度完整 | 1 | 完整读取 GroupNode，确认 render log、store 订阅、转换按钮可访问性问题 |
| `frontend/components/graph/edges/CustomEdge.tsx` | PENDING | 深度完整 | 1 | 完整读取 CustomEdge，确认 window event listener per edge 和 label input 无 aria-label |
| `frontend/components/graph/editors/NodeEditor.tsx` | PENDING | 深度完整 | 1 | 完整读取 NodeEditor，确认 groupId 直接写 node 导致 group membership 不一致 |
| `frontend/components/graph/editors/EdgeEditor.tsx` | PENDING | 深度完整 | 1 | 完整读取 EdgeEditor，确认 formData 每次变化立即 updateEdge |

**下一轮计划：**
- 使用 `frontend-architecture-designer`，基于 CODEBASE 和 FRONTEND_REVIEW 产出架构优化设计与分阶段重构计划。

## [第7轮] 2026-04-28

### A. 本轮目标（阅读前声明）

**目标文件：**
- `CODEBASE.md`（原因：聚合前6轮扫描结果）
- `FRONTEND_REVIEW.md`（原因：前端审查 findings）

**本轮想弄清楚：**
- 如何把扫描结果转成可执行的前端架构重构方案。
- 哪些问题必须先稳定修复，哪些可以进入模块迁移阶段。

### C. 本轮发现

**关键发现：**
- (inferred) 现有项目适合渐进式重构，不适合立即推倒重写；ReactFlow、workspace tree、layout services、Mermaid import 都有可复用价值。
- (verified) 已创建 `ARCHITECTURE_OPTIMIZATION_PLAN.md`，定义目标模块边界、目录结构、状态拆分、UI token、ReactFlow adapter 和分阶段计划。

**修订的旧结论：**
- 原来可能先从 UI 组件拆分开始 → 现在调整为先修数据一致性 bug，再建 ontology domain model 和 adapter。否则 UI 拆了，底层 graph 仍会产出坏数据。

**新疑问：**
- 后续落地时应选择 npm 还是 pnpm。
- 后端 Flask 部分是否保留，还是把 MVP 完全收敛在 Next API Routes 和本地 JSON。

**更新了 CODEBASE.md：**
- §2 增加本轮新增文档条目。

**新增文档：**
- `ARCHITECTURE_OPTIMIZATION_PLAN.md`：前端架构重构设计与优化计划。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `CODEBASE.md` | 新增 | 深度完整 | 1 | 本轮作为扫描结果聚合输入，用于架构设计 |
| `FRONTEND_REVIEW.md` | 新增 | 深度完整 | 1 | 本轮作为前端 findings 输入，用于架构设计 |
| `ARCHITECTURE_OPTIMIZATION_PLAN.md` | 新增 | 深度完整 | 1 | 本轮新建架构方案文档，包含目录、边界、状态拆分、token、阶段计划 |

**下一轮计划：**
- 运行验证命令：前端 lint/build 或至少 TypeScript/ESLint 检查；若发现现有语法错误，记录到交付结果。

## [第8轮] 2026-04-28

### A. 本轮目标（阅读前声明）

**目标文件/命令：**
- `npm run lint`（原因：验证当前前端静态检查状态）
- `npm run build`（原因：验证生产构建状态）
- `python -m py_compile ...`（原因：验证后端核心 Python 文件基础语法）

**本轮想弄清楚：**
- 当前项目是否存在立即阻断开发的语法/静态检查问题。
- 架构计划是否需要把 lint/build 修复列为 Phase 0。

### C. 本轮发现

**关键发现：**
- (verified) `npm run lint` 失败：159 errors、96 warnings、255 total problems。
- (verified) `npm run build` 成功：Next.js 16 production build passed。
- (verified) 后端核心 Python 文件 `py_compile` 成功，无基础语法错误。
- (verified) build 过程中 ELK 策略初始化会打印日志，说明服务初始化有构建期副作用。

**修订的旧结论：**
- 原来担心项目可能构建不过 → 现在确认生产 build 能过；当前主要红灯是 lint/质量门禁失败，而不是 Next 编译失败。

**新疑问：**
- 是否要先以 lint baseline 方式临时降噪，还是直接逐步修正 159 个 error。

**新增文档：**
- `VALIDATION_RESULTS.md`：记录 lint/build/py_compile 验证结果。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `VALIDATION_RESULTS.md` | 新增 | 深度完整 | 1 | 本轮新建验证结果文档，记录 lint/build/backend syntax 结果 |

**下一轮计划：**
- 结束本轮讨论型交付；后续若进入实现，先从 Phase 0 correctness fixes 开始。

## [SYNC] 2026-04-29

### A. 本轮目标（阅读前声明）

**目标文件：**
- `ARCHITECTURE_OPTIMIZATION_PLAN.md`（原因：作为中文版本的源文档）
- `ARCHITECTURE_OPTIMIZATION_PLAN.zh-CN.md`（原因：本轮新增中文架构设计文档）
- `CODEBASE.md`（原因：同步新增文档目录说明）

**本轮想弄清楚：**
- 中文版本是否完整覆盖英文架构计划的目标、模块边界、状态拆分、性能设计、重构阶段和 ADR。

### C. 本轮发现

**关键发现：**
- (verified) 已新增 `ARCHITECTURE_OPTIMIZATION_PLAN.zh-CN.md`，保留英文原稿不变。
- (verified) 已在 `CODEBASE.md` 目录结构图中补充中文架构设计文档条目。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `ARCHITECTURE_OPTIMIZATION_PLAN.zh-CN.md` | 新增 | 深度完整 | 1 | 中文架构方案文档，覆盖目标、边界、状态、adapter、性能和阶段计划 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 2 | 同步新增中文架构方案文件条目 |

**下一轮计划：**
- 若进入实现，按中文架构方案的 Phase 0 从 correctness fixes 和测试补齐开始。

## [第9轮] 2026-04-29

### A. 本轮目标（阅读前声明）

**目标文件/范围：**
- `FRONTEND_ARCHITECTURE_RULES.zh-CN.md`（原因：本轮新增的通用 + 项目级前端架构约束，后续重扫以它为评价基准）
- 项目文件清单（原因：重新确认当前代码库实际文件边界，避免遗漏算法模块和遗留文件）
- `README.md`、`frontend/package.json`、`frontend/tsconfig.json`、`frontend/components.json`、`frontend/tailwind.config.ts`、`docker-compose.yml`（原因：确认技术栈、路径别名、UI 配置和运行入口）

**本轮想弄清楚：**
- 新规则文件是否覆盖通用前端、Ontology Canvas、算法层、持久化和 legacy 隔离。
- 当前项目结构中哪些目录违反新分层边界，哪些模块必须在新版架构方案中优先处理。

### C. 本轮发现

**关键发现：**
- (verified) 已新增 `FRONTEND_ARCHITECTURE_RULES.zh-CN.md`，规则被拆成“通用前端 Rules”和“Ontology Canvas 项目级 Rules”两层。
- (verified) 当前项目仍是 `components/services/stores/types/utils` 横向分层，和新规则中的 feature pack、model/ui/blocks 强拆存在结构冲突。
- (verified) `frontend/components.json` 仍指向 `src/app/globals.css`，但实际项目没有 `frontend/src`；`frontend/tailwind.config.ts` 的 content 也仍指向 `src/*`。
- (verified) `docker-compose.yml` 指向 `frontend/Dockerfile` 和 `backend/Dockerfile`，实际存在的是根目录 `Dockerfile.frontend` 和 `Dockerfile.backend`。
- (verified) `package-lock.json` 和 `pnpm-lock.yaml` 并存，包管理器尚未统一。

**修订的旧结论：**
- 原方案把算法模块放到 `platform/layout-engine` 较粗略 → 新规则要求算法模块进一步独立为纯计算层，不直接依赖 UI 模型、store 或 fetch。

**更新了 CODEBASE.md：**
- §1 增加新规则文件和当前配置冲突摘要。
- §2 增加 `FRONTEND_ARCHITECTURE_RULES.zh-CN.md` 条目。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `FRONTEND_ARCHITECTURE_RULES.zh-CN.md` | 新增 | 深度完整 | 1 | 明确通用前端规则与 Ontology Canvas 项目规则，新增算法层、adapter、command、持久化白名单约束 |
| `README.md` | 深度完整 | 深度完整 | 2 | 确认项目定位仍声明为 Next.js + Flask 知识图谱编辑器 |
| `frontend/package.json` | 深度完整 | 深度完整 | 2 | 确认 Next 16/React 19/ReactFlow/Zustand/ELK/Mermaid 依赖和 npm scripts |
| `frontend/tsconfig.json` | 深度完整 | 深度完整 | 2 | 确认 `@/* -> ./*` 根级别名，尚无 feature 边界别名 |
| `frontend/components.json` | 深度完整 | 深度完整 | 2 | shadcn CSS 路径仍指向不存在的 `src/app/globals.css` |
| `frontend/tailwind.config.ts` | 深度完整 | 深度完整 | 2 | Tailwind content 仍指向不存在的 `src/*` |
| `docker-compose.yml` | 深度完整 | 深度完整 | 2 | Dockerfile 路径与实际根目录 Dockerfile 命名不一致 |

**下一轮计划：**
- 精读布局算法链路：`LayoutManager`、`ELKLayoutStrategy`、`EdgeOptimizer`，确认算法层对 UI 模型、配置、日志和副作用的依赖。

## [第10轮] 2026-04-29

### A. 本轮目标（阅读前声明）

**目标文件：**
- `frontend/services/layout/LayoutManager.ts`（原因：布局算法统一入口，决定策略选择、取消与配置）
- `frontend/services/layout/strategies/ELKLayoutStrategy.ts`（原因：核心 ELK 布局策略，含动态导入和布局执行）
- `frontend/services/layout/algorithms/EdgeOptimizer.ts`（原因：边连接点优化算法，属于渲染性能和边路由关键路径）

**本轮想弄清楚：**
- 布局算法是否符合 P6/P7/P8/P10：纯计算、不依赖 UI/store、只返回 patch、可取消可度量。
- 当前布局算法是否直接消费旧 `Node | Group | Edge` UI 混合模型，以及是否有渲染路径日志/全量计算问题。

### C. 本轮发现

**关键发现：**
- (verified) `LayoutManager.applyLayout()` 直接接收旧 `Node | Group | Edge`，说明布局算法层还没有独立 DTO，违反 P7。
- (verified) `LayoutManager.registerDefaultStrategies()` 构造时立即实例化 `ELKLayoutStrategy` 和 `ELKGroupLayoutStrategy`，并打印注册日志；`ELKLayoutStrategy` 构造时会触发 `initELK()` 动态导入。
- (verified) `LayoutManager.cancelCurrentOperation()` 只设置 `isOperationCancelled`，已经进入 `strategy.applyLayout()` 的 ELK 计算不会被真正中断。
- (verified) `ELKLayoutStrategy.applyLayout()` 只返回节点位置 `Map`，不直接改 store，这部分符合 P8 的“返回结果不直接改图”方向。
- (verified) `ELKLayoutStrategy.applyLayout()` 使用大量 `console.log/error`，布局执行细节会进入运行时控制台；未来应迁移到 `platform/logger` 并按 debug flag 控制。
- (verified) `EdgeOptimizer.optimizeBatch()` 有受影响节点增量入口，但超过阈值后回退为全量 `optimizeEdgeHandles(nodes, edges)`；仍直接返回扩展后的旧 `Edge`，不是中立 patch。

**修订的旧结论：**
- 原来以为算法层已经基本独立 → 现在确认只是文件位置上独立，类型和运行时行为仍和旧图模型、配置、日志耦合。

**更新了 CODEBASE.md：**
- §4/§5 增加布局入口、ELK 策略、边优化算法摘要。
- §9 增加算法层 DTO 缺失、取消语义不完整、日志副作用风险。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/services/layout/LayoutManager.ts` | PENDING | 深度完整 | 1 | 确认布局管理器注册 ELK 策略、选择策略、包装 duration，但取消只靠布尔标志，不能中断已开始的 ELK 运算 |
| `frontend/services/layout/strategies/ELKLayoutStrategy.ts` | PENDING | 深度完整 | 1 | 确认动态导入 elkjs、转换旧图模型为 ELK 图、返回位置 Map，日志较多且 config 校验为空实现 |
| `frontend/services/layout/algorithms/EdgeOptimizer.ts` | PENDING | 深度完整 | 1 | 确认边连接点算法按中心点角度选 handle，支持 affectedNodeIds 增量入口，但仍返回旧 Edge 扩展对象 |

**下一轮计划：**
- 精读 ELK 分组策略、ELK 图转换、ELK 配置构造器，确认 group/nesting 与布局配置的真实算法链路。

## [第11轮] 2026-04-29

### A. 本轮目标（阅读前声明）

**目标文件：**
- `frontend/services/layout/strategies/ELKGroupLayoutStrategy.ts`（原因：分组/嵌套布局策略，影响 Domain/Group 架构）
- `frontend/services/layout/utils/ELKGraphConverter.ts`（原因：旧图模型到 ELK DTO 的核心转换器）
- `frontend/services/layout/utils/ELKConfigBuilder.ts`（原因：算法配置来源和布局参数构造逻辑）

**本轮想弄清楚：**
- Group/Domain 嵌套布局到底如何建模，是旧视觉 group 还是未来可迁移到 Domain。
- ELK 转换器是否把 UI 状态、尺寸默认值、group parent/children 和 edge source/target 混在一起。
- 算法配置是否和 UI token/graph config 混用。

### C. 本轮发现

**关键发现：**
- (verified) `ELKGraphConverter.toELKGraph()` 以没有 `groupId` 的节点作为顶层节点，递归把 `Group` 子节点放进 ELK children；这是视觉 group 结构，不是独立 Domain 模型。
- (verified) `ELKGraphConverter.getDefaultWidth/Height()` 会读取 `isExpanded` 和 `customExpandedSize`，说明布局算法转换层依赖节点 UI 展开状态。
- (verified) `ELKGraphConverter.getGroupPadding()` 使用 `PADDING_CONFIG.GROUP_PADDING`，布局算法和 UI 标题栏/边距配置存在混用风险。
- (verified) `ELKGroupLayoutStrategy.applyLayout()` 要求 `options.groupId`，先找目标 group，再抽取后代子图并只布局该 group 内部。
- (verified) `ELKGroupLayoutStrategy.getDescendants()` 递归无 visited set，循环 groupId 会无限递归。
- (verified) `ELKGroupLayoutStrategy.extractSubgraph()` 用 `subgraphNodes.some()` 双重查找过滤边，复杂度约为 O(E*N)，大图 group 内布局成本会升高。
- (verified) `ELKConfigBuilder` 是纯配置构造器，不 import UI/store；但返回 `Record<string, any>`，无 schema 校验或具体配置类型。

**修订的旧结论：**
- 原来把 group layout 视作可直接迁移到 Domain collapse → 现在确认它依赖旧 `groupId`/视觉 padding/展开尺寸，必须先做 Domain/View adapter 才能迁移。

**更新了 CODEBASE.md：**
- §4/§5 增加 ELK 分组策略、ELK 转换器、配置构造器摘要。
- §9 增加 group 递归循环、subgraph 边过滤复杂度、布局配置 any 化风险。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/services/layout/strategies/ELKGroupLayoutStrategy.ts` | PENDING | 深度完整 | 1 | 确认按 `options.groupId` 抽取群组子图并转 ELK，递归后代无 visited，坐标提取有大量调试日志 |
| `frontend/services/layout/utils/ELKGraphConverter.ts` | PENDING | 深度完整 | 1 | 确认旧 Node/Group/Edge 到 ELK 图转换，读取 UI 展开状态和 group padding，返回位置+尺寸 Map |
| `frontend/services/layout/utils/ELKConfigBuilder.ts` | PENDING | 深度完整 | 1 | 确认 layered/force/stress/tree/radial/compact/spacious/debug 配置构造，缺具体类型和 schema 校验 |

**下一轮计划：**
- 精读嵌套树、几何工具、布局类型与配置，补齐算法基础设施链路。

## [第12轮] 2026-04-29

### A. 本轮目标（阅读前声明）

**目标文件：**
- `frontend/services/layout/utils/NestingTreeBuilder.ts`（原因：嵌套层级分析算法，关系到 group/domain 层级结构）
- `frontend/services/layout/utils/GeometryUtils.ts`（原因：节点矩形、边界、碰撞、坐标计算基础工具）
- `frontend/services/layout/types/layoutTypes.ts`、`frontend/config/layout.ts`、`frontend/config/elk-algorithm.ts`（原因：布局算法输入输出契约和配置来源）

**本轮想弄清楚：**
- 嵌套树是否有循环检测、缓存生命周期和 max depth 保护。
- 几何工具是否是纯函数，以及是否适合迁移到 core/algorithms。
- layout config 与 UI token 是否已经混用，未来应该如何拆成算法 config 与视觉 token。

### C. 本轮发现

**关键发现：**
- (verified) `NestingTreeBuilder.calculateDepth()` 有 visited set 和 `NESTING_CONFIG.ENABLE_CIRCULAR_CHECK`，比 `ELKGroupLayoutStrategy.getDescendants()` 更安全。
- (verified) `NestingTreeBuilder.buildTree()` 建立树结构时不剔除顶层列表中的子节点，返回的是所有 tree node 列表而不是只有 roots；调用方需要理解这一约定。
- (verified) `GeometryUtils` 多数是纯几何函数，但 `getBounds()` 直接依赖旧 `Node | Group` 并使用硬编码默认宽高 `350/280`。
- (verified) `layoutTypes.ts` 把 `LayoutNode = Node | Group`、`LayoutEdge = Edge`，说明所谓布局系统类型只是旧模型别名，并不是独立算法 DTO。
- (verified) `LayoutOptions` 含 `[key: string]: any` 和 `onProgress` 回调，配置契约过松，算法和 UI 进度回调存在耦合入口。
- (verified) `frontend/config/layout.ts` 从 `UI_DIMENSIONS` 派生 node size、group title height、z-index，说明布局算法配置和 UI token/视觉层级混用。
- (verified) `frontend/config/elk-algorithm.ts` 是相对纯的 ELK 参数配置，但 `common.debugMode` 默认为 true。

**修订的旧结论：**
- 原以为可以直接把 `services/layout` 移到 `platform/layout-engine` → 现在应先拆成 `core/algorithms/layout` 的纯算法 DTO、`features/ontology-canvas/adapters/layoutAdapter`、`features/ontology-canvas/config/viewTokens` 三部分。

**更新了 CODEBASE.md：**
- §4/§5 增加嵌套树、几何工具、布局契约与配置摘要。
- §9 增加 layout type 别名、配置混用和硬编码几何默认值风险。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/services/layout/utils/NestingTreeBuilder.ts` | PENDING | 深度完整 | 1 | 确认深度缓存、循环检测、max depth 限制和树构建两遍算法 |
| `frontend/services/layout/utils/GeometryUtils.ts` | PENDING | 深度完整 | 1 | 确认距离、AABB、中心点、包围盒、MTV 计算，`getBounds` 仍依赖旧模型和硬编码尺寸 |
| `frontend/services/layout/types/layoutTypes.ts` | PENDING | 深度完整 | 1 | 确认布局类型是旧 Node/Group/Edge 别名，`LayoutOptions` 开放 any |
| `frontend/config/layout.ts` | PENDING | 深度完整 | 1 | 确认算法配置、UI 尺寸、group title、z-index 混在同一配置模块 |
| `frontend/config/elk-algorithm.ts` | PENDING | 深度完整 | 1 | 确认 ELK layered/force/stress/tree/radial 参数，debugMode 默认 true |

**下一轮计划：**
- 精读 Mermaid 导入转换链路：Parser、Converter、ConverterService、LayoutAdapter，确认导入算法和 store/API/persistence 的耦合。

## [第13轮] 2026-04-29

### A. 本轮目标（阅读前声明）

**目标文件：**
- `frontend/services/mermaid/MermaidParser.ts`（原因：Mermaid 文本解析入口）
- `frontend/services/mermaid/MermaidConverter.ts`（原因：Mermaid parse result 到项目 Node/Group/Edge 的转换算法）
- `frontend/services/mermaid/MermaidConverterService.ts`（原因：导入 use case 编排，疑似混合 parse、store、layout、persistence）
- `frontend/services/mermaid/MermaidLayoutAdapter.ts`、`frontend/services/mermaid/types.ts`（原因：确认导入布局适配和数据契约）

**本轮想弄清楚：**
- Mermaid 导入是否违反 P6/P8/P12：算法是否直接写 store、切 canvas、保存后端。
- 转换器输出的是旧图模型还是可迁移的本体图模型。
- Mermaid 导入后布局如何接入，是否需要拆成 use case + command + data-layer。

### C. 本轮发现

**关键发现：**
- (verified) `MermaidParser.parse()` 先调用 `mermaid.parse()` 验证，再调用 `mermaid.render()`，但真正提取数据靠自写 `parseFromText()` 文本解析器。
- (verified) `MermaidParser.parse()` 生成 `svg` 但未使用，说明存在额外渲染开销；导入算法不应依赖 render 产物。
- (verified) `MermaidConverter.convert()` 输出旧项目 `Node[]/Group[]/Edge[]`，不是 OntologyGraph 或中立导入 DTO。
- (verified) `MermaidConverter.calculateCrossGroupInfo()` 对每条边 `allEntities.find()` 两次，复杂度约 O(E*(N+G))。
- (verified) `MermaidConverterService.convertAndImport()` 同时做 parse、convert、createCanvas、switchCanvas、写 graph store、创建 LayoutManager、应用布局结果、saveCurrentCanvasData、fetch `/api/workspace/save`。
- (verified) `MermaidConverterService` 直接 import `useGraphStore`、`useWorkspaceStore`、`saveCurrentCanvasData` 和 `fetch`，明显违反 P6/P12。
- (verified) `MermaidLayoutAdapter.applyLayout()` 调用 `layoutManager.applyLayout(..., { strategy: 'elk' })`，但 `LayoutManager` 默认注册策略 id 是 `elk-layout` 和 `elk-group-layout`；该 adapter 若被使用会触发未知策略失败并落入 fallback。

**修订的旧结论：**
- 原来认为 Mermaid import services 可迁移后保留 → 现在确认要拆成 parser/converter 纯算法、import use case、graph command、workspace data-layer 四段，不能整体搬迁。

**更新了 CODEBASE.md：**
- §4/§5 增加 Mermaid parser/converter/service/layout adapter/type 摘要。
- §6 增加 Mermaid 导入数据流链。
- §9 增加 Mermaid service 大对象耦合、render 开销、strategy id 不一致风险。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/services/mermaid/MermaidParser.ts` | PENDING | 深度完整 | 1 | 确认 Mermaid 语法验证 + render + 自写文本解析，支持节点/边/子图，存在未使用 render svg |
| `frontend/services/mermaid/MermaidConverter.ts` | PENDING | 深度完整 | 1 | 确认 parse result 转旧 Node/Group/Edge，生成 mmd_* id，填充 group.nodeIds 和 crossGroup data |
| `frontend/services/mermaid/MermaidConverterService.ts` | PENDING | 深度完整 | 1 | 确认导入大 service 混合 store、workspace、layout、persistence、fetch，是拆分重点 |
| `frontend/services/mermaid/MermaidLayoutAdapter.ts` | PENDING | 深度完整 | 1 | 确认布局适配器返回新节点对象，但使用 `strategy:'elk'` 与实际策略 id 不一致 |
| `frontend/services/mermaid/types.ts` | PENDING | 深度完整 | 1 | 确认 Mermaid 原始类型、ConversionResult 和 LayoutResult 仍绑定旧 graph 模型 |

**下一轮计划：**
- 精读 graph store 数据修改链路：nodes slice、edges slice、history、persistence，确认 command 层拆分的真实边界。

## [第14轮] 2026-04-29

### A. 本轮目标（阅读前声明）

**目标文件：**
- `frontend/stores/graph/index.ts`（原因：全局 graph store 聚合入口）
- `frontend/stores/graph/nodes/basicOperations.ts`、`groupOperations.ts`、`conversionOperations.ts`（原因：节点/group/转换修改核心逻辑）
- `frontend/stores/graph/edgesSlice.ts`、`historySlice.ts`、`persistenceMiddleware.ts`（原因：边、历史、持久化与 command 分层直接相关）

**本轮想弄清楚：**
- 当前图谱修改有哪些直接 store 写入口，哪些应改成 command。
- 已知数据一致性 bug 的精确位置和触发方式。
- history/persistence 是否能按新规则拆成 graph document、view state、selection/editing 多 store。

### C. 本轮发现

**关键发现：**
- (verified) `useGraphStore` 聚合 nodes、edges、canvasView、history，并用 `NEXT_PUBLIC_USE_NEW_LAYOUT !== 'false'` 控制自动持久化，布局开关和持久化开关语义耦合。
- (verified) `basicOperations` 同时维护 nodes、selectedNodeId、selectedEdgeId、isLayoutMode，selection 属于高频 UI 状态但在 graph store 内。
- (verified) `deleteNode()` 只过滤 nodes，不删除 incident edges。
- (verified) `groupOperations.updateGroup()` 的 `updates.nodeIds` 分支在 `map()` 回调里返回整个 `updatedNodes` 数组，是 confirmed P0 bug。
- (verified) `deleteGroup()` 删除 group 和 descendants，但不删除相关 edges。
- (verified) `conversionOperations` 把 `_hiddenByConversion`、`_parentConvertedId`、`savedChildren`、`savedEdges` 等 UI/恢复状态写入节点/边数据。
- (verified) `edgesSlice` 用 `visibleEdgeIds: string[]` 同时表达 all/custom/none，`hideAllEdges()` 设置 `[]`，和渲染层空数组表示 all 的约定冲突。
- (verified) `historySlice` 保存浅拷贝全量 nodes/edges，无法表达 command 语义，也会被 UI 过滤类操作污染。
- (verified) `persistenceMiddleware` 订阅整个 graph store，任意 selection、layoutMode、position、history 变化都可能触发保存。

**修订的旧结论：**
- 原方案说“拆四个 store”仍不够具体 → 现在确认必须以 command 层为中心重写写入口：graph document command、view command、selection/editing action 必须分开。

**更新了 CODEBASE.md：**
- §4/§5 已覆盖 graph store、节点/边/history/persistence 核心操作。
- §9 补充的风险继续作为 Phase 0 修复依据。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/stores/graph/index.ts` | 深度完整 | 深度完整 | 2 | 确认大 graph store 聚合所有 slice，持久化开关复用布局环境变量 |
| `frontend/stores/graph/nodes/basicOperations.ts` | PENDING | 深度完整 | 1 | 确认 add/update/delete 节点逻辑，selection 和 layoutMode 混入 graph store，delete 不清 incident edges |
| `frontend/stores/graph/nodes/groupOperations.ts` | PENDING | 深度完整 | 1 | 确认 updateGroup nested array P0 bug、deleteGroup 不清 edges、membership 双写逻辑 |
| `frontend/stores/graph/nodes/conversionOperations.ts` | PENDING | 深度完整 | 1 | 确认 Node/Group 转换通过隐藏字段污染节点/边数据，属于 view state 混入 domain graph |
| `frontend/stores/graph/edgesSlice.ts` | 深度完整 | 深度完整 | 2 | 确认 visibleEdgeIds 契约冲突，边 CRUD/visibility 都会写 history |
| `frontend/stores/graph/historySlice.ts` | 深度完整 | 深度完整 | 2 | 确认全量浅快照 history，maxSize 50，undo/redo 替换 nodes/edges |
| `frontend/stores/graph/persistenceMiddleware.ts` | 深度完整 | 深度完整 | 2 | 确认订阅整个 store 并 POST `/api/workspace/save`，不做白名单筛选 |

**下一轮计划：**
- 精读 ReactFlow 渲染主链：`GraphPageContent`、`nodeSyncUtils`、关键 hooks 和节点/边视图，确认 adapter 拆分方案。

## [第15轮] 2026-04-29

### A. 本轮目标（阅读前声明）

**目标文件：**
- `frontend/components/graph/core/GraphPageContent.tsx`（原因：画布主容器，连接 store、ReactFlow、hooks、adapter 缺失点）
- `frontend/components/graph/core/nodeSyncUtils.ts`（原因：当前实际的 store -> ReactFlow nodes 转换器）
- `frontend/components/graph/core/hooks/useNodeHandling.ts`、`useEdgeHandling.ts`、`useSelectionHandling.ts`、`useViewportControls.ts`（原因：交互事件如何写 store）
- `frontend/components/graph/nodes/NoteNode.tsx`、`GroupNode.tsx`、`frontend/components/graph/edges/CustomEdge.tsx`（原因：UI 组件是否直接读写 store、是否能拆成纯 view）

**本轮想弄清楚：**
- ReactFlow adapter 现在分散在哪些文件。
- 哪些 UI 组件直接订阅/写入 graph store。
- selection、edge filtering、LOD/viewport culling 缺失点在哪里。

### C. 本轮发现

**关键发现：**
- (verified) `GraphPageContent` 直接 `useGraphStore()` 无 selector，解构 nodes/edges/visibleEdgeIds/actions/selection/group move/boundary，订阅范围过大。
- (verified) 当前 ReactFlow adapter 分散在 `nodeSyncUtils.syncStoreToReactFlowNodes()` 和 `GraphPageContent` 的 edge sync effect 中；没有统一 adapter 模块和缓存。
- (verified) edge sync 对每条边都用 `storeNodes.find()` 查 source/target，存在 O(E*N)。
- (verified) `visibleEdgeIds.length === 0 || visibleEdgeIds.includes(edge.id)` 导致空数组表示全部可见，与 `hideAllEdges()` 冲突。
- (verified) `GraphPageContent` 维护拖拽 ref，拖拽中跳过节点同步，但没有暂停 persistence；拖拽结束后写 store 并触发边优化。
- (verified) `onEdgesChange/onNodesChange` 在 requestAnimationFrame 中直接调用 `deleteEdge/deleteNode/updateNode/updateGroupBoundary`。
- (verified) `NoteNode` 和 `GroupNode` 直接 `useGraphStore()`，读取 `getNodeById/updateNode/convertNodeToGroup/convertGroupToNode`，不是纯展示组件。
- (verified) `CustomEdge` 直接 `useGraphStore().updateEdge()`，每条边注册一个 `window` 事件监听以响应双击编辑。
- (verified) 多处 UI 尺寸和颜色硬编码仍在组件中：NoteNode 300/240/350/280/600/450，CustomEdge marker 20、label font/padding/color，GroupNode 颜色和 minWidth/minHeight。

**修订的旧结论：**
- 原来“把 nodeSyncUtils 移到 adapter”不够 → 现在应把 nodes projection、edges projection、selection projection、LOD、visible mode、edge handle optimization 都放入 `features/ontology-canvas/adapters/react-flow`。

**更新了 CODEBASE.md：**
- §4/§5 已覆盖 GraphPageContent、nodeSyncUtils、核心节点/边视图。
- §9 中的 re-render、edge sync、window listener、硬编码 token 风险继续保留为新版方案依据。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/components/graph/core/GraphPageContent.tsx` | 深度完整 | 深度完整 | 2 | 确认主容器订阅整个 graph store，节点/边 adapter 分散，拖拽/resize/delete 直接写 store |
| `frontend/components/graph/core/nodeSyncUtils.ts` | 深度完整 | 深度完整 | 2 | 确认 store nodes 到 ReactFlow nodes 的转换、相对坐标、排序、隐藏字段过滤，缺循环检测和缓存 |
| `frontend/components/graph/core/hooks/useNodeHandling.ts` | PENDING | 深度完整 | 1 | 确认创建节点/group 逻辑混合 UI 位置计算、尺寸硬编码、store 写入和 group membership |
| `frontend/components/graph/core/hooks/useEdgeHandling.ts` | PENDING | 深度完整 | 1 | 确认连线校验、跨组判断、边样式生成和 addEdge 写入都在 hook 内 |
| `frontend/components/graph/core/hooks/useSelectionHandling.ts` | PENDING | 深度完整 | 1 | 确认 selection hook 直接写 graph store，目前 GraphPageContent 未复用该 hook |
| `frontend/components/graph/core/hooks/useViewportControls.ts` | PENDING | 深度完整 | 1 | 确认清空画布逐个 deleteNode/deleteEdge，可能触发大量 history/persistence |
| `frontend/components/graph/nodes/NoteNode.tsx` | PENDING | 深度完整 | 1 | 确认节点视图直接读写 graph store，尺寸/图标/文案硬编码，转换按钮直接调用 command-like store action |
| `frontend/components/graph/nodes/GroupNode.tsx` | PENDING | 深度完整 | 1 | 确认 group 视图直接读写 store，render 路径日志，UI 色值/尺寸硬编码 |
| `frontend/components/graph/edges/CustomEdge.tsx` | PENDING | 深度完整 | 1 | 确认边视图直接 updateEdge，每边一个 window listener，marker/label 样式硬编码 |

**下一轮计划：**
- 精读 workspace/data-layer：Next API routes、workspace store、storage service，确认统一数据层和持久化边界。

## [第16轮] 2026-04-29

### A. 本轮目标（阅读前声明）

**目标文件：**
- `frontend/app/api/workspace/load/route.ts`、`frontend/app/api/workspace/save/route.ts`、`frontend/app/api/layout/route.ts`（原因：Next API 数据出口）
- `frontend/stores/workspace/index.ts`、`canvasSlice.ts`、`userSlice.ts`（原因：workspace 状态与 canvas tree）
- `frontend/utils/workspace/canvasSync.ts`、`frontend/utils/workspace/persistence.ts`（原因：graph/workspace 同步与文件保存链路）
- `frontend/services/storage/StorageManager.ts`、`frontend/services/storage/adapters/FileSystemAdapter.ts`（原因：已有 storage data-layer 候选）

**本轮想弄清楚：**
- 当前数据层是否唯一，哪些地方绕过 data-layer 直接 fetch 或写 store。
- workspace/canvas/subgraph 层级是否可复用到新版 Subgraph Navigation。
- Next API 与 storage service 是否重复实现持久化。

### C. 本轮发现

**关键发现：**
- (verified) `/api/workspace/load` 和 `/api/workspace/save` 直接读写 `public/workspace/{key}`，用 `StorageDataSchema` 校验。
- (verified) `/api/workspace/save` 打印完整请求体和验证数据，保存大图时会产生大量日志。
- (verified) `/api/layout` 在模块顶层创建 `new LayoutManager()`，会在 API route 加载时实例化策略并触发 ELK 动态导入链；该 API 仍接收旧 `Node | Group | Edge`。
- (verified) `/api/layout` 的 GET strategy 描述包含 `canvas-layout/group-layout/recursive-layout`，但当前 LayoutManager 注册的是 `elk-layout/elk-group-layout`，描述和真实策略不一致。
- (verified) workspace store 的 `Canvas.graphData` 直接保存旧 `Node|Group` 和 `Edge`，这可以作为 Subgraph Navigation 的雏形，但还不是 OntologyGraph/Subgraph 模型。
- (verified) `canvasSlice.createCanvas()` 对 parent canvas 执行 `parentCanvas.children.push(newCanvas.id)`，存在原地修改。
- (verified) `canvasSync.ts` 和 `utils/workspace/persistence.ts` 都直接 fetch `/api/workspace/save`，绕过 `StorageManager`。
- (verified) `StorageManager/FileSystemAdapter` 已经是 data-layer 雏形，但目前没有被 `canvasSync`、`persistenceMiddleware`、`MermaidConverterService` 统一使用。
- (verified) `FileSystemAdapter.remove/clear/deleteFile` 未实现。
- (verified) `WorkspaceSchema` 对 Node/Group/Edge 使用简化 passthrough schema，能兼容旧字段，但也允许 `_hiddenByConversion` 等 UI 字段被持久化。

**修订的旧结论：**
- 原来认为 `frontend/services/storage` 可直接作为持久化层 → 现在确认它只是候选，必须先把所有直接 fetch 收口到 workspace repository，并补 remove/clear/migration 能力。

**更新了 CODEBASE.md：**
- §4/§5 增加 workspace API、StorageManager/FileSystemAdapter、workspace model/storage 契约摘要。
- §6/§7 增加数据层重复链路说明。
- §9 增加 API 日志、layout API 策略不一致、StorageManager 未统一使用风险。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/app/api/workspace/load/route.ts` | PENDING | 深度完整 | 1 | 确认按 key 从 public/workspace 读 JSON，StorageDataSchema 校验，404 文件不存在 |
| `frontend/app/api/workspace/save/route.ts` | PENDING | 深度完整 | 1 | 确认校验 body.data 后写 public/workspace，包含完整请求体调试日志 |
| `frontend/app/api/layout/route.ts` | PENDING | 深度完整 | 1 | 确认 API route 顶层实例化 LayoutManager，POST 接旧模型并返回 positions，GET 策略描述过期 |
| `frontend/stores/workspace/index.ts` | 深度完整 | 深度完整 | 2 | 确认 workspace store 只是 userSlice + canvasSlice devtools 聚合 |
| `frontend/stores/workspace/canvasSlice.ts` | 深度完整 | 深度完整 | 2 | 确认画布树和 canvases 双写，createCanvas 原地 push parent children |
| `frontend/stores/workspace/userSlice.ts` | PENDING | 深度完整 | 1 | 确认仅保存 user 和 setUser |
| `frontend/utils/workspace/canvasSync.ts` | 深度完整 | 深度完整 | 2 | 确认 graph/workspace 双向同步并直接 fetch 保存，和 middleware 重复 |
| `frontend/utils/workspace/persistence.ts` | PENDING | 深度完整 | 1 | 确认独立 persistWorkspace 也直接 fetch `/api/workspace/save` |
| `frontend/services/storage/StorageManager.ts` | PENDING | 深度完整 | 1 | 确认已有 storage repository 雏形，封装 load/save canvas/workspace/delete/clear |
| `frontend/services/storage/adapters/FileSystemAdapter.ts` | PENDING | 深度完整 | 1 | 确认 fetch `/api/workspace/load|save` adapter，remove/clear/deleteFile 未实现 |
| `frontend/types/workspace/storage.ts` | PENDING | 深度完整 | 1 | 确认 STORAGE_VERSION/KEYS、StorageDataSchema、StorageAdapter/FileSystemAdapter 接口 |
| `frontend/types/workspace/models.ts` | 深度完整 | 深度完整 | 2 | 确认 Workspace/Canvas/CanvasTree schema，graphData 仍保存旧 Node/Group/Edge passthrough |

**下一轮计划：**
- 收敛扫描发现，产出新版架构设计和优化方案；同时生成中间总结文档，防止后续上下文压缩丢失本轮结论。

## [SYNC] 2026-04-29 — 新约束重扫与新版架构方案

### A. SYNC 范围声明

**触发任务：** 沉淀通用/项目级前端规则，按新规则重跑 codebase-ontology，并生成新版架构设计与优化方案。

**直接变更文件：**
- `FRONTEND_ARCHITECTURE_RULES.zh-CN.md`
- `CODEBASE_RESCAN_SUMMARY.zh-CN.md`
- `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md`
- `CODEBASE.md`
- `ITERATION_LOG.md`

**预计连带影响：**
- `CODEBASE.md` §1/§2/§4/§5/§6/§9 需要同步新增规则、算法、Mermaid、store、ReactFlow、data-layer 重扫发现。
- 架构方案应替代旧 `ARCHITECTURE_OPTIMIZATION_PLAN.zh-CN.md` 成为下一阶段实现依据。

### C. SYNC 结果

**连带重读文件：**
- 布局算法链路：`LayoutManager.ts`、`ELKLayoutStrategy.ts`、`ELKGroupLayoutStrategy.ts`、`EdgeOptimizer.ts`、`ELKGraphConverter.ts`、`ELKConfigBuilder.ts`、`NestingTreeBuilder.ts`、`GeometryUtils.ts`、`layoutTypes.ts`、`layout.ts`、`elk-algorithm.ts`
- Mermaid 导入链路：`MermaidParser.ts`、`MermaidConverter.ts`、`MermaidConverterService.ts`、`MermaidLayoutAdapter.ts`、`types.ts`
- graph store 链路：`index.ts`、`basicOperations.ts`、`groupOperations.ts`、`conversionOperations.ts`、`edgesSlice.ts`、`historySlice.ts`、`persistenceMiddleware.ts`
- ReactFlow 渲染链路：`GraphPageContent.tsx`、`nodeSyncUtils.ts`、关键 hooks、`NoteNode.tsx`、`GroupNode.tsx`、`CustomEdge.tsx`
- data-layer 链路：workspace API routes、workspace store、canvasSync、persistence、StorageManager、FileSystemAdapter、workspace schemas

**CODEBASE.md 更新内容：**
- §1 增加架构规则基线。
- §2 增加新增文档。
- §4 增加算法、Mermaid、storage/API 模块详解。
- §5 增加算法函数、Mermaid 导入函数、API/storage 函数实现步骤。
- §6 增加 Mermaid 导入和 StorageManager 保存链路。
- §9 增加算法 DTO 缺失、Mermaid 大 service、data-layer 重复、layout API 策略不一致等风险。

**新增文档：**
- `FRONTEND_ARCHITECTURE_RULES.zh-CN.md`
- `CODEBASE_RESCAN_SUMMARY.zh-CN.md`
- `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md`

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `CODEBASE_RESCAN_SUMMARY.zh-CN.md` | 新增 | 深度完整 | 1 | 本轮重扫摘要，保留算法、store、ReactFlow、data-layer 和风险结论 |
| `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` | 新增 | 深度完整 | 1 | 新版架构设计，包含目标结构、状态拆分、command、adapter、算法、data-layer 和分阶段优化计划 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 3 | 已同步新增规则和重扫发现 |
| `ITERATION_LOG.md` | 深度完整 | 深度完整 | 3 | 已记录第9-16轮重扫和本次 SYNC |

**新增 Finding：**
- 算法模块不是没考虑，而是需要作为独立纯计算层重构；当前算法层直接吃旧 UI 模型，是新版架构必须处理的主线之一。

## [SYNC] 2026-04-29 13:50 — Phase 0 开发优化同步

### A. SYNC 范围声明

**触发任务：** 在本地 git 备份后开始开发优化，先处理一批不移动目录的正确性问题，并保留详细 todo/中间文档。

**直接变更文件：**
- `docker-compose.yml`
- `frontend/components.json`
- `frontend/tailwind.config.ts`
- `frontend/services/mermaid/MermaidLayoutAdapter.ts`
- `frontend/stores/graph/edgesSlice.ts`
- `frontend/stores/graph/nodes/basicOperations.ts`
- `frontend/stores/graph/nodes/groupOperations.ts`
- `frontend/components/graph/core/GraphPageContent.tsx`
- `frontend/components/graph/controls/EdgeFilterControl.tsx`
- `OPTIMIZATION_TODO_2026-04-29.zh-CN.md`
- `CODEBASE.md`
- `ITERATION_LOG.md`

**预计连带影响：**
- edge visibility 契约从 `visibleEdgeIds` 单字段升级为 `edgeVisibility.mode + ids`，ReactFlow edge projection 需要按新契约过滤。
- node/group 删除会同时改 edges 与 visibility，影响 history/persistence 快照内容。
- Docker/Tailwind/shadcn 配置从历史路径切换到真实目录结构。
- `CODEBASE.md` §1/§2/§4/§5/§8/§9 需要同步当前状态，避免旧 P0 风险继续被当作未修。

### C. SYNC 结果

**关键发现与修复：**
- (verified) 已创建本地 stash 备份：`stash@{Wed Apr 29 13:44:03 2026}`，object `af24c3491674cdf57ccb0a7457656afe0dd803a0`。
- (verified) `groupOperations.updateGroup()` 已修复 `updates.nodeIds` 分支返回嵌套数组的问题；added/removed nodeIds 在 map 外计算，map 内只返回单个 node/group。
- (verified) `deleteNode()`、`deleteGroup()` 已同步删除 incident edges，并在 custom edge visibility 下清理被删除 edge id。
- (verified) `edgesSlice` 已新增 `edgeVisibility: { mode:'all'|'none'|'custom'; ids:string[] }`，`GraphPageContent` 按 mode 过滤，`EdgeFilterControl` 的 all 分支调用 `showAllEdges()`。
- (verified) `MermaidLayoutAdapter` strategy 已从 `elk` 改为 `elk-layout`。
- (verified) `docker-compose.yml` 已改为根目录 context + `Dockerfile.frontend` / `Dockerfile.backend`。
- (verified) `tailwind.config.ts` 和 `components.json` 已改为真实 App Router 根级路径。

**验证结果：**
- `rg` 静态回查旧模式：PASS，未再发现旧 Mermaid strategy、旧 edge 空数组过滤、旧 Dockerfile/src 路径。
- `git diff --check`：PASS。
- `cd frontend && npm run build`：PASS。
- `cd frontend && npm run lint`：FAIL，仍为既有 lint 基线 `159 errors / 96 warnings`；本轮没有把全项目 lint 债务作为交付范围。
- `docker compose config` / `docker-compose config`：本机不可运行，Docker 无 compose 子命令且未安装旧版 docker-compose。

**更新了 CODEBASE.md：**
- §1 更新 Docker/Tailwind/shadcn 当前状态。
- §2 增加 `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` 并修正配置文件说明。
- §4 更新 `edgesSlice`、`basicOperations`、`groupOperations` 注意事项。
- §5 更新 edge visibility、delete node/group、update group 算法步骤。
- §8 增加 `edgeVisibility` 视图契约。
- §9 将本轮已修 P0/P1 标记为 `FIXED`，保留剩余架构债务。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/stores/graph/edgesSlice.ts` | 深度完整 | 深度完整 | 3 | 已同步 edge visibility mode 契约、CRUD 与 history 副作用变化 |
| `frontend/components/graph/core/GraphPageContent.tsx` | 深度完整 | 深度完整 | 3 | 已同步 edge projection 过滤逻辑改为按 `edgeVisibility.mode` 判断 |
| `frontend/components/graph/controls/EdgeFilterControl.tsx` | 深度完整 | 深度完整 | 2 | 已同步 all filter 改为调用 `showAllEdges()` |
| `frontend/stores/graph/nodes/basicOperations.ts` | 深度完整 | 深度完整 | 2 | 已同步 `deleteNode()` 删除 incident edges 与 visibility 清理 |
| `frontend/stores/graph/nodes/groupOperations.ts` | 深度完整 | 深度完整 | 2 | 已同步 `updateGroup()` nodeIds bug 修复和 `deleteGroup()` 清边逻辑 |
| `frontend/services/mermaid/MermaidLayoutAdapter.ts` | 深度完整 | 深度完整 | 2 | 已同步 layout strategy id 修复 |
| `docker-compose.yml` | 深度完整 | 深度完整 | 3 | 已同步 Dockerfile 路径修复 |
| `frontend/tailwind.config.ts` | 深度完整 | 深度完整 | 3 | 已同步 content 路径修复 |
| `frontend/components.json` | 深度完整 | 深度完整 | 3 | 已同步 shadcn CSS 路径修复 |
| `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` | 新增 | 深度完整 | 1 | 本轮备份、完成标准、Phase 0 修复清单、验证和暂缓项记录 |

**下一轮计划：**
- 进入 Phase 1：先抽 `graph command` 层和最小测试夹具，覆盖 delete node/group、edge visibility、group membership 三条核心一致性路径。

## [SYNC] 2026-04-29 14:09 — Phase 1 边界工具化

### A. SYNC 范围声明

**触发任务：** 继续开发，并解释新版架构目录为何没有一次性成型；按渐进迁移方式先落第一个可运行的新目录边界。

**直接变更文件：**
- `frontend/domain/ontology/index.ts`
- `frontend/domain/ontology/commands/index.ts`
- `frontend/domain/ontology/commands/edgeVisibility.ts`
- `frontend/domain/ontology/commands/graphConsistency.ts`
- `frontend/stores/graph/edgesSlice.ts`
- `frontend/stores/graph/nodes/basicOperations.ts`
- `frontend/stores/graph/nodes/groupOperations.ts`
- `frontend/components/graph/core/GraphPageContent.tsx`
- `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md`
- `OPTIMIZATION_TODO_2026-04-29.zh-CN.md`
- `CODEBASE.md`
- `ITERATION_LOG.md`

**预计连带影响：**
- `domain/ontology` 从纯文档目标变成真实代码目录，旧 store 开始依赖 domain commands。
- edge visibility、delete node/group incident edge cleanup 不再散落在 store 内部。
- `CODEBASE.md` §2/§4/§5/§6 需要补充新增命令目录、函数算法和数据流。

### C. SYNC 结果

**关键发现与修复：**
- (verified) 新增 `frontend/domain/ontology/commands/edgeVisibility.ts`，以纯函数管理 `all/none/custom` edge visibility。
- (verified) 新增 `frontend/domain/ontology/commands/graphConsistency.ts`，以纯函数删除 node/group incident edges，并同步 edge visibility。
- (verified) `edgesSlice` 已改为调用 domain commands，不再内联 visibility 计算。
- (verified) `basicOperations.deleteNode()` 与 `groupOperations.deleteGroup()` 已改为调用 `removeEdgesConnectedToNodesWithVisibility()`。
- (verified) `GraphPageContent` edge filter 已改为调用 `isEdgeVisible()`，旧 `visibleEdgeIds` 只作为 legacy fallback。
- (verified) `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` 已明确：目标目录逐步迁移，不做一次性大搬家。

**验证结果：**
- `cd frontend && npm run build`：PASS。
- `rg` 检查 `domain/ontology` 反向依赖：PASS，未引入 React、ReactFlow、Zustand、fetch、CSS。
- `git diff --check`：PASS。
- `cd frontend && npm run lint`：FAIL，但从 159 errors / 96 warnings 降到 155 errors / 92 warnings。

**补充修复：**
- (verified) `GraphPageContent` 移除了 `isDraggingRef.current` effect dependency，避免 React refs lint 错误。
- (verified) `GraphPageContent` 的 `_hiddenByConversion` 检查不再使用 `any`。
- (verified) `EdgeFilterControl` 的 select value 不再 cast 为 `any`。

**更新了 CODEBASE.md：**
- §2 增加 `frontend/domain/ontology` 目录树。
- §4 增加 domain ontology index、commands index、edgeVisibility、graphConsistency 模块详解。
- §5 增加 edge visibility commands 和 graph consistency commands 的函数算法。
- §6 增加删除节点/分组一致性清理、边可见性过滤两条数据流。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/domain/ontology/index.ts` | 新增 | 深度完整 | 1 | Ontology domain 公开出口，当前只导出 commands |
| `frontend/domain/ontology/commands/index.ts` | 新增 | 深度完整 | 1 | Commands 公开出口，导出 edgeVisibility 和 graphConsistency |
| `frontend/domain/ontology/commands/edgeVisibility.ts` | 新增 | 深度完整 | 1 | 纯函数管理 all/none/custom edge visibility、legacy ids 派生和 toggle |
| `frontend/domain/ontology/commands/graphConsistency.ts` | 新增 | 深度完整 | 1 | 纯函数删除 incident edges，并与 visibility 同步 |
| `frontend/stores/graph/edgesSlice.ts` | 深度完整 | 深度完整 | 4 | 已改为调用 domain edge visibility commands |
| `frontend/stores/graph/nodes/basicOperations.ts` | 深度完整 | 深度完整 | 3 | deleteNode 已调用 domain graph consistency command |
| `frontend/stores/graph/nodes/groupOperations.ts` | 深度完整 | 深度完整 | 3 | deleteGroup 已调用 domain graph consistency command |
| `frontend/components/graph/core/GraphPageContent.tsx` | 深度完整 | 深度完整 | 4 | edge filter 已调用 domain `isEdgeVisible()` |
| `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 2 | 已补充渐进迁移说明和 Phase 0/Phase 1 状态 |
| `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 2 | 已补充 Phase 1 迁移说明和完成项 |

**下一轮计划：**
- 继续 Phase 1：补 import boundary 约束或先增加最小测试脚本，防止 domain commands 被未来 UI/store 反向污染。

## [SYNC] 2026-04-29 14:30 — Phase 1 架构边界护栏

### A. SYNC 范围声明

**触发任务：** 用户确认继续 Phase 1；本轮新增轻量边界检查，保护 `domain/ontology` 不反向依赖 UI、store、框架和 fetch。

**直接变更文件：**
- `frontend/scripts/check-architecture-boundaries.mjs`
- `frontend/package.json`
- `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md`
- `OPTIMIZATION_TODO_2026-04-29.zh-CN.md`
- `VALIDATION_RESULTS.md`
- `CODEBASE.md`
- `ITERATION_LOG.md`

**预计连带影响：**
- `frontend/package.json` 新增 `check:architecture` 脚本。
- `CODEBASE.md` §2/§4/§5 需要记录新增脚本和算法。
- Phase 1 验证记录需要从一次性 `rg` 提升为可重复 npm script。

### C. SYNC 结果

**关键发现与修复：**
- (verified) 新增 `frontend/scripts/check-architecture-boundaries.mjs`，使用 Node 内置模块递归扫描源码，无第三方依赖。
- (verified) 当前规则保护 `domain/ontology`：禁止 React、ReactFlow、Zustand、Next、`@/components`、`@/stores`、`@/services`、fetch、CSS。
- (verified) `frontend/package.json` 新增 `npm run check:architecture`。
- (verified) `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` 已记录该护栏为 Phase 1 已完成项。

**验证结果：**
- `cd frontend && npm run check:architecture`：PASS，检查 4 个 `domain/ontology` 文件。
- `git diff --check`：PASS。
- `cd frontend && npm run build`：PASS。
- `cd frontend && npm run lint`：FAIL，仍为既有 lint 债务，当前为 `155 errors / 92 warnings`。

**更新了 CODEBASE.md：**
- §2 增加 `frontend/scripts/check-architecture-boundaries.mjs`。
- §4 增加脚本模块详解。
- §5 增加脚本函数签名、算法步骤、副作用和失败行为。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/scripts/check-architecture-boundaries.mjs` | 新增 | 深度完整 | 1 | 轻量边界检查脚本，保护 domain/ontology 不依赖框架/UI/store/fetch/CSS |
| `frontend/package.json` | 深度完整 | 深度完整 | 3 | 新增 `check:architecture` npm script |
| `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 3 | Phase 1 已完成项补充 architecture check |
| `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 3 | Phase 1 验证记录补充 check:architecture |
| `VALIDATION_RESULTS.md` | 深度完整 | 深度完整 | 2 | 新增 architecture check 验证结果 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 5 | 已同步新增脚本目录、模块和函数算法 |

**下一轮计划：**
- 继续增加最小 runtime 测试，覆盖 `edgeVisibility` 和 `graphConsistency` 的关键行为，或开始收敛 store 中的 `any` 类型债务。

## [SYNC] 2026-04-29 14:55 — Phase 1 完结收口

### A. SYNC 范围声明

**触发任务：** 用户要求“先把阶段1完结”；本轮将 Phase 1 从“边界护栏已落地”收口为“可一键验收的阶段成果”，补齐 domain runtime tests、验证记录和项目本体文档同步。

**直接变更文件：**
- `frontend/scripts/test-domain-commands.mjs`
- `frontend/package.json`
- `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md`
- `OPTIMIZATION_TODO_2026-04-29.zh-CN.md`
- `VALIDATION_RESULTS.md`
- `CODEBASE.md`
- `ITERATION_LOG.md`

**预计连带影响：**
- `frontend/package.json` 新增 `test:domain` 与 `check:phase1` 后，Phase 1 有了稳定验收入口。
- `CODEBASE.md` §1/§2/§4/§5 需要补充新增测试脚本和 npm scripts。
- `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` 与 `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` 需要把 Phase 1 标记为已完结，并把剩余边界强化项归为后续非阻断任务。

### C. SYNC 结果

**关键发现与修复：**
- (verified) `frontend/scripts/test-domain-commands.mjs` 已覆盖 `edgeVisibility` 的 all/none/custom、去重、未知 edge 过滤、toggle 和 `add/remove` 行为。
- (verified) `frontend/scripts/test-domain-commands.mjs` 已覆盖 `graphConsistency` 删除 incident edges、同步 custom visibility、派生 legacy `visibleEdgeIds`。
- (verified) 测试脚本断言原始 edge 输入数组长度不变，确认当前 domain commands 不修改输入数组。
- (verified) `frontend/package.json` 已提供 `check:phase1`，可一键执行 architecture boundary 与 domain runtime tests。
- (verified) Phase 1 文档已从“已开始/下一步”改为“已完结/后续非阻断强化”。

**验证结果：**
- `cd frontend && npm run check:phase1`：PASS。
- `cd frontend && npm run build`：PASS。
- `git diff --check`：PASS。
- `cd frontend && npm run lint`：FAIL，仍为历史基线 `155 errors / 92 warnings`，未作为 Phase 1 阻断项。

**更新了 CODEBASE.md：**
- §1 增加 Phase 1 架构验收命令。
- §2 增加 `frontend/scripts/test-domain-commands.mjs`，并补充 `package.json` 脚本说明。
- §4 增加 `test-domain-commands.mjs` 模块详解。
- §5 增加 `test-domain-commands.mjs` 的函数签名、算法步骤、副作用、失败行为和调用关系。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/scripts/test-domain-commands.mjs` | 新增 | 深度完整 | 1 | 轻量 runtime 测试，覆盖 Phase 1 domain commands 的关键行为与不可变输入 |
| `frontend/package.json` | 深度完整 | 深度完整 | 4 | 新增 `test:domain` 与 `check:phase1`，形成阶段一键验收入口 |
| `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 4 | Phase 1 状态改为已完结，并记录验收结果与后续非阻断项 |
| `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 4 | Phase 1 完结结论、runtime test 和 check:phase1 验证记录已补齐 |
| `VALIDATION_RESULTS.md` | 深度完整 | 深度完整 | 3 | 新增 Phase 1 Closure 验证记录：check:phase1/build/diff/lint |
| `CODEBASE.md` | 深度完整 | 深度完整 | 6 | 已同步新增脚本、验收命令、模块详解和函数算法 |

**下一轮计划：**
- 进入 Phase 2：优先建立 `domain/ontology/model` 与 legacy graph mapper，先把旧 `Node/Group/Edge` 和未来 OntologyGraph 的边界说清楚，再迁移 command/use-case。

## [SYNC] 2026-04-29 15:23 — Phase 2A 领域模型边界

### A. SYNC 范围声明

**触发任务：** 用户确认进入阶段 2；本轮先实现 Phase 2A 的最小可运行闭环：本体领域模型、legacy graph mapper、基础 validation、阶段 2 验收脚本和文档同步。

**直接变更文件：**
- `frontend/domain/ontology/model/*`
- `frontend/domain/ontology/mappers/*`
- `frontend/domain/ontology/validation/*`
- `frontend/domain/ontology/index.ts`
- `frontend/domain/ontology/commands/index.ts`
- `frontend/scripts/test-ontology-model.mjs`
- `frontend/package.json`
- `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md`
- `OPTIMIZATION_TODO_2026-04-29.zh-CN.md`
- `VALIDATION_RESULTS.md`
- `CODEBASE.md`
- `ITERATION_LOG.md`

**预计连带影响：**
- `domain/ontology` 从只有 commands 扩展为 model + mapper + validation 三块，但仍必须保持框架无关。
- 旧 `types/graph/models.ts` 暂不迁移，只作为 mapper 输入的 legacy shape；本轮不替换 store/history。
- Phase 2 验收应新增 `npm run test:ontology` 和 `npm run check:phase2`，并继续复用 Phase 1 的架构边界检查。

### C. SYNC 结果

**关键发现与修复：**
- (verified) 新增 `frontend/domain/ontology/model`：包含 schemaVersion、node、edge、domain、subgraph、graph 聚合模型。
- (verified) `OntologyNode` 已明确类图式字段 `fields[]`，字段分类覆盖 `attribute/rule/constraint/interface/behavior`。
- (verified) `OntologyDomain` 与 ReactFlow group 解耦，只表达 nodeIds/domainIds/parentDomainId/collapsed。
- (verified) 新增 `mapLegacyGraphToOntologyGraph()`，旧 group 映射为 `OntologyDomain`，旧 node 映射为 `OntologyNode`，旧 edge 映射为 `OntologyEdge`。
- (verified) mapper 不 import `@/types/graph/models`，避免把 React/CSS 类型传入 domain 层。
- (verified) 新增 `validateOntologyGraph()`，覆盖 graph id/name/schemaVersion、node field、edge endpoint/relation、domain/subgraph 引用和 domain parent cycle。
- (verified) 新增 `frontend/scripts/test-ontology-model.mjs`，覆盖 mapper 正常路径、invalid edge、空 relation 和 domain parent cycle。

**验证结果：**
- `cd frontend && npm run check:phase2`：PASS。
- `cd frontend && npm run build`：PASS。
- `cd frontend && npm run lint`：FAIL，仍为历史基线 `155 errors / 92 warnings`，数量未扩大。

**更新了 CODEBASE.md：**
- §1 增加 Phase 2A 验收命令。
- §2 增加 model/mappers/validation/test 脚本文件树。
- §4 增加 ontology model、mapper、validation、test 脚本模块详解。
- §5 增加 `createOntologyGraph()`、`mapLegacyGraphToOntologyGraph()`、`mapAttributesToFields()`、`validateOntologyGraph()`、`validateDomainCycles()`、`test-ontology-model.mjs` 算法步骤。
- §6 增加 F-009：Legacy Graph 映射到 OntologyGraph 并校验。
- §8 增加 Ontology Model 数据契约。
- §9 增加 mapper 保留 invalid edges 的阶段性风险。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/domain/ontology/model/schemaVersion.ts` | 新增 | 深度完整 | 1 | schema version 常量，当前为 1 |
| `frontend/domain/ontology/model/node.ts` | 新增 | 深度完整 | 1 | 定义本体节点类型、字段分类、字段和节点契约 |
| `frontend/domain/ontology/model/edge.ts` | 新增 | 深度完整 | 1 | 定义本体语义边和方向契约 |
| `frontend/domain/ontology/model/domain.ts` | 新增 | 深度完整 | 1 | 定义 Domain 语义边界，不含 ReactFlow view 字段 |
| `frontend/domain/ontology/model/subgraph.ts` | 新增 | 深度完整 | 1 | 定义子图导航契约 |
| `frontend/domain/ontology/model/graph.ts` | 新增 | 深度完整 | 1 | 定义 OntologyGraph 聚合模型与创建函数 |
| `frontend/domain/ontology/model/index.ts` | 新增 | 深度完整 | 1 | model barrel 出口 |
| `frontend/domain/ontology/mappers/index.ts` | 新增 | 深度完整 | 1 | mapper barrel 出口 |
| `frontend/domain/ontology/mappers/legacyGraphMapper.ts` | 新增 | 深度完整 | 1 | 旧图到 OntologyGraph 的纯转换器，保留 invalid edge 给 validation 报告 |
| `frontend/domain/ontology/validation/index.ts` | 新增 | 深度完整 | 1 | validation barrel 出口 |
| `frontend/domain/ontology/validation/graphValidation.ts` | 新增 | 深度完整 | 1 | 本体图一致性校验，包含 domain parent cycle 检测 |
| `frontend/scripts/test-ontology-model.mjs` | 新增 | 深度完整 | 1 | runtime 测试 mapper/validator 正常与异常路径 |
| `frontend/domain/ontology/index.ts` | 深度完整 | 深度完整 | 2 | 公开出口从 commands 扩展为 commands/model/mappers/validation |
| `frontend/package.json` | 深度完整 | 深度完整 | 5 | 新增 `test:ontology` 和 `check:phase2` |
| `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 5 | Phase 2 拆成 2A 已完成和 2B 待做 |
| `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 5 | 增加 Phase 2A 完成项和验证记录 |
| `VALIDATION_RESULTS.md` | 深度完整 | 深度完整 | 4 | 新增 Phase 2A 验证记录 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 7 | 已同步 Phase 2A 新模型、数据流、契约和风险 |

**下一轮计划：**
- 进入 Phase 2B：新增 command/use-case 层，先实现纯语义 command result，不急着替换旧 store；优先覆盖 `createClassNode`、`updateNodeFields`、`createSemanticRelation`、`moveNodeToDomain`。

## [SYNC] 2026-04-29 15:48 — Phase 2B 语义命令与旧实现清理

### A. SYNC 范围声明

**触发任务：** 用户要求进入阶段 2 时必须注意优化或删除旧实现，避免旧实现长期残留影响代码。

**直接变更文件：**
- `frontend/domain/ontology/commands/graphCommands.ts`
- `frontend/domain/ontology/commands/graphConsistency.ts`
- `frontend/domain/ontology/commands/index.ts`
- `frontend/stores/graph/edgesSlice.ts`
- `frontend/stores/graph/nodes/basicOperations.ts`
- `frontend/stores/graph/nodes/groupOperations.ts`
- `frontend/components/graph/core/GraphPageContent.tsx`
- `frontend/components/graph/controls/EdgeFilterControl.tsx`
- `frontend/scripts/load-typescript-module.mjs`
- `frontend/scripts/test-domain-commands.mjs`
- `frontend/scripts/test-ontology-model.mjs`
- `frontend/scripts/test-ontology-commands.mjs`
- `frontend/package.json`
- `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md`
- `OPTIMIZATION_TODO_2026-04-29.zh-CN.md`
- `VALIDATION_RESULTS.md`
- `CODEBASE.md`
- `ITERATION_LOG.md`

**预计连带影响：**
- 删除旧 `visibleEdgeIds` 兼容链路后，边可见性只剩 `edgeVisibility { mode, ids }` 一个真相源。
- 新增 ontology graph commands 后，Phase 2 有了纯语义写操作入口，但旧 graph store 仍暂时保留为运行态。
- 测试脚本共享 loader 后，后续新增 runtime tests 不再复制 TypeScript 转译逻辑。

### C. SYNC 结果

**关键发现与修复：**
- (verified) 已新增 `graphCommands.ts`，提供 `createClassNode`、`updateNodeFields`、`createSemanticRelation`、`moveNodeToDomain`。
- (verified) command 失败返回 `changed:false + warnings`，不抛业务异常、不写半成品图。
- (verified) 已删除 active frontend code 中的 `visibleEdgeIds` / `setVisibleEdgeIds` 引用，`rg` 无匹配。
- (verified) `GraphPageContent` edge filter 只读取 `edgeVisibility`，不再有 legacy fallback。
- (verified) `EdgeFilterControl` 改为调用 `setCustomEdgeVisibility()`。
- (verified) `graphConsistency` 删除 incident edges 后只返回结构化 `edgeVisibility`，不再派生 legacy ids。
- (verified) 新增共享 `load-typescript-module.mjs`，`test-domain-commands` 和 `test-ontology-model` 已改为复用该 loader。
- (verified) 新增 `test-ontology-commands.mjs`，覆盖 command 成功路径和 warning 路径。

**验证结果：**
- `rg -n "visibleEdgeIds|setVisibleEdgeIds" frontend -g '!node_modules' -g '!.next'`：PASS，无匹配。
- `cd frontend && npm run check:phase2`：PASS。
- `cd frontend && npm run build`：PASS。
- `cd frontend && npm run lint`：FAIL，仍为历史基线 `155 errors / 92 warnings`，数量未扩大。

**更新了 CODEBASE.md：**
- §1/§2 更新 `check:phase2`、新增脚本和 `graphCommands.ts`。
- §4 增加 `graphCommands.ts`、`load-typescript-module.mjs`、`test-ontology-commands.mjs` 模块说明。
- §5 增加 ontology command 和共享 loader/test 脚本算法。
- §6 增加 F-010：OntologyGraph 语义命令更新。
- §8/§9 清理 `visibleEdgeIds` 当前契约描述，并把旧字段标为已删除历史风险。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/domain/ontology/commands/graphCommands.ts` | 新增 | 深度完整 | 1 | Phase 2B 纯语义 command 层，覆盖节点、字段、关系、Domain 移动 |
| `frontend/domain/ontology/commands/graphConsistency.ts` | 深度完整 | 深度完整 | 2 | 删除 legacy `visibleEdgeIds` 派生结果，只保留 edgeVisibility |
| `frontend/stores/graph/edgesSlice.ts` | 深度完整 | 深度完整 | 5 | 删除 `visibleEdgeIds` state/API，改为 `setCustomEdgeVisibility` |
| `frontend/components/graph/core/GraphPageContent.tsx` | 深度完整 | 深度完整 | 5 | 删除 visibleEdgeIds fallback，边过滤只读 edgeVisibility |
| `frontend/components/graph/controls/EdgeFilterControl.tsx` | 深度完整 | 深度完整 | 3 | 过滤控件调用 `setCustomEdgeVisibility` |
| `frontend/scripts/load-typescript-module.mjs` | 新增 | 深度完整 | 1 | 共享 runtime test TS loader，删除脚本重复实现 |
| `frontend/scripts/test-domain-commands.mjs` | 深度完整 | 深度完整 | 2 | 复用共享 loader，删除 legacy visible ids 断言 |
| `frontend/scripts/test-ontology-model.mjs` | 深度完整 | 深度完整 | 2 | 复用共享 loader |
| `frontend/scripts/test-ontology-commands.mjs` | 新增 | 深度完整 | 1 | 覆盖 ontology commands 成功与 warning 路径 |
| `frontend/package.json` | 深度完整 | 深度完整 | 6 | 新增 `test:ontology:commands`，`check:phase2` 纳入 command 测试 |
| `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 6 | Phase 2B 第一批完成项和旧实现清理记录 |
| `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 6 | Phase 2B 第一批完成项、验证和暂缓项更新 |
| `VALIDATION_RESULTS.md` | 深度完整 | 深度完整 | 5 | 新增 Phase 2B 验证记录 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 8 | 同步 command 层、旧实现删除、数据流和契约变化 |

**下一轮计划：**
- Phase 2B 后续：把旧 store 的语义写操作逐步接到 ontology commands，优先从节点字段和语义关系编辑入口开始；同时继续清理旧的直接写 graphData 路径。

## [SYNC] 2026-04-29 16:12 — Phase 2B 编辑入口收敛

### A. SYNC 范围声明

**触发任务：** 用户要求继续后续任务；同时强调新增阶段 2 能力时必须优化或删除旧实现，避免旧实现继续影响代码。

**直接变更文件：**
- `frontend/components/graph/editors/EdgeEditor.tsx`
- `frontend/components/graph/editors/NodeEditor.tsx`
- 可能新增/修改编辑器相关轻量测试脚本
- `frontend/package.json`
- `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md`
- `OPTIMIZATION_TODO_2026-04-29.zh-CN.md`
- `VALIDATION_RESULTS.md`
- `CODEBASE.md`
- `ITERATION_LOG.md`

**预计连带影响：**
- 清理旧编辑器“输入即写全局 store”的实现，改为本地 draft + 显式保存，减少 history/persistence 噪音。
- 保留旧 graph store 作为运行态，但把编辑入口的副作用边界收窄，为后续接 ontology commands 做准备。
- 若发现编辑器里有无法安全删除的旧路径，本轮会先包成明确 helper/adapter，不让重复逻辑散落在 JSX 中。

### C. SYNC 结果

**关键发现与修复：**
- (verified) `EdgeEditor` 旧实现存在 `useEffect([formData, edge, updateEdge])`，每次输入都会写全局 store；本轮已删除该路径。
- (verified) `EdgeEditor` 现在外层只选择 edge，内层 `EdgeEditorForm` 持有本地 `EdgeEditorDraft`，点击保存后才调用 `updateEdge()`。
- (verified) 边自定义属性 JSON 现在先在 draft 中解析校验，非法 JSON 不写 store、不写 history、不触发 persistence。
- (verified) `NodeEditor` 旧实现中 `handleRemoveFromGroup()` 直接 `updateNode(nodeId, { groupId: undefined })`；本轮已改为 `removeNodeFromGroup(nodeId)`。
- (verified) `NodeEditor` 保存时 membership 变化走 `addNodeToGroup/removeNodeFromGroup`，普通字段 `buildNodeUpdate()` 不包含 `groupId`。
- (verified) 新增 `editorDrafts.ts`，把 draft 创建、标签解析、JSON 解析、属性转换、store update payload 构造从 TSX 中移出。
- (verified) `StructuredAttributeEditor` 不接触 graph store，只向父级 NodeEditor draft 回传属性对象。
- (verified) 新增 `test-editor-drafts.mjs`，覆盖 edge/node draft、payload 不含 groupId、属性对象转换。

**验证结果：**
- `cd frontend && npm run test:editors`：PASS。
- `cd frontend && npx eslint components/graph/editors/EdgeEditor.tsx components/graph/editors/NodeEditor.tsx components/graph/editors/StructuredAttributeEditor.tsx components/graph/editors/editorDrafts.ts`：PASS。
- `cd frontend && npm run check:phase2`：PASS。
- `cd frontend && npm run build`：PASS。
- `git diff --check`：PASS。
- `cd frontend && npm run lint`：FAIL，仍为历史 lint 债务；当前为 `145 errors / 92 warnings`，本轮触达编辑器文件不在失败列表。

**更新了 CODEBASE.md：**
- §1/§2 更新 `test:editors`、`check:phase2` 和编辑器文件树。
- §4 增加 `editorDrafts.ts`、`EdgeEditor.tsx`、`NodeEditor.tsx`、`StructuredAttributeEditor.tsx`、`test-editor-drafts.mjs` 模块说明。
- §5 增加编辑器 draft/helper 和 `NodeEditorForm.handleSave()` 算法步骤。
- §6 增加 F-011：右侧编辑器草稿保存。
- §9 把 EdgeEditor 输入即写 store 和 NodeEditor 直接写 groupId 两项风险标为 FIXED，并记录后续 feature pack 迁移风险。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/components/graph/editors/editorDrafts.ts` | 新增 | 深度完整 | 1 | 编辑器纯 draft/model helper；明确 `buildNodeUpdate()` 不写 `groupId` |
| `frontend/components/graph/editors/EdgeEditor.tsx` | PENDING | 深度完整 | 1 | 删除输入即写 store effect，改为本地 draft + 显式保存 |
| `frontend/components/graph/editors/NodeEditor.tsx` | PENDING | 深度完整 | 1 | 外层选择数据、内层持 draft；membership 走 group operations |
| `frontend/components/graph/editors/StructuredAttributeEditor.tsx` | PENDING | 深度完整 | 1 | 只回传父级 draft；无 graph store 依赖 |
| `frontend/scripts/test-editor-drafts.mjs` | 新增 | 深度完整 | 1 | 编辑器 draft 运行时测试，已纳入 `check:phase2` |
| `frontend/package.json` | 深度完整 | 深度完整 | 7 | 新增 `test:editors`，`check:phase2` 纳入编辑器测试 |
| `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 7 | Phase 2B 增加编辑入口收敛完成项 |
| `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 7 | 增加编辑入口任务、验证记录和暂缓迁移项 |
| `VALIDATION_RESULTS.md` | 深度完整 | 深度完整 | 6 | 新增 Phase 2B Editor Entry Convergence 验证记录 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 9 | 同步编辑器模块、函数、数据流、风险状态 |

**下一轮计划：**
- Phase 2B 后续继续收敛旧 store 的语义写入口，优先处理节点字段/关系谓词与右侧 inspector 的 command/use-case adapter；随后进入 history patch 化或 ReactFlow adapter 拆分。

## [SYNC] 2026-04-29 16:55 — Phase 2B Feature Model 边界迁移

### A. SYNC 范围声明

**触发任务：** 用户要求继续开发；本轮把上一批编辑器 draft/model helper 从旧 UI 目录迁到目标架构 `features/ontology-canvas/model`，并增加架构边界检查，避免 model 层再被 React/UI/store 污染。

**直接变更文件：**
- `frontend/features/ontology-canvas/model/inspector/editorDrafts.ts`
- `frontend/features/ontology-canvas/model/inspector/index.ts`
- `frontend/features/ontology-canvas/model/index.ts`
- `frontend/features/ontology-canvas/index.ts`
- `frontend/components/graph/editors/EdgeEditor.tsx`
- `frontend/components/graph/editors/NodeEditor.tsx`
- `frontend/components/graph/editors/StructuredAttributeEditor.tsx`
- `frontend/scripts/check-architecture-boundaries.mjs`
- `frontend/scripts/test-editor-drafts.mjs`
- `frontend/package.json`
- `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md`
- `OPTIMIZATION_TODO_2026-04-29.zh-CN.md`
- `VALIDATION_RESULTS.md`
- `CODEBASE.md`
- `ITERATION_LOG.md`

**预计连带影响：**
- 旧 `components/graph/editors/editorDrafts.ts` 应删除或停止作为有效实现，避免旧实现继续残留。
- `features/ontology-canvas/model` 只能依赖类型/纯函数，禁止依赖 React、Zustand、UI component、CSS、fetch。
- 现有编辑器行为保持不变：仍是 draft + explicit save，只是 model/helper 所在层级变正确。

### C. SYNC 结果

**关键发现与修复：**
- (verified) 旧 `components/graph/editors/editorDrafts.ts` 已删除，不再保留 UI 目录下的业务 helper 实现。
- (verified) 新增 `features/ontology-canvas/index.ts`、`model/index.ts`、`model/inspector/index.ts`，建立 feature/model 公开出口。
- (verified) `editorDrafts.ts` 已迁到 `features/ontology-canvas/model/inspector/editorDrafts.ts`。
- (verified) `EdgeEditor`、`NodeEditor`、`StructuredAttributeEditor` 已改为从 `@/features/ontology-canvas` 导入 model helper。
- (verified) `test-editor-drafts.mjs` 已改为加载 feature model 路径。
- (verified) `check-architecture-boundaries.mjs` 新增 `features/ontology-canvas/model` 规则，禁止 model 依赖 React、ReactFlow、Zustand、Next、UI/components、hooks、services、stores、fetch、CSS 和 feature 内 `ui/blocks/adapters`。

**验证结果：**
- `cd frontend && npm run check:architecture`：PASS，检查 `domain/ontology` 16 个文件、`features/ontology-canvas/model` 3 个文件。
- `rg -n "components/graph/editors/editorDrafts|from './editorDrafts'|from \"./editorDrafts\"" frontend`：PASS，旧路径/旧相对导入已清理。
- `cd frontend && npm run test:editors`：PASS。
- `cd frontend && npx eslint components/graph/editors/EdgeEditor.tsx components/graph/editors/NodeEditor.tsx components/graph/editors/StructuredAttributeEditor.tsx features/ontology-canvas/model/inspector/editorDrafts.ts features/ontology-canvas/model/inspector/index.ts features/ontology-canvas/model/index.ts features/ontology-canvas/index.ts scripts/check-architecture-boundaries.mjs`：PASS。
- `cd frontend && npm run check:phase2`：PASS。
- `cd frontend && npm run build`：PASS。
- `git diff --check`：PASS。
- `cd frontend && npm run lint`：FAIL，仍为历史 lint 债务；当前为 `145 errors / 92 warnings`。

**更新了 CODEBASE.md：**
- §2 增加 `frontend/features/ontology-canvas` 文件树，并移除旧 `components/graph/editors/editorDrafts.ts` 当前实现。
- §4 增加 feature/model/index/inspector/editorDrafts 模块说明，并更新编辑器依赖说明。
- §5 更新 `check-architecture-boundaries.mjs` 算法步骤，记录新增 feature model 规则。
- §9 调整 legacy editor 风险：model helper 已迁到 feature，剩余风险是 UI/blocks 仍在旧目录并直接接 store。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/features/ontology-canvas/index.ts` | 新增 | 深度完整 | 1 | Feature 公开出口，当前导出 model |
| `frontend/features/ontology-canvas/model/index.ts` | 新增 | 深度完整 | 1 | Feature model 公开出口 |
| `frontend/features/ontology-canvas/model/inspector/index.ts` | 新增 | 深度完整 | 1 | Inspector model 公开出口 |
| `frontend/features/ontology-canvas/model/inspector/editorDrafts.ts` | 新增 | 深度完整 | 1 | 从旧 UI 目录迁入的编辑器 draft/model helper |
| `frontend/components/graph/editors/editorDrafts.ts` | 深度完整 | 删除 | 2 | 已删除旧 UI 目录下的 helper 实现，避免残留双实现 |
| `frontend/components/graph/editors/EdgeEditor.tsx` | 深度完整 | 深度完整 | 2 | 导入改为 feature 公开出口，行为不变 |
| `frontend/components/graph/editors/NodeEditor.tsx` | 深度完整 | 深度完整 | 2 | 导入改为 feature 公开出口，行为不变 |
| `frontend/components/graph/editors/StructuredAttributeEditor.tsx` | 深度完整 | 深度完整 | 2 | 导入改为 feature 公开出口，行为不变 |
| `frontend/scripts/check-architecture-boundaries.mjs` | 深度完整 | 深度完整 | 2 | 新增 feature model UI/store 独立性检查 |
| `frontend/scripts/test-editor-drafts.mjs` | 深度完整 | 深度完整 | 2 | 测试加载路径改为 feature model |
| `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 8 | 记录 feature model 边界迁移完成 |
| `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 8 | 增加 feature model 任务和验证记录 |
| `VALIDATION_RESULTS.md` | 深度完整 | 深度完整 | 7 | 新增 Phase 2B Feature Model Boundary Migration 验证记录 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 10 | 同步 feature model 边界、模块、风险和边界检查算法 |

**下一轮计划：**
- 继续 Phase 2B：将右侧 inspector 的“保存动作”再往 feature model/use-case 收敛，优先新增 legacy graph inspector use-cases 或 command adapter，让 TSX 只负责接线和渲染。

## [SYNC] 2026-04-29 17:30 — Phase 2B Inspector Save Plan 收敛

### A. SYNC 范围声明

**触发任务：** 用户看到 lint error 从 155 降到 145，要求继续优化，并强调要及时清理旧实现。

**直接变更文件：**
- `frontend/features/ontology-canvas/model/inspector/savePlans.ts`
- `frontend/features/ontology-canvas/model/inspector/index.ts`
- `frontend/components/graph/editors/EdgeEditor.tsx`
- `frontend/components/graph/editors/NodeEditor.tsx`
- `frontend/scripts/test-editor-drafts.mjs`
- `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md`
- `OPTIMIZATION_TODO_2026-04-29.zh-CN.md`
- `VALIDATION_RESULTS.md`
- `CODEBASE.md`
- `ITERATION_LOG.md`

**预计连带影响：**
- `EdgeEditor` 不再自己组装 edge update payload，只执行 feature model 返回的 save plan。
- `NodeEditor` 不再自己做 node validation、membership diff 和 update payload 构造，只执行 feature model 返回的 save plan。
- 旧 UI 层不新增 helper，不恢复已删除的 `components/graph/editors/editorDrafts.ts`。

### C. SYNC 结果

**关键发现与修复：**
- (verified) 新增 `features/ontology-canvas/model/inspector/savePlans.ts`，把 Edge/Node 保存决策从 TSX 移入 feature model。
- (verified) `EdgeEditor` 不再直接调用 `buildEdgeUpdate()` 拼 payload，而是执行 `createEdgeInspectorSavePlan()`。
- (verified) `NodeEditor` 不再自己做 validation/membership diff/update payload 拼装，而是执行 `createNodeInspectorSavePlan()`。
- (verified) `createNodeInspectorSavePlan()` 返回的普通字段 update 不包含 `groupId`，membership 单独以 none/move/remove plan 表达。

**验证结果：**
- `cd frontend && npm run test:editors`：PASS。
- `cd frontend && npx eslint components/graph/editors/EdgeEditor.tsx components/graph/editors/NodeEditor.tsx components/graph/editors/StructuredAttributeEditor.tsx features/ontology-canvas/model/inspector/editorDrafts.ts features/ontology-canvas/model/inspector/savePlans.ts features/ontology-canvas/model/inspector/index.ts features/ontology-canvas/model/index.ts features/ontology-canvas/index.ts scripts/check-architecture-boundaries.mjs scripts/test-editor-drafts.mjs`：PASS。
- `cd frontend && npm run check:phase2`：PASS。
- `cd frontend && npm run build`：PASS。
- `git diff --check`：PASS。
- `cd frontend && npm run lint`：FAIL，仍为历史债务；当时基线为 `145 errors / 92 warnings`。

**更新了 CODEBASE.md：**
- §4 增加 `savePlans.ts` 模块说明。
- §5 增加 `createEdgeInspectorSavePlan()`、`createNodeMembershipPlan()`、`createNodeInspectorSavePlan()`。
- §6 更新 F-011，让右侧编辑器保存链路经过 save plan。
- §9 将 Inspector 保存决策从 TSX 移走列为已修复进展，剩余风险是 UI/blocks 仍在旧目录。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/features/ontology-canvas/model/inspector/savePlans.ts` | 新增 | 深度完整 | 1 | Inspector 保存计划，覆盖 edge/node 保存、校验、membership diff |
| `frontend/features/ontology-canvas/model/inspector/index.ts` | 深度完整 | 深度完整 | 2 | 新增 savePlans export |
| `frontend/components/graph/editors/EdgeEditor.tsx` | 深度完整 | 深度完整 | 3 | 保存改为执行 feature model save plan |
| `frontend/components/graph/editors/NodeEditor.tsx` | 深度完整 | 深度完整 | 3 | 保存改为执行 update + membership plan |
| `frontend/scripts/test-editor-drafts.mjs` | 深度完整 | 深度完整 | 3 | 新增 save plan runtime assertions |
| `CODEBASE.md` | 深度完整 | 深度完整 | 11 | 同步 save plan 模块、函数、数据流和风险 |

**下一轮计划：**
- 清理画布交互 hooks 里的旧实现：节点展开重复状态、快捷键重复删边、清空画布 any 遍历，以及 ReactFlow node adapter 的 unsafe typing。

## [SYNC] 2026-04-29 18:05 — Phase 2C Canvas Interaction 旧实现清理

### A. SYNC 范围声明

**触发任务：** 用户要求继续优化，并特别强调旧实现要及时清理。

**目标文件：**
- `frontend/components/graph/core/hooks/useNodeExpansion.ts`（原因：仍保留本地展开状态 + effect 同步 store，属于 UI hook 重复状态）
- `frontend/components/graph/core/hooks/useKeyboardShortcuts.ts`（原因：仍手动删除节点关联边，与 store/domain graph consistency 命令重复）
- `frontend/components/graph/core/hooks/useViewportControls.ts`（原因：仍用 `any` 遍历节点/边，且清空画布路径可复用 store consistency）
- `frontend/features/ontology-canvas/model/interactions/*`（原因：新增纯模型计划，承接展开/清理的业务判断）
- `frontend/scripts/test-editor-drafts.mjs`（原因：临时承载 feature model runtime 测试，避免新增逻辑无验证）

**本轮想弄清楚：**
- 节点展开是否可以不在 hook 内保存重复状态，只从 store/node data 派生。
- 快捷键删除是否可以移除旧的“先删关联边再删节点”双逻辑，统一信任 `deleteNode()` 的一致性清理。
- 新增 interaction model 是否能保持 feature model 不依赖 React、ReactFlow、Zustand、UI 和 store。

### C. SYNC 结果

**关键发现与修复：**
- (verified) 新增 `features/ontology-canvas/model/interactions/nodeExpansion.ts`，承接展开状态解析、展开/折叠 patch、自定义展开尺寸判定。
- (verified) 新增 `features/ontology-canvas/model/interactions/canvasDeletion.ts`，承接选中删除和清空画布计划。
- (verified) `useNodeExpansion` 删除本地 `useState/useEffect` 同步 store 的旧实现，改为从 store/node data 派生状态。
- (verified) `useKeyboardShortcuts` 删除手动遍历 incident edges 的旧实现；incident edge 清理由 `deleteNode()` 内的 domain consistency 规则负责。
- (verified) `useViewportControls` 复用 clear plan，不再用 `any` 遍历节点/边。
- (verified) `NoteNode` 的自定义展开尺寸判定复用 feature model，并清理 React compiler memoization error。
- (verified) `nodeSyncUtils` 移除本文件内 `any`，用显式 helper 表达 `_hiddenByConversion` 与 parent group。
- (verified) `CustomEdge` inline label 更新修正为写 `{ label, data }`，不再把 data 字段错误铺到 edge 顶层。

**验证结果：**
- `cd frontend && npm run test:canvas:interactions`：PASS。
- `cd frontend && npm run check:architecture`：PASS，检查 `domain/ontology` 16 个文件、`features/ontology-canvas/model` 7 个文件。
- `cd frontend && npx eslint ...本轮触达文件...`：PASS，无 lint error。
- `cd frontend && npm run check:phase2`：PASS。
- `cd frontend && npm run build`：PASS。
- `git diff --check`：PASS。
- `cd frontend && npm run lint -- --quiet`：FAIL，但错误从 `145` 降到 `122`。

**更新了 CODEBASE.md：**
- §2 增加 `interactions/*` 和 `test-canvas-interactions.mjs`。
- §4 增加 interaction model 模块说明，并更新 `nodeSyncUtils` 注意事项。
- §5 增加展开 patch、删除 plan 相关函数。
- §6 新增 F-012：画布快捷键删除和节点展开。
- §9 将节点展开重复状态、快捷键重复删边、nodeSync unsafe typing 标为 FIXED。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/features/ontology-canvas/model/interactions/index.ts` | 新增 | 深度完整 | 1 | 画布交互 model 公开出口 |
| `frontend/features/ontology-canvas/model/interactions/nodeExpansion.ts` | 新增 | 深度完整 | 1 | 展开/折叠 patch 与自定义展开尺寸判定 |
| `frontend/features/ontology-canvas/model/interactions/canvasDeletion.ts` | 新增 | 深度完整 | 1 | 选中删除/清空画布计划，避免重复删 incident edges |
| `frontend/components/graph/core/hooks/useNodeExpansion.ts` | PENDING | 深度完整 | 1 | 删除本地重复状态和 effect 同步 |
| `frontend/components/graph/core/hooks/useKeyboardShortcuts.ts` | PENDING | 深度完整 | 1 | 删除手动 incident edge 清理 |
| `frontend/components/graph/core/hooks/useViewportControls.ts` | PENDING | 深度完整 | 1 | 清空画布使用 deletion plan |
| `frontend/components/graph/core/hooks/useEdgeHandling.ts` | PENDING | 深度完整 | 1 | 去掉无用导入和 `any` edge payload |
| `frontend/components/graph/nodes/NoteNode.tsx` | PENDING | 深度完整 | 1 | 展开尺寸判定复用 feature model，修复 memoization lint error |
| `frontend/components/graph/core/nodeSyncUtils.ts` | 深度完整 | 深度完整 | 3 | 移除本文件内 `any`，明确 adapter helper |
| `frontend/scripts/test-canvas-interactions.mjs` | 新增 | 深度完整 | 1 | 交互模型 runtime assertions |
| `frontend/package.json` | 深度完整 | 深度完整 | 8 | 新增 `test:canvas:interactions` 并纳入 `check:phase2` |
| `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 9 | 增加 save plan 和 Phase 2C 进展 |
| `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 9 | 增加 Phase 2C todo 与验证记录 |
| `VALIDATION_RESULTS.md` | 深度完整 | 深度完整 | 8 | 新增 Phase 2C 验证记录 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 12 | 同步 Phase 2C 模块、函数、数据流和风险 |

**下一轮计划：**
- 继续按“旧实现清理 + lint 降噪”推进。优先候选：`LayoutControl.tsx` 的 20 个 `any`、`services/layout/types` 的算法 DTO 类型、或 `stores/graph/nodes/*` 的 store set/get 类型收敛。

## [SYNC] 2026-04-29 18:45 — Phase 2C LayoutControl 控制层收敛

### A. SYNC 范围声明

**触发任务：** 用户要求继续重构。

**目标文件：**
- `frontend/components/graph/controls/LayoutControl.tsx`（原因：当前全量 lint 中单文件约 20 个 `any`，且 UI 控制层直接拼布局 options、读取 store、调用 layout manager）
- `frontend/services/layout/types/layoutTypes.ts`（原因：LayoutControl 的 options/result 类型来源，当前仍有 `any`）
- `frontend/services/layout/LayoutManager.ts`（原因：确认 executeLayout/result/options 契约，避免误改调用）
- `frontend/features/ontology-canvas/model/*`（原因：如需要，新增控制层纯 helper，继续保持 feature model 不依赖 UI/store）

**本轮想弄清楚：**
- `LayoutControl` 的 `any` 是否只是类型缺失，还是隐藏了 UI 控制层和 layout options 拼装逻辑混杂。
- 是否能把布局配置/执行参数构造抽到 feature model，UI 只负责选择节点、触发动作和展示状态。
- 能否在不改布局算法行为的前提下，继续降低 lint error 并清理旧控制层写法。

### C. SYNC 结果

**关键发现与修复：**
- (verified) `LayoutControl.tsx` 的 `any` 不只是类型缺失，还覆盖了策略 options、node update patch、edge handle patch、group child 筛选等控制层逻辑。
- (verified) 新增 `features/ontology-canvas/model/layout/layoutControl.ts`，把布局 options、group 判断、直接子节点筛选、node/edge patch 生成从 TSX 移到 feature model。
- (verified) `LayoutControl.tsx` 改为调用 feature model helper；全画布布局和群组布局行为保持原样，仍由 `LayoutManager` 和 `EdgeOptimizer` 执行。
- (verified) `services/layout/types/layoutTypes.ts` 已收紧 `LayoutNodePosition`、`LayoutEdgeUpdate`、`LayoutProgress`、`LayoutOptions`，删除开放 `[key:string]: any`。
- (verified) 旧重复 `frontend/types/layout/node.ts`、`edge.ts`、`strategy.ts` 已移除公开 `any`。

**验证结果：**
- `cd frontend && npm run test:layout:control`：PASS。
- `cd frontend && npm run check:architecture`：PASS，检查 `domain/ontology` 16 个文件、`features/ontology-canvas/model` 9 个文件。
- `cd frontend && npx eslint ...本轮触达文件...`：PASS。
- `cd frontend && npm run check:phase2`：PASS。
- `cd frontend && npm run build`：PASS。
- `git diff --check`：PASS。
- `cd frontend && npm run lint -- --quiet`：FAIL，但错误从 `122` 降到 `94`。

**更新了 CODEBASE.md：**
- §2 增加 `features/ontology-canvas/model/layout/*` 和 `test-layout-control-model.mjs`。
- §4 增加 `layoutControl.ts`、`LayoutControl.tsx` 和旧 `types/layout/*` 说明。
- §5 增加 `createCanvasLayoutOptions()`、`createGroupLayoutOptions()`、`createLayoutNodeUpdate()`、`createLayoutEdgeUpdate()`。
- §6 新增 F-013：LayoutControl 触发布局并应用结果。
- §9 将 LayoutControl 控制层 patch 拼装和 `any` 标为 FIXED。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/components/graph/controls/LayoutControl.tsx` | PENDING | 深度完整 | 1 | 读取全文件，确认布局触发、群组布局、边优化和旧 any patch 拼装 |
| `frontend/features/ontology-canvas/model/layout/index.ts` | 新增 | 深度完整 | 1 | 布局控制 model 公开出口 |
| `frontend/features/ontology-canvas/model/layout/layoutControl.ts` | 新增 | 深度完整 | 1 | 布局 options、group child 筛选、node/edge patch helper |
| `frontend/services/layout/types/layoutTypes.ts` | 深度完整 | 深度完整 | 2 | 收紧 LayoutOptions/LayoutResult 类型，移除开放 any |
| `frontend/types/layout/node.ts` | PENDING | 深度完整 | 1 | 旧重复布局节点类型，data 改为 Record |
| `frontend/types/layout/edge.ts` | PENDING | 深度完整 | 1 | 旧重复布局边类型，移除未用 import，data 改为 Record |
| `frontend/types/layout/strategy.ts` | PENDING | 深度完整 | 1 | 旧重复布局策略类型，移除开放 any |
| `frontend/scripts/test-layout-control-model.mjs` | 新增 | 深度完整 | 1 | 运行时断言 layout control model helper |
| `frontend/package.json` | 深度完整 | 深度完整 | 9 | 新增 `test:layout:control` 并纳入 `check:phase2` |
| `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 10 | 增加 LayoutControl 收敛进展与 lint 基线 |
| `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 10 | 增加 LayoutControl todo 与验证记录 |
| `VALIDATION_RESULTS.md` | 深度完整 | 深度完整 | 9 | 新增 Phase 2C LayoutControl 验证记录 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 13 | 同步布局控制模块、函数、数据流和风险 |

**下一轮计划：**
- 继续清理布局算法内部旧类型：优先 `ELKConfigBuilder.ts`（当前约 12 个 `any`）和 `ELKGraphConverter.ts`（约 4 个 `any`），但需要更谨慎，因为它们属于算法层，应该顺手设计 ELK options 类型/DTO，而不是机械替换。

## [SYNC] 2026-04-30 09:20 — Phase 2C ELK 配置与转换器类型收敛

### A. SYNC 范围声明

**触发任务：** 用户要求保持主线继续执行。

**目标文件：**
- `frontend/services/layout/utils/ELKConfigBuilder.ts`（原因：算法配置构造器仍保留大量 `any`，是当前 lint 最大集中点之一）
- `frontend/services/layout/utils/ELKGraphConverter.ts`（原因：ELK graph 转换仍有 `Record<string, any>` 和 UI 展开尺寸读取 `any`）
- `frontend/services/layout/types/layoutTypes.ts`（原因：需要确认 `elkOptions` 与 result patch 类型是否足够支撑配置 builder/converter）
- `frontend/config/elk-algorithm.ts`（原因：ELKConfigBuilder 的配置来源，需确认配置值类型）
- `frontend/scripts/*`（原因：如新增轻量测试，需要复用现有 TypeScript loader）

**本轮想弄清楚：**
- ELK options 应该用什么最小类型表达，既不让算法配置继续 `any`，又不在当前阶段过度设计完整 ELK schema。
- `ELKConfigBuilder.mergeConfig()` 是否能保持原行为，同时把输入输出收紧为 `Record<string, string | number | boolean>`。
- `ELKGraphConverter` 中读取 `customExpandedSize` 的旧 UI 字段是否能用类型守卫替代 `any`。

### C. SYNC 结果

**关键发现与修复：**
- (verified) `ELKLayoutOptions = Record<string, string | number | boolean>` 已加入布局类型契约，`LayoutOptions.elkOptions` 不再是开放 `Record<string, unknown>`。
- (verified) `ELKConfigBuilder` 的所有配置构造函数和 `mergeConfig()` 已返回明确 ELK option 类型，保留用户配置覆盖基础配置的原行为。
- (verified) `ELKGraphConverter` 删除未使用的旧 `nodeMap` 参数链路，`buildChildren()` 只接收当前层级和全量节点。
- (verified) `ELKGraphConverter.getDefaultWidth/getDefaultHeight()` 读取展开节点尺寸时不再使用 `any`，改为按 `BlockEnum.NODE` 访问 `Node.customExpandedSize`。
- (verified) 新增 `ELKRuntime.ts` 作为 `elkjs` 动态模块适配器，两个 ELK strategy 不再直接持有动态模块 `any`。
- (verified) `ELKLayoutStrategy` 与 `ELKGroupLayoutStrategy` 从构造期加载 ELK 改为执行布局时懒加载，修复构建/静态生成阶段触发 ELK 初始化的副作用。
- (verified) `ELKGroupLayoutStrategy.extractSubgraph()` 改为先构建 `subgraphNodeIds: Set<string>`，再过滤边，删除旧的 O(E*N) `some()` 扫描。

**验证结果：**
- `cd frontend && npm run test:layout:elk`：PASS。
- `cd frontend && npx eslint services/layout/utils/ELKConfigBuilder.ts services/layout/utils/ELKGraphConverter.ts services/layout/utils/ELKRuntime.ts services/layout/strategies/ELKLayoutStrategy.ts services/layout/strategies/ELKGroupLayoutStrategy.ts services/layout/types/layoutTypes.ts types/layout/strategy.ts config/elk-algorithm.ts scripts/test-elk-layout-model.mjs --quiet`：PASS。
- `cd frontend && node --input-type=module -e "...load ELKRuntime.ts; await createELKEngine()"`：PASS，确认 runtime 返回的 engine 有 `layout` 函数。
- `cd frontend && npm run check:phase2`：PASS。
- `cd frontend && npm run build`：PASS。首次构建暴露 ELK 构造期加载错误；改为懒加载后重跑通过，且无 ELK load error。
- `git diff --check`：PASS。
- `cd frontend && npm run lint -- --quiet`：FAIL，但错误从 `94` 降到 `70`。

**更新了 CODEBASE.md：**
- §2 增加 `test-elk-layout-model.mjs` 与 `ELKRuntime.ts`。
- §4 更新 ELK strategy/converter/config builder 模块说明，新增 ELK runtime 适配器说明。
- §5 更新 ELK strategy applyLayout、ELKGraphConverter、ELKConfigBuilder 签名和算法步骤。
- §6 更新 F-013，让布局执行链路明确为按需加载 ELK。
- §9 将 ELK constructor-time loading、ELK option any、ELKGraphConverter unused nodeMap、ELKGroupLayoutStrategy O(E*N) 边过滤列为已修复或降级风险。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/services/layout/utils/ELKConfigBuilder.ts` | PENDING | 深度完整 | 1 | ELK option 构造器，移除所有公开 any 返回值 |
| `frontend/services/layout/utils/ELKGraphConverter.ts` | PENDING | 深度完整 | 1 | ELK graph 转换器，删除旧 nodeMap，收紧 layoutOptions 和展开尺寸读取 |
| `frontend/services/layout/utils/ELKRuntime.ts` | 新增 | 深度完整 | 1 | elkjs 动态模块适配与 engine 创建 |
| `frontend/services/layout/utils/index.ts` | 深度完整 | 深度完整 | 2 | 新增 ELK runtime export |
| `frontend/services/layout/strategies/ELKLayoutStrategy.ts` | PENDING | 深度完整 | 1 | ELK 实例从构造期加载改为 applyLayout 懒加载 |
| `frontend/services/layout/strategies/ELKGroupLayoutStrategy.ts` | PENDING | 深度完整 | 1 | 去掉动态模块 any，收敛 groupId 访问和 subgraph edge 过滤 |
| `frontend/services/layout/types/layoutTypes.ts` | 深度完整 | 深度完整 | 3 | 新增 ELKLayoutDirection/ELKLayoutOptions |
| `frontend/types/layout/strategy.ts` | 深度完整 | 深度完整 | 2 | 旧重复 layout strategy 类型同步 ELK options 契约 |
| `frontend/scripts/test-elk-layout-model.mjs` | 新增 | 深度完整 | 1 | ELK 配置、转换、展开尺寸、坐标提取 runtime assertions |
| `frontend/package.json` | 深度完整 | 深度完整 | 10 | 新增 `test:layout:elk` 并纳入 `check:phase2` |
| `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 11 | 增加 ELK 收敛进展与 lint 基线 |
| `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 11 | 增加 ELK todo 与验证记录 |
| `VALIDATION_RESULTS.md` | 深度完整 | 深度完整 | 10 | 新增 Phase 2C ELK 验证记录 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 14 | 同步 ELK runtime、配置、转换、策略与风险 |

**下一轮计划：**
- 继续按主线处理算法/导入链路，优先候选是 Mermaid parser/converter/import dialog 的类型与旧 UI 耦合清理；这是下一批 lint error 集中区，也直接关联“导入图 -> 本体/布局”的主流程。

## [SYNC] 2026-04-30 10:35 — Mermaid 临时导入功能下线与隔离

### A. SYNC 范围声明

**触发任务：** 用户明确 Mermaid 导入只是临时功能，当前产品定位应回到本体图，不应继续把 Mermaid 当作核心导入语言；要求先不做导入，后续按新需求重新设计。

**目标文件：**
- `frontend/components/graph/import/MermaidImportDialog.tsx`（原因：当前 UI 导入入口，需判断是否删除或下线）
- `frontend/hooks/useMermaidImport.ts`（原因：导入 hook 连接 UI、服务、store，是活跃导入链路）
- `frontend/services/mermaid/*`（原因：旧 Mermaid parser/converter/layout adapter 服务，需从主系统隔离或删除）
- `frontend/components/graph/core/GraphPageContent.tsx` / 控制入口候选（原因：可能引用导入 dialog 或 hook）
- `frontend/package.json`（原因：若删除 Mermaid 运行时代码，需要确认依赖和脚本是否仍需要）
- 架构与同步文档（原因：本轮改变产品边界和功能范围）

**本轮想弄清楚：**
- Mermaid 导入是否仍挂在可见 UI 或活跃 runtime import 链路中。
- 删除旧 Mermaid 文件是否会破坏构建、阶段检查或现有数据。
- 是否可以先不引入新 schema，仅保留“未来本体 schema/import DSL 待设计”的架构边界。

### C. SYNC 结果

**关键发现与修复：**
- (verified) Mermaid 仍有可见 UI 入口：`Toolbar.tsx` import `MermaidImportDialog` 并渲染“导入 Mermaid”按钮。
- (verified) Mermaid 前端链路包含 dialog/file upload/text input、`useMermaidImport`、`services/mermaid/*`、两个临时测试脚本和 `mermaid` npm 依赖。
- (verified) 后端存在未挂载到当前 `app.py` 的 Mermaid controller/service/test，属于遗留临时能力。
- (verified) 本轮已删除前端 Mermaid UI/hook/service/test、后端 Mermaid controller/service/test，并从 `package.json/package-lock.json` 移除 `mermaid` 依赖。
- (verified) `Toolbar.tsx` 已移除 Mermaid 导入按钮和 dialog 状态；活跃 UI 不再暴露导入入口。
- (verified) 架构文档已改为“导入协议待设计”：后续如需导入，应先定义 `OntologyImportDraft`、schema/version、validation warnings 和 command apply 边界，再选择 JSON/RDF/OWL/Turtle/DSL 或兼容 Mermaid。

**验证结果：**
- `rg "Mermaid|mermaid|useMermaidImport|MermaidImport" frontend backend ...`：PASS，活跃前后端代码无 Mermaid 引用。
- `rg '"mermaid"|@mermaid-js' frontend/package.json frontend/package-lock.json`：PASS，前端依赖和 lockfile 无 Mermaid 包。
- `cd frontend && npx eslint components/graph/controls/Toolbar.tsx --quiet`：PASS。
- `cd frontend && npm run check:phase2`：PASS。
- `python -m compileall backend`：PASS。该命令扫描了 `backend/venv`，输出较多但退出码为 0。
- `cd frontend && npm run build`：PASS。
- `git diff --check`：PASS。
- `cd frontend && npm run lint -- --quiet`：FAIL，但错误从 `70` 降到 `61`。

**更新了 CODEBASE.md：**
- §1 移除 Mermaid 依赖描述。
- §2 将前后端 Mermaid 文件标为已删除。
- §4 将 `services/mermaid/*`、Mermaid UI/hook、后端 Mermaid 文件标为已删除。
- §5 将 Mermaid parser/converter/import service 函数标为已删除。
- §6 将 F-005 改为“导入协议入口待设计”。
- §9 将 Mermaid 大 service、parser/render、converter 性能风险收敛为已删除/已修复项。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/components/graph/controls/Toolbar.tsx` | PENDING | 深度完整 | 1 | 删除 Mermaid 导入按钮、dialog 状态和 import |
| `frontend/components/graph/controls/MermaidImportControl.tsx` | PENDING | 已删除 | 1 | 临时 Mermaid 导入控件已从主系统移除 |
| `frontend/components/graph/import/MermaidImportDialog.tsx` | PENDING | 已删除 | 1 | 临时 Mermaid dialog 已删除 |
| `frontend/components/graph/import/MermaidFileUpload.tsx` | PENDING | 已删除 | 1 | 临时 Mermaid 文件上传已删除 |
| `frontend/components/graph/import/MermaidTextInput.tsx` | PENDING | 已删除 | 1 | 临时 Mermaid 文本输入已删除 |
| `frontend/hooks/useMermaidImport.ts` | PENDING | 已删除 | 1 | 临时 Mermaid hook 已删除 |
| `frontend/services/mermaid/MermaidParser.ts` | 深度完整 | 已删除 | 2 | 临时 Mermaid parser 已从主系统移除 |
| `frontend/services/mermaid/MermaidConverter.ts` | 深度完整 | 已删除 | 2 | 临时 Mermaid converter 已从主系统移除 |
| `frontend/services/mermaid/MermaidConverterService.ts` | 深度完整 | 已删除 | 2 | 临时大 service 已删除，避免 store/layout/fetch 耦合继续存在 |
| `frontend/services/mermaid/MermaidLayoutAdapter.ts` | 深度完整 | 已删除 | 3 | 临时 Mermaid layout adapter 已删除 |
| `frontend/services/mermaid/types.ts` | 深度完整 | 已删除 | 2 | Mermaid 类型契约已删除 |
| `frontend/test-mermaid.ts` | PENDING | 已删除 | 1 | 临时测试脚本已删除 |
| `frontend/test-mermaid-parser.ts` | PENDING | 已删除 | 1 | 临时测试脚本已删除 |
| `backend/controllers/mermaid.py` | PENDING | 已删除 | 1 | 未挂载 Mermaid API 控制器已删除 |
| `backend/services/graph/mermaid_converter.py` | PENDING | 已删除 | 1 | 后端临时 Mermaid converter 已删除 |
| `backend/test_mermaid_converter.py` | PENDING | 已删除 | 1 | 后端临时 Mermaid 测试脚本已删除 |
| `frontend/package.json` | 深度完整 | 深度完整 | 11 | 移除 `mermaid` 依赖 |
| `frontend/package-lock.json` | 浅读 | 浅读 | 2 | npm uninstall 自动移除 Mermaid 依赖树 |
| `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 12 | 导入协议改为暂缓/待设计 |
| `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 12 | 增加 Mermaid 下线任务和验证 |
| `VALIDATION_RESULTS.md` | 深度完整 | 深度完整 | 11 | 新增 Mermaid 下线验证记录 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 15 | 同步 Mermaid 删除、导入协议待设计和风险状态 |

**下一轮计划：**
- 回到本体画布主线，优先处理 store/model 中剩余 `any` 和 graph model 开放索引；这比重新做导入更接近当前“本体图真相源 + 画布运行态分离”的目标。

## [SYNC] 2026-04-30 11:09 — Mermaid 研究资料归档隔离

### A. SYNC 范围声明

**触发任务：** 活跃代码删除后，继续清理主项目视野里的历史 Mermaid 文档和示例，避免后续扫描时误判为当前导入方案。

**目标文件：**
- `项目文档/Mermaid_研究报告.md`（原因：历史研究文档，不应继续位于主文档区）
- `项目文档/Mermaid导入功能实现方案.md`（原因：旧导入方案已不代表当前架构）
- `项目文档/mermaid-examples/*`（原因：独立示例脚本不是当前系统能力）
- `项目文档/_archive/mermaid-import-legacy/README.md`（原因：给归档资料写明状态和边界）
- 架构与同步文档（原因：本轮改变文档归属和项目扫描结论）

**本轮想弄清楚：**
- 是否还有 Mermaid 资料散落在主文档区。
- 归档后是否仍能明确表达“当前不做导入，未来导入按本体协议重设”。

### C. SYNC 结果

**关键发现与修复：**
- (verified) `项目文档/` 下仍有 Mermaid 研究报告、导入方案和示例脚本；这些文件不参与 runtime，但会干扰架构判断。
- (verified) 已移动到 `项目文档/_archive/mermaid-import-legacy/`，并新增 README 标明“历史参考，不属于当前导入架构”。
- (verified) `CODEBASE.md`、`ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md`、`OPTIMIZATION_TODO_2026-04-29.zh-CN.md`、`VALIDATION_RESULTS.md` 已同步归档边界。

**验证结果：**
- `rg "Mermaid|mermaid|useMermaidImport|MermaidImport" frontend backend ...`：PASS，活跃前后端代码无 Mermaid 引用。
- `cd frontend && npm run check:phase2`：PASS。
- `cd frontend && npm run build`：PASS。
- `git diff --check`：PASS。
- `cd frontend && npm run lint -- --quiet`：FAIL，当前历史错误基线为 `61 errors`。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `项目文档/Mermaid_研究报告.md` | PENDING | 已归档 | 1 | 已移入 `_archive/mermaid-import-legacy/`，不作为当前方案 |
| `项目文档/Mermaid导入功能实现方案.md` | PENDING | 已归档 | 1 | 已移入 `_archive/mermaid-import-legacy/`，旧方案不代表当前架构 |
| `项目文档/mermaid-examples/*` | PENDING | 已归档 | 1 | 示例脚本已移入归档区 |
| `项目文档/_archive/mermaid-import-legacy/README.md` | PENDING | 深度完整 | 1 | 新增归档说明，声明未来导入需先定义本体导入契约 |
| `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 13 | 补充历史 Mermaid 资料归档状态 |
| `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 13 | 补充归档任务 |
| `VALIDATION_RESULTS.md` | 深度完整 | 深度完整 | 12 | 补充归档说明 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 16 | 同步项目文档归档位置和导入边界 |

**下一轮计划：**
- 继续回到 store/model 类型债务，优先收敛 `frontend/types/graph/models.ts` 和 `frontend/stores/graph/nodes/*` 的 `any`，把旧 graph runtime 类型逐步压到可迁移边界内。

## [SYNC] 2026-04-30 11:12 — Graph model 与 nodes store 类型收敛

### A. 本轮目标（阅读前声明）

**目标文件：**
- `frontend/types/graph/models.ts`（原因：旧 graph runtime 类型仍有开放 `any`，是 nodes/edges/canvas store lint 债务的源头）
- `frontend/stores/graph/nodes/types.ts`（原因：nodes operations 的 `set/get` 类型入口仍是 `any`）
- `frontend/stores/graph/nodes/index.ts`（原因：组合 nodes operations 时继续透传 `any`）
- `frontend/stores/graph/nodes/basicOperations.ts`（原因：基础节点增删改是旧实现核心路径，当前有 `any` 和 `prefer-const` 错误）
- `frontend/stores/graph/nodes/constraintOperations.ts`（原因：约束操作仍使用 `any`，且与节点 data 结构强相关）

**本轮想弄清楚：**
- 旧 `Node/Group/Edge` 类型能否用 `unknown` / `Record<string, unknown>` / 更具体字段替代 `any`，不破坏 ReactFlow 运行态。
- nodes operation 的 `set/get` 是否可以引入局部 store 类型，先消掉一批 lint，而不大改 Zustand store 总结构。
- 是否存在需要暂停沟通的行为风险：比如旧数据 JSON 包含自由字段、节点 data 结构太开放导致类型收窄会误删能力。

### A2. 追加目标（阅读前声明）

**目标文件：**
- `frontend/stores/graph/nodes/groupOperations.ts`（原因：剩余 nodes store 错误集中在 group 操作，且直接影响 Domain/Group 主线）
- `frontend/stores/graph/nodes/groupBoundaryOperations.ts`（原因：群组边界计算仍使用 `any` set/get/state）
- `frontend/stores/graph/nodes/conversionOperations.ts`（原因：转换旧实现大量 `any`，并包含隐藏节点/隐藏边的临时字段）

**本轮想弄清楚：**
- group 操作是否能复用本轮新增的 `GraphStoreSet/Get`，继续消除旧 `any`。
- conversion 里的 `_hiddenByConversion` / `_parentConvertedId` 是否能沉淀为显式遗留运行态字段，而不是继续靠 `any`。
- 是否存在旧转换行为需要保留但不应继续扩大使用的风险点。

### A3. 追加目标（阅读前声明）

**目标文件：**
- `frontend/stores/graph/edgesSlice.ts`（原因：边 store 的 `set/get` 仍是 `any`，和刚收敛的 nodes store 属于同一 graph runtime 层）
- `frontend/stores/graph/canvasViewSlice.ts`（原因：画布视图状态仍有 `any`，但应该是纯客户端 UI 状态）
- `frontend/utils/workspace/canvasSync.ts`（原因：workspace sync 仍使用 `any`，直接关联数据链路唯一和旧持久化边界）
- `frontend/services/storage/StorageManager.ts`（原因：storage data-layer adapter 有 `any`，属于数据出口边界）
- `frontend/lib/utils.ts`（原因：通用 className 工具有 `any`，可低风险收窄）

**本轮想弄清楚：**
- graph runtime 的边/视图 store 是否可以复用已有 `GraphStore` 类型，避免重复定义 set/get。
- workspace sync 是否只是类型债务，还是暴露了 data-layer 与 store 混杂的真实架构风险。
- storage manager 的 adapter 类型能否先收窄到 `unknown` 输入，不改变外部调用。

### A4. 追加目标（阅读前声明）

**目标文件：**
- `frontend/app/api/layout/route.ts`（原因：最后的 API route `any`，属于数据入口边界）
- `frontend/components/graph/ui/MarkdownRenderer.tsx`（原因：Markdown 渲染配置存在 `any`，属于 UI 渲染边界）
- `frontend/components/graph/__tests__/node-editor.test.tsx`（原因：测试 mock 仍有 `any`，影响 lint 收口）
- `frontend/components/workspace/sidebar/DeleteCanvasDialog.tsx`（原因：JSX 文本转义错误）
- `frontend/test-api.js`（原因：旧 CommonJS 测试脚本触发 lint；需判断保留或删除/改写）

**本轮想弄清楚：**
- 剩余错误是否可以在不改变业务行为的情况下全部收掉。
- `test-api.js` 是否是仍有价值的本地脚本；若只是旧临时脚本，应按“旧实现及时清理”的原则删除或隔离。

### C. SYNC 结果

**关键发现与修复：**
- (verified) 旧 graph runtime 的 lint error 主要来自 `any` 类型入口：graph model、nodes/edges/canvas view store、workspace sync、storage tree、layout API request。
- (verified) 已将旧 graph model 的 `any` 收敛为 `unknown` / `Record<string, unknown>`，nodes store 增加局部 `GraphStoreSet/Get`、record/boundary guard，edges/canvas view store 使用局部 typed set/get。
- (verified) conversion 的 `_hiddenByConversion` / `_parentConvertedId` 仍保留旧行为，但已显式为 legacy conversion hidden fields，不再通过 `any` 混入。
- (verified) `canvasSync` 已移除 graphData/viewport 的 `any` 断言；这只解决类型边界，data-layer 多路径保存风险仍保留在风险登记册中。
- (verified) `frontend/test-api.js` 未接入 npm scripts，且只是旧 CommonJS 临时 API 脚本；已删除。
- (verified) `npm run lint -- --quiet` 已从 `61 errors` 降到 `0 errors`。

**验证结果：**
- `cd frontend && npm run lint -- --quiet`：PASS，0 errors。
- `cd frontend && npm run lint`：PASS，0 errors / 41 warnings。
- `cd frontend && npm run build`：PASS。
- `cd frontend && npm run check:phase2`：PASS。
- `git diff --check`：PASS。

**更新了 CODEBASE.md：**
- §2 标记 `frontend/test-api.js` 已删除。
- §4 同步 graph model、nodes store、edges store、canvas view、workspace sync、storage manager、layout API 的类型收敛结果。
- §5/§6 保持既有主流程，补充 layout API request options 和 data-layer 边界说明。
- §8 将 graph model custom properties、viewport contract 更新为 `unknown`/typed viewport。
- §9 将 `canvasSync` viewport any 风险标为 FIXED，并将 graph model 风险从 `any` 调整为“开放 unknown 索引仍待拆分”。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/types/graph/models.ts` | 深度完整 | 深度完整 | 2 | `CommonNodeType` 默认 data、attributes、customProperties、开放索引从 `any` 收敛为 `unknown` |
| `frontend/stores/graph/nodes/types.ts` | 深度完整 | 深度完整 | 2 | 新增 `GraphStoreSet/Get`、`toRecord`、`isGraphBoundary`，safe helpers 改为 unknown 输入 |
| `frontend/stores/graph/nodes/index.ts` | 深度完整 | 深度完整 | 2 | nodes slice 组合不再透传 any；不需要 get 的子 slice 不再接收 get |
| `frontend/stores/graph/nodes/basicOperations.ts` | 深度完整 | 深度完整 | 2 | add/update/delete 节点操作移除 any，boundary 更新使用 guard |
| `frontend/stores/graph/nodes/constraintOperations.ts` | 深度完整 | 深度完整 | 2 | 位置更新和 group move 移除 any state |
| `frontend/stores/graph/nodes/groupOperations.ts` | 深度完整 | 深度完整 | 2 | group CRUD 和嵌套操作移除 any，data 合并使用 record guard |
| `frontend/stores/graph/nodes/groupBoundaryOperations.ts` | 深度完整 | 深度完整 | 2 | boundary updater 移除 any state/set/get |
| `frontend/stores/graph/nodes/conversionOperations.ts` | 深度完整 | 深度完整 | 2 | conversion hidden fields 显式化，删除 any casts |
| `frontend/stores/graph/edgesSlice.ts` | 深度完整 | 深度完整 | 2 | edges store set/get typed，history snapshot 调用收敛 |
| `frontend/stores/graph/canvasViewSlice.ts` | 深度完整 | 深度完整 | 2 | viewport/canvasSize store set typed，移除未使用旧 import |
| `frontend/utils/workspace/canvasSync.ts` | 深度完整 | 深度完整 | 2 | 保存/加载 canvas graphData 移除 any 断言 |
| `frontend/services/storage/StorageManager.ts` | 深度完整 | 深度完整 | 2 | 删除 canvas tree 递归类型改为 `CanvasTreeNode[]` |
| `frontend/app/api/layout/route.ts` | 深度完整 | 深度完整 | 2 | request options 从 any 改为 LayoutOptions |
| `frontend/components/graph/ui/MarkdownRenderer.tsx` | PENDING | 深度完整 | 1 | code renderer 移除 any，并避免 markdown node 透传 DOM |
| `frontend/components/graph/__tests__/node-editor.test.tsx` | PENDING | 深度完整 | 1 | StructuredAttributeEditor mock attributes/onChange 改为 Record |
| `frontend/components/workspace/sidebar/DeleteCanvasDialog.tsx` | PENDING | 深度完整 | 1 | JSX 文本转义错误修复，并移除未使用 selector |
| `frontend/lib/utils.ts` | 深度完整 | 深度完整 | 2 | debounce 泛型从 any[]/any 改为 unknown[]/unknown |
| `frontend/test-api.js` | PENDING | 已删除 | 1 | 旧 CommonJS 临时 API 测试脚本未接入 scripts，已删除 |
| `VALIDATION_RESULTS.md` | 深度完整 | 深度完整 | 13 | 新增 graph runtime 类型债务验证记录 |
| `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 14 | 新增 graph runtime 类型债务任务和验证 |
| `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 14 | 同步 lint error 清零状态 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 17 | 同步类型收敛、风险状态和模型契约 |

**下一轮计划：**
- 后续可以继续清理 `npm run lint` 的 41 个 warning，但主线优先级应放在 GraphPageContent 旧 UI 聚合和 ReactFlow adapter 边界，而不是单纯追 warning。

## [SYNC] 2026-04-30 11:38 — 删除旧转换兼容链路与渲染性能收敛

### A. 本轮目标（阅读前声明）

**触发任务：** 用户明确旧图兼容不再是目标，优化后只保留新主线；旧实现不需要继续堆积，性能优化要贯穿后续重构。

**目标文件：**
- `frontend/stores/graph/nodes/conversionOperations.ts`（原因：Node/Group 双向转换通过隐藏节点/边保存旧状态，属于旧兼容/旧交互链路，可能污染模型并增加渲染过滤成本）
- `frontend/stores/graph/nodes/index.ts`（原因：确认 conversion slice 是否仍聚合进 graph store）
- `frontend/types/graph/models.ts`（原因：确认转换缓存字段是否可以从核心模型删除）
- `frontend/components/graph/core/GraphPageContent.tsx`（原因：主画布渲染层可能仍过滤 `_hiddenByConversion`，并且存在 O(E*N) edge sync）
- `frontend/components/graph/core/nodeSyncUtils.ts`（原因：ReactFlow adapter 层可能仍保留隐藏转换兼容字段）
- `frontend/components/graph/nodes/BaseNode.tsx` / `NoteNode.tsx`（原因：确认 UI 是否还暴露转换交互）

**本轮想弄清楚：**
- conversion 旧链路是否被任何 UI/快捷键/菜单实际调用；若未调用，直接删除。
- 删除 conversion 后能否移除 `_hiddenByConversion`、`_parentConvertedId`、`convertedFrom`、`savedChildren` 等旧字段，降低模型复杂度。
- 主画布 edge sync 是否可以从每条边 `nodes.find()` 改为 `nodeById` Map，先做一个低风险性能优化。

## [SYNC] 2026-04-30 11:35 — GraphPageContent 渲染热路径性能收敛

### A. 本轮目标（阅读前声明）

**目标文件：**
- `frontend/components/graph/core/GraphPageContent.tsx`（原因：主画布容器仍是 God component 候选，且全量 graph store 订阅/节点边映射是性能主风险）
- `frontend/components/graph/core/nodeSyncUtils.ts`（原因：ReactFlow 节点/边适配逻辑集中在这里，影响每次渲染映射成本）
- `frontend/components/graph/core/hooks/useNodeHandling.ts`（原因：拖拽/drop/节点变化是 INP 热路径，当前有 hook dependency warning）
- `frontend/components/graph/core/hooks/useEdgeHandling.ts`（原因：连接边和边变化会触发 store/update，同属画布交互热路径）
- `frontend/components/graph/core/utils/nodePositionConstraints.ts`（原因：节点位置约束位于拖拽路径，需确认是否存在未用/重复逻辑）

**本轮想弄清楚：**
- `GraphPageContent` 是否订阅整个 graph store，导致 selection/hover/viewport/history 等无关变化重渲染主画布。
- ReactFlow node/edge 映射是否存在 O(E*N) 或每 render 重建大量对象的路径。
- 本轮可以先做哪些低风险性能收敛：selector 拆分、nodeById Map、useMemo/useCallback 精确依赖、adapter helper 抽离。
- 是否有行为不确定点需要暂停沟通；尤其是旧 group/hidden conversion 行为不能被性能重构破坏。

### C. SYNC 结果

**连带重读文件：**
- `frontend/components/graph/core/GraphPageContent.tsx`
- `frontend/components/graph/core/nodeSyncUtils.ts`
- `frontend/stores/graph/nodes/index.ts`
- `frontend/stores/graph/nodes/types.ts`
- `frontend/stores/graph/nodes/basicOperations.ts`
- `frontend/stores/graph/nodes/constraintOperations.ts`
- `frontend/stores/graph/nodes/groupOperations.ts`
- `frontend/stores/graph/nodes/groupBoundaryOperations.ts`
- `frontend/types/graph/models.ts`
- `frontend/components/graph/nodes/NoteNode.tsx`
- `frontend/components/graph/nodes/GroupNode.tsx`

**关键发现：**
- (verified) `frontend/stores/graph/nodes/conversionOperations.ts` 已删除，`nodes/index.ts` 不再聚合 conversion slice。
- (verified) `types/graph/models.ts` 已删除 `convertedFrom`、`isConverted`、`savedChildren`、`savedEdges`、`originalPosition`、`originalSize` 等旧转换缓存字段。
- (verified) `NoteNode` / `GroupNode` 不再暴露“Node/Group 转换”按钮；活跃代码中搜不到 `convertNodeToGroup` / `convertGroupToNode` / `_hiddenByConversion` 等旧链路引用。
- (verified) `nodeSyncUtils` 不再过滤旧转换隐藏节点，ReactFlow node projection 只处理嵌套排序、相对坐标、style/data 注入。
- (verified) `GraphPageContent` 已从整 store 订阅改为多个 selector，并用 `storeNodeById: Map` 做 edge source/target 查找，删除旧 O(E*N) `storeNodes.find()`。
- (verified) `GraphPageContent`、`basicOperations`、`constraintOperations`、`groupOperations`、`groupBoundaryOperations` 的高频调试 `console.log` 已清理。
- (partial) `frontend/public/workspace/kg-editor:workspace.json` 仍可能携带旧转换字段；当前不主动改样例数据，因为该文件已有外部改动，后续如要清理应按数据迁移任务处理。

**验证结果：**
- `rg "convertNodeToGroup|convertGroupToNode|ConversionOperations|_hiddenByConversion|_parentConvertedId|convertedFrom|isConverted|savedChildren|savedEdges|originalPosition|originalSize" frontend/components frontend/stores frontend/types frontend/features frontend/services frontend/domain ...`：PASS，无活跃代码命中。
- `rg "console\\.log|lastDraggedNodeRef" ...GraphPageContent/basic/constraint/group/boundary...`：PASS，无命中。
- `cd frontend && npx eslint components/graph/core/GraphPageContent.tsx stores/graph/nodes/basicOperations.ts stores/graph/nodes/constraintOperations.ts stores/graph/nodes/groupOperations.ts stores/graph/nodes/groupBoundaryOperations.ts --quiet`：PASS。
- `cd frontend && npm run lint -- --quiet`：PASS，0 errors。
- `cd frontend && npm run lint`：PASS，0 errors / 28 warnings。
- `cd frontend && npm run check:phase2`：PASS。
- `cd frontend && npm run build`：PASS。
- `git diff --check`：PASS。

**CODEBASE.md 更新内容：**
- §4 更新 `GraphPageContent`、`nodeSyncUtils`、nodes slice、graph model 和转换文件状态。
- §5 更新 `syncStoreToReactFlowNodes()` 算法步骤，删除旧转换隐藏过滤描述；将 conversion operations 标记为已删除。
- §6 更新 Graph Store 到 ReactFlow 的同步链路，补充 selector 和 `nodeById Map`。
- §9 将 GraphPageContent 整 store 订阅、edge sync O(E*N)、旧转换链路、adapter 旧转换过滤、高频调试日志列为 FIXED；保留 workspace 历史字段迁移风险。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/stores/graph/nodes/conversionOperations.ts` | 深度完整 | 已删除 | 3 | 旧 Node/Group 转换链路删除，不再产生隐藏字段和恢复缓存 |
| `frontend/stores/graph/nodes/index.ts` | 深度完整 | 深度完整 | 3 | nodes slice 不再聚合 conversion operations |
| `frontend/types/graph/models.ts` | 深度完整 | 深度完整 | 3 | 删除转换缓存字段，保留旧 graph model 的 unknown 开放索引 |
| `frontend/components/graph/core/GraphPageContent.tsx` | 深度完整 | 深度完整 | 6 | 拆 selector，edge endpoint 查找改为 Map，并清理主画布高频调试日志 |
| `frontend/components/graph/core/nodeSyncUtils.ts` | 深度完整 | 深度完整 | 4 | 删除旧转换隐藏字段过滤，保留嵌套排序和相对坐标 projection |
| `frontend/components/graph/nodes/NoteNode.tsx` | 深度完整 | 深度完整 | 2 | 确认不再暴露转换按钮，仍直接读取 graph store |
| `frontend/components/graph/nodes/GroupNode.tsx` | 深度完整 | 深度完整 | 2 | 确认不再暴露转换按钮，render 调试日志已不存在 |
| `frontend/stores/graph/nodes/basicOperations.ts` | 深度完整 | 深度完整 | 3 | 清理 selection/add/update/delete 路径调试日志，保留重复 ID error |
| `frontend/stores/graph/nodes/constraintOperations.ts` | 深度完整 | 深度完整 | 3 | 清理拖拽位置更新和 group move 调试日志 |
| `frontend/stores/graph/nodes/groupOperations.ts` | 深度完整 | 深度完整 | 3 | 清理 group CRUD/membership 调试日志，保留非法嵌套 error |
| `frontend/stores/graph/nodes/groupBoundaryOperations.ts` | 深度完整 | 深度完整 | 3 | 清理边界计算热路径调试日志，缓存 key 风险仍保留 |
| `VALIDATION_RESULTS.md` | 深度完整 | 深度完整 | 14 | 新增旧转换链路删除与 edge sync 性能验证记录 |
| `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 15 | 新增旧转换链路删除、热路径日志清理任务和验证 |
| `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 15 | 同步 Phase 2C 状态、性能验收和剩余计划 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 18 | 同步删除链路、渲染链路和风险状态 |

**下一轮计划：**
- 继续主线时优先做 ReactFlow adapter 边界：把 `nodeSyncUtils` 和 edge projection 从 `GraphPageContent` 移到 `features/ontology-canvas/adapters/react-flow`，同时评估 viewport culling/LOD 的最低可行切入点。

## [SYNC] 2026-04-30 15:35 — ReactFlow Adapter 边界迁移

### A. SYNC 范围声明

**触发任务：** 用户要求继续按主线开发；上一轮计划明确下一步是把 `nodeSyncUtils` 和 edge projection 从 `GraphPageContent` 移入 `features/ontology-canvas/adapters/react-flow`。

**直接变更文件：**
- `frontend/features/ontology-canvas/adapters/react-flow/projection.ts`
- `frontend/features/ontology-canvas/adapters/react-flow/index.ts`
- `frontend/features/ontology-canvas/index.ts`
- `frontend/components/graph/core/GraphPageContent.tsx`
- `frontend/components/graph/core/nodeSyncUtils.ts`
- `frontend/scripts/check-architecture-boundaries.mjs`
- `frontend/scripts/test-react-flow-adapter.mjs`
- `frontend/package.json`

**预计连带影响：**
- ReactFlow nodes/edges projection 数据流从 legacy component core 迁到 feature adapter。
- `check:phase2` 新增 adapter 测试。
- `check:architecture` 新增 adapter 边界规则。
- CODEBASE/架构/TODO/验证文档需要同步。

### C. SYNC 结果

**关键发现：**
- (verified) `nodeSyncUtils.ts` 只有 `GraphPageContent` 一个活跃调用方，因此可以直接删除旧 core 工具，不需要保留 re-export 兼容层。
- (verified) 新 adapter `projection.ts` 承接 `createGraphNodeLookup()`、nodes projection、edges projection、坐标转换和嵌套排序。
- (verified) `GraphPageContent` 现在只调用 `projectNodesToReactFlowNodes()` / `projectEdgesToReactFlowEdges()`，不再拥有 edge type 判断和 node projection 细节。
- (verified) adapter 边界检查已加入 `check-architecture-boundaries.mjs`，当前检查 adapters 2 个文件；规则允许 ReactFlow DTO，但禁止 store、UI、fetch 和 CSS。
- (verified) 首次 build 暴露 feature 根出口命名冲突：model/layout 和 adapter 都导出 `LegacyGraphNode`。已收窄 adapter public index，不再导出该内部类型，重跑 build 通过。

**验证结果：**
- `cd frontend && npm run test:react-flow-adapter`：PASS。
- `cd frontend && npm run check:architecture`：PASS，新增 adapter boundary。
- `cd frontend && npx eslint features/ontology-canvas/adapters/react-flow/projection.ts features/ontology-canvas/adapters/react-flow/index.ts components/graph/core/GraphPageContent.tsx scripts/test-react-flow-adapter.mjs scripts/check-architecture-boundaries.mjs --quiet`：PASS。
- `cd frontend && npm run check:phase2`：PASS。
- `cd frontend && npm run lint -- --quiet`：PASS，0 errors。
- `cd frontend && npm run lint`：PASS，0 errors / 28 warnings。
- `cd frontend && npm run build`：PASS。
- `git diff --check`：PASS。

**CODEBASE.md 更新内容：**
- §1 更新 Phase 2 验收脚本说明，加入 ReactFlow adapter 测试。
- §2 增加 adapter 目录、projection 文件和 `test-react-flow-adapter.mjs`。
- §4 增加 ReactFlow adapter 模块详解，`nodeSyncUtils.ts` 标记为已删除。
- §5 将 `syncStoreToReactFlowNodes()` 更新为 `projectNodesToReactFlowNodes()` / `projectEdgesToReactFlowEdges()`。
- §6 更新 Graph Store 到 ReactFlow 的投影链路。
- §9 新增 adapter boundary FIXED 风险。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/features/ontology-canvas/adapters/react-flow/projection.ts` | 新增 | 深度完整 | 1 | ReactFlow nodes/edges projection，含 Map lookup、相对坐标、edge visibility、循环 groupId 降级 |
| `frontend/features/ontology-canvas/adapters/react-flow/index.ts` | 新增 | 深度完整 | 1 | adapter public index，收窄公开类型避免根出口命名冲突 |
| `frontend/features/ontology-canvas/index.ts` | 深度完整 | 深度完整 | 2 | feature 根出口新增 ReactFlow adapter 导出 |
| `frontend/components/graph/core/GraphPageContent.tsx` | 深度完整 | 深度完整 | 7 | 改为调用 feature adapter projection，主组件保留接线和事件处理 |
| `frontend/components/graph/core/nodeSyncUtils.ts` | 深度完整 | 已删除 | 5 | 旧 core projection 工具删除，避免双实现 |
| `frontend/scripts/check-architecture-boundaries.mjs` | 深度完整 | 深度完整 | 3 | 新增 adapters 边界规则，禁止 store/UI/fetch/CSS |
| `frontend/scripts/test-react-flow-adapter.mjs` | 新增 | 深度完整 | 1 | 覆盖 adapter projection 行为和循环 groupId 降级 |
| `frontend/package.json` | 深度完整 | 深度完整 | 4 | 新增 `test:react-flow-adapter` 并纳入 `check:phase2` |
| `VALIDATION_RESULTS.md` | 深度完整 | 深度完整 | 15 | 新增 ReactFlow adapter boundary 验证记录 |
| `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 16 | 新增 ReactFlow adapter 边界迁移任务与验证 |
| `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 16 | 同步 Phase 2C adapter 边界状态和 Phase 3 已完成项 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 19 | 同步 adapter 模块、函数、数据流和风险 |

**下一轮计划：**
- 继续性能主线时，优先在 adapter 内做 LOD / viewport visible ids 的最小实现，或者先把 `GraphPageContent` 继续拆成 feature block/container。

## [SYNC] 2026-04-30 16:35 — Phase 3A ReactFlow viewport culling / LOD 投影

### A. SYNC 范围声明

**触发任务：** 用户要求继续执行后续优化；上一轮计划明确优先在 ReactFlow adapter 内做 LOD / viewport visible ids 的最小实现，并保持旧实现及时清理。

**直接变更文件：**
- `frontend/features/ontology-canvas/adapters/react-flow/projection.ts`
- `frontend/features/ontology-canvas/adapters/react-flow/index.ts`
- `frontend/components/graph/core/GraphPageContent.tsx`
- `frontend/scripts/test-react-flow-adapter.mjs`

**预计连带影响：**
- ReactFlow projection 从“全量 nodes/edges”进入“按视口和 LOD 投影”的第一步。
- `GraphPageContent` 需要从 ReactFlow viewport 派生 projection bounds。
- 文档需要同步 Phase 3A 状态、剩余风险和验证结果。

### C. SYNC 结果

**关键发现：**
- (verified) `projection.ts` 已新增 `ReactFlowLodMode`、`ReactFlowViewportBounds`、`resolveReactFlowLodMode()`，zoom 分层为 `full/compact/outline/dot`。
- (verified) `projectNodesToReactFlowNodes()` 支持 `cullingEnabled`、`viewportBounds`、`viewportPadding` 和 `lodMode`；启用 culling 时只返回视口扩展范围内节点、选中节点及其父级 group。
- (verified) `projectEdgesToReactFlowEdges()` 支持 `visibleNodeIds`，会过滤 source 或 target 不在可见节点集合中的边。
- (verified) `GraphPageContent` 已用 `projectionBounds`、`zoomValue` 和 `requestAnimationFrame` 节流的 `onMove` 事件驱动投影；节点数大于 80 且 bounds 可用时启用 culling。
- (verified) nodes/edges 同步 effect 已统一使用 `projectedNodes/projectedEdges`，未保留旧的二次投影链路。
- (partial) LOD 当前已进入 node data，但旧 NoteNode/GroupNode 还未消费 LOD 来减少 DOM；这留到 feature UI 迁移或下一批节点渲染优化。

**验证结果：**
- `cd frontend && npm run test:react-flow-adapter`：PASS。
- `cd frontend && npm run check:architecture`：PASS。
- `cd frontend && npx eslint features/ontology-canvas/adapters/react-flow/projection.ts features/ontology-canvas/adapters/react-flow/index.ts components/graph/core/GraphPageContent.tsx scripts/test-react-flow-adapter.mjs --quiet`：PASS。
- `cd frontend && npm run check:phase2`：PASS。
- `cd frontend && npm run lint -- --quiet`：PASS，0 errors。
- `cd frontend && npm run lint`：PASS，0 errors / 28 warnings。
- `cd frontend && npm run build`：PASS。
- `git diff --check`：PASS。

**CODEBASE.md 更新内容：**
- §2 更新 `test-react-flow-adapter.mjs` 覆盖范围。
- §4 更新 `GraphPageContent`、ReactFlow adapter index/projection 的职责和注意事项。
- §5 更新 `sortNodesByNestingLevel()` 环检测、增加 `resolveReactFlowLodMode()`，补充 nodes/edges projection 的 culling/LOD 算法步骤。
- §6 更新 Graph Store 到 ReactFlow 的数据流，加入 viewport -> projection bounds -> adapter culling 链路。
- §9 新增 ReactFlow projection culling 已修复项，并登记“节点 UI 尚未消费 LOD”的剩余风险。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/features/ontology-canvas/adapters/react-flow/projection.ts` | 深度完整 | 深度完整 | 2 | 新增 LOD、viewport bounds、visible node ids、节点裁剪和边端点过滤 |
| `frontend/features/ontology-canvas/adapters/react-flow/index.ts` | 深度完整 | 深度完整 | 2 | adapter public index 新增 LOD/viewport 类型出口 |
| `frontend/components/graph/core/GraphPageContent.tsx` | 深度完整 | 深度完整 | 8 | 接入 projection bounds、RAF viewport 更新、LOD memo 和 culling 阈值 |
| `frontend/scripts/test-react-flow-adapter.mjs` | 深度完整 | 深度完整 | 2 | 新增 LOD、viewport culling、selected outside node、ancestor group、edge endpoint filtering 测试 |
| `VALIDATION_RESULTS.md` | 深度完整 | 深度完整 | 16 | 新增 Phase 3A adapter performance projection 验证记录 |
| `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 17 | 新增 Phase 3A 已完成任务和剩余暂缓项 |
| `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 17 | 同步 Phase 3A 完成状态和性能验收说明 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 20 | 同步 projection 算法、数据流和风险状态 |

**下一轮计划：**
- 进入 Phase 3B：优先二选一推进。若继续性能主线，则让 NoteNode/GroupNode 消费 LOD，真正减少缩放下 DOM；若继续架构主线，则把 `GraphPageContent` 拆为 feature block/container，并逐步隔离 view/selection store。

## [SYNC] 2026-04-30 17:01 — 补齐旧 graph runtime 退场计划

### A. SYNC 范围声明

**触发任务：** 用户指出新增节点仍走旧 `BlockEnum.NODE/GROUP`，并质疑现有 plan 没有明确旧路径何时优化掉。

**直接变更文件：**
- `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md`
- `OPTIMIZATION_TODO_2026-04-29.zh-CN.md`
- `CODEBASE.md`

**预计连带影响：**
- 架构计划需要把旧 `Node/Group/Edge + BlockEnum` 退场从笼统 Phase 7 前移成明确 Phase 3B。
- TODO 需要增加 Phase 3B 的执行项和验收标准。
- CODEBASE 风险登记需要把“本体模型已建但运行态仍是旧 graph store”标成高优先级风险。

### C. SYNC 结果

**关键发现：**
- (verified) 当前 `useNodeHandling.onNodeAdd()` 仍创建 `Node` 且 `type: BlockEnum.NODE`；`onGroupAdd()` 仍创建旧 `Group`。
- (verified) `createClassNode()` 已存在于 ontology command 层，但新增节点 UI/运行态没有调用它。
- (verified) `OntologyNodeType` 已支持 `Class/Concept/Function/Component/Information/Interface/Constraint`，但这些类型没有成为画布新增节点主链路。
- (verified) 原计划把旧路径清理分散在 Phase 3/5/7，没有明确“运行态切换”关卡；这会让后续 UI、算法、性能继续依赖旧 graph runtime。

**文档修正：**
- `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` 新增 “Phase 3B 本体运行态切换计划”，明确旧 runtime 不等到 Phase 7。
- `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` 新增 Phase 3B 任务表和验收标准。
- `CODEBASE.md` 风险登记新增 P0：新增节点/Domain 主链路仍创建旧 `BlockEnum.NODE/GROUP`；旧 graph store 仍是运行时主数据源。

**验证结果：**
- `rg "Phase 3B|BlockEnum.NODE|本体运行态|OntologyDocumentState|旧 graph runtime" ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md OPTIMIZATION_TODO_2026-04-29.zh-CN.md CODEBASE.md`：PASS。
- `git diff --check`：PASS。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 18 | 新增 Phase 3B 本体运行态切换计划，明确旧 runtime 退场时间和验收 |
| `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 18 | 新增 Phase 3B 任务表、验收标准和 command history 暂缓条件 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 21 | 风险登记新增旧新增链路和旧 graph store 仍为真相源两个 P0 风险 |
| `ITERATION_LOG.md` | 深度完整 | 深度完整 | 21 | 记录本轮计划修正原因、发现和验证 |

**下一轮计划：**
- 进入 Phase 3B 第一批：先实现 `OntologyDocumentState/OntologyViewState` 与新增节点 use-case/facade，让“新增节点”从 `createClassNode()` 开始，不再直接产生旧 `BlockEnum.NODE`。

## [SYNC] 2026-04-30 17:36 — Phase 3B 本体文档状态与新增节点/Domain use-case

### A. SYNC 范围声明

**触发任务：** 用户要求继续执行任务；上一轮计划要求进入 Phase 3B 第一批，实现 `OntologyDocumentState/OntologyViewState` 与新增节点 use-case/facade。

**直接变更文件：**
- `frontend/domain/ontology/commands/graphCommands.ts`
- `frontend/features/ontology-canvas/model/document/ontologyDocument.ts`
- `frontend/features/ontology-canvas/model/document/index.ts`
- `frontend/features/ontology-canvas/model/index.ts`
- `frontend/scripts/test-ontology-commands.mjs`
- `frontend/scripts/test-ontology-document-model.mjs`
- `frontend/package.json`

**预计连带影响：**
- ontology command 层新增 Domain 创建能力。
- feature model 层新增本体 document shell，把 semantic graph 和 view state 分开。
- `check:phase2` 增加 document model 测试。
- 架构/TODO/CODEBASE/验证文档需要同步第一批完成状态。

### C. SYNC 结果

**关键发现：**
- (verified) `createDomain()` 现在是纯 ontology command：创建 `OntologyDomain`，并同步 parent domain.domainIds；失败返回 warning，不抛异常。
- (verified) `OntologyDocumentState` 将 `OntologyGraph` 和 `OntologyViewState` 放在一个 document shell 中，并用 `revision` 记录变更。
- (verified) `OntologyViewState` 承接 node/domain/edge view records、viewport、LOD 和 edgeVisibility；position/width/height 不进入 `OntologyNode`。
- (verified) `createOntologyClassNodeInDocument()` 调用 `createClassNode()`，并只把 position/size 写入 `view.nodeViews`。
- (verified) `createOntologyDomainInDocument()` 调用 `createDomain()`，并只把 position/size/collapsed 写入 `view.domainViews`。
- (partial) 当前只是 model/use-case 第一批，尚未把 `useNodeHandling` 的新增 UI 接线改过来；旧 ReactFlow runtime 仍是主画布运行态。

**验证结果：**
- `cd frontend && npm run test:ontology:commands`：PASS。
- `cd frontend && npm run test:ontology:document`：PASS。
- `cd frontend && npm run check:architecture`：PASS。
- `cd frontend && npx eslint domain/ontology/commands/graphCommands.ts features/ontology-canvas/model/document/ontologyDocument.ts features/ontology-canvas/model/document/index.ts features/ontology-canvas/model/index.ts scripts/test-ontology-commands.mjs scripts/test-ontology-document-model.mjs --quiet`：PASS。
- `cd frontend && npm run check:phase2`：PASS。
- `cd frontend && npm run lint -- --quiet`：PASS，0 errors。
- `cd frontend && npm run lint`：PASS，0 errors / 28 warnings。
- `cd frontend && npm run build`：PASS。
- `git diff --check`：PASS。

**CODEBASE.md 更新内容：**
- §1 更新 `check:phase2` 包含 ontology document model 测试。
- §2 增加 `features/ontology-canvas/model/document` 目录和测试脚本说明。
- §4 增加 document model 模块详解，并更新 graphCommands 导出。
- §5 增加 `createDomain()`、`createOntologyViewState()`、`createOntologyDocumentState()`、`createOntologyClassNodeInDocument()`、`createOntologyDomainInDocument()` 算法步骤。
- §6 更新 F-010 并新增 F-011：Ontology Document 创建节点/Domain。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/domain/ontology/commands/graphCommands.ts` | 深度完整 | 深度完整 | 3 | 新增 createDomain command，覆盖 duplicate/empty/missing parent/self parent warning |
| `frontend/features/ontology-canvas/model/document/ontologyDocument.ts` | 新增 | 深度完整 | 1 | Phase 3B document state/use-case，拆分 semantic graph 与 view state |
| `frontend/features/ontology-canvas/model/document/index.ts` | 新增 | 深度完整 | 1 | document model public index |
| `frontend/features/ontology-canvas/model/index.ts` | 深度完整 | 深度完整 | 3 | 新增 document model export |
| `frontend/scripts/test-ontology-commands.mjs` | 深度完整 | 深度完整 | 3 | 新增 createDomain command 断言 |
| `frontend/scripts/test-ontology-document-model.mjs` | 新增 | 深度完整 | 1 | 覆盖 document state、Class/Function node、Domain view 和 validation |
| `frontend/package.json` | 深度完整 | 深度完整 | 5 | 新增 `test:ontology:document` 并纳入 `check:phase2` |
| `VALIDATION_RESULTS.md` | 深度完整 | 深度完整 | 17 | 新增 Phase 3B 本体文档模型验证记录 |
| `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 19 | 标记 Phase 3B 第一批 DONE/PARTIAL 项和验证 |
| `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 19 | 更新 Phase 3B 计划状态：document state 和 model use-case 已完成 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 22 | 同步新增模块、函数、数据流和测试脚本 |

**下一轮计划：**
- Phase 3B 第二批：把新增节点/Domain UI 接线从旧 `BlockEnum.NODE/GROUP` 改为调用 document use-case；为临时渲染可保留 legacy projection adapter，但语义主写入口必须先落到 `OntologyDocumentState`。

## [SYNC] 2026-04-30 18:18 — Phase 3B 新增入口本体化与 legacy bridge

### A. SYNC 范围声明

**触发任务：** 用户要求继续执行后续任务；上一轮计划要求把新增节点/Domain UI 接线从旧 `BlockEnum.NODE/GROUP` 改为调用 ontology document use-case。

**直接变更文件：**
- `frontend/features/ontology-canvas/adapters/legacy-graph/documentBridge.ts`
- `frontend/features/ontology-canvas/adapters/legacy-graph/index.ts`
- `frontend/features/ontology-canvas/index.ts`
- `frontend/components/graph/core/hooks/useNodeHandling.ts`
- `frontend/components/graph/controls/Toolbar.tsx`
- `frontend/scripts/test-ontology-legacy-bridge.mjs`
- `frontend/package.json`

**预计连带影响：**
- 新增 Class、Domain、拖放创建节点的语义入口先走 `OntologyDocumentState`。
- 旧 ReactFlow runtime 暂时通过 legacy adapter 接收显示对象，但旧 `BlockEnum` 不再出现在新增入口 hook/Toolbar。
- `check:phase2` 增加 legacy bridge 测试。
- 架构/TODO/CODEBASE/验证文档需要同步 Phase 3B 第二批状态。

### C. SYNC 结果

**关键发现：**
- (verified) `legacy-graph/documentBridge.ts` 是当前唯一把本体 document 结果转回旧 `Node/Group` 的隔离层；它不读写 store。
- (verified) `useNodeHandling.onNodeAdd()` 现在先调用 `createOntologyClassNodeInDocument()`，再用 `projectOntologyNodeToLegacyNode()` 投影旧展示对象。
- (verified) `useNodeHandling.onGroupAdd()` 现在先调用 `createOntologyDomainInDocument()`，再用 `projectOntologyDomainToLegacyGroup()` 投影旧展示对象。
- (verified) `useNodeHandling.onDrop()` 会先根据投放位置推导目标 Domain，再创建 `OntologyNode.type = "Class"`。
- (verified) `Toolbar.tsx` 不再 import `BlockEnum`，文案改为 Class/Domain。
- (partial) 旧 graph store 仍是 ReactFlow 运行时主数据源；这次只是让新增入口的语义写入先经过本体 document，下一批仍要处理 relation 主链路和 adapter 输入切换。

**验证结果：**
- `cd frontend && npm run test:ontology:legacy-bridge`：PASS。
- `cd frontend && npx eslint features/ontology-canvas/adapters/legacy-graph/documentBridge.ts features/ontology-canvas/adapters/legacy-graph/index.ts components/graph/core/hooks/useNodeHandling.ts components/graph/controls/Toolbar.tsx scripts/test-ontology-legacy-bridge.mjs --quiet`：PASS。
- `cd frontend && npm run check:phase2`：PASS。
- `cd frontend && npm run lint -- --quiet`：PASS，0 errors。
- `cd frontend && npm run lint`：PASS，0 errors / 26 warnings。
- `cd frontend && npm run build`：PASS；首次发现 feature 根出口类型名冲突，改名 `LegacyOntologyDisplayNode` 后通过。
- `git diff --check`：PASS。
- `rg` 静态回查新增入口和 Toolbar 旧 `BlockEnum.NODE/GROUP` / Add Node/Add Group 文案：PASS。

**CODEBASE.md 更新内容：**
- §1 更新 `check:phase2` 包含 ontology legacy bridge 测试。
- §2 增加 `features/ontology-canvas/adapters/legacy-graph` 和 `test-ontology-legacy-bridge.mjs`。
- §4 增加 legacy graph adapter index/documentBridge 模块详解，并更新 feature index/model index。
- §5 增加 `createOntologyDocumentFromLegacyGraph()`、`projectOntologyNodeToLegacyNode()`、`projectOntologyDomainToLegacyGroup()` 算法步骤。
- §6 更新 F-011：新增入口从 Toolbar/useNodeHandling 到 ontology document use-case，再临时桥接到旧 graph store。
- §9 将“新增入口直接创建旧 BlockEnum”风险标记为 FIXED，保留旧 graph store 仍为运行态主数据源的 P0 风险。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/features/ontology-canvas/adapters/legacy-graph/documentBridge.ts` | 新增 | 深度完整 | 1 | Phase 3B 临时 bridge，负责旧 graph -> document 和 document -> 旧展示对象 |
| `frontend/features/ontology-canvas/adapters/legacy-graph/index.ts` | 新增 | 深度完整 | 1 | legacy graph adapter public index |
| `frontend/features/ontology-canvas/index.ts` | 深度完整 | 深度完整 | 4 | 新增 legacy graph adapter 出口 |
| `frontend/components/graph/core/hooks/useNodeHandling.ts` | 深度完整 | 深度完整 | 5 | 新增 Class/Domain/drop 入口先走 ontology document use-case |
| `frontend/components/graph/controls/Toolbar.tsx` | 深度完整 | 深度完整 | 3 | 移除旧 BlockEnum 判断，文案改为 Class/Domain |
| `frontend/scripts/test-ontology-legacy-bridge.mjs` | 新增 | 深度完整 | 1 | 覆盖 bridge view extraction、projection、membership 开关 |
| `frontend/package.json` | 深度完整 | 深度完整 | 6 | 新增 `test:ontology:legacy-bridge` 并纳入 `check:phase2` |
| `VALIDATION_RESULTS.md` | 深度完整 | 深度完整 | 18 | 新增 Phase 3B add-entry bridge 验证记录 |
| `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 20 | 标记 Phase 3B 第二批完成项和剩余验收 |
| `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 20 | 更新 Phase 3B 状态：新增入口本体化已完成，运行态仍待切换 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 23 | 同步 bridge 模块、函数、数据流和风险 |

**下一轮计划：**
- Phase 3B 第三批：优先把新增/编辑关系切到 `createSemanticRelation()` 与 `OntologyEdge.relation`，然后推进 ReactFlow adapter 输入从旧 graph runtime 改为 `OntologyGraph + OntologyViewState`。

## [SYNC] 2026-04-30 21:10 — Phase 3B 关系语义化与 OntologyDocumentStore 运行时主线

### A. SYNC 范围声明

**触发任务：** 用户要求继续执行后续全部任务，并强调旧实现要及时清理；本轮继续 Phase 3B，把运行时真相源从旧 graph store 推向本体文档。

**直接变更文件：**
- `frontend/domain/ontology/commands/graphCommands.ts`
- `frontend/features/ontology-canvas/model/document/ontologyDocument.ts`
- `frontend/features/ontology-canvas/state/ontologyDocumentStore.ts`
- `frontend/features/ontology-canvas/state/index.ts`
- `frontend/features/ontology-canvas/index.ts`
- `frontend/features/ontology-canvas/adapters/legacy-graph/documentBridge.ts`
- `frontend/features/ontology-canvas/adapters/react-flow/projection.ts`
- `frontend/components/graph/core/GraphPageContent.tsx`
- `frontend/components/graph/core/hooks/useNodeHandling.ts`
- `frontend/components/graph/core/hooks/useEdgeHandling.ts`
- `frontend/components/graph/core/hooks/useNodeExpansion.ts`
- `frontend/components/graph/core/hooks/useKeyboardShortcuts.ts`
- `frontend/components/graph/core/hooks/useViewportControls.ts`
- `frontend/components/graph/editors/EdgeEditor.tsx`
- `frontend/components/graph/editors/NodeEditor.tsx`
- `frontend/components/graph/edges/CustomEdge.tsx`
- `frontend/utils/workspace/canvasSync.ts`
- `frontend/utils/workspace/persistence.ts`
- `frontend/app/page.tsx`
- `frontend/app/page.legacy.tsx`
- `frontend/app/api/workspace/save/route.ts`
- `frontend/services/layout/LayoutManager.ts`
- `frontend/services/layout/strategies/ELKLayoutStrategy.ts`
- `frontend/services/layout/strategies/ELKGroupLayoutStrategy.ts`
- `frontend/services/layout/utils/ELKGraphConverter.ts`
- `frontend/services/layout/utils/layoutDebug.ts`
- `frontend/scripts/test-ontology-commands.mjs`
- `frontend/scripts/test-ontology-document-model.mjs`
- `frontend/scripts/test-ontology-document-store.mjs`
- `frontend/package.json`
- `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md`
- `OPTIMIZATION_TODO_2026-04-29.zh-CN.md`
- `VALIDATION_RESULTS.md`
- `CODEBASE.md`

**预计连带影响：**
- `GraphPageContent` 投影来源从旧 graph 快照改为 `ontologyDocumentStore.document`。
- 新增/编辑关系、拖拽、resize、展开、viewport、删除和清空画布需要同步本体文档。
- workspace 保存要优先从本体文档投影旧 `graphData`。
- 布局和 workspace 主路径日志需要清理到 debug flag。
- CODEBASE/架构/TODO/验证文档需要更新 Phase 3B 状态和剩余风险。

### C. SYNC 结果

**关键发现：**
- (verified) `ontologyDocumentStore` 已成为当前画布本体文档运行时状态，记录 `document/sourceCanvasId/hydrated`。
- (verified) `GraphPageContent` 已直接从 `ontologyDocumentStore.document` 调用 `projectOntologyDocumentToReactFlowNodes/Edges()`；旧 graph store 不再是投影语义快照来源。
- (verified) 新增 Class/Domain/drop、连接创建、EdgeEditor 保存、CustomEdge 内联保存都会把 command result 写入 `ontologyDocumentStore`。
- (verified) 拖拽、resize、展开、viewport move end/init、Delete/Backspace、清空画布都会更新 `OntologyViewState` 或调用本体删除 use-case。
- (verified) `deleteOntologyElements()` 支持删除 node/domain/edge，删除 Domain 时级联清理子 Domain、节点、incident edges 和 subgraph refs。
- (verified) `canvasSync.saveCurrentCanvasData()` 在本体 document 与当前 canvas 匹配时，优先从本体文档投影旧 graphData 保存。
- (verified) layout 策略注册、ELK 转换/执行日志已进入 `layoutDebug.ts`，默认构建不输出；workspace 初始化和保存路径普通 `console.log` 已清理。
- (partial) NodeEditor 为保持旧 UI 可用，保存后仍从旧 graph store rehydrate 本体文档；下一步需要新增本体节点更新 command，让 NodeEditor 不再走 legacy sync。
- (partial) 旧 graph store 仍是 ReactFlow display bridge、layout/edge optimizer/history 的输入来源，尚不能删除。

**验证结果：**
- `cd frontend && npm run check:phase2`：PASS。
- `cd frontend && npm run lint`：PASS，0 errors / 0 warnings；仅 npm 输出 baseline-browser-mapping 数据过期提醒。
- `cd frontend && npm run build`：PASS，Next 生产构建通过，布局策略注册日志不再输出。
- `git diff --check`：PASS。
- `rg -n "console\\.log" frontend/app frontend/components/graph/core frontend/services/layout frontend/utils/workspace`：PASS，仅 `layoutDebug.ts` 保留显式 debug 出口。

**CODEBASE.md 更新内容：**
- §1 更新 `check:phase2` 覆盖 ontology document store。
- §2 增加 `features/ontology-canvas/state`、`test-ontology-document-store.mjs`、`layoutDebug.ts`。
- §4 更新 `GraphPageContent`、feature index、legacy bridge、ReactFlow projection、ontology document、layout services 说明；新增 ontology document store 模块详解。
- §5 增加 `deleteOntologyElements()`、`updateOntologyNodeViewInDocument()`、`deleteOntologyElementsInDocument()`、`useOntologyDocumentStore` 算法步骤。
- §6 更新 F-011，并新增 F-011B：OntologyDocumentStore 到 ReactFlow 投影和视图更新链路。
- §9 下调旧 graph store 风险为显示桥残留；新增 NodeEditor legacy sync 风险；标记 workspace save 大对象日志已修复。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/domain/ontology/commands/graphCommands.ts` | 深度完整 | 深度完整 | 4 | 新增 deleteOntologyElements，覆盖 node/domain/edge 删除、Domain 级联、subgraph refs 清理 |
| `frontend/features/ontology-canvas/model/document/ontologyDocument.ts` | 深度完整 | 深度完整 | 2 | 新增 relation、view、viewport、delete document use-case |
| `frontend/features/ontology-canvas/state/ontologyDocumentStore.ts` | 新增 | 深度完整 | 1 | 运行时本体文档 store，承接 replace/apply/view/viewport/delete |
| `frontend/features/ontology-canvas/state/index.ts` | 新增 | 深度完整 | 1 | state public index |
| `frontend/features/ontology-canvas/index.ts` | 深度完整 | 深度完整 | 5 | 新增 state export |
| `frontend/components/graph/core/GraphPageContent.tsx` | 深度完整 | 深度完整 | 9 | 投影来源改为 ontologyDocumentStore，交互回写 view/delete |
| `frontend/components/graph/core/hooks/useNodeHandling.ts` | 深度完整 | 深度完整 | 6 | 新增入口 apply command result 到 ontologyDocumentStore，root subgraph id 动态解析 |
| `frontend/components/graph/core/hooks/useEdgeHandling.ts` | 深度完整 | 深度完整 | 2 | 连接创建写 ontologyDocumentStore |
| `frontend/components/graph/core/hooks/useNodeExpansion.ts` | 深度完整 | 深度完整 | 2 | 展开/折叠同步 node view expanded/size |
| `frontend/components/graph/core/hooks/useKeyboardShortcuts.ts` | 深度完整 | 深度完整 | 2 | Delete/Backspace 同步本体删除 |
| `frontend/components/graph/core/hooks/useViewportControls.ts` | 深度完整 | 深度完整 | 2 | 清空画布同步本体删除 |
| `frontend/components/graph/editors/EdgeEditor.tsx` | 深度完整 | 深度完整 | 3 | Edge 保存写 ontologyDocumentStore 后投影旧 display edge |
| `frontend/components/graph/editors/NodeEditor.tsx` | 深度完整 | (partial) | 3 | 保存后用 legacy sync rehydrate 本体文档，后续需纯本体节点更新 command |
| `frontend/components/graph/edges/CustomEdge.tsx` | 深度完整 | 深度完整 | 2 | 内联关系保存写 ontologyDocumentStore |
| `frontend/utils/workspace/canvasSync.ts` | 深度完整 | 深度完整 | 2 | load 初始化本体文档，save 优先从本体文档投影 graphData |
| `frontend/services/layout/utils/layoutDebug.ts` | 新增 | 深度完整 | 1 | 布局 debug log 开关，兼容无 process 的 VM |
| `frontend/scripts/test-ontology-document-store.mjs` | 新增 | 深度完整 | 1 | 覆盖 document store replace/apply/view/viewport/delete |
| `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 21 | 更新 Phase 3B 第四批状态和剩余旧 graph 显示桥风险 |
| `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 21 | 新增 Phase 3B 第四批任务表和验证记录 |
| `VALIDATION_RESULTS.md` | 深度完整 | 深度完整 | 19 | 新增 OntologyDocumentStore runtime 验证 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 24 | 同步模块、函数、数据流和风险 |

**下一轮计划：**
- Phase 3C：新增 `updateOntologyNodeInDocument` / node inspector ontology save plan，删除 NodeEditor 的 legacy rehydrate 路径。
- 随后推进旧 graph store 退场：layout/edge optimizer/history/persistence 改为消费本体 DTO 或 adapter patch。

## [PLAN] 2026-05-06 — 本体 JSON 持久化与后续 PostgreSQL Adapter 决策记录

### A. 本轮目标（阅读前声明）

**目标文件：**
- `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md`（原因：需要把最新持久化决策写入总体架构）
- `OPTIMIZATION_TODO_2026-04-29.zh-CN.md`（原因：需要把 Phase 3C/3D 的执行顺序和验收标准落成任务）
- `ITERATION_LOG.md`（原因：上下文压缩后需要保留本轮讨论结论）

**本轮想弄清楚：** 如何把“先保存本体 JSON，后续切 PostgreSQL”的讨论变成不容易被忘掉的项目约束，同时避免旧 graph store 继续污染持久化 schema。

### C. 本轮发现

**关键发现：**
- (verified) 当前文档已经记录 NodeEditor 仍有 legacy rehydrate 路径，但此前没有明确写出“必须先修 NodeEditor，再改持久化 schema”的执行顺序。
- (verified) 当前架构文档已经要求 `workspaceRepository`，但此前没有明确 `loadOntologyCanvas/saveOntologyCanvas`、`PersistedOntologyCanvas` JSON 契约和 PostgreSQL adapter 替换边界。
- (inferred) 如果直接改持久化格式而不先移除 NodeEditor legacy rehydrate，旧 `Node/Group/Edge` 仍可能在编辑保存时反向污染 `OntologyDocumentState`，再被写入新 JSON。

**新增决策：**
- Phase 3C 先做 NodeEditor 纯本体保存：新增 `updateOntologyNodeInDocument()` 和 node inspector ontology save plan，删除保存后的 legacy rehydrate。
- Phase 3D 再做本体 JSON 持久化：新增 `PersistedOntologyCanvas`，保存 `OntologyGraph + PersistedOntologyViewState`，旧 `graphData` 只作为迁移输入或临时显示桥输出。
- PostgreSQL 延后到 repository adapter 层替换；第一版 PG 建议保存完整 JSONB 文档，等搜索、统计、权限、协作明确后再拆索引表。

**更新了文档：**
- `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md`：补充 Data-layer 本体文档持久化决策、Phase 3C/3D 顺序、Phase 6 重新定位。
- `OPTIMIZATION_TODO_2026-04-29.zh-CN.md`：新增 Phase 3C / Phase 3D 近期计划、验收标准和后续 PostgreSQL adapter 原则。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 22 | 补充 JSON 本体文档持久化、PG adapter、Phase 3C/3D 执行顺序 |
| `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 22 | 新增 Phase 3C NodeEditor 本体化和 Phase 3D 本体 JSON 持久化任务表 |
| `ITERATION_LOG.md` | 深度完整 | 深度完整 | 22 | 记录 2026-05-06 持久化决策，防止后续上下文压缩丢失 |

**下一轮计划：**
- 进入 Phase 3C：实现 NodeEditor 纯本体保存，优先删除 legacy rehydrate 路径。

## [SYNC] 2026-05-06 — Phase 3C NodeEditor 纯本体保存

### A. SYNC 范围声明

**触发任务：** 用户要求继续工作；上一轮计划要求进入 Phase 3C，先删除 NodeEditor 保存后的 legacy rehydrate 路径，再进入本体 JSON 持久化。

**直接变更文件：**
- `frontend/domain/ontology/commands/graphCommands.ts`
- `frontend/features/ontology-canvas/model/document/ontologyDocument.ts`
- `frontend/features/ontology-canvas/model/inspector/editorDrafts.ts`
- `frontend/features/ontology-canvas/model/inspector/savePlans.ts`
- `frontend/features/ontology-canvas/adapters/legacy-graph/documentBridge.ts`
- `frontend/components/graph/editors/NodeEditor.tsx`
- `frontend/scripts/test-ontology-commands.mjs`
- `frontend/scripts/test-ontology-document-model.mjs`
- `frontend/scripts/test-ontology-document-store.mjs`
- `frontend/scripts/test-editor-drafts.mjs`
- `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md`
- `OPTIMIZATION_TODO_2026-04-29.zh-CN.md`
- `VALIDATION_RESULTS.md`
- `CODEBASE.md`

**预计连带影响：**
- NodeEditor 保存节点和 Domain 时，语义真相源变成 `OntologyDocumentState`。
- 旧 graph store 仍保留 display bridge，但不再参与 NodeEditor 的本体文档重建。
- Phase 3D 可以开始做本体 JSON 持久化，不会再被 NodeEditor legacy sync 反向污染。

### C. SYNC 结果

**关键发现：**
- (verified) `updateOntologyNode()` 现在能更新 name/type/description/fields/tags/metadata，并用 `domainId: null` 表达从 Domain 移除。
- (verified) `updateOntologyDomain()` 现在能更新 name/parent/collapsed/metadata，并通过父链检查避免 Domain 嵌套循环。
- (verified) `updateOntologyNodeInDocument()` / `updateOntologyDomainInDocument()` 已把 command 包装成 document use-case，revision 会推进。
- (verified) `createNodeInspectorSavePlan()` 现在返回 `ontology` 保存计划；旧 display update 和本体 command input 在 model 层统一生成。
- (verified) `NodeEditorForm.handleSave()` 现在先执行 document update，再写 `ontologyDocumentStore`，最后才更新旧 graph display；文件内已无 `createOntologyDocumentFromLegacyGraph()` 或 `node-editor-legacy-sync`。
- (verified) legacy bridge projection 已能从 metadata 恢复 node/domain 的旧 content/summary/tags/attributes，避免保存后右侧旧编辑器显示丢字段。
- (partial) 旧 graph store 仍是 layout/history/persistence 的输入，EdgeEditor 仍有未 hydrate 时的 legacy document fallback；这些留到后续旧 store 退场阶段。

**验证结果：**
- `cd frontend && npm run test:ontology:commands`：PASS。
- `cd frontend && npm run test:ontology:document`：PASS。
- `cd frontend && npm run test:ontology:document-store`：PASS。
- `cd frontend && npm run test:editors`：PASS。
- `cd frontend && npm run check:phase2`：PASS。
- `cd frontend && npm run lint`：PASS，0 errors / 0 warnings；仅 npm 输出 baseline-browser-mapping 数据提醒。
- `cd frontend && npm run build`：PASS。
- `git diff --check`：PASS。
- `rg "node-editor-legacy-sync|createOntologyDocumentFromLegacyGraph" frontend/components/graph/editors/NodeEditor.tsx`：PASS，无命中。

**CODEBASE.md 更新内容：**
- §4 更新 `graphCommands.ts`、`ontologyDocument.ts`、`editorDrafts.ts`、`savePlans.ts`、`NodeEditor.tsx` 的职责、导出和注意事项。
- §5 新增 `updateOntologyNode()`、`updateOntologyDomain()`、`updateOntologyNodeInDocument()`、`updateOntologyDomainInDocument()` 算法步骤，并更新 `createNodeInspectorSavePlan()`、`NodeEditorForm.handleSave()`。
- §6 更新 F-012：右侧 NodeEditor 保存链路先写 ontology document，再更新旧 display bridge。
- §9 将 NodeEditor legacy sync 风险标记为 FIXED，并收窄旧 graph store 残留风险到 layout/history/persistence/display bridge。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/domain/ontology/commands/graphCommands.ts` | 深度完整 | 深度完整 | 5 | 新增 updateOntologyNode/updateOntologyDomain，覆盖节点/Domain 编辑保存 |
| `frontend/features/ontology-canvas/model/document/ontologyDocument.ts` | 深度完整 | 深度完整 | 3 | 新增 document 级节点/Domain 更新 use-case |
| `frontend/features/ontology-canvas/model/inspector/editorDrafts.ts` | 深度完整 | 深度完整 | 2 | 新增 attributes -> OntologyField 与 ontology type 解析 helper |
| `frontend/features/ontology-canvas/model/inspector/savePlans.ts` | 深度完整 | 深度完整 | 2 | Node save plan 新增 ontology node/domain input |
| `frontend/features/ontology-canvas/adapters/legacy-graph/documentBridge.ts` | 深度完整 | 深度完整 | 2 | projection 支持从 metadata 恢复旧 content/summary/tags/attributes |
| `frontend/components/graph/editors/NodeEditor.tsx` | (partial) | 深度完整 | 4 | 保存路径改为 ontology document first，移除 legacy rehydrate |
| `frontend/scripts/test-ontology-commands.mjs` | 深度完整 | 深度完整 | 4 | 覆盖 node/domain update command |
| `frontend/scripts/test-ontology-document-model.mjs` | 深度完整 | 深度完整 | 2 | 覆盖 document 级 node/domain update |
| `frontend/scripts/test-ontology-document-store.mjs` | 深度完整 | 深度完整 | 2 | 覆盖 store apply node update command result |
| `frontend/scripts/test-editor-drafts.mjs` | 深度完整 | 深度完整 | 2 | 覆盖 inspector ontology save plan |
| `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 23 | 标记 Phase 3C 完成，下一步 Phase 3D JSON 持久化 |
| `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 23 | Phase 3C 任务表改 DONE 并补验证记录 |
| `VALIDATION_RESULTS.md` | 深度完整 | 深度完整 | 20 | 新增 Phase 3C 验证记录 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 25 | 同步模块、函数、数据流和风险 |

**下一轮计划：**
- Phase 3D：定义 `PersistedOntologyCanvas` / `PersistedOntologyViewState`，新增 `workspaceRepository.loadOntologyCanvas/saveOntologyCanvas/migrateOntologyCanvas`，把 workspace 保存格式切到本体 JSON。

## [SYNC] 2026-05-06 14:57 — Phase 3D 本体 JSON 持久化与旧保存入口清理

### A. SYNC 范围声明

**触发任务：** 用户要求继续迁移，并强调清理旧实现，目标是形成新的优质项目代码；上一轮计划要求进入 Phase 3D，把 workspace 保存格式切到本体 JSON，并收口直接 fetch。

**直接变更文件：**
- `frontend/types/workspace/ontologyCanvas.ts`
- `frontend/types/workspace/models.ts`
- `frontend/features/ontology-canvas/model/document/persistence.ts`
- `frontend/features/ontology-canvas/model/document/index.ts`
- `frontend/data-layer/workspace/workspaceRepository.ts`
- `frontend/data-layer/workspace/index.ts`
- `frontend/utils/workspace/canvasSync.ts`
- `frontend/utils/workspace/persistence.ts`
- `frontend/stores/graph/persistenceMiddleware.ts`
- `frontend/stores/workspace/canvasSlice.ts`
- `frontend/app/page.tsx`
- `frontend/components/graph/core/GraphPageContent.tsx`
- `frontend/components/graph/core/hooks/useNodeHandling.ts`
- `frontend/components/graph/core/hooks/useEdgeHandling.ts`
- `frontend/components/graph/edges/CustomEdge.tsx`
- `frontend/components/graph/editors/EdgeEditor.tsx`
- `frontend/scripts/load-typescript-module.mjs`
- `frontend/scripts/test-workspace-repository.mjs`
- `frontend/package.json`
- `frontend/public/workspace/kg-editor:workspace.json`
- `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md`
- `OPTIMIZATION_TODO_2026-04-29.zh-CN.md`
- `VALIDATION_RESULTS.md`
- `CODEBASE.md`

**预计连带影响：**
- workspace 加载/保存只允许经 `data-layer/workspace`，UI、store middleware、workspace util 不再直接 fetch `/api/workspace/load|save`。
- `Canvas.ontologyDocument` 成为持久化真相源；`graphData` 继续存在，但降级为 ReactFlow 旧显示缓存。
- 旧 `graphData -> OntologyDocumentState` 迁移只允许集中在 `utils/workspace/canvasSync.ts`，组件层不再各自创建 legacy document fallback。

### C. SYNC 结果

**关键发现：**
- (verified) `PersistedOntologyCanvasSchema` 已定义本体图、视图状态、revision、savedAt，并显式限制可持久化的 view 字段为 node/domain/edge views、viewport、lod、edgeVisibility。
- (verified) `Canvas` 新增 `ontologyDocument?: PersistedOntologyCanvas`；默认画布和新建画布都会创建空本体文档快照。
- (verified) `createPersistedOntologyCanvas()` / `restoreOntologyDocumentFromPersistedCanvas()` 已把运行时 `OntologyDocumentState` 与持久化 JSON 快照隔离。
- (verified) `workspaceRepository` 已提供 `loadWorkspaceStorage/saveWorkspaceStorage/loadWorkspace/saveWorkspace/loadOntologyCanvas/saveOntologyCanvas/migrateOntologyCanvas`；前端直接 fetch `/api/workspace/load|save` 只剩 repository 一处。
- (verified) `canvasSync.saveCurrentCanvasData()` 保存时优先从 `ontologyDocumentStore` 写 `ontologyDocument`，再投影旧 `graphData`；`loadCanvasData()` 加载时优先恢复 `ontologyDocument`，缺失时才从旧 `graphData` 迁移。
- (verified) `GraphPageContent`、`useNodeHandling`、`useEdgeHandling`、`CustomEdge`、`EdgeEditor` 的未 hydration fallback 已收口到 `getActiveOntologyDocument()`；组件层不再直接调用 `createOntologyDocumentFromLegacyGraph()`。
- (verified) 默认 workspace JSON 已补充 `ontologyDocument`，并由 repository 测试解析验证。
- (partial) `graphData` 仍保留在 `Canvas` schema 和 workspace JSON 中，用于旧 ReactFlow 显示桥；彻底删除要等旧 graph store、layout/history 退场。

**验证结果：**
- `cd frontend && npm run test:workspace:repository`：PASS。
- `cd frontend && npm run check:phase2`：PASS。
- `cd frontend && npm run lint`：PASS；仅 npm 输出 baseline-browser-mapping 数据提醒。
- `cd frontend && npm run build`：PASS。
- `git diff --check`：PASS。
- `rg -n "/api/workspace/(save|load)|fetch\\(" frontend/app frontend/components frontend/stores frontend/utils frontend/data-layer -g '*.{ts,tsx}'`：PASS，只剩 `frontend/data-layer/workspace/workspaceRepository.ts`。
- `rg -n "createOntologyDocumentFromLegacyGraph\\(" frontend/app frontend/components frontend/stores frontend/utils frontend/data-layer -g '*.{ts,tsx}'`：PASS，只剩 `frontend/utils/workspace/canvasSync.ts`。

**CODEBASE.md 更新内容：**
- §2 增加 `frontend/data-layer/workspace/*`、`frontend/types/workspace/ontologyCanvas.ts`、`features/ontology-canvas/model/document/persistence.ts`、`scripts/test-workspace-repository.mjs`。
- §4 更新 workspace model、canvas sync、persistence middleware、workspace persistence、page 初始化、GraphPageContent/edge/node handlers、EdgeEditor/CustomEdge 的职责和注意事项。
- §5 新增本体快照、repository、active document fallback、workspace 持久化相关函数算法步骤。
- §6 更新 workspace 加载、保存、画布切换和编辑 fallback 数据流。
- §9 将“多处直接 fetch workspace API”风险标记为 FIXED；新增 `graphData` 显示缓存残留风险。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/types/workspace/ontologyCanvas.ts` | 新增 | 深度完整 | 1 | 定义 PersistedOntologyCanvas schema 与空本体文档工厂 |
| `frontend/types/workspace/models.ts` | 深度完整 | 深度完整 | 4 | Canvas 新增 ontologyDocument，graphData 标记为旧显示缓存 |
| `frontend/features/ontology-canvas/model/document/persistence.ts` | 新增 | 深度完整 | 1 | 运行时文档与持久化快照互转 |
| `frontend/data-layer/workspace/workspaceRepository.ts` | 新增 | 深度完整 | 1 | workspace API 唯一前端 fetch 出口和 ontology canvas helper |
| `frontend/utils/workspace/canvasSync.ts` | 深度完整 | 深度完整 | 3 | 持久化优先 ontologyDocument，旧 graphData 迁移集中于本文件 |
| `frontend/utils/workspace/persistence.ts` | PENDING | 深度完整 | 1 | 改为调用 repository saveWorkspace，不再直接 fetch |
| `frontend/stores/graph/persistenceMiddleware.ts` | 深度完整 | 深度完整 | 3 | 自动保存改为 saveCurrentCanvasData + persistWorkspace |
| `frontend/stores/workspace/canvasSlice.ts` | 深度完整 | 深度完整 | 2 | 新建画布生成空 PersistedOntologyCanvas |
| `frontend/app/page.tsx` | 深度完整 | 深度完整 | 4 | 初始化改为 loadWorkspaceStorage，默认路径同步加载本体文档 |
| `frontend/components/graph/core/GraphPageContent.tsx` | 深度完整 | 深度完整 | 10 | fallback 初始化改用 getActiveOntologyDocument |
| `frontend/components/graph/core/hooks/useNodeHandling.ts` | 深度完整 | 深度完整 | 7 | document snapshot fallback 收口到 canvasSync |
| `frontend/components/graph/core/hooks/useEdgeHandling.ts` | 深度完整 | 深度完整 | 3 | 关系创建 fallback 收口到 canvasSync |
| `frontend/components/graph/edges/CustomEdge.tsx` | 深度完整 | 深度完整 | 3 | 内联关系编辑 fallback 收口到 canvasSync |
| `frontend/components/graph/editors/EdgeEditor.tsx` | 深度完整 | 深度完整 | 4 | 关系编辑 fallback 收口，移除无用 nodes/edges props |
| `frontend/scripts/load-typescript-module.mjs` | 深度完整 | 深度完整 | 2 | 测试 loader 支持 `@/` alias 和 mock fetch |
| `frontend/scripts/test-workspace-repository.mjs` | 新增 | 深度完整 | 1 | 覆盖 repository 读写、默认 workspace JSON schema、ontology helper |
| `frontend/public/workspace/kg-editor:workspace.json` | PENDING | 深度完整 | 1 | 默认工作区保留 graphData 显示缓存，并新增 ontologyDocument 真相源 |
| `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 24 | 标记 Phase 3D 第一批完成，明确旧 graphData 后续删除条件 |
| `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 24 | Phase 3D 任务表改为部分完成并补验证记录 |
| `VALIDATION_RESULTS.md` | 深度完整 | 深度完整 | 21 | 新增 Phase 3D 验证记录 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 26 | 同步新持久化模块、函数、数据流和风险 |

**下一轮计划：**
- Phase 3E：继续旧 graph store 退场。优先把 layout/history/persistence 的输入从旧 `Node|Group|Edge` 转为本体 DTO 或 command patch，然后才能从 `Canvas` schema 和默认 workspace 中删除 `graphData` 显示缓存。

## [INVESTIGATION] 2026-05-06 15:48 — 旧项目节点嵌套交互契约与当前回归排查

### A. 本轮目标（阅读前声明）

**触发任务：** 用户反馈当前项目节点 UI 未重做，但 Domain/Group 嵌套交互出现回归：嵌套节点跑到 Domain 外部、移动节点后位置没有及时更新，点击后回到原位置；要求先理解 `/home/aseit/桌面/cloud/knowledge-graph` 原始存档中的旧交互逻辑，并在保持交互逻辑不变的前提下提出性能优化方案。

**目标文件：**
- 旧项目 `frontend/components/graph/core/GraphPageContent.tsx`（原因：确认 ReactFlow onNodesChange/onNodeDrag/onNodeDragStop 状态同步链路）
- 旧项目 `frontend/stores/graph/nodes/*`（原因：确认 add/move/update/group boundary/membership 的原始正确交互契约）
- 旧项目 `frontend/components/graph/core/hooks/*`（原因：确认新增、拖放、展开、快捷键与嵌套关系如何配合）
- 当前项目对应 `frontend/components/graph/core/GraphPageContent.tsx`
- 当前项目对应 `frontend/stores/graph/nodes/*`
- 当前项目 `frontend/features/ontology-canvas/*` 和 `frontend/utils/workspace/canvasSync.ts`（原因：确认 ontology document 引入后是否覆盖或绕过旧坐标/嵌套更新）

**本轮想弄清楚：**
- 旧项目里“节点属于 Group/Domain”的数据契约是什么：`groupId`、`nodeIds`、`position`、`boundary`、ReactFlow parent/relative position 是否双写。
- 拖动节点时旧项目如何做到即时更新、边界约束、父子关系维护和点击后不回弹。
- 当前项目回归是 Phase 3 迁移未做到这一步，还是新 ontology/document 投影覆盖了旧交互状态，或是旧显示桥和本体 view state 之间没有同步。

### C. 本轮发现

**关键发现：**
- (verified) 旧项目的正确契约是“store 绝对坐标 + ReactFlow 相对投影”：旧 graph store 中子节点和子 Group 的 `position` 均为画布绝对坐标，只有投影给 ReactFlow 时才按 `child.absolute - parent.absolute` 转为相对坐标，并设置 `parentId/extent/expandParent`。
- (verified) 旧项目拖拽普通节点时会在 `onNodeDragStop` 把 ReactFlow 相对坐标转回绝对坐标，再调用 `updateNodePosition()`；后者在非布局模式下按父 Group 边界约束节点，随后更新父 Group 边界。
- (verified) 旧项目拖拽 Group 时会调用 `handleGroupMove()`，计算 offset 后更新 Group 自己和所有后代节点/Group 的绝对坐标。这是“移动 Domain 时内部节点跟随”的关键。
- (verified) 旧项目 `addNodeToGroup()` 负责维护双向 membership：子节点 `groupId` 和父 Group `nodeIds` 同步，并在切换父 Group 时从旧父 Group 移除。
- (verified) 当前项目的 ReactFlow nodes 已从 `ontologyDocumentStore.document` 投影，而不是从旧 graph store 投影；旧 graph store 仍被拖拽 handler、边界更新和 edge optimizer 使用。
- (verified) 当前项目普通节点拖拽会同时调用 `updateNodePosition()` 和 `updateOntologyNodeView()`，但本体 view 写入的是 ReactFlow 转换后的原始 absolutePosition，不一定是旧 store 约束后的最终坐标。
- (verified) 当前项目 Domain 拖拽会调用旧 `handleGroupMove()` 平移旧 graph store 后代，但只调用 `updateOntologyDomainView()` 更新本体 Domain 自己，没有平移本体 `nodeViews/domainViews` 中的后代。
- (verified) 当前项目 `updateGroupBoundary()` 仍只更新旧 graph store 的 Group position/width/height/boundary，不会同步 `OntologyViewState.domainViews`。
- (inferred) 用户看到“节点移动后点击又回到原位置”，原因是 ReactFlow 本地 nodes 与本体 view patch 没有事务一致；点击/选中/重新投影时本体文档旧 view 覆盖了本地拖拽状态。

**修订的旧结论：**
- 原文档将“拖拽、resize、展开、viewport 已同步更新 OntologyViewState”标为 DONE。现在修订为 PARTIAL：单节点/单 Domain 的直接 view 写入已有，但旧项目真正依赖的嵌套事务契约尚未完整迁移。

**新增文档：**
- `NODE_DOMAIN_INTERACTION_CONTRACT_2026-05-06.zh-CN.md`：永久化旧项目节点/Domain 嵌套交互契约、当前回归原因、保持交互不变的性能优化方案和 Phase 3E-A 修复优先级。

**更新了 CODEBASE.md：**
- §9 新增 P0 风险：`GraphPageContent.onNodeDragStop` 与 `groupBoundaryOperations.updateGroupBoundary` 在本体 document 成为渲染真相源后没有完整同步 Domain 后代 offset、约束后坐标和边界级联。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| 原始存档 `frontend/components/graph/core/nodeSyncUtils.ts` | 外部对照 | 深度完整 | 1 | 确认绝对坐标转 ReactFlow 相对坐标、父子排序、parentId/extent/expandParent 投影契约 |
| 原始存档 `frontend/components/graph/core/GraphPageContent.tsx` | 外部对照 | 深度完整 | 1 | 确认 onNodeDragStop 相对转绝对、普通节点拖拽、Group 拖拽和 boundary 更新顺序 |
| 原始存档 `frontend/stores/graph/nodes/constraintOperations.ts` | 外部对照 | 深度完整 | 1 | 确认 updateNodePosition 约束父 Group 边界，handleGroupMove 平移所有后代 |
| 原始存档 `frontend/stores/graph/nodes/groupOperations.ts` | 外部对照 | 深度完整 | 1 | 确认 addNodeToGroup 双向 membership、循环和深度校验 |
| 原始存档 `frontend/stores/graph/nodes/groupBoundaryOperations.ts` | 外部对照 | 深度完整 | 1 | 确认子节点绝对坐标包围盒、Group 四向扩展和祖先级联 |
| 原始存档 `frontend/components/graph/core/hooks/useNodeHandling.ts` | 外部对照 | 深度完整 | 1 | 确认新增/拖放先算绝对坐标，再通过 addNodeToGroup 建立嵌套 |
| 当前 `frontend/components/graph/core/GraphPageContent.tsx` | 深度完整 | 深度完整 | 11 | 确认 ReactFlow 投影来自 ontology document，拖拽提交仍混用旧 graph store 和 ontology view 局部 patch |
| 当前 `frontend/features/ontology-canvas/adapters/react-flow/projection.ts` | 深度完整 | 深度完整 | 4 | 确认 adapter 仍保留旧正确的相对坐标投影，但输入已从 document 投影旧 display nodes |
| 当前 `frontend/features/ontology-canvas/adapters/legacy-graph/documentBridge.ts` | 深度完整 | 深度完整 | 3 | 确认 document -> legacy display 时 membership 来自 `domainId/parentDomainId`，position 来自本体 view |
| 当前 `frontend/features/ontology-canvas/model/document/ontologyDocument.ts` | 深度完整 | 深度完整 | 4 | 确认 updateNodeView/updateDomainView 只更新单个 view，不包含 Domain 后代 offset 或 boundary cascade |
| 当前 `frontend/features/ontology-canvas/state/ontologyDocumentStore.ts` | 深度完整 | 深度完整 | 2 | 确认 store 暂无批量 interaction patch action |
| 当前 `frontend/stores/graph/nodes/*` | 深度完整 | 深度完整 | 4 | 确认旧正确逻辑仍在旧 store，但不再是 ReactFlow 投影真相源 |
| `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 25 | 修订 Phase 3B/3D 拖拽同步状态，新增 Phase 3E-A 嵌套交互契约修复 |
| `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 25 | 新增 Phase 3E-A 任务表和验收标准 |
| `NODE_DOMAIN_INTERACTION_CONTRACT_2026-05-06.zh-CN.md` | 新增 | 深度完整 | 1 | 沉淀旧交互契约、当前回归诊断和性能优化方案 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 27 | §9 新增 P0 风险记录 |

**下一轮计划：**
- 进入 Phase 3E-A：先写本体嵌套交互 model 和运行时测试，覆盖 Domain 移动后代 offset、节点约束后坐标、边界级联同步，再改 `GraphPageContent` 拖拽提交链路。

## [DOC-SYNC] 2026-05-06 16:20 — 节点与 Domain 用户视角产品交互规格补充

### A. SYNC 范围声明

**触发任务：** 用户指出上一份契约偏代码实现，希望补充从用户角度抽象出的产品交互逻辑，并检查是否遵循前端开发规范：节点 UI 配置化、UI/交互/编辑栏隔离、Domain 内创建节点自动父子关系、父 Domain 移动时子节点保持相对位移、本体节点直接展示和新增属性。

**直接变更文件：**
- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md`
- `NODE_DOMAIN_INTERACTION_CONTRACT_2026-05-06.zh-CN.md`
- `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md`
- `OPTIMIZATION_TODO_2026-04-29.zh-CN.md`

**预计连带影响：**
- Phase 3E-A 以产品交互规格作为用户验收标准，以技术契约作为实现正确性约束。
- 新增 Phase 3E-B：节点 UI 产品化与配置化，避免把本体节点 UI、交互 model 和右侧编辑栏继续绑在一起；旧 graph store 退场顺延为 Phase 3E-C。

### C. SYNC 结果

**关键发现：**
- (verified) 原 `NODE_DOMAIN_INTERACTION_CONTRACT_2026-05-06.zh-CN.md` 偏技术视角，解释坐标、投影、store/document 同步问题，但没有完整表达“用户最终应该获得什么交互体验”。
- (verified) `FRONTEND_ARCHITECTURE_RULES.zh-CN.md` 已有 R4/R5/P1-P16，要求 feature 内 model/ui/blocks 强拆、UI 配置和样式分离、算法配置与 UI token 分离、图编辑器 LOD/viewport culling 等性能红线。
- (verified) 新增产品规格后，Domain 内创建节点、拖放归属、父 Domain 移动、自动扩展、折叠、节点属性展示、节点上新增属性、编辑栏同步、UI 配置化和分层验收都已独立表达。

**修订的旧结论：**
- 原来把 `NODE_DOMAIN_INTERACTION_CONTRACT` 当作唯一交互契约。现在拆成两层：产品交互规格决定用户体验和验收；技术交互契约决定实现不变量和回归修复。

**新增文档：**
- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md`：用户视角的节点/Domain 产品交互规格。

**架构计划更新：**
- `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` 新增产品规格与技术契约的关系，并补充节点 UI 与编辑解耦要求。
- `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` 新增 Phase 3E-B：节点 UI 产品化与配置化，并补回 Phase 3E-C：旧 graph store 继续退场。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` | 新增 | 深度完整 | 1 | 从用户角度沉淀 Domain 创建/拖放/移动/扩展/折叠、节点属性展示/新增/折叠、编辑栏同步、UI 配置化和性能体验 |
| `NODE_DOMAIN_INTERACTION_CONTRACT_2026-05-06.zh-CN.md` | 深度完整 | 深度完整 | 2 | 增加与产品交互规格的分工说明，避免技术契约替代产品验收 |
| `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 26 | Phase 3E-A 链接产品规格，新增节点 UI 与编辑解耦补充 |
| `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 26 | 新增 Phase 3E-B 节点 UI 产品化与配置化任务表 |

**下一轮计划：**
- 执行 Phase 3E-A 代码修复前，先按产品规格写本体嵌套交互测试，再实现技术契约中的 view patch。

## [DOC-SYNC] 2026-05-06 16:43 — 画布交互与性能优化研究沉淀

### A. SYNC 范围声明

**触发任务：** 用户要求上网搜索类似画布节点交互的性能优化经验，重点关注拖拉拽、嵌套拖拽、成组拖拽和交互丝滑度；同时参考本地 Dify 画布实现，沉淀成独立长期文档，并补充到当前产品交互和实现规划里。

**直接变更文件：**
- `CANVAS_INTERACTION_PERFORMANCE_RESEARCH_2026-05-06.zh-CN.md`
- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md`
- `NODE_DOMAIN_INTERACTION_CONTRACT_2026-05-06.zh-CN.md`
- `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md`
- `OPTIMIZATION_TODO_2026-04-29.zh-CN.md`

**参考来源：**
- React Flow 官方性能文档：`https://reactflow.dev/learn/advanced-use/performance`
- React Flow Sub Flows / 父子节点文档：`https://reactflow.dev/learn/layouting/sub-flows`
- tldraw 官方性能文档：`https://tldraw.dev/sdk-features/performance`
- Dify 本地 workflow canvas：`/home/aseit/桌面/cloud/.dify/dify-main/web/app/components/workflow`
- 旧项目存档：`/home/aseit/桌面/cloud/knowledge-graph`

### C. SYNC 结果

**关键发现：**
- (verified) React Flow 的大图性能重点不是单点优化，而是自定义节点/边 memo、稳定引用、避免组件订阅整张 nodes/edges、隐藏或折叠不需要渲染的元素。
- (verified) React Flow 父子节点适合 Domain 投影，但 child position 是相对父节点的；本项目不能直接把 ReactFlow position 当本体真相坐标。
- (verified) tldraw 的无限画布性能思想适合作为 LOD/视口裁剪参考：远景要真实减少渲染内容，不能只传一个 LOD 标记。
- (verified) Dify 把节点交互、草稿同步、历史记录拆开：拖拽中主要更新画布态和辅助线，拖拽结束后再 sync draft/history；draft sync 默认 5s debounce，视口变化在 onEnd 后同步，页面隐藏时使用 sendBeacon。
- (verified) Dify 的 Iteration/Loop 嵌套节点使用 `parentId`、padding 限制、父容器扩展和同层连接限制；可以借鉴交互节奏和容器约束，但不能照搬数据契约，因为本项目本体 view 必须继续保存绝对坐标。

**新增文档：**
- `CANVAS_INTERACTION_PERFORMANCE_RESEARCH_2026-05-06.zh-CN.md`：整理 React Flow、tldraw、Dify 和旧项目的经验，明确拖拽中视觉态、拖拽结束批量本体 patch、Domain 后代 offset、LOD 真实降 DOM、store/UI/layout/data-layer 分离等要求。

**规划更新：**
- `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md`：Phase 3E-A 新增研究文档引用，补充“拖拽中只保留视觉态，拖拽结束一次性提交本体事务”的实现约束。
- `OPTIMIZATION_TODO_2026-04-29.zh-CN.md`：Phase 3E-A 新增拖拽事件链路重构任务；Phase 3E-B 新增 LOD 真实减少 DOM 的任务。
- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md`：性能体验要求引用研究文档，但仍以产品验收为最终标准。
- `NODE_DOMAIN_INTERACTION_CONTRACT_2026-05-06.zh-CN.md`：技术契约引用研究文档，明确其补充拖拽节奏、同步策略、LOD 和 Dify 工程拆法。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `CANVAS_INTERACTION_PERFORMANCE_RESEARCH_2026-05-06.zh-CN.md` | 新增 | 深度完整 | 1 | 沉淀画布拖拽、嵌套、成组移动、LOD、持久化同步和 Dify 参考经验 |
| Dify `web/app/components/workflow/index.tsx` | 外部对照 | 深度完整 | 1 | 确认 ReactFlow 事件接线、viewport onEnd sync、node/edge/selection hooks 分离 |
| Dify `use-nodes-interactions.ts` | 外部对照 | 深度完整 | 1 | 确认拖拽 start/drag/stop、辅助线、嵌套节点创建、同层连接和 resize 约束 |
| Dify `use-selection-interactions.ts` | 外部对照 | 深度完整 | 1 | 确认 selection drag 只更新被拖拽节点 |
| Dify `use-nodes-sync-draft.ts` | 外部对照 | 深度完整 | 1 | 确认 draft sync 独立 hook 和页面关闭 sendBeacon |
| Dify `workflow-draft-slice.ts` | 外部对照 | 深度完整 | 1 | 确认 draft sync debounce 5s |
| Dify `nodes/iteration/use-interactions.ts` | 外部对照 | 深度完整 | 1 | 确认 nested child padding 限制、父容器扩展、子节点复制 |
| Dify `nodes/loop/use-interactions.ts` | 外部对照 | 深度完整 | 1 | 确认 Loop 嵌套规则与 Iteration 类似 |
| Dify `utils/node.ts` | 外部对照 | 深度完整 | 1 | 确认 nested position 由 child position 减 parent position |
| `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 27 | Phase 3E-A/3E-B 新增研究文档约束 |
| `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 27 | 新增拖拽事件链路和 LOD 真实降 DOM 任务 |
| `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` | 深度完整 | 深度完整 | 2 | 性能体验要求引用研究文档 |
| `NODE_DOMAIN_INTERACTION_CONTRACT_2026-05-06.zh-CN.md` | 深度完整 | 深度完整 | 3 | 性能优化方案引用研究文档 |

**下一轮计划：**
- 进入 Phase 3E-A 代码实现：先写 `domainNesting` 运行时测试，覆盖 Domain 移动后代 offset、节点约束后坐标和边界级联；再改 `GraphPageContent` 拖拽提交链路。

## [DOC-SYNC] 2026-05-06 17:29 — Phase 3E 开发执行计划与前置阅读门禁

### A. SYNC 范围声明

**触发任务：** 用户要求根据节点/Domain 产品交互规格、技术交互契约和性能研究文档，重新制定更详细的开发规划，并加入开发前必须阅读对应文档内容的规则，避免上下文压缩后任务偏离。

**直接变更文件：**
- `PHASE_3E_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md`
- `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md`
- `OPTIMIZATION_TODO_2026-04-29.zh-CN.md`
- `CODEBASE.md`
- `ITERATION_LOG.md`

**本轮已读文档：**
- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` §3-§10
- `NODE_DOMAIN_INTERACTION_CONTRACT_2026-05-06.zh-CN.md` §1-§8
- `CANVAS_INTERACTION_PERFORMANCE_RESEARCH_2026-05-06.zh-CN.md` §1-§12
- `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` §15
- `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` Phase 3E-A/B/C

### C. SYNC 结果

**新增文档：**
- `PHASE_3E_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md`：Phase 3E 详细执行计划，包含开发前必读规则、必读章节对应表、全局开发规则、Phase 3E-A/B/C 任务拆分、验收命令、Phase 4 前置门禁和下一步推荐三轮任务。

**新增门禁：**
- 任何涉及节点、Domain、拖拽、嵌套、节点 UI、LOD、布局和旧 graph store 退场的开发任务，开工前必须阅读四份 Phase 3E 文档。
- 开工前必须在 `ITERATION_LOG.md` 写明本轮已读章节、本轮不变量、禁止事项和验收命令。
- 没有完成前置阅读记录，不进入代码修改。
- 若实现方案和产品规格、技术契约或性能研究冲突，先暂停修订方案，不直接写代码。

**规划更新：**
- `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md`：Phase 3E-A 引用新增执行计划，并加入开发前置规则。
- `OPTIMIZATION_TODO_2026-04-29.zh-CN.md`：Phase 3E-A 前新增必读门禁任务表，要求把阅读记录和不变量写入 `ITERATION_LOG.md`。
- `CODEBASE.md`：项目概览和风险登记册同步 Phase 3E 前置阅读门禁，新增 Phase 3E 文档入口。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `PHASE_3E_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` | 新增 | 深度完整 | 1 | Phase 3E 详细执行计划和开发前必读门禁 |
| `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 28 | Phase 3E 引入执行计划和前置阅读规则 |
| `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 28 | Phase 3E-A 增加开发前必读门禁任务 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 28 | 同步 Phase 3E 文档入口和前置阅读 P0 风险 |
| `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` | 深度完整 | 深度完整 | 3 | 作为 Phase 3E 产品验收来源 |
| `NODE_DOMAIN_INTERACTION_CONTRACT_2026-05-06.zh-CN.md` | 深度完整 | 深度完整 | 4 | 作为 Phase 3E 技术不变量来源 |
| `CANVAS_INTERACTION_PERFORMANCE_RESEARCH_2026-05-06.zh-CN.md` | 深度完整 | 深度完整 | 2 | 作为拖拽节奏、LOD、Dify 经验来源 |

**下一轮计划：**
- 进入 Phase 3E-A 第一轮代码实现前，先按 `PHASE_3E_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` §2 在 `ITERATION_LOG.md` 写开发前置声明，再新增 `domainNesting.ts` 和 `test-domain-nesting-interactions.mjs`。

## [DOC-SYNC] 2026-05-06 17:39 — 后续所有阶段规划与门禁调整

### A. SYNC 范围声明

**触发任务：** 用户指出不只是 Phase 3E，后续所有阶段规划都需要按新交互/性能/架构规则调整，并纳入开发前阅读门禁。

**直接变更文件：**
- `FUTURE_PHASES_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md`
- `PHASE_3E_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md`
- `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md`
- `OPTIMIZATION_TODO_2026-04-29.zh-CN.md`
- `CODEBASE.md`
- `ITERATION_LOG.md`

**本轮已读文档：**
- `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` §15-§20
- `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` Phase 3E 与暂缓任务
- `PHASE_3E_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` §1-§4
- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` §3-§10
- `NODE_DOMAIN_INTERACTION_CONTRACT_2026-05-06.zh-CN.md` §5-§8
- `CANVAS_INTERACTION_PERFORMANCE_RESEARCH_2026-05-06.zh-CN.md` §7-§12

### C. SYNC 结果

**新增文档：**
- `FUTURE_PHASES_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md`：Phase 3E 到 Phase 8 的后续阶段总计划，覆盖全局开发门禁、基础必读文档、阶段顺序、Phase 4 UI feature 化、Phase 5 算法层、Phase 6 Workspace/Subgraph/Repository、Phase 7 Legacy 清理、Phase 8 本体导入导出与推理准备。

**阶段规划调整：**
- Phase 3E：保留为运行态稳定阶段，继续使用 `PHASE_3E_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` 作为详细子计划。
- Phase 4：UI feature 化、blocks 接线、纯 UI 组件、token/density、LOD/collapse、旧 UI 主体退场。
- Phase 5：算法层 DTO、layout job、worker、edge optimizer patch、command/patch history。
- Phase 6：从“Workspace/Subgraph”扩展为 Subgraph navigation、schema migrations、repository adapter 稳定、PostgreSQL JSONB adapter、subgraph persistence。
- Phase 7：明确只做 legacy 文件/schema/文档/包管理器/边界检查清理，不承担运行态切换。
- Phase 8：新增本体导入、导出与推理准备，要求先设计 `OntologyImportDraft`，不恢复 Mermaid 临时导入主线。

**规划更新：**
- `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md`：近期顺序扩展到 Phase 8，§16-§19.1 改为带拆分和出口标准的后续阶段规划。
- `OPTIMIZATION_TODO_2026-04-29.zh-CN.md`：新增后续阶段总门禁和 Phase 4-8 任务表。
- `PHASE_3E_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md`：补充说明其只是 Phase 3E 子计划，后续所有阶段以总计划为准。
- `CODEBASE.md`：项目概览、目录图和风险登记册同步后续阶段总计划和 P0 开工记录风险。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `FUTURE_PHASES_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` | 新增 | 深度完整 | 1 | Phase 3E-8 后续阶段总计划和全局门禁 |
| `PHASE_3E_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` | 深度完整 | 深度完整 | 2 | 标记为 Phase 3E 子计划，后续阶段参考总计划 |
| `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 29 | Phase 4-8 规划重写并引用总计划 |
| `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 29 | 新增 Phase 4-8 任务表和后续阶段门禁 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 29 | 同步 Future Phases 文档入口和 P0 开工门禁风险 |

**下一轮计划：**
- 仍按总计划先进入 Phase 3E-A 第一轮代码实现；开工前必须按 `FUTURE_PHASES_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` 和 `PHASE_3E_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` 写本轮开工声明。

## [DOC-SYNC] 2026-05-06 17:51 — 阶段顺序修正：先交互和 UI，再算法

### A. SYNC 范围声明

**触发任务：** 用户明确要求“先改交互和 UI 再改算法”，需要把后续阶段规划从“算法先行”修正为“交互正确性 → UI 产品化/feature 化 → 算法 DTO/worker/history”。

**直接变更文件：**
- `FUTURE_PHASES_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md`
- `PHASE_3E_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md`
- `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md`
- `OPTIMIZATION_TODO_2026-04-29.zh-CN.md`
- `CODEBASE.md`
- `ITERATION_LOG.md`

**本轮已读文档：**
- `FUTURE_PHASES_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` §4-§12
- `PHASE_3E_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` §4/§7/§8
- `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` §15-§17
- `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` Phase 3E-C、Phase 4、Phase 5
- `CODEBASE.md` 项目概览、layout 风险和 workspace 风险项

### C. SYNC 结果

**当前有效阶段顺序：**
- Phase 3E-A：先修复节点/Domain 嵌套交互。
- Phase 3E-B：节点 UI 产品化与配置化。
- Phase 3E-C：清理主交互/显示路径旧 graph 真相源，并登记算法迁移清单。
- Phase 4：UI feature 化与旧 UI 退场。
- Phase 5：算法层 DTO、layout job、worker、edge optimizer patch、command/patch history。

**关键修正：**
- 3E-C 不再正式迁移 layout/history/edge optimizer，只做主路径清理和 Phase 5 迁移清单。
- Phase 4 固定为 UI feature 化，不做算法 DTO。
- Phase 5 固定为算法层重构，且必须等节点 UI、token/config、LOD/collapse 和尺寸来源稳定后再开始。
- `Canvas.graphData` 不在 Phase 3E-C 删除；删除条件推迟到 Phase 5/6 完成算法与 workspace schema 收口后。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `FUTURE_PHASES_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` | 深度完整 | 深度完整 | 2 | 总阶段顺序已统一为 Phase 4 UI、Phase 5 算法 |
| `PHASE_3E_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` | 深度完整 | 深度完整 | 3 | 明确 3E-C 只登记 Phase 5 算法迁移范围 |
| `ARCHITECTURE_REDESIGN_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 30 | 近期顺序和 §16/§17 已同步新顺序 |
| `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 30 | 3E-C、Phase 4、Phase 5 任务表已同步新顺序 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 30 | 修正 layout DTO 阶段归属和 `Canvas.graphData` 删除条件 |

**下一轮计划：**
- 进入代码开发时仍从 Phase 3E-A 开始；完成交互修复后进入 3E-B 节点 UI，再进入 Phase 4 UI feature 化，最后才开始 Phase 5 算法重构。

## [DEV-KICKOFF] 2026-05-06 18:12 — Phase 3E-A 节点/Domain 嵌套交互修复

### A. 本轮任务

继续优化，进入 Phase 3E-A 第一轮代码实现。优先修复节点/Domain 拖拽提交契约：本体 view 保存绝对坐标，ReactFlow 相对坐标只在 adapter 层存在，拖拽停止后由纯 model 生成批量 interaction patch。

### B. 必读文档已读

- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` §3/§4/§5
- `NODE_DOMAIN_INTERACTION_CONTRACT_2026-05-06.zh-CN.md` §1-§5
- `CANVAS_INTERACTION_PERFORMANCE_RESEARCH_2026-05-06.zh-CN.md` §1-§6
- `PHASE_3E_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` §2-§5
- `FUTURE_PHASES_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` §4/§5/§12

### C. 本轮不变量

- `OntologyViewState.nodeViews/domainViews.position` 必须保持画布绝对坐标。
- ReactFlow child relative position 必须在提交时转换回 absolute position。
- Domain 移动必须在同一个 patch 中平移所有后代 node/domain view。
- 节点拖拽提交到本体 view 的位置必须是约束后的最终位置。
- Domain 边界级联必须写回 `OntologyViewState.domainViews`，不能只写旧 graph store。

### D. 本轮禁止事项

- 不在拖拽中保存 workspace JSON。
- 不在拖拽中触发布局或全图边优化。
- 不让旧 graph store 继续作为最终位置和边界真相源。
- 不提前做 Phase 5 算法 DTO/worker/history。
- 不为了兼容旧图保留新的主路径依赖。

### E. 本轮验收命令

- `cd frontend && npm run test:domain:nesting`
- `cd frontend && npm run test:react-flow-adapter`
- `cd frontend && npm run test:ontology:document-store`
- `cd frontend && npm run check:phase2`
- `cd frontend && npm run lint`
- `git diff --check`

### F. 本轮完成记录（2026-05-06 18:27）

**代码变更：**
- 新增 `frontend/features/ontology-canvas/model/interactions/domainNesting.ts`，提供本体 view 交互事务：ReactFlow 相对坐标转 absolute、节点约束、Domain 后代收集、Domain 边界级联、节点/Domain drag 和 resize patch。
- `ontologyDocumentStore` 新增 `applyInteractionPatch()`，一次性提交 interaction patch 并返回新 document。
- `GraphPageContent` 的拖拽停止和尺寸变化接入 `commitNodeDrag/commitDomainDrag/commitNodeResize/commitDomainResize`，不再让旧 `handleGroupMove/updateNodePosition/updateGroupBoundary` 承担最终位置和边界真相源。
- 新增 `frontend/scripts/test-domain-nesting-interactions.mjs`，并加入 `npm run test:domain:nesting` 与 `check:phase2`。
- `test-ontology-document-store.mjs` 增加 `applyInteractionPatch()` 覆盖。

**本轮确认：**
- 主拖拽路径已经从旧 graph store 写位置，切换为本体 document interaction patch。
- Domain 移动会在同一个 patch 中平移所有后代 node/domain view。
- 节点拖拽提交的是约束后的 absolute position。
- 节点/Domain resize 会触发本体 Domain boundary cascade。
- 旧 graph store 仍作为 display cache、旧编辑器兼容和 Phase 5 前 edge optimizer 输入存在；这不是最终状态，后续按 Phase 3E-C/Phase 5 清理。

**验证结果：**
- PASS：`cd frontend && npm run test:domain:nesting`
- PASS：`cd frontend && npm run test:ontology:document-store`
- PASS：`cd frontend && npm run test:canvas:interactions`
- PASS：`cd frontend && npm run test:react-flow-adapter`
- PASS：`cd frontend && npm run check:architecture`
- PASS：`cd frontend && npm run lint`
- PASS：`cd frontend && npm run check:phase2`
- PASS：`cd frontend && npm run build`

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/features/ontology-canvas/model/interactions/domainNesting.ts` | 新增 | 深度完整 | 1 | Phase 3E-A 交互事务模型，覆盖 Domain 后代 offset、节点约束、边界级联和 patch apply |
| `frontend/features/ontology-canvas/state/ontologyDocumentStore.ts` | 深度完整 | 深度完整 | 2 | 新增 applyInteractionPatch store 入口 |
| `frontend/components/graph/core/GraphPageContent.tsx` | 深度完整 | 深度完整 | 2 | 拖拽/resize 主路径改为本体 interaction patch，再投影旧 display cache |
| `frontend/scripts/test-domain-nesting-interactions.mjs` | 新增 | 深度完整 | 1 | 覆盖 ReactFlow relative->absolute、Domain move、node constrain、boundary cascade |
| `frontend/scripts/test-ontology-document-store.mjs` | 深度完整 | 深度完整 | 2 | 新增 applyInteractionPatch 断言 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 31 | 同步 Phase 3E-A 模块、函数、数据流和风险登记 |

**下一轮计划：**
- 继续 Phase 3E-A/3E-C 之间的主路径清理：检查 `useNodeExpansion` 展开后是否需要走 interaction patch 触发 Domain boundary cascade，并登记 edge optimizer/history/layout 仍读取旧 display objects 的 Phase 5 迁移清单。

## [DEV-KICKOFF] 2026-05-07 — Phase 3E-A 节点展开/折叠交互补齐

### A. 本轮任务

继续 Phase 3E-A。修复类节点展开/折叠时仍走旧 view 更新路径的问题：展开/折叠必须写入本体 `OntologyViewState`，如果节点位于 Domain 内，必须触发祖先 Domain 边界级联；旧 graph store 只能作为显示缓存同步，不再作为尺寸和边界真相源。

### B. 本轮必读

- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` §4.4 / §5.4
- `NODE_DOMAIN_INTERACTION_CONTRACT_2026-05-06.zh-CN.md` §2.6 / §5
- `CANVAS_INTERACTION_PERFORMANCE_RESEARCH_2026-05-06.zh-CN.md` §6 / §8
- `PHASE_3E_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` §5.4 / §6
- `FUTURE_PHASES_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` Phase 3E / Phase 4

### C. 本轮不变量

- 展开/折叠属于节点交互，不属于算法阶段。
- 节点尺寸、展开状态、Domain 边界必须由本体 interaction patch 批量提交。
- ReactFlow / 旧 graph store 只能承接显示投影，不拥有本体位置和尺寸规则。
- UI hook 不拥有嵌套规则；嵌套、约束和边界级联规则留在纯 model。
- 不在展开/折叠路径触发布局、edge optimizer、全图重算或持久化保存。

### D. 本轮验收命令

- `cd frontend && npm run test:domain:nesting`
- `cd frontend && npm run test:canvas:interactions`
- `cd frontend && npm run test:react-flow-adapter`
- `cd frontend && npm run test:ontology:document-store`
- `cd frontend && npm run check:phase2`
- `cd frontend && npm run lint`
- `cd frontend && npm run build`
- `git diff --check`

### E. 本轮完成记录

**代码变更：**
- `frontend/features/ontology-canvas/model/interactions/domainNesting.ts` 的 `commitNodeResize()` 增加 `expanded` patch 支持，节点尺寸变化和展开/折叠可以在同一个 interaction patch 中提交。
- `frontend/components/graph/core/hooks/useNodeExpansion.ts` 不再直接 `updateNode()` 写旧 graph store；点击展开/折叠时读取当前本体 document，调用 `commitNodeResize()`，再通过 `ontologyDocumentStore.applyInteractionPatch()` 写入本体 view。
- 展开/折叠成功后，旧 graph store 只接收 `projectOntologyDocumentToLegacyGraphNodes/Edges()` 的 display cache 投影。
- `frontend/scripts/test-domain-nesting-interactions.mjs` 增加展开状态断言：`commitNodeResize()` 必须写 `expanded`，并触发 Domain boundary cascade。

**本轮确认：**
- Domain 内节点展开/折叠会更新本体 `nodeViews[nodeId].expanded/width/height`。
- 如果展开导致节点尺寸变大，父 Domain 和祖先 Domain 的边界级联写回 `domainViews`。
- `useNodeExpansion` 没有订阅整张本体 document；点击时才从 store 读取当前 document，避免每个节点被全图 document 更新牵连重渲染。
- 静态回查确认拖拽/resize 主路径不再调用旧 `handleGroupMove/updateNodePosition/updateGroupBoundary`。剩余旧 `updateNode()` 调用集中在 `NoteNode/BaseNode/GroupNode` 的标题、内容、手动展开尺寸缓存等 UI 编辑入口，已登记到 Phase 3E-B/Phase 4 清理。

**验证结果：**
- PASS：`cd frontend && npm run test:domain:nesting`
- PASS：`cd frontend && npm run test:canvas:interactions`
- PASS：`cd frontend && npm run test:react-flow-adapter`
- PASS：`cd frontend && npm run test:ontology:document-store`
- PASS：`cd frontend && npm run check:phase2`
- PASS：`cd frontend && npm run lint`
- PASS：`cd frontend && npm run build`
- PASS：`git diff --check`
- PASS：`curl -I --max-time 10 http://localhost:3000` 返回 200
- 备注：`lint/build` 仅输出 `baseline-browser-mapping` 数据过期提示，非本轮代码错误。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/components/graph/core/hooks/useNodeExpansion.ts` | 深度完整 | 深度完整 | 2 | 展开/折叠从旧 updateNode 改为本体 commitNodeResize + applyInteractionPatch，再投影旧 display cache |
| `frontend/features/ontology-canvas/model/interactions/domainNesting.ts` | 深度完整 | 深度完整 | 2 | commitNodeResize 增加 expanded patch，并继续负责 Domain boundary cascade |
| `frontend/scripts/test-domain-nesting-interactions.mjs` | 深度完整 | 深度完整 | 2 | 增加 expanded 写入和展开后 Domain 边界扩展断言 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 32 | 同步展开/折叠链路、数据流和风险登记 |

**下一轮计划：**
- 继续 Phase 3E-A/3E-C 收尾：登记 layout/history/edge optimizer 旧 display object 依赖清单，随后进入 Phase 3E-B 节点 UI 产品化与配置化，不提前做算法 DTO。

## [DEV-KICKOFF] 2026-05-07 — Phase 3E-B 节点 UI 与语义编辑混合推进

### A. 本轮任务

进入 Phase 3E-B 第一轮实现。目标是把旧 Note 节点外观替换为更接近本体类图节点的 UI，同时保持 Phase 3E-A 的交互事务不回退：节点 UI 只收 props/callback，尺寸和密度进入 feature config，节点上的新增属性入口必须写本体语义数据，再投影旧 display cache。

### B. 本轮必读

- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` §5.1 / §5.2 / §5.3 / §5.4 / §7
- `NODE_DOMAIN_INTERACTION_CONTRACT_2026-05-06.zh-CN.md` §5
- `CANVAS_INTERACTION_PERFORMANCE_RESEARCH_2026-05-06.zh-CN.md` §4.1 / §5 / §8
- `PHASE_3E_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` §6
- `FUTURE_PHASES_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` Phase 3E-B / Phase 4

### C. 本轮不变量

- 节点 UI 组件不得直接 import store、ReactFlow、data-layer 或 interaction model。
- UI 组件只接收 props、token、callback；语义写入在旧 wrapper/block 层接线。
- 节点外观必须展示本体类型、关键属性和属性数量。
- “新增属性”不能只是假按钮，必须写入 `OntologyDocumentState.graph.nodes[nodeId].fields`。
- 新增属性造成显示数据变化后，旧 graph store 只能接收本体 document 投影结果。
- 不启动算法 DTO/worker/history，不改 layout 主线。

### D. 本轮验收命令

- `cd frontend && npm run test:canvas:interactions`
- `cd frontend && npm run test:ontology:document`
- `cd frontend && npm run test:ontology:legacy-bridge`
- `cd frontend && npm run test:domain:nesting`
- `cd frontend && npm run check:phase2`
- `cd frontend && npm run lint`
- `cd frontend && npm run build`
- `git diff --check`

### E. 本轮完成记录

**代码变更：**
- 新增 `frontend/features/ontology-canvas/config/nodeViewTokens.ts` 和 `config/index.ts`，把本体节点 UI 的尺寸、间距、字号、字段显示数量、图标尺寸和语义色收进 feature config。
- 新增 `frontend/features/ontology-canvas/ui/ClassNodeView.tsx`、`NodeFieldList.tsx`、`NodeSection.tsx` 和 `ui/index.ts`，节点 UI 只收 props/token/callback，不 import store、ReactFlow 或 data-layer。
- 新增 `frontend/features/ontology-canvas/model/interactions/nodeFields.ts`，提供 `createUniqueOntologyFieldName/createDefaultOntologyField/appendDefaultOntologyField`，让“新增属性”不在 UI 里拼字段结构。
- `frontend/components/graph/nodes/NoteNode.tsx` 不再渲染旧 Markdown Note 卡片，改为接入 `ClassNodeView` 展示本体类型、字段列表、字段数量、描述和 LOD。
- `NoteNode` 的节点上新增字段入口已接 `appendDefaultOntologyField + updateOntologyNodeInDocument + applyCommandResult`，成功后把本体 document 投影回旧 display cache。
- `frontend/features/ontology-canvas/index.ts` 保持不导出 TSX UI，避免轻量 Node 测试 loader 加载 feature 根出口时解析 JSX；UI 通过 `features/ontology-canvas/ui` 子出口接入。
- `frontend/scripts/test-canvas-interactions.mjs` 增加默认字段生成和字段名去重断言。

**本轮确认：**
- 本体节点已经开始从“普通 Note”转成“类图式节点”：标题、类型、字段、字段数量和描述都在节点上可见。
- LOD 在节点 UI 层开始真实减少 DOM：`dot/outline` 不渲染字段列表，`compact` 只显示字段数量，`full` 才渲染字段行和新增字段按钮。
- 节点上新增属性是真实语义写入，落在 `OntologyDocumentState.graph.nodes[nodeId].fields`，旧 graph store 不再作为字段真相源。
- 仍保留的旧 UI 写入：手动 resize 后的 `customExpandedSize` 仍写旧 `updateNode()`；GroupNode/Domain UI 还未产品化，下一批继续处理。

**验证结果：**
- PASS：`cd frontend && npm run test:canvas:interactions`
- PASS：`cd frontend && npm run test:ontology:document`
- PASS：`cd frontend && npm run test:ontology:legacy-bridge`
- PASS：`cd frontend && npm run test:domain:nesting`
- PASS：`cd frontend && npm run check:architecture`
- PASS：`cd frontend && npm run check:phase2`
- PASS：`cd frontend && npm run lint`
- PASS：`cd frontend && npm run build`
- PASS：`git diff --check`
- 备注：`lint/build` 仍有 `baseline-browser-mapping` 数据过期提示，非本轮代码错误。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/features/ontology-canvas/config/nodeViewTokens.ts` | 新增 | 深度完整 | 1 | 本体节点 UI token/config，覆盖尺寸、间距、字号、LOD 字段限制和类型色 |
| `frontend/features/ontology-canvas/config/index.ts` | 新增 | 深度完整 | 1 | config 子出口 |
| `frontend/features/ontology-canvas/ui/ClassNodeView.tsx` | 新增 | 深度完整 | 1 | 纯本体节点 UI，支持类型、字段、描述、LOD、展开和新增字段 callback |
| `frontend/features/ontology-canvas/ui/NodeFieldList.tsx` | 新增 | 深度完整 | 1 | 纯字段列表 UI |
| `frontend/features/ontology-canvas/ui/NodeSection.tsx` | 新增 | 深度完整 | 1 | 纯节点分区 UI |
| `frontend/features/ontology-canvas/ui/index.ts` | 新增 | 深度完整 | 1 | UI 子出口，未挂到 feature 根出口 |
| `frontend/features/ontology-canvas/model/interactions/nodeFields.ts` | 新增 | 深度完整 | 1 | 默认字段生成和字段名去重纯模型 |
| `frontend/components/graph/nodes/NoteNode.tsx` | 深度完整 | 深度完整 | 2 | legacy wrapper 接入 ClassNodeView，并实现节点上新增字段语义写入 |
| `frontend/scripts/test-canvas-interactions.mjs` | 深度完整 | 深度完整 | 3 | 增加 nodeFields 断言 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 33 | 同步 Phase 3E-B UI/config/model、数据流和风险登记 |

**下一轮计划：**
- 继续 Phase 3E-B：补 DomainNodeView / GroupNode 产品化，处理 Domain 折叠摘要和 GroupNode 的 LOD；随后把手动展开尺寸缓存从旧 `updateNode()` 迁到本体 view/metadata。

## [DEV-KICKOFF] 2026-05-07 — PRD 收敛、交互性能与文档清理

### A. 本轮任务

根据用户新补充的 PRD 和四张 UI/交互参考图，重新收敛当前项目约束：节点 resize 卡顿、边锚点自适应、LOD/子画布/正交边/节点嵌套 UI 参考、当前性能优化缺口，以及过时中间文档归档。目标是先把权威文档和任务边界理清，再决定本轮代码切入点，避免继续在过时计划上堆实现。

### B. 本轮必读

- `prd.md`：新 PRD，确认“节点即容器 / 子画布 / LOD / 正交边 / 导航”的目标形态。
- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md`：当前节点与 Domain 产品交互契约，更新与 PRD 冲突或过时的状态。
- `CANVAS_INTERACTION_PERFORMANCE_RESEARCH_2026-05-06.zh-CN.md`：交互性能约束，补充 resize/edge anchor/LOD 验收。
- 当前节点、边、ReactFlow adapter、viewport/resize hooks：排查 resize 卡顿和边位置适配落点。

### C. 本轮不变量

- 当前短期修复仍保证节点嵌套/Domain 交互正确；中长期产品语义向“节点即容器、子画布导航”收敛。
- UI 参考图只进入产品规格和 token/config 方向，不把视觉尺寸硬编码到组件。
- 性能问题先定位交互路径：拖拽/resize/zoom 中不做保存、布局、全图重算。
- 文档清理采用归档，不直接删除，保留 `CODEBASE.md`、`prd.md`、`NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` 为活跃文档。
- 不回滚用户或前序重构已有改动。

### D. 本轮验收命令

- `find . -maxdepth 2 -type f -name '*.md' | sort`
- `rg` 静态检查 resize、edge anchor、LOD、legacy 文档引用
- 如修改前端代码：继续运行 canvas/domain/ontology 测试、lint、build 和 `git diff --check`

### E. 本轮完成记录

**代码变更：**
- `GraphPageContent` 的边锚点优化从旧 `updateEdge()` 改为提交 `OntologyInteractionPatch.edgeViews`，节点拖拽、Domain 拖拽和 resize 结束后都会增量更新相关边锚点。
- Domain 拖拽后的边锚点优化不再只看 Domain 自身 id，会把 patch 中移动过的后代 node/domain view id 一起作为受影响集合。
- 节点 resize 的自定义展开尺寸迁入本体 `OntologyNodeViewState.customExpandedSize`，`NoteNode` 不再通过渲染后的 `useEffect` 写旧 graph store。
- `getCustomExpandedSizeToPersist()` 支持已有自定义尺寸后的再次 resize 更新。
- `documentBridge` 会把本体 node view 的 `customExpandedSize` 投影到旧 display cache，供当前展开/折叠 hook 过渡使用。

**文档变更：**
- 新增 `ACTIVE_DOCS.zh-CN.md`，明确后续活跃文档和归档文档边界。
- `prd.md` 增加 2026-05-07 当前落地优先级：先交互/resize/边锚点，再节点 UI，再正交边和子画布导航。
- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` 补充“Domain 是当前容器过渡概念，长期节点即容器”，并更新当前状态表。
- `CANVAS_INTERACTION_PERFORMANCE_RESEARCH_2026-05-06.zh-CN.md` 补充 resize、边锚点、正交边和 LOD 参考图约束。
- `FUTURE_PHASES_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` 的默认必读改为 `ACTIVE_DOCS + prd + rules + CODEBASE + ITERATION_LOG`，不再要求读已归档旧架构文档。
- `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` 标记旧文档归档任务完成。
- `CODEBASE.md` 同步本轮代码和文档状态。

**归档：**
- 新建 `_archive/2026-05-07-superseded-docs/`。
- 归档旧架构、审查、验证和前端经验快照，不删除文件，只让它们退出默认阅读路径。

**验证结果：**
- PASS：`cd frontend && npm run test:canvas:interactions`
- PASS：`cd frontend && npm run test:domain:nesting`
- PASS：`cd frontend && npm run test:ontology:legacy-bridge`
- PASS：`cd frontend && npm run test:react-flow-adapter`
- PASS：`cd frontend && npm run check:architecture`
- PASS：`cd frontend && npm run check:phase2`
- PASS：`cd frontend && npm run lint`
- PASS：`cd frontend && npm run build`
- PASS：`git diff --check`
- PASS：`find . -maxdepth 2 -type f -name '*.md' | sort`
- 备注：`lint/build` 仍提示 `baseline-browser-mapping` 数据超过两个月，非本轮错误。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `prd.md` | 新增 | 浅读 | 1 | 确认长期形态：节点即容器、子画布、LOD、正交边、导航 |
| `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` | 深度完整 | 深度完整 | 2 | 更新 PRD 收敛关系、显式归入容器、resize/edge anchor 状态 |
| `CANVAS_INTERACTION_PERFORMANCE_RESEARCH_2026-05-06.zh-CN.md` | 深度完整 | 深度完整 | 2 | 增加 resize、edgeViews、正交边和参考图 LOD 约束 |
| `FUTURE_PHASES_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` | 深度完整 | 深度完整 | 2 | 默认必读改为活跃文档索引和 PRD |
| `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 2 | 标记旧文档归档完成 |
| `ACTIVE_DOCS.zh-CN.md` | 新增 | 深度完整 | 1 | 活跃文档索引和归档边界 |
| `frontend/components/graph/core/GraphPageContent.tsx` | 深度完整 | 深度完整 | 3 | 边锚点写本体 edgeViews；resize 自定义展开尺寸写本体 node view |
| `frontend/components/graph/nodes/NoteNode.tsx` | 深度完整 | 深度完整 | 3 | 删除 resize 后写旧 updateNode 的 effect |
| `frontend/features/ontology-canvas/model/document/ontologyDocument.ts` | 深度完整 | 深度完整 | 2 | node view 增加 customExpandedSize |
| `frontend/features/ontology-canvas/model/interactions/domainNesting.ts` | 深度完整 | 深度完整 | 3 | commitNodeResize 支持 customExpandedSize |
| `frontend/features/ontology-canvas/model/interactions/nodeExpansion.ts` | 深度完整 | 深度完整 | 2 | customExpandedSize 可在再次 resize 后更新 |
| `frontend/features/ontology-canvas/adapters/legacy-graph/documentBridge.ts` | 深度完整 | 深度完整 | 2 | 投影 customExpandedSize 到旧 display cache |
| `frontend/types/workspace/ontologyCanvas.ts` | 深度完整 | 深度完整 | 2 | 持久化 schema 增加 node view customExpandedSize |
| `frontend/scripts/test-canvas-interactions.mjs` | 深度完整 | 深度完整 | 4 | 增加再次 resize 更新 customExpandedSize 断言 |
| `frontend/scripts/test-domain-nesting-interactions.mjs` | 深度完整 | 深度完整 | 3 | 增加 commitNodeResize 写 customExpandedSize 断言 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 34 | 同步本轮代码、文档归档和风险状态 |

**下一轮计划：**
- 继续 Phase 3E-B：DomainNodeView / GroupNode UI 产品化、Domain/容器 LOD 和折叠摘要。
- 随后进入边系统第一批：把当前贝塞尔边替换为可配置的正交边渲染，并为 Field/Method/Section 语义锚点设计数据结构。

## [DOC-REDESIGN] 2026-05-07 — 后续开发规划按新版 PRD 重排

### A. 本轮目标（阅读前声明）

**目标文件：**
- `ACTIVE_DOCS.zh-CN.md`（原因：需要让活跃文档入口成为唯一准入口，归档文件不再默认阅读）
- `prd.md`（原因：新版产品方向已变成节点即容器、子画布、LOD、正交边）
- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md`（原因：当前交互规格需要承接新版后续计划）
- `FUTURE_PHASES_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md`（原因：旧后续阶段计划仍按旧 Phase 命名和旧文档引用组织）
- `PHASE_3E_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md`（原因：旧子计划和新版 PRD/当前代码状态已有偏差）
- `UI_iamge/`（原因：用户已明确后续 UI 阶段以该目录图片为参考）

**本轮想弄清楚：**
- 哪些规划文件应该继续活跃，哪些应该归档。
- 新的后续开发顺序应如何从“Domain 过渡概念”切到“节点即容器 / 子画布”。
- UI 参考图如何进入开发门禁，避免后续 UI 阶段忘记读取。

**本轮不变量：**
- 归档文档不再作为后续开发依据。
- 交互和 UI 优先，算法后置。
- 旧实现每个阶段都要同步清理，不允许继续堆兼容层。
- `CODEBASE.md` 和本日志必须同步本轮规划变更。

### C. 本轮发现

**关键发现：**
- (verified) `FUTURE_PHASES_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` 和 `PHASE_3E_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` 仍在根目录活跃区，且路线仍按旧 Phase 3E/4/5 组织，容易和新版 `prd.md` 的“节点即容器 / 子画布 / 正交边 / LOD”方向发生偏差。
- (verified) `UI_iamge/` 已存在 4 张参考图，后续 UI 阶段必须纳入开发前必读，否则节点 UI、LOD、正交边、子画布导航可能继续按旧样式推进。

**修订的旧结论：**
- 原来：`FUTURE_PHASES_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` 是后续总计划，`PHASE_3E_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` 是当前子计划。
- 现在：二者已归档，新的唯一活跃路线图是 `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md`。

### D. 本轮完成记录

**文档变更：**
- 新增 `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md`，按新版 PRD 重排后续阶段：交互与性能基线稳定 → 节点/容器 UI 产品化 → LOD 大图浏览 → 正交边与语义锚点 → 子画布导航 → feature 化与旧 UI/store 清理 → 算法 DTO/worker/history → workspace/PG adapter → 导入导出。
- `ACTIVE_DOCS.zh-CN.md` 改为引用新的路线图，并把 `UI_iamge/` 登记为 UI 任务必读输入。
- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` 补充后续验收优先级：正交边、语义锚点、子画布导航，并明确算法/PG/导入导出后置。
- `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` 的旧计划引用改为新路线图。
- `CODEBASE.md` 同步活跃路线图、UI 图片目录、归档策略和开工门禁。
- `_archive/2026-05-07-superseded-docs/README.zh-CN.md` 补充旧计划归档说明。

**归档：**
- `FUTURE_PHASES_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` 已移动到 `_archive/2026-05-07-superseded-docs/`。
- `PHASE_3E_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` 已移动到 `_archive/2026-05-07-superseded-docs/`。

**验证结果：**
- PASS：`git diff --check`
- PASS：根目录已存在 `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md`
- PASS：根目录已不存在旧 `FUTURE_PHASES_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md`
- PASS：根目录已不存在旧 `PHASE_3E_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md`
- PASS：`UI_iamge/` 目录存在，含 4 张 UI 参考图。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `ACTIVE_DOCS.zh-CN.md` | 深度完整 | 深度完整 | 2 | 活跃入口改为新路线图，并加入 UI_iamge 必读规则 |
| `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md` | 新增 | 深度完整 | 1 | 新唯一活跃后续路线图 |
| `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` | 深度完整 | 深度完整 | 3 | 后续验收顺序补充正交边、语义锚点、子画布导航 |
| `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` | 深度完整 | 深度完整 | 3 | 旧计划引用改为新路线图 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 35 | 同步新路线图、UI 图片目录和归档门禁 |
| `FUTURE_PHASES_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` | 深度完整 | 归档 | 3 | 已移入 `_archive/2026-05-07-superseded-docs/` |
| `PHASE_3E_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md` | 深度完整 | 归档 | 4 | 已移入 `_archive/2026-05-07-superseded-docs/` |

**下一轮计划：**
- 按新路线图进入 Phase A 收尾：浏览器实测 resize/drag/edge anchor，修顺滑性和 Domain/容器折叠投影。
- UI 阶段开工前必须先查看 `UI_iamge/` 并在开工声明里列出本轮采用的参考图元素。

## [DOC-DETAIL] 2026-05-07 — 四张 UI 参考图抽象与路线图细化

### A. 本轮目标（阅读前声明）

**目标文件 / 输入：**
- `ACTIVE_DOCS.zh-CN.md`（原因：确认当前活跃文档入口和归档规则）
- `prd.md`（原因：长期方向是节点即容器、子画布、LOD、正交边和导航）
- `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md`（原因：需要把路线图按 UI 图细化为可执行任务）
- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md`（原因：短期节点/Domain 交互契约需要引用 UI 规格）
- `FRONTEND_ARCHITECTURE_RULES.zh-CN.md`（原因：路线图要继续遵守 feature/model/ui/blocks 分层和 token 规则）
- `UI_iamge/` 四张 PNG（原因：用户要求理解四张 UI 图，并让后续规划更详细）
- `CODEBASE.md`（原因：规划文档新增后需要同步项目情报）

**本轮想弄清楚：**
- 四张图分别约束哪些产品能力。
- 哪些内容应进入长期 UI/交互规格，而不是只留在图片里。
- 后续 Phase A/B/C/D/E 应如何按图拆细，避免后续上下文丢失。

**本轮参考图元素：**
- 图 1：节点嵌套、父节点内部画布、节点状态、进入/返回、内部工具栏。
- 图 2：正交边、关系类型、通用锚点、语义锚点、边聚合、边 LOD。
- 图 3：五级 LOD、真实降 DOM、Cluster 聚合、MiniMap。
- 图 4：Sub 画布进入/返回、Breadcrumb、跨画布引用、搜索定位、历史导航。

**本轮不变量：**
- 交互和 UI 优先，算法后置。
- Domain 是过渡容器概念，长期方向是任意节点都可拥有内部画布。
- UI token 和交互 model 必须分离。
- 归档文件默认不看，不恢复旧 Phase 规划。
- 本轮只做文档和规划，不改前端实现代码。

**验收命令 / 检查：**
- `git diff --check`
- `find test/knowledge_graph -maxdepth 1 -type f -name '*.md' | sort`
- `rg` 检查活跃路线图、UI 规格和旧 Phase 引用。

### C. 本轮发现

**关键发现：**
- (verified) `UI_iamge/` 下 4 张图片均为 1536x1024 PNG，分别覆盖节点嵌套系统、正交边系统、LOD / 大图浏览系统、Sub 画布导航系统。
- (verified) 这四张图不是单纯视觉样式，而是把节点状态、边语义、LOD 降级、MiniMap、Breadcrumb、搜索定位和历史导航都表达成了产品交互契约。
- (verified) 原路线图已经重排了阶段顺序，但每个阶段还不够细，后续执行时仍可能遗漏图中的关键元素。

**修订的旧结论：**
- 原来：`UI_iamge/` 作为 UI 任务必读输入即可。
- 现在：需要新增一份文字化 UI 参考规格，后续执行先读规格，再看原图，避免图片信息在上下文压缩后丢失。

### D. 本轮完成记录

**文档变更：**
- 新增 `UI_REFERENCE_INTERACTION_SPEC_2026-05-07.zh-CN.md`，把四张 UI 图沉淀为节点嵌套、正交边、LOD 大图、Sub 画布导航的产品规格、模型影响、token 要求和验收方法。
- `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md` 加细 Phase A/B/C/D/E：每个阶段补充参考图映射、任务颗粒度、清理要求和出口标准。
- `ACTIVE_DOCS.zh-CN.md` 新增 UI 参考规格为活跃文档，并把 `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` 从活跃列表移除。
- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` 引用新的 UI 参考规格，避免短期 Domain 交互规格覆盖长期节点即容器方向。
- `CANVAS_INTERACTION_PERFORMANCE_RESEARCH_2026-05-06.zh-CN.md` 的后续阶段说明从旧 Phase 3E 改为新 Phase A/B/F/G。
- `NODE_DOMAIN_INTERACTION_CONTRACT_2026-05-06.zh-CN.md` 把旧 Phase 3E 表述改为当前 Phase A。
- `CODEBASE.md` 同步新增 UI 规格、路线图细化和归档策略。
- `_archive/2026-05-07-superseded-docs/README.zh-CN.md` 补充旧 TODO 归档说明。

**归档：**
- `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` 已移动到 `_archive/2026-05-07-superseded-docs/`，后续不再作为活跃路线图或任务入口。

**验证结果：**
- PASS：`git diff --check -- test/knowledge_graph`
- PASS：根目录活跃 Markdown 列表不再包含 `OPTIMIZATION_TODO_2026-04-29.zh-CN.md`。
- PASS：归档目录包含 `FUTURE_PHASES_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md`、`PHASE_3E_DEVELOPMENT_PLAN_2026-05-06.zh-CN.md`、`OPTIMIZATION_TODO_2026-04-29.zh-CN.md`。
- PASS：活跃规格/路线图中旧 Phase 文件名只出现在“已归档、不作为依据”的说明里。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `UI_REFERENCE_INTERACTION_SPEC_2026-05-07.zh-CN.md` | 新增 | 深度完整 | 1 | 四张 UI 图的文字化执行规格 |
| `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md` | 深度完整 | 深度完整 | 2 | Phase A-E 按 UI 图细化 |
| `ACTIVE_DOCS.zh-CN.md` | 深度完整 | 深度完整 | 3 | 新增 UI 规格，移除旧 TODO 活跃入口 |
| `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` | 深度完整 | 深度完整 | 4 | 引用 UI 规格并修订旧 Phase 表述 |
| `CANVAS_INTERACTION_PERFORMANCE_RESEARCH_2026-05-06.zh-CN.md` | 深度完整 | 深度完整 | 2 | 后续阶段说明改为新 Phase A/B/F/G |
| `NODE_DOMAIN_INTERACTION_CONTRACT_2026-05-06.zh-CN.md` | 深度完整 | 深度完整 | 5 | 修订当前正确性修复阶段表述 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 36 | 同步 UI 规格、路线图细化和归档策略 |
| `OPTIMIZATION_TODO_2026-04-29.zh-CN.md` | 深度完整 | 归档 | 4 | 已移入 `_archive/2026-05-07-superseded-docs/` |

**下一轮计划：**
- 按新路线图进入 Phase A 收尾：先做浏览器实测 resize/drag/edge anchor，确认卡顿来源，再修 resize 顺滑性、显式归入/移出容器、容器折叠投影和边锚点增量更新。

## [IMPACT-ANALYSIS] 2026-05-07 — 概念图对现有节点属性和结构实现的影响评估

### A. 本轮目标（阅读前声明）

**目标文件 / 输入：**
- `UI_REFERENCE_INTERACTION_SPEC_2026-05-07.zh-CN.md`（原因：四张新概念图已沉淀为长期 UI/交互规格）
- `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md`（原因：需要判断影响是否已进入后续阶段）
- `frontend/domain/ontology/model/node.ts`（原因：判断现有本体节点属性是否足够承载图中的字段/方法/子节点/容器能力）
- `frontend/domain/ontology/model/edge.ts`（原因：判断正交边、关系类型和语义锚点对边模型影响）
- `frontend/domain/ontology/model/subgraph.ts`（原因：判断子画布导航对当前子图模型影响）
- `frontend/domain/ontology/model/domain.ts`（原因：判断 Domain 过渡容器与节点即容器的迁移影响）
- `frontend/features/ontology-canvas/model/document/ontologyDocument.ts`（原因：判断 view state、持久化和交互 patch 是否需要扩展）
- `frontend/features/ontology-canvas/ui/ClassNodeView.tsx`（原因：判断节点 UI 现状和概念图差距）

**本轮想弄清楚：**
- 新概念图是否要求修改现有节点字段结构。
- 哪些影响属于 UI/token，不需要动语义模型。
- 哪些影响属于模型/schema/命令/持久化，需要后续分阶段改。
- 哪些影响当前已有基础，哪些仍是明确缺口。

**本轮不变量：**
- 不把视觉 token 塞进本体语义模型。
- 不把 ReactFlow 相对坐标当作本体真相源。
- 不恢复旧 Phase 3E 规划。
- 本轮先做影响评估和文档同步，不改运行代码。

**验收命令 / 检查：**
- `git diff --check -- test/knowledge_graph`
- `rg` 检查影响评估已写入活跃规格和 CODEBASE。

### C. 本轮发现

**关键发现：**
- (verified) 当前 `OntologyNode` 已有 `id/name/type/description/fields/tags/domainId/subgraphId/metadata`，足够承接第一批节点 UI，但不能完整表达 methods、节点即容器、子画布导航历史和语义锚点。
- (verified) 当前 `OntologyField` 已有 `attribute/rule/constraint/interface/behavior` 分类，可短期映射 Fields / Constraints / Interfaces / Methods，但 Methods/Event 仍缺少签名、参数、返回值等强结构。
- (verified) 当前 `OntologyEdge` 只有自由字符串 `relation` 和 `direction`，不足以长期表达正交边图里的 relation type、端点符号、语义锚点和 route points。
- (verified) 当前 `OntologySubgraph` 有 `rootNodeId/domainId/nodeIds/edgeIds`，但还没有每个子画布独立 viewport、selection、LOD、breadcrumb/history。
- (verified) 当前 view state 有 node/domain/edge view、viewport、LOD 和 edgeVisibility；它适合扩展折叠、锚点、route、navigation view，但不能承载本体语义事实。

**修订的旧结论：**
- 原来：四张图主要影响 UI 和路线图。
- 现在：四张图也会影响后续 schema 演进，但不是立刻推翻现有节点模型；现有基础字段保留，methods/sections/semantic anchor/child canvas/navigation history 分阶段明确化。

### D. 本轮完成记录

**文档变更：**
- `UI_REFERENCE_INTERACTION_SPEC_2026-05-07.zh-CN.md` 新增 §9“对当前实现的影响评估”，包含影响矩阵、节点属性影响、view state 影响、边模型影响、Domain/子画布影响、持久化 schema 影响和执行结论。
- `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md` 补充护栏：后续不得把 methods、语义锚点、正交边 route、子画布导航历史等长期结构随意塞进 `metadata` 或 `display` 作为最终方案。
- `CODEBASE.md` 同步 UI 概念图对当前模型的影响，并在风险登记册新增“继续把新结构塞进 metadata/display 会形成新隐形旧实现”的 P1 风险。

**验证结果：**
- PASS：`git diff --check -- test/knowledge_graph`
- PASS：`rg` 确认影响评估已写入 `UI_REFERENCE_INTERACTION_SPEC_2026-05-07.zh-CN.md`、路线图和 CODEBASE。
- PASS：根目录活跃 Markdown 列表仍只包含当前活跃文档，旧 TODO 未回到根目录。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/domain/ontology/model/node.ts` | 深度完整 | 深度完整 | 2 | 复核节点字段对概念图的承载能力 |
| `frontend/domain/ontology/model/edge.ts` | 深度完整 | 深度完整 | 2 | 复核 relation/direction 与正交边语义差距 |
| `frontend/domain/ontology/model/domain.ts` | 深度完整 | 深度完整 | 2 | 复核 Domain 过渡容器能力 |
| `frontend/domain/ontology/model/subgraph.ts` | 深度完整 | 深度完整 | 2 | 复核子画布导航缺口 |
| `frontend/features/ontology-canvas/model/document/ontologyDocument.ts` | 深度完整 | 深度完整 | 3 | 复核 view state 和 edgeViews 扩展点 |
| `frontend/features/ontology-canvas/ui/ClassNodeView.tsx` | 深度完整 | 深度完整 | 2 | 复核当前节点 UI 与概念图差距 |
| `UI_REFERENCE_INTERACTION_SPEC_2026-05-07.zh-CN.md` | 深度完整 | 深度完整 | 2 | 新增实现影响评估 |
| `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md` | 深度完整 | 深度完整 | 3 | 补充 metadata/display 护栏 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 37 | 同步影响评估和 P1 风险 |

**下一轮计划：**
- 继续 Phase A 收尾，优先进入浏览器实测 resize/drag/edge anchor，拿到当前手感问题的真实触发路径后再改代码。

## [DEV-KICKOFF] 2026-05-07 — Phase A 交互与性能基线优化

### A. 本轮目标（阅读前声明）

**目标文件 / 输入：**
- `ACTIVE_DOCS.zh-CN.md`（原因：确认当前活跃入口和归档规则）
- `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md`（原因：本轮执行 Phase A）
- `UI_REFERENCE_INTERACTION_SPEC_2026-05-07.zh-CN.md` §9（原因：避免把新概念图能力随意塞进 metadata/display）
- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` §3/§4/§8/§10（原因：节点、Domain 和 resize/drag 正确性验收）
- `CANVAS_INTERACTION_PERFORMANCE_RESEARCH_2026-05-06.zh-CN.md` §7/§8/§9/§10（原因：拖拽、resize、LOD 和性能红线）
- `frontend/components/graph/core/GraphPageContent.tsx`（原因：ReactFlow 主交互接线和 resize/drag/edge anchor 触发点）
- `frontend/components/graph/nodes/NoteNode.tsx` / `GroupNode.tsx`（原因：节点和容器 resize/UI 渲染路径）
- `frontend/features/ontology-canvas/model/interactions/domainNesting.ts`（原因：本体 interaction patch 和边界级联）

**本轮想弄清楚：**
- resize 一卡一卡的主要来源是 DOM、store 写入、projection、edge anchor 还是保存副作用。
- 当前拖拽/resize/edge anchor 是否仍有旧 graph store 双写或高频副作用。
- 能否先做一批低风险 Phase A 优化，提升交互手感并保持本体 view 真相源。

**本轮不变量：**
- 拖拽/resize 中不保存、不布局、不全图边重算。
- 本体 view 绝对坐标仍是真相源，ReactFlow 相对坐标只在 adapter。
- edge anchor 结果写本体 `edgeViews`。
- 不把长期结构塞进 `metadata/display` 当最终方案。
- 不进入算法 DTO、worker、PG adapter。

**验收命令 / 检查：**
- `cd frontend && npm run test:domain:nesting`
- `cd frontend && npm run test:canvas:interactions`
- `cd frontend && npm run test:react-flow-adapter`
- `cd frontend && npm run check:architecture`
- `git diff --check -- test/knowledge_graph`

### C. 本轮发现

**关键发现：**
- (verified) `GraphPageContent` 已经在拖拽中跳过本体投影同步，但 resize 中没有跳过；resize 拖动时 ReactFlow 本地尺寸可能被旧本体投影覆盖，这是“一卡一卡”和尺寸回弹的高概率来源。
- (verified) 当前 `onNodesChange(dimensions)` 只在 `!change.resizing` 时提交本体 interaction patch，说明 resize 中本来就不应该写本体 document。
- (verified) `NoteNode` 里旧的 customExpandedSize 渲染副作用已移除，当前 resize 尺寸主提交点集中在 `GraphPageContent.onNodesChange(dimensions)`。

**修订的旧结论：**
- 原来：resize 结束已经写本体 view，因此 resize 手感问题可能主要来自 DOM 复杂度。
- 现在：DOM 复杂度仍是后续问题，但本轮确认还有一个更直接的问题：resize 中缺少“跳过投影覆盖”的交互态保护。

### D. 本轮完成记录

**代码变更：**
- `frontend/components/graph/core/GraphPageContent.tsx` 新增 `isResizingRef`。
- ReactFlow nodes projection sync 现在在 drag 或 resize 中都会跳过，避免本体投影覆盖 ReactFlow 本地交互视觉态。
- `onNodesChange(dimensions)` 在 `change.resizing === true` 时只标记 resize 进行中，不写本体 document；在 resize 结束后重置标记，并一次性提交 `commitNodeResize/commitDomainResize`、同步旧 display cache、触发相关边锚点优化。

**文档变更：**
- `CODEBASE.md` 同步 GraphPageContent 的 Phase A resize 投影保护，以及 Flow F-002 的 nodes sync 行为。

**验证结果：**
- PASS：`cd frontend && npm run test:domain:nesting`
- PASS：`cd frontend && npm run test:canvas:interactions`
- PASS：`cd frontend && npm run test:react-flow-adapter`
- PASS：`cd frontend && npm run check:architecture`
- PASS：`cd frontend && npm run lint`
- PASS：`cd frontend && npm run build`
- PASS：`curl -I --max-time 10 http://localhost:3000` 返回 200
- PASS：`git diff --check -- test/knowledge_graph`
- NOTE：尝试启动新的 `npm run dev` 时发现已有 Next dev 实例持有 `.next/dev/lock`，未强行终止；改用现有 3000 端口验证页面响应。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/components/graph/core/GraphPageContent.tsx` | 深度完整 | 深度完整 | 3 | Phase A resize 中跳过本体投影覆盖 |
| `frontend/features/ontology-canvas/model/interactions/domainNesting.ts` | 深度完整 | 深度完整 | 3 | 复核 resize 结束一次性提交 patch |
| `frontend/components/graph/nodes/NoteNode.tsx` | 深度完整 | 深度完整 | 2 | 确认旧 resize 副作用未回归 |
| `frontend/components/graph/nodes/GroupNode.tsx` | 深度完整 | 深度完整 | 2 | 确认容器 UI 仍是后续 Phase B/F 清理项 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 38 | 同步 Phase A resize 优化 |

**下一轮计划：**
- 继续 Phase A：实现显式归入 / 移出容器的 Inspector 或控制面板入口，或者继续做容器折叠投影，二者都应保持“旧 graph store 只做 display cache”。

## [DEV-PHASE-B1] 2026-05-07 — 节点 ViewModel 与分区化 UI 优化

### A. 本轮目标（阅读前声明）

**目标文件 / 输入：**
- `ACTIVE_DOCS.zh-CN.md`（原因：确认当前活跃文档和归档规则）
- `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md` §6（原因：本轮执行 Phase B 节点/容器 UI 产品化的第一块）
- `UI_REFERENCE_INTERACTION_SPEC_2026-05-07.zh-CN.md` §4/§6/§9（原因：确认节点嵌套、LOD 和结构化属性对 UI 的约束）
- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` §5/§6/§7/§10（原因：节点本体属性、UI token、分层边界和当前缺口）
- `frontend/features/ontology-canvas/model/document/ontologyDocument.ts`（原因：确认当前本体节点字段、关系、view 数据结构）
- `frontend/features/ontology-canvas/ui/ClassNodeView.tsx`（原因：当前节点产品 UI 主实现）
- `frontend/features/ontology-canvas/ui/NodeFieldList.tsx` / `NodeSection.tsx`（原因：字段列表和节点分区渲染）
- `frontend/features/ontology-canvas/config/nodeViewTokens.ts`（原因：节点尺寸、LOD、分区和状态样式必须配置化）
- `frontend/features/ontology-canvas/adapters/react-flow/projection.ts`（原因：确认 ClassNodeView 接收的 LOD、字段、关系和回调来源）

**本轮想弄清楚：**
- 当前节点 UI 是否仍直接拼本体/旧 graph 字段，是否需要单独的 view model mapper。
- 新 UI 参考图要求的 Fields / Methods / Rules / Interfaces / Relationships / Subcanvas indicator 哪些可以先用现有数据派生。
- 在不改交互 model、不碰布局算法的前提下，如何先把节点 UI 结构做成可继续扩展的底座。

**本轮不变量：**
- 不改变拖拽、resize、父子关系、边锚点提交路径。
- UI 组件不直接 import store、ReactFlow 或旧 graph 类型。
- 结构化节点显示走 view model / props，不把长期概念随意塞进 `metadata/display` 作为最终方案。
- LOD 必须真实减少节点 DOM，不只是缩小字号。
- UI 尺寸、颜色、分区限制继续进入 token/config。

**本轮参考图采用元素：**
- 采用：完整/紧凑/最小/远景节点状态、字段/方法/子节点数量徽标、节点可进入内部空间的提示位。
- 暂缓：真实子画布导航、MiniMap、正交边完整路由、语义锚点编辑。

**验收命令 / 检查：**
- `cd frontend && npm run test:react-flow-adapter`
- `cd frontend && npm run check:architecture`
- `cd frontend && npm run lint`
- `cd frontend && npm run build`
- `git diff --check -- test/knowledge_graph`

### C. 本轮发现

**关键发现：**
- (verified) 当前节点 UI 已经接入 `ClassNodeView`，但数据入口仍主要由 legacy attributes fallback 拼字段；这不适合继续承接 UI 参考图中的 Methods、Rules、Relationships、Child Nodes 和 Subcanvas indicator。
- (verified) 现有本体模型已经有 `fields.category`、`subgraphId`、`edges` 和 `subgraphs`，足够先做展示用 ViewModel，不需要为了本轮 UI 直接扩 schema 或把长期概念塞进 metadata。
- (verified) ReactFlow adapter 已把 `lodMode` 传到 node data；本轮可以只改节点 UI 的 DOM 降级，不触碰拖拽、resize、Domain 嵌套和边锚点提交路径。

**修订的旧结论：**
- 原来：节点 UI 已展示本体属性，下一步主要是样式打磨。
- 现在：样式打磨前必须先把节点显示数据收敛到 ViewModel，否则后续按参考图加入方法、规则、关系、子画布入口时会继续污染旧 NoteNode wrapper。

### D. 本轮完成记录

**代码变更：**
- 新增 `frontend/features/ontology-canvas/model/view/nodeViewModel.ts`，生成 `OntologyNodeViewModel`，聚合 Fields / Methods / Rules / Interfaces / Relationships / Child Nodes / Subcanvas。
- `documentBridge.projectOntologyNodeToLegacyNode()` 现在把 `ontologyViewModel` 放入 legacy display node data，供当前 ReactFlow wrapper 透传。
- `ClassNodeView` 改为优先消费 `viewModel`，并按 `dot / outline / compact / full` 分层减少 DOM。
- 新增 `NodeMetricList`，`NodeFieldList` 增加分类徽标和语义色；`nodeViewTokens` 增补 section/metric/token 配置。
- `NoteNode` 保持过渡 wrapper 职责，不直接订阅本体 document 拼 UI；新增字段路径仍写本体 document，再投影旧 display cache。
- `test-react-flow-adapter.mjs` 增加 ViewModel projection 断言，覆盖字段、方法、规则、关系和子画布计数。

**文档变更：**
- `CODEBASE.md` 同步新增 view model、节点 UI 分区组件、adapter 投影变化、函数索引和风险登记。

**验证结果：**
- PASS：`cd frontend && npm run test:react-flow-adapter`
- PASS：`cd frontend && npm run test:domain:nesting`
- PASS：`cd frontend && npm run test:canvas:interactions`
- PASS：`cd frontend && npm run check:architecture`
- PASS：`cd frontend && npm run lint`
- PASS：`cd frontend && npm run build`
- PASS：`git diff --check`（在 `test/knowledge_graph` 仓库内执行）
- PASS：`curl -I --max-time 10 http://localhost:3000` 返回 200，现有 Next 服务可访问

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/features/ontology-canvas/model/view/nodeViewModel.ts` | PENDING | 深度完整 | 1 | 新增节点 ViewModel mapper，聚合本体字段、关系和子画布摘要 |
| `frontend/features/ontology-canvas/model/view/index.ts` | PENDING | 深度完整 | 1 | 新增 view model 子域出口 |
| `frontend/features/ontology-canvas/model/index.ts` | 深度完整 | 深度完整 | 2 | 新增 `./view` 出口 |
| `frontend/features/ontology-canvas/config/nodeViewTokens.ts` | 深度完整 | 深度完整 | 2 | 增补 section/metric/语义色 token |
| `frontend/features/ontology-canvas/ui/ClassNodeView.tsx` | 深度完整 | 深度完整 | 2 | 改为消费 ViewModel，并按 LOD 降 DOM |
| `frontend/features/ontology-canvas/ui/NodeFieldList.tsx` | 深度完整 | 深度完整 | 2 | 增加字段分类徽标和语义色 |
| `frontend/features/ontology-canvas/ui/NodeMetricList.tsx` | PENDING | 深度完整 | 1 | 新增节点统计徽标 UI |
| `frontend/features/ontology-canvas/ui/index.ts` | 深度完整 | 深度完整 | 2 | 新增 `NodeMetricList` 出口 |
| `frontend/features/ontology-canvas/adapters/legacy-graph/documentBridge.ts` | 深度完整 | 深度完整 | 2 | 投影 `data.ontologyViewModel` 给 legacy wrapper |
| `frontend/components/graph/nodes/NoteNode.tsx` | 深度完整 | 深度完整 | 3 | 继续保持 wrapper，优先透传 adapter ViewModel |
| `frontend/scripts/test-react-flow-adapter.mjs` | 深度完整 | 深度完整 | 2 | 增加 ViewModel projection 断言 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 39 | 同步 Phase B1 节点 ViewModel 和 UI 结构 |

**下一轮计划：**
- 继续 Phase B：优先做 Domain / 容器节点 UI token 与 `DomainNodeView`，让 GroupNode 也按 LOD/collapse 摘要降 DOM；随后再做节点字段行内编辑和显式归入容器入口。

## [DEV-PHASE-B2] 2026-05-07 — UI 优先托管执行：容器节点与旧 UI 退场

### A. 本轮目标（阅读前声明）

**目标文件 / 输入：**
- `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md`（原因：按用户新确认的“先 UI，再交互，再算法”调整执行顺序）
- `UI_REFERENCE_INTERACTION_SPEC_2026-05-07.zh-CN.md` §4/§6/§7（原因：本轮采用节点嵌套系统、LOD 和子画布入口的 UI 元素）
- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` §4/§5/§6/§7/§8（原因：容器/Domain UI、折叠摘要和 UI 分层规则）
- `frontend/components/graph/nodes/GroupNode.tsx`（原因：旧 group UI 当前仍承载标题编辑和旧 store 写入）
- `frontend/components/graph/nodes/BaseNode.tsx`（原因：ReactFlow handles/resize wrapper 仍在这里，需确认能保持薄 wrapper）
- `frontend/features/ontology-canvas/model/view/*`（原因：扩展 Domain / 容器 ViewModel）
- `frontend/features/ontology-canvas/ui/*`（原因：新增 DomainNodeView 并继续完善节点 UI token）
- `frontend/features/ontology-canvas/adapters/legacy-graph/documentBridge.ts`（原因：给 GroupNode 投影容器 ViewModel）

**本轮想弄清楚：**
- 如何在不碰拖拽/resize/父子关系事务的前提下，让 GroupNode 退出旧 UI，改为纯容器节点展示。
- Domain / 容器节点需要哪些 ViewModel：子节点数、子容器数、关系数、折叠状态、父容器、进入内部空间提示。
- BaseNode 是否可以先保持 ReactFlow handles/resize wrapper，不继续承载产品 UI。

**本轮不变量：**
- 不改拖拽、resize、Domain 后代同步、边锚点提交和布局算法。
- `GroupNode` 不再直接写旧 graph store 做标题编辑。
- 产品 UI 进入 `features/ontology-canvas/ui`；legacy nodes 只透传 adapter data 和 ReactFlow wrapper 状态。
- 归档文档不读；不恢复 Mermaid/旧 Note 主线。

**本轮参考图采用元素：**
- 采用：容器标题、子节点/子容器/关系数量、折叠摘要、内部空间入口提示、LOD 下容器摘要。
- 暂缓：真实进入/返回子画布、Breadcrumb、MiniMap、正交边路由和语义锚点编辑。

**验收命令 / 检查：**
- `cd frontend && npm run test:react-flow-adapter`
- `cd frontend && npm run test:domain:nesting`
- `cd frontend && npm run test:canvas:interactions`
- `cd frontend && npm run check:architecture`
- `cd frontend && npm run lint`
- `cd frontend && npm run build`
- `git diff --check`

### C. 本轮发现

**关键发现：**
- (verified) `GroupNode` 仍是旧蓝色 group 标题栏，并且双击标题会直接 `updateNode()` 写旧 graph store；这和“旧 UI 退场、产品 UI 进 feature”冲突。
- (verified) `BaseNode` 同时承担 ReactFlow handles/resize 和旧节点外壳视觉；如果不提供透明 wrapper，新 `ClassNodeView/DomainNodeView` 会被旧边框和旧背景包一层。
- (verified) Domain 模型已有 `nodeIds/domainIds/parentDomainId/collapsed`，本轮可以先生成容器 ViewModel，不需要改变本体 schema。

**修订的旧结论：**
- 原来：Phase A 剩余交互项可以继续先做。
- 现在：用户已明确 UI 基本完善优先，因此活跃路线图已调整为 Phase B 在剩余 Phase A 交互项之前；已完成的 resize/drag 基线保留，但后续测试应基于新 UI。

### D. 本轮完成记录

**代码变更：**
- 新增 `frontend/features/ontology-canvas/model/view/domainViewModel.ts`，生成 `OntologyDomainViewModel`，聚合子节点、子容器、关系、折叠状态和内部空间摘要。
- 新增 `frontend/features/ontology-canvas/config/domainViewTokens.ts`，让容器 UI 的尺寸、颜色、间距和 metric tone 配置化。
- 新增 `frontend/features/ontology-canvas/ui/DomainNodeView.tsx`，支持 `full / compact / outline / dot` 容器 LOD，并区分折叠摘要和展开预览。
- `documentBridge.projectOntologyDomainToLegacyGroup()` 现在投影 `data.ontologyDomainViewModel`。
- `GroupNode` 退成薄 wrapper，删除旧标题栏、旧标题编辑和旧 `updateNode()` 写入。
- `BaseNode` 新增 `surface="transparent"`，`NoteNode` 和 `GroupNode` 不再叠加旧外壳视觉。
- `BaseNode` 旧 fallback 编辑 UI 已删除，现在只保留 handles、resize 和外层定位职责。
- `test-react-flow-adapter.mjs` 增加 Domain ViewModel projection 断言。
- `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md` 调整总体顺序：UI 基本完善优先，剩余交互修复在最终 UI 骨架上继续。

**文档变更：**
- `CODEBASE.md` 同步 Domain ViewModel、DomainNodeView、domain token、GroupNode wrapper、BaseNode transparent surface 和风险登记。

**验证结果：**
- PASS：`cd frontend && npm run test:react-flow-adapter`
- PASS：`cd frontend && npm run test:domain:nesting`
- PASS：`cd frontend && npm run test:canvas:interactions`
- PASS：`cd frontend && npm run check:architecture`
- PASS：`cd frontend && npm run lint`
- PASS：`cd frontend && npm run build`
- PASS：`git diff --check`
- PASS：`curl -I --max-time 10 http://localhost:3000` 返回 200，现有 Next 服务可访问

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md` | 深度完整 | 深度完整 | 3 | 调整为 UI 优先、剩余交互随后收敛 |
| `frontend/features/ontology-canvas/model/view/domainViewModel.ts` | PENDING | 深度完整 | 1 | 新增 Domain / 容器 ViewModel mapper |
| `frontend/features/ontology-canvas/model/view/index.ts` | 深度完整 | 深度完整 | 2 | 新增 domain view model 出口 |
| `frontend/features/ontology-canvas/config/domainViewTokens.ts` | PENDING | 深度完整 | 1 | 新增容器 UI token |
| `frontend/features/ontology-canvas/config/index.ts` | 深度完整 | 深度完整 | 2 | 新增 domain token 出口 |
| `frontend/features/ontology-canvas/ui/DomainNodeView.tsx` | PENDING | 深度完整 | 1 | 新增容器节点纯 UI，支持折叠摘要和 LOD |
| `frontend/features/ontology-canvas/ui/index.ts` | 深度完整 | 深度完整 | 3 | 新增 `DomainNodeView` 出口 |
| `frontend/features/ontology-canvas/adapters/legacy-graph/documentBridge.ts` | 深度完整 | 深度完整 | 3 | 投影 `data.ontologyDomainViewModel` 给 GroupNode wrapper |
| `frontend/components/graph/nodes/GroupNode.tsx` | 深度完整 | 深度完整 | 3 | 删除旧标题编辑 UI，退成 wrapper |
| `frontend/components/graph/nodes/BaseNode.tsx` | 深度完整 | 深度完整 | 2 | 新增 transparent surface，并删除旧 fallback 编辑 UI |
| `frontend/scripts/test-react-flow-adapter.mjs` | 深度完整 | 深度完整 | 3 | 增加 Domain ViewModel projection 断言 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 40 | 同步 Phase B2 容器 UI 和旧 UI 退场 |

**下一轮计划：**
- 继续 UI 托管阶段：清理旧编辑器入口，补节点/容器 hover/selected/disabled 状态细节；之后进入最终 UI 上的显式归入/移出容器和折叠交互。

## [DEV-PHASE-B3] 2026-05-08 — UI-first 继续执行：结构化 Inspector 与旧编辑器清理

### A. 本轮目标（阅读前声明）

**目标文件 / 输入：**
- `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md`（原因：继续执行 UI 优先路线）
- `UI_REFERENCE_INTERACTION_SPEC_2026-05-07.zh-CN.md` 与 `UI_iamge/` 四张参考图（原因：本轮继续按节点结构、字段/方法、LOD、子画布入口方向收敛 UI）
- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` §5/§6/§7/§8（原因：节点属性、Inspector 同步和 UI 分层验收）
- `frontend/features/ontology-canvas/ui/NodeAttributeEditor.tsx`（原因：右侧 Inspector 需要从普通 JSON 键值升级为本体结构编辑）
- `frontend/features/ontology-canvas/blocks/NodeInspectorBlock.tsx`（原因：替换旧节点编辑器，接通本体 document 和纯 UI 预览）
- `frontend/components/graph/editors/*`、`frontend/components/graph/nodes/NoteNodeEdit.tsx`（原因：确认旧 UI 是否还能删除）

**本轮想弄清楚：**
- 如何让右侧 Inspector 直接表达本体节点类型、字段、方法、规则、接口，而不是只编辑普通 JSON 属性。
- 哪些旧节点编辑 UI 已经不在主路径使用，可以安全删除，避免后续继续适配旧 UI。

**本轮不变量：**
- 不改拖拽、resize、嵌套、折叠和边锚点交互事务。
- 旧 graph store 仍只作为 display cache，不重新成为节点属性真相源。
- 纯 UI 不 import store、ReactFlow 或 document store；接线逻辑只放 block/wrapper。

**本轮参考图采用元素：**
- 采用：节点类型、字段/方法/子节点数量、结构化属性分区、右侧编辑与节点预览同步、旧 UI 退场。
- 暂缓：真实进入子画布、Breadcrumb、MiniMap、正交边、字段行内编辑、分区级折叠。

**验收命令 / 检查：**
- `cd frontend && npm run lint`
- `cd frontend && npm run build`
- `cd frontend && npm run test:editors`
- `cd frontend && npm run test:canvas:interactions`

### C. 本轮发现

**关键发现：**
- (verified) `RightSidebar` 已接入 `NodeInspectorBlock`，旧 `NodeEditor` / `ContentEditor` / `StructuredAttributeEditor` / `NoteNodeEdit` 只剩无主路径引用，可以删除。
- (verified) `NodeInspectorBlock` 之前的预览主要依赖已保存 document；本轮改为用 draft 临时构造 ViewModel，因此标题、类型、字段分区编辑时侧栏预览即时变化。
- (verified) `nodeViewTokens.ts` 缺少 `--oc-node-body-size` 和 `--oc-node-color-surface-strong`，侧栏复用 node token 时会出现样式变量缺口；本轮已补齐。

**代码变更：**
- `NodeAttributeEditor` 改为支持 `mode="node" | "domain"`：节点模式编辑 `ontologyType` 和结构化字段分区，Domain 模式保留普通 metadata 编辑。
- `NodeInspectorBlock` 接入 draft preview ViewModel，并把 `NodeAttributeEditor` 区分为 node/domain 模式。
- `nodeViewTokens.ts` 补齐 Inspector 和 metric 使用的基础 CSS 变量。
- 删除旧 `NodeEditor.tsx`、`ContentEditor.tsx`、`StructuredAttributeEditor.tsx`、`NoteNodeEdit.tsx`，并清理对应出口和旧导出测试。
- 删除旧 `node-editor.test.tsx`、`content-editor.test.tsx`。
- 归档 `frontend/components/graph/GRAPH_COMPONENTS_RESTRUCTURE_PLAN.md` 到 `_archive/2026-05-08-ui-cleanup/`。

**文档变更：**
- `CODEBASE.md` 同步 `NodeAttributeEditor`、`NodeInspectorBlock`、旧编辑器删除和风险登记。
- `ACTIVE_DOCS.zh-CN.md` 增加 2026-05-08 UI cleanup 归档说明。
- `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md` 增加 Phase B 当前进展与后续优先项。

**验证结果：**
- PASS：`cd frontend && npm run lint`
- PASS：`cd frontend && npm run build`
- PASS：`cd frontend && npm run test:editors`
- PASS：`cd frontend && npm run test:canvas:interactions`

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/features/ontology-canvas/ui/NodeAttributeEditor.tsx` | PENDING | 深度完整 | 1 | 新增 node/domain 双模式结构化属性编辑 UI |
| `frontend/features/ontology-canvas/blocks/NodeInspectorBlock.tsx` | PENDING | 深度完整 | 1 | 接入结构化属性编辑和 draft ViewModel 预览 |
| `frontend/features/ontology-canvas/config/nodeViewTokens.ts` | 深度完整 | 深度完整 | 3 | 补齐 Inspector/metric 使用的 CSS token |
| `frontend/components/graph/editors/NodeEditor.tsx` | 深度完整 | 已删除 | 2 | 旧节点编辑器退场，入口迁入 `NodeInspectorBlock` |
| `frontend/components/graph/editors/ContentEditor.tsx` | PENDING | 已删除 | 1 | 旧内容编辑器退场 |
| `frontend/components/graph/editors/StructuredAttributeEditor.tsx` | 深度完整 | 已删除 | 2 | 旧属性键值编辑器退场 |
| `frontend/components/graph/nodes/NoteNodeEdit.tsx` | PENDING | 已删除 | 1 | 旧笔记节点内联编辑器退场 |
| `frontend/components/graph/editors/index.ts` | PENDING | 深度完整 | 1 | 仅保留 `EdgeEditor` 出口 |
| `frontend/components/graph/nodes/index.ts` | PENDING | 深度完整 | 1 | 移除 `NoteNodeEdit` 出口 |
| `frontend/components/graph/test-exports.ts` | PENDING | 浅读 | 1 | 移除已删除旧编辑器导出 |
| `ACTIVE_DOCS.zh-CN.md` | 深度完整 | 深度完整 | 2 | 增加 UI cleanup 归档说明 |
| `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md` | 深度完整 | 深度完整 | 4 | 增加 Phase B 当前进展 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 41 | 同步本轮 UI/Inspector/旧编辑器清理 |

**下一轮计划：**
- 继续 Phase B：补节点字段行内编辑、分区折叠、节点状态细节；随后进入最终 UI 上的显式归入 / 移出容器、折叠交互和 resize 手感优化。

## [SYNC] 2026-05-08 11:10 — LOD 远景节点显示尺寸与拖拽位置换算

### A. SYNC 范围声明

**触发任务：** 用户指出缩小画布看全局时，节点内容和图标缩小但节点外框没有随 LOD 改变，导致远景视觉不符合概念图。

**直接变更文件：**
- `frontend/features/ontology-canvas/config/nodeViewTokens.ts`
- `frontend/features/ontology-canvas/adapters/react-flow/projection.ts`
- `frontend/features/ontology-canvas/adapters/react-flow/index.ts`
- `frontend/components/graph/core/GraphPageContent.tsx`
- `frontend/components/graph/nodes/NoteNode.tsx`
- `frontend/components/graph/nodes/GroupNode.tsx`
- `frontend/scripts/test-react-flow-adapter.mjs`
- `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md`
- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md`
- `CODEBASE.md`
- `ITERATION_LOG.md`

**预计连带影响：**
- ReactFlow projection 的 node style width/height、position、LOD data。
- `onNodeDragStop` 从 ReactFlow 显示坐标提交回本体 view 坐标的换算。
- resize 控制在非 full LOD 下隐藏，避免远景显示尺寸被当成用户 resize 尺寸。
- 容器 / Domain LOD 外框缩小暂缓，等 Phase C 容器聚合和隐藏内部节点一起实现，避免破坏嵌套。

### C. SYNC 结果

**关键发现：**
- (verified) 参考图 3 的 LOD 不是只缩小节点内部内容，而是 70% / 40% / 15% / 5% 下节点外框也要逐级从完整卡片退化为紧凑卡片、轮廓卡片、图标和点位。
- (verified) 普通节点可以在 ReactFlow adapter 层使用 LOD 显示尺寸缩小外框，并保持真实本体 view 的 width/height 不变。
- (verified) 远景普通节点显示位置为了保持中心点稳定会被 adapter 居中偏移；拖拽结束时必须反算回真实坐标，否则会把显示左上角误写成本体位置。
- (verified) Domain / 容器不能在当前阶段直接跟普通节点一样缩外框；内部子节点仍完整存在时，直接缩容器会破坏嵌套视觉和父子边界判断。

**代码变更：**
- `nodeViewTokens.ts` 增加普通节点 compact / outline / dot 的显示尺寸配置。
- `projection.ts` 增加 `resolveReactFlowNodeDisplaySize()` 和 `resolveReactFlowNodePersistedPosition()`，普通节点按 LOD 缩小 ReactFlow style，并在拖拽回写时反算真实位置。
- `GraphPageContent.onNodeDragStop()` 使用反算后的真实坐标提交 `commitNodeDrag/commitDomainDrag`。
- `NoteNode` / `GroupNode` 在非 full LOD 隐藏 resize control，避免远景显示尺寸被用户 resize 写成真实尺寸。
- `test-react-flow-adapter.mjs` 增加 LOD 显示尺寸、中心定位和坐标反算断言。

**文档变更：**
- `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md` 补充 Phase C 的普通节点显示尺寸、远景坐标反算和容器缩放后置规则。
- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` 补充“普通节点远景外框也要降级、显示尺寸不覆盖真实尺寸”的产品规则。
- `CODEBASE.md` 同步 adapter、GraphPageContent、token、数据流和风险登记。

**验证结果：**
- PASS：`cd frontend && npm run test:react-flow-adapter`
- PASS：`cd frontend && npm run test:canvas:interactions`
- PASS：`cd frontend && npm run test:domain:nesting`
- PASS：`cd frontend && npm run lint`
- PASS：`cd frontend && npm run check:architecture`
- PASS：`cd frontend && npm run build`
- PASS：`git diff --check`
- PASS：`curl -I --max-time 10 http://localhost:3000` 返回 200
- PASS：`git diff --check`
- PASS：`curl -I --max-time 10 http://localhost:3000` 返回 200
- PASS：`git diff --check`

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/features/ontology-canvas/config/nodeViewTokens.ts` | 深度完整 | 深度完整 | 4 | 增加普通节点 LOD 显示尺寸配置，不覆盖真实 view size |
| `frontend/features/ontology-canvas/adapters/react-flow/projection.ts` | 深度完整 | 深度完整 | 5 | 增加 LOD display size 和 display position -> persisted position 反算 |
| `frontend/features/ontology-canvas/adapters/react-flow/index.ts` | 深度完整 | 深度完整 | 3 | 新增 LOD 坐标反算工具出口 |
| `frontend/components/graph/core/GraphPageContent.tsx` | 深度完整 | 深度完整 | 9 | drag stop 在提交本体 patch 前反算 LOD 显示坐标 |
| `frontend/components/graph/nodes/NoteNode.tsx` | 深度完整 | 深度完整 | 4 | 非 full LOD 下隐藏普通节点 resize control |
| `frontend/components/graph/nodes/GroupNode.tsx` | 深度完整 | 深度完整 | 4 | 非 full LOD 下隐藏容器 resize control，容器外框缩小后置 |
| `frontend/scripts/test-react-flow-adapter.mjs` | 深度完整 | 深度完整 | 4 | 覆盖 LOD 显示尺寸、居中和坐标反算 |
| `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md` | 深度完整 | 深度完整 | 5 | Phase C 补充显示尺寸与容器缩放后置规则 |
| `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` | 深度完整 | 深度完整 | 3 | 产品规格补充普通节点外框 LOD 降级规则 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 42 | 同步 LOD display size、拖拽反算和容器后置风险 |

**下一轮计划：**
- 继续 Phase B/C 交叉：字段行内编辑、分区折叠和节点状态细节；随后在最终 UI 上推进显式归入 / 移出容器、容器折叠投影和 resize 手感优化。

## [SYNC] 2026-05-08 11:26 — LOD 自动尺寸变化不得污染真实 resize

### A. SYNC 范围声明

**触发任务：** 用户反馈节点缩小后，放大不会还原；并提醒临时插入需求如果影响后续规划，要及时调整。

**直接变更文件：**
- `frontend/components/graph/core/GraphPageContent.tsx`
- `frontend/scripts/test-canvas-interactions.mjs`
- `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md`
- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md`
- `CODEBASE.md`
- `ITERATION_LOG.md`

**预计连带影响：**
- ReactFlow `dimensions` change 处理策略。
- LOD 投影尺寸变化与用户手动 resize 的边界。
- Phase C 验收规则：缩小后放大必须恢复，自动 LOD 尺寸变化不得提交本体 view 尺寸。

### C. SYNC 结果

**关键发现：**
- (verified) 放大不能恢复的根因是 ReactFlow 在 LOD style width/height 变化后会触发 `dimensions` change；旧逻辑把所有 `dimensions && !resizing` 都当作用户 resize 结束，导致 LOD 小尺寸被写入本体 view 的真实 width/height。
- (verified) 真正的用户 resize 有完整事件序列：先收到 `dimensions.resizing === true`，再收到 `dimensions.resizing === false`；LOD 自动测量通常只有尺寸结果，不应提交。
- (verified) 这个插入需求影响后续 Phase C 规则：LOD 既要缩小，也要可逆，显示尺寸和真实尺寸必须强隔离。

**代码变更：**
- 新增 `frontend/features/ontology-canvas/model/interactions/resizeCommitGate.ts`，用纯 model 闸门记录正在手动 resize 的节点 id。
- `GraphPageContent.onNodesChange(dimensions)` 现在只有在同一节点先收到 `resizing: true` 后，才会在 `resizing: false` 时提交 `commitNodeResize/commitDomainResize`。
- LOD 自动尺寸测量会被忽略，不再污染本体 view 的真实尺寸。
- `test-canvas-interactions.mjs` 增加 resize gate 断言，覆盖“LOD dimensions 不保存、用户 resize 保存、重复 resize end 不重复保存、删除/清理 active resize”的行为。

**文档变更：**
- `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md` 补充 Phase C 验收：缩小后放大必须恢复，自动 dimensions 不得被当成用户 resize。
- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` 补充产品规则和当前状态表。
- `CODEBASE.md` 同步新增 helper、GraphPageContent resize gate、数据流、函数索引和风险登记。

**验证结果：**
- PASS：`cd frontend && npm run test:canvas:interactions`
- PASS：`cd frontend && npm run test:react-flow-adapter`
- PASS：`cd frontend && npm run test:domain:nesting`
- PASS：`cd frontend && npm run lint`
- PASS：`cd frontend && npm run check:architecture`
- PASS：`cd frontend && npm run build`
- PASS：`git diff --check`
- PASS：`curl -I --max-time 10 http://localhost:3000` 返回 200

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/features/ontology-canvas/model/interactions/resizeCommitGate.ts` | 新增 | 深度完整 | 1 | 新增 resize 提交闸门，防止 LOD 自动尺寸测量写入真实尺寸 |
| `frontend/features/ontology-canvas/model/interactions/index.ts` | 深度完整 | 深度完整 | 3 | 新增 resize commit gate 出口 |
| `frontend/components/graph/core/GraphPageContent.tsx` | 深度完整 | 深度完整 | 10 | dimensions change 先过 resize gate，只有用户 resize end 才提交本体尺寸 |
| `frontend/scripts/test-canvas-interactions.mjs` | 深度完整 | 深度完整 | 5 | 增加 resize gate 行为断言 |
| `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md` | 深度完整 | 深度完整 | 6 | Phase C 补充 LOD 可逆和自动 dimensions 禁止持久化规则 |
| `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` | 深度完整 | 深度完整 | 4 | 产品规格补充缩小后放大恢复规则 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 43 | 同步 resize gate、数据流和风险登记 |

**下一轮计划：**
- 继续 Phase B/C：字段行内编辑、分区折叠和节点状态细节；交互侧继续把“自动显示态”和“用户意图态”分开，避免类似 LOD/resize 的状态污染再次出现。

## [SYNC] 2026-05-08 11:42 — Phase B4 节点字段行内编辑与分区折叠

### A. SYNC 范围声明

**触发任务：** 用户要求继续下一步规划；按当前路线图继续 Phase B4 节点内结构编辑。

**直接变更文件：**
- `frontend/features/ontology-canvas/model/interactions/nodeFields.ts`
- `frontend/features/ontology-canvas/model/document/ontologyDocument.ts`
- `frontend/features/ontology-canvas/index.ts`
- `frontend/features/ontology-canvas/ui/NodeFieldList.tsx`
- `frontend/features/ontology-canvas/ui/NodeSection.tsx`
- `frontend/features/ontology-canvas/ui/ClassNodeView.tsx`
- `frontend/features/ontology-canvas/config/nodeViewTokens.ts`
- `frontend/components/graph/nodes/NoteNode.tsx`
- `frontend/features/ontology-canvas/adapters/legacy-graph/documentBridge.ts`
- `frontend/types/graph/models.ts`
- `frontend/types/workspace/ontologyCanvas.ts`
- `frontend/scripts/test-canvas-interactions.mjs`
- `frontend/scripts/test-ontology-document-model.mjs`
- `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md`
- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md`
- `CODEBASE.md`
- `ITERATION_LOG.md`

**预计连带影响：**
- 节点 full LOD 字段行从只读展示升级为轻量行内编辑。
- 字段名、值、dataType 快速编辑写入本体 `fields[]`，再投影旧 display cache。
- Fields / Methods / Rules / Interfaces / Relationships 分区折叠进入本体 node view，避免纯本地状态丢失。
- UI 组件仍保持纯 props，不直接 import store、ReactFlow 或 document store。

### C. SYNC 结果

**关键发现：**
- (verified) `ClassNodeView` 已经把节点分区和字段列表渲染在 full LOD 中，适合直接补行内编辑和分区折叠；compact/outline/dot 继续保持低 DOM。
- (verified) 字段编辑必须走 `OntologyDocumentState.graph.nodes[nodeId].fields`，不能直接写旧 `attributes`。
- (verified) 分区折叠是视图状态，不是本体语义；正确位置是 `OntologyNodeViewState.collapsedSections`。
- (verified) 行内输入如果每次按键都写本体 document，会重新投影旧 display cache；因此本轮采用 uncontrolled input + blur/Enter 提交，按键阶段不写全局状态。

**代码变更：**
- `nodeFields.ts` 新增 `updateOntologyField()` 和 `UpdateOntologyFieldPatch`，负责 trim 字段名、清空 value/dataType 时归一化为 undefined，并在无有效变化时返回原数组引用。
- `ontologyDocument.ts` 的 `OntologyNodeViewState` 增加 `collapsedSections`，`updateOntologyNodeViewInDocument()` 可持久化节点分区折叠。
- `NodeFieldList.tsx` 支持 editable 模式，full LOD 下可编辑字段名、字段值和 dataType；输入节点使用 `nodrag` 和事件阻断，避免触发画布拖拽。
- `NodeSection.tsx` 支持可选折叠按钮，折叠时不渲染 children。
- `ClassNodeView.tsx` 新增 `collapsedSectionIds/onFieldChange/onToggleSection` props，在 full LOD 中启用字段行内编辑和分区折叠。
- `NoteNode.tsx` 接线 `handleFieldChange()` 和 `handleToggleSection()`，字段变更写本体 `fields[]`，分区折叠写本体 `nodeViews.collapsedSections`，成功后投影旧 display cache。
- `documentBridge.ts` 把 `collapsedSections` 在本体 view 和旧 Node display cache 之间投影，避免旧缓存路径丢失折叠状态。
- `nodeViewTokens.ts` 增加字段 type 宽度和 input 高度 token。
- `types/graph/models.ts` 和 `types/workspace/ontologyCanvas.ts` 补充 `collapsedSections` 类型/schema。
- `features/ontology-canvas/index.ts` 移除 `blocks` TSX 出口，避免轻量 Node 测试加载 feature 根出口时解析 JSX。

**文档变更：**
- `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md` 标记 Phase B4 第一批完成，并把下一步改为字段分类切换、删除/排序、状态细节和容器内部空间入口。
- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` 更新“节点上新增属性”和“节点属性折叠”的当前状态。
- `CODEBASE.md` 同步 UI 组件、字段 helper、document view state、legacy bridge、数据流、数据模型和风险登记。

**验证结果：**
- PASS：`cd frontend && npm run test:canvas:interactions`
- PASS：`cd frontend && npm run test:ontology:document`
- PASS：`cd frontend && npm run test:ontology:legacy-bridge`
- PASS：`cd frontend && npm run test:react-flow-adapter`
- PASS：`cd frontend && npm run test:domain:nesting`
- PASS：`cd frontend && npm run lint`
- PASS：`cd frontend && npm run check:architecture`
- PASS：`cd frontend && npm run build`

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/features/ontology-canvas/model/interactions/nodeFields.ts` | 深度完整 | 深度完整 | 2 | 新增字段行内编辑 patch helper，无效编辑返回原数组引用 |
| `frontend/features/ontology-canvas/model/document/ontologyDocument.ts` | 深度完整 | 深度完整 | 4 | node view 增加 collapsedSections，分区折叠进入本体 view |
| `frontend/features/ontology-canvas/index.ts` | 深度完整 | 深度完整 | 2 | 移除 blocks TSX 根出口，轻量 model/adapter 脚本不再加载 JSX |
| `frontend/features/ontology-canvas/ui/NodeFieldList.tsx` | 深度完整 | 深度完整 | 3 | 从只读字段列表升级为 blur/Enter 提交的行内编辑 UI |
| `frontend/features/ontology-canvas/ui/NodeSection.tsx` | 深度完整 | 深度完整 | 3 | 增加可选折叠按钮，折叠时不渲染分区 children |
| `frontend/features/ontology-canvas/ui/ClassNodeView.tsx` | 深度完整 | 深度完整 | 5 | full LOD 接入字段编辑和分区折叠，低 LOD 保持轻量 |
| `frontend/features/ontology-canvas/config/nodeViewTokens.ts` | 深度完整 | 深度完整 | 5 | 增加字段编辑 input/type 尺寸 token |
| `frontend/components/graph/nodes/NoteNode.tsx` | 深度完整 | 深度完整 | 5 | wrapper 接线字段变更和分区折叠，写本体 document 后投影旧缓存 |
| `frontend/features/ontology-canvas/adapters/legacy-graph/documentBridge.ts` | 深度完整 | 深度完整 | 4 | 投影 collapsedSections，避免旧 display cache 丢失节点分区折叠 |
| `frontend/types/graph/models.ts` | 深度完整 | 深度完整 | 3 | 旧 Node display cache 补充 collapsedSections 类型/schema |
| `frontend/types/workspace/ontologyCanvas.ts` | 深度完整 | 深度完整 | 3 | PersistedOntologyCanvas node view schema 补充 collapsedSections |
| `frontend/scripts/test-canvas-interactions.mjs` | 深度完整 | 深度完整 | 6 | 增加 updateOntologyField 的编辑、清空、无效字段断言 |
| `frontend/scripts/test-ontology-document-model.mjs` | 深度完整 | 深度完整 | 4 | 增加 node view collapsedSections 去重持久化断言 |
| `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md` | 深度完整 | 深度完整 | 7 | Phase B4 第一批完成，后续顺序调整为继续 UI 收尾再回交互 |
| `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` | 深度完整 | 深度完整 | 5 | 状态表更新字段行内编辑与分区折叠 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 44 | 同步 Phase B4 字段编辑、分区折叠和 view state 数据流 |

**下一轮计划：**
- 继续 Phase B 收尾：字段分类切换、字段删除/排序、hover/selected/readonly/disabled 状态细节、容器内部空间入口；随后在新 UI 上回到 Phase A 的显式归入 / 移出容器和容器折叠投影。

## [SYNC] 2026-05-08 12:36 — Phase B4 字段分类切换、删除与排序

### A. SYNC 范围声明

**触发任务：** 用户确认按规划继续执行；本轮继续 Phase B 收尾中最紧邻的节点内部字段管理能力。

**直接变更文件：**
- `frontend/features/ontology-canvas/model/interactions/nodeFields.ts`
- `frontend/features/ontology-canvas/ui/NodeFieldList.tsx`
- `frontend/features/ontology-canvas/ui/ClassNodeView.tsx`
- `frontend/features/ontology-canvas/config/nodeViewTokens.ts`
- `frontend/components/graph/nodes/NoteNode.tsx`
- `frontend/scripts/test-canvas-interactions.mjs`
- `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md`
- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md`
- `CODEBASE.md`
- `ITERATION_LOG.md`

**预计连带影响：**
- full LOD 字段行增加 category 切换、删除、上移/下移控件。
- 字段 category 切换会让字段在下一次 ViewModel 投影中进入 Fields / Methods / Rules / Interfaces 对应分区。
- 字段删除和排序只改本体 `fields[]` 顺序，不改旧 attributes。
- UI 组件继续保持纯 props，不直接 import store、ReactFlow 或 document store。

### C. SYNC 结果

**关键发现：**
- (verified) `OntologyNodeViewModel.sections` 已按 `OntologyField.category` 分区，因此字段 category 切换只需要写本体 `fields[]`，下一次投影会自然进入目标分区。
- (verified) 当前节点字段排序的用户感知单位是“当前可见分区内顺序”，不能只按完整 `fields[]` 相邻项移动，否则不同分类夹在中间时用户看不到变化。
- (verified) `NodeFieldList` 是纯 UI，适合只增加 props 回调；真实写入仍由 `NoteNode` wrapper 调用 document command。

**代码变更：**
- `nodeFields.ts` 新增 `deleteOntologyField()` 和 `moveOntologyField()`；`moveOntologyField()` 支持传入当前可见分区的 field id 顺序，用于分区内排序。
- `NodeFieldList.tsx` 增加字段 category select，以及上移、下移、删除三个 icon button；relationship 行仍只读。
- `ClassNodeView.tsx` 新增 `onFieldDelete/onFieldMove` props，并把字段管理动作透传给字段列表。
- `NoteNode.tsx` 新增 `handleFieldDelete()` 和 `handleFieldMove()`，通过 `updateOntologyNodeInDocument()` 写本体 `fields[]`，成功后投影旧 display cache。
- `nodeViewTokens.ts` 增加字段 category 和 actions 区域尺寸 token，避免控件尺寸散落组件内部。
- `test-canvas-interactions.mjs` 增加字段 category patch、删除、相邻移动和分区 scoped 移动断言。

**文档变更：**
- `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md` 标记 Phase B4 第二批完成，后续 Phase B 收尾转向新增时选择目标分类、分区摘要、节点状态和容器内部空间入口。
- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` 更新“节点上新增属性”的当前状态。
- `CODEBASE.md` 同步字段 helper、NodeFieldList、ClassNodeView、NoteNode、数据流和风险登记。

**验证结果：**
- PASS：`cd frontend && npm run test:canvas:interactions`
- PASS：`cd frontend && npm run test:ontology:document`
- PASS：`cd frontend && npm run test:ontology:legacy-bridge`
- PASS：`cd frontend && npm run test:react-flow-adapter`
- PASS：`cd frontend && npm run test:domain:nesting`
- PASS：`cd frontend && npm run lint`
- PASS：`cd frontend && npm run check:architecture`
- PASS：`cd frontend && npm run build`

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/features/ontology-canvas/model/interactions/nodeFields.ts` | 深度完整 | 深度完整 | 3 | 新增 delete/move helper，支持当前分区 scoped 排序 |
| `frontend/features/ontology-canvas/ui/NodeFieldList.tsx` | 深度完整 | 深度完整 | 4 | full LOD 字段行支持分类切换、删除、上移/下移 |
| `frontend/features/ontology-canvas/ui/ClassNodeView.tsx` | 深度完整 | 深度完整 | 6 | 透传字段删除和排序回调，低 LOD 不渲染编辑控件 |
| `frontend/features/ontology-canvas/config/nodeViewTokens.ts` | 深度完整 | 深度完整 | 6 | 增加字段分类和 action 区域尺寸 token |
| `frontend/components/graph/nodes/NoteNode.tsx` | 深度完整 | 深度完整 | 6 | wrapper 新增字段删除/排序接线，仍只写本体 document |
| `frontend/scripts/test-canvas-interactions.mjs` | 深度完整 | 深度完整 | 7 | 覆盖字段分类 patch、删除、相邻排序和分区 scoped 排序 |
| `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md` | 深度完整 | 深度完整 | 8 | Phase B4 第二批完成，调整下一步 UI 收尾重点 |
| `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` | 深度完整 | 深度完整 | 6 | 状态表更新字段分类/删除/排序 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 45 | 同步字段分类、删除、排序的模块、函数和数据流 |

**下一轮计划：**
- 继续 Phase B 收尾：新增字段时选择目标分类、分区摘要/自动折叠、节点 hover/selected/readonly/disabled 状态细节和容器内部空间入口。

## [SYNC] 2026-05-08 13:32 — Phase B4 按分区新增字段

### A. SYNC 范围声明

**触发任务：** 用户要求继续执行；本轮继续 Phase B 收尾中的“新增字段时选择目标分类”。

**直接变更文件：**
- `frontend/features/ontology-canvas/model/view/nodeViewModel.ts`
- `frontend/features/ontology-canvas/model/interactions/nodeFields.ts`
- `frontend/features/ontology-canvas/ui/NodeSection.tsx`
- `frontend/features/ontology-canvas/ui/ClassNodeView.tsx`
- `frontend/components/graph/nodes/NoteNode.tsx`
- `frontend/scripts/test-canvas-interactions.mjs`
- `frontend/scripts/test-ontology-document-model.mjs`
- `frontend/scripts/test-react-flow-adapter.mjs`
- `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md`
- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md`
- `CODEBASE.md`
- `ITERATION_LOG.md`

**预计连带影响：**
- 节点 ViewModel 需要暴露空的 Methods / Rules / Interfaces 分区，让用户能从空分区直接新增字段。
- `ClassNodeView.onAddField` 需要支持传入目标 category，但保持默认不传时新增普通 attribute。
- `NoteNode.handleAddField` 需要把目标 category 传给 `appendDefaultOntologyField()`。
- UI 组件继续保持纯 props，不直接 import store、ReactFlow 或 document store。

### C. SYNC 结果

**关键发现：**
- (verified) `createFieldSections()` 之前过滤了空 Methods / Rules / Interfaces，导致空分区没有入口；本轮改为保留四个字段分区，Relationships 仍只在存在关系时追加。
- (verified) 顶栏新增字段和分区新增字段可以共用同一个 `onAddField(category?)` 回调；纯 UI 只传 category，不直接创建字段或写 store。
- (verified) ReactFlow adapter 测试需要同步新 ViewModel 契约：空 Interfaces 分区会出现在 `data.ontologyViewModel.sections` 中，供 full LOD 渲染空态和新增入口。

**代码变更：**
- `nodeFields.ts` 新增 `getDefaultOntologyFieldInputForCategory()`，把 Field / Method / Rule / Constraint / Interface 映射为默认字段 namePrefix、dataType 和 category。
- `nodeViewModel.ts` 保留空的 Fields / Methods / Rules / Interfaces 分区，让完整节点 UI 能从空分区直接新增对应字段。
- `NodeSection.tsx` 增加可选分区 action 按钮，仍是纯 UI props，不接 store。
- `ClassNodeView.tsx` 将 `onAddField` 升级为可接收目标 category；顶栏加号新增普通 Field，分区加号新增对应分类字段，Relationships 不提供字段新增。
- `NoteNode.tsx` 把目标 category 传给字段 helper 后写本体 `fields[]`，成功后投影旧 display cache。
- 测试补充默认分类字段、空分区 ViewModel 和 ReactFlow adapter 分区投影断言。

**文档变更：**
- `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md` 标记 Phase B4 第三批完成，并把下一步 Phase B 收尾改为分区摘要、节点状态和容器内部空间入口。
- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` 更新“节点上新增属性”状态：顶栏和分区标题均可新增字段。
- `CODEBASE.md` 同步字段默认 helper、空分区 ViewModel、分区 action、NoteNode 接线、Flow F-012 和风险登记。

**验证结果：**
- PASS：`cd frontend && npm run test:canvas:interactions`
- PASS：`cd frontend && npm run test:ontology:document`
- PASS：`cd frontend && npm run test:ontology:legacy-bridge`
- PASS：`cd frontend && npm run test:react-flow-adapter`
- PASS：`cd frontend && npm run test:domain:nesting`
- PASS：`cd frontend && npm run lint`
- PASS：`cd frontend && npm run check:architecture`
- PASS：`cd frontend && npm run build`
- PASS：`git diff --check`
- PASS：`curl -I --max-time 10 http://localhost:3000`

**已知提示：**
- `baseline-browser-mapping` 仍提示数据超过两个月未更新，本轮未处理依赖升级。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/features/ontology-canvas/model/view/nodeViewModel.ts` | 深度完整 | 深度完整 | 4 | 保留空字段分区，full LOD 可显示空态和分区新增入口 |
| `frontend/features/ontology-canvas/model/interactions/nodeFields.ts` | 深度完整 | 深度完整 | 4 | 新增分类默认字段 helper，供顶栏/分区新增共享 |
| `frontend/features/ontology-canvas/ui/NodeSection.tsx` | 深度完整 | 深度完整 | 4 | 分区标题右侧支持纯 props action 按钮 |
| `frontend/features/ontology-canvas/ui/ClassNodeView.tsx` | 深度完整 | 深度完整 | 7 | `onAddField(category?)` 接入顶栏和分区新增，Relationships 不提供字段新增 |
| `frontend/components/graph/nodes/NoteNode.tsx` | 深度完整 | 深度完整 | 7 | wrapper 按 category 追加默认本体字段并同步旧 display cache |
| `frontend/scripts/test-canvas-interactions.mjs` | 深度完整 | 深度完整 | 8 | 覆盖分类默认字段 helper 和 behavior/interface 新增默认值 |
| `frontend/scripts/test-ontology-document-model.mjs` | 深度完整 | 深度完整 | 5 | 覆盖节点 ViewModel 空字段分区输出 |
| `frontend/scripts/test-react-flow-adapter.mjs` | 深度完整 | 深度完整 | 4 | 适配空 Interfaces 分区投影契约 |
| `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md` | 深度完整 | 深度完整 | 9 | Phase B4 第三批完成，下一步去掉目标分类选择 |
| `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` | 深度完整 | 深度完整 | 7 | 状态表更新分区新增字段 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 46 | 同步按分区新增字段的模块、函数、数据流和风险状态 |

**下一轮计划：**
- 继续 Phase B 收尾：分区摘要/自动折叠、节点 hover/selected/readonly/disabled 状态细节、容器内部空间入口；完成这些后切回 Phase A 剩余交互项。

## [SYNC] 2026-05-08 16:33 — Phase B 阶段完成交付

### A. SYNC 范围声明

**触发任务：** 用户要求不要继续零散“收尾”，而是一次性把 Phase B 完成。

**本轮完成标准：**
- 节点 UI：完整 LOD 具备分区摘要/折叠摘要、空态新增、字段快速编辑、分类/删除/排序、hover/selected/readonly/disabled 状态表达。
- 容器 UI：Domain / 容器完整 LOD 具备折叠摘要、内部空间入口、preview/empty 状态和状态表达；仍保持纯 UI，不写 store。
- Inspector / Wrapper：继续只在 wrapper/block 层接 store 和 document command，纯 UI 不 import ReactFlow/store。
- 文档：`DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md` 将 Phase B 标记为完成，并明确 Phase A 是下一阶段。
- 验证：至少跑 interaction/model/adapter/domain/lint/architecture/build/diff check，必要时确认本地 3000 可访问。

**直接目标文件：**
- `ACTIVE_DOCS.zh-CN.md`
- `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md`
- `UI_REFERENCE_INTERACTION_SPEC_2026-05-07.zh-CN.md`
- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md`
- `frontend/features/ontology-canvas/ui/ClassNodeView.tsx`
- `frontend/features/ontology-canvas/ui/DomainNodeView.tsx`
- `frontend/features/ontology-canvas/ui/NodeSection.tsx`
- `frontend/features/ontology-canvas/config/nodeViewTokens.ts`
- `frontend/features/ontology-canvas/config/domainViewTokens.ts`
- `frontend/components/graph/nodes/NoteNode.tsx`
- `frontend/components/graph/nodes/GroupNode.tsx`
- `frontend/scripts/test-react-flow-adapter.mjs`
- `CODEBASE.md`
- `ITERATION_LOG.md`

**不变量：**
- Phase B 只完成 UI 产品化和 wrapper 接线，不提前做算法 DTO、worker、PG adapter 或复杂正交边。
- 纯 UI 组件不 import store、ReactFlow、document store 或旧 graph 类型。
- 节点/容器 UI token 继续集中在 feature config。
- 旧 `NoteNode` / `GroupNode` 只做 wrapper，不恢复旧编辑 UI。

### C. SYNC 结果

**关键发现：**
- (verified) Phase B 真正剩余项集中在 UI 产品化，不需要为了完成 Phase B 提前进入算法或子画布导航。
- (verified) 节点分区折叠此前只隐藏 children，没有摘要；用户无法从折叠态判断分区里有什么。
- (verified) `DomainNodeView` 已有摘要和 LOD 形态，但折叠切换仍未从最终 UI 写回本体 view；这会导致后续在旧 UI 上补交互。
- (verified) 子画布“进入/返回”完整导航属于 Phase E；Phase B 本轮只完成内部空间入口视觉和回调契约，不伪装导航已完成。

**代码变更：**
- `ClassNodeView.tsx` 增加本地 hover 状态、状态 rail、readonly/disabled 编辑禁用、内部空间入口、分区折叠摘要和字段过多 `+N hidden` 摘要。
- `NodeSection.tsx` 增加 `collapsedSummary` 插槽，折叠分区不再是空白。
- `DomainNodeView.tsx` 增加 hover/selected/readonly/disabled 状态、状态 rail、折叠摘要、内部空间入口和折叠/展开按钮回调。
- `GroupNode.tsx` 接入 `DomainNodeView.onToggleCollapsed`，通过 `ontologyDocumentStore.updateDomainView()` 写本体 domain view，再投影旧 graph display cache。
- `nodeViewTokens.ts` / `domainViewTokens.ts` 补充分区摘要、状态 rail、内部空间入口和 summary limit token。

**文档变更：**
- `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md` 标记 Phase B 阶段完成，下一阶段切到 Phase A。
- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` 更新节点显示、节点折叠、UI 配置化和分层隔离状态为阶段满足。
- `CODEBASE.md` 同步 Phase B 完成状态、Domain 折叠写本体 view、分区摘要、状态表达、内部空间入口和新增数据流。

**验证结果：**
- PASS：`cd frontend && npm run test:canvas:interactions`
- PASS：`cd frontend && npm run test:ontology:document`
- PASS：`cd frontend && npm run test:ontology:legacy-bridge`
- PASS：`cd frontend && npm run test:react-flow-adapter`
- PASS：`cd frontend && npm run test:domain:nesting`
- PASS：`cd frontend && npm run lint`
- PASS：`cd frontend && npm run check:architecture`
- PASS：`cd frontend && npm run build`
- PASS：`git diff --check`
- PASS：`curl -I --max-time 10 http://localhost:3000`

**已知提示：**
- `baseline-browser-mapping` 仍提示数据超过两个月未更新，本轮未做依赖升级。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `ACTIVE_DOCS.zh-CN.md` | 深度完整 | 深度完整 | 3 | 确认活跃文档和归档边界 |
| `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md` | 深度完整 | 深度完整 | 10 | Phase B 标记完成，下一步切到 Phase A |
| `UI_REFERENCE_INTERACTION_SPEC_2026-05-07.zh-CN.md` | 深度完整 | 深度完整 | 4 | 复核节点嵌套、状态、LOD、内部空间入口要求 |
| `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` | 深度完整 | 深度完整 | 8 | 状态表更新 Phase B 阶段满足项 |
| `frontend/features/ontology-canvas/ui/ClassNodeView.tsx` | 深度完整 | 深度完整 | 8 | 节点状态、分区摘要、内部空间入口和 readonly/disabled 禁用 |
| `frontend/features/ontology-canvas/ui/DomainNodeView.tsx` | 深度完整 | 深度完整 | 5 | 容器状态、折叠摘要、内部空间入口和折叠按钮回调 |
| `frontend/features/ontology-canvas/ui/NodeSection.tsx` | 深度完整 | 深度完整 | 5 | 增加 collapsedSummary 插槽 |
| `frontend/features/ontology-canvas/config/nodeViewTokens.ts` | 深度完整 | 深度完整 | 7 | 增加分区摘要、状态 rail、内部空间入口 token |
| `frontend/features/ontology-canvas/config/domainViewTokens.ts` | 深度完整 | 深度完整 | 4 | 增加状态 rail、内部空间入口和 summary limit token |
| `frontend/components/graph/nodes/GroupNode.tsx` | 深度完整 | 深度完整 | 4 | 折叠切换写本体 domain view 并投影旧 display cache |
| `CODEBASE.md` | 深度完整 | 深度完整 | 47 | 同步 Phase B 完成后的模块、函数、数据流和风险登记 |

**下一轮计划：**
- 进入 Phase A：在新 UI 上做浏览器实测和修复 resize 卡顿、拖拽回弹、父容器拖动、显式归入 / 移出、容器折叠投影和边锚点增量更新。

## [SYNC] 2026-05-08 16:59 — 新 UI 交互稳定：容器折叠投影降 DOM

### A. SYNC 范围声明

**触发任务：** 用户要求继续执行；Phase B 已完成，本轮进入新 UI 交互稳定阶段第一批。

**本轮完成标准：**
- Domain / 容器折叠后，ReactFlow 投影不再完整渲染其内部后代节点。
- 折叠后外部关系不能把内部隐藏节点重新带回画布。
- 展开后内部节点恢复显示，位置仍来自本体 view，不写旧 graph store 作为真相源。
- 相关测试覆盖折叠 / 展开投影和边过滤。
- 文档同步：路线图 / 产品规格 / CODEBASE / ITERATION_LOG 记录这批交互稳定结果。

**直接目标文件：**
- `frontend/features/ontology-canvas/adapters/react-flow/projection.ts`
- `frontend/scripts/test-react-flow-adapter.mjs`
- `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md`
- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md`
- `CODEBASE.md`
- `ITERATION_LOG.md`

**不变量：**
- 折叠投影只影响渲染输出，不删除本体 graph 中的节点、Domain 或关系。
- 本体 view 坐标继续是绝对坐标；ReactFlow 相对坐标只在 adapter 层生成。
- 不恢复旧 group display object 作为折叠真相源。
- 不提前做 Phase C 的 cluster / MiniMap，也不提前做 Phase D 正交边。

### C. SYNC 结果

**关键发现：**
- (verified) Phase B UI 已可表达 Domain 折叠摘要，但此前 ReactFlow 投影层仍可能保留折叠容器内部后代节点，性能收益不完整。
- (verified) 折叠容器降 DOM 必须放在 adapter 层统一处理；如果只在 UI 组件内隐藏内容，ReactFlow nodes/edges 仍会参与渲染和边计算。
- (verified) 端点不可见或缺失的边不应投影；否则折叠容器后，隐藏后代可能被关系线重新“带回”渲染路径。

**代码变更：**
- `projection.ts` 增加 `hasCollapsedAncestor()` 和 `resolveRenderableNodeIds()`，折叠 Group/Domain 自身保留，内部所有后代不进入 ReactFlow nodes。
- `projectNodesToReactFlowNodes()` 在非裁剪和视口裁剪两种路径都排除折叠祖先下的后代节点。
- `projectEdgesToReactFlowEdges()` 默认按可渲染节点集合过滤 source/target，连到隐藏后代或缺失端点的边不进入 ReactFlow edges。
- `react-flow/index.ts` 导出 `resolveRenderableNodeIds()`，供测试和后续 adapter 复用。
- `test-react-flow-adapter.mjs` 补充折叠 legacy group、折叠 ontology domain、隐藏端点边和缺失端点边的断言。

**文档变更：**
- `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md` 标记容器折叠投影第一批完成，并把当前阶段表述为“新 UI 交互稳定阶段（路线图 Phase A 收尾）”。
- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` 增加 Domain 折叠投影状态，说明内部后代 DOM 已能被折叠投影排除，摘要边和聚合仍待后续。
- `CODEBASE.md` 同步 adapter 导出、函数算法、GraphPageContent 注意事项和风险登记册。

**验证结果：**
- PASS：`cd frontend && npm run test:react-flow-adapter`
- PASS：`cd frontend && npm run check:architecture`
- PASS：`cd frontend && npm run test:domain:nesting`
- PASS：`cd frontend && npm run test:canvas:interactions`
- PASS：`cd frontend && npm run test:ontology:document`
- PASS：`cd frontend && npm run test:ontology:legacy-bridge`
- PASS：`cd frontend && npm run lint`
- PASS：`cd frontend && npm run build`
- PASS：`git diff --check`
- PASS：`curl -I --max-time 10 http://localhost:3000`

**已知提示：**
- `baseline-browser-mapping` 仍提示数据超过两个月未更新，本轮未做依赖升级。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/features/ontology-canvas/adapters/react-flow/projection.ts` | 深度完整 | 深度完整 | 9 | 新增折叠祖先判断、可渲染节点集合和隐藏端点边过滤 |
| `frontend/features/ontology-canvas/adapters/react-flow/index.ts` | 深度完整 | 深度完整 | 5 | 导出 `resolveRenderableNodeIds()` 支撑测试和后续复用 |
| `frontend/scripts/test-react-flow-adapter.mjs` | 深度完整 | 深度完整 | 8 | 覆盖折叠容器隐藏后代、ontology domain 折叠、隐藏端点边和缺失端点边 |
| `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md` | 深度完整 | 深度完整 | 11 | Phase A4 第一批状态更新，阶段口径改为新 UI 交互稳定 |
| `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` | 深度完整 | 深度完整 | 9 | 状态表新增 Domain 折叠投影基础满足 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 48 | 同步 projection 算法、导出、风险登记和折叠投影性能结论 |
| `ITERATION_LOG.md` | 深度完整 | 深度完整 | 49 | 记录本轮完成标准、结果、验证和下一步计划 |

**下一轮计划：**
- 继续新 UI 交互稳定阶段：优先做浏览器实测下的 resize / drag 手感验证，确认是否还存在一卡一卡、回弹或边锚点更新延迟；随后补显式归入 / 移出容器入口。

## [SYNC] 2026-05-08 17:14 — 新 UI 交互稳定：显式归入 / 移出容器入口

### A. SYNC 范围声明

**触发任务：** 继续执行新 UI 交互稳定阶段；产品规格要求普通拖拽不隐式改归属，归入 / 移出 Domain 必须来自明确操作。

**本轮完成标准：**
- 选中普通本体节点时，Inspector / 控制面板能列出当前可归入的 Domain / 容器。
- 点击归入后更新本体 `domainId/nodeIds/domainViews`，把节点放入容器内部合理位置，并同步旧 display cache。
- 已在容器内的普通节点提供显式移出入口，移出后不依赖普通拖拽破坏父子关系。
- 不恢复拖拽落点隐式改归属，不让旧 graph store 成为父子关系真相源。
- 测试覆盖归入、移出、位置调整、容器边界扩展和旧 display cache 投影。
- 文档同步：路线图 / 产品规格 / CODEBASE / ITERATION_LOG 记录这批结果。

**直接目标文件：**
- `frontend/features/ontology-canvas/blocks/NodeInspectorBlock.tsx`
- `frontend/features/ontology-canvas/model/interactions/domainNesting.ts`
- `frontend/scripts/test-canvas-interactions.mjs`
- `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md`
- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md`
- `CODEBASE.md`
- `ITERATION_LOG.md`

**不变量：**
- 普通拖拽不改变容器归属。
- 本体 document 是父子关系真相源，旧 graph store 只接收投影结果。
- UI 层只触发命令 / patch，不直接拼旧 `groupId/nodeIds`。
- 暂不做子画布导航、正交边或自动布局算法。

### C. SYNC 结果

**关键发现：**
- (verified) Inspector 里已有 Container 下拉，但原来属于草稿保存路径：需要 Save，并且只更新父子关系，不负责把节点放进目标容器内部空位。
- (verified) `updateOntologyNodeInDocument()` 已能维护本体 `node.domainId` 和 Domain `nodeIds`，因此本轮不需要新建 graph command；缺的是归入后的 view placement patch。
- (verified) 显式归入的空位搜索必须在 model/interactions 层完成，UI 只触发动作；否则后续容易把位置计算重新塞回 TSX。

**代码变更：**
- `domainNesting.ts` 新增 `createNodeDomainPlacementPatch()`：普通节点归入目标 Domain 后，自动选择内部空位，并调用 Domain 边界级联扩展。
- `NodeInspectorBlock.tsx` 的 Container 区新增直接容器按钮：点击 `Move to ...` 立即写本体父子关系、放入目标容器内部，并同步旧 display cache；`Remove from container` 也改为显式本体命令。
- `NodeInspectorBlock.handleSave()` 兼容下拉 + Save 的旧路径：普通节点保存时如果容器归属变化，也会补 placement patch。
- `test-canvas-interactions.mjs` 增加归入 / 移出断言，覆盖本体 `domainId/nodeIds`、目标容器内空位和边界扩展。

**文档变更：**
- `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md` 标记 Phase A3 普通节点显式归入 / 移出第一批完成，并保留 Domain 自身归入父容器、多层候选过滤和大图验证为后续项。
- `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` 更新 Domain 自动父子关系、显式归入 / 移出容器状态。
- `CODEBASE.md` 同步 `NodeInspectorBlock`、`domainNesting.ts`、相关函数索引、F-012 数据流和风险登记册。

**验证结果：**
- PASS：`cd frontend && npm run test:canvas:interactions`
- PASS：`cd frontend && npm run test:ontology:document`
- PASS：`cd frontend && npm run test:ontology:legacy-bridge`
- PASS：`cd frontend && npm run test:react-flow-adapter`
- PASS：`cd frontend && npm run check:architecture`
- PASS：`cd frontend && npm run lint`
- PASS：`cd frontend && npm run build`
- PASS：`git diff --check`
- PASS：touched files trailing whitespace scan
- PASS：`curl -I --max-time 10 http://localhost:3000`

**已知提示：**
- `baseline-browser-mapping` 仍提示数据超过两个月未更新，本轮未做依赖升级。

**覆盖进度更新：**

| 文件 | 前状态 | 现状态 | 阅读次数 | 备注 |
|------|--------|--------|----------|------|
| `frontend/features/ontology-canvas/blocks/NodeInspectorBlock.tsx` | 深度完整 | 深度完整 | 7 | Container 区新增直接归入/移出按钮，保存路径也补 placement patch |
| `frontend/features/ontology-canvas/model/interactions/domainNesting.ts` | 深度完整 | 深度完整 | 8 | 新增归入容器空位搜索和 `createNodeDomainPlacementPatch()` |
| `frontend/scripts/test-canvas-interactions.mjs` | 深度完整 | 深度完整 | 8 | 覆盖归入/移出容器、位置调整和边界扩展 |
| `DEVELOPMENT_ROADMAP_2026-05-07.zh-CN.md` | 深度完整 | 深度完整 | 12 | Phase A3 第一批状态更新 |
| `NODE_DOMAIN_PRODUCT_INTERACTION_SPEC_2026-05-06.zh-CN.md` | 深度完整 | 深度完整 | 10 | 状态表更新显式归入/移出基础满足 |
| `CODEBASE.md` | 深度完整 | 深度完整 | 49 | 同步 Inspector、domainNesting、数据流和风险登记 |
| `ITERATION_LOG.md` | 深度完整 | 深度完整 | 50 | 记录第二批新 UI 交互稳定结果 |

**下一轮计划：**
- 继续新 UI 交互稳定阶段：优先做浏览器内 resize / drag 手感实测和修复；重点看“一卡一卡”、拖拽回弹、父容器拖动后代同步、边锚点增量更新是否还有用户可感知问题。
