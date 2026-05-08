import { Node, Group, BlockEnum } from '@/types/graph/models';
import { NODE_SIZES } from '@/config/graph.config';
import { removeEdgesConnectedToNodesWithVisibility } from '@/domain/ontology';
import {
  type GraphNode,
  type GraphStoreGet,
  type GraphStoreSet,
  type LayoutOperationsSlice,
  NodeOperationsSlice,
  safePosition,
  safeNumber,
  constrainNodeToGroupBoundary,
  isGraphBoundary,
  toRecord
} from './types';

export const createBasicOperationsSlice = (
  set: GraphStoreSet,
  get: GraphStoreGet
): NodeOperationsSlice & LayoutOperationsSlice => {
  return {
    nodes: [],
    selectedNodeId: null,
    selectedEdgeId: null,
    isLayoutMode: false,
    
    setSelectedNodeId: (id) => {
      set({ selectedNodeId: id });
    },
    
    setIsLayoutMode: (isLayoutMode: boolean) => {
      set({ isLayoutMode });
    },

    setSelectedEdgeId: (id) => {
      set({ selectedEdgeId: id });
    },
    
    addNode: (node) => {
      const state = get();

      // 🔧 防重复检查：如果节点ID已存在，拒绝添加
      const existing = state.nodes.find((n: Node | Group) => n.id === node.id);
      if (existing) {
        console.error(`⚠️ 尝试添加重复节点: ${node.id}`);
        return state;  // 不添加，直接返回当前状态
      }

      // 🔧 根据节点类型确定默认尺寸
      let defaultWidth: number;
      let defaultHeight: number;

      if (node.type === BlockEnum.NODE) {
        // 普通节点使用 NOTE 配置的默认尺寸
        defaultWidth = NODE_SIZES.NOTE.DEFAULT_WIDTH;
        defaultHeight = NODE_SIZES.NOTE.DEFAULT_HEIGHT;
      } else if (node.type === BlockEnum.GROUP) {
        // 群组节点使用 GROUP 配置的默认尺寸
        defaultWidth = NODE_SIZES.GROUP.DEFAULT_WIDTH;
        defaultHeight = NODE_SIZES.GROUP.DEFAULT_HEIGHT;
      } else {
        // 默认值
        defaultWidth = 150;
        defaultHeight = 100;
      }

      // 验证并修复节点位置和尺寸
      const safeNode: GraphNode = {
        ...node,
        position: safePosition(node.position),
        width: safeNumber(node.width, defaultWidth),
        height: safeNumber(node.height, defaultHeight)
      };
      
      // 如果节点属于群组，确保位置在群组内
      // 但在布局模式下跳过此约束逻辑，以保持布局算法计算的相对位置
      if ('groupId' in safeNode && safeNode.groupId && !state.isLayoutMode) {
        const group = state.nodes.find((n: Node | Group) =>
          n.id === safeNode.groupId && n.type === BlockEnum.GROUP
        ) as Group | undefined;

        if (group) {
          const constrainedPos = constrainNodeToGroupBoundary(safeNode, group);
          safeNode.position = constrainedPos;
        }
      }
      
      // 添加历史记录快照
      const newState = { nodes: [...state.nodes, safeNode] };
      set(newState);
      get().addHistorySnapshot?.();
      return newState;
    },
    
    updateNode: (id, updates) => {
      const state = get();
      
      let validationError: string | undefined = undefined;
      if (updates.title !== undefined && updates.title.trim() === '') {
        validationError = 'Title cannot be empty';
      }
      const boundaryUpdate = 'boundary' in updates && isGraphBoundary(updates.boundary)
        ? updates.boundary
        : undefined;

      // 检查是否只更新了位置或尺寸，这些变化不需要保存历史记录
      const isPositionOrSizeUpdateOnly = Object.keys(updates).every(key => 
        ['position', 'width', 'height', 'style'].includes(key)
      );

      const newState = {
        nodes: state.nodes.map((node: Node | Group) => {
          if (node.id === id) {
            const updatedNode = {
              ...node,
              ...updates,
              data: updates.data !== undefined 
                ? { ...toRecord(node.data), ...toRecord(updates.data) }
                : node.data,
              position: updates.position !== undefined
                ? safePosition(updates.position)
                : safePosition(node.position),
              validationError,
              updatedAt: new Date(),
            } as GraphNode;
            
            // 🔧 如果更新了 width 或 height,自动同步到 style
            if (updates.width !== undefined || updates.height !== undefined) {
              // 获取节点类型的默认尺寸
              const nodeDefaultWidth = node.type === BlockEnum.GROUP
                ? NODE_SIZES.GROUP.DEFAULT_WIDTH
                : NODE_SIZES.NOTE.DEFAULT_WIDTH;
              const nodeDefaultHeight = node.type === BlockEnum.GROUP
                ? NODE_SIZES.GROUP.DEFAULT_HEIGHT
                : NODE_SIZES.NOTE.DEFAULT_HEIGHT;

              const newWidth = updates.width ?? node.width ?? nodeDefaultWidth;
              const newHeight = updates.height ?? node.height ?? nodeDefaultHeight;

              updatedNode.style = {
                ...(node.style || {}),
                ...(updates.style || {}),
                width: newWidth,
                height: newHeight,
              };

              updatedNode.width = newWidth;
              updatedNode.height = newHeight;

              // 🔧 如果是群组节点且没有显式提供 boundary，自动计算 boundary
              if (updatedNode.type === BlockEnum.GROUP && boundaryUpdate === undefined) {
                updatedNode.boundary = {
                  minX: updatedNode.position.x,
                  minY: updatedNode.position.y,
                  maxX: updatedNode.position.x + newWidth,
                  maxY: updatedNode.position.y + newHeight,
                };
              }
            } else if (updates.style !== undefined) {
              // 如果只更新了 style,保持原有的合并逻辑
              updatedNode.style = { ...node.style, ...updates.style };
            }

            // 🔧 如果显式提供了 boundary，使用提供的值（仅适用于群组节点）
            if (boundaryUpdate !== undefined && updatedNode.type === BlockEnum.GROUP) {
              updatedNode.boundary = boundaryUpdate;
            }
            
            // 🔧 如果节点（Node 或 Group）属于群组，确保位置在群组边界内
            // 但在布局模式下跳过此约束逻辑，以保持布局算法计算的相对位置
            if ('groupId' in updatedNode && updatedNode.groupId && !state.isLayoutMode) {
              const parentGroup = state.nodes.find((n: Node | Group) =>
                n.id === updatedNode.groupId && n.type === BlockEnum.GROUP
              ) as Group | undefined;

              if (parentGroup) {
                const constrainedPos = constrainNodeToGroupBoundary(updatedNode, parentGroup);
                updatedNode.position = constrainedPos;
              }
            }
            
            return updatedNode;
          }
          return node;
        })
      };
      
      set(newState);
      // 只在非位置/尺寸更新时添加历史记录快照
      if (!isPositionOrSizeUpdateOnly) {
        get().addHistorySnapshot?.();
      }
      return newState;
    },
    
    deleteNode: (id) => {
      const state = get();
      const edgeRemoval = removeEdgesConnectedToNodesWithVisibility(
        state.edges || [],
        [id],
        state.edgeVisibility
      );
      const newState = {
        nodes: state.nodes.filter((node: Node | Group) => node.id !== id),
        edges: edgeRemoval.edges,
        edgeVisibility: edgeRemoval.edgeVisibility
      };
      set(newState);
      // 添加历史记录快照
      get().addHistorySnapshot?.();
      return newState;
    },
    
    getNodes: () => get().nodes,
    getNodeById: (id) => get().nodes.find((node: Node | Group) => node.id === id),
  };
};
