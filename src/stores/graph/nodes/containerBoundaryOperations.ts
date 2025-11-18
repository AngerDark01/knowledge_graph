/**
 * 容器边界管理 - Node和Group通用
 *
 * 核心逻辑：父节点（容器）的最小尺寸必须包含所有子节点，
 * 确保子节点永远不会被遮挡或超出边界。
 */

import { Node, Group, BlockEnum } from '@/types/graph/models';
import { CONTAINER_PADDING, NODE_VISUAL_PADDING, NODE_DIMENSIONS } from '@/config/layout';
import { safePosition, safeNumber } from './types';

/**
 * 容器边界操作Slice接口
 */
export interface ContainerBoundaryOperationsSlice {
  /**
   * 更新容器边界以包含所有子节点
   * @param containerId - 容器ID（可以是Node或Group）
   */
  updateContainerBoundary: (containerId: string) => void;
}

/**
 * 创建容器边界操作Slice
 */
export const createContainerBoundaryOperationsSlice = (
  set: any,
  get: any
): ContainerBoundaryOperationsSlice => ({

  /**
   * 更新容器边界
   */
  updateContainerBoundary: (containerId: string) => set((state: any) => {
    const container = state.nodes.find((n: Node | Group) => n.id === containerId);

    if (!container) {
      console.warn(`⚠️ 容器 ${containerId} 未找到`);
      return state;
    }

    console.log(`📏 更新容器边界: ${containerId} (${container.type})`);

    // 获取子节点ID列表
    let childIds: string[] = [];

    if (container.type === BlockEnum.GROUP) {
      childIds = (container as Group).nodeIds || [];
    } else if (container.type === BlockEnum.NODE) {
      childIds = (container as Node).childNodeIds || [];
    }

    if (childIds.length === 0) {
      console.log(`  无子节点，保持当前尺寸`);
      return state;
    }

    console.log(`  子节点数量: ${childIds.length}`);

    // 获取所有子节点对象
    const children = state.nodes.filter((n: Node | Group) => childIds.includes(n.id));

    if (children.length === 0) {
      console.log(`  子节点未找到，保持当前尺寸`);
      return state;
    }

    // 计算所有子节点的边界（绝对坐标）
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    children.forEach((child: Node | Group) => {
      const w = safeNumber(child.width, 150) + NODE_VISUAL_PADDING;
      const h = safeNumber(child.height, 100) + NODE_VISUAL_PADDING;
      const pos = safePosition(child.position);

      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x + w);
      maxY = Math.max(maxY, pos.y + h);
    });

    console.log(`  子节点边界: minX=${minX}, minY=${minY}, maxX=${maxX}, maxY=${maxY}`);

    // 获取容器当前状态
    const containerPos = safePosition(container.position);
    const currentWidth = safeNumber(
      container.width,
      container.type === BlockEnum.GROUP
        ? NODE_DIMENSIONS.GROUP.default.width
        : NODE_DIMENSIONS.NOTE.collapsed.width
    );
    const currentHeight = safeNumber(
      container.height,
      container.type === BlockEnum.GROUP
        ? NODE_DIMENSIONS.GROUP.default.height
        : NODE_DIMENSIONS.NOTE.collapsed.height
    );

    console.log(`  容器当前: 位置=(${containerPos.x}, ${containerPos.y}), 尺寸=${currentWidth}x${currentHeight}`);

    // 计算需要的容器尺寸（包含padding）
    const requiredMinX = minX - CONTAINER_PADDING.left;
    const requiredMinY = minY - CONTAINER_PADDING.top;
    const requiredMaxX = maxX + CONTAINER_PADDING.right;
    const requiredMaxY = maxY + CONTAINER_PADDING.bottom;

    // 计算需要的宽度和高度
    const requiredWidth = requiredMaxX - requiredMinX;
    const requiredHeight = requiredMaxY - requiredMinY;

    console.log(`  需要的尺寸: ${requiredWidth}x${requiredHeight}`);

    // 获取最小尺寸约束
    const minDimensions =
      container.type === BlockEnum.GROUP
        ? NODE_DIMENSIONS.GROUP.min
        : NODE_DIMENSIONS.NOTE.collapsed;

    // ⚠️ 关键逻辑：父节点不能小于包含所有子节点所需的尺寸
    const newWidth = Math.max(
      requiredWidth,
      minDimensions.width,
      currentWidth
    );

    const newHeight = Math.max(
      requiredHeight,
      minDimensions.height,
      currentHeight
    );

    // 检查是否需要更新
    if (Math.abs(newWidth - currentWidth) < 1 && Math.abs(newHeight - currentHeight) < 1) {
      console.log(`  ✅ 容器尺寸已足够，无需调整`);
      return state;
    }

    console.log(`  📐 调整容器尺寸: ${currentWidth}x${currentHeight} -> ${newWidth}x${newHeight}`);

    // 更新容器节点
    const updatedNodes = state.nodes.map((n: Node | Group) => {
      if (n.id === containerId) {
        return {
          ...n,
          width: safeNumber(newWidth, minDimensions.width),
          height: safeNumber(newHeight, minDimensions.height),
          updatedAt: new Date(),
        };
      }
      return n;
    });

    console.log(`  ✅ 容器边界更新完成`);

    return { nodes: updatedNodes };
  }),
});
