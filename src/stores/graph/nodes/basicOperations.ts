import { Node, Group, BlockEnum } from '@/types/graph/models';
import {
  NodeOperationsSlice,
  safePosition,
  safeNumber,
  constrainNodeToGroupBoundary
} from './types';
import { GraphConfig } from '@/config/graph.config';
import { getAllNestedNodeIds } from '@/utils/graph/nesting';

export const createBasicOperationsSlice = (set: any, get: any): NodeOperationsSlice => {
  return {
    nodes: [],
    selectedNodeId: null,
    selectedEdgeId: null,
    
    setSelectedNodeId: (id) => {
      console.log('🎯 设置选中节点:', id);
      set({ selectedNodeId: id });
    },
    
    setSelectedEdgeId: (id) => {
      console.log('🎯 设置选中边:', id);
      set({ selectedEdgeId: id });
    },
    
    addNode: (node) => {
      const state = get();
      console.log('➕ 添加节点:', node.id, node);

      // 🔧 根据节点类型从配置文件获取默认尺寸
      const defaultSize = node.type === BlockEnum.NODE
        ? GraphConfig.nodeSize.note.collapsed
        : GraphConfig.nodeSize.group.default;

      // 验证并修复节点位置和尺寸
      const safeNode = {
        ...node,
        position: safePosition(node.position),
        width: safeNumber(node.width, defaultSize.width),
        height: safeNumber(node.height, defaultSize.height)
      };
      
      // 如果节点属于群组，确保位置在群组内（支持 Node 和 Group）
      if ('groupId' in safeNode && safeNode.groupId) {
        const group = state.nodes.find((n: Node | Group) =>
          n.id === safeNode.groupId && n.type === BlockEnum.GROUP
        ) as Group;

        if (group) {
          const constrainedPos = constrainNodeToGroupBoundary(safeNode, group);
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
            
            // 如果节点属于群组，确保位置在群组边界内（支持 Node 和 Group）
            if ('groupId' in updatedNode && updatedNode.groupId) {
              const group = state.nodes.find((n: Node | Group) =>
                n.id === updatedNode.groupId && n.type === BlockEnum.GROUP
              ) as Group;

              if (group) {
                const constrainedPos = constrainNodeToGroupBoundary(updatedNode, group);
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
      const nodeToDelete = state.nodes.find((n: Node | Group) => n.id === id);

      if (!nodeToDelete) {
        console.warn(`⚠️ 删除失败: 节点 ${id} 不存在`);
        return state;
      }

      console.log(`🗑️ 删除节点: ${id} (类型: ${nodeToDelete.type})`);

      let nodeIdsToDelete = [id];

      // 如果是 GROUP，递归获取所有嵌套节点的 ID
      if (nodeToDelete.type === BlockEnum.GROUP) {
        const nestedIds = getAllNestedNodeIds(id, state.nodes);
        nodeIdsToDelete = [id, ...nestedIds];
        console.log(`  🗑️ 级联删除 ${nestedIds.length} 个嵌套节点:`, nestedIds);
      }

      // 删除所有节点（包括嵌套的）
      const newState = {
        nodes: state.nodes.filter((node: Node | Group) =>
          !nodeIdsToDelete.includes(node.id)
        )
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