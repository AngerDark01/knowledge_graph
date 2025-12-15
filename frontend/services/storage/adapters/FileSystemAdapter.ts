import { StorageAdapter, FileSystemAdapter as IFileSystemAdapter } from '@/types/workspace/storage';

export class FileSystemAdapter implements StorageAdapter, IFileSystemAdapter {
  private basePath: string;

  constructor(basePath: string = '/api/workspace') {
    this.basePath = basePath;
  }

  /**
   * 序列化数据（Date → ISO string）
   */
  private serialize(data: unknown): string {
    return JSON.stringify(data, (key, value) => {
      // 将 Date 对象转换为 ISO 字符串
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    });
  }

  /**
   * 反序列化数据（ISO string → Date）
   */
  private deserialize<T>(serialized: string): T {
    return JSON.parse(serialized, (key, value) => {
      // 将 ISO 字符串转换回 Date 对象
      if (
        typeof value === 'string' &&
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)
      ) {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return date;
          }
        } catch {
          // 如果解析失败，保持原始值
        }
      }
      return value;
    });
  }

  async save(key: string, data: unknown): Promise<void> {
    try {
      const serialized = this.serialize(data);
      const response = await fetch(`${this.basePath}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, data: JSON.parse(serialized) }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`保存失败: ${response.status} - ${errorData.error || ''}`);
      }
    } catch (error) {
      console.error(`保存数据失败 [${key}]:`, error);
      throw error;
    }
  }

  async load<T>(key: string): Promise<T | null> {
    try {
      const response = await fetch(`${this.basePath}/load?key=${encodeURIComponent(key)}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null; // 文件不存在，返回 null
        }
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`加载失败: ${response.status} - ${errorData.error || ''}`);
      }

      const data = await response.json();
      return this.deserialize<T>(JSON.stringify(data));
    } catch (error) {
      console.error(`加载数据失败 [${key}]:`, error);
      return null;
    }
  }

  async remove(key: string): Promise<void> {
    // 文件系统适配器暂不实现删除方法，因为需要额外的API路由
    console.warn('FileSystemAdapter.remove() 暂未实现');
  }

  async clear(): Promise<void> {
    // 文件系统适配器暂不实现清除方法，因为需要额外的API路由
    console.warn('FileSystemAdapter.clear() 暂未实现');
  }

  async saveToFile(path: string, data: unknown): Promise<void> {
    // 使用 save 方法实现
    await this.save(path, data);
  }

  async loadFromFile<T>(path: string): Promise<T | null> {
    // 使用 load 方法实现
    return await this.load<T>(path);
  }

  async fileExists(path: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.basePath}/load?key=${encodeURIComponent(path)}`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async deleteFile(path: string): Promise<void> {
    console.warn('FileSystemAdapter.deleteFile() 暂未实现');
  }
}
