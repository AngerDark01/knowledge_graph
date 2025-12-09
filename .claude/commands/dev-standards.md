# 知识图谱编辑器 - 开发规范

> 本文档定义项目的开发规范，确保代码质量和一致性。
> 所有开发工作必须遵循本规范。

---

## 📋 总则

1. **代码整洁**：避免代码堆砌，保持模块化和职责分离
2. **类型安全**：全面使用 TypeScript，必要时使用 Zod 验证
3. **参考本体**：基于 `项目文档/项目本体结构.md` 和 `项目文档/项目本体结构_规划版.md` 进行开发
4. **阅读源码**：实现新功能前，必须先阅读相关现有源码，保持风格一致
5. **增量开发**：小步迭代，每次提交代码应可运行且功能完整

---

## 1. 项目架构规范

### 1.1 目录结构

```
src/
├── app/                    # Next.js 应用入口
│   ├── layout.tsx         # 全局布局
│   ├── page.tsx           # 主页面
│   └── api/               # API 路由
├── components/            # 组件
│   ├── graph/            # 图编辑器组件
│   │   ├── core/         # 核心组件
│   │   ├── nodes/        # 节点组件
│   │   ├── edges/        # 边组件
│   │   ├── controls/     # 控制组件
│   │   ├── editors/      # 编辑器组件
│   │   └── ui/           # UI 组件
│   ├── workspace/        # 工作空间组件 [新增]
│   │   └── sidebar/      # 侧边栏组件
│   └── ui/               # 基础 UI 组件
├── stores/               # 状态管理
│   ├── graph/           # 图状态
│   │   ├── nodes/       # 节点操作切片
│   │   ├── edgesSlice.ts
│   │   ├── canvasViewSlice.ts
│   │   └── historySlice.ts
│   └── workspace/       # 工作空间状态 [新增]
├── types/               # 类型定义
│   ├── graph/          # 图数据类型
│   └── workspace/      # 工作空间类型 [新增]
├── services/           # 服务层
│   ├── layout/        # 布局服务
│   └── storage/       # 存储服务 [新增]
├── utils/             # 工具函数
│   ├── graph/        # 图相关工具
│   ├── workspace/    # 工作空间工具 [新增]
│   └── storage/      # 存储工具 [新增]
├── config/           # 配置文件
│   ├── constants.ts  # 常量定义
│   ├── graph.config.ts
│   ├── layout.ts
│   ├── workspace.ts  # 工作空间配置 [新增]
│   └── storage.ts    # 存储配置 [新增]
├── hooks/            # 自定义 hooks [新增]
└── lib/              # 库函数
```

### 1.2 模块职责

| 层级 | 职责 | 禁止 |
|------|------|------|
| **类型定义层** | 定义数据模型、接口、枚举 | 包含业务逻辑、UI 组件 |
| **配置层** | 定义常量、配置参数 | 包含业务逻辑、动态计算 |
| **工具函数层** | 纯函数、辅助函数 | 访问状态、UI 渲染 |
| **服务层** | 封装业务逻辑、外部服务调用 | 直接访问组件、DOM 操作 |
| **状态管理层** | 管理全局状态、状态操作 | 包含 UI 组件、DOM 操作 |
| **组件层** | UI 渲染、用户交互 | 包含复杂业务逻辑 |

### 1.3 依赖规则

**允许的依赖方向：**
```
组件层 → 状态管理层 → 服务层 → 工具函数层 → 类型定义层
   ↓          ↓           ↓           ↓
 配置层 ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←
```

**禁止的依赖：**
- ❌ 低层模块依赖高层模块（例如：工具函数依赖组件）
- ❌ 服务层直接依赖组件层
- ❌ 类型定义层依赖任何其他层

---

## 2. 代码风格规范

### 2.1 TypeScript 规范

#### 2.1.1 类型定义

```typescript
// ✅ 优先使用 interface 定义对象类型
interface User {
  id: string
  name: string
  createdAt: Date  // ⚠️ 使用 Date 类型，而非 string
}

// ✅ 使用 type 定义联合类型、交叉类型
type Status = 'pending' | 'completed' | 'failed'
type MixedType = UserA & UserB

// ✅ 使用 enum 定义枚举（与现有代码一致）
export enum BlockEnum {
  NODE = 'node',
  GROUP = 'group'
}

// ❌ 避免使用 any
const data: any = {}  // 不推荐

// ✅ 使用 unknown 或具体类型
const data: unknown = {}
const specificData: Record<string, any> = {}  // 明确意图
```

#### 2.1.2 Zod Schema 规范

