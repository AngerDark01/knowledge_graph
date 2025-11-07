/**
 * 节点适配器 - 兼容层
 *
 * 用于在旧模型（Node/Group）和新模型（BaseNode）之间转换
 * 支持渐进式迁移
 */

import { Node, Group, BlockEnum } from '@/types/graph/models';
import { BaseNode } from '@/types/graph/unifiedNode';
import { getDefaultSize } from '@/types/graph/viewModes';

/**
 * 将旧的 Node 转换为 BaseNode
 */
export const nodeToBaseNode = (node: Node): BaseNode => {
  return {
    id: node.id,
    position: node.position,
    width: node.width ?? 350,
    height: node.height ?? 280,
    viewMode: 'note',
    expanded: node.isExpanded ?? false,
    title: node.title,
    content: node.content,
    summary: node.summary,
    tags: node.tags,
    attributes: node.attributes,
    parentId: node.parentId || node.groupId, // 兼容 groupId
    childrenIds: [], // 旧 Node 没有记录子节点
    selected: node.selected,
    dragging: node.dragging,
    isEditing: node.isEditing,
    validationError: node.validationError,
    style: node.style,
    customExpandedSize: node.customExpandedSize,
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
    data: node.data,
  };
};

/**
 * 将旧的 Group 转换为 BaseNode
 */
export const groupToBaseNode = (group: Group): BaseNode => {
  return {
    id: group.id,
    position: group.position,
    width: group.width ?? 400,
    height: group.height ?? 300,
    viewMode: 'container',
    expanded: !group.collapsed, // collapsed 反转为 expanded
    title: group.title,
    content: group.content,
    summary: group.summary,
    tags: group.tags,
    attributes: group.attributes,
    parentId: group.parentId,
    childrenIds: group.nodeIds || [], // 使用 nodeIds
    selected: group.selected,
    dragging: group.dragging,
    isEditing: group.isEditing,
    style: group.style,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
    data: group.data,
  };
};

/**
 * 将 BaseNode 转换回旧的 Node
 */
export const baseNodeToNode = (baseNode: BaseNode): Node => {
  return {
    id: baseNode.id,
    type: BlockEnum.NODE,
    position: baseNode.position,
    width: baseNode.width,
    height: baseNode.height,
    title: baseNode.title,
    content: baseNode.content,
    summary: baseNode.summary,
    tags: baseNode.tags,
    attributes: baseNode.attributes,
    parentId: baseNode.parentId,
    groupId: baseNode.parentId, // 兼容 groupId
    isExpanded: baseNode.expanded,
    selected: baseNode.selected,
    dragging: baseNode.dragging,
    isEditing: baseNode.isEditing,
    validationError: baseNode.validationError,
    style: baseNode.style,
    customExpandedSize: baseNode.customExpandedSize,
    createdAt: baseNode.createdAt,
    updatedAt: baseNode.updatedAt,
    data: baseNode.data,
  };
};

/**
 * 将 BaseNode 转换回旧的 Group
 */
export const baseNodeToGroup = (baseNode: BaseNode): Group => {
  return {
    id: baseNode.id,
    type: BlockEnum.GROUP,
    position: baseNode.position,
    width: baseNode.width,
    height: baseNode.height,
    title: baseNode.title,
    content: baseNode.content,
    summary: baseNode.summary,
    tags: baseNode.tags,
    attributes: baseNode.attributes,
    parentId: baseNode.parentId,
    collapsed: !baseNode.expanded, // expanded 反转为 collapsed
    nodeIds: baseNode.childrenIds,
    boundary: {
      minX: baseNode.position.x,
      minY: baseNode.position.y,
      maxX: baseNode.position.x + baseNode.width,
      maxY: baseNode.position.y + baseNode.height,
    },
    selected: baseNode.selected,
    dragging: baseNode.dragging,
    isEditing: baseNode.isEditing,
    style: baseNode.style,
    createdAt: baseNode.createdAt,
    updatedAt: baseNode.updatedAt,
    data: baseNode.data,
  };
};

/**
 * 自动检测并转换为 BaseNode
 */
export const toBaseNode = (node: Node | Group): BaseNode => {
  if (node.type === BlockEnum.NODE) {
    return nodeToBaseNode(node as Node);
  } else {
    return groupToBaseNode(node as Group);
  }
};

/**
 * 将 BaseNode 转换回原始类型
 */
export const fromBaseNode = (baseNode: BaseNode): Node | Group => {
  if (baseNode.viewMode === 'note') {
    return baseNodeToNode(baseNode);
  } else {
    return baseNodeToGroup(baseNode);
  }
};

/**
 * 批量转换
 */
export const toBaseNodes = (nodes: (Node | Group)[]): BaseNode[] => {
  return nodes.map(toBaseNode);
};

/**
 * 批量转换回原始类型
 */
export const fromBaseNodes = (baseNodes: BaseNode[]): (Node | Group)[] => {
  return baseNodes.map(fromBaseNode);
};
