export type OntologyRelationDirection =
  | 'unidirectional'
  | 'bidirectional'
  | 'undirected';

export type OntologyEdge = {
  id: string;
  source: string;
  target: string;
  relation: string;
  direction: OntologyRelationDirection;
  domainId?: string;
  metadata?: Record<string, unknown>;
};
