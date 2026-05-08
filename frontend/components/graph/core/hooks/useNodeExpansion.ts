import { useCallback } from 'react';
import { useGraphStore } from '@/stores/graph';
import { NODE_SIZES } from '@/config/graph.config';
import {
  commitNodeResize,
  createNodeExpansionPatch,
  projectOntologyDocumentToLegacyGraphEdges,
  projectOntologyDocumentToLegacyGraphNodes,
  resolveNodeExpandedState,
  useOntologyDocumentStore,
  type ExpandableNodeLike,
  type OntologyDocumentState,
  type NodeExpansionConfig,
} from '@/features/ontology-canvas';
import { useWorkspaceStore } from '@/stores/workspace';

interface UseNodeExpansionParams {
  id: string;
  initialExpandedState?: boolean;
  nodeData?: ExpandableNodeLike;
}

const NOTE_NODE_EXPANSION_CONFIG: NodeExpansionConfig = {
  collapsedSize: {
    width: NODE_SIZES.NOTE.DEFAULT_WIDTH,
    height: NODE_SIZES.NOTE.DEFAULT_HEIGHT,
  },
  expandedSize: {
    width: NODE_SIZES.NOTE.EXPANDED_WIDTH,
    height: NODE_SIZES.NOTE.EXPANDED_HEIGHT,
  },
};

export const useNodeExpansion = ({ id, initialExpandedState, nodeData }: UseNodeExpansionParams) => {
  const storeNode = useGraphStore(useCallback(
    state => state.nodes.find(node => node.id === id),
    [id]
  ));
  const currentCanvasId = useWorkspaceStore(state => state.currentCanvasId);
  const applyInteractionPatch = useOntologyDocumentStore(state => state.applyInteractionPatch);
  const expansionSource = storeNode ?? nodeData;
  const isExpanded = resolveNodeExpandedState(
    expansionSource,
    initialExpandedState ?? false
  );

  const syncLegacyDisplayCache = useCallback((document: OntologyDocumentState) => {
    useGraphStore.setState({
      nodes: projectOntologyDocumentToLegacyGraphNodes(document),
      edges: projectOntologyDocumentToLegacyGraphEdges(document),
    });
  }, []);

  const toggleExpand = useCallback(() => {
    const newExpandedState = !isExpanded;
    const patch = createNodeExpansionPatch(
      expansionSource,
      newExpandedState,
      NOTE_NODE_EXPANSION_CONFIG
    );
    const currentDocument = useOntologyDocumentStore.getState().document;
    const nextDocument = applyInteractionPatch(
      commitNodeResize(currentDocument, {
        nodeId: id,
        width: patch.width,
        height: patch.height,
        expanded: newExpandedState,
      }),
      {
        canvasId: currentCanvasId,
        reason: 'node-expand-toggle',
      }
    );

    if (nextDocument) {
      syncLegacyDisplayCache(nextDocument);
    }
  }, [
    applyInteractionPatch,
    currentCanvasId,
    expansionSource,
    id,
    isExpanded,
    syncLegacyDisplayCache,
  ]);

  return {
    isExpanded,
    toggleExpand
  };
};
