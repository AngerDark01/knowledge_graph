export type OntologyNodeType =
  | 'Class'
  | 'Concept'
  | 'Function'
  | 'Component'
  | 'Information'
  | 'Interface'
  | 'Constraint';

export type OntologyFieldCategory =
  | 'attribute'
  | 'rule'
  | 'constraint'
  | 'interface'
  | 'behavior';

export type OntologyField = {
  id: string;
  name: string;
  value?: string;
  dataType?: string;
  category: OntologyFieldCategory;
};

export type OntologyNode = {
  id: string;
  name: string;
  type: OntologyNodeType;
  description?: string;
  fields: OntologyField[];
  tags: string[];
  domainId?: string;
  subgraphId?: string;
  metadata?: Record<string, unknown>;
};
