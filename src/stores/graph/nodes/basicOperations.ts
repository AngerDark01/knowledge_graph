import { Node, Group, BlockEnum } from '@/types/graph/models';
import { 
  NodeOperationsSlice, 
  safePosition, 
  safeNumber, 
  constrainNodeToGroupBoundary 
} from './types';

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
    
    addNode: (node) => set((state: any) => {
      console.log('➕ 添加节点:', node.id, node);
      
      // 验证并修复节点位置
      const safeNode = {
        ...node,
        position: safePosition(node.position),
        width: safeNumber(node.width, node.type === BlockEnum.GROUP ? 300 : 150),
        height: safeNumber(node.height, node.type === BlockEnum.GROUP ? 200 : 100)
      };
      
      // 如果节点属于群组，确保位置在群组内
      if ('groupId' in safeNode && safeNode.groupId) {
        const group = state.nodes.find((n: Node | Group) => 
          n.id === safeNode.groupId && n.type === BlockEnum.GROUP
        ) as Group;
        
        if (group) {
          const constrainedPos = constrainNodeToGroupBoundary(safeNode as Node, group);
          safeNode.position = constrainedPos;
          console.log('  🔒 节点位置已约束到群组内:', constrainedPos);
        }
      }
      
      return { nodes: [...state.nodes, safeNode] };
    }),
    
    updateNode: (id, updates) => set((state: any) => {
      console.log(`🔧 更新节点 ${id}:`, updates);
      
      let validationError = undefined;
      if (updates.title !== undefined && updates.title.trim() === '') {
        validationError = 'Title cannot be empty';
      }

      return {
        nodes: state.nodes.map((node: Node | Group) => {
          if (node.id === id) {
            let updatedNode = {
              ...node,
              ...updates,
              data: updates.data !== undefined 
                ? { ...node.data, ...updates.data }
                : node.data,
              style: updates.style !== undefined
                ? { ...node.style, ...updates.style }
                : node.style,
              position: updates.position !== undefined
                ? safePosition(updates.position)
                : safePosition(node.position),
              validationError,
              updatedAt: new Date(),
            };
            
            // 如果是普通节点且属于群组，确保位置在群组边界内
            if (updatedNode.type === BlockEnum.NODE && 'groupId' in updatedNode && updatedNode.groupId) {
              const group = state.nodes.find((n: Node | Group) => 
                n.id === updatedNode.groupId && n.type === BlockEnum.GROUP
              ) as Group;
              
              if (group) {
                const constrainedPos = constrainNodeToGroupBoundary(updatedNode as Node, group);
                updatedNode.position = constrainedPos;
                console.log('  🔒 更新时约束位置到群组内:', constrainedPos);
              }
            }
            
            console.log(`  ✅ 节点 ${id} 更新后:`, {
              position: updatedNode.position,
              width: updatedNode.width,
              height: updatedNode.height,
            });
            
            return updatedNode;
          }
          return node;
        })
      };
    }),
    
    deleteNode: (id) => set((state: any) => {
      console.log(`🗑️ 删除节点: ${id}`);
      return {
        nodes: state.nodes.filter((node: Node | Group) => node.id !== id)
      };
    }),
    
    getNodes: () => get().nodes,
    getNodeById: (id) => get().nodes.find((node: Node | Group) => node.id === id),
  };
};