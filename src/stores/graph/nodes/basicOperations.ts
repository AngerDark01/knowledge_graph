import { Node, Group, BlockEnum } from '@/types/graph/models';
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
      let defaultWidth = 150;
      let defaultHeight = 100;
      
      if (node.type === BlockEnum.NODE) {
        // 普通节点使用 NoteNode 的初始尺寸
        defaultWidth = 350;
        defaultHeight = 280;
      } else if (node.type === BlockEnum.GROUP) {
        defaultWidth = 300;
        defaultHeight = 200;
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
              const newWidth = updates.width ?? node.width ?? 350;
              const newHeight = updates.height ?? node.height ?? 280;
              
              updatedNode.style = {
                ...(node.style || {}),
                ...(updates.style || {}),
                width: newWidth,
                height: newHeight,
              };
              
              updatedNode.width = newWidth;
              updatedNode.height = newHeight;
            } else if (updates.style !== undefined) {
              // 如果只更新了 style,保持原有的合并逻辑
              updatedNode.style = { ...node.style, ...updates.style };
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