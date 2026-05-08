import type {
  OntologyDocumentState,
  OntologyDomainViewState,
  OntologyEdgeViewState,
  OntologyNodeViewState,
} from '../document/ontologyDocument';

export type OntologyPosition = {
  x: number;
  y: number;
};

export type OntologyInteractionPadding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type OntologyDomainInteractionConfig = {
  domainPadding: OntologyInteractionPadding;
  nodeVisualPadding: number;
  minDomainWidth: number;
  minDomainHeight: number;
};

export type OntologyInteractionPatch = {
  nodeViews?: Record<string, Partial<OntologyNodeViewState>>;
  domainViews?: Record<string, Partial<OntologyDomainViewState>>;
  edgeViews?: Record<string, Partial<OntologyEdgeViewState>>;
  warnings?: string[];
};

export type DomainDescendantViewIds = {
  nodeIds: string[];
  domainIds: string[];
  warnings: string[];
};

export type ProjectReactFlowPositionInput = {
  position: OntologyPosition;
  parentDomainId?: string;
};

export type ConstrainNodePositionInput = {
  nodeId: string;
  position: OntologyPosition;
  domainId?: string;
  config?: Partial<OntologyDomainInteractionConfig>;
};

export type CommitNodeDragInput = {
  nodeId: string;
  reactFlowPosition: OntologyPosition;
  domainId?: string;
  config?: Partial<OntologyDomainInteractionConfig>;
};

export type CommitDomainDragInput = {
  domainId: string;
  reactFlowPosition: OntologyPosition;
  parentDomainId?: string;
  config?: Partial<OntologyDomainInteractionConfig>;
};

export type CommitNodeResizeInput = {
  nodeId: string;
  position?: OntologyPosition;
  width?: number;
  height?: number;
  expanded?: boolean;
  customExpandedSize?: {
    width: number;
    height: number;
  };
  config?: Partial<OntologyDomainInteractionConfig>;
};

export type CommitDomainResizeInput = {
  domainId: string;
  position?: OntologyPosition;
  width?: number;
  height?: number;
  collapsed?: boolean;
  config?: Partial<OntologyDomainInteractionConfig>;
};

export type CreateNodeDomainPlacementPatchInput = {
  nodeId: string;
  domainId?: string | null;
  config?: Partial<OntologyDomainInteractionConfig>;
};

export const DEFAULT_DOMAIN_INTERACTION_CONFIG: OntologyDomainInteractionConfig = {
  domainPadding: {
    top: 70,
    right: 20,
    bottom: 20,
    left: 20,
  },
  nodeVisualPadding: 4,
  minDomainWidth: 300,
  minDomainHeight: 200,
};

const safeNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const safePosition = (position: OntologyPosition): OntologyPosition => ({
  x: safeNumber(position.x, 0),
  y: safeNumber(position.y, 0),
});

const resolveConfig = (
  config?: Partial<OntologyDomainInteractionConfig>
): OntologyDomainInteractionConfig => ({
  ...DEFAULT_DOMAIN_INTERACTION_CONFIG,
  ...config,
  domainPadding: {
    ...DEFAULT_DOMAIN_INTERACTION_CONFIG.domainPadding,
    ...config?.domainPadding,
  },
});

const mergePatch = (
  left: OntologyInteractionPatch,
  right: OntologyInteractionPatch
): OntologyInteractionPatch => ({
  nodeViews: {
    ...(left.nodeViews ?? {}),
    ...(right.nodeViews ?? {}),
  },
  domainViews: {
    ...(left.domainViews ?? {}),
    ...(right.domainViews ?? {}),
  },
  edgeViews: {
    ...(left.edgeViews ?? {}),
    ...(right.edgeViews ?? {}),
  },
  warnings: [
    ...(left.warnings ?? []),
    ...(right.warnings ?? []),
  ],
});

export const hasOntologyInteractionPatchChanges = (
  patch: OntologyInteractionPatch
): boolean => {
  return Object.keys(patch.nodeViews ?? {}).length > 0 ||
    Object.keys(patch.domainViews ?? {}).length > 0 ||
    Object.keys(patch.edgeViews ?? {}).length > 0;
};

