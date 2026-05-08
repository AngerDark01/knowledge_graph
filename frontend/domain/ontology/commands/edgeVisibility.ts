export type EdgeVisibilityMode = 'all' | 'none' | 'custom';

export type EdgeVisibility = {
  mode: EdgeVisibilityMode;
  ids: string[];
};

export type EdgeIdentity = {
  id: string;
};

const uniqueIds = (ids: readonly string[]): string[] => Array.from(new Set(ids));

const filterKnownEdgeIds = <TEdge extends EdgeIdentity>(
  ids: readonly string[],
  edges?: readonly TEdge[]
): string[] => {
  if (!edges) {
    return uniqueIds(ids);
  }

  const knownEdgeIds = new Set(edges.map(edge => edge.id));
  return uniqueIds(ids).filter(id => knownEdgeIds.has(id));
};

export const createAllEdgeVisibility = (): EdgeVisibility => ({
  mode: 'all',
  ids: [],
});

export const createNoEdgeVisibility = (): EdgeVisibility => ({
  mode: 'none',
  ids: [],
});

export const createCustomEdgeVisibility = <TEdge extends EdgeIdentity>(
  ids: readonly string[],
  edges?: readonly TEdge[]
): EdgeVisibility => ({
  mode: 'custom',
  ids: filterKnownEdgeIds(ids, edges),
});

export const normalizeEdgeVisibility = <TEdge extends EdgeIdentity>(
  visibility?: EdgeVisibility,
  edges?: readonly TEdge[]
): EdgeVisibility => {
  if (!visibility) {
    return createAllEdgeVisibility();
  }

  if (visibility.mode === 'custom') {
    return createCustomEdgeVisibility(visibility.ids, edges);
  }

  return {
    mode: visibility.mode,
    ids: [],
  };
};

export const getVisibleEdgeIds = <TEdge extends EdgeIdentity>(
  edges: readonly TEdge[],
  visibility?: EdgeVisibility
): string[] => {
  const normalizedVisibility = normalizeEdgeVisibility(visibility, edges);

  if (normalizedVisibility.mode === 'all') {
    return edges.map(edge => edge.id);
  }

  if (normalizedVisibility.mode === 'none') {
    return [];
  }

  return normalizedVisibility.ids;
};

export const isEdgeVisible = (
  edgeId: string,
  visibility?: EdgeVisibility
): boolean => {
  if (!visibility || visibility.mode === 'all') {
    return true;
  }

  if (visibility.mode === 'none') {
    return false;
  }

  return visibility.ids.includes(edgeId);
};

export const addEdgeToVisibility = (
  visibility: EdgeVisibility | undefined,
  edgeId: string
): EdgeVisibility => {
  const normalizedVisibility = normalizeEdgeVisibility(visibility);

  if (normalizedVisibility.mode !== 'custom') {
    return normalizedVisibility;
  }

  return createCustomEdgeVisibility([...normalizedVisibility.ids, edgeId]);
};

export const removeEdgeIdsFromVisibility = (
  visibility: EdgeVisibility | undefined,
  edgeIds: Iterable<string>
): EdgeVisibility => {
  const normalizedVisibility = normalizeEdgeVisibility(visibility);

  if (normalizedVisibility.mode !== 'custom') {
    return normalizedVisibility;
  }

  const removedEdgeIds = new Set(edgeIds);
  return createCustomEdgeVisibility(
    normalizedVisibility.ids.filter(edgeId => !removedEdgeIds.has(edgeId))
  );
};

export const toggleEdgeInVisibility = <TEdge extends EdgeIdentity>(
  edgeId: string,
  edges: readonly TEdge[],
  visibility?: EdgeVisibility
): EdgeVisibility => {
  const currentIds = getVisibleEdgeIds(edges, visibility);
  const nextIds = currentIds.includes(edgeId)
    ? currentIds.filter(currentId => currentId !== edgeId)
    : [...currentIds, edgeId];

  return createCustomEdgeVisibility(nextIds, edges);
};
