export type OntologyDomain = {
  id: string;
  name: string;
  nodeIds: string[];
  domainIds: string[];
  parentDomainId?: string;
  collapsed: boolean;
  metadata?: Record<string, unknown>;
};
