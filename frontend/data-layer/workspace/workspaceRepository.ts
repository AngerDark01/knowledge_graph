import type { Canvas, Workspace } from '@/types/workspace/models';
import {
  STORAGE_VERSION,
  StorageDataSchema,
  type StorageData,
} from '@/types/workspace/storage';
import type { PersistedOntologyCanvas } from '@/types/workspace/ontologyCanvas';

const DEFAULT_WORKSPACE_KEY = 'kg-editor:workspace.json';

export type WorkspaceRepositorySaveOptions = {
  key?: string;
};

export type WorkspaceRepositoryLoadOptions = {
  key?: string;
};

export const createWorkspaceStorageData = (
  workspace: Workspace,
  timestamp: Date = new Date()
): StorageData => ({
  version: STORAGE_VERSION,
  workspace,
  timestamp,
});

export const loadWorkspaceStorage = async (
  options: WorkspaceRepositoryLoadOptions = {}
): Promise<StorageData | null> => {
  const key = options.key ?? DEFAULT_WORKSPACE_KEY;
  const response = await fetch(`/api/workspace/load?key=${encodeURIComponent(key)}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      typeof error.details === 'string'
        ? error.details
        : `Workspace load failed with status ${response.status}`
    );
  }

  return StorageDataSchema.parse(await response.json()) as StorageData;
};

export const saveWorkspaceStorage = async (
  data: StorageData,
  options: WorkspaceRepositorySaveOptions = {}
): Promise<boolean> => {
  const response = await fetch('/api/workspace/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      key: options.key ?? DEFAULT_WORKSPACE_KEY,
      data,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      typeof error.details === 'string'
        ? error.details
        : `Workspace save failed with status ${response.status}`
    );
  }

  return true;
};

export const loadWorkspace = async (
  options: WorkspaceRepositoryLoadOptions = {}
): Promise<Workspace | null> => {
  const storage = await loadWorkspaceStorage(options);
  return storage?.workspace ?? null;
};

export const saveWorkspace = async (
  workspace: Workspace,
  options: WorkspaceRepositorySaveOptions = {}
): Promise<boolean> => saveWorkspaceStorage(createWorkspaceStorageData(workspace), options);

export const loadOntologyCanvas = (
  canvas: Canvas
): PersistedOntologyCanvas | null => canvas.ontologyDocument ?? null;

export const saveOntologyCanvas = (
  canvas: Canvas,
  ontologyDocument: PersistedOntologyCanvas
): Canvas => ({
  ...canvas,
  ontologyDocument,
  viewportState: ontologyDocument.view.viewport,
  updatedAt: new Date(),
});

export const migrateOntologyCanvas = (canvas: Canvas): Canvas => ({
  ...canvas,
  graphData: canvas.graphData ?? {
    nodes: [],
    edges: [],
  },
  viewportState: canvas.ontologyDocument?.view.viewport ?? canvas.viewportState,
});
