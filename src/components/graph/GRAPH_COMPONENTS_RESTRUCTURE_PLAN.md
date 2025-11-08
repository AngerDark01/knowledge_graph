# Graph 组件模块重构方案

## 1. 概述

本方案旨在对 `/src/components/graph` 目录进行重构，将当前扁平化的组件结构拆分为功能分类的模块化结构，提升代码的可维护性、可读性和可测试性。

## 2. 当前结构分析

### 2.1 当前目录结构
```
graph/
├── __tests__/
├── graph-page/
├── node/
├── ContentEditor.tsx
├── CrossGroupEdge.tsx
├── CustomEdge.tsx
├── EdgeEditor.tsx
├── EdgeFilterControl.tsx
├── HistoryControl.tsx
├── MarkdownRenderer.tsx
├── NodeEditor.tsx
├── StructuredAttributeEditor.tsx
├── SummaryView.tsx
├── Tag.tsx
├── TagInput.tsx
```

### 2.2 主要问题
- **大型文件**：`GraphPageContent.tsx` 包含过多职责
- **功能分散**：相似功能的组件没有归类
- **职责不清**：单个文件承担过多职责
- **维护困难**：查找特定功能需要遍历多个文件

## 3. 目标结构设计

```
graph/
├── core/                    # 核心页面和逻辑
│   ├── GraphPageContent.tsx # 重构后的主页面组件
│   ├── nodeSyncUtils.ts     # 节点同步逻辑工具函数
│   └── index.ts
├── nodes/                   # 节点相关组件
│   ├── BaseNode.tsx         # 基础节点组件
│   ├── NoteNode.tsx         # 精简版NoteNode组件
│   ├── NoteNodeExpand.tsx   # NoteNode的展开/收缩功能组件
│   ├── NoteNodeEdit.tsx     # NoteNode的编辑功能组件
│   ├── GroupNode.tsx        # 群组节点组件
│   └── index.ts
├── edges/                   # 边相关组件和逻辑
│   ├── CustomEdge.tsx       # 自定义边组件
│   ├── CrossGroupEdge.tsx   # 跨群组边组件
│   └── index.ts
├── editors/                 # 各种编辑器组件
│   ├── ContentEditor.tsx    # 内容编辑器
│   ├── NodeEditor.tsx       # 节点编辑器
│   ├── EdgeEditor.tsx       # 边编辑器
│   ├── StructuredAttributeEditor.tsx # 结构化属性编辑器
│   └── index.ts
├── controls/                # 控制组件
│   ├── EdgeFilterControl.tsx # 边筛选控制
│   ├── HistoryControl.tsx    # 历史控制
│   ├── Toolbar.tsx           # 工具栏
│   ├── ZoomIndicator.tsx     # 缩放指示器
│   └── index.ts
├── ui/                      # 通用UI组件
│   ├── MarkdownRenderer.tsx  # Markdown渲染器
│   ├── Tag.tsx              # 标签组件
│   ├── TagInput.tsx         # 标签输入组件
│   ├── SummaryView.tsx      # 摘要视图
│   └── index.ts
├── hooks/                   # 通用自定义hooks（新增）
│   ├── useNodeExpansion.ts  # 节点展开/收缩逻辑
│   ├── useNodeSync.ts       # 节点同步逻辑（从GraphPageContent提取）
│   └── index.ts
└── graph-page/              # 保持原有graph-page目录结构
    ├── components/
    ├── hooks/
    └── utils/
```

## 4. 重构步骤

### 阶段一：创建目录结构和配置

1. **创建新目录结构**
   - 创建 core, nodes, edges, editors, controls, ui, hooks 目录
   - 确保所有目录包含 index.ts 导出文件

2. **更新 tsconfig.json 路径配置**
   - 添加新的路径映射，如 `"@/components/graph/nodes/*": ["./src/components/graph/nodes/*"]`

3. **编写导出文件**
   - 每个目录的 index.ts 文件导出相应组件

### 阶段二：组件迁移

1. **迁移编辑器组件至 editors 目录**
   - ContentEditor.tsx
   - NodeEditor.tsx
   - EdgeEditor.tsx
   - StructuredAttributeEditor.tsx

2. **迁移控制组件至 controls 目录**
   - EdgeFilterControl.tsx
   - HistoryControl.tsx
   - (Toolbar.tsx 和 ZoomIndicator.tsx 从 graph-page/components 迁移)

3. **迁移UI组件至 ui 目录**
   - MarkdownRenderer.tsx
   - Tag.tsx
   - TagInput.tsx
   - SummaryView.tsx

4. **迁移边组件至 edges 目录**
   - CustomEdge.tsx
   - CrossGroupEdge.tsx

5. **更新 node 目录结构至 nodes 目录**
   - BaseNode.tsx
   - GroupNode.tsx
   - NoteNode.tsx

