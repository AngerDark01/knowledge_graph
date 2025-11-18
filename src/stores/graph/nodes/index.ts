import { create } from 'zustand';
import {
  NodeOperationsSlice,
  GroupOperationsSlice,
  ConstraintOperationsSlice,
  GroupBoundaryOperationsSlice,
  ChildrenOperationsSlice,
  ContainerBoundaryOperationsSlice,
} from './types';
import { createBasicOperationsSlice } from './basicOperations';
import { createGroupOperationsSlice } from './groupOperations';
import { createConstraintOperationsSlice } from './constraintOperations';
import { createGroupBoundaryOperationsSlice } from './groupBoundaryOperations';
import { createChildrenOperationsSlice } from './childrenOperations';
import { createContainerBoundaryOperationsSlice } from './containerBoundaryOperations';

export type NodesSlice = NodeOperationsSlice &
                        GroupOperationsSlice &
                        ConstraintOperationsSlice &
                        GroupBoundaryOperationsSlice &
                        ChildrenOperationsSlice &
                        ContainerBoundaryOperationsSlice;

export const createNodesSlice = (set: any, get: any): NodesSlice => ({
  ...createBasicOperationsSlice(set, get),
  ...createGroupOperationsSlice(set, get),
  ...createConstraintOperationsSlice(set, get),
  ...createGroupBoundaryOperationsSlice(set, get),
  ...createChildrenOperationsSlice(set, get),
  ...createContainerBoundaryOperationsSlice(set, get),
});