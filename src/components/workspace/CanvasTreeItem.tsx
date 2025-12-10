import React from 'react';
import { useWorkspaceStore } from '@/stores/workspace';
import { CanvasTreeNode } from '@/types/workspace/models';

interface CanvasTreeItemProps {
  node: CanvasTreeNode;
  currentCanvasId: string;
}

const CanvasTreeItem: React.FC<CanvasTreeItemProps> = ({ node, currentCanvasId }) => {
  const { switchCanvas, toggleCanvasCollapse, createCanvas, deleteCanvas } = useWorkspaceStore();
  const isCurrent = currentCanvasId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  const handleSwitchCanvas = () => {
    switchCanvas(node.id);
  };

  const handleToggleCollapse = () => {
    toggleCanvasCollapse(node.id);
  };

  const handleAddChildCanvas = () => {
    createCanvas('新画布', node.id);
  };

  const handleDeleteCanvas = () => {
    deleteCanvas(node.id);
  };

  return (
    <div className="select-none">
      <div
        className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-accent ${
          isCurrent ? 'bg-primary/10 border border-primary/30' : ''
        }`}
        onClick={handleSwitchCanvas}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleCollapse();
            }}
            className="mr-1 p-1 rounded hover:bg-muted"
          >
            <svg
              className={`w-4 h-4 transition-transform ${
                node.isCollapsed ? '' : 'rotate-90'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
        {!hasChildren && <span className="w-4 h-4 mr-1" />} {/* 保持对齐 */}
        
        <svg
          className="w-4 h-4 mr-2 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
        
        <span className="flex-1 truncate text-sm">{node.name}</span>
        
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddChildCanvas();
            }}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
            title="添加子画布"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteCanvas();
            }}
            className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
            title="删除画布"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {!node.isCollapsed && hasChildren && (
        <div className="ml-6 pl-2 border-l border-border space-y-1">
          {node.children.map((child) => (
            <CanvasTreeItem
              key={child.id}
              node={child}
              currentCanvasId={currentCanvasId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CanvasTreeItem;