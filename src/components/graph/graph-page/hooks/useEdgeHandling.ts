/**
 * 边处理 Hook（简化版 - 新架构）
 *
 * 处理节点之间连接的创建
 */

import { useCallback } from 'react';
import { useGraphStore } from '@/stores/graph';
import { Connection } from 'reactflow';
import { nanoid } from 'nanoid';

export const useEdgeHandling = () => {
  const { addEdge } = useGraphStore();

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      const newEdge = {
        id: nanoid(),
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle || undefined,
        targetHandle: connection.targetHandle || undefined,
        data: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addEdge(newEdge);
    },
    [addEdge]
  );

  return {
    onConnect,
  };
};
