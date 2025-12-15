'use client';

import React from 'react';
import { useResizable } from '@/hooks/useResizable';
import { cn } from '@/lib/utils';

interface ResizablePanelProps {
  side: 'left' | 'right';
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  children: React.ReactNode;
  className?: string;
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  side,
  initialWidth = 300,
  minWidth = 200,
  maxWidth = 600,
  children,
  className,
}) => {
  const { width, isResizing, handleMouseDown } = useResizable({
    initialWidth,
    minWidth,
    maxWidth,
    storageKey: `kg-editor:sidebar-width:${side}`,
  });

  return (
    <div
      className={cn(
        'relative flex-shrink-0 bg-background border-border',
        side === 'left' ? 'border-r' : 'border-l',
        className
      )}
      style={{ width: `${width}px` }}
    >
      {children}

      {/* 调整手柄 */}
      <div
        className={cn(
          'absolute top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/20 transition-colors',
          side === 'left' ? 'right-0' : 'left-0',
          isResizing && 'bg-primary/40'
        )}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};
