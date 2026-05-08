export type DeletableNodeRef = {
  id: string;
  selected?: boolean;
};

export type DeletableEdgeRef = {
  id: string;
  source?: string | null;
  target?: string | null;
  selected?: boolean;
};

export type CanvasDeletionPlan = {
  nodeIds: string[];
  edgeIds: string[];
};

export const createCanvasSelectionDeletionPlan = (
  nodes: readonly DeletableNodeRef[],
  edges: readonly DeletableEdgeRef[]
): CanvasDeletionPlan => {
  const nodeIds = nodes
    .filter(node => node.selected)
    .map(node => node.id);
  const nodeIdSet = new Set(nodeIds);

  const edgeIds = edges
    .filter(edge => edge.selected)
    .filter(edge => !nodeIdSet.has(edge.source ?? '') && !nodeIdSet.has(edge.target ?? ''))
    .map(edge => edge.id);

  return {
    nodeIds,
    edgeIds,
  };
};

export const createCanvasClearPlan = (
  nodes: readonly DeletableNodeRef[],
  edges: readonly DeletableEdgeRef[]
): CanvasDeletionPlan => {
  const nodeIds = nodes.map(node => node.id);
  const nodeIdSet = new Set(nodeIds);
  const edgeIds = edges
    .filter(edge => !nodeIdSet.has(edge.source ?? '') && !nodeIdSet.has(edge.target ?? ''))
    .map(edge => edge.id);

  return {
    nodeIds,
    edgeIds,
  };
};
