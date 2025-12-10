import { create } from 'zustand'
import { UserSlice, createUserSlice } from './userSlice'
import { CanvasSlice, createCanvasSlice } from './canvasSlice'
import { PersistenceSlice, createPersistenceSlice } from './persistenceSlice'

export type WorkspaceStore = UserSlice & CanvasSlice & PersistenceSlice

export const createWorkspaceStore = () => 
  create<WorkspaceStore>()((set, get, api) => ({
    ...createUserSlice(set, get, api),
    ...createCanvasSlice(set, get, api),
    ...createPersistenceSlice(set, get, api),
  }))

// 导出单例 store
export const useWorkspaceStore = createWorkspaceStore()