```typescript
import { z } from 'zod'

// ✅ 紧跟 interface 定义 Zod schema
export interface Canvas {
  id: string
  name: string
  createdAt: Date
}

export const CanvasSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  createdAt: z.date(),  // ⚠️ 使用 z.date()，而非 z.string()
})

// ✅ 使用 z.infer 推导类型（避免重复定义）
export type Canvas = z.infer<typeof CanvasSchema>
```

### 2.2 命名规范

#### 2.2.1 文件命名

```
✅ 组件文件：PascalCase.tsx
   - UserProfile.tsx
   - CanvasTree.tsx

✅ 工具函数：camelCase.ts
   - canvasHelpers.ts
   - storageUtils.ts

✅ 类型定义：camelCase.ts（或 models.ts）
   - models.ts
   - types.ts

✅ 配置文件：camelCase.ts（或 kebab-case.ts）
   - workspace.ts
   - elk-algorithm.ts

✅ Hook 文件：useXxx.ts
   - useResizable.ts
   - useLocalStorage.ts
```

#### 2.2.2 变量命名

```typescript
// ✅ 常量：UPPER_SNAKE_CASE
const MAX_CANVAS_COUNT = 100
export const STORAGE_KEYS = {
  WORKSPACE: 'kg-editor:workspace',
  VERSION: 'kg-editor:version',
}

// ✅ 变量、函数：camelCase
const currentCanvas = canvases.find(...)
function createCanvas(name: string) { }

// ✅ 组件、类：PascalCase
class StorageManager { }
const UserProfile: React.FC = () => { }

// ✅ 私有成员：_prefixed（可选）
class MyClass {
  private _internalState: string
}

// ✅ 布尔值：is/has/should 前缀
const isActive = true
const hasChildren = node.children.length > 0
const shouldSave = dirty && !saving
```

### 2.3 注释规范

```typescript
/**
 * 创建新画布
 *
 * @param name - 画布名称
 * @param parentId - 父画布 ID（可选）
 * @returns 创建的画布对象
 * @throws {Error} 当画布名称为空时抛出错误
 */
function createCanvas(name: string, parentId?: string): Canvas {
  // 实现逻辑...
}

// ✅ 复杂逻辑添加注释
// 递归删除所有子画布
const idsToDelete = getCanvasIdsToDelete(canvasId)

// ❌ 避免冗余注释
// 设置名称（不需要这种注释）
canvas.name = name
```

---

## 3. 状态管理规范

### 3.1 Zustand Store 结构

```typescript
// ✅ 使用切片模式（Slice Pattern）
import { StateCreator } from 'zustand'

// 1. 定义切片接口
export interface UserSlice {
  user: User
  setUser: (user: User) => void
  updateUser: (updates: Partial<User>) => void
}

// 2. 创建切片
export const createUserSlice: StateCreator<UserSlice> = (set) => ({
  user: DEFAULT_USER,

  setUser: (user) => set({ user }),

  updateUser: (updates) => set((state) => ({
    user: { ...state.user, ...updates }
  })),
})

// 3. 组合切片
export const useWorkspaceStore = create<UserSlice & CanvasSlice>()(
  devtools(
    (...a) => ({
      ...createUserSlice(...a),
      ...createCanvasSlice(...a),
    }),
    { name: 'WorkspaceStore' }
  )
)
```

### 3.2 状态更新规范

```typescript
// ✅ 使用函数式更新（依赖旧状态时）
set((state) => ({
  count: state.count + 1
}))

// ✅ 直接更新（不依赖旧状态时）
set({ isLoading: false })

// ✅ 保持不可变性
set((state) => ({
  canvases: state.canvases.map(c =>
    c.id === id ? { ...c, name: newName } : c
  )
}))

// ❌ 避免直接修改状态
state.canvases[0].name = 'new name'  // 错误！
```

### 3.3 状态选择器规范

```typescript
// ✅ 使用细粒度选择器（避免不必要的重渲染）
const currentCanvas = useWorkspaceStore((state) =>
  state.canvases.find(c => c.id === state.currentCanvasId)
)

// ❌ 避免选择整个 store
const store = useWorkspaceStore()  // 会导致过多重渲染
```

---

## 4. 组件开发规范

### 4.1 组件结构

```typescript
'use client'  // Next.js 客户端组件标记

import React, { useState, useEffect, useCallback } from 'react'
import { useWorkspaceStore } from '@/stores/workspace'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// 1. Props 接口定义
interface CanvasTreeProps {
  className?: string
  onSelect?: (canvasId: string) => void
}

// 2. 组件定义
export const CanvasTree: React.FC<CanvasTreeProps> = ({
  className,
  onSelect,
}) => {
  // 3. 状态 hooks
  const [isLoading, setIsLoading] = useState(false)

  // 4. Store hooks
  const canvases = useWorkspaceStore((state) => state.canvases)
  const createCanvas = useWorkspaceStore((state) => state.createCanvas)

  // 5. 副作用 hooks
  useEffect(() => {
    // 初始化逻辑
  }, [])

  // 6. 事件处理函数
  const handleCreate = useCallback(() => {
    const name = prompt('请输入画布名称')
    if (name) createCanvas(name)
  }, [createCanvas])

  // 7. 渲染
  return (
    <div className={cn('space-y-2', className)}>
      {/* UI 内容 */}
    </div>
  )
}
```

