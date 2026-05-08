import { BlockEnum, type Edge, type Group, type Node } from '../../../../types/graph/models';

export type LegacyGraphNode = Node | Group;

export type LegacyLayoutNodePosition = {
  x: number;
  y: number;
  width?: number;
  height?: number;
  boundary?: Group['boundary'];
};

export type LegacyLayoutEdgeUpdate = {
  sourceHandle?: string;
  targetHandle?: string;
};

export type LegacyLayoutNodeUpdate = Partial<Node | Group> & {
  boundary?: Group['boundary'];
  style?: {
    width?: number;
    height?: number;
  };
};

export type LegacyLayoutEdgePatch = Partial<Edge>;

export const CANVAS_LAYOUT_STRATEGY = 'elk-layout';
export const GROUP_LAYOUT_STRATEGY = 'elk-group-layout';

export const createCanvasLayoutOptions = () => ({
  animate: true,
  strategy: CANVAS_LAYOUT_STRATEGY,
});

export const createGroupLayoutOptions = (groupId: string) => ({
  animate: true,
  strategy: GROUP_LAYOUT_STRATEGY,
  groupId,
});

export const isGroupNode = (
  node: LegacyGraphNode | undefined
): node is Group => {
  return node?.type === BlockEnum.GROUP;
};

export const getDirectGroupChildren = (
  nodes: readonly LegacyGraphNode[],
  groupId: string
): LegacyGraphNode[] => {
  return nodes.filter(node => node.groupId === groupId);
};

export const createLayoutNodeUpdate = (
  positionData: LegacyLayoutNodePosition,
  includeStyleSize = false
): LegacyLayoutNodeUpdate => {
  const update: LegacyLayoutNodeUpdate = {
    position: {
      x: positionData.x,
      y: positionData.y,
    },
  };

  if (positionData.width !== undefined) {
    update.width = positionData.width;
  }

  if (positionData.height !== undefined) {
    update.height = positionData.height;
  }

  if (positionData.boundary !== undefined) {
    update.boundary = positionData.boundary;
  }

  if (
    includeStyleSize &&
    (positionData.width !== undefined || positionData.height !== undefined)
  ) {
    update.style = {
      ...(positionData.width !== undefined ? { width: positionData.width } : {}),
      ...(positionData.height !== undefined ? { height: positionData.height } : {}),
    };
  }

  return update;
};

export const createLayoutEdgeUpdate = (
  edgeData: LegacyLayoutEdgeUpdate
): LegacyLayoutEdgePatch => {
  return {
    sourceHandle: edgeData.sourceHandle,
    targetHandle: edgeData.targetHandle,
  };
};