const mergeViewRecord = <TView extends { id: string }>(
  previousViews: Record<string, TView>,
  patches: Record<string, Partial<TView>> | undefined
): Record<string, TView> => {
  if (!patches || Object.keys(patches).length === 0) {
    return previousViews;
  }

  const nextViews = { ...previousViews };

  for (const [viewId, viewPatch] of Object.entries(patches)) {
    const previousView = previousViews[viewId];
    if (!previousView) {
      continue;
    }

    nextViews[viewId] = {
      ...previousView,
      ...viewPatch,
      id: previousView.id,
    };
  }

  return nextViews;
};

const applyPatchToDocumentView = (
  document: OntologyDocumentState,
  patch: OntologyInteractionPatch,
  incrementRevision: boolean
): OntologyDocumentState => {
  if (!hasOntologyInteractionPatchChanges(patch)) {
    return document;
  }

  return {
    ...document,
    view: {
      ...document.view,
      nodeViews: mergeViewRecord(document.view.nodeViews, patch.nodeViews),
      domainViews: mergeViewRecord(document.view.domainViews, patch.domainViews),
      edgeViews: mergeViewRecord(document.view.edgeViews, patch.edgeViews),
    },
    revision: incrementRevision ? document.revision + 1 : document.revision,
  };
};

export const applyOntologyInteractionPatch = (
  document: OntologyDocumentState,
  patch: OntologyInteractionPatch
): OntologyDocumentState => applyPatchToDocumentView(document, patch, true);

export const collectDomainDescendantViewIds = (
  document: OntologyDocumentState,
  domainId: string
): DomainDescendantViewIds => {
  const nodeIds = new Set<string>();
  const domainIds = new Set<string>();
  const warnings: string[] = [];
  const visitedDomainIds = new Set<string>();

  const visitDomain = (currentDomainId: string): void => {
    if (visitedDomainIds.has(currentDomainId)) {
      warnings.push(`Domain nesting cycle detected at "${currentDomainId}".`);
      return;
    }

    visitedDomainIds.add(currentDomainId);
    const domain = document.graph.domains[currentDomainId];
    if (!domain) {
      warnings.push(`Domain "${currentDomainId}" does not exist.`);
      return;
    }

    for (const nodeId of domain.nodeIds) {
      if (!document.graph.nodes[nodeId] || !document.view.nodeViews[nodeId]) {
        warnings.push(`Domain "${currentDomainId}" references missing node view "${nodeId}".`);
        continue;
      }

      nodeIds.add(nodeId);
    }

    for (const childDomainId of domain.domainIds) {
      if (!document.graph.domains[childDomainId] || !document.view.domainViews[childDomainId]) {
        warnings.push(`Domain "${currentDomainId}" references missing domain view "${childDomainId}".`);
        continue;
      }

      domainIds.add(childDomainId);
      visitDomain(childDomainId);
    }
  };

  visitDomain(domainId);

  return {
    nodeIds: [...nodeIds],
    domainIds: [...domainIds],
    warnings,
  };
};

export const projectReactFlowPositionToAbsolute = (
  document: OntologyDocumentState,
  input: ProjectReactFlowPositionInput
): { position: OntologyPosition; warnings: string[] } => {
  const position = safePosition(input.position);
  if (!input.parentDomainId) {
    return {
      position,
      warnings: [],
    };
  }

  const parentView = document.view.domainViews[input.parentDomainId];
  if (!parentView) {
    return {
      position,
      warnings: [`Parent domain view "${input.parentDomainId}" does not exist.`],
    };
  }

  return {
    position: {
      x: position.x + safeNumber(parentView.position.x, 0),
      y: position.y + safeNumber(parentView.position.y, 0),
    },
    warnings: [],
  };
};

