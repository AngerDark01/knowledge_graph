import { Node, Group, BlockEnum } from '@/types/graph/models';
import { GroupBoundaryOperationsSlice, GROUP_PADDING, NODE_VISUAL_PADDING, safePosition, safeNumber } from './types';

// ⚡ 优化：边界计算缓存（避免重复计算相同的边界）
interface BoundaryCache {
  timestamp: number;
  nodeIds: string;
  boundary: { minX: number; minY: number; maxX: number; maxY: number };
}
const boundaryCache = new Map<string, BoundaryCache>();
const CACHE_TTL = 100; // 缓存有效期 100ms

export const createGroupBoundaryOperationsSlice = (set: any, get: any): GroupBoundaryOperationsSlice => {
  /**
   * 内部辅助函数：更新单个群组的边界
   * ⚡ 优化版：添加缓存机制，避免重复计算
   * @param groupId 群组ID
   * @param nodes 当前节点列表
   * @returns 更新后的节点列表
   */
  const updateSingleGroupBoundary = (groupId: string, nodes: (Node | Group)[]): (Node | Group)[] => {
    const group = nodes.find((node: Node | Group) =>
      node.id === groupId && node.type === BlockEnum.GROUP
    ) as Group;

    if (!group) {
      console.log(`⚠️ 群组 ${groupId} 未找到`);
      return nodes;
    }

    const groupNodes = nodes.filter((node: Node | Group) =>
      'groupId' in node && node.groupId === groupId
    );

    if (groupNodes.length === 0) {
      console.log(`📏 群组 ${groupId} 内无节点，保持当前尺寸`);
      return nodes;
    }

    // 获取当前群组位置和尺寸
    const currentGroupPos = safePosition(group.position);
    const currentWidth = safeNumber(group.width, 300);
    const currentHeight = safeNumber(group.height, 200);

    // ⚡ 优化：检查缓存，避免重复计算
    const nodeIdsKey = groupNodes.map(n => n.id).sort().join(',');
    const now = Date.now();
    const cached = boundaryCache.get(groupId);

    if (cached && cached.nodeIds === nodeIdsKey && (now - cached.timestamp) < CACHE_TTL) {
      const { minX, minY, maxX, maxY } = cached.boundary;

      // 使用缓存的边界值
      const requiredMinX = minX - GROUP_PADDING.left;
      const requiredMinY = minY - GROUP_PADDING.top;
      const requiredMaxX = maxX + GROUP_PADDING.right;
      const requiredMaxY = maxY + GROUP_PADDING.bottom;

      const currentMaxX = currentGroupPos.x + currentWidth;
      const currentMaxY = currentGroupPos.y + currentHeight;

      const needsExpandRight = requiredMaxX > currentMaxX;
      const needsExpandDown = requiredMaxY > currentMaxY;
      const needsExpandLeft = requiredMinX < currentGroupPos.x;
      const needsExpandUp = requiredMinY < currentGroupPos.y;

      if (!needsExpandRight && !needsExpandDown && !needsExpandLeft && !needsExpandUp) {
        console.log(`✅ 群组 ${groupId} 尺寸足够（使用缓存）`);
        return nodes;
      }
    }

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

      minX = Math.min(minX, nodePos.x);
      minY = Math.min(minY, nodePos.y);
      maxX = Math.max(maxX, nodePos.x + nodeWidth);
      maxY = Math.max(maxY, nodePos.y + nodeHeight);
    });

    // ⚡ 优化：更新缓存
    boundaryCache.set(groupId, {
      timestamp: now,
      nodeIds: nodeIdsKey,
      boundary: { minX, minY, maxX, maxY }
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
      return nodes;
    }

    console.log(`🔍 需要扩展:`, {
      left: needsExpandLeft,
      up: needsExpandUp,
      right: needsExpandRight,
      down: needsExpandDown
    });

    // 计算新的群组位置和尺寸
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
    return nodes.map((node: Node | Group) => {
      if (node.id === groupId) {
        return {
          ...node,
          position: { x: safeNumber(newGroupX), y: safeNumber(newGroupY) },
          width: safeNumber(newWidth, 300),
          height: safeNumber(newHeight, 200),
          boundary: {
            minX: safeNumber(newGroupX),
            minY: safeNumber(newGroupY),
            maxX: safeNumber(newGroupX) + safeNumber(newWidth, 300),
            maxY: safeNumber(newGroupY) + safeNumber(newHeight, 200)
          },
          updatedAt: new Date()
        } as Group;
      }
      return node;
    });
  };

  return {
    // 直接更新群组边界，移除防抖机制
    updateGroupBoundary: (groupId: string) => {
      set((state: any) => {
        const group = state.nodes.find((node: Node | Group) =>
          node.id === groupId && node.type === BlockEnum.GROUP
        ) as Group;

        if (!group) {
          console.log(`⚠️ 群组 ${groupId} 未找到`);
          return state;
        }

        // 🔧 使用循环向上递归更新所有祖先群组
        let updatedNodes = state.nodes;

        // 收集需要更新的群组链（从当前群组到最顶层）
        const groupChain: string[] = [];
        let tempGroupId: string | undefined = groupId;
        while (tempGroupId) {
          groupChain.unshift(tempGroupId); // 添加到数组开头，这样最顶层的在前面
          const tempGroup = updatedNodes.find((n: Node | Group) => n.id === tempGroupId) as Group | undefined;
          tempGroupId = tempGroup?.groupId;
        }

        console.log(`📏 需要更新的群组链（从顶层到当前）:`, groupChain);

        // 从最底层（当前群组）开始向上更新
        for (let i = groupChain.length - 1; i >= 0; i--) {
          const targetGroupId = groupChain[i];
          updatedNodes = updateSingleGroupBoundary(targetGroupId, updatedNodes);
        }

        return { nodes: updatedNodes };
      });
    },
  };
};