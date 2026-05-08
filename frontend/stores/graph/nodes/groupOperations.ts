import { Node, Group, BlockEnum } from '@/types/graph/models';
import { NODE_SIZES } from '@/config/graph.config';
import {
  type GraphNode,
  type GraphStoreSet,
  type GroupOperationsSlice,
  safePosition,
  safeNumber,
  constrainNodeToGroupBoundary,
  toRecord
} from './types';
import { hasCircularNesting, validateNestingDepth, getAllDescendants } from '@/utils/graph/nestingHelpers';
import { removeEdgesConnectedToNodesWithVisibility } from '@/domain/ontology';

export const createGroupOperationsSlice = (
  set: GraphStoreSet
): GroupOperationsSlice => {
  return {
    addGroup: (group) => set((state) => {
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

        // 如果在父群组内，约束位置
        const parentGroup = state.nodes.find((n: Node | Group) =>
          n.id === group.groupId && n.type === BlockEnum.GROUP
        ) as Group | undefined;

        const safeGroup: Group = {
          ...group,
          position: safePosition(group.position),
          width: safeNumber(group.width, NODE_SIZES.GROUP.DEFAULT_WIDTH),
          height: safeNumber(group.height, NODE_SIZES.GROUP.DEFAULT_HEIGHT)
        };

        if (parentGroup) {
          const constrainedPos = constrainNodeToGroupBoundary(safeGroup, parentGroup);
          safeGroup.position = constrainedPos;
        }

        return { nodes: [...state.nodes, safeGroup] };
      }

      // 普通群组（无父群组）
      const safeGroup: Group = {
        ...group,
        position: safePosition(group.position),
        width: safeNumber(group.width, NODE_SIZES.GROUP.DEFAULT_WIDTH),
        height: safeNumber(group.height, NODE_SIZES.GROUP.DEFAULT_HEIGHT)
      };
      return { nodes: [...state.nodes, safeGroup] };
    }),
    
    updateGroup: (id, updates) => set((state) => {
      let validationError: string | undefined = undefined;
      if (updates.title !== undefined && updates.title.trim() === '') {
        validationError = 'Title cannot be empty';
      }

      const targetGroup = state.nodes.find((node: Node | Group) =>
        node.id === id && node.type === BlockEnum.GROUP
      ) as Group | undefined;

      if (!targetGroup) {
        return state;
      }

      const oldNodeIds = targetGroup.nodeIds || [];
      const newNodeIds = updates.nodeIds;
      const addedNodeIds = newNodeIds
        ? newNodeIds.filter((nodeId: string) => !oldNodeIds.includes(nodeId))
        : [];
      const removedNodeIds = newNodeIds
        ? oldNodeIds.filter((nodeId: string) => !newNodeIds.includes(nodeId))
        : [];

      return {
        nodes: state.nodes.map((node: Node | Group) => {
          if (node.id === id && node.type === BlockEnum.GROUP) {
            const group = node as Group;
            const updatedGroup: Group = {
              ...group,
              ...updates,
              data: updates.data !== undefined 
                ? { ...toRecord(group.data), ...toRecord(updates.data) }
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
            
            return updatedGroup;
          }
          if (newNodeIds && addedNodeIds.includes(node.id)) {
            return { ...node, groupId: id };
          }
          if (newNodeIds && removedNodeIds.includes(node.id) && 'groupId' in node && node.groupId === id) {
            const nodeCopy = { ...node };
            delete nodeCopy.groupId;
            return nodeCopy;
          }
          return node;
        })
      };
    }),
    
    deleteGroup: (id) => set((state) => {
      const group = state.nodes.find((node: Node | Group) =>
        node.id === id && node.type === BlockEnum.GROUP
      ) as Group | undefined;
      if (!group) return state;

      // 🔧 级联删除：获取所有后代节点（包括嵌套的群组和节点）
      const allDescendants = getAllDescendants(id, state.nodes);
      const descendantIds = new Set(allDescendants.map(d => d.id));

      // 删除群组和所有后代节点
      const updatedNodes = state.nodes.filter((node: Node | Group) =>
        !descendantIds.has(node.id)
      );
      const edgeRemoval = removeEdgesConnectedToNodesWithVisibility(
        state.edges || [],
        descendantIds,
        state.edgeVisibility
      );

      return {
        nodes: updatedNodes,
        edges: edgeRemoval.edges,
        edgeVisibility: edgeRemoval.edgeVisibility
      };
    }),
    
    addNodeToGroup: (nodeId, groupId) => set((state) => {
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

      }

      let updatedNodes: GraphNode[] = [...state.nodes];
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
          ) as Group | undefined;

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
    
    removeNodeFromGroup: (nodeId) => set((state) => {
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
