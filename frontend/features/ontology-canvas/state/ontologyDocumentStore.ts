import { create } from 'zustand';
import {
  createOntologyDocumentState,
  deleteOntologyElementsInDocument,
  updateOntologyDomainViewInDocument,
  updateOntologyNodeViewInDocument,
  updateOntologyViewportInDocument,
  type DeleteOntologyElementsInDocumentInput,
  type OntologyDocumentCommandResult,
  type OntologyDocumentState,
  type UpdateOntologyDomainViewInDocumentInput,
  type UpdateOntologyNodeViewInDocumentInput,
  type UpdateOntologyViewportInDocumentInput,
} from '../model/document';
import {
  applyOntologyInteractionPatch,
  type OntologyInteractionPatch,
} from '../model/interactions';

export type OntologyDocumentSource = {
  canvasId: string;
  reason?: string;
};

type OntologyDocumentStoreState = {
  document: OntologyDocumentState;
  sourceCanvasId: string | null;
  hydrated: boolean;
  replaceDocument: (
    document: OntologyDocumentState,
    source?: OntologyDocumentSource
  ) => void;
  applyCommandResult: (
    result: OntologyDocumentCommandResult,
    source?: OntologyDocumentSource
  ) => boolean;
  applyInteractionPatch: (
    patch: OntologyInteractionPatch,
    source?: OntologyDocumentSource
  ) => OntologyDocumentState | null;
  updateNodeView: (
    input: UpdateOntologyNodeViewInDocumentInput,
    source?: OntologyDocumentSource
  ) => void;
  updateDomainView: (
    input: UpdateOntologyDomainViewInDocumentInput,
    source?: OntologyDocumentSource
  ) => void;
  updateViewport: (
    input: UpdateOntologyViewportInDocumentInput,
    source?: OntologyDocumentSource
  ) => void;
  deleteElements: (
    input: DeleteOntologyElementsInDocumentInput,
    source?: OntologyDocumentSource
  ) => boolean;
};

const createEmptyDocument = (): OntologyDocumentState =>
  createOntologyDocumentState({
    id: 'current-canvas',
    name: 'Current Canvas',
  });

export const useOntologyDocumentStore = create<OntologyDocumentStoreState>()((set, get) => ({
  document: createEmptyDocument(),
  sourceCanvasId: null,
  hydrated: false,

  replaceDocument: (document, source) => {
    set({
      document,
      sourceCanvasId: source?.canvasId ?? null,
      hydrated: true,
    });
  },

  applyCommandResult: (result, source) => {
    if (!result.changed) {
      return false;
    }

    set((state) => ({
      document: result.document,
      sourceCanvasId: source?.canvasId ?? state.sourceCanvasId,
      hydrated: true,
    }));
    return true;
  },

  applyInteractionPatch: (patch, source) => {
    const currentDocument = get().document;
    const nextDocument = applyOntologyInteractionPatch(currentDocument, patch);
    if (nextDocument === currentDocument) {
      return null;
    }

    set((state) => ({
      document: nextDocument,
      sourceCanvasId: source?.canvasId ?? state.sourceCanvasId,
      hydrated: true,
    }));
    return nextDocument;
  },

  updateNodeView: (input, source) => {
    set((state) => ({
      document: updateOntologyNodeViewInDocument(state.document, input),
      sourceCanvasId: source?.canvasId ?? state.sourceCanvasId,
      hydrated: true,
    }));
  },

  updateDomainView: (input, source) => {
    set((state) => ({
      document: updateOntologyDomainViewInDocument(state.document, input),
      sourceCanvasId: source?.canvasId ?? state.sourceCanvasId,
      hydrated: true,
    }));
  },

  updateViewport: (input, source) => {
    set((state) => ({
      document: updateOntologyViewportInDocument(state.document, input),
      sourceCanvasId: source?.canvasId ?? state.sourceCanvasId,
      hydrated: true,
    }));
  },

  deleteElements: (input, source) => {
    const currentDocument = get().document;
    const result = deleteOntologyElementsInDocument(currentDocument, input);
    if (!result.changed) {
      return false;
    }

    set((state) => ({
      document: result.document,
      sourceCanvasId: source?.canvasId ?? state.sourceCanvasId,
      hydrated: true,
    }));
    return true;
  },
}));
