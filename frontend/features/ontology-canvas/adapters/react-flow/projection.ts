import type { Edge as ReactFlowEdge, Node as ReactFlowNode } from 'reactflow';
import { BlockEnum, type Edge, type Group, type Node } from '../../../../types/graph/models';
import { isEdgeVisible, type EdgeVisibility } from '../../../../domain/ontology/commands/edgeVisibility';
import type { OntologyDocumentState } from '../../model/document/ontologyDocument';
import {
  projectOntologyDomainToLegacyGroup,
  projectOntologyEdgeToLegacyEdge,
  projectOntologyNodeToLegacyNode,
} from '../legacy-graph/documentBridge';
import { ontologyNodeViewTokens } from '../../config/nodeViewTokens';

export type LegacyGraphNode = Node | Group;

type SafeNumber = (value: unknown, defaultValue: number) => number;

export type ReactFlowLodMode = 'full' | 'compact' | 'outline' | 'dot';

export type ReactFlowViewportBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

export type ReactFlowNodeProjectionOptions = {
  selectedNodeId?: string | null;
  cullingEnabled?: boolean;
  viewportBounds?: ReactFlowViewportBounds | null;
  viewportPadding?: number;
  lodMode?: ReactFlowLodMode;
};

export type ReactFlowEdgeProjectionOptions = {
  selectedEdgeId?: string | null;
  edgeVisibility?: EdgeVisibility;
  nodeById?: Map<string, LegacyGraphNode>;
  visibleNodeIds?: Set<string>;
};

export type OntologyReactFlowEdgeProjectionOptions = Omit<
  ReactFlowEdgeProjectionOptions,
  'nodeById'
>;

export const safeNumber = (value: unknown, defaultValue = 0): number => {
  const num = Number(value);
  return Number.isFinite(num) ? num : defaultValue;
};

export const createGraphNodeLookup = (
  nodes: readonly LegacyGraphNode[]
): Map<string, LegacyGraphNode> => {
  return new Map(nodes.map(node => [node.id, node]));
};

export const resolveReactFlowLodMode = (zoom: number): ReactFlowLodMode => {
  if (zoom >= 0.85) {
    return 'full';
  }

  if (zoom >= 0.45) {
    return 'compact';
  }

  if (zoom >= 0.2) {
    return 'outline';
  }

  return 'dot';
};

export const convertToRelativePosition = (
  node: LegacyGraphNode,
  parentGroup?: Group,
  safeNumberImpl: SafeNumber = safeNumber
): { x: number; y: number } => {
  if (!parentGroup) {
    return node.position;
  }

  return {
    x: safeNumberImpl(node.position.x, 0) - safeNumberImpl(parentGroup.position.x, 0),
    y: safeNumberImpl(node.position.y, 0) - safeNumberImpl(parentGroup.position.y, 0),
  };
};

export const convertToAbsolutePosition = (
  relativePos: { x: number; y: number },
  parentGroup: Group,
  safeNumberImpl: SafeNumber = safeNumber
): { x: number; y: number } => {
  return {
    x: safeNumberImpl(relativePos.x, 0) + safeNumberImpl(parentGroup.position.x, 0),
    y: safeNumberImpl(relativePos.y, 0) + safeNumberImpl(parentGroup.position.y, 0),
  };
};

export const sortNodesByNestingLevel = (
  nodes: readonly LegacyGraphNode[]
): LegacyGraphNode[] => {
  const nodeMap = createGraphNodeLookup(nodes);
  const depthCache = new Map<string, number>();

  const getDepth = (nodeId: string, visiting = new Set<string>()): number => {
    if (depthCache.has(nodeId)) {
      return depthCache.get(nodeId)!;
    }

    if (visiting.has(nodeId)) {
      depthCache.set(nodeId, 0);
      return 0;
    }

    const node = nodeMap.get(nodeId);
    if (!node?.groupId) {
      depthCache.set(nodeId, 0);
      return 0;
    }

    visiting.add(nodeId);
    const depth = 1 + getDepth(node.groupId, visiting);
    visiting.delete(nodeId);
    depthCache.set(nodeId, depth);
    return depth;
  };

  return [...nodes].sort((a, b) => getDepth(a.id) - getDepth(b.id));
};

