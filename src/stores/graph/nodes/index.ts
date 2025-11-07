import { create } from 'zustand';
import { NodeOperationsSlice, GroupOperationsSlice, ConstraintOperationsSlice, GroupBoundaryOperationsSlice } from './types';
import { createBasicOperationsSlice } from './basicOperations';
import { createGroupOperationsSlice } from './groupOperations';
import { createConstraintOperationsSlice } from './constraintOperations';
import { createGroupBoundaryOperationsSlice } from './groupBoundaryOperations';

// 新增：优雅的统一操作
import { ViewModeOperationsSlice, createViewModeOperationsSlice } from './viewModeOperations';
import { HierarchyOperationsSlice, createHierarchyOperationsSlice } from './hierarchyOperations';

export type NodesSlice = NodeOperationsSlice &
                        GroupOperationsSlice &
                        ConstraintOperationsSlice &
                        GroupBoundaryOperationsSlice &
                        ViewModeOperationsSlice &    // 新增：视图模式操作
                        HierarchyOperationsSlice;    // 新增：层级操作

export const createNodesSlice = (set: any, get: any): NodesSlice => ({
  // 原有的操作（保持向后兼容）
  ...createBasicOperationsSlice(set, get),
  ...createGroupOperationsSlice(set, get),
  ...createConstraintOperationsSlice(set, get),
  ...createGroupBoundaryOperationsSlice(set, get),

  // 新增：优雅的统一操作
  ...createViewModeOperationsSlice(set, get),
  ...createHierarchyOperationsSlice(set, get),
});