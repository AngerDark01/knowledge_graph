import React, { memo, useState, useCallback, useEffect } from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';
import MarkdownRenderer from '../ui/MarkdownRenderer';
import { useGraphStore } from '@/stores/graph';
import { useNodeExpansion } from '../core/hooks';
import { BlockEnum } from '@/types/graph/models';

interface NoteNodeData {
  title: string;
  content?: string;
  validationError?: string;
  isExpanded?: boolean;
}

const NoteNode: React.FC<NodeProps<NoteNodeData>> = ({ id, data, selected, ...rest }) => {
  const { updateNode, getNodeById } = useGraphStore();
  const nodeData = getNodeById(id);
  
  const { isExpanded, toggleExpand } = useNodeExpansion({ 
    id, 
    initialExpandedState: nodeData?.isExpanded ?? data.isExpanded ?? false,
    nodeData
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(data.content || '');
  const [editTitle, setEditTitle] = useState(data.title || '');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // 从store获取转换函数，这样可以订阅状态变化
  const { convertNodeToGroup } = useGraphStore();

  // 监听节点尺寸变化(用户手动调整)
  useEffect(() => {
    const currentNode = getNodeById(id);
    if (currentNode && isExpanded && currentNode.width && currentNode.height) {
      const currentWidth = currentNode.width;
      const currentHeight = currentNode.height;

      // 定义尺寸常量 - 根据HTML实际渲染大小调整
      const collapsedWidth = 350;
      const collapsedHeight = 280; // 增加到280以完整显示所有内容

      // 展开时的默认尺寸
      const defaultExpandedWidth = 600;
      const defaultExpandedHeight = 450;

      // 获取展开的目标尺寸
      const targetSize = currentNode.customExpandedSize || {
        width: defaultExpandedWidth,
        height: defaultExpandedHeight
      };

      // 检查用户是否手动调整了尺寸(与目标尺寸不同且不是收缩尺寸)
      const isManuallyResized =
        (currentWidth !== collapsedWidth || currentHeight !== collapsedHeight) &&
        (currentWidth !== targetSize.width || currentHeight !== targetSize.height);

      // 如果用户手动调整了尺寸,保存为自定义尺寸
      if (isManuallyResized && !currentNode.customExpandedSize) {
        console.log('💾 保存用户自定义展开尺寸:', { width: currentWidth, height: currentHeight });
        updateNode(id, {
          customExpandedSize: {
            width: currentWidth,
            height: currentHeight
          }
        });
      }
    }
  }, [id, getNodeById, isExpanded, nodeData?.width, nodeData?.height]);

  const handleToggleEdit = useCallback(() => {
    if (isEditing) {
      updateNode(id, { content: editContent });
    }
    setIsEditing(!isEditing);
  }, [isEditing, editContent, id, updateNode]);

  const handleTitleBlur = useCallback(() => {
    updateNode(id, { title: editTitle });
    setIsEditingTitle(false);
  }, [id, editTitle, updateNode]);

  const truncateContent = (text: string, maxLength: number = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const renderNodeContent = useCallback(() => {
    // 定义尺寸常量 - 根据HTML实际渲染大小调整
    const minWidth = 300;
    const minHeight = 240;

    return (
      <div className="flex flex-col h-full w-full" style={{ minWidth, minHeight }}>
        {/* 标题栏 - 包含展开/收缩按钮 */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-100 dark:border-gray-700">
          <div className="flex-1 min-w-0 mr-2">
            {isEditingTitle ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleBlur();
                  if (e.key === 'Escape') {
                    setEditTitle(data.title);
                    setIsEditingTitle(false);
                  }
                }}
                className="w-full px-2 py-1 text-base font-semibold bg-transparent border-b border-blue-500 focus:outline-none text-gray-900 dark:text-gray-100"
                autoFocus
              />
            ) : (
              <h3
                className="text-base font-semibold text-gray-900 dark:text-gray-100 cursor-text truncate"
                onDoubleClick={() => setIsEditingTitle(true)}
                title={editTitle}
              >
                {editTitle || data.title}
              </h3>
            )}
          </div>

          {/* 右侧按钮组 */}
          <div className="flex-shrink-0 flex items-center gap-1">
            {/* 编辑按钮 */}
            {!isEditing && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleEdit();
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors nodrag"
                title="Edit content"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}

            {/* 转换为群组按钮 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                convertNodeToGroup(id);  // ✅ 现在使用从hook获取的方法
              }}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors nodrag"
              title="转换为群组"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            {/* 展开/收缩按钮 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand();
              }}
              onMouseDown={(e) => {
                // 防止拖拽开始事件
                e.stopPropagation();
              }}
              onMouseUp={(e) => {
                // 防止拖拽结束事件
                e.stopPropagation();
              }}
              onMouseMove={(e) => {
                // 防止拖拽移动事件
                e.stopPropagation();
              }}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors nodrag"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* 内容区域 - 使用flex-1自动占据剩余空间 */}
        <div 
          className="flex-1 px-4 py-3 overflow-hidden nodrag nowheel"
          style={{
            minHeight: '100px', // 最小高度
          }}
        >
          {isEditing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onBlur={handleToggleEdit}
              className="w-full h-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-sm resize-none"
              placeholder="Enter markdown content..."
              autoFocus
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  handleToggleEdit();
                }
              }}
            />
          ) : (
            <div className="cursor-text overflow-y-auto h-full custom-scrollbar nowheel" onDoubleClick={handleToggleEdit}>
              {editContent ? (
                <MarkdownRenderer 
                  content={isExpanded ? editContent : truncateContent(editContent)} 
                />
              ) : (
                <p className="text-gray-400 dark:text-gray-500 text-sm italic">
                  Double-click to add content...
                </p>
              )}
            </div>
          )}
        </div>

        {/* 底部信息栏 - 使用absolute定位固定在底部 */}
        <div className="absolute bottom-0 left-0 right-0 flex-shrink-0 px-4 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 rounded-b-xl">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="font-medium">Note</span>
              </div>
              
              {editContent && (
                <span className="text-xs">
                  {editContent.length} chars
                </span>
              )}
            </div>
            
            <span className="text-xs">
              {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    );
  }, [isExpanded, isEditing, editContent, editTitle, isEditingTitle, data.title, handleToggleEdit, handleTitleBlur, toggleExpand, truncateContent]);

  return (
    <BaseNode 
      id={id} 
      data={data} 
      isGroup={false} 
      selected={selected}
      showResizeControl={true}
      minWidth={300}
      minHeight={240}
      isExpanded={isExpanded}
      renderContent={renderNodeContent}
    />
  );
};

export default memo(NoteNode);
