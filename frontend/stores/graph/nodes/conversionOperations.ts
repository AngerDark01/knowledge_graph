import { Node, Group, Edge, BlockEnum } from '@/types/graph/models';
import { getAllDescendants } from '@/utils/graph/nestingHelpers';

/**
 * 转换操作扩展类型定义
 */
export type ConversionNode = (Node | Group) & {
  convertedFrom?: BlockEnum.NODE | BlockEnum.GROUP;
  isConverted?: boolean;
  savedChildren?: (Node | Group)[];
  savedEdges?: Edge[];
  originalPosition?: { x: number; y: number };
  originalSize?: { width: number; height: number };
};

/**
 * 转换操作切片接口
 */
export interface ConversionOperationsSlice {
  convertNodeToGroup: (nodeId: string) => void;
  convertGroupToNode: (groupId: string) => void;
}

/**
 * 创建转换操作切片
 */
export const createConversionOperationsSlice = (set: any, get: any): ConversionOperationsSlice => ({
  /**
   * 將节点转换为群组
   * @param nodeId 要转换的节点ID
   */
  convertNodeToGroup: (nodeId: string) => {
    const state = get();
    const { nodes, edges } = state;
    const node = nodes.find((n: Node | Group) => n.id === nodeId);

    if (!node) {
      console.error(`Node with ID ${nodeId} does not exist`);
      return;
    }

    // 如果已经是群组，不需要转换
    if (node.type === BlockEnum.GROUP) {
      console.log(`Node with ID ${nodeId} is already a group`);
      return;
    }

    console.log(`🔄 转换节点 ${nodeId} 为群组`);

    // 如果这是一个从群组转换来的节点（即支持双向转换）
    if (node.isConverted && node.convertedFrom === BlockEnum.GROUP) {
      // 从保存的数据恢复群组
      const savedChildren: (Node | Group)[] = (node as any).savedChildren || [];
      const savedEdges: Edge[] = (node as any).savedEdges || [];

      // 创建新群组
      const group: Group = {
        ...node,
        type: BlockEnum.GROUP,
        nodeIds: savedChildren.map(child => child.id),
        collapsed: false,
        boundary: {
          minX: 0,
          minY: 0,
          maxX: node.width || 300,
          maxY: node.height || 200
        },
        convertedFrom: BlockEnum.GROUP, // 保持原始类型
        isConverted: true,
      } as Group;

      // ✅ 恢复隐藏的子节点和边
      const updatedNodes = nodes.map((n: Node | Group) => {
        // 替换转换的节点为群组
        if (n.id === nodeId) {
          return group;
        }

        // 如果是被这个转换隐藏的子节点，恢复它们
        if ((n as any)._hiddenByConversion && (n as any)._parentConvertedId === nodeId) {
          const { _hiddenByConversion, _parentConvertedId, ...cleanNode } = n as any;
          return cleanNode;
        }

        return n;
      });

      // ✅ 恢复隐藏的边
      const updatedEdges = edges.map((edge: Edge) => {
        // 如果是被这个转换隐藏的边，恢复它们
        if ((edge as any)._hiddenByConversion && (edge as any)._parentConvertedId === nodeId) {
          const { _hiddenByConversion, _parentConvertedId, ...cleanEdge } = edge as any;
          return cleanEdge;
        }
        return edge;
      });

      set({
        nodes: updatedNodes,
        edges: updatedEdges
      });

      // 添加历史记录快照
      if (get().addHistorySnapshot) {
        get().addHistorySnapshot();
      }

      // 强制触发节点类型变化，让ReactFlow重新渲染
      console.log('🔄 Node to group conversion completed, triggering UI update');
    } else {
      // 创建新的群组，不包含子节点
      const group: Group = {
        ...node,
        type: BlockEnum.GROUP,
        nodeIds: [],
        collapsed: false,
        boundary: {
          minX: 0,
          minY: 0,
          maxX: node.width || 300,
          maxY: node.height || 200
        },
        convertedFrom: BlockEnum.NODE,
        isConverted: true,
      } as Group;

      // 更新节点数组
      const updatedNodes = nodes.map((n: Node | Group) =>
        n.id === nodeId ? group : n
      );

      set({ nodes: updatedNodes });

      // 添加历史记录快照
      if (get().addHistorySnapshot) {
        get().addHistorySnapshot();
      }
    }
  },

  /**
   * 將群组转换为节点
   * @param groupId 要转换的群组ID
   */
  convertGroupToNode: (groupId: string) => {
    const state = get();
    const { nodes, edges } = state;
    const node = nodes.find((n: Node | Group) => n.id === groupId);

    // 检查节点是否存在
    if (!node) {
      console.error(`Node/Group with ID ${groupId} does not exist`);
      return;
    }

    // 如果已经是节点类型，不再进行转换
    if (node.type === BlockEnum.NODE) {
      console.log(`Node with ID ${groupId} is already a node`);
      return;
    }

    console.log(`🔄 转换群组 ${groupId} 为节点`);

    // 获取所有子节点（包括嵌套子群组的所有子节点）
    const allDescendants = getAllDescendants(groupId, nodes);
    const childNodes = allDescendants.filter(n => n.id !== groupId);

    // 获取与这些子节点相关的边
    const childNodeIds = new Set(childNodes.map(n => n.id));
    const edgesToSave = edges.filter((edge: Edge) =>
      childNodeIds.has(edge.source) || childNodeIds.has(edge.target)
    );

    // 获取与群组本身相关的边
    const groupRelatedEdges = edges.filter((edge: Edge) =>
      edge.source === groupId || edge.target === groupId
    );

    // ✅ 关键改变：隐藏子节点，而不是删除
    const updatedNodes = nodes.map((n: Node | Group) => {
      // 如果是要转换的群组，转换为 NoteNode
      if (n.id === groupId) {
        const convertedNode: Node = {
          ...node,
          type: BlockEnum.NODE,
          convertedFrom: BlockEnum.GROUP,
          isConverted: true,
          savedChildren: childNodes,
          savedEdges: [...edgesToSave, ...groupRelatedEdges],
          originalPosition: { x: node.position.x, y: node.position.y },
          originalSize: { width: node.width, height: node.height },
        } as Node;
        return convertedNode;
      }

      // 如果是子节点，标记为隐藏（但保留在 store 中）
      if (childNodes.some(child => child.id === n.id)) {
        return {
          ...n,
          _hiddenByConversion: true,  // 标记为被转换隐藏
          _parentConvertedId: groupId  // 记录父节点ID，方便恢复
        } as any;
      }

      return n;
    });

    // 同样标记边为隐藏
    const updatedEdges = edges.map((edge: Edge) => {
      // 如果边与被隐藏的子节点相关，也标记为隐藏
      if (childNodeIds.has(edge.source) || childNodeIds.has(edge.target)) {
        return {
          ...edge,
          _hiddenByConversion: true,
          _parentConvertedId: groupId
        } as any;
      }
      return edge;
    });

    set({
      nodes: updatedNodes,
      edges: updatedEdges
    });

    // 添加历史记录快照
    if (get().addHistorySnapshot) {
      get().addHistorySnapshot();
    }

    // 强制触发节点类型变化，让ReactFlow重新渲染
    console.log('🔄 Group to node conversion completed, triggering UI update');
  }
});