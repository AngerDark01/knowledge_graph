'use client';

import {
  AlertCircle,
  FolderOpen,
  RotateCcw,
  Save,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useGraphStore } from '@/stores/graph';
import { useWorkspaceStore } from '@/stores/workspace';
import { BlockEnum, type Group } from '@/types/graph/models';
import {
  projectOntologyDocumentToLegacyGraphEdges,
  projectOntologyDocumentToLegacyGraphNodes,
} from '../adapters/react-flow';
import {
  buildOntologyDomainViewModel,
  buildOntologyNodeViewModel,
  type OntologyDomainViewModel,
  type OntologyNodeViewModel,
} from '../model/view';
import {
  buildOntologyFieldsFromAttributes,
  buildOntologyNodeType,
  createAttributeItems,
  createNodeEditorDraft,
  createNodeInspectorSavePlan,
  parseTagsText,
  type EditableGraphNode,
  type NodeEditorDraft,
} from '../model/inspector';
import {
  updateOntologyDomainInDocument,
  updateOntologyNodeInDocument,
  type OntologyDocumentState,
} from '../model/document';
import {
  createNodeDomainPlacementPatch,
  hasOntologyInteractionPatchChanges,
  type OntologyInteractionPatch,
} from '../model/interactions';
import { useOntologyDocumentStore } from '../state';
import { ClassNodeView, DomainNodeView, NodeAttributeEditor } from '../ui';
import { ontologyNodeViewTokens } from '../config';

export type NodeInspectorBlockProps = {
  nodeId?: string | null;
};

const sectionStyle = {
  display: 'grid',
  gap: 'var(--oc-node-space-xs)',
} as const;

const labelStyle = {
  color: 'var(--oc-node-color-text-muted)',
  fontSize: 'var(--oc-node-meta-size)',
  fontWeight: 'var(--oc-node-weight-strong)',
  letterSpacing: 0,
  textTransform: 'uppercase',
} as const;

const inputStyle = 'h-8';
const NO_CONTAINER_VALUE = '__none__';

