import React, { memo, useCallback, useMemo } from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';
import { useGraphStore } from '@/stores/graph';
import { useWorkspaceStore } from '@/stores/workspace';
import { useNodeExpansion } from '../core/hooks';
import type { OntologyFieldCategory } from '@/domain/ontology';
import { BlockEnum, type Node as GraphNode } from '@/types/graph/models';
import {
  appendDefaultOntologyField,
  deleteOntologyField,
  getDefaultOntologyFieldInputForCategory,
  moveOntologyField,
  updateOntologyField,
  type OntologyNodeViewSectionKind,
  type OntologyNodeViewModel,
  projectOntologyDocumentToLegacyGraphEdges,
  projectOntologyDocumentToLegacyGraphNodes,
  updateOntologyNodeInDocument,
  useOntologyDocumentStore,
} from '@/features/ontology-canvas';
import { ontologyNodeViewTokens } from '@/features/ontology-canvas/config';
import {
  ClassNodeView,
  type NodeFieldChangePatch,
  type NodeFieldMoveDirection,
  type NodeFieldViewItem,
} from '@/features/ontology-canvas/ui';

interface NoteNodeData {
  title: string;
  content?: string;
  validationError?: string;
  isExpanded?: boolean;
  lodMode?: 'full' | 'compact' | 'outline' | 'dot';
  ontologyType?: string;
  ontologyViewModel?: OntologyNodeViewModel;
}

const EMPTY_COLLAPSED_SECTION_IDS: readonly string[] = [];

const LEGACY_ONTOLOGY_ATTRIBUTE_KEYS = new Set([
  'ontologyType',
  'ontologyNodeId',
]);

const stringifyFieldValue = (value: unknown): string | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return JSON.stringify(value);
};

const getRecordValue = (value: unknown): Record<string, unknown> | null => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
};

const getFieldViewTone = (
  category: unknown
): Pick<NodeFieldViewItem, 'category' | 'iconLabel' | 'tone'> => {
  if (category === 'behavior') {
    return {
      category: 'behavior',
      iconLabel: 'M',
      tone: 'method',
    };
  }

  if (category === 'rule' || category === 'constraint') {
    return {
      category,
      iconLabel: 'R',
      tone: 'rule',
    };
  }

  if (category === 'interface') {
    return {
      category: 'interface',
      iconLabel: 'I',
      tone: 'interface',
    };
  }

  return {
    category: category === 'attribute' ? 'attribute' : undefined,
    iconLabel: 'P',
    tone: 'field',
  };
};

const createFieldRowsFromAttributes = (
  attributes: GraphNode['attributes']
): NodeFieldViewItem[] => {
  return Object.entries(attributes ?? {})
    .filter(([key]) => !LEGACY_ONTOLOGY_ATTRIBUTE_KEYS.has(key))
    .map(([key, rawValue], index) => {
      const recordValue = getRecordValue(rawValue);
      const fieldTone = getFieldViewTone(recordValue?.category);

      return {
        id: `${key}:${index}`,
        name: key,
        value: recordValue
          ? stringifyFieldValue(recordValue.value)
          : stringifyFieldValue(rawValue),
        dataType: recordValue && typeof recordValue.dataType === 'string'
          ? recordValue.dataType
          : undefined,
        ...fieldTone,
      };
    });
};

