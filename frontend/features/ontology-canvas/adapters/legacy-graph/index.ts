export {
  createOntologyDocumentFromLegacyGraph,
  isLegacyOntologyClassDisplay,
  isLegacyOntologyDomainDisplay,
  projectOntologyDomainToLegacyGroup,
  projectOntologyEdgeToLegacyEdge,
  projectOntologyNodeToLegacyNode,
} from './documentBridge';

export type {
  LegacyEdgeProjectionOptions,
  LegacyGraphDocumentInput,
  LegacyOntologyDisplayNode,
  LegacyProjectionOptions,
} from './documentBridge';
