/**
 * 节点操作 Slice 入口
 *
 * 统一的节点操作管理，基于新架构：
 * - BaseNode 统一数据模型
 * - viewMode 控制视图模式
 * - parentId/childrenIds 构建层级关系
 */

import { NodeOperationsSlice, PositionOperationsSlice } from './types';
import { createNodeOperationsSlice } from './nodeOperations';
import { createPositionOperationsSlice } from './positionOperations';
import { ViewModeOperationsSlice, createViewModeOperationsSlice } from './viewModeOperations';
import { HierarchyOperationsSlice, createHierarchyOperationsSlice } from './hierarchyOperations';

/**
 * 完整的节点操作接口
 */
export type NodesSlice = NodeOperationsSlice &
                        PositionOperationsSlice &
                        ViewModeOperationsSlice &
                        HierarchyOperationsSlice;

/**
 * 创建节点操作 Slice
 */
export const createNodesSlice = (set: any, get: any): NodesSlice => ({
  ...createNodeOperationsSlice(set, get),
  ...createPositionOperationsSlice(set, get),
  ...createViewModeOperationsSlice(set, get),
  ...createHierarchyOperationsSlice(set, get),
});