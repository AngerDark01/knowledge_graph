import { useCallback } from 'react';
import type { Connection } from 'reactflow';
import {
  createOntologyRelationInDocument,
  isLegacyOntologyClassDisplay,
  projectOntologyEdgeToLegacyEdge,
  useOntologyDocumentStore,
} from '@/features/ontology-canvas';
import { useGraphStore } from '@/stores/graph';
import { useWorkspaceStore } from '@/stores/workspace';
import type { Edge } from '@/types/graph/models';
import { getActiveOntologyDocument } from '@/utils/workspace/canvasSync';

const ONTOLOGY_DOCUMENT_ID = 'current-canvas';
const ONTOLOGY_DOCUMENT_NAME = 'Current Canvas';
const DEFAULT_RELATION = 'relatedTo';

const createEdgeId = (): string =>
  `edge_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

export const useEdgeHandling = () => {
  const addEdge = useGraphStore(state => state.addEdge);
  const edges = useGraphStore(state => state.edges);
  const getNodes = useGraphStore(state => state.getNodes);
  const currentCanvasId = useWorkspaceStore(state => state.currentCanvasId);
  const applyOntologyCommandResult = useOntologyDocumentStore(state => state.applyCommandResult);

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) {
        console.error('Invalid connection: source or target is null');
        return;
      }

      if (params.source === params.target) {
        console.warn('Self-connection is not allowed');
        return;
      }

      const duplicate = edges.some((edge: Edge) =>
        edge.source === params.source &&
        edge.target === params.target
      );

      if (duplicate) {
        console.warn('Duplicate connection is not allowed');
        return;
      }

      const allNodes = getNodes();
      const sourceNode = allNodes.find(node => node.id === params.source);
      const targetNode = allNodes.find(node => node.id === params.target);

      if (!sourceNode || !targetNode) {
        console.error('Cannot create relation: source or target node is missing');
        return;
      }

      if (!isLegacyOntologyClassDisplay(sourceNode) || !isLegacyOntologyClassDisplay(targetNode)) {
        console.warn('Relations can only connect ontology class nodes in the current runtime.');
        return;
      }

      if (sourceNode.groupId === params.target || targetNode.groupId === params.source) {
        console.warn('Cannot connect child to its direct parent domain');
        return;
      }

      const sourceDomainId = sourceNode.groupId;
      const targetDomainId = targetNode.groupId;
      const isCrossDomain = Boolean(
        sourceDomainId &&
        targetDomainId &&
        sourceDomainId !== targetDomainId
      ) || Boolean(sourceDomainId || targetDomainId) && sourceDomainId !== targetDomainId;
      const edgeId = createEdgeId();
      const document = getActiveOntologyDocument({
        canvasId: currentCanvasId || ONTOLOGY_DOCUMENT_ID,
        fallbackName: ONTOLOGY_DOCUMENT_NAME,
      });
      const result = createOntologyRelationInDocument(document, {
        id: edgeId,
        source: params.source,
        target: params.target,
        relation: DEFAULT_RELATION,
        sourceHandle: params.sourceHandle ?? undefined,
        targetHandle: params.targetHandle ?? undefined,
        metadata: {
          source: 'ontology-canvas-connect',
        },
      });

      if (!result.changed) {
        console.warn('创建本体关系失败:', result.warnings);
        return;
      }

      applyOntologyCommandResult(result, {
        canvasId: currentCanvasId,
        reason: 'connect-create-relation',
      });

      const displayEdge = projectOntologyEdgeToLegacyEdge(result.document, edgeId, {
        data: {
          isCrossGroup: isCrossDomain,
          sourceGroupId: sourceDomainId,
          targetGroupId: targetDomainId,
          strokeDasharray: isCrossDomain ? '5,5' : undefined,
          color: isCrossDomain ? '#FFA500' : undefined,
          strokeWidth: isCrossDomain ? 2 : 1,
          direction: 'unidirectional',
        },
      });

      if (!displayEdge) {
        console.error('本体关系投影到当前画布运行态失败:', edgeId);
        return;
      }

      addEdge(displayEdge);
    },
    [addEdge, applyOntologyCommandResult, currentCanvasId, edges, getNodes]
  );

  return {
    onConnect,
  };
};
