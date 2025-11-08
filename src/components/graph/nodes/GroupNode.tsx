import React, { memo, useState, useCallback } from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';
import { useGraphStore } from '@/stores/graph';
import { Group } from '@/types/graph/models';

type GroupNodeProps = NodeProps<{
  title: string;
  content?: string;
  validationError?: string;
}>;

const GroupNode: React.FC<GroupNodeProps> = ({ id, data, selected, ...rest }) => {
  const { getNodeById, updateNode } = useGraphStore();
  const groupNode = getNodeById(id) as Group;
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(groupNode?.title || data.title || 'Group');

  // 计算群组中节点的数量
  const nodeCount = groupNode?.nodeIds ? groupNode.nodeIds.length : 0;

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

  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      updateNode(id, { title: titleValue });
      setIsEditingTitle(false);
    } else if (e.key === 'Escape') {
      setTitleValue(groupNode?.title || data.title || 'Group');
      setIsEditingTitle(false);
    }
  }, [id, titleValue, groupNode, data.title, updateNode]);

  return (
    <BaseNode 
      id={id} 
      data={data} 
      isGroup={true} 
      selected={selected} 
      groupNode={groupNode}
      showResizeControl={true}
      minWidth={250}
      minHeight={200}
    >
      {/* Group标题栏 - 固定在顶部，防止子节点重叠 */}
      <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-4 border-b border-blue-300/30 bg-blue-100/50 dark:bg-blue-900/20 rounded-t-2xl">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Group 图标 */}
          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md bg-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
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
              className="flex-1 min-w-0 px-2 py-1 text-sm font-semibold bg-white/70 dark:bg-gray-800/70 border border-blue-300 dark:border-blue-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
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
        
        {/* 节点数量徽章 */}
        <div className="flex-shrink-0 ml-2">
          <div className="px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-full border border-blue-300/50 dark:border-blue-700/50">
            {nodeCount}
          </div>
        </div>
      </div>

      {/* Group内容区域 - 为顶部标题栏留出48px空间 */}
      <div className="absolute top-12 left-0 right-0 bottom-0 rounded-b-2xl overflow-visible">
        {/* 子节点由ReactFlow自动渲染在这个区域内 */}
      </div>
    </BaseNode>
  );
};

export default memo(GroupNode);