const getParentGroup = (
  node: LegacyGraphNode,
  nodeById: Map<string, LegacyGraphNode>
): Group | undefined => {
  if (!node.groupId) {
    return undefined;
  }

  const parent = nodeById.get(node.groupId);
  return parent?.type === BlockEnum.GROUP ? parent : undefined;
};

const getDefaultNodeSize = (node: LegacyGraphNode): { width: number; height: number } => {
  return node.type === BlockEnum.GROUP
    ? { width: 300, height: 200 }
    : { width: 350, height: 280 };
};

const getOriginalNodeSize = (
  node: LegacyGraphNode,
  safeNumberImpl: SafeNumber
): { width: number; height: number } => {
  const defaultSize = getDefaultNodeSize(node);

  return {
    width: safeNumberImpl(node.width, defaultSize.width),
    height: safeNumberImpl(node.height, defaultSize.height),
  };
};

export const resolveReactFlowNodeDisplaySize = (
  node: LegacyGraphNode,
  lodMode: ReactFlowLodMode,
  safeNumberImpl: SafeNumber = safeNumber
): { width: number; height: number } => {
  const originalSize = getOriginalNodeSize(node, safeNumberImpl);

  if (node.type === BlockEnum.GROUP || lodMode === 'full') {
    return originalSize;
  }

  const configuredSize = ontologyNodeViewTokens.lodDisplayDimensions[lodMode];
  if (!configuredSize) {
    return originalSize;
  }

  return {
    width: Math.min(originalSize.width, safeNumberImpl(configuredSize.width, originalSize.width)),
    height: Math.min(originalSize.height, safeNumberImpl(configuredSize.height, originalSize.height)),
  };
};

const centerDisplayPosition = (
  position: { x: number; y: number },
  originalSize: { width: number; height: number },
  displaySize: { width: number; height: number }
): { x: number; y: number } => ({
  x: position.x + (originalSize.width - displaySize.width) / 2,
  y: position.y + (originalSize.height - displaySize.height) / 2,
});

export const resolveReactFlowNodePersistedPosition = (
  node: LegacyGraphNode,
  lodMode: ReactFlowLodMode,
  displayPosition: { x: number; y: number },
  safeNumberImpl: SafeNumber = safeNumber
): { x: number; y: number } => {
  const originalSize = getOriginalNodeSize(node, safeNumberImpl);
  const displaySize = resolveReactFlowNodeDisplaySize(node, lodMode, safeNumberImpl);

  return {
    x: safeNumberImpl(displayPosition.x, 0) - (originalSize.width - displaySize.width) / 2,
    y: safeNumberImpl(displayPosition.y, 0) - (originalSize.height - displaySize.height) / 2,
  };
};

const getNodeAbsoluteBounds = (
  node: LegacyGraphNode,
  safeNumberImpl: SafeNumber
): ReactFlowViewportBounds => {
  const minX = safeNumberImpl(node.position.x, 0);
  const minY = safeNumberImpl(node.position.y, 0);
  const { width, height } = getOriginalNodeSize(node, safeNumberImpl);

  return {
    minX,
    minY,
    maxX: minX + width,
    maxY: minY + height,
  };
};

const expandViewportBounds = (
  bounds: ReactFlowViewportBounds,
  padding: number
): ReactFlowViewportBounds => ({
  minX: bounds.minX - padding,
  minY: bounds.minY - padding,
  maxX: bounds.maxX + padding,
  maxY: bounds.maxY + padding,
});

const boundsIntersect = (
  a: ReactFlowViewportBounds,
  b: ReactFlowViewportBounds
): boolean => {
  return a.minX <= b.maxX &&
    a.maxX >= b.minX &&
    a.minY <= b.maxY &&
    a.maxY >= b.minY;
};

const includeNodeAncestors = (
  node: LegacyGraphNode,
  nodeById: Map<string, LegacyGraphNode>,
  visibleNodeIds: Set<string>
): void => {
  let parentId = node.groupId;
  const visited = new Set<string>();

  while (parentId && !visited.has(parentId)) {
    visited.add(parentId);
    visibleNodeIds.add(parentId);
    const parent = nodeById.get(parentId);
    parentId = parent?.groupId;
  }
};

