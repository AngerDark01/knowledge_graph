import { z } from 'zod'
import { Workspace, WorkspaceSchema } from './models'

// ========== 存储数据版本 ==========
export const STORAGE_VERSION = '1.0.0'

// ========== 存储键常量 ==========
export const STORAGE_KEYS = {
  WORKSPACE: 'kg-editor:workspace.json',
  VERSION: 'kg-editor:version.json',
} as const

// ========== 存储数据格式 ==========
export interface StorageData {
  version: string
  workspace: Workspace
  timestamp: Date  // ✅ 修正：使用 Date
}

export const StorageDataSchema = z.object({
  version: z.string(),
  workspace: WorkspaceSchema,
  timestamp: z.date(),  // ✅ 修正：使用 z.date()
})

// ========== 存储适配器接口 ==========
export interface StorageAdapter {
  save(key: string, data: unknown): Promise<void>
  load<T>(key: string): Promise<T | null>
  remove(key: string): Promise<void>
  clear(): Promise<void>
}

// ========== 文件系统适配器接口 ==========
export interface FileSystemAdapter {
  saveToFile(path: string, data: unknown): Promise<void>
  loadFromFile<T>(path: string): Promise<T | null>
  fileExists(path: string): Promise<boolean>
  deleteFile(path: string): Promise<void>
}