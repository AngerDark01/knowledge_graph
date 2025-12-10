import {
  StorageAdapter,
  StorageData,
  StorageDataSchema,
  STORAGE_KEYS,
  STORAGE_VERSION,
} from '@/types/workspace/storage'
import { Workspace, Canvas } from '@/types/workspace/models'

// 创建 FileSystemAdapter 接口的定义（在单独的文件中，但为了简单先在这里定义）
interface FileSystemAdapter {
  saveToFile(path: string, data: unknown): Promise<void>
  loadFromFile<T>(path: string): Promise<T | null>
  fileExists(path: string): Promise<boolean>
  deleteFile(path: string): Promise<void>
}

export class StorageManager {
  private basePath: string

  constructor(basePath: string = '/api/workspace') {
    this.basePath = basePath
  }

  /**
   * 序列化数据（Date → ISO string）
   */
  private serialize(data: unknown): string {
    return JSON.stringify(data, (key, value) => {
      // 将 Date 对象转换为 ISO 字符串
      if (value instanceof Date) {
        return value.toISOString()
      }
      return value
    })
  }

  /**
   * 反序列化数据（ISO string → Date）
   */
  private deserialize<T>(serialized: string): T {
    return JSON.parse(serialized, (key, value) => {
      // 将 ISO 字符串转换回 Date 对象
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
        try {
          const date = new Date(value)
          if (!isNaN(date.getTime())) {
            return date
          }
        } catch {
          // 如果解析失败，保持原始值
        }
      }
      return value
    })
  }

  /**
   * 加载完整工作空间数据
   */
  async loadWorkspace(): Promise<Workspace | null> {
    try {
      const response = await fetch(`${this.basePath}/load?key=${encodeURIComponent(STORAGE_KEYS.WORKSPACE)}`)

      if (!response.ok) {
        if (response.status === 404) {
          return null // 文件不存在，返回 null
        }
        throw new Error(`加载失败: ${response.status}`)
      }

      const data = await response.json()
      const validatedData = StorageDataSchema.parse(data)

      // 检查版本兼容性
      if (validatedData.version !== STORAGE_VERSION) {
        console.warn('数据版本不匹配，可能需要迁移')
        // TODO: 调用数据迁移服务
      }

      return validatedData.workspace
    } catch (error) {
      console.error('加载工作空间失败:', error)
      return null
    }
  }

  /**
   * 保存完整工作空间数据
   */
  async saveWorkspace(workspace: Workspace): Promise<void> {
    try {
      const storageData: StorageData = {
        version: STORAGE_VERSION,
        workspace,
        timestamp: new Date(),  // ✅ 使用 Date 对象
      }

      const serialized = this.serialize(storageData)
      const response = await fetch(`${this.basePath}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: STORAGE_KEYS.WORKSPACE, data: JSON.parse(serialized) }),
      })

      if (!response.ok) {
        throw new Error(`保存失败: ${response.status}`)
      }
    } catch (error) {
      console.error('保存工作空间失败:', error)
      throw error
    }
  }

  /**
   * 保存单个画布数据
   */
  async saveCanvas(workspace: Workspace, canvasId: string, canvas: Canvas): Promise<void> {
    try {
      // 更新画布
      const updatedCanvases = workspace.canvases.map((c) =>
        c.id === canvasId ? { ...canvas, updatedAt: new Date() } : c  // ✅ 使用 Date 对象
      )

      const updatedWorkspace: Workspace = {
        ...workspace,
        canvases: updatedCanvases,
      }

      await this.saveWorkspace(updatedWorkspace)
    } catch (error) {
      console.error('保存画布失败:', error)
      throw error
    }
  }

  /**
   * 加载单个画布数据
   */
  async loadCanvas(canvasId: string): Promise<Canvas | null> {
    try {
      const workspace = await this.loadWorkspace()
      if (!workspace) return null

      return workspace.canvases.find((c) => c.id === canvasId) || null
    } catch (error) {
      console.error('加载画布失败:', error)
      return null
    }
  }

  /**
   * 删除画布数据
   */
  async deleteCanvas(workspace: Workspace, canvasId: string): Promise<Workspace> {
    try {
      // 递归删除子画布
      const getCanvasIdsToDelete = (id: string): string[] => {
        const canvas = workspace.canvases.find((c) => c.id === id)
        if (!canvas) return [id]
        return [id, ...canvas.children.flatMap(getCanvasIdsToDelete)]
      }

      const idsToDelete = getCanvasIdsToDelete(canvasId)
      const updatedCanvases = workspace.canvases.filter((c) => !idsToDelete.includes(c.id))

      // 更新画布树
      const removeFromTree = (nodes: any[]): any[] => {
        return nodes
          .filter((node) => !idsToDelete.includes(node.id))
          .map((node) => ({
            ...node,
            children: removeFromTree(node.children),
          }))
      }

      const updatedTree = removeFromTree(workspace.canvasTree)

      const updatedWorkspace: Workspace = {
        ...workspace,
        canvases: updatedCanvases,
        canvasTree: updatedTree,
      }

      await this.saveWorkspace(updatedWorkspace)
      return updatedWorkspace
    } catch (error) {
      console.error('删除画布失败:', error)
      throw error
    }
  }

  /**
   * 清空所有数据
   */
  async clearAll(): Promise<void> {
    try {
      const response = await fetch(`${this.basePath}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: STORAGE_KEYS.WORKSPACE, data: null }),
      })

      if (!response.ok) {
        throw new Error(`清空数据失败: ${response.status}`)
      }
    } catch (error) {
      console.error('清空数据失败:', error)
      throw error
    }
  }
}

// 导出单例
export const storageManager = new StorageManager()