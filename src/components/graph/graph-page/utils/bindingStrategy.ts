/**
 * 节点绑定策略（新架构）
 *
 * 迁移说明：
 * - groupId -> parentId
 * - BlockEnum.NODE -> viewMode === 'note'
 * - 使用新的层级关系 API
 */

import { BaseNode } from '@/types/graph/models';
import { useGraphStore } from '@/stores/graph';

export interface BindingStrategy {
  bindNodeToParent(node: BaseNode, parentId?: string): BaseNode;
}

export class ParentSelectionBindingStrategy implements BindingStrategy {
  bindNodeToParent(node: BaseNode, selectedParentId?: string): BaseNode {
    if (!selectedParentId) return node;

    // 获取选中的父节点（容器）信息
    const parent = useGraphStore.getState().getNodeById(selectedParentId) as BaseNode;
    if (!parent || parent.viewMode !== 'container') return node;

    // 计算节点在父容器内部的合理位置
    const parentRect = {
      x: parent.position.x,
      y: parent.position.y,
      width: parent.width || 400,
      height: parent.height || 300
    };

    // 计算父容器内已有的子节点，找到一个合适的位置
    const childNodes = useGraphStore.getState().getNodes()
      .filter(n => n.parentId === selectedParentId && n.viewMode === 'note') as BaseNode[];

    // 简单策略：按顺序排列节点
    const nodeWidth = node.width || 350;
    const nodeHeight = node.height || 280;
    const padding = 20;
    const topPadding = 70; // 容器标题栏高度

    const availableWidth = parentRect.width - padding * 2;
    const cols = Math.max(1, Math.floor(availableWidth / (nodeWidth + padding)));
    const col = childNodes.length % cols;
    const row = Math.floor(childNodes.length / cols);

    // 确保节点在父容器边界内
    const position = {
      x: parentRect.x + padding + col * (nodeWidth + padding),
      y: parentRect.y + topPadding + row * (nodeHeight + padding)
    };

    // 检查是否超出父容器边界
    const maxPosition = {
      x: parentRect.x + parentRect.width - padding - nodeWidth,
      y: parentRect.y + parentRect.height - padding - nodeHeight
    };

    return {
      ...node,
      position: {
        x: Math.max(parentRect.x + padding, Math.min(position.x, maxPosition.x)),
        y: Math.max(parentRect.y + topPadding, Math.min(position.y, maxPosition.y))
      },
      parentId: selectedParentId,
    };
  }
}
