# Node/Group 转换功能

## 功能概述

在知识图谱编辑器中，用户现在可以在 NoteNode 和 GroupNode 之间进行转换。

## 功能说明

### NoteNode → GroupNode 转换

- 用户可以点击 NoteNode 上的转换按钮（循环箭头图标）将普通节点转换为群组节点
- 转换后节点变为群组，但保持原有的内容、位置和尺寸
- 节点类型从 `BlockEnum.NODE` 变为 `BlockEnum.GROUP`
- 添加 `convertedFrom` 字段标记原始类型为 `BlockEnum.NODE`
- 添加 `isConverted` 字段标记为 `true`

### GroupNode → NoteNode 转换

- 用户可以点击 GroupNode 上的转换按钮（双向箭头图标）将群组节点转换为普通节点
- 转换后节点变为普通节点，但保持原有的内容、位置和尺寸
- 节点类型从 `BlockEnum.GROUP` 变为 `BlockEnum.NODE`
- 添加 `convertedFrom` 字段标记原始类型为 `BlockEnum.GROUP`
- 添加 `isConverted` 字段标记为 `true`
- 将群组内的所有子节点保存到 `savedChildren` 字段中
- 将与子节点相关的边保存到 `savedEdges` 字段中

## 数据结构扩展

在 `CommonNodeType` 中扩展了以下字段：

- `convertedFrom`: 原始类型，可为 `BlockEnum.NODE` 或 `BlockEnum.GROUP`
- `isConverted`: 标记是否为转换节点
- `savedChildren`: 保存转换为NoteNode时的子节点数据
- `savedEdges`: 保存转换为NoteNode时的边关系数据
- `originalPosition`: 保存原始位置（仅在转换为NoteNode时使用）
- `originalSize`: 保存原始尺寸（仅在转换为NoteNode时使用）

## 实现细节

### 转换操作

- 通过 `useGraphStore` 的 `convertNodeToGroup` 和 `convertGroupToNode` 函数执行转换
- 使用 `createConversionOperationsSlice` 模块管理转换逻辑

### 渲染控制

- 在 `syncStoreToReactFlowNodes` 函数中过滤已转换节点的子节点
- 当一个节点的 `isConverted` 为 `true` 且类型为 `NODE` 时，其子节点不会被渲染

### 可逆性

- 转换是可逆的，但没有直接的还原函数
- 如果需要还原到原始状态，需要再次转换

## 设计原则

- **松耦合**: 转换功能不依赖现有节点管理逻辑，使用独立的模块实现
- **非破坏性**: 转换过程不会丢失任何数据
- **可扩展性**: 设计的数据结构可以支持未来更多类型的转换
- **用户体验**: 转换按钮在节点界面中清晰可见