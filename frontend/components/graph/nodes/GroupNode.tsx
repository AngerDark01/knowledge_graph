import React, { memo, useCallback } from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';
import { useGraphStore } from '@/stores/graph';
import { useWorkspaceStore } from '@/stores/workspace';
import { BlockEnum, type Group } from '@/types/graph/models';
import {
  projectOntologyDocumentToLegacyGraphEdges,
  projectOntologyDocumentToLegacyGraphNodes,
  type OntologyDomainViewModel,
  useOntologyDocumentStore,
} from '@/features/ontology-canvas';
import { ontologyDomainViewTokens } from '@/features/ontology-canvas/config';
import { DomainNodeView } from '@/features/ontology-canvas/ui';

type GroupNodeData = {
  title: string;
  content?: string;
  validationError?: string;
  lodMode?: 'full' | 'compact' | 'outline' | 'dot';
  ontologyDomainViewModel?: OntologyDomainViewModel;
};

const GroupNode: React.FC<NodeProps<GroupNodeData>> = ({ id, data, selected }) => {
  const currentCanvasId = useWorkspaceStore(state => state.currentCanvasId);
  const updateOntologyDomainView = useOntologyDocumentStore(state => state.updateDomainView);
  const groupNode = useGraphStore(useCallback(
    state => state.nodes.find((node): node is Group =>
      node.id === id && node.type === BlockEnum.GROUP
    ),
    [id]
  ));
  const syncLegacyDisplayCache = useCallback(() => {
    const document = useOntologyDocumentStore.getState().document;
    useGraphStore.setState({
      nodes: projectOntologyDocumentToLegacyGraphNodes(document),
      edges: projectOntologyDocumentToLegacyGraphEdges(document),
    });
  }, []);
  const handleToggleCollapsed = useCallback(() => {
    const document = useOntologyDocumentStore.getState().document;
    const currentCollapsed = document.view.domainViews[id]?.collapsed ?? groupNode?.collapsed ?? false;

    updateOntologyDomainView({
      domainId: id,
      collapsed: !currentCollapsed,
    }, {
      canvasId: currentCanvasId,
      reason: 'domain-collapse-toggle',
    });
    syncLegacyDisplayCache();
  }, [currentCanvasId, groupNode?.collapsed, id, syncLegacyDisplayCache, updateOntologyDomainView]);

  return (
    <BaseNode
      data={data}
      groupNode={groupNode}
      id={id}
      isGroup={true}
      minHeight={ontologyDomainViewTokens.minHeight}
      minWidth={ontologyDomainViewTokens.minWidth}
      selected={selected}
      showResizeControl={!data.lodMode || data.lodMode === 'full'}
      surface="transparent"
    >
      <DomainNodeView
        collapsed={groupNode?.collapsed ?? false}
        lodMode={data.lodMode}
        onToggleCollapsed={handleToggleCollapsed}
        selected={selected}
        title={groupNode?.title ?? data.title}
        validationError={data.validationError}
        viewModel={data.ontologyDomainViewModel}
      />
    </BaseNode>
  );
};

export default memo(GroupNode);
