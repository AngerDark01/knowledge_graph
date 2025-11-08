import { Node, Group, BlockEnum } from '@/types/graph/models';
import { useGraphStore } from '@/stores/graph';

export interface BindingStrategy {
  bindNodeToGroup(node: Node, groupId?: string): Node;
}

export class GroupSelectionBindingStrategy implements BindingStrategy {
  bindNodeToGroup(node: Node, selectedGroupId?: string): Node {
    if (!selectedGroupId) return node;
    
    // 获取选中的群组信息
    const group = useGraphStore.getState().getNodeById(selectedGroupId) as Group;
    if (!group) return node;
    
    // 计算节点在群组内部的合理位置
    const groupRect = {
      x: group.position.x,
      y: group.position.y,
      width: group.width || 300,
      height: group.height || 200
    };
    
    // 计算群组内已有的节点，找到一个合适的位置
    const groupNodes = useGraphStore.getState().getNodes()
      .filter(n => n.groupId === selectedGroupId && n.type === BlockEnum.NODE) as Node[];
    
    // 简单策略：按顺序排列节点
    const nodeWidth = 150;
    const nodeHeight = 100;
    const padding = 20;
    const cols = Math.floor((groupRect.width - padding * 2) / (nodeWidth + padding));
    const col = groupNodes.length % cols;
    const row = Math.floor(groupNodes.length / cols);
    
    // 确保节点在群组边界内
    const position = {
      x: groupRect.x + padding + col * (nodeWidth + padding),
      y: groupRect.y + padding + row * (nodeHeight + padding)
    };
    
    // 检查是否超出群组边界
    const maxPosition = {
      x: groupRect.x + groupRect.width - nodeWidth - padding,
      y: groupRect.y + groupRect.height - nodeHeight - padding
    };
    
    return {
      ...node,
      position: {
        x: Math.min(position.x, maxPosition.x),
        y: Math.min(position.y, maxPosition.y)
      },
      groupId: selectedGroupId,
      parentId: selectedGroupId
    };
  }
}