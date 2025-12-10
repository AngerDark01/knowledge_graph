import { z } from 'zod';
import { Workspace, WorkspaceSchema } from './models';

// ========== 存储数据版本 ==========
export const STORAGE_VERSION = '1.0.0';

// ========== 存储键常量 ==========
export const STORAGE_KEYS = {
  WORKSPACE: 'kg-editor:workspace.json',
  VERSION: 'kg-editor:version.json',
} as const;

// ========== 存储数据格式 ==========
export interface StorageData {
  version: string;
  workspace: Workspace;
  timestamp: Date;
}

export const StorageDataSchema = z.object({
  version: z.string(),
  workspace: WorkspaceSchema,
  timestamp: z.union([z.coerce.date(), z.string()]) // 支持日期和字符串格式
    .transform((value) => {
      if (value instanceof Date) {
        return value;
      }
      // 如果是字符串，则尝试解析
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date string');
      }
      return date;
    }),
});

// ========== 存储适配器接口 ==========
export interface StorageAdapter {
  save(key: string, data: unknown): Promise<void>;
  load<T>(key: string): Promise<T | null>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

// ========== 文件系统适配器接口 ==========
export interface FileSystemAdapter extends StorageAdapter {
  saveToFile(path: string, data: unknown): Promise<void>;
  loadFromFile<T>(path: string): Promise<T | null>;
  fileExists(path: string): Promise<boolean>;
  deleteFile(path: string): Promise<void>;
}
