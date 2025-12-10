import { z } from 'zod'
import { Node, Group, Edge, NodeSchema, EdgeSchema, BlockEnum } from '@/types/graph/models'

// ========== 用户模型 (预留设计) ==========
export interface User {
  id: string
  name: string
  avatar?: string
  createdAt: Date  // ✅ 修正：使用 Date
}

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().optional(),
  createdAt: z.date(),  // ✅ 修正：使用 z.date()
})

// ========== 画布模型 ==========
export interface Canvas {
  id: string
  name: string
  parentId: string | null
  children: string[]  // 子画布 ID 制
  graphData: {
    nodes: (Node | Group)[]  // ✅ 修正：包含 Node 和 Group
    edges: Edge[]
  }
  viewportState: {
    x: number
    y: number
    zoom: number
  }
  isCollapsed: boolean
  createdAt: Date  // ✅ 修正：使用 Date
  updatedAt: Date  // ✅ 修正：使用 Date
}

export const CanvasSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  parentId: z.string().nullable(),
  children: z.array(z.string()),
  graphData: z.object({
    nodes: z.array(z.union([NodeSchema, z.object({
      ...NodeSchema.shape,
      type: z.literal(BlockEnum.GROUP),
      collapsed: z.boolean(),
      nodeIds: z.array(z.string()),
      boundary: z.object({
        minX: z.number(),
        minY: z.number(),
        maxX: z.number(),
        maxY: z.number(),
      }),
    })])),
    edges: z.array(EdgeSchema),
  }),
  viewportState: z.object({
    x: z.number(),
    y: z.number(),
    zoom: z.number(),
  }),
  isCollapsed: z.boolean(),
  createdAt: z.date(),  // ✅ 修正：使用 z.date()
  updatedAt: z.date(),  // ✅ 修正：使用 z.date()
})

// ========== 画布树节点 ==========
export interface CanvasTreeNode {
  id: string
  name: string
  isCollapsed: boolean
  children: CanvasTreeNode[]
}

export const CanvasTreeNodeSchema: z.ZodType<CanvasTreeNode> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    isCollapsed: z.boolean(),
    children: z.array(CanvasTreeNodeSchema),
  })
)

// ========== 工作空间模型 ==========
export interface Workspace {
  userId: string
  currentCanvasId: string
  canvases: Canvas[]
  canvasTree: CanvasTreeNode[]
}

export const WorkspaceSchema = z.object({
  userId: z.string(),
  currentCanvasId: z.string(),
  canvases: z.array(CanvasSchema),
  canvasTree: z.array(CanvasTreeNodeSchema),
})

// ========== 默认值 ==========
export const DEFAULT_USER: User = {
  id: 'user_0',
  name: '默认用户',
  createdAt: new Date(),  // ✅ 修正：使用 Date 对象
}

export const DEFAULT_CANVAS: Canvas = {
  id: 'canvas_default',
  name: '默认画布',
  parentId: null,
  children: [],
  graphData: {
    nodes: [],
    edges: [],
  },
  viewportState: {
    x: 0,
    y: 0,
    zoom: 1,
  },
  isCollapsed: false,
  createdAt: new Date(),  // ✅ 修正：使用 Date 对象
  updatedAt: new Date(),  // ✅ 修正：使用 Date 对象
}