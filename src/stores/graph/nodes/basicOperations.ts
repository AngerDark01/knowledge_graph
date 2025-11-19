import { Node, Group, BlockEnum } from '@/types/graph/models';
import { NODE_SIZES } from '@/config/graph.config';
import {
  NodeOperationsSlice,
  safePosition,
  safeNumber,
  constrainNodeToGroupBoundary
} from './types';

export const createBasicOperationsSlice = (set: any, get: any): NodeOperationsSlice & { isLayoutMode: boolean; setIsLayoutMode: (isLayoutMode: boolean) => void } => {
  return {
    nodes: [],
    selectedNodeId: null,
    selectedEdgeId: null,
    isLayoutMode: false,
    
    setSelectedNodeId: (id) => {
      console.log('🎯 设置选中节点:', id);
      set({ selectedNodeId: id });
    },
    
    setIsLayoutMode: (isLayoutMode: boolean) => {
      console.log('🔧 设置布局模式:', isLayoutMode);
      set({ isLayoutMode });
    },

    setSelectedEdgeId: (id) => {
      console.log('🎯 设置选中边:', id);
      set({ selectedEdgeId: id });
    },
    
    addNode: (node) => {
      const state = get();
      console.log('➕ 添加节点:', node.id, node);

      // 🔧 根据节点类型确定默认尺寸
      let defaultWidth, defaultHeight;

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
      const safeNode = {
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
        ) as Group;

        if (group) {
          const constrainedPos = constrainNodeToGroupBoundary(safeNode as Node, group);
          safeNode.position = constrainedPos;
          console.log('  🔒 节点位置已约束到群组内:', constrainedPos);
        }
      }
      
      // 添加历史记录快照
      const newState = { nodes: [...state.nodes, safeNode] };
      set(newState);
      if (get().addHistorySnapshot) {
        get().addHistorySnapshot();
      }
      return newState;
    },
    
    updateNode: (id, updates) => {
      const state = get();
      console.log(`🔧 更新节点 ${id}:`, updates);
      
      let validationError = undefined;
      if (updates.title !== undefined && updates.title.trim() === '') {
        validationError = 'Title cannot be empty';
      }

      // 检查是否只更新了位置或尺寸，这些变化不需要保存历史记录
      const isPositionOrSizeUpdateOnly = Object.keys(updates).every(key => 
        ['position', 'width', 'height', 'style'].includes(key)
      );

      const newState = {
        nodes: state.nodes.map((node: Node | Group) => {
          if (node.id === id) {
            let updatedNode = {
              ...node,
              ...updates,
              data: updates.data !== undefined 
                ? { ...node.data, ...updates.data }
                : node.data,
              position: updates.position !== undefined
                ? safePosition(updates.position)
                : safePosition(node.position),
              validationError,
              updatedAt: new Date(),
            };
            
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
              if (node.type === BlockEnum.GROUP && updates.boundary === undefined) {
                (updatedNode as any).boundary = {
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
            if (updates.boundary !== undefined && node.type === BlockEnum.GROUP) {
              (updatedNode as any).boundary = updates.boundary;
            }
            
            // 🔧 如果节点（Node 或 Group）属于群组，确保位置在群组边界内
            // 但在布局模式下跳过此约束逻辑，以保持布局算法计算的相对位置
            if ('groupId' in updatedNode && updatedNode.groupId && !state.isLayoutMode) {
              const parentGroup = state.nodes.find((n: Node | Group) =>
                n.id === updatedNode.groupId && n.type === BlockEnum.GROUP
              ) as Group;

              if (parentGroup) {
                const constrainedPos = constrainNodeToGroupBoundary(updatedNode as Node | Group, parentGroup);
                updatedNode.position = constrainedPos;
                console.log('  🔒 更新时约束位置到群组内:', constrainedPos);
              }
            }
            
            console.log(`  ✅ 节点 ${id} 更新后:`, {
              position: updatedNode.position,
              width: updatedNode.width,
              height: updatedNode.height,
              style: updatedNode.style,
            });
            
            return updatedNode;
          }
          return node;
        })
      };
      
      set(newState);
      // 只在非位置/尺寸更新时添加历史记录快照
      if (!isPositionOrSizeUpdateOnly && get().addHistorySnapshot) {
        get().addHistorySnapshot();
      }
      return newState;
    },
    
    deleteNode: (id) => {
      const state = get();
      console.log(`🗑️ 删除节点: ${id}`);
      const newState = {
        nodes: state.nodes.filter((node: Node | Group) => node.id !== id)
      };
      set(newState);
      // 添加历史记录快照
      if (get().addHistorySnapshot) {
        get().addHistorySnapshot();
      }
      return newState;
    },
    
    getNodes: () => get().nodes,
    getNodeById: (id) => get().nodes.find((node: Node | Group) => node.id === id),
  };
};