const NoteNode: React.FC<NodeProps<NoteNodeData>> = ({ id, data, selected }) => {
  const currentCanvasId = useWorkspaceStore(state => state.currentCanvasId);
  const applyOntologyCommandResult = useOntologyDocumentStore(state => state.applyCommandResult);
  const updateOntologyNodeView = useOntologyDocumentStore(state => state.updateNodeView);
  const collapsedSectionIds = useOntologyDocumentStore(useCallback(
    state => state.document.view.nodeViews[id]?.collapsedSections ?? EMPTY_COLLAPSED_SECTION_IDS,
    [id]
  ));
  const nodeData = useGraphStore(useCallback(
    state => state.nodes.find((node): node is GraphNode =>
      node.id === id && node.type === BlockEnum.NODE
    ),
    [id]
  ));

  const { isExpanded, toggleExpand } = useNodeExpansion({
    id,
    initialExpandedState: nodeData?.isExpanded ?? data.isExpanded ?? false,
    nodeData
  });

  const fieldRows = useMemo(
    () => createFieldRowsFromAttributes(nodeData?.attributes),
    [nodeData?.attributes]
  );
  const ontologyType = typeof nodeData?.attributes?.ontologyType === 'string'
    ? nodeData.attributes.ontologyType
    : data.ontologyType;
  const description = nodeData?.summary ?? nodeData?.content ?? data.content;
  const tags = useMemo(() => nodeData?.tags ?? [], [nodeData?.tags]);

  const syncLegacyDisplayCache = useCallback(() => {
    const document = useOntologyDocumentStore.getState().document;
    useGraphStore.setState({
      nodes: projectOntologyDocumentToLegacyGraphNodes(document),
      edges: projectOntologyDocumentToLegacyGraphEdges(document),
    });
  }, []);

  const handleAddField = useCallback((category?: OntologyFieldCategory) => {
    const document = useOntologyDocumentStore.getState().document;
    const ontologyNode = document.graph.nodes[id];

    if (!ontologyNode) {
      return;
    }

    const nextFields = appendDefaultOntologyField(ontologyNode, {
      ...getDefaultOntologyFieldInputForCategory(category),
      fieldId: `${id}:field:${Date.now()}`,
    });
    const result = updateOntologyNodeInDocument(document, {
      nodeId: id,
      fields: nextFields,
    });
    const applied = applyOntologyCommandResult(result, {
      canvasId: currentCanvasId,
      reason: 'node-add-field',
    });

    if (applied) {
      syncLegacyDisplayCache();
    }
  }, [applyOntologyCommandResult, currentCanvasId, id, syncLegacyDisplayCache]);

  const handleFieldChange = useCallback((
    fieldId: string,
    patch: NodeFieldChangePatch
  ) => {
    const document = useOntologyDocumentStore.getState().document;
    const ontologyNode = document.graph.nodes[id];

    if (!ontologyNode) {
      return;
    }

    const nextFields = updateOntologyField(ontologyNode.fields, fieldId, patch);
    if (nextFields === ontologyNode.fields) {
      return;
    }

    const result = updateOntologyNodeInDocument(document, {
      nodeId: id,
      fields: nextFields,
    });
    const applied = applyOntologyCommandResult(result, {
      canvasId: currentCanvasId,
      reason: 'node-inline-field-edit',
    });

    if (applied) {
      syncLegacyDisplayCache();
    }
  }, [applyOntologyCommandResult, currentCanvasId, id, syncLegacyDisplayCache]);

  const handleFieldDelete = useCallback((fieldId: string) => {
    const document = useOntologyDocumentStore.getState().document;
    const ontologyNode = document.graph.nodes[id];

    if (!ontologyNode) {
      return;
    }

    const nextFields = deleteOntologyField(ontologyNode.fields, fieldId);
    if (nextFields === ontologyNode.fields) {
      return;
    }

    const result = updateOntologyNodeInDocument(document, {
      nodeId: id,
      fields: nextFields,
    });
    const applied = applyOntologyCommandResult(result, {
      canvasId: currentCanvasId,
      reason: 'node-delete-field',
    });

    if (applied) {
      syncLegacyDisplayCache();
    }
  }, [applyOntologyCommandResult, currentCanvasId, id, syncLegacyDisplayCache]);

  const handleFieldMove = useCallback((
    fieldId: string,
    direction: NodeFieldMoveDirection,
    orderedFieldIds: readonly string[]
  ) => {
    const document = useOntologyDocumentStore.getState().document;
    const ontologyNode = document.graph.nodes[id];

    if (!ontologyNode) {
      return;
    }

    const nextFields = moveOntologyField(
      ontologyNode.fields,
      fieldId,
      direction,
      orderedFieldIds
    );
    if (nextFields === ontologyNode.fields) {
      return;
    }

    const result = updateOntologyNodeInDocument(document, {
      nodeId: id,
      fields: nextFields,
    });
    const applied = applyOntologyCommandResult(result, {
      canvasId: currentCanvasId,
      reason: 'node-move-field',
    });

    if (applied) {
      syncLegacyDisplayCache();
    }
  }, [applyOntologyCommandResult, currentCanvasId, id, syncLegacyDisplayCache]);

  const handleToggleSection = useCallback((sectionId: OntologyNodeViewSectionKind) => {
    const document = useOntologyDocumentStore.getState().document;
    const currentSectionIds = document.view.nodeViews[id]?.collapsedSections ?? [];
    const nextSectionIds = currentSectionIds.includes(sectionId)
      ? currentSectionIds.filter(currentId => currentId !== sectionId)
      : [...currentSectionIds, sectionId];

    updateOntologyNodeView({
      nodeId: id,
      collapsedSections: nextSectionIds,
    }, {
      canvasId: currentCanvasId,
      reason: 'node-section-toggle',
    });
    syncLegacyDisplayCache();
  }, [currentCanvasId, id, syncLegacyDisplayCache, updateOntologyNodeView]);

  const renderNodeContent = useCallback(() => {
    return (
      <ClassNodeView
        collapsedSectionIds={collapsedSectionIds}
        description={description}
        fields={fieldRows}
        isExpanded={isExpanded}
        lodMode={data.lodMode}
        onAddField={handleAddField}
        onFieldDelete={handleFieldDelete}
        onFieldChange={handleFieldChange}
        onFieldMove={handleFieldMove}
        onToggleSection={handleToggleSection}
        onToggleExpand={toggleExpand}
        selected={selected}
        tags={tags}
        title={nodeData?.title ?? data.title}
        type={ontologyType}
        validationError={data.validationError}
        viewModel={data.ontologyViewModel}
      />
    );
  }, [
    data.lodMode,
    data.title,
    data.ontologyViewModel,
    data.validationError,
    description,
    fieldRows,
    collapsedSectionIds,
    handleAddField,
    handleFieldDelete,
    handleFieldChange,
    handleFieldMove,
    handleToggleSection,
    isExpanded,
    nodeData?.title,
    ontologyType,
    selected,
    tags,
    toggleExpand,
  ]);

  return (
    <BaseNode 
      id={id} 
      data={data} 
      isGroup={false} 
      selected={selected}
      showResizeControl={!data.lodMode || data.lodMode === 'full'}
      minWidth={ontologyNodeViewTokens.minWidth}
      minHeight={ontologyNodeViewTokens.minHeight}
      isExpanded={isExpanded}
      renderContent={renderNodeContent}
      surface="transparent"
    />
  );
};

export default memo(NoteNode);
