import { useGraphStore } from '@/stores/graph';
import { useWorkspaceStore } from '@/stores/workspace';
import { Canvas } from '@/types/workspace/models';
import { loadOntologyCanvas, saveOntologyCanvas } from '@/data-layer/workspace';
import {
  createPersistedOntologyCanvas,
  createOntologyDocumentFromLegacyGraph,
  projectOntologyDocumentToLegacyGraphEdges,
  projectOntologyDocumentToLegacyGraphNodes,
  restoreOntologyDocumentFromPersistedCanvas,
  useOntologyDocumentStore,
  type OntologyDocumentState,
} from '@/features/ontology-canvas';
import { persistWorkspace } from './persistence';

const createEmptyLegacyGraphData = (): Canvas['graphData'] => ({
  nodes: [],
  edges: [],
});

const projectDocumentToLegacyGraphData = (
  document: OntologyDocumentState
): Canvas['graphData'] => ({
  nodes: projectOntologyDocumentToLegacyGraphNodes(document),
  edges: projectOntologyDocumentToLegacyGraphEdges(document),
});

const createDocumentFromCanvas = (canvas: Canvas): OntologyDocumentState => {
  const persistedCanvas = loadOntologyCanvas(canvas);

  if (persistedCanvas) {
    return restoreOntologyDocumentFromPersistedCanvas(persistedCanvas, {
      id: canvas.id,
      name: canvas.name,
      viewport: canvas.viewportState,
    });
  }

  const graphData = canvas.graphData ?? createEmptyLegacyGraphData();

  return createOntologyDocumentFromLegacyGraph({
    id: canvas.id,
    name: canvas.name,
    nodes: graphData.nodes,
    edges: graphData.edges,
    view: {
      viewport: canvas.viewportState,
    },
  });
};

export const getActiveOntologyDocument = (
  input: {
    canvasId: string;
    fallbackName?: string;
  }
): OntologyDocumentState => {
  const ontologyState = useOntologyDocumentStore.getState();

  if (ontologyState.hydrated && ontologyState.sourceCanvasId === input.canvasId) {
    return ontologyState.document;
  }

  const workspaceStore = useWorkspaceStore.getState();
  const workspaceCanvas = workspaceStore.canvases.find(canvas => canvas.id === input.canvasId);
  if (workspaceCanvas) {
    return createDocumentFromCanvas(workspaceCanvas);
  }

  const graphStore = useGraphStore.getState();
  return createOntologyDocumentFromLegacyGraph({
    id: input.canvasId || 'current-canvas',
    name: input.fallbackName ?? 'Current Canvas',
    nodes: graphStore.nodes,
    edges: graphStore.edges,
    view: {
      viewport: graphStore.viewport,
    },
  });
};

/**
 * 保存当前画布数据到 workspaceStore
 */
export const saveCurrentCanvasData = () => {
  const workspaceStore = useWorkspaceStore.getState();

  const { currentCanvasId, canvases } = workspaceStore;

  // 获取当前画布
  const currentCanvas = canvases.find((c) => c.id === currentCanvasId);
  if (!currentCanvas) {
    console.warn('当前画布不存在:', currentCanvasId);
    return;
  }

  const ontologyState = useOntologyDocumentStore.getState();
  const shouldPersistOntologyDocument =
    ontologyState.hydrated &&
    ontologyState.sourceCanvasId === currentCanvasId;

  const document = shouldPersistOntologyDocument
    ? ontologyState.document
    : createDocumentFromCanvas(currentCanvas);
  const graphData = projectDocumentToLegacyGraphData(document);

  // 更新 workspaceStore 中的画布数据
  const updatedCanvas: Canvas = {
    ...saveOntologyCanvas(
      currentCanvas,
      createPersistedOntologyCanvas(document)
    ),
    graphData,
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

  const ontologyDocument = createDocumentFromCanvas(targetCanvas);
  const graphData = projectDocumentToLegacyGraphData(ontologyDocument);

  useOntologyDocumentStore.getState().replaceDocument(ontologyDocument, {
    canvasId,
    reason: 'workspace-load',
  });

  // 直接替换 graphStore 的数据（使用 Zustand 的 setState）
  useGraphStore.setState({
    nodes: graphData.nodes,
    edges: graphData.edges,
    selectedNodeId: null,
    selectedEdgeId: null,
  });

};

/**
 * 切换画布
 */
export const switchToCanvas = async (targetCanvasId: string) => {
  const workspaceStore = useWorkspaceStore.getState();
  const currentCanvasId = workspaceStore.currentCanvasId;

  // 如果是同一个画布，不需要切换
  if (currentCanvasId === targetCanvasId) {
    return;
  }

  // 1. 保存当前画布数据
  saveCurrentCanvasData();

  // 2. 切换到目标画布
  workspaceStore.switchCanvas(targetCanvasId);

  // 3. 加载目标画布数据
  loadCanvasData(targetCanvasId);

  // 4. 持久化到文件
  try {
    await persistWorkspace();
  } catch (error) {
    console.error('❌ 保存画布切换失败:', error);
  }
};
