import {
  type GraphStoreGet,
  type GraphStoreSet,
  type NodeOperationsSlice,
  type GroupOperationsSlice,
  type ConstraintOperationsSlice,
  type GroupBoundaryOperationsSlice,
  type LayoutOperationsSlice
} from './types';
import { createBasicOperationsSlice } from './basicOperations';
import { createGroupOperationsSlice } from './groupOperations';
import { createConstraintOperationsSlice } from './constraintOperations';
import { createGroupBoundaryOperationsSlice } from './groupBoundaryOperations';

export type NodesSlice = NodeOperationsSlice &
                        GroupOperationsSlice &
                        ConstraintOperationsSlice &
                        GroupBoundaryOperationsSlice &
                        LayoutOperationsSlice;

export const createNodesSlice = (set: GraphStoreSet, get: GraphStoreGet): NodesSlice => {
  const basicOperations = createBasicOperationsSlice(set, get);
  return {
    ...basicOperations,
    ...createGroupOperationsSlice(set),
    ...createConstraintOperationsSlice(set),
    ...createGroupBoundaryOperationsSlice(set),
  } as NodesSlice;
};