export const constrainNodePositionToDomain = (
  document: OntologyDocumentState,
  input: ConstrainNodePositionInput
): { position: OntologyPosition; warnings: string[] } => {
  const position = safePosition(input.position);
  const domainId = input.domainId ?? document.graph.nodes[input.nodeId]?.domainId;
  if (!domainId) {
    return {
      position,
      warnings: [],
    };
  }

  const nodeView = document.view.nodeViews[input.nodeId];
  if (!nodeView) {
    return {
      position,
      warnings: [`Node view "${input.nodeId}" does not exist.`],
    };
  }

  const domainView = document.view.domainViews[domainId];
  if (!domainView) {
    return {
      position,
      warnings: [`Domain view "${domainId}" does not exist.`],
    };
  }

  const config = resolveConfig(input.config);
  const padding = config.domainPadding;
  const nodeWidth = safeNumber(nodeView.width, 350);
  const nodeHeight = safeNumber(nodeView.height, 280);
  const domainX = safeNumber(domainView.position.x, 0);
  const domainY = safeNumber(domainView.position.y, 0);
  const domainWidth = safeNumber(domainView.width, config.minDomainWidth);
  const domainHeight = safeNumber(domainView.height, config.minDomainHeight);

  const minX = domainX + padding.left;
  const minY = domainY + padding.top;
  const maxX = domainX + domainWidth - padding.right - nodeWidth;
  const maxY = domainY + domainHeight - padding.bottom - nodeHeight;

  return {
    position: {
      x: Math.max(minX, Math.min(position.x, maxX)),
      y: Math.max(minY, Math.min(position.y, maxY)),
    },
    warnings: [],
  };
};

const getViewBounds = (
  position: OntologyPosition,
  width: number,
  height: number,
  visualPadding: number
): { minX: number; minY: number; maxX: number; maxY: number } => ({
  minX: safeNumber(position.x, 0),
  minY: safeNumber(position.y, 0),
  maxX: safeNumber(position.x, 0) + safeNumber(width, 0) + visualPadding,
  maxY: safeNumber(position.y, 0) + safeNumber(height, 0) + visualPadding,
});

const boundsOverlap = (
  left: { minX: number; minY: number; maxX: number; maxY: number },
  right: { minX: number; minY: number; maxX: number; maxY: number }
): boolean => {
  return left.minX < right.maxX &&
    left.maxX > right.minX &&
    left.minY < right.maxY &&
    left.maxY > right.minY;
};

const resolveNodePlacementInDomain = (
  document: OntologyDocumentState,
  nodeId: string,
  domainId: string,
  config: OntologyDomainInteractionConfig
): { position: OntologyPosition; warnings: string[] } => {
  const domain = document.graph.domains[domainId];
  const domainView = document.view.domainViews[domainId];
  const nodeView = document.view.nodeViews[nodeId];

  if (!domain || !domainView) {
    return {
      position: nodeView?.position ?? { x: 0, y: 0 },
      warnings: [`Domain view "${domainId}" does not exist.`],
    };
  }

  if (!nodeView) {
    return {
      position: { x: 0, y: 0 },
      warnings: [`Node view "${nodeId}" does not exist.`],
    };
  }

  const padding = config.domainPadding;
  const gap = 24;
  const nodeWidth = safeNumber(nodeView.width, 350);
  const nodeHeight = safeNumber(nodeView.height, 280);
  const minX = safeNumber(domainView.position.x, 0) + padding.left;
  const minY = safeNumber(domainView.position.y, 0) + padding.top;
  const domainWidth = safeNumber(domainView.width, config.minDomainWidth);
  const usableWidth = Math.max(nodeWidth, domainWidth - padding.left - padding.right);
  const columnWidth = nodeWidth + gap;
  const columnCount = Math.max(1, Math.floor((usableWidth + gap) / columnWidth));
  const occupiedBounds: Array<{ minX: number; minY: number; maxX: number; maxY: number }> = [];

  for (const childNodeId of domain.nodeIds) {
    if (childNodeId === nodeId) {
      continue;
    }

    const childView = document.view.nodeViews[childNodeId];
    if (!childView) {
      continue;
    }

    occupiedBounds.push(getViewBounds(
      childView.position,
      childView.width,
      childView.height,
      gap
    ));
  }

  for (const childDomainId of domain.domainIds) {
    const childView = document.view.domainViews[childDomainId];
    if (!childView) {
      continue;
    }

    occupiedBounds.push(getViewBounds(
      childView.position,
      childView.width,
      childView.height,
      gap
    ));
  }

  const candidateCount = Math.max(1, occupiedBounds.length + columnCount + 1);
  for (let index = 0; index < candidateCount; index += 1) {
    const column = index % columnCount;
    const row = Math.floor(index / columnCount);
    const position = {
      x: minX + column * columnWidth,
      y: minY + row * (nodeHeight + gap),
    };
    const candidateBounds = getViewBounds(position, nodeWidth, nodeHeight, 0);

    if (!occupiedBounds.some(bounds => boundsOverlap(candidateBounds, bounds))) {
      return {
        position,
        warnings: [],
      };
    }
  }

  return {
    position: {
      x: minX,
      y: minY + Math.ceil(candidateCount / columnCount) * (nodeHeight + gap),
    },
    warnings: [],
  };
};

