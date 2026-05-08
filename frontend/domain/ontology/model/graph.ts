import { ONTOLOGY_SCHEMA_VERSION } from './schemaVersion';
import type { OntologyDomain } from './domain';
import type { OntologyEdge } from './edge';
import type { OntologyNode } from './node';
import type { OntologySubgraph } from './subgraph';

export type OntologyGraph = {
  id: string;
  name: string;
  schemaVersion: number;
  nodes: Record<string, OntologyNode>;
  edges: Record<string, OntologyEdge>;
  domains: Record<string, OntologyDomain>;
  subgraphs: Record<string, OntologySubgraph>;
  metadata?: Record<string, unknown>;
};

export type CreateOntologyGraphInput = {
  id: string;
  name: string;
  nodes?: Record<string, OntologyNode>;
  edges?: Record<string, OntologyEdge>;
  domains?: Record<string, OntologyDomain>;
  subgraphs?: Record<string, OntologySubgraph>;
  metadata?: Record<string, unknown>;
};

export const createOntologyGraph = (
  input: CreateOntologyGraphInput
): OntologyGraph => ({
  id: input.id,
  name: input.name,
  schemaVersion: ONTOLOGY_SCHEMA_VERSION,
  nodes: input.nodes ?? {},
  edges: input.edges ?? {},
  domains: input.domains ?? {},
  subgraphs: input.subgraphs ?? {},
  metadata: input.metadata,
});
