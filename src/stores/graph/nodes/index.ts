import { create } from 'zustand';
import { NodeOperationsSlice, GroupOperationsSlice, ConstraintOperationsSlice, GroupBoundaryOperationsSlice, LayoutOperationsSlice } from './types';
import { createBasicOperationsSlice } from './basicOperations';
import { createGroupOperationsSlice } from './groupOperations';
import { createConstraintOperationsSlice } from './constraintOperations';
import { createGroupBoundaryOperationsSlice } from './groupBoundaryOperations';
import { ConversionOperationsSlice, createConversionOperationsSlice } from './conversionOperations';

export type NodesSlice = NodeOperationsSlice &
                        GroupOperationsSlice &
                        ConstraintOperationsSlice &
                        GroupBoundaryOperationsSlice &
                        ConversionOperationsSlice &
                        LayoutOperationsSlice;

export const createNodesSlice = (set: any, get: any): NodesSlice => {
  const basicOperations = createBasicOperationsSlice(set, get);
  return {
    ...basicOperations,
    ...createGroupOperationsSlice(set, get),
    ...createConstraintOperationsSlice(set, get),
    ...createGroupBoundaryOperationsSlice(set, get),
    ...createConversionOperationsSlice(set, get),
  } as NodesSlice;
};