export const hasCollapsedAncestor = (
  node: LegacyGraphNode,
  nodeById: Map<string, LegacyGraphNode>
): boolean => {
  let parentId = node.groupId;
  const visited = new Set<string>();

  while (parentId && !visited.has(parentId)) {
    visited.add(parentId);
    const parent = nodeById.get(parentId);

    if (!parent) {
      return false;
    }

    if (parent.type === BlockEnum.GROUP && parent.collapsed) {
      return true;
    }

    parentId = parent.groupId;
  }

  return false;
};

export const resolveRenderableNodeIds = (
  nodes: readonly LegacyGraphNode[],
  nodeById: Map<string, LegacyGraphNode> = createGraphNodeLookup(nodes)
): Set<string> => {
  return new Set(
    nodes
      .filter(node => !hasCollapsedAncestor(node, nodeById))
      .map(node => node.id)
  );
};

const resolveVisibleNodeIds = (
  nodes: readonly LegacyGraphNode[],
  nodeById: Map<string, LegacyGraphNode>,
  options: ReactFlowNodeProjectionOptions,
  safeNumberImpl: SafeNumber
): Set<string> => {
  if (!options.cullingEnabled || !options.viewportBounds) {
    return resolveRenderableNodeIds(nodes, nodeById);
  }

  const padding = safeNumberImpl(options.viewportPadding, 0);
  const expandedBounds = expandViewportBounds(options.viewportBounds, Math.max(0, padding));
  const visibleNodeIds = new Set<string>();

  for (const node of nodes) {
    const isSelected = node.id === options.selectedNodeId;
    const isVisible = boundsIntersect(getNodeAbsoluteBounds(node, safeNumberImpl), expandedBounds);

    if (isSelected || isVisible) {
      visibleNodeIds.add(node.id);
      includeNodeAncestors(node, nodeById, visibleNodeIds);
    }
  }

  return new Set(
    [...visibleNodeIds].filter((nodeId) => {
      const node = nodeById.get(nodeId);
      return node ? !hasCollapsedAncestor(node, nodeById) : false;
    })
  );
};

export const projectNodesToReactFlowNodes = (
  nodes: readonly LegacyGraphNode[],
  options: ReactFlowNodeProjectionOptions = {},
  convertToRelativePositionImpl = convertToRelativePosition,
  safeNumberImpl = safeNumber
): ReactFlowNode[] => {
  const nodeById = createGraphNodeLookup(nodes);
  const sortedNodes = sortNodesByNestingLevel(nodes);
  const visibleNodeIds = resolveVisibleNodeIds(sortedNodes, nodeById, options, safeNumberImpl);
  const lodMode = options.lodMode ?? 'full';
  const result: ReactFlowNode[] = [];

  for (const node of sortedNodes) {
    if (!visibleNodeIds.has(node.id)) {
      continue;
    }

    const isGroup = node.type === BlockEnum.GROUP;
    const parentGroup = getParentGroup(node, nodeById);

    const originalSize = getOriginalNodeSize(node, safeNumberImpl);
    const displaySize = resolveReactFlowNodeDisplaySize(node, lodMode, safeNumberImpl);
    const safePosition = {
      x: safeNumberImpl(node.position.x, 0),
      y: safeNumberImpl(node.position.y, 0),
    };
    const displayPosition = centerDisplayPosition(safePosition, originalSize, displaySize);

    const projectedPosition = parentGroup
      ? convertToRelativePositionImpl({ ...node, position: displayPosition }, parentGroup, safeNumberImpl)
      : displayPosition;

    const baseProjection = {
      ...node,
      id: node.id,
      position: {
        x: safeNumberImpl(projectedPosition.x, 0),
        y: safeNumberImpl(projectedPosition.y, 0),
      },
      selected: node.id === options.selectedNodeId,
      draggable: true,
      ...(node.groupId && {
        parentId: node.groupId,
        extent: 'parent' as const,
        expandParent: true,
      }),
      key: `${node.id}-${node.type}`,
      data: {
        ...node.data,
        title: node.title,
        content: node.content,
        summary: node.summary,
        tags: node.tags,
        attributes: node.attributes,
        validationError: node.validationError,
        lodMode,
      },
    };

    if (isGroup) {
      const groupNode = node as Group;
      result.push({
        ...baseProjection,
        type: 'group',
        style: {
          ...groupNode.style,
          width: displaySize.width,
          height: displaySize.height,
        },
      } as ReactFlowNode);
    } else {
      const regularNode = node as Node;
      result.push({
        ...baseProjection,
        type: 'custom',
        style: {
          ...regularNode.style,
          width: displaySize.width,
          height: displaySize.height,
        },
      } as ReactFlowNode);
    }
  }

  return result;
};

