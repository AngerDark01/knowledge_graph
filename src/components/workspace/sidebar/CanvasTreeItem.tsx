'use client';

import React, { useCallback, useMemo } from 'react';
import { useWorkspaceStore } from '@/stores/workspace';
import { CanvasTreeNode } from '@/types/workspace/models';
import {
  ChevronRight,
  ChevronDown,
  FileText,
  FolderClosed,
  FolderOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CanvasContextMenu } from './CanvasContextMenu';

interface CanvasTreeItemProps {
  node: CanvasTreeNode;
  level: number;
}

const CanvasTreeItemComponent: React.FC<CanvasTreeItemProps> = ({ node, level }) => {
  const currentCanvasId = useWorkspaceStore((state) => state.currentCanvasId);
  const toggleCanvasCollapse = useWorkspaceStore((state) => state.toggleCanvasCollapse);

  const isActive = currentCanvasId === node.id;
  const hasChildren = node.children.length > 0;

  const handleClick = useCallback(() => {
    // 动态导入以避免循环依赖
    import('@/utils/workspace/canvasSync').then(({ switchToCanvas }) => {
      switchToCanvas(node.id);
    });
  }, [node.id]);

  const handleToggleCollapse = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      toggleCanvasCollapse(node.id);
    }
  }, [hasChildren, node.id, toggleCanvasCollapse]);

  return (
    <div>
      <CanvasContextMenu canvasId={node.id}>
        <div
          className={cn(
            'group flex items-center px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent transition-colors',
            isActive && 'bg-accent font-medium'
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={handleClick}
        >
          {/* 折叠按钮 */}
          {hasChildren ? (
            <button
              className="mr-1 p-0.5 hover:bg-accent-foreground/10 rounded"
              onClick={handleToggleCollapse}
            >
              {node.isCollapsed ? (
                <ChevronRight className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          ) : (
            <span className="w-4 mr-1" />
          )}

          {/* 图标 */}
          {hasChildren ? (
            node.isCollapsed ? (
              <FolderClosed className="w-4 h-4 mr-2 text-muted-foreground" />
            ) : (
              <FolderOpen className="w-4 h-4 mr-2 text-muted-foreground" />
            )
          ) : (
            <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
          )}

          {/* 画布名称 */}
          <span className="flex-1 truncate text-sm">{node.name}</span>
        </div>
      </CanvasContextMenu>

      {/* 子画布 */}
      {hasChildren && !node.isCollapsed && (
        <div>
          {node.children.map((child) => (
            <CanvasTreeItem key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export const CanvasTreeItem = React.memo(CanvasTreeItemComponent);