export const NodeInspectorBlock = ({
  nodeId,
}: NodeInspectorBlockProps) => {
  const nodes = useGraphStore(state => state.nodes);
  const selectedNode = useGraphStore(useCallback(
    state => state.nodes.find((node): node is EditableGraphNode => node.id === nodeId),
    [nodeId]
  ));
  const currentCanvasId = useWorkspaceStore(state => state.currentCanvasId);
  const applyOntologyCommandResult = useOntologyDocumentStore(state => state.applyCommandResult);
  const applyInteractionPatch = useOntologyDocumentStore(state => state.applyInteractionPatch);
  const document = useOntologyDocumentStore(state => state.document);

  const [draft, setDraft] = useState<NodeEditorDraft>(() => createNodeEditorDraft(selectedNode));
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editorRevision, setEditorRevision] = useState(0);

  const containerOptions = useMemo(() => {
    return nodes
      .filter((candidate): candidate is Group => (
        candidate.type === BlockEnum.GROUP && candidate.id !== selectedNode?.id
      ))
      .map(candidate => ({
        id: candidate.id,
        title: candidate.title || candidate.id,
      }));
  }, [nodes, selectedNode?.id]);

  const nodeViewModel = useMemo<OntologyNodeViewModel | undefined>(() => {
    if (!selectedNode || selectedNode.type === BlockEnum.GROUP) {
      return undefined;
    }

    return buildOntologyNodeViewModel(document, selectedNode.id);
  }, [document, selectedNode]);

  const domainViewModel = useMemo<OntologyDomainViewModel | undefined>(() => {
    if (!selectedNode || selectedNode.type !== BlockEnum.GROUP) {
      return undefined;
    }

    return buildOntologyDomainViewModel(document, selectedNode.id);
  }, [document, selectedNode]);

  const nodePreviewViewModel = useMemo<OntologyNodeViewModel | undefined>(() => {
    if (!selectedNode || selectedNode.type === BlockEnum.GROUP) {
      return undefined;
    }

    const ontologyNode = document.graph.nodes[selectedNode.id];
    if (!ontologyNode) {
      return nodeViewModel;
    }

    const draftDocument: OntologyDocumentState = {
      ...document,
      graph: {
        ...document.graph,
        nodes: {
          ...document.graph.nodes,
          [selectedNode.id]: {
            ...ontologyNode,
            name: draft.title || ontologyNode.name,
            type: buildOntologyNodeType(draft.attributes),
            description: draft.summary || draft.content || undefined,
            fields: buildOntologyFieldsFromAttributes(selectedNode.id, draft.attributes),
            tags: parseTagsText(draft.tags),
            domainId: draft.groupId || undefined,
          },
        },
      },
    };

    return buildOntologyNodeViewModel(draftDocument, selectedNode.id) ?? nodeViewModel;
  }, [document, draft, nodeViewModel, selectedNode]);

  const domainPreviewViewModel = useMemo<OntologyDomainViewModel | undefined>(() => {
    if (!selectedNode || selectedNode.type !== BlockEnum.GROUP || !domainViewModel) {
      return undefined;
    }

    return {
      ...domainViewModel,
      title: draft.title || domainViewModel.title,
      description: draft.summary || draft.content || domainViewModel.description,
      parentDomainId: draft.groupId || undefined,
    };
  }, [domainViewModel, draft, selectedNode]);

  const syncLegacyDisplayCache = useCallback((nextDocument: OntologyDocumentState) => {
    useGraphStore.setState({
      nodes: projectOntologyDocumentToLegacyGraphNodes(nextDocument),
      edges: projectOntologyDocumentToLegacyGraphEdges(nextDocument),
    });
  }, []);

  const applyPlacementPatch = useCallback((
    nextDocument: OntologyDocumentState,
    patch: OntologyInteractionPatch,
    reason: string
  ) => {
    if (!hasOntologyInteractionPatchChanges(patch)) {
      syncLegacyDisplayCache(nextDocument);
      return nextDocument;
    }

    const placedDocument = applyInteractionPatch(patch, {
      canvasId: currentCanvasId,
      reason,
    });
    const currentDocument = placedDocument ?? useOntologyDocumentStore.getState().document;
    syncLegacyDisplayCache(currentDocument);
    return currentDocument;
  }, [applyInteractionPatch, currentCanvasId, syncLegacyDisplayCache]);

  const updateDraft = useCallback(<K extends keyof NodeEditorDraft,>(
    field: K,
    value: NodeEditorDraft[K]
  ) => {
    setDraft(previousDraft => ({
      ...previousDraft,
      [field]: value,
    }));
    setFeedback(null);
    setError(null);
  }, []);

  const handleAttributeChange = useCallback((attributes: Record<string, unknown>) => {
    updateDraft('attributes', attributes);
  }, [updateDraft]);

  const handleSave = useCallback(() => {
    if (!selectedNode) {
      return;
    }

    const savePlan = createNodeInspectorSavePlan(selectedNode.id, selectedNode, draft);
    if (!savePlan.ok) {
      setError(savePlan.errors[0] ?? '保存失败');
      setFeedback(null);
      return;
    }

    const currentDocument = useOntologyDocumentStore.getState().document;
    const ontologyResult = savePlan.ontology.kind === 'domain'
      ? updateOntologyDomainInDocument(currentDocument, savePlan.ontology.input)
      : updateOntologyNodeInDocument(currentDocument, savePlan.ontology.input);

    if (!ontologyResult.changed) {
      setFeedback('No changes');
      return;
    }

    const applied = applyOntologyCommandResult(ontologyResult, {
      canvasId: currentCanvasId,
      reason: 'node-inspector-save',
    });

    if (applied) {
      const nextDocument = useOntologyDocumentStore.getState().document;
      if (savePlan.ontology.kind === 'node' && savePlan.membership.type !== 'none') {
        applyPlacementPatch(
          nextDocument,
          createNodeDomainPlacementPatch(nextDocument, {
            nodeId: selectedNode.id,
            domainId: savePlan.ontology.input.domainId,
          }),
          'node-inspector-save-container'
        );
      } else {
        syncLegacyDisplayCache(nextDocument);
      }
      setFeedback('Saved');
      setError(null);
    }
  }, [
    applyPlacementPatch,
    applyOntologyCommandResult,
    currentCanvasId,
    draft,
    selectedNode,
    syncLegacyDisplayCache,
  ]);

  const handleReset = useCallback(() => {
    setDraft(createNodeEditorDraft(selectedNode));
    setFeedback(null);
    setError(null);
    setEditorRevision(revision => revision + 1);
  }, [selectedNode]);

  const handleApplyContainer = useCallback((domainId: string | null) => {
    if (!selectedNode || selectedNode.type === BlockEnum.GROUP) {
      return;
    }

    const currentDocument = useOntologyDocumentStore.getState().document;
    const currentNode = currentDocument.graph.nodes[selectedNode.id];
    const currentDomainId = currentNode?.domainId ?? null;
    if (currentDomainId === domainId) {
      setFeedback(domainId ? 'Already in container' : 'Already outside containers');
      setError(null);
      return;
    }

    const ontologyResult = updateOntologyNodeInDocument(currentDocument, {
      nodeId: selectedNode.id,
      domainId,
    });

    if (!ontologyResult.changed) {
      setError(ontologyResult.warnings[0]?.message ?? 'Container change failed');
      setFeedback(null);
      return;
    }

    const applied = applyOntologyCommandResult(ontologyResult, {
      canvasId: currentCanvasId,
      reason: 'node-inspector-container-change',
    });

    if (!applied) {
      setError('Container change failed');
      setFeedback(null);
      return;
    }

    const nextDocument = useOntologyDocumentStore.getState().document;
    applyPlacementPatch(
      nextDocument,
      createNodeDomainPlacementPatch(nextDocument, {
        nodeId: selectedNode.id,
        domainId,
      }),
      'node-inspector-container-placement'
    );
    setDraft(previousDraft => ({
      ...previousDraft,
      groupId: domainId ?? '',
    }));
    setFeedback(domainId ? 'Moved to container' : 'Removed from container');
    setError(null);
  }, [
    applyOntologyCommandResult,
    applyPlacementPatch,
    currentCanvasId,
    selectedNode,
  ]);

  const handleRemoveContainer = useCallback(() => {
    if (selectedNode?.type === BlockEnum.GROUP) {
      updateDraft('groupId', '');
      return;
    }

    handleApplyContainer(null);
  }, [handleApplyContainer, selectedNode?.type, updateDraft]);

  if (!selectedNode) {
    return (
      <div
        style={{
          ...ontologyNodeViewTokens.cssVars,
          alignItems: 'center',
          border: '1px dashed var(--oc-node-color-divider)',
          borderRadius: '12px',
          color: 'var(--oc-node-color-text-muted)',
          display: 'grid',
          gap: 'var(--oc-node-space-sm)',
          padding: 'var(--oc-node-space-md)',
        }}
      >
        <div style={labelStyle}>Inspector</div>
        <div style={{ fontSize: 'var(--oc-node-body-size)' }}>Select a node or domain to edit its details.</div>
      </div>
    );
  }

  const selectedContainer = containerOptions.find(option => option.id === draft.groupId);
  const selectedOntologyType = selectedNode.type === BlockEnum.GROUP
    ? 'Domain'
    : typeof selectedNode.attributes?.ontologyType === 'string'
      ? selectedNode.attributes.ontologyType
      : 'Class';
  const selectedValidationError = typeof selectedNode.validationError === 'string'
    ? selectedNode.validationError
    : undefined;
  const currentDomainId = selectedNode.type === BlockEnum.GROUP
    ? document.graph.domains[selectedNode.id]?.parentDomainId ?? ''
    : document.graph.nodes[selectedNode.id]?.domainId ?? '';

  return (
    <div
      style={{
        ...ontologyNodeViewTokens.cssVars,
        display: 'grid',
        gap: 'var(--oc-node-space-md)',
      }}
    >
      <div style={sectionStyle}>
        <div style={labelStyle}>Inspector</div>
        <div
          style={{
            color: 'var(--oc-node-color-text)',
            fontSize: 'var(--oc-node-title-size)',
            fontWeight: 'var(--oc-node-weight-title)',
          }}
        >
          {selectedNode.type === BlockEnum.GROUP ? 'Domain' : 'Node'} Details
        </div>
      </div>

      <div
        style={{
          border: '1px solid var(--oc-node-color-divider)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        {selectedNode.type === BlockEnum.GROUP ? (
          <DomainNodeView
            collapsed={selectedNode.collapsed}
            selected
            status="selected"
            title={selectedNode.title}
            validationError={selectedValidationError}
            viewModel={domainPreviewViewModel}
            lodMode="full"
          />
        ) : (
          <ClassNodeView
            description={selectedNode.summary ?? selectedNode.content}
            fields={createAttributeItems(selectedNode.attributes ?? {}).map(item => ({
              id: item.key,
              name: item.key,
              value: item.value,
              iconLabel: 'P',
              tone: 'field',
            }))}
            selected
            status="selected"
            tags={selectedNode.tags}
            title={selectedNode.title}
            type={selectedOntologyType}
            validationError={selectedValidationError}
            viewModel={nodePreviewViewModel}
            isExpanded={Boolean(selectedNode.isExpanded)}
            lodMode="full"
          />
        )}
      </div>

      <div style={sectionStyle}>
        <div style={labelStyle}>Basic</div>
        <Input
          className={inputStyle}
          value={draft.title}
          onChange={(event) => updateDraft('title', event.target.value)}
          placeholder="Title"
        />
        <Textarea
          className="min-h-[88px] resize-none"
          value={draft.summary}
          onChange={(event) => updateDraft('summary', event.target.value)}
          placeholder="Summary"
        />
        <Textarea
          className="min-h-[88px] resize-none"
          value={draft.content}
          onChange={(event) => updateDraft('content', event.target.value)}
          placeholder="Content"
        />
      </div>

      <div style={sectionStyle}>
        <div style={labelStyle}>Tags</div>
        <Input
          className={inputStyle}
          value={draft.tags}
          onChange={(event) => updateDraft('tags', event.target.value)}
          placeholder="tag1, tag2"
        />
      </div>

      <div style={sectionStyle}>
        <div style={labelStyle}>Container</div>
        <Select
          value={draft.groupId || NO_CONTAINER_VALUE}
          onValueChange={(value) => updateDraft('groupId', value === NO_CONTAINER_VALUE ? '' : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="No container" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_CONTAINER_VALUE}>
              No container
            </SelectItem>
            {containerOptions.map(option => (
              <SelectItem key={option.id} value={option.id}>
                {option.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedContainer ? (
          <div
            style={{
              alignItems: 'center',
              color: 'var(--oc-node-color-text-muted)',
              display: 'flex',
              fontSize: 'var(--oc-node-meta-size)',
              gap: 'var(--oc-node-space-xs)',
            }}
          >
            <FolderOpen size={14} />
            <span>{selectedContainer.title}</span>
          </div>
        ) : null}
        {selectedNode.type !== BlockEnum.GROUP && containerOptions.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gap: 'var(--oc-node-space-xs)',
            }}
          >
            {containerOptions.map(option => {
              const isCurrentContainer = option.id === currentDomainId;

              return (
                <Button
                  className="justify-start"
                  disabled={isCurrentContainer}
                  key={option.id}
                  onClick={() => handleApplyContainer(option.id)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <FolderOpen size={14} />
                  {isCurrentContainer ? `Current: ${option.title}` : `Move to ${option.title}`}
                </Button>
              );
            })}
          </div>
        ) : null}
        {draft.groupId ? (
          <Button
            className="w-full"
            onClick={handleRemoveContainer}
            size="sm"
            type="button"
            variant="outline"
          >
            Remove from container
          </Button>
        ) : null}
      </div>

      <NodeAttributeEditor
        key={`${selectedNode.id}:${editorRevision}`}
        attributes={draft.attributes}
        mode={selectedNode.type === BlockEnum.GROUP ? 'domain' : 'node'}
        onChange={handleAttributeChange}
      />

      {error ? (
        <div
          style={{
            alignItems: 'center',
            color: 'var(--oc-node-color-danger)',
            display: 'flex',
            gap: 'var(--oc-node-space-xs)',
            fontSize: 'var(--oc-node-meta-size)',
          }}
        >
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      ) : null}

      {feedback ? (
        <div
          style={{
            color: 'var(--oc-node-color-text-muted)',
            fontSize: 'var(--oc-node-meta-size)',
          }}
        >
          {feedback}
        </div>
      ) : null}

      <div
        style={{
          display: 'grid',
          gap: 'var(--oc-node-space-xs)',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        }}
      >
        <Button
          onClick={handleSave}
          type="button"
        >
          <Save size={14} />
          Save
        </Button>
        <Button
          onClick={handleReset}
          type="button"
          variant="outline"
        >
          <RotateCcw size={14} />
          Reset
        </Button>
      </div>
    </div>
  );
};
