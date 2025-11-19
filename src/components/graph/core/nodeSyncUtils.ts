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
 * ⚡ 优化版：使用深度缓存，避免重复计算
 */
export const sortNodesByNestingLevel = (nodes: (Node | Group)[]): (Node | Group)[] => {
  const nodeMap = new Map<string, Node | Group>();
  const depthCache = new Map<string, number>();

  nodes.forEach(node => nodeMap.set(node.id, node));

  // ⚡ 优化：计算每个节点的深度（带缓存）
  const getDepth = (nodeId: string): number => {
    if (depthCache.has(nodeId)) {
      return depthCache.get(nodeId)!;
    }

    const node = nodeMap.get(nodeId);
    if (!node || !('groupId' in node) || !node.groupId) {
      depthCache.set(nodeId, 0);
      return 0;
    }

    const depth = 1 + getDepth(node.groupId);
    depthCache.set(nodeId, depth);
    return depth;
  };

  // ⚡ 优化：计算所有节点的深度并按深度排序（一次遍历）
  return [...nodes].sort((a, b) => getDepth(a.id) - getDepth(b.id));
};

// 将 store 节点同步到 ReactFlow 节点
// ⚡ 优化版：使用 Map 缓存，减少查找次数
export const syncStoreToReactFlowNodes = (
  storeNodes: (Node | Group)[],
  selectedNodeId: string | null,
  convertToRelativePositionImpl = convertToRelativePosition,
  safeNumberImpl = safeNumber
): ReactFlowNode[] => {
  // ⚡ 优化：创建节点 Map，避免重复 find 操作 (O(1) vs O(n))
  const nodesMap = new Map<string, Node | Group>();
  storeNodes.forEach(n => nodesMap.set(n.id, n));

  // ⚡ 优化：一次遍历构建转换节点集合
  const convertedNodeIds = new Set<string>();
  storeNodes.forEach(n => {
    if (n.isConverted && n.type === BlockEnum.NODE && n.convertedFrom === BlockEnum.GROUP) {
      convertedNodeIds.add(n.id);
    }
  });

  // 按嵌套层级排序（父节点在前）
  const sortedNodes = sortNodesByNestingLevel(storeNodes);

  // ⚡ 优化：合并 filter 和 map 为一次遍历
  const result: ReactFlowNode[] = [];

  for (const node of sortedNodes) {
    // 过滤逻辑
    if ((node as any)._hiddenByConversion) continue;
    if ((node as any).groupId && convertedNodeIds.has((node as any).groupId)) continue;

    // 映射逻辑（内联到循环中）
    const isGroup = node.type === BlockEnum.GROUP;

    if (isGroup) {
      const groupNode = node as Group;

      // ⚡ 优化：使用 Map 查找父群组（O(1) vs O(n)）
      const parentGroup = groupNode.groupId
        ? nodesMap.get(groupNode.groupId) as Group
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

      result.push({
        ...groupNode,
        id: groupNode.id,
        type: 'group',
        position: finalPosition,
        selected: node.id === selectedNodeId,
        draggable: true,
        resizable: true, // 🔧 启用resize功能
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
      } as ReactFlowNode);
    } else {
      const regularNode = node as Node & { groupId?: string };

      // ⚡ 优化：使用 Map 查找父群组（O(1) vs O(n)）
      const parentGroup = regularNode.groupId
        ? nodesMap.get(regularNode.groupId) as Group
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

      result.push({
        ...regularNode,
        id: regularNode.id,
        type: 'custom',
        position: finalPosition,
        selected: node.id === selectedNodeId,
        draggable: true,
        resizable: true, // 🔧 启用resize功能
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
      } as ReactFlowNode);
    }
  }

  return result;
};