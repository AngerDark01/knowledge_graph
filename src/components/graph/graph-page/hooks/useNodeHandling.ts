/**
 * 节点处理 Hook（简化版 - 新架构）
 *
 * 处理节点的拖放添加操作
 */

import { useCallback } from 'react';
import { useGraphStore } from '@/stores/graph';
import { createNode } from '@/utils/graph/nodeFactory';
import type { DragEvent } from 'react';

export const useNodeHandling = () => {
  const { addNode } = useGraphStore();

  const onNodeAdd = useCallback(
    (position: { x: number; y: number }, viewMode: 'note' | 'container' = 'note') => {
      const newNode = createNode({
        position,
        viewMode,
        title: viewMode === 'note' ? 'New Note' : 'New Container',
      });

      addNode(newNode);
      return newNode;
    },
    [addNode]
  );

  const onGroupAdd = useCallback(
    (position: { x: number; y: number }) => {
      return onNodeAdd(position, 'container');
    },
    [onNodeAdd]
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = {
        x: event.clientX,
        y: event.clientY,
      };

      if (type === 'note') {
        onNodeAdd(position, 'note');
      } else if (type === 'container') {
        onGroupAdd(position);
      }
    },
    [onNodeAdd, onGroupAdd]
  );

  return {
    onNodeAdd,
    onGroupAdd,
    onDragOver,
    onDrop,
  };
};
