export type OntologySubgraph = {
  id: string;
  name: string;
  rootNodeId?: string;
  domainId?: string;
  nodeIds: string[];
  edgeIds: string[];
  metadata?: Record<string, unknown>;
};
