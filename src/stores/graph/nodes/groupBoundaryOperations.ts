import { Node, Group, BlockEnum } from '@/types/graph/models';
import { GroupBoundaryOperationsSlice, safePosition, safeNumber } from './types';
import { CONTAINER_PADDING as GROUP_PADDING, NODE_VISUAL_PADDING, NODE_DIMENSIONS } from '@/config/layout';

export const createGroupBoundaryOperationsSlice = (set: any, get: any): GroupBoundaryOperationsSlice => {
  return {
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
  };
};