import { Node, Group, BlockEnum } from '@/types/graph/models';
import { Node as ReactFlowNode } from 'reactflow';

// 安全数值验证
export const safeNumber = (value: any, defaultValue: number = 0): number => {
  const num = Number(value);
  return typeof num === 'number' && !isNaN(num) && isFinite(num) ? num : defaultValue;
};

// 转换为相对坐标
export const convertToRelativePosition = (
  node: Node | Group, 
  parentGroup?: Group,
  safeNumberImpl: (value: any, defaultValue: number) => number = safeNumber
): { x: number; y: number } => {
  if (!parentGroup) return node.position;

  return {
    x: safeNumberImpl(node.position.x, 0) - safeNumberImpl(parentGroup.position.x, 0),
    y: safeNumberImpl(node.position.y, 0) - safeNumberImpl(parentGroup.position.y, 0)
  };
};

// 转换为绝对坐标
export const convertToAbsolutePosition = (
  relativePos: { x: number; y: number }, 
  parentGroup: Group,
  safeNumberImpl: (value: any, defaultValue: number) => number = safeNumber
): { x: number; y: number } => {
  return {
    x: safeNumberImpl(relativePos.x, 0) + safeNumberImpl(parentGroup.position.x, 0),
    y: safeNumberImpl(relativePos.y, 0) + safeNumberImpl(parentGroup.position.y, 0)
  };
};

/**
 * 按嵌套层级排序节点（父节点必须在子节点之前）
 * ReactFlow 要求：父节点必须在 nodes 数组中出现在子节点之前
 */
export const sortNodesByNestingLevel = (nodes: (Node | Group)[]): (Node | Group)[] => {
  const nodeMap = new Map<string, Node | Group>();
  nodes.forEach(node => nodeMap.set(node.id, node));

  const sorted: (Node | Group)[] = [];
  const visited = new Set<string>();

  // 递归添加节点及其所有祖先
  const addNodeWithAncestors = (node: Node | Group) => {
    if (visited.has(node.id)) return;

    // 如果节点有父群组，先添加父群组
    if ('groupId' in node && node.groupId) {
      const parent = nodeMap.get(node.groupId);
      if (parent) {
        addNodeWithAncestors(parent);
      }
    }

    // 然后添加当前节点
    if (!visited.has(node.id)) {
      visited.add(node.id);
      sorted.push(node);
    }
  };

  // 遍历所有节点
  nodes.forEach(node => addNodeWithAncestors(node));

  return sorted;
};

// 将 store 节点同步到 ReactFlow 节点
export const syncStoreToReactFlowNodes = (
  storeNodes: (Node | Group)[],
  selectedNodeId: string | null,
  convertToRelativePositionImpl = convertToRelativePosition,
  safeNumberImpl = safeNumber
): ReactFlowNode[] => {
  // 先按嵌套层级排序（父节点在前）
  const sortedNodes = sortNodesByNestingLevel(storeNodes);

  return sortedNodes.map((node: Node | Group) => {
    const isGroup = node.type === BlockEnum.GROUP;

    if (isGroup) {
      const groupNode = node as Group;

      // 🔧 支持 Group 嵌套：如果 Group 有 groupId，需要转换为相对坐标
      const parentGroup = groupNode.groupId
        ? storeNodes.find(n => n.id === groupNode.groupId) as Group
        : undefined;

      const safeGroupPosition = {
        x: safeNumberImpl(groupNode.position.x, 0),
        y: safeNumberImpl(groupNode.position.y, 0),
      };

      // 如果在父群组内，使用相对坐标
      const position = parentGroup
        ? convertToRelativePositionImpl({ ...groupNode, position: safeGroupPosition }, parentGroup, safeNumberImpl)
        : safeGroupPosition;

      const finalPosition = {
        x: safeNumberImpl(position.x, 0),
        y: safeNumberImpl(position.y, 0),
      };

      return {
        ...groupNode,
        id: groupNode.id,
        type: 'group',
        position: finalPosition,
        selected: node.id === selectedNodeId,
        draggable: true,
        // 🔧 如果 Group 有父群组，设置 parentId 和 extent
        ...(groupNode.groupId && {
          parentId: groupNode.groupId,
          extent: 'parent' as const,
          expandParent: true,
        }),
        style: {
          ...groupNode.style,
          width: safeNumberImpl(groupNode.width, 300),
          height: safeNumberImpl(groupNode.height, 200),
        },
        data: {
          ...groupNode.data,
          title: groupNode.title,
          content: groupNode.content,
          summary: groupNode.summary,
          tags: groupNode.tags,
          attributes: groupNode.attributes,
          validationError: groupNode.validationError,
        },
      };
    } else {
      const regularNode = node as Node & { groupId?: string };
      const parentGroup = regularNode.groupId 
        ? storeNodes.find(n => n.id === regularNode.groupId) as Group
        : undefined;
      
      const safeNodePosition = {
        x: safeNumberImpl(regularNode.position.x, 0),
        y: safeNumberImpl(regularNode.position.y, 0),
      };

      // 如果在群组内，使用相对坐标
      const position = parentGroup
        ? convertToRelativePositionImpl({ ...regularNode, position: safeNodePosition }, parentGroup, safeNumberImpl)
        : safeNodePosition;

      const finalPosition = {
        x: safeNumberImpl(position.x, 0),
        y: safeNumberImpl(position.y, 0),
      };
      
      return {
        ...regularNode,
        id: regularNode.id,
        type: 'custom',
        position: finalPosition,
        selected: node.id === selectedNodeId,
        draggable: true,
        ...(regularNode.groupId && { 
          parentId: regularNode.groupId,
          extent: 'parent' as const,
          expandParent: true,
        }),
        style: {
          ...(regularNode as any).style,
          width: safeNumberImpl(regularNode.width, 350),  // 🔧 NoteNode初始宽度
          height: safeNumberImpl(regularNode.height, 280), // 🔧 NoteNode初始高度
        },
        data: {
          ...regularNode.data,
          title: regularNode.title,
          content: regularNode.content,
          summary: regularNode.summary,
          tags: regularNode.tags,
          attributes: regularNode.attributes,
          validationError: regularNode.validationError,
        },
      };
    }
  });
};