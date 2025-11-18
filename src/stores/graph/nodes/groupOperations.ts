import { Node, Group, BlockEnum } from '@/types/graph/models';
import { NODE_SIZES } from '@/config/graph.config';
import { GroupOperationsSlice, safePosition, safeNumber, constrainNodeToGroupBoundary } from './types';
import { hasCircularNesting, validateNestingDepth, getAllDescendants } from '@/utils/graph/nestingHelpers';

export const createGroupOperationsSlice = (set: any, get: any): GroupOperationsSlice => {
  return {
    addGroup: (group) => set((state: any) => {
      console.log('➕ 添加群组:', group.id);

      // 🔧 如果群组有 groupId（嵌套群组），验证嵌套深度和循环
      if ('groupId' in group && group.groupId) {
        // 检测循环嵌套
        if (hasCircularNesting(group.id, group.groupId, state.nodes)) {
          console.error(`❌ 循环嵌套检测：群组 ${group.id} 不能添加到 ${group.groupId}`);
          return state; // 不添加
        }

        // 验证嵌套深度
        const depthValidation = validateNestingDepth(group.id, group.groupId, state.nodes);
        if (!depthValidation.valid) {
          console.error(`❌ 嵌套深度超限：${depthValidation.message}`);
          return state; // 不添加
        }

        console.log(`✅ 嵌套验证通过，深度: ${depthValidation.currentDepth}/${depthValidation.maxDepth}`);

        // 如果在父群组内，约束位置
        const parentGroup = state.nodes.find((n: Node | Group) =>
          n.id === group.groupId && n.type === BlockEnum.GROUP
        ) as Group | undefined;

        const safeGroup = {
          ...group,
          position: safePosition(group.position),
          width: safeNumber(group.width, NODE_SIZES.GROUP.DEFAULT_WIDTH),
          height: safeNumber(group.height, NODE_SIZES.GROUP.DEFAULT_HEIGHT)
        };

        if (parentGroup) {
          const constrainedPos = constrainNodeToGroupBoundary(safeGroup, parentGroup);
          safeGroup.position = constrainedPos;
          console.log('  🔒 群组位置已约束到父群组内:', constrainedPos);
        }

        return { nodes: [...state.nodes, safeGroup] };
      }

      // 普通群组（无父群组）
      const safeGroup = {
        ...group,
        position: safePosition(group.position),
        width: safeNumber(group.width, NODE_SIZES.GROUP.DEFAULT_WIDTH),
        height: safeNumber(group.height, NODE_SIZES.GROUP.DEFAULT_HEIGHT)
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
              width: safeNumber(updates.width ?? group.width, NODE_SIZES.GROUP.DEFAULT_WIDTH),
              height: safeNumber(updates.height ?? group.height, NODE_SIZES.GROUP.DEFAULT_HEIGHT),
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

      // 🔧 级联删除：获取所有后代节点（包括嵌套的群组和节点）
      const allDescendants = getAllDescendants(id, state.nodes);
      const descendantIds = new Set(allDescendants.map(d => d.id));

      console.log(`🗑️ 删除群组 ${id} 及其所有后代:`, {
        群组: id,
        后代数量: descendantIds.size - 1, // 减去群组自己
        后代ID列表: Array.from(descendantIds).filter(did => did !== id)
      });

      // 删除群组和所有后代节点
      const updatedNodes = state.nodes.filter((node: Node | Group) =>
        !descendantIds.has(node.id)
      );

      console.log(`  ✅ 删除完成，剩余节点数: ${updatedNodes.length}`);

      return { nodes: updatedNodes };
    }),
    
    addNodeToGroup: (nodeId, groupId) => set((state: any) => {
      const node = state.nodes.find((n: Node | Group) => n.id === nodeId);
      if (node && 'groupId' in node && node.groupId === groupId) {
        return state;
      }

      // 🔧 如果节点是 Group 类型，需要验证嵌套
      if (node && node.type === BlockEnum.GROUP) {
        // 检测循环嵌套
        if (hasCircularNesting(nodeId, groupId, state.nodes)) {
          console.error(`❌ 循环嵌套检测：群组 ${nodeId} 不能添加到 ${groupId}`);
          return state; // 不添加
        }

        // 验证嵌套深度
        const depthValidation = validateNestingDepth(nodeId, groupId, state.nodes);
        if (!depthValidation.valid) {
          console.error(`❌ 嵌套深度超限：${depthValidation.message}`);
          return state; // 不添加
        }

        console.log(`✅ 嵌套验证通过，深度: ${depthValidation.currentDepth}/${depthValidation.maxDepth}`);
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
          // 添加到新群组时，约束位置（支持 Node 和 Group）
          const group = updatedNodes.find((g: Node | Group) =>
            g.id === groupId && g.type === BlockEnum.GROUP
          ) as Group;

          if (group) {
            const constrainedPos = constrainNodeToGroupBoundary(n, group);
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