export const projectEdgesToReactFlowEdges = (
  edges: readonly Edge[],
  nodes: readonly LegacyGraphNode[],
  options: ReactFlowEdgeProjectionOptions = {}
): ReactFlowEdge[] => {
  const nodeById = options.nodeById ?? createGraphNodeLookup(nodes);
  const visibleNodeIds = options.visibleNodeIds ?? resolveRenderableNodeIds(nodes, nodeById);

  return edges
    .filter(edge => {
      if (!isEdgeVisible(edge.id, options.edgeVisibility)) {
        return false;
      }

      return visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target);
    })
    .map(edge => {
      const sourceNode = nodeById.get(edge.source);
      const targetNode = nodeById.get(edge.target);
      const isCrossGroup = Boolean(
        sourceNode?.groupId &&
        targetNode?.groupId &&
        sourceNode.groupId !== targetNode.groupId
      );

      return {
        ...edge,
        selected: edge.id === options.selectedEdgeId,
        type: isCrossGroup ? 'crossGroup' : 'default',
        zIndex: 1000,
      } as ReactFlowEdge;
    });
};

export const projectOntologyDocumentToLegacyGraphNodes = (
  document: OntologyDocumentState
): LegacyGraphNode[] => {
  const domains = Object.keys(document.graph.domains)
    .map(domainId => projectOntologyDomainToLegacyGroup(document, domainId))
    .filter((node): node is Group => Boolean(node));
  const nodes = Object.keys(document.graph.nodes)
    .map(nodeId => projectOntologyNodeToLegacyNode(document, nodeId))
    .filter((node): node is Node => Boolean(node));

  return [...domains, ...nodes];
};

const createOntologyEdgeDisplayData = (
  document: OntologyDocumentState,
  edgeId: string
): Edge['data'] => {
  const edge = document.graph.edges[edgeId];
  if (!edge) {
    return undefined;
  }

  const sourceDomainId = document.graph.nodes[edge.source]?.domainId;
  const targetDomainId = document.graph.nodes[edge.target]?.domainId;
  const isCrossGroup = Boolean(
    sourceDomainId &&
    targetDomainId &&
    sourceDomainId !== targetDomainId
  ) || Boolean(sourceDomainId || targetDomainId) && sourceDomainId !== targetDomainId;

  return {
    isCrossGroup,
    sourceGroupId: sourceDomainId,
    targetGroupId: targetDomainId,
    strokeDasharray: isCrossGroup ? '5,5' : undefined,
    color: isCrossGroup ? '#FFA500' : undefined,
    strokeWidth: isCrossGroup ? 2 : 1,
    direction: edge.direction,
  };
};

export const projectOntologyDocumentToLegacyGraphEdges = (
  document: OntologyDocumentState
): Edge[] => {
  return Object.keys(document.graph.edges)
    .map(edgeId => projectOntologyEdgeToLegacyEdge(document, edgeId, {
      data: createOntologyEdgeDisplayData(document, edgeId),
    }))
    .filter((edge): edge is Edge => Boolean(edge));
};

export const projectOntologyDocumentToReactFlowNodes = (
  document: OntologyDocumentState,
  options: ReactFlowNodeProjectionOptions = {}
): ReactFlowNode[] => {
  return projectNodesToReactFlowNodes(
    projectOntologyDocumentToLegacyGraphNodes(document),
    options
  );
};

export const projectOntologyDocumentToReactFlowEdges = (
  document: OntologyDocumentState,
  options: OntologyReactFlowEdgeProjectionOptions = {}
): ReactFlowEdge[] => {
  const nodes = projectOntologyDocumentToLegacyGraphNodes(document);
  const edges = projectOntologyDocumentToLegacyGraphEdges(document);

  return projectEdgesToReactFlowEdges(edges, nodes, {
    ...options,
    nodeById: createGraphNodeLookup(nodes),
  });
};
