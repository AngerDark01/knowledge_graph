import { StateCreator } from 'zustand'
import { Workspace } from '@/types/workspace/models'
import { storageManager } from '@/services/storage/StorageManager'

export interface PersistenceSlice {
  // 状态
  isSaving: boolean
  isLoaded: boolean
  lastSaved: Date | null

  // 操作
  loadWorkspace: () => Promise<Workspace | null>
  saveWorkspace: (workspace: Workspace) => Promise<void>
  saveCurrentCanvas: (canvasId: string, canvasData: any) => Promise<void>
  setIsSaving: (saving: boolean) => void
  setLastSaved: (date: Date) => void
}

export const createPersistenceSlice: StateCreator<PersistenceSlice> = (set, get) => ({
  isSaving: false,
  isLoaded: false,
  lastSaved: null,

  loadWorkspace: async () => {
    try {
      set({ isSaving: true })
      const workspace = await storageManager.loadWorkspace()
      if (workspace) {
        set({ isLoaded: true, isSaving: false })
        return workspace
      }
      return null
    } catch (error) {
      console.error('加载工作区失败:', error)
      set({ isSaving: false })
      return null
    }
  },

  saveWorkspace: async (workspace: Workspace) => {
    try {
      set({ isSaving: true })
      await storageManager.saveWorkspace(workspace)
      set({ isSaving: false, lastSaved: new Date() })
    } catch (error) {
      console.error('保存工作区失败:', error)
      set({ isSaving: false })
      throw error
    }
  },

  saveCurrentCanvas: async (canvasId, canvasData) => {
    try {
      set({ isSaving: true })
      // 实现保存当前画布的逻辑
      // 这里需要从全局状态获取完整的workspace数据
      set({ isSaving: false, lastSaved: new Date() })
    } catch (error) {
      console.error('保存画布失败:', error)
      set({ isSaving: false })
      throw error
    }
  },

  setIsSaving: (saving) => set({ isSaving: saving }),
  setLastSaved: (date) => set({ lastSaved: date }),
})