import { useCallback } from 'react';
import { Connection, Edge } from 'reactflow';
import { useGraphStore } from '@/stores/graph';
import { BlockEnum, Node, Group } from '@/types/graph/models';
import { getLowestCommonAncestor } from '@/utils/graph/nestingHelpers';

export const useEdgeHandling = () => {
  const { addEdge, edges, getNodes } = useGraphStore();

  // 处理连接
  const onConnect = useCallback(
    (params: Connection) => {
      // 验证连接：避免自连接和重复连接
      if (params.source === params.target) {
        console.log("Self-connection is not allowed");
        return;
      }
      
      // 检查是否已存在相同的连接
      const duplicate = edges.some((edge: Edge) => 
        edge.source === params.source && 
        edge.target === params.target
      );
      
      if (duplicate) {
        console.log("Duplicate connection is not allowed");
        return;
      }

      // 获取所有节点信息
      const allNodes = getNodes();
      const sourceNode = allNodes.find(n => n.id === params.source) as Node | Group | undefined;
      const targetNode = allNodes.find(n => n.id === params.target) as Node | Group | undefined;

      // 确保 source 和 target 不是 null
      if (!params.source || !params.target) {
        console.error("Invalid connection: source or target is null");
        return;
      }

      // 检查子节点与父节点的连接限制
      // 阻止子节点与自己的直接父群组连接
      if ('groupId' in (sourceNode || {}) && sourceNode?.groupId === params.target) {
        console.log("Cannot connect child to its direct parent group");
        return;
      }

      if ('groupId' in (targetNode || {}) && targetNode?.groupId === params.source) {
        console.log("Cannot connect child to its direct parent group");
        return;
      }

      // 🔧 支持多层嵌套的跨群组判断
      // 只要两个节点不在同一个直接父群组中，就算跨群组
      let isCrossGroup = false;
      let sourceGroupId: string | undefined;
      let targetGroupId: string | undefined;

      // 获取直接父群组ID
      if ('groupId' in (sourceNode || {})) {
        sourceGroupId = sourceNode?.groupId;
      }
      if ('groupId' in (targetNode || {})) {
        targetGroupId = targetNode?.groupId;
      }

      // 判断是否跨群组
      if (sourceGroupId && targetGroupId) {
        // 两个节点都有父群组，检查是否是同一个直接父群组
        isCrossGroup = sourceGroupId !== targetGroupId;
      } else if (sourceGroupId || targetGroupId) {
        // 一个在群组内，一个在顶层，也算跨群组
        isCrossGroup = true;
      }

      console.log('🔗 创建连接:', {
        source: params.source,
        target: params.target,
        sourceGroupId,
        targetGroupId,
        isCrossGroup
      });
      
      // 构建边数据
      const newEdgeData: any = {
        id: `edge_${Date.now()}`,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle || undefined,
        targetHandle: params.targetHandle || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // 🔧 根据是否跨群组设置边的样式和属性
      if (isCrossGroup) {
        newEdgeData.data = {
          isCrossGroup: true,
          sourceGroupId,
          targetGroupId,
          strokeDasharray: '5,5',  // 虚线样式
          color: '#FFA500',        // 橙色
          strokeWidth: 2,          // 线宽2px
          direction: 'unidirectional' as const,  // 默认方向性
        };
      } else {
        // 群内关系使用默认样式，但确保线宽较细
        newEdgeData.data = {
          isCrossGroup: false,
          strokeWidth: 1,          // 线宽1px
          direction: 'unidirectional' as const,  // 默认方向性
        };
      }
      
      addEdge(newEdgeData);
    },
    [addEdge, edges, getNodes]
  );

  return {
    onConnect
  };
};