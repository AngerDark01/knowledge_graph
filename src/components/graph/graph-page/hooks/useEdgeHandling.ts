import { useCallback } from 'react';
import { Connection, Edge } from 'reactflow';
import { useGraphStore } from '@/stores/graph';
import { BlockEnum, Node } from '@/types/graph/models';

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
      const sourceNode = allNodes.find(n => n.id === params.source) as Node | undefined;
      const targetNode = allNodes.find(n => n.id === params.target) as Node | undefined;

      // 确保 source 和 target 不是 null
      if (!params.source || !params.target) {
        console.error("Invalid connection: source or target is null");
        return;
      }

      // 检查子节点与父节点的连接限制
      // 阻止子节点与自己的父群组连接
      if (sourceNode?.type === BlockEnum.NODE && sourceNode.groupId === params.target) {
        console.log("Cannot connect child node to its parent group");
        return;
      }
      
      if (targetNode?.type === BlockEnum.NODE && targetNode.groupId === params.source) {
        console.log("Cannot connect child node to its parent group");
        return;
      }
      
      // 确定是否为跨群关系
      const isCrossGroup = sourceNode?.groupId && targetNode?.groupId && sourceNode.groupId !== targetNode.groupId;
      
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
      
      // 如果是跨群关系，添加特殊样式和属性
      if (isCrossGroup) {
        newEdgeData.data = {
          isCrossGroup: true,
          sourceGroupId: sourceNode?.groupId,
          targetGroupId: targetNode?.groupId,
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