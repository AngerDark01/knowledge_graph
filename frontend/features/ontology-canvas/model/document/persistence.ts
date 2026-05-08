import type { PersistedOntologyCanvas } from '@/types/workspace/ontologyCanvas';
import {
  createOntologyDocumentState,
  type OntologyDocumentState,
  type OntologyViewState,
} from './ontologyDocument';

const resolveFallbackDocumentName = (
  snapshot: PersistedOntologyCanvas,
  fallback: { id: string; name: string }
): string => snapshot.graph.name || fallback.name;

const resolveFallbackDocumentId = (
  snapshot: PersistedOntologyCanvas,
  fallback: { id: string; name: string }
): string => snapshot.graph.id || fallback.id;

const createViewFallback = (
  snapshot: PersistedOntologyCanvas,
  fallbackViewport?: OntologyViewState['viewport']
): Partial<OntologyViewState> => ({
  nodeViews: snapshot.view.nodeViews,
  domainViews: snapshot.view.domainViews,
  edgeViews: snapshot.view.edgeViews,
  viewport: snapshot.view.viewport ?? fallbackViewport,
  lod: snapshot.view.lod,
  edgeVisibility: snapshot.view.edgeVisibility,
});

export const createPersistedOntologyCanvas = (
  document: OntologyDocumentState,
  savedAt: Date = new Date()
): PersistedOntologyCanvas => ({
  persistenceVersion: 1,
  graph: document.graph,
  view: document.view,
  revision: document.revision,
  savedAt: savedAt.toISOString(),
});

export const restoreOntologyDocumentFromPersistedCanvas = (
  snapshot: PersistedOntologyCanvas,
  fallback: {
    id: string;
    name: string;
    viewport?: OntologyViewState['viewport'];
  }
): OntologyDocumentState => createOntologyDocumentState({
  id: resolveFallbackDocumentId(snapshot, fallback),
  name: resolveFallbackDocumentName(snapshot, fallback),
  graph: {
    ...snapshot.graph,
    id: resolveFallbackDocumentId(snapshot, fallback),
    name: resolveFallbackDocumentName(snapshot, fallback),
  },
  view: createViewFallback(snapshot, fallback.viewport),
  revision: snapshot.revision,
});