### 4.2 组件优化

```typescript
// ✅ 使用 React.memo 避免不必要的重渲染
export const CanvasTreeItem = React.memo(({ node }: Props) => {
  // ...
})

// ✅ 使用 useCallback 缓存函数
const handleClick = useCallback(() => {
  onClick(node.id)
}, [onClick, node.id])

// ✅ 使用 useMemo 缓存计算结果
const sortedCanvases = useMemo(() =>
  canvases.sort((a, b) => a.name.localeCompare(b.name)),
  [canvases]
)

// ✅ 条件渲染优化
if (isLoading) return <Skeleton />
if (!data) return null

return <Content data={data} />
```

### 4.3 样式规范

```typescript
// ✅ 使用 Tailwind CSS 类名
<div className="flex items-center space-x-2 p-4 rounded-md hover:bg-accent">

// ✅ 使用 cn() 合并类名
<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  className
)}>

// ✅ 使用内联样式（仅必要时）
<div style={{ width: `${width}px` }}>

// ❌ 避免过多内联样式
<div style={{ padding: '16px', margin: '8px', ... }}>  // 应使用 Tailwind
```

---

## 5. 服务层规范

### 5.1 服务类设计

```typescript
// ✅ 单例模式
export class StorageManager {
  private static instance: StorageManager
  private adapter: StorageAdapter

  private constructor(adapter?: StorageAdapter) {
    this.adapter = adapter || new LocalStorageAdapter()
  }

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager()
    }
    return StorageManager.instance
  }

  async save(key: string, data: unknown): Promise<void> {
    // 实现...
  }
}

// 导出单例
export const storageManager = StorageManager.getInstance()
```

### 5.2 适配器模式

```typescript
// 1. 定义接口
export interface StorageAdapter {
  save(key: string, data: unknown): Promise<void>
  load<T>(key: string): Promise<T | null>
  remove(key: string): Promise<void>
}

// 2. 实现适配器
export class LocalStorageAdapter implements StorageAdapter {
  async save(key: string, data: unknown): Promise<void> {
    localStorage.setItem(key, JSON.stringify(data))
  }
  // ...
}

// 3. 依赖注入
class StorageManager {
  constructor(private adapter: StorageAdapter) {}
}
```

---

## 6. 错误处理规范

### 6.1 错误捕获

```typescript
// ✅ 服务层捕获并处理错误
async loadWorkspace(): Promise<Workspace | null> {
  try {
    const data = await this.adapter.load<StorageData>(STORAGE_KEYS.WORKSPACE)
    if (!data) return null

    // 验证数据
    const validated = StorageDataSchema.parse(data)
    return validated.workspace
  } catch (error) {
    console.error('加载工作空间失败:', error)
    // 记录错误到监控服务（如 Sentry）
    return null
  }
}

// ✅ 组件层处理错误状态
const handleLoad = async () => {
  try {
    setIsLoading(true)
    const workspace = await storageManager.loadWorkspace()
    if (!workspace) {
      toast.error('加载失败，请刷新页面重试')
      return
    }
    // 成功处理
  } catch (error) {
    toast.error('发生未知错误')
  } finally {
    setIsLoading(false)
  }
}
```

### 6.2 用户提示

```typescript
// ✅ 清晰的错误提示
if (!name || name.trim() === '') {
  alert('画布名称不能为空')
  return
}

// ✅ 确认危险操作
const confirmed = confirm(
  `确定要删除画布"${canvas.name}"吗？\n此操作将同时删除所有子画布。`
)
if (!confirmed) return
```

---

## 7. 性能优化规范

### 7.1 防抖与节流

```typescript
import { debounce } from '@/lib/utils'

// ✅ 防抖（用于输入、保存等）
const debouncedSave = debounce(async () => {
  await storageManager.saveCanvas(...)
}, 500)

// ✅ 节流（用于滚动、拖拽等）
const throttledUpdate = throttle(() => {
  updatePosition(...)
}, 16) // 60fps
```

### 7.2 懒加载

```typescript
// ✅ 动态导入组件
const HeavyComponent = lazy(() => import('./HeavyComponent'))

<Suspense fallback={<Skeleton />}>
  <HeavyComponent />
</Suspense>
```

### 7.3 虚拟滚动

