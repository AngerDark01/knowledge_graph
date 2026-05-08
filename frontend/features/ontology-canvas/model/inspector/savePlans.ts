import { BlockEnum, type Edge } from '../../../../types/graph/models';
import { validateNodeContent } from '../../../../utils/validation';
import type {
  UpdateOntologyDomainInDocumentInput,
  UpdateOntologyNodeInDocumentInput,
} from '../document';
import {
  buildEdgeUpdate,
  buildOntologyFieldsFromAttributes,
  buildOntologyNodeType,
  buildNodeUpdate,
  buildNodeValidationCandidate,
  parseCustomPropertiesText,
  parseTagsText,
  type EditableGraphNode,
  type EdgeEditorDraft,
  type NodeEditorDraft,
} from './editorDrafts';

export type EdgeInspectorSavePlan =
  | {
      ok: true;
      edgeId: string;
      update: Partial<Edge>;
    }
  | {
      ok: false;
      error: string;
    };

export type NodeMembershipPlan =
  | {
      type: 'none';
    }
  | {
      type: 'move';
      nodeId: string;
      groupId: string;
    }
  | {
      type: 'remove';
      nodeId: string;
    };

export type NodeInspectorSavePlan =
  | {
      ok: true;
      nodeId: string;
      membership: NodeMembershipPlan;
      update: Partial<EditableGraphNode>;
      ontology:
        | {
            kind: 'node';
            input: UpdateOntologyNodeInDocumentInput;
          }
        | {
            kind: 'domain';
            input: UpdateOntologyDomainInDocumentInput;
          };
    }
  | {
      ok: false;
      errors: string[];
    };

const buildLegacyMetadata = (draft: NodeEditorDraft): Record<string, unknown> => ({
  legacyContent: draft.content,
  legacySummary: draft.summary,
  legacyTags: parseTagsText(draft.tags),
  legacyAttributes: draft.attributes,
});

export const createEdgeInspectorSavePlan = (
  edge: Edge,
  draft: EdgeEditorDraft
): EdgeInspectorSavePlan => {
  const customPropertiesResult = parseCustomPropertiesText(draft.customPropertiesText);

  if (!customPropertiesResult.ok) {
    return {
      ok: false,
      error: customPropertiesResult.error,
    };
  }

  return {
    ok: true,
    edgeId: edge.id,
    update: buildEdgeUpdate(edge, draft, customPropertiesResult.value),
  };
};

export const createNodeMembershipPlan = (
  nodeId: string,
  previousGroupId: string,
  nextGroupId: string
): NodeMembershipPlan => {
  if (previousGroupId === nextGroupId) {
    return { type: 'none' };
  }

  if (nextGroupId) {
    return {
      type: 'move',
      nodeId,
      groupId: nextGroupId,
    };
  }

  return createNodeRemoveFromGroupPlan(nodeId);
};

export const createNodeRemoveFromGroupPlan = (nodeId: string): NodeMembershipPlan => ({
  type: 'remove',
  nodeId,
});

export const createNodeInspectorSavePlan = (
  nodeId: string,
  node: EditableGraphNode,
  draft: NodeEditorDraft
): NodeInspectorSavePlan => {
  const nodeToUpdate = buildNodeValidationCandidate(node, draft);
  const validation = validateNodeContent(nodeToUpdate);

  if (!validation.isValid) {
    return {
      ok: false,
      errors: validation.errors,
    };
  }

  return {
    ok: true,
    nodeId,
    membership: createNodeMembershipPlan(
      nodeId,
      node.groupId || '',
      draft.groupId || ''
    ),
    update: buildNodeUpdate(draft),
    ontology: node.type === BlockEnum.GROUP
      ? {
        kind: 'domain',
        input: {
          domainId: nodeId,
          name: draft.title,
          parentDomainId: draft.groupId || null,
          metadata: buildLegacyMetadata(draft),
        },
      }
      : {
        kind: 'node',
        input: {
          nodeId,
          name: draft.title,
          type: buildOntologyNodeType(draft.attributes),
          description: draft.summary || draft.content || undefined,
          fields: buildOntologyFieldsFromAttributes(nodeId, draft.attributes),
          tags: parseTagsText(draft.tags),
          domainId: draft.groupId || null,
          metadata: buildLegacyMetadata(draft),
        },
      },
  };
};