### 阶段三：大型文件拆分

#### 3.1 GraphPageContent.tsx 拆分

**当前文件大小**: 约400行，职责过多

**拆分内容**:
1. **提取节点同步逻辑** (`core/nodeSyncUtils.ts`)
   - `convertToRelativePosition` 函数
   - `convertToAbsolutePosition` 函数
   - 同步store到ReactFlow的逻辑
   - 节点拖拽同步逻辑

2. **提取自定义hooks** (`hooks/useNodeSync.ts`)
   - `onNodeDragStart` 事件处理器
   - `onNodeDragStop` 事件处理器
   - 节点、边的变更处理逻辑
   - 缩放监听逻辑

3. **精简主组件** (`core/GraphPageContent.tsx`)
   - 保留核心渲染逻辑
   - 保留组件初始化逻辑
   - 调用拆分出的逻辑和hooks

**注意事项**:
- 确保 `safeNumber` 工具函数的正确导入和使用
- 保持 `GROUP_PADDING` 和 `NODE_VISUAL_PADDING` 常量的引用
- 更新所有导入路径，确保依赖关系正确

#### 3.2 NoteNode.tsx 拆分

**当前文件大小**: 约350行，状态管理复杂

**拆分内容**:
1. **提取展开/收缩逻辑** (`nodes/NoteNodeExpand.tsx`)
   - `handleToggleExpand` 函数
   - 展开/收缩状态管理
   - 尺寸变化逻辑

2. **提取编辑逻辑** (`nodes/NoteNodeEdit.tsx`)
   - 内容编辑状态管理
   - 标题编辑状态管理
   - `handleToggleEdit` 和 `handleTitleBlur` 函数

3. **创建自定义hook处理展开状态** (`hooks/useNodeExpansion.ts`)
   - 管理 `isExpanded` 状态
   - 展开/收缩逻辑
   - 尺寸管理逻辑

4. **精简主组件** (`nodes/NoteNode.tsx`)
   - 保留核心渲染逻辑
   - 调用拆分出的组件和hooks
   - 保持与BaseNode的集成

**注意事项**:
- 确保所有事件处理函数正确传递参数
- 保持与GraphQL store的正确交互
- 验证 `MarkdownRenderer` 组件的导入路径

### 阶段四：路径更新和测试

1. **全局更新导入路径**
   - 更新所有对移动组件的引用
   - 确保导入路径符合新的目录结构
   - 检查别名导入（如 `@/components/...`）是否正确

2. **函数签名和参数验证**
   - 确保拆分出的函数具有正确的参数和返回值
   - 验证函数签名与调用方的一致性
   - 检查组件props的类型定义

3. **类型和接口更新**
   - 更新相关的类型定义文件
   - 确保接口定义与拆分后的组件保持一致

4. **测试功能完整性**
   - 运行单元测试，确保所有测试通过
   - 手动测试核心功能，验证拆分后功能正常
   - 检查控制台错误和警告

## 5. 风险控制措施

### 5.1 导入路径错误
- **风险**: 移动文件后忘记更新导入路径
- **措施**: 使用IDE查找和替换功能，或脚本工具批量更新
- **验证**: 运行TypeScript编译检查，确保无导入错误

### 5.2 函数签名不一致
- **风险**: 拆分函数后参数或返回值类型发生变化
- **措施**: 重构前记录原函数签名，重构后验证一致性
- **验证**: 运行TypeScript类型检查

### 5.3 不存在的类名
- **风险**: 在拆分过程中误用不存在的CSS类名
- **措施**: 仔细检查原始文件中的所有CSS类名，确保在拆分后保持一致
- **验证**: 运行应用并检查页面渲染，确保样式正常

### 5.4 状态管理错误
- **风险**: 状态管理逻辑在拆分后不一致
- **措施**: 保持状态管理逻辑的完整性，避免状态丢失
- **验证**: 测试所有交互功能，确保状态正确更新

## 6. 验证标准

1. **TypeScript编译通过**：无类型错误
2. **所有测试通过**：单元测试、集成测试正常运行
3. **功能完整性**：所有现有功能正常工作
4. **性能测试**：拆分后无性能损失
5. **代码质量**：ESLint和代码检查无错误

## 7. 回滚方案

如果重构过程中出现严重问题，可通过以下方式回滚：
1. 确保已提交当前代码到版本控制系统
2. 使用 `git restore` 命令恢复到重构前状态
3. 删除本次重构创建的文件和目录
4. 重新安装依赖以确保环境一致

## 8. 实施时间表

- **阶段一**: 半天 - 创建目录结构和配置
- **阶段二**: 1天 - 组件迁移
- **阶段三**: 2天 - 大型文件拆分
- **阶段四**: 半天 - 路径更新和测试

总预计时间: 4天