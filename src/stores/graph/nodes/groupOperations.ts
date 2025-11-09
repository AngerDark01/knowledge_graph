import { Node, Group, BlockEnum } from '@/types/graph/models';
import { GroupOperationsSlice, safePosition, safeNumber, constrainNodeToGroupBoundary } from './types';
import { GraphConfig } from '@/config/graph.config';
import { validateAddToGroup } from '@/utils/graph/nesting';

export const createGroupOperationsSlice = (set: any, get: any): GroupOperationsSlice => {
  return {
    addGroup: (group) => set((state: any) => {
      console.log('➕ 添加群组:', group.id);
      const defaultSize = GraphConfig.nodeSize.group.default;
      const safeGroup = {
        ...group,
        position: safePosition(group.position),
        width: safeNumber(group.width, defaultSize.width),
        height: safeNumber(group.height, defaultSize.height)
      };
      return { nodes: [...state.nodes, safeGroup] };
    }),
    
    updateGroup: (id, updates) => set((state: any) => {
      console.log(`🔧 更新群组 ${id}:`, updates);

      let validationError = undefined;
      if (updates.title !== undefined && updates.title.trim() === '') {
        validationError = 'Title cannot be empty';
      }

      const defaultSize = GraphConfig.nodeSize.group.default;

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
              width: safeNumber(updates.width ?? group.width, defaultSize.width),
              height: safeNumber(updates.height ?? group.height, defaultSize.height),
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

      // 如果节点已经在目标群组中，直接返回
      if (node && 'groupId' in node && node.groupId === groupId) {
        return state;
      }

      // ✅ 验证是否可以添加（循环检测和深度限制）
      const validation = validateAddToGroup(nodeId, groupId, state.nodes);
      if (!validation.valid) {
        console.error(`❌ 添加节点到群组失败: ${validation.error}`);
        alert(validation.error); // 显示错误信息
        return state;
      }

      console.log(`📌 添加节点 ${nodeId} 到群组 ${groupId}`);

      let updatedNodes = [...state.nodes];

      // 从旧群组移除（如果有）
      if (node && 'groupId' in node && node.groupId) {
        console.log(`  📤 从旧群组 ${node.groupId} 移除`);
        updatedNodes = updatedNodes.map((n: Node | Group) => {
          if ('groupId' in node && n.id === node.groupId && n.type === BlockEnum.GROUP) {
            const group = n as Group;
            const updatedNodeIds = (group.nodeIds || []).filter((id: string) => id !== nodeId);
            return { ...group, nodeIds: updatedNodeIds };
          }
          return n;
        });
      }

      // 添加到新群组，约束位置（支持 Node 和 Group）
      updatedNodes = updatedNodes.map((n: Node | Group) => {
        if (n.id === nodeId) {
          const group = updatedNodes.find((g: Node | Group) =>
            g.id === groupId && g.type === BlockEnum.GROUP
          ) as Group;

          if (group) {
            const constrainedPos = constrainNodeToGroupBoundary(n, group);
            console.log(`  🔒 约束位置:`, constrainedPos);
            return { ...n, groupId, position: constrainedPos };
          }
          return { ...n, groupId };
        }
        return n;
      });

      // 更新目标群组的 nodeIds
      updatedNodes = updatedNodes.map((n: Node | Group) => {
        if (n.id === groupId && n.type === BlockEnum.GROUP) {
          const group = n as Group;
          const filteredNodeIds = (group.nodeIds || []).filter((id: string) => id !== nodeId);
          const updatedNodeIds = [...filteredNodeIds, nodeId];
          return { ...group, nodeIds: updatedNodeIds };
        }
        return n;
      });

      console.log(`  ✅ 添加成功`);
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