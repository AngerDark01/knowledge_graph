/**
 * 节点处理 Hook（简化版 - 新架构）
 *
 * 处理节点的拖放添加操作
 */

import { useCallback } from 'react';
import { useGraphStore } from '@/stores/graph';
import { createNode, calculateChildInitialPosition } from '@/utils/graph/nodeFactory';
import { getDefaultSize } from '@/types/graph/viewModes';
import type { DragEvent } from 'react';

interface NodeAddOptions {
  viewMode?: 'note' | 'container';
  parentId?: string;
}

export const useNodeHandling = () => {
  const { addNode, addChildToParent, getNodeById, getChildNodes } = useGraphStore();

  const onNodeAdd = useCallback(
    (position: { x: number; y: number }, options?: NodeAddOptions) => {
      const viewMode = options?.viewMode || 'note';
      const parentId = options?.parentId;

      // 🔥 如果指定了 parentId，计算容器内的合理初始位置
      let finalPosition = position;
      if (parentId) {
        const parentNode = getNodeById(parentId);
        if (parentNode && parentNode.viewMode === 'container') {
          const existingChildren = getChildNodes(parentId);
          const childSize = getDefaultSize(viewMode);

          finalPosition = calculateChildInitialPosition(
            parentNode,
            existingChildren,
            childSize
          );

          console.log(`📍 计算子节点初始位置:`, {
            parentId,
            existingChildrenCount: existingChildren.length,
            calculatedPosition: finalPosition,
          });
        }
      }

      const newNode = createNode({
        position: finalPosition,
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
    [addNode, addChildToParent, getNodeById, getChildNodes]
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
