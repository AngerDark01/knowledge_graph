/**
 * 节点处理 Hook（简化版 - 新架构）
 *
 * 处理节点的拖放添加操作
 */

import { useCallback } from 'react';
import { useGraphStore } from '@/stores/graph';
import { createNode } from '@/utils/graph/nodeFactory';
import type { DragEvent } from 'react';

interface NodeAddOptions {
  viewMode?: 'note' | 'container';
  parentId?: string;
}

export const useNodeHandling = () => {
  const { addNode, addChildToParent } = useGraphStore();

  const onNodeAdd = useCallback(
    (position: { x: number; y: number }, options?: NodeAddOptions) => {
      const viewMode = options?.viewMode || 'note';
      const parentId = options?.parentId;

      const newNode = createNode({
        position,
        viewMode,
        title: viewMode === 'note' ? 'New Note' : 'New Container',
      });

      // 先添加节点
      addNode(newNode);

      // 如果指定了 parentId，建立父子关系
      if (parentId) {
        addChildToParent(newNode.id, parentId);
      }

      return newNode;
    },
    [addNode, addChildToParent]
  );

  const onGroupAdd = useCallback(
    (position: { x: number; y: number }) => {
      return onNodeAdd(position, { viewMode: 'container' });
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
        onNodeAdd(position, { viewMode: 'note' });
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
