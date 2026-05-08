import {
  type EdgeVisibility,
  removeEdgeIdsFromVisibility,
} from './edgeVisibility';

export type EdgeConnection = {
  id: string;
  source: string;
  target: string;
};

export type IncidentEdgeRemovalResult<TEdge extends EdgeConnection> = {
  edges: TEdge[];
  removedEdgeIds: string[];
};

export type IncidentEdgeRemovalWithVisibilityResult<TEdge extends EdgeConnection> =
  IncidentEdgeRemovalResult<TEdge> & {
    edgeVisibility: EdgeVisibility;
  };

export const removeEdgesConnectedToNodes = <TEdge extends EdgeConnection>(
  edges: readonly TEdge[],
  nodeIds: Iterable<string>
): IncidentEdgeRemovalResult<TEdge> => {
  const removedNodeIds = new Set(nodeIds);
  const remainingEdges: TEdge[] = [];
  const removedEdgeIds: string[] = [];

  edges.forEach(edge => {
    if (removedNodeIds.has(edge.source) || removedNodeIds.has(edge.target)) {
      removedEdgeIds.push(edge.id);
      return;
    }

    remainingEdges.push(edge);
  });

  return {
    edges: remainingEdges,
    removedEdgeIds,
  };
};

export const removeEdgesConnectedToNodesWithVisibility = <
  TEdge extends EdgeConnection,
>(
  edges: readonly TEdge[],
  nodeIds: Iterable<string>,
  visibility?: EdgeVisibility
): IncidentEdgeRemovalWithVisibilityResult<TEdge> => {
  const removal = removeEdgesConnectedToNodes(edges, nodeIds);
  const edgeVisibility = removeEdgeIdsFromVisibility(
    visibility,
    removal.removedEdgeIds
  );

  return {
    ...removal,
    edgeVisibility,
  };
};
