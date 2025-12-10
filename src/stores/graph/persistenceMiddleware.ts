import { storageManager } from '@/services/storage/StorageManager'
import { useWorkspaceStore } from '@/stores/workspace'
import { throttle } from 'lodash'

// 由于不能直接导入 GraphStore（会导致循环依赖），我们定义一个局部接口
interface GraphStore {
  nodes: any[];
  edges: any[];
  position: [number, number];
  zoom: number;
  [key: string]: any; // 允许其他属性
}

// 定义中间件类型
export type PersistenceMiddleware = (
  set: (partial: GraphStore | Partial<GraphStore> | ((state: GraphStore) => GraphStore | Partial<GraphStore>), replace?: boolean | undefined) => void,
  get: () => GraphStore,
  store: any
) => GraphStore

// 创建持久化中间件
export const persistenceMiddleware: PersistenceMiddleware = (set, get, store) => {
  // 创建节流函数，避免频繁保存
  const throttledSave = throttle(async () => {
    try {
      const state = get()
      const workspaceState = useWorkspaceStore.getState()
      const { currentCanvasId } = workspaceState

      if (!currentCanvasId) return

      // 查找当前画布并更新其数据
      const currentCanvas = workspaceState.canvases.find(c => c.id === currentCanvasId)
      if (!currentCanvas) {
        console.warn(`未找到ID为 ${currentCanvasId} 的画布`)
        return
      }

      // 创建更新后的画布
      const updatedCanvas: typeof currentCanvas = {
        ...currentCanvas,
        graphData: {
          nodes: state.nodes,
          edges: state.edges
        },
        viewportState: {
          x: state.position[0] || 0,
          y: state.position[1] || 0,
          zoom: state.zoom || 1
        },
        updatedAt: new Date()
      }

      // 获取完整的workspace数据
      const fullWorkspace = {
        userId: workspaceState.user.id,
        currentCanvasId: workspaceState.currentCanvasId,
        canvases: workspaceState.canvases.map(c =>
          c.id === currentCanvasId ? updatedCanvas : c
        ),
        canvasTree: workspaceState.canvasTree
      }

      // 保存整个工作空间
      await storageManager.saveWorkspace(fullWorkspace)
    } catch (error) {
      console.error('自动保存失败:', error)
    }
  }, 2000) // 每2秒最多保存一次

  // 重写 set 函数以添加自动保存功能
  return Object.assign(store, {
    // 添加中间件标识
    __persistenceMiddleware: true,
    // 重写设置函数来触发保存
    _throttledSave: throttledSave,
  })
}

// 用于增强现有store的函数
export const withPersistence = (createStore: (set: any, get: any, api: any) => any) => {
  return (set: any, get: any, api: any) => {
    // 创建原始store
    const store = createStore(set, get, api)

    // 创建节流保存函数
    const throttledSave = throttle(async () => {
      try {
        const state = get()
        const workspaceState = useWorkspaceStore.getState()
        const { currentCanvasId } = workspaceState

        if (!currentCanvasId) return

        // 查找当前画布并更新其数据
        const currentCanvas = workspaceState.canvases.find(c => c.id === currentCanvasId)
        if (!currentCanvas) {
          console.warn(`未找到ID为 ${currentCanvasId} 的画布`)
          return
        }

        // 创建更新后的画布
        const updatedCanvas: typeof currentCanvas = {
          ...currentCanvas,
          graphData: {
            nodes: state.nodes,
            edges: state.edges
          },
          viewportState: {
            x: state.position ? state.position[0] : 0,
            y: state.position ? state.position[1] : 0,
            zoom: state.zoom || 1
          },
          updatedAt: new Date()
        }

        // 获取完整的workspace数据
        const fullWorkspace = {
          userId: workspaceState.user.id,
          currentCanvasId: workspaceState.currentCanvasId,
          canvases: workspaceState.canvases.map(c =>
            c.id === currentCanvasId ? updatedCanvas : c
          ),
          canvasTree: workspaceState.canvasTree
        }

        // 保存整个工作空间
        await storageManager.saveWorkspace(fullWorkspace)
      } catch (error) {
        console.error('自动保存失败:', error)
      }
    }, 2000) // 每2秒最多保存一次

    // 包装可能修改数据的函数
    const wrappedStore: any = {}

    // 包装所有可能修改图数据的函数
    for (const key in store) {
      const originalFn = store[key]

      // 检查是否是修改数据的函数
      if (typeof originalFn === 'function' && (
        key.startsWith('add') ||
        key.startsWith('update') ||
        key.startsWith('delete') ||
        key.startsWith('remove') ||
        key.includes('Node') ||
        key.includes('Edge') ||
        key.includes('Group')
      )) {
        wrappedStore[key] = (...args: any[]) => {
          const result = originalFn.apply(store, args)
          throttledSave()
          return result
        }
      } else {
        wrappedStore[key] = originalFn
      }
    }

    // 添加一些额外的功能
    wrappedStore._throttledSave = throttledSave

    return wrappedStore
  }
}