const calculateDomainBoundaryPatch = (
  document: OntologyDocumentState,
  domainId: string,
  config: OntologyDomainInteractionConfig
): { patch: OntologyInteractionPatch; warnings: string[] } => {
  const domain = document.graph.domains[domainId];
  const domainView = document.view.domainViews[domainId];
  if (!domain || !domainView) {
    return {
      patch: {},
      warnings: [`Domain view "${domainId}" does not exist.`],
    };
  }

  const childBounds: Array<{ minX: number; minY: number; maxX: number; maxY: number }> = [];
  const warnings: string[] = [];

  for (const nodeId of domain.nodeIds) {
    const nodeView = document.view.nodeViews[nodeId];
    if (!nodeView) {
      warnings.push(`Domain "${domainId}" references missing node view "${nodeId}".`);
      continue;
    }

    childBounds.push(getViewBounds(
      nodeView.position,
      nodeView.width,
      nodeView.height,
      config.nodeVisualPadding
    ));
  }

  for (const childDomainId of domain.domainIds) {
    const childDomainView = document.view.domainViews[childDomainId];
    if (!childDomainView) {
      warnings.push(`Domain "${domainId}" references missing domain view "${childDomainId}".`);
      continue;
    }

    childBounds.push(getViewBounds(
      childDomainView.position,
      childDomainView.width,
      childDomainView.height,
      config.nodeVisualPadding
    ));
  }

  if (childBounds.length === 0) {
    return {
      patch: {},
      warnings,
    };
  }

  const minX = Math.min(...childBounds.map(bounds => bounds.minX));
  const minY = Math.min(...childBounds.map(bounds => bounds.minY));
  const maxX = Math.max(...childBounds.map(bounds => bounds.maxX));
  const maxY = Math.max(...childBounds.map(bounds => bounds.maxY));
  const padding = config.domainPadding;
  const requiredMinX = minX - padding.left;
  const requiredMinY = minY - padding.top;
  const requiredMaxX = maxX + padding.right;
  const requiredMaxY = maxY + padding.bottom;
  const currentX = safeNumber(domainView.position.x, 0);
  const currentY = safeNumber(domainView.position.y, 0);
  const currentWidth = safeNumber(domainView.width, config.minDomainWidth);
  const currentHeight = safeNumber(domainView.height, config.minDomainHeight);
  const nextX = Math.min(currentX, requiredMinX);
  const nextY = Math.min(currentY, requiredMinY);
  const nextMaxX = Math.max(currentX + currentWidth, requiredMaxX);
  const nextMaxY = Math.max(currentY + currentHeight, requiredMaxY);
  const nextWidth = Math.max(config.minDomainWidth, nextMaxX - nextX);
  const nextHeight = Math.max(config.minDomainHeight, nextMaxY - nextY);

  if (
    nextX === currentX &&
    nextY === currentY &&
    nextWidth === currentWidth &&
    nextHeight === currentHeight
  ) {
    return {
      patch: {},
      warnings,
    };
  }

  return {
    patch: {
      domainViews: {
        [domainId]: {
          position: { x: nextX, y: nextY },
          width: nextWidth,
          height: nextHeight,
        },
      },
    },
    warnings,
  };
};

