import { useWorkspaceStore } from '@/stores/workspace';
import { saveWorkspace } from '@/data-layer/workspace';

/**
 * 持久化工作空间到文件
 */
export const persistWorkspace = async () => {
  try {
    const workspace = useWorkspaceStore.getState();

    return await saveWorkspace({
      userId: workspace.user?.id || 'user_0',
      currentCanvasId: workspace.currentCanvasId,
      canvases: workspace.canvases,
      canvasTree: workspace.canvasTree,
    });
  } catch (error) {
    console.error('❌ 持久化失败:', error);
    return false;
  }
};
