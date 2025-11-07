/**
 * Container 视图模式
 *
 * 显示为容器/群组，可以包含子节点
 */

import React, { memo, useState, useCallback } from 'react';
import { BaseNode } from '@/types/graph/models';
import { useGraphStore } from '@/stores/graph';
import BaseNode as BaseNodeComponent from '../BaseNode';
import NodeToolbar from '../NodeToolbar';

interface ContainerViewProps {
  id: string;
  node: BaseNode;
  selected?: boolean;
}

const ContainerView: React.FC<ContainerViewProps> = ({ id, node, selected }) => {
  const { updateNode } = useGraphStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(node.title || 'Container');

  // 标题编辑处理
  const handleTitleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingTitle(true);
  }, []);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleValue(e.target.value);
  }, []);

  const handleTitleBlur = useCallback(() => {
    updateNode(id, { title: titleValue });
    setIsEditingTitle(false);
  }, [id, titleValue, updateNode]);

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        updateNode(id, { title: titleValue });
        setIsEditingTitle(false);
      } else if (e.key === 'Escape') {
        setTitleValue(node.title || 'Container');
        setIsEditingTitle(false);
      }
    },
    [id, titleValue, node.title, updateNode]
  );

  return (
    <BaseNodeComponent
      id={id}
      data={{ title: node.title }}
      isGroup={true}
      selected={selected}
      showResizeControl={true}
      minWidth={300}
      minHeight={200}
    >
      {/* Container 标题栏 - 固定在顶部 */}
      <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-4 border-b border-purple-300/30 bg-purple-100/50 dark:bg-purple-900/20 rounded-t-2xl">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Container 图标 */}
          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md bg-purple-500/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-purple-600 dark:text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
          </div>

          {/* 标题 - 可编辑 */}
          {isEditingTitle ? (
            <input
              type="text"
              value={titleValue}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className="flex-1 min-w-0 px-2 py-1 text-sm font-semibold bg-white/70 dark:bg-gray-800/70 border border-purple-300 dark:border-purple-600 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 text-gray-900 dark:text-gray-100"
              autoFocus
            />
          ) : (
            <h3
              className="flex-1 min-w-0 text-sm font-semibold text-gray-900 dark:text-gray-100 cursor-text truncate"
              onDoubleClick={handleTitleDoubleClick}
              title={titleValue}
            >
              {titleValue}
            </h3>
          )}
        </div>

        {/* 工具栏 */}
        <div className="flex-shrink-0 ml-2">
          <NodeToolbar node={node} compact />
        </div>
      </div>

      {/* Container 内容区域 - 为顶部标题栏留出空间 */}
      <div className="absolute top-12 left-0 right-0 bottom-0 rounded-b-2xl overflow-visible">
        {/* 如果没有子节点，显示提示 */}
        {node.childrenIds.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm italic">
            Drag nodes here to add them to this container
          </div>
        )}

        {/* 如果折叠了，显示子节点统计 */}
        {!node.expanded && node.childrenIds.length > 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                {node.childrenIds.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {node.childrenIds.length === 1 ? 'item' : 'items'} hidden
              </div>
            </div>
          </div>
        )}

        {/* 子节点由 ReactFlow 自动渲染在这个区域内 */}
      </div>
    </BaseNodeComponent>
  );
};

export default memo(ContainerView);