export const updateDomainBoundaryCascade = (
  document: OntologyDocumentState,
  domainId: string,
  configInput?: Partial<OntologyDomainInteractionConfig>
): OntologyInteractionPatch => {
  const config = resolveConfig(configInput);
  let currentDomainId: string | undefined = domainId;
  let workingDocument = document;
  let patch: OntologyInteractionPatch = {};
  const visitedDomainIds = new Set<string>();

  while (currentDomainId) {
    if (visitedDomainIds.has(currentDomainId)) {
      patch = mergePatch(patch, {
        warnings: [`Domain boundary cascade cycle detected at "${currentDomainId}".`],
      });
      break;
    }

    visitedDomainIds.add(currentDomainId);
    const boundaryResult = calculateDomainBoundaryPatch(workingDocument, currentDomainId, config);
    patch = mergePatch(patch, {
      ...boundaryResult.patch,
      warnings: boundaryResult.warnings,
    });
    workingDocument = applyPatchToDocumentView(workingDocument, boundaryResult.patch, false);
    currentDomainId = workingDocument.graph.domains[currentDomainId]?.parentDomainId;
  }

  return patch;
};

export const createNodeDomainPlacementPatch = (
  document: OntologyDocumentState,
  input: CreateNodeDomainPlacementPatchInput
): OntologyInteractionPatch => {
  if (!input.domainId) {
    return {};
  }

  const config = resolveConfig(input.config);
  const placement = resolveNodePlacementInDomain(document, input.nodeId, input.domainId, config);
  const nodePatch: OntologyInteractionPatch = {
    nodeViews: {
      [input.nodeId]: {
        position: placement.position,
      },
    },
    warnings: placement.warnings,
  };
  const workingDocument = applyPatchToDocumentView(document, nodePatch, false);

  return mergePatch(
    nodePatch,
    updateDomainBoundaryCascade(workingDocument, input.domainId, input.config)
  );
};

export const commitNodeDrag = (
  document: OntologyDocumentState,
  input: CommitNodeDragInput
): OntologyInteractionPatch => {
  const node = document.graph.nodes[input.nodeId];
  const nodeView = document.view.nodeViews[input.nodeId];
  if (!node || !nodeView) {
    return {
      warnings: [`Node view "${input.nodeId}" does not exist.`],
    };
  }

  const domainId = input.domainId ?? node.domainId;
  const absoluteResult = projectReactFlowPositionToAbsolute(document, {
    position: input.reactFlowPosition,
    parentDomainId: domainId,
  });
  const constrainedResult = constrainNodePositionToDomain(document, {
    nodeId: input.nodeId,
    position: absoluteResult.position,
    domainId,
    config: input.config,
  });
  const nodePatch: OntologyInteractionPatch = {
    nodeViews: {
      [input.nodeId]: {
        position: constrainedResult.position,
      },
    },
    warnings: [
      ...absoluteResult.warnings,
      ...constrainedResult.warnings,
    ],
  };

  if (!domainId) {
    return nodePatch;
  }

  const workingDocument = applyPatchToDocumentView(document, nodePatch, false);
  return mergePatch(
    nodePatch,
    updateDomainBoundaryCascade(workingDocument, domainId, input.config)
  );
};

