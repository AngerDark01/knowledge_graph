import { create } from 'zustand';
import { Node, Group, Edge, BlockEnum } from '@/types/graph/models';

interface NodesSlice {
  nodes: (Node | Group)[];
  addNode: (node: Node | Group) => void;
  updateNode: (id: string, updates: Partial<Node | Group>) => void;
  deleteNode: (id: string) => void;
  getNodes: () => (Node | Group)[];
  getNodeById: (id: string) => (Node | Group) | undefined;
  addGroup: (group: Group) => void;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  addNodeToGroup: (nodeId: string, groupId: string) => void;
  removeNodeFromGroup: (nodeId: string) => void;
}

export const createNodesSlice = (set: any, get: any): NodesSlice => ({
  nodes: [],
  addNode: (node) => set((state: any) => ({ 
    nodes: [...state.nodes, node] 
  })),
  updateNode: (id, updates) => set((state: any) => {
    // 验证节点标题
    let validationError = undefined;
    if (updates.title !== undefined && updates.title.trim() === '') {
      validationError = 'Title cannot be empty';
    }

    return {
      nodes: state.nodes.map((node: Node | Group) => 
        node.id === id 
          ? { 
              ...node, 
              ...updates, 
              validationError,
              updatedAt: new Date()
            } 
          : node
      )
    };
  }),
  deleteNode: (id) => set((state: any) => ({
    nodes: state.nodes.filter((node: Node | Group) => node.id !== id)
  })),
  getNodes: () => get().nodes,
  getNodeById: (id) => get().nodes.find((node: Node | Group) => node.id === id),
  addGroup: (group) => set((state: any) => ({
    nodes: [...state.nodes, group]
  })),
  updateGroup: (id, updates) => set((state: any) => {
    // 验证群组标题
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
            validationError,
            updatedAt: new Date()
          };
          
          // 如果更新了nodeIds，需要更新相关节点的groupId
          if (updates.nodeIds) {
            const oldNodeIds = group.nodeIds || [];
            const newNodeIds = updates.nodeIds as string[] || [];
            
            // 找出新增的节点ID
            const addedNodeIds = newNodeIds.filter(nodeId => !oldNodeIds.includes(nodeId));
            // 找出被移除的节点ID
            const removedNodeIds = oldNodeIds.filter(nodeId => !newNodeIds.includes(nodeId));
            
            // 更新相关节点的groupId
            const updatedNodes = state.nodes.map(n => {
              if (addedNodeIds.includes(n.id)) {
                return { ...n, groupId: id };
              } else if (removedNodeIds.includes(n.id) && n.groupId === id) {
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
    const group = state.nodes.find(node => node.id === id && node.type === BlockEnum.GROUP) as Group;
    if (!group) return state;

    // 从群组中移除节点的groupId引用
    const updatedNodes = state.nodes
      .map(node => {
        if (node.groupId === id) {
          const nodeCopy = { ...node };
          delete nodeCopy.groupId;
          return nodeCopy;
        }
        return node;
      })
      .filter(node => node.id !== id); // 移除群组本身

    return { nodes: updatedNodes };
  }),
  addNodeToGroup: (nodeId, groupId) => set((state: any) => {
    // 更新节点的groupId
    const updatedNodes = state.nodes.map(node => {
      if (node.id === nodeId) {
        return { ...node, groupId };
      }
      return node;
    });

    // 更新群组的nodeIds
    const updatedNodesWithGroup = updatedNodes.map(node => {
      if (node.id === groupId && node.type === BlockEnum.GROUP) {
        const group = node as Group;
        const updatedNodeIds = [...(group.nodeIds || []), nodeId];
        return { ...group, nodeIds: updatedNodeIds };
      }
      return node;
    });

    return { nodes: updatedNodesWithGroup };
  }),
  removeNodeFromGroup: (nodeId) => set((state: any) => {
    // 移除节点的groupId
    const updatedNodes = state.nodes.map(node => {
      if (node.id === nodeId && node.groupId) {
        const nodeCopy = { ...node };
        delete nodeCopy.groupId;
        return nodeCopy;
      }
      return node;
    });

    // 从群组的nodeIds中移除该节点
    const updatedNodesWithGroup = updatedNodes.map(node => {
      if (node.type === BlockEnum.GROUP) {
        const group = node as Group;
        const updatedNodeIds = (group.nodeIds || []).filter(id => id !== nodeId);
        return { ...group, nodeIds: updatedNodeIds };
      }
      return node;
    });

    return { nodes: updatedNodesWithGroup };
  }),
  updateGroupBoundary: (groupId: string) => set((state: any) => {
    // 根据群组内节点的位置自动更新群组边界
    const group = state.nodes.find((node: Node | Group) => node.id === groupId && node.type === BlockEnum.GROUP) as Group;
    if (!group) return state;

    // 获取群组内所有节点
    const groupNodes = state.nodes.filter((node: Node | Group) => node.groupId === groupId);
    
    if (groupNodes.length === 0) {
      // 如果群组内没有节点，不更新边界
      return state;
    }

    // 计算群组边界
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    groupNodes.forEach((node: Node | Group) => {
      // 假设节点的默认尺寸
      const nodeWidth = node.width || 150;
      const nodeHeight = node.height || 100;
      
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + nodeWidth);
      maxY = Math.max(maxY, node.position.y + nodeHeight);
    });

    // 添加一些内边距
    const padding = 20;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    // 更新群组的边界和尺寸
    const updatedNodes = state.nodes.map((node: Node | Group) => {
      if (node.id === groupId) {
        return {
          ...node,
          position: { x: minX, y: minY },
          width: maxX - minX,
          height: maxY - minY,
          boundary: { minX, minY, maxX, maxY }
        } as Group;
      }
      return node;
    });

    return { nodes: updatedNodes };
  }),
});