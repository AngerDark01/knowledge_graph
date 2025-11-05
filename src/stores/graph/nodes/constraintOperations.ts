import { Node, Group, BlockEnum } from '@/types/graph/models';
import { ConstraintOperationsSlice, safePosition, safeNumber, constrainNodeToGroupBoundary } from './types';

export const createConstraintOperationsSlice = (set: any, get: any): ConstraintOperationsSlice => {
  return {
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
  };
};