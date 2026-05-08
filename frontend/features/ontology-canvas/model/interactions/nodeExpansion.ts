export type NodeExpansionSize = {
  width: number;
  height: number;
};

export type ExpandableNodeLike = {
  isExpanded?: boolean;
  customExpandedSize?: NodeExpansionSize;
  width?: number;
  height?: number;
  data?: {
    isExpanded?: boolean;
  };
};

export type NodeExpansionConfig = {
  collapsedSize: NodeExpansionSize;
  expandedSize: NodeExpansionSize;
};

export type NodeExpansionPatch = {
  isExpanded: boolean;
  width: number;
  height: number;
  data: {
    isExpanded: boolean;
  };
};

export const resolveNodeExpandedState = (
  node: ExpandableNodeLike | null | undefined,
  fallback = false
): boolean => {
  return Boolean(node?.isExpanded ?? node?.data?.isExpanded ?? fallback);
};

export const createNodeExpansionPatch = (
  node: ExpandableNodeLike | null | undefined,
  nextExpanded: boolean,
  config: NodeExpansionConfig
): NodeExpansionPatch => {
  const targetSize = nextExpanded
    ? node?.customExpandedSize ?? config.expandedSize
    : config.collapsedSize;

  return {
    isExpanded: nextExpanded,
    width: targetSize.width,
    height: targetSize.height,
    data: {
      isExpanded: nextExpanded,
    },
  };
};

export const getCustomExpandedSizeToPersist = (
  node: ExpandableNodeLike | null | undefined,
  config: NodeExpansionConfig
): NodeExpansionSize | null => {
  if (!node) {
    return null;
  }

  if (!resolveNodeExpandedState(node)) {
    return null;
  }

  const currentWidth = node.width;
  const currentHeight = node.height;

  if (
    typeof currentWidth !== 'number' ||
    typeof currentHeight !== 'number' ||
    !Number.isFinite(currentWidth) ||
    !Number.isFinite(currentHeight)
  ) {
    return null;
  }

  const isCollapsedSize =
    currentWidth === config.collapsedSize.width &&
    currentHeight === config.collapsedSize.height;
  const isDefaultExpandedSize =
    currentWidth === config.expandedSize.width &&
    currentHeight === config.expandedSize.height;

  if (isCollapsedSize || isDefaultExpandedSize) {
    return null;
  }

  if (
    node.customExpandedSize &&
    node.customExpandedSize.width === currentWidth &&
    node.customExpandedSize.height === currentHeight
  ) {
    return null;
  }

  return {
    width: currentWidth,
    height: currentHeight,
  };
};
