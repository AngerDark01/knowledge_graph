/**
 * 统一节点工具栏
 *
 * 为所有节点提供一致的工具栏 UI
 * 包括：编辑、视图模式切换、展开/折叠等功能
 */

import React, { memo, useCallback } from 'react';
import { BaseNode } from '@/types/graph/unifiedNode';
import { ViewMode } from '@/types/graph/viewModes';
import { useGraphStore } from '@/stores/graph';

interface NodeToolbarProps {
  node: BaseNode;
  onEdit?: () => void;
  showConvertButton?: boolean;
  showExpandButton?: boolean;
  compact?: boolean;
}

const NodeToolbar: React.FC<NodeToolbarProps> = ({
  node,
  onEdit,
  showConvertButton = true,
  showExpandButton = true,
  compact = false,
}) => {
  const { switchViewMode, toggleNodeExpanded } = useGraphStore();

  // 视图模式转换
  const handleConvertViewMode = useCallback(() => {
    const targetMode: ViewMode = node.viewMode === 'note' ? 'container' : 'note';
    switchViewMode(node.id, targetMode);
  }, [node.id, node.viewMode, switchViewMode]);

  // 展开/折叠
  const handleToggleExpand = useCallback(() => {
    toggleNodeExpanded(node.id);
  }, [node.id, toggleNodeExpanded]);

  return (
    <div className="flex items-center gap-1">
      {/* 编辑按钮 */}
      {onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors nodrag"
          title="Edit content"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-gray-600 dark:text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
      )}

      {/* 视图模式切换按钮 */}
      {showConvertButton && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleConvertViewMode();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onMouseMove={(e) => e.stopPropagation()}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors nodrag"
          title={node.viewMode === 'note' ? 'Convert to Container' : 'Convert to Note'}
        >
          {node.viewMode === 'note' ? (
            // 转换为容器的图标
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
          ) : (
            // 转换为笔记的图标
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-blue-600 dark:text-blue-400"
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
          )}
        </button>
      )}

      {/* 展开/折叠按钮 */}
      {showExpandButton && node.childrenIds.length > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleExpand();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onMouseMove={(e) => e.stopPropagation()}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors nodrag"
          title={node.expanded ? 'Collapse children' : 'Expand children'}
        >
          {node.expanded ? (
            // 折叠图标
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-gray-600 dark:text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          ) : (
            // 展开图标
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-gray-600 dark:text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          )}
        </button>
      )}

      {/* 子节点数量徽章 */}
      {node.childrenIds.length > 0 && !compact && (
        <div className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full border border-gray-300 dark:border-gray-600">
          {node.childrenIds.length}
        </div>
      )}
    </div>
  );
};

export default memo(NodeToolbar);
