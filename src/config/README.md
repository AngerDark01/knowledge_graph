# 配置文件说明文档

## 概述
本项目采用模块化的配置管理方式，将不同类型的配置分离到专门的文件中，以提高代码的可维护性和清晰度。

## 配置文件列表

### 1. `constants.ts`
**用途**: 通用常量定义
**包含内容**:
- Tailwind CSS 与数值的映射关系 (`TAILWIND_SIZES`)
- UI 尺寸配置 (`UI_DIMENSIONS`):
  - NoteNode 初始尺寸: `{ width: 350, height: 280 }`
  - GroupNode 初始尺寸: `{ width: 300, height: 200 }`
  - 各种间距和视觉参数
- 验证限制配置 (`VALIDATION_CONFIG`)
- 历史记录配置 (`HISTORY_CONFIG`)
- 画布配置 (`CANVAS_CONFIG`)
- 边配置 (`EDGE_CONFIG`)
- 视觉区分策略配置 (`VISUAL_STYLE_CONFIG`)
- 嵌套限制配置 (`NESTING_CONFIG`)
- 边优化配置 (`EDGE_OPTIMIZATION_CONFIG`)
- 视觉样式相关函数 (`getGroupVisualStyle`, `getGroupOpacity`)

### 2. `layout.ts`
**用途**: 布局相关配置
**包含内容**:
- 布局算法参数 (`LAYOUT_CONFIG`)
- 间距和边距配置 (`PADDING_CONFIG`):
  - Group 内边距 (top: 48px，与其他边距: 20px)
  - 节点外框额外空间
- z-index 层级配置 (`Z_INDEX_CONFIG`)
- z-index 计算函数 (`calculateZIndex`)

### 3. `elk-algorithm.ts`
**用途**: ELK 布局算法参数配置
**包含内容**:
- 层次布局算法参数 (`layered`)
- 力导向布局算法参数 (`force`)
- 压力布局算法参数 (`stress`)
- 树形布局算法参数 (`tree`)
- 径向布局算法参数 (`radial`)
- 紧凑布局算法参数 (`compact`)
- 宽松布局算法参数 (`spacious`)
- 通用 ELK 配置参数 (`common`)

### 4. `elk.ts`
**用途**: ELK 配置模块的聚合引用
**包含内容**:
- ELKConfigBuilder 类的导出
- ELK_ALGORITHM_CONFIG 的导出
- 用于保持向后兼容性

### 5. `graph.config.ts`
**用途**: 主配置聚合文件
**包含内容**:
- 所有配置模块的聚合导出
- 便于其他模块一次性导入所有配置
- 包含注释说明各节点尺寸配置的位置

## 配置使用指南

### NoteNode 和 GroupNode 的初始尺寸
- **位置**: `constants.ts` 中的 `UI_DIMENSIONS.NODE_DEFAULT_SIZE` 和 `UI_DIMENSIONS.GROUP_DEFAULT_SIZE`
- **NoteNode 尺寸**: 350x280
- **GroupNode 尺寸**: 300x200

### 布局相关配置
- **位置**: `layout.ts` 中的 `LAYOUT_CONFIG` 和 `PADDING_CONFIG`
- **UI 组件高度统一**: 48px (对应 Tailwind 的 h-12)

### ELK 算法参数
- **位置**: `elk-algorithm.ts` 中的 `ELK_ALGORITHM_CONFIG`
- **用途**: ELK 布局算法的各种参数配置

## 依赖关系
- `graph.config.ts` 依赖 `constants.ts`、`layout.ts` 和 `elk.ts`
- `layout.ts` 依赖 `constants.ts` 中的 `UI_DIMENSIONS`
- `elk.ts` 聚合了 `elk-algorithm.ts` 的内容

## 维护说明
当需要修改配置时，请遵循以下原则：
1. 将相关配置聚合在对应的配置文件中
2. 保持配置值的一致性，特别是在 UI 组件和布局算法之间
3. 在修改核心配置值时，确保所有引用该值的地方都得到正确更新
4. 保持向后兼容性，避免破坏现有功能