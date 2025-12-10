import {
  StorageAdapter,
  StorageData,
  StorageDataSchema,
  STORAGE_KEYS,
  STORAGE_VERSION,
} from '@/types/workspace/storage';
import { Workspace, Canvas } from '@/types/workspace/models';
import { FileSystemAdapter } from './adapters/FileSystemAdapter';

export class StorageManager {
  private adapter: StorageAdapter;

  constructor(adapter?: StorageAdapter) {
    this.adapter = adapter || new FileSystemAdapter();
  }

  /**
   * 加载完整工作空间数据
   */
  async loadWorkspace(): Promise<Workspace | null> {
    try {
      const data = await this.adapter.load<StorageData>(STORAGE_KEYS.WORKSPACE);
      if (!data) return null;

      // 验证数据格式
      const validatedData = StorageDataSchema.parse(data);

      // 检查版本兼容性
      if (validatedData.version !== STORAGE_VERSION) {
        console.warn('数据版本不匹配，可能需要迁移');
        // TODO: 调用数据迁移服务
      }

      return validatedData.workspace as Workspace;
    } catch (error) {
      console.error('加载工作空间失败:', error);
      return null;
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
        timestamp: new Date(),
      };

      await this.adapter.save(STORAGE_KEYS.WORKSPACE, storageData);
    } catch (error) {
      console.error('保存工作空间失败:', error);
      throw error;
    }
  }

  /**
   * 保存单个画布数据
   */
  async saveCanvas(workspace: Workspace, canvasId: string, canvas: Canvas): Promise<void> {
    try {
      // 更新画布
      const updatedCanvases = workspace.canvases.map((c) =>
        c.id === canvasId ? { ...canvas, updatedAt: new Date() } : c
      );

      const updatedWorkspace: Workspace = {
        ...workspace,
        canvases: updatedCanvases,
      };

      await this.saveWorkspace(updatedWorkspace);
    } catch (error) {
      console.error('保存画布失败:', error);
      throw error;
    }
  }

  /**
   * 加载单个画布数据
   */
  async loadCanvas(canvasId: string): Promise<Canvas | null> {
    try {
      const workspace = await this.loadWorkspace();
      if (!workspace) return null;

      return workspace.canvases.find((c) => c.id === canvasId) || null;
    } catch (error) {
      console.error('加载画布失败:', error);
      return null;
    }
  }

  /**
   * 删除画布数据
   */
  async deleteCanvas(workspace: Workspace, canvasId: string): Promise<Workspace> {
    try {
      // 递归删除子画布
      const getCanvasIdsToDelete = (id: string): string[] => {
        const canvas = workspace.canvases.find((c) => c.id === id);
        if (!canvas) return [id];
        return [id, ...canvas.children.flatMap(getCanvasIdsToDelete)];
      };

      const idsToDelete = getCanvasIdsToDelete(canvasId);
      const updatedCanvases = workspace.canvases.filter((c) => !idsToDelete.includes(c.id));

      // 更新画布树
      const removeFromTree = (nodes: any[]): any[] => {
        return nodes
          .filter((node) => !idsToDelete.includes(node.id))
          .map((node) => ({
            ...node,
            children: removeFromTree(node.children),
          }));
      };

      const updatedTree = removeFromTree(workspace.canvasTree);

      const updatedWorkspace: Workspace = {
        ...workspace,
        canvases: updatedCanvases,
        canvasTree: updatedTree,
      };

      await this.saveWorkspace(updatedWorkspace);
      return updatedWorkspace;
    } catch (error) {
      console.error('删除画布失败:', error);
      throw error;
    }
  }

  /**
   * 清空所有数据
   */
  async clearAll(): Promise<void> {
    await this.adapter.remove(STORAGE_KEYS.WORKSPACE);
  }
}

// 导出单例
export const storageManager = new StorageManager();