```typescript
// ✅ 大列表使用虚拟滚动（react-window 或 react-virtualized）
import { FixedSizeList } from 'react-window'

<FixedSizeList
  height={600}
  itemCount={canvases.length}
  itemSize={40}
  width="100%"
>
  {({ index, style }) => (
    <CanvasTreeItem style={style} canvas={canvases[index]} />
  )}
</FixedSizeList>
```

---

## 8. 测试规范

### 8.1 单元测试

```typescript
// ✅ 测试工具函数
describe('canvasHelpers', () => {
  describe('findCanvasById', () => {
    it('should find canvas by id', () => {
      const canvas = findCanvasById(canvases, 'canvas_1')
      expect(canvas?.id).toBe('canvas_1')
    })

    it('should return null if not found', () => {
      const canvas = findCanvasById(canvases, 'nonexistent')
      expect(canvas).toBeNull()
    })
  })
})

// ✅ 测试服务层
describe('StorageManager', () => {
  it('should save workspace', async () => {
    await storageManager.saveWorkspace(mockWorkspace)
    const loaded = await storageManager.loadWorkspace()
    expect(loaded).toEqual(mockWorkspace)
  })
})
```

### 8.2 集成测试

```typescript
// ✅ 测试用户流程
describe('Canvas Management', () => {
  it('should create and switch canvas', async () => {
    const { result } = renderHook(() => useWorkspaceStore())

    // 创建画布
    act(() => {
      result.current.createCanvas('New Canvas')
    })

    // 验证创建成功
    expect(result.current.canvases).toHaveLength(2)

    // 切换画布
    act(() => {
      result.current.switchCanvas(newCanvasId)
    })

    // 验证切换成功
    expect(result.current.currentCanvasId).toBe(newCanvasId)
  })
})
```

---

## 9. Git 提交规范

### 9.1 Commit Message 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型：**
- `feat`: 新功能
- `fix`: 修复 bug
- `refactor`: 重构代码
- `docs`: 文档更新
- `style`: 代码格式调整
- `test`: 测试相关
- `chore`: 构建/工具相关

**示例：**
```
feat(workspace): 实现多画布管理功能

- 新增画布创建/删除/重命名功能
- 实现画布树形结构展示
- 集成本地存储持久化

Closes #123
```

### 9.2 分支管理

```
main              # 主分支（稳定版本）
├── develop       # 开发分支
│   ├── feature/canvas-management
│   ├── feature/local-storage
│   └── fix/layout-bug
└── hotfix/...    # 紧急修复分支
```

---

## 10. 开发流程

### 10.1 新功能开发流程

1. **阅读本体文档**：查看 `项目文档/项目本体结构.md` 和 `项目文档/项目本体结构_规划版.md`
2. **阅读相关源码**：理解现有实现和风格
3. **设计数据结构**：基于现有代码风格设计新数据结构
4. **编写类型定义**：在 `src/types/` 目录定义类型和 Zod schema
5. **实现服务层**：在 `src/services/` 目录实现业务逻辑
6. **实现状态管理**：在 `src/stores/` 目录实现状态切片
7. **实现组件**：在 `src/components/` 目录实现 UI 组件
8. **编写测试**：编写单元测试和集成测试
9. **手动测试**：测试边界情况和用户体验
10. **提交代码**：按照 Git 提交规范提交代码

### 10.2 代码审查要点

- [ ] 代码是否遵循本规范？
- [ ] 类型定义是否完整且与现有风格一致？
- [ ] 是否有适当的错误处理？
- [ ] 是否有性能优化考虑？
- [ ] 是否有单元测试？
- [ ] 是否更新了本体文档？
- [ ] 提交信息是否清晰？

---

## 11. 常见问题

### Q1: 何时使用 Date vs string？
**A**: 统一使用 `Date` 类型（与现有代码一致）。存储时由 StorageManager 自动序列化/反序列化。

### Q2: 何时使用 interface vs type？
**A**:
- 对象类型优先使用 `interface`
- 联合类型、交叉类型使用 `type`
- 保持与现有代码风格一致

### Q3: 如何处理大数据量？
**A**:
1. 使用虚拟滚动
2. 使用 React.memo 和 useCallback 优化
3. 考虑切换到 IndexedDB
4. 数据分页加载

### Q4: localStorage 空间不足怎么办？
**A**:
1. 提示用户清理数据
2. 提供数据导出功能
3. 切换到 IndexedDB 适配器

---

## 12. 参考资料

- [项目本体结构](../项目文档/项目本体结构.md)
- [项目本体结构_规划版](../项目文档/项目本体结构_规划版.md)
- [多画布管理_实现方案](../项目文档/多画布管理_实现方案.md)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [Zustand 文档](https://docs.pmnd.rs/zustand/)
- [React Flow 文档](https://reactflow.dev/)

---

**文档版本**: v1.0
**最后更新**: 2025-12-09
**维护者**: 开发团队
