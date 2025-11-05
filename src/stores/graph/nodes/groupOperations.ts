import { Node, Group, BlockEnum } from '@/types/graph/models';
import { GroupOperationsSlice, safePosition, safeNumber, constrainNodeToGroupBoundary } from './types';

export const createGroupOperationsSlice = (set: any, get: any): GroupOperationsSlice => {
  return {
    addGroup: (group) => set((state: any) => {
      console.log('➕ 添加群组:', group.id);
      const safeGroup = {
        ...group,
        position: safePosition(group.position),
        width: safeNumber(group.width, 300),
        height: safeNumber(group.height, 200)
      };
      return { nodes: [...state.nodes, safeGroup] };
    }),
    
    updateGroup: (id, updates) => set((state: any) => {
      console.log(`🔧 更新群组 ${id}:`, updates);
      
      let validationError = undefined;
      if (updates.title !== undefined && updates.title.trim() === '') {
        validationError = 'Title cannot be empty';
      }

      return {
        nodes: state.nodes.map((node: Node | Group) => {
          if (node.id === id && node.type === BlockEnum.GROUP) {
            const group = node as Group;
            const updatedGroup = {
              ...group,
              ...updates,
              data: updates.data !== undefined 
                ? { ...group.data, ...updates.data }
                : group.data,
              style: updates.style !== undefined
                ? { ...group.style, ...updates.style }
                : group.style,
              position: updates.position !== undefined
                ? safePosition(updates.position)
                : safePosition(group.position),
              width: safeNumber(updates.width ?? group.width, 300),
              height: safeNumber(updates.height ?? group.height, 200),
              validationError,
              updatedAt: new Date(),
            };
            
            console.log(`  ✅ 群组 ${id} 更新后:`, {
              position: updatedGroup.position,
              width: updatedGroup.width,
              height: updatedGroup.height,
            });
            
            if (updates.nodeIds) {
              const oldNodeIds = group.nodeIds || [];
              const newNodeIds = updates.nodeIds as string[] || [];
              
              const addedNodeIds = newNodeIds.filter((nodeId: string) => !oldNodeIds.includes(nodeId));
              const removedNodeIds = oldNodeIds.filter((nodeId: string) => !newNodeIds.includes(nodeId));
              
              const updatedNodes = state.nodes.map((n: Node | Group) => {
                if (addedNodeIds.includes(n.id)) {
                  return { ...n, groupId: id };
                } else if (removedNodeIds.includes(n.id) && 'groupId' in n && n.groupId === id) {
                  const nodeCopy = { ...n };
                  delete nodeCopy.groupId;
                  return nodeCopy;
                }
                return n;
              });
              
              return updatedNodes;
            }
            
            return updatedGroup;
          }
          return node;
        })
      };
    }),
    
    deleteGroup: (id) => set((state: any) => {
      const group = state.nodes.find((node: Node | Group) => 
        node.id === id && node.type === BlockEnum.GROUP
      ) as Group;
      if (!group) return state;

      const updatedNodes = state.nodes
        .map((node: Node | Group) => {
          if ('groupId' in node && node.groupId === id) {
            const nodeCopy = { ...node };
            delete nodeCopy.groupId;
            return nodeCopy;
          }
          return node;
        })
        .filter((node: Node | Group) => node.id !== id);

      return { nodes: updatedNodes };
    }),
    
    addNodeToGroup: (nodeId, groupId) => set((state: any) => {
      const node = state.nodes.find((n: Node | Group) => n.id === nodeId);
      if (node && 'groupId' in node && node.groupId === groupId) {
        return state;
      }
      
      let updatedNodes = [...state.nodes];
      if (node && 'groupId' in node && node.groupId) {
        updatedNodes = updatedNodes.map((n: Node | Group) => {
          if ('groupId' in node && n.id === node.groupId && n.type === BlockEnum.GROUP) {
            const group = n as Group;
            const updatedNodeIds = (group.nodeIds || []).filter((id: string) => id !== nodeId);
            return { ...group, nodeIds: updatedNodeIds };
          }
          return n;
        });
      }

      updatedNodes = updatedNodes.map((n: Node | Group) => {
        if (n.id === nodeId) {
          // 添加到新群组时，约束位置
          const group = updatedNodes.find((g: Node | Group) => 
            g.id === groupId && g.type === BlockEnum.GROUP
          ) as Group;
          
          if (group) {
            const constrainedPos = constrainNodeToGroupBoundary(n as Node, group);
            return { ...n, groupId, position: constrainedPos };
          }
          return { ...n, groupId };
        }
        return n;
      });

      updatedNodes = updatedNodes.map((n: Node | Group) => {
        if (n.id === groupId && n.type === BlockEnum.GROUP) {
          const group = n as Group;
          const filteredNodeIds = (group.nodeIds || []).filter((id: string) => id !== nodeId);
          const updatedNodeIds = [...filteredNodeIds, nodeId];
          return { ...group, nodeIds: updatedNodeIds };
        }
        return n;
      });

      return { nodes: updatedNodes };
    }),
    
    removeNodeFromGroup: (nodeId) => set((state: any) => {
      const updatedNodes = state.nodes.map((node: Node | Group) => {
        if (node.id === nodeId && 'groupId' in node && node.groupId) {
          const nodeCopy = { ...node };
          delete nodeCopy.groupId;
          return nodeCopy;
        }
        return node;
      });

      const updatedNodesWithGroup = updatedNodes.map((node: Node | Group) => {
        if (node.type === BlockEnum.GROUP) {
          const group = node as Group;
          const updatedNodeIds = (group.nodeIds || []).filter((id: string) => id !== nodeId);
          return { ...group, nodeIds: updatedNodeIds };
        }
        return node;
      });

      return { nodes: updatedNodesWithGroup };
    }),
  };
};