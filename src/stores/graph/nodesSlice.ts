import { create } from 'zustand';
import { Node, Group, Edge, BlockEnum } from '@/types/graph/models';

interface NodesSlice {
  nodes: (Node | Group)[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  addNode: (node: Node | Group) => void;
  updateNode: (id: string, updates: Partial<Node | Group>) => void;
  deleteNode: (id: string) => void;
  getNodes: () => (Node | Group)[];
  getNodeById: (id: string) => (Node | Group) | undefined;
  setSelectedNodeId: (id: string | null) => void;
  setSelectedEdgeId: (id: string | null) => void;
  addGroup: (group: Group) => void;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  addNodeToGroup: (nodeId: string, groupId: string) => void;
  removeNodeFromGroup: (nodeId: string) => void;
  updateGroupBoundary: (groupId: string) => void;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
  handleGroupMove: (groupId: string, newPosition: { x: number; y: number }) => void;
}

// 群组内边距常量
const GROUP_PADDING = { 
  top: 70,    // 标题栏高度 + 额外间距
  left: 20, 
  right: 20, 
  bottom: 20 
};

// 节点外框的额外空间（阴影、边框等视觉效果）
const NODE_VISUAL_PADDING = 4;

// 安全的数值验证函数
const safeNumber = (value: any, defaultValue: number = 0): number => {
  const num = Number(value);
  return typeof num === 'number' && !isNaN(num) && isFinite(num) ? num : defaultValue;
};

// 确保位置对象有效
const safePosition = (position: any): { x: number; y: number } => {
  return {
    x: safeNumber(position?.x, 0),
    y: safeNumber(position?.y, 0)
  };
};

// 约束节点位置在群组边界内
const constrainNodeToGroupBoundary = (
  node: Node, 
  group: Group
): { x: number; y: number } => {
  const nodeWidth = safeNumber(node.width, 150);
  const nodeHeight = safeNumber(node.height, 100);
  const groupWidth = safeNumber(group.width, 300);
  const groupHeight = safeNumber(group.height, 200);
  
  const groupPos = safePosition(group.position);
  const nodePos = safePosition(node.position);
  
  // 计算允许的最小和最大位置
  const minX = groupPos.x + GROUP_PADDING.left;
  const minY = groupPos.y + GROUP_PADDING.top;
  const maxX = groupPos.x + groupWidth - GROUP_PADDING.right - nodeWidth;
  const maxY = groupPos.y + groupHeight - GROUP_PADDING.bottom - nodeHeight;
  
  // 约束节点位置
  const constrainedX = Math.max(minX, Math.min(nodePos.x, maxX));
  const constrainedY = Math.max(minY, Math.min(nodePos.y, maxY));
  
  return {
    x: safeNumber(constrainedX, minX),
    y: safeNumber(constrainedY, minY)
  };
};

export const createNodesSlice = (set: any, get: any): NodesSlice => ({
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
  
  updateNodePosition: (id, position) => set((state: any) => {
    console.log(`📍 更新节点位置 ${id}:`, position);
    
    const safePos = safePosition(position);
    
    return {
      nodes: state.nodes.map((node: Node | Group) => {
        if (node.id === id) {
          let updatedNode = { 
            ...node, 
            position: safePos,
            updatedAt: new Date()
          };
          
          // 如果节点属于群组，约束位置
          if (node.type === BlockEnum.NODE && 'groupId' in node && (node as Node).groupId) {
            const group = state.nodes.find((n: Node | Group) => 
              n.id === (node as Node).groupId && n.type === BlockEnum.GROUP
            ) as Group;
            
            if (group) {
              const constrainedPos = constrainNodeToGroupBoundary(updatedNode as Node, group);
              updatedNode.position = constrainedPos;
              console.log('  🔒 拖动时约束位置到群组内:', constrainedPos);
            }
          }
          
          console.log(`  ✅ 位置已更新:`, updatedNode.position);
          return updatedNode;
        }
        return node;
      })
    };
  }),
  
  handleGroupMove: (groupId, newPosition) => set((state: any) => {
    const group = state.nodes.find((node: Node | Group) => 
      node.id === groupId && node.type === BlockEnum.GROUP
    ) as Group;
    
    if (!group) {
      console.log(`⚠️ 群组 ${groupId} 未找到`);
      return state;
    }
    
    const safeNewPos = safePosition(newPosition);
    const safeOldPos = safePosition(group.position);
    
    const offsetX = safeNewPos.x - safeOldPos.x;
    const offsetY = safeNewPos.y - safeOldPos.y;
    
    console.log(`📦 群组移动 ${groupId}:`, {
      旧位置: safeOldPos,
      新位置: safeNewPos,
      偏移: { x: offsetX, y: offsetY }
    });
    
    const groupNodes = state.nodes.filter((node: Node | Group) => 
      'groupId' in node && node.groupId === groupId
    ) as Node[];
    
    console.log(`  包含 ${groupNodes.length} 个节点`);
    
    const updatedNodes = state.nodes.map((node: Node | Group) => {
      if (node.id === groupId) {
        return { 
          ...node, 
          position: safeNewPos,
          updatedAt: new Date()
        };
      } else if (groupNodes.some(n => n.id === node.id)) {
        const nodePos = safePosition(node.position);
        const newNodePosition = {
          x: safeNumber(nodePos.x + offsetX),
          y: safeNumber(nodePos.y + offsetY)
        };
        console.log(`  📍 更新节点 ${node.id} 位置:`, nodePos, '->', newNodePosition);
        return {
          ...node,
          position: newNodePosition,
          updatedAt: new Date()
        };
      }
      return node;
    });
    
    return { nodes: updatedNodes };
  }),
  
  deleteNode: (id) => set((state: any) => {
    console.log(`🗑️ 删除节点: ${id}`);
    return {
      nodes: state.nodes.filter((node: Node | Group) => node.id !== id)
    };
  }),
  
  getNodes: () => get().nodes,
  getNodeById: (id) => get().nodes.find((node: Node | Group) => node.id === id),
  
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
  
  // 关键修改：扩大群组边界，并确保子节点位置正确
  updateGroupBoundary: (groupId: string) => set((state: any) => {
    const group = state.nodes.find((node: Node | Group) => 
      node.id === groupId && node.type === BlockEnum.GROUP
    ) as Group;
    
    if (!group) {
      console.log(`⚠️ 群组 ${groupId} 未找到`);
      return state;
    }

    const groupNodes = state.nodes.filter((node: Node | Group) => 
      'groupId' in node && node.groupId === groupId
    );
    
    if (groupNodes.length === 0) {
      console.log(`📏 群组 ${groupId} 内无节点，保持当前尺寸`);
      return state;
    }

    // 获取当前群组位置和尺寸
    const currentGroupPos = safePosition(group.position);
    const currentWidth = safeNumber(group.width, 300);
    const currentHeight = safeNumber(group.height, 200);
    
    console.log(`📊 群组 ${groupId} 当前状态:`, {
      position: currentGroupPos,
      size: { width: currentWidth, height: currentHeight }
    });
    
    // 计算所有子节点的边界（绝对坐标）
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    groupNodes.forEach((node: Node | Group) => {
      const nodeWidth = safeNumber(node.width, 150) + NODE_VISUAL_PADDING;
      const nodeHeight = safeNumber(node.height, 100) + NODE_VISUAL_PADDING;
      const nodePos = safePosition(node.position);
      
      console.log(`  节点 ${node.id}:`, {
        position: nodePos,
        size: { width: nodeWidth, height: nodeHeight }
      });
      
      minX = Math.min(minX, nodePos.x);
      minY = Math.min(minY, nodePos.y);
      maxX = Math.max(maxX, nodePos.x + nodeWidth);
      maxY = Math.max(maxY, nodePos.y + nodeHeight);
    });

    console.log(`  节点边界:`, { minX, minY, maxX, maxY });

    // 计算需要的群组边界（包含 padding）
    const requiredMinX = minX - GROUP_PADDING.left;
    const requiredMinY = minY - GROUP_PADDING.top;
    const requiredMaxX = maxX + GROUP_PADDING.right;
    const requiredMaxY = maxY + GROUP_PADDING.bottom;
    
    // 当前群组的右下角位置
    const currentMaxX = currentGroupPos.x + currentWidth;
    const currentMaxY = currentGroupPos.y + currentHeight;

    // 检查是否需要扩展（四个方向）
    const needsExpandRight = requiredMaxX > currentMaxX;
    const needsExpandDown = requiredMaxY > currentMaxY;
    const needsExpandLeft = requiredMinX < currentGroupPos.x;
    const needsExpandUp = requiredMinY < currentGroupPos.y;

    if (!needsExpandRight && !needsExpandDown && !needsExpandLeft && !needsExpandUp) {
      console.log(`✅ 群组 ${groupId} 尺寸足够，无需调整`);
      return state;
    }

    console.log(`🔍 需要扩展:`, {
      left: needsExpandLeft,
      up: needsExpandUp,
      right: needsExpandRight,
      down: needsExpandDown
    });

    // 计算新的群组位置和尺寸
    // 策略：只向右下扩展，保持左上角不变
    let newGroupX = currentGroupPos.x;
    let newGroupY = currentGroupPos.y;
    let newWidth = currentWidth;
    let newHeight = currentHeight;

    // 向右扩展
    if (needsExpandRight) {
      newWidth = requiredMaxX - currentGroupPos.x;
    }
    
    // 向下扩展
    if (needsExpandDown) {
      newHeight = requiredMaxY - currentGroupPos.y;
    }

    // 向左扩展（改变群组位置）
    if (needsExpandLeft) {
      const deltaX = currentGroupPos.x - requiredMinX;
      newGroupX = requiredMinX;
      newWidth = currentWidth + deltaX;
    }
    
    // 向上扩展（改变群组位置）
    if (needsExpandUp) {
      const deltaY = currentGroupPos.y - requiredMinY;
      newGroupY = requiredMinY;
      newHeight = currentHeight + deltaY;
    }

    // 确保最小尺寸
    newWidth = Math.max(newWidth, 300);
    newHeight = Math.max(newHeight, 200);

    console.log(`📏 新群组状态:`, {
      position: { x: newGroupX, y: newGroupY },
      size: { width: newWidth, height: newHeight }
    });

    // 更新节点
    const updatedNodes = state.nodes.map((node: Node | Group) => {
      if (node.id === groupId) {
        // 更新群组
        return {
          ...node,
          position: { x: safeNumber(newGroupX), y: safeNumber(newGroupY) },
          width: safeNumber(newWidth, 300),
          height: safeNumber(newHeight, 200),
          updatedAt: new Date()
        } as Group;
      }
      return node;
    });

    return { nodes: updatedNodes };
  }),
});

export type { NodesSlice };