export const commitDomainDrag = (
  document: OntologyDocumentState,
  input: CommitDomainDragInput
): OntologyInteractionPatch => {
  const domain = document.graph.domains[input.domainId];
  const domainView = document.view.domainViews[input.domainId];
  if (!domain || !domainView) {
    return {
      warnings: [`Domain view "${input.domainId}" does not exist.`],
    };
  }

  const parentDomainId = input.parentDomainId ?? domain.parentDomainId;
  const absoluteResult = projectReactFlowPositionToAbsolute(document, {
    position: input.reactFlowPosition,
    parentDomainId,
  });
  const nextPosition = absoluteResult.position;
  const offset = {
    x: nextPosition.x - safeNumber(domainView.position.x, 0),
    y: nextPosition.y - safeNumber(domainView.position.y, 0),
  };
  const descendants = collectDomainDescendantViewIds(document, input.domainId);
  const nodeViews: Record<string, Partial<OntologyNodeViewState>> = {};
  const domainViews: Record<string, Partial<OntologyDomainViewState>> = {
    [input.domainId]: {
      position: nextPosition,
    },
  };

  for (const nodeId of descendants.nodeIds) {
    const view = document.view.nodeViews[nodeId];
    if (!view) {
      continue;
    }

    nodeViews[nodeId] = {
      position: {
        x: safeNumber(view.position.x, 0) + offset.x,
        y: safeNumber(view.position.y, 0) + offset.y,
      },
    };
  }

  for (const childDomainId of descendants.domainIds) {
    const view = document.view.domainViews[childDomainId];
    if (!view) {
      continue;
    }

    domainViews[childDomainId] = {
      position: {
        x: safeNumber(view.position.x, 0) + offset.x,
        y: safeNumber(view.position.y, 0) + offset.y,
      },
    };
  }

  const dragPatch: OntologyInteractionPatch = {
    nodeViews,
    domainViews,
    warnings: [
      ...absoluteResult.warnings,
      ...descendants.warnings,
    ],
  };

  if (!parentDomainId) {
    return dragPatch;
  }

  const workingDocument = applyPatchToDocumentView(document, dragPatch, false);
  return mergePatch(
    dragPatch,
    updateDomainBoundaryCascade(workingDocument, parentDomainId, input.config)
  );
};

export const commitNodeResize = (
  document: OntologyDocumentState,
  input: CommitNodeResizeInput
): OntologyInteractionPatch => {
  const node = document.graph.nodes[input.nodeId];
  const nodeView = document.view.nodeViews[input.nodeId];
  if (!node || !nodeView) {
    return {
      warnings: [`Node view "${input.nodeId}" does not exist.`],
    };
  }

  const nodePatch: Partial<OntologyNodeViewState> = {
    width: safeNumber(input.width, nodeView.width),
    height: safeNumber(input.height, nodeView.height),
  };

  if (input.expanded !== undefined) {
    nodePatch.expanded = input.expanded;
  }

  if (input.customExpandedSize) {
    nodePatch.customExpandedSize = {
      width: safeNumber(input.customExpandedSize.width, nodePatch.width),
      height: safeNumber(input.customExpandedSize.height, nodePatch.height),
    };
  }

  if (input.position) {
    const constrainedResult = constrainNodePositionToDomain(document, {
      nodeId: input.nodeId,
      position: input.position,
      domainId: node.domainId,
      config: input.config,
    });
    nodePatch.position = constrainedResult.position;
  }

  const resizePatch: OntologyInteractionPatch = {
    nodeViews: {
      [input.nodeId]: nodePatch,
    },
  };

  if (!node.domainId) {
    return resizePatch;
  }

  const workingDocument = applyPatchToDocumentView(document, resizePatch, false);
  return mergePatch(
    resizePatch,
    updateDomainBoundaryCascade(workingDocument, node.domainId, input.config)
  );
};

export const commitDomainResize = (
  document: OntologyDocumentState,
  input: CommitDomainResizeInput
): OntologyInteractionPatch => {
  const domain = document.graph.domains[input.domainId];
  const domainView = document.view.domainViews[input.domainId];
  if (!domain || !domainView) {
    return {
      warnings: [`Domain view "${input.domainId}" does not exist.`],
    };
  }

  const domainPatch: Partial<OntologyDomainViewState> = {
    position: input.position
      ? safePosition(input.position)
      : domainView.position,
    width: safeNumber(input.width, domainView.width),
    height: safeNumber(input.height, domainView.height),
    collapsed: input.collapsed ?? domainView.collapsed,
  };
  const resizePatch: OntologyInteractionPatch = {
    domainViews: {
      [input.domainId]: domainPatch,
    },
  };

  if (!domain.parentDomainId) {
    return resizePatch;
  }

  const workingDocument = applyPatchToDocumentView(document, resizePatch, false);
  return mergePatch(
    resizePatch,
    updateDomainBoundaryCascade(workingDocument, domain.parentDomainId, input.config)
  );
};
