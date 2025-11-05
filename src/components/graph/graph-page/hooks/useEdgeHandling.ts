import { useCallback } from 'react';
import { Connection, Edge } from 'reactflow';
import { useGraphStore } from '@/stores/graph';

export const useEdgeHandling = () => {
  const { addEdge, edges } = useGraphStore();

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

      // 确保 source 和 target 不是 null
      if (!params.source || !params.target) {
        console.error("Invalid connection: source or target is null");
        return;
      }

      const newEdge = {
        id: `edge_${Date.now()}`,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle || undefined,
        targetHandle: params.targetHandle || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addEdge(newEdge);
    },
    [addEdge, edges]
  );

  return {
    onConnect
  };
};