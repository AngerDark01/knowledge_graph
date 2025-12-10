import { useWorkspaceStore } from '@/stores/workspace';

/**
 * 持久化工作空间到文件
 */
export const persistWorkspace = async () => {
  try {
    const workspace = useWorkspaceStore.getState();

    const response = await fetch('/api/workspace/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: workspace.user?.id || 'user_0',
        currentCanvasId: workspace.currentCanvasId,
        canvases: workspace.canvases,
        canvasTree: workspace.canvasTree,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ 持久化失败:', error);
      return false;
    }

    console.log('💾 工作空间已持久化');
    return true;
  } catch (error) {
    console.error('❌ 持久化失败:', error);
    return false;
  }
};
