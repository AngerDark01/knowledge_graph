/**
 * Note 视图模式
 *
 * 显示笔记内容，支持展开/折叠
 */

import React, { memo, useState, useCallback, useEffect } from 'react';
import { BaseNode } from '@/types/graph/models';
import { useGraphStore } from '@/stores/graph';
import BaseNodeComponent from '../BaseNode';
import NodeToolbar from '../NodeToolbar';
import MarkdownRenderer from '../../MarkdownRenderer';

interface NoteViewProps {
  id: string;
  node: BaseNode;
  selected?: boolean;
}

const NoteView: React.FC<NoteViewProps> = ({ id, node, selected }) => {
  const { updateNode } = useGraphStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(node.content || '');
  const [editTitle, setEditTitle] = useState(node.title || '');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // 同步状态
  useEffect(() => {
    setEditContent(node.content || '');
    setEditTitle(node.title || '');
  }, [node.content, node.title]);

  // 切换编辑模式
  const handleToggleEdit = useCallback(() => {
    if (isEditing) {
      updateNode(id, { content: editContent });
    }
    setIsEditing(!isEditing);
  }, [isEditing, editContent, id, updateNode]);

  // 标题编辑
  const handleTitleBlur = useCallback(() => {
    updateNode(id, { title: editTitle });
    setIsEditingTitle(false);
  }, [id, editTitle, updateNode]);

  // 截断内容
  const truncateContent = (text: string, maxLength: number = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // 渲染内容
  const renderContent = useCallback(() => {
    return (
      <div className="flex flex-col h-full w-full">
        {/* 标题栏 */}
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
                    setEditTitle(node.title);
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
                {editTitle || node.title}
              </h3>
            )}
          </div>

          {/* 工具栏 */}
          <NodeToolbar node={node} onEdit={handleToggleEdit} />
        </div>

        {/* 内容区域 */}
        <div
          className="flex-1 px-4 py-3 overflow-hidden nodrag"
          style={{ minHeight: '100px' }}
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
            <div
              className="cursor-text overflow-y-auto h-full custom-scrollbar"
              onDoubleClick={handleToggleEdit}
            >
              {editContent ? (
                <MarkdownRenderer
                  content={node.expanded ? editContent : truncateContent(editContent)}
                />
              ) : (
                <p className="text-gray-400 dark:text-gray-500 text-sm italic">
                  Double-click to add content...
                </p>
              )}
            </div>
          )}
        </div>

        {/* 底部信息栏 */}
        <div className="absolute bottom-0 left-0 right-0 flex-shrink-0 px-4 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 rounded-b-xl">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="font-medium">Note</span>
              </div>

              {editContent && <span className="text-xs">{editContent.length} chars</span>}

              {node.childrenIds.length > 0 && (
                <span className="text-xs">
                  {node.childrenIds.length} {node.childrenIds.length === 1 ? 'child' : 'children'}
                </span>
              )}
            </div>

            <span className="text-xs">
              {new Date(node.updatedAt).toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: '2-digit',
              })}
            </span>
          </div>
        </div>
      </div>
    );
  }, [
    node,
    isEditing,
    editContent,
    editTitle,
    isEditingTitle,
    handleToggleEdit,
    handleTitleBlur,
  ]);

  return (
    <BaseNodeComponent
      id={id}
      data={{ title: node.title, content: node.content }}
      isGroup={false}
      selected={selected}
      showResizeControl={true}
      minWidth={300}
      minHeight={240}
      renderContent={renderContent}
    />
  );
};

export default memo(NoteView);
