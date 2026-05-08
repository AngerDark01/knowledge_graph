import type {
  OntologyDocumentState,
} from '../document/ontologyDocument';
import type {
  OntologyEdge,
  OntologyGraph,
} from '@/domain/ontology';

export type OntologyDomainViewTone =
  | 'node'
  | 'domain'
  | 'relationship'
  | 'subcanvas';

export type OntologyDomainViewMetric = {
  id: string;
  label: string;
  value: number;
  iconLabel: string;
  tone: OntologyDomainViewTone;
};

export type OntologyDomainViewPreviewItem = {
  id: string;
  title: string;
  typeLabel: string;
  tone: OntologyDomainViewTone;
};

export type OntologyDomainViewCounts = {
  childNodes: number;
  childDomains: number;
  relationships: number;
};

export type OntologyDomainViewModel = {
  id: string;
  title: string;
  typeLabel: string;
  description?: string;
  collapsed: boolean;
  parentDomainId?: string;
  counts: OntologyDomainViewCounts;
  metrics: OntologyDomainViewMetric[];
  previewItems: OntologyDomainViewPreviewItem[];
  hasInternalSpace: boolean;
  internalSpaceLabel: string;
};

const getStringMetadata = (
  metadata: Record<string, unknown> | undefined,
  key: string
): string | undefined => {
  const value = metadata?.[key];
  return typeof value === 'string' ? value : undefined;
};

const getDomainRelationshipCount = (
  graph: OntologyGraph,
  domainId: string
): number => {
  const domain = graph.domains[domainId];
  if (!domain) {
    return 0;
  }

  const directNodeIds = new Set(domain.nodeIds);
  const directDomainIds = new Set(domain.domainIds);
  const countedEdges = new Set<string>();

  const addEdge = (edge: OntologyEdge) => {
    countedEdges.add(edge.id);
  };

  for (const edge of Object.values(graph.edges)) {
    const sourceNode = graph.nodes[edge.source];
    const targetNode = graph.nodes[edge.target];
    const sourceDomainId = sourceNode?.domainId;
    const targetDomainId = targetNode?.domainId;

    if (
      edge.domainId === domainId ||
      directNodeIds.has(edge.source) ||
      directNodeIds.has(edge.target) ||
      sourceDomainId === domainId ||
      targetDomainId === domainId ||
      Boolean(sourceDomainId && directDomainIds.has(sourceDomainId)) ||
      Boolean(targetDomainId && directDomainIds.has(targetDomainId))
    ) {
      addEdge(edge);
    }
  }

  return countedEdges.size;
};

const createPreviewItems = (
  graph: OntologyGraph,
  domainId: string,
  limit: number
): OntologyDomainViewPreviewItem[] => {
  const domain = graph.domains[domainId];
  if (!domain) {
    return [];
  }

  const nodeItems = domain.nodeIds
    .map(nodeId => graph.nodes[nodeId])
    .filter(Boolean)
    .map(node => ({
      id: node.id,
      title: node.name,
      typeLabel: node.type,
      tone: 'node' as const,
    }));
  const domainItems = domain.domainIds
    .map(childDomainId => graph.domains[childDomainId])
    .filter(Boolean)
    .map(childDomain => ({
      id: childDomain.id,
      title: childDomain.name,
      typeLabel: 'Domain',
      tone: 'domain' as const,
    }));

  return [...nodeItems, ...domainItems].slice(0, limit);
};

const createMetrics = (
  counts: OntologyDomainViewCounts
): OntologyDomainViewMetric[] => [
  {
    id: 'childNodes',
    label: 'Nodes',
    value: counts.childNodes,
    iconLabel: 'N',
    tone: 'node',
  },
  {
    id: 'childDomains',
    label: 'Domains',
    value: counts.childDomains,
    iconLabel: 'D',
    tone: 'domain',
  },
  {
    id: 'relationships',
    label: 'Relations',
    value: counts.relationships,
    iconLabel: 'L',
    tone: 'relationship',
  },
];

export const buildOntologyDomainViewModel = (
  document: OntologyDocumentState,
  domainId: string
): OntologyDomainViewModel | undefined => {
  const domain = document.graph.domains[domainId];
  const view = document.view.domainViews[domainId];
  if (!domain || !view) {
    return undefined;
  }

  const counts: OntologyDomainViewCounts = {
    childNodes: domain.nodeIds.length,
    childDomains: domain.domainIds.length,
    relationships: getDomainRelationshipCount(document.graph, domain.id),
  };
  const description = getStringMetadata(domain.metadata, 'legacySummary') ??
    getStringMetadata(domain.metadata, 'legacyContent');

  return {
    id: domain.id,
    title: domain.name,
    typeLabel: 'Domain',
    description,
    collapsed: view.collapsed,
    parentDomainId: domain.parentDomainId,
    counts,
    metrics: createMetrics(counts),
    previewItems: createPreviewItems(document.graph, domain.id, 5),
    hasInternalSpace: true,
    internalSpaceLabel: `${domain.name} internal space`,
  };
};
