import { useGraphStore } from '@/stores/graph';
import { useWorkspaceStore } from '@/stores/workspace';
import { Canvas } from '@/types/workspace/models';

/**
 * 保存当前画布数据到 workspaceStore
 */
export const saveCurrentCanvasData = () => {
  const graphStore = useGraphStore.getState();
  const workspaceStore = useWorkspaceStore.getState();

  const { currentCanvasId, canvases, updateCanvasViewport } = workspaceStore;

  // 获取当前画布
  const currentCanvas = canvases.find((c) => c.id === currentCanvasId);
  if (!currentCanvas) {
    console.warn('当前画布不存在:', currentCanvasId);
    return;
  }

  // 从 graphStore 获取数据
  const nodes = graphStore.nodes || [];
  const edges = graphStore.edges || [];

  // 获取视口状态（如果 graphStore 有提供）
  const viewport = (graphStore as any).viewport || { x: 0, y: 0, zoom: 1 };

  // 更新 workspaceStore 中的画布数据
  const updatedCanvas: Canvas = {
    ...currentCanvas,
    graphData: {
      nodes: nodes as any,  // Type assertion for compatibility
      edges: edges as any,
    },
    viewportState: viewport,
    updatedAt: new Date(),
  };

  // 更新画布列表
  const updatedCanvases = canvases.map((c) =>
    c.id === currentCanvasId ? updatedCanvas : c
  );

  // 更新 workspaceStore
  workspaceStore.initializeWorkspace(
    updatedCanvases,
    workspaceStore.canvasTree,
    currentCanvasId
  );

  console.log('✅ 画布数据已保存:', currentCanvasId);
};

/**
 * 加载画布数据到 graphStore
 */
export const loadCanvasData = (canvasId: string) => {
  const workspaceStore = useWorkspaceStore.getState();

  // 查找目标画布
  const targetCanvas = workspaceStore.canvases.find((c) => c.id === canvasId);
  if (!targetCanvas) {
    console.error('画布不存在:', canvasId);
    return;
  }

  console.log('🔄 加载画布数据:', canvasId);

  // 直接替换 graphStore 的数据（使用 Zustand 的 setState）
  useGraphStore.setState({
    nodes: targetCanvas.graphData.nodes as any,
    edges: targetCanvas.graphData.edges as any,
    selectedNodeId: null,
    selectedEdgeId: null,
  });

  console.log('✅ 画布数据已加载:', {
    canvasId,
    nodes: targetCanvas.graphData.nodes.length,
    edges: targetCanvas.graphData.edges.length,
  });
};

/**
 * 切换画布
 */
export const switchToCanvas = (targetCanvasId: string) => {
  const workspaceStore = useWorkspaceStore.getState();
  const currentCanvasId = workspaceStore.currentCanvasId;

  // 如果是同一个画布，不需要切换
  if (currentCanvasId === targetCanvasId) {
    console.log('已在当前画布:', targetCanvasId);
    return;
  }

  console.log('🔄 切换画布:', { from: currentCanvasId, to: targetCanvasId });

  // 1. 保存当前画布数据
  saveCurrentCanvasData();

  // 2. 切换到目标画布
  workspaceStore.switchCanvas(targetCanvasId);

  // 3. 加载目标画布数据
  loadCanvasData(targetCanvasId);

  console.log('✅ 画布切换完成');
};
