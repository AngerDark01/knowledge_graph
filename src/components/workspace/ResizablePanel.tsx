'use client';

import React, { ReactNode } from 'react';
import { useResizable } from '@/hooks/useResizable';

interface ResizablePanelProps {
  width: number;
  minWidth?: number;
  maxWidth?: number;
  onResize: (width: number) => void;
  direction: 'left' | 'right';
  children: ReactNode;
  className?: string;
}

const ResizablePanel: React.FC<ResizablePanelProps> = ({
  width,
  minWidth = 200,
  maxWidth = 800,
  onResize,
  direction,
  children,
  className = ''
}) => {
  const { width: currentWidth, startResizing } = useResizable({
    initialWidth: width,
    minWidth,
    maxWidth,
    onResize
  });

  return (
    <div
      className={`relative h-full flex flex-col ${className}`}
      style={{
        width: `${currentWidth}px`,
        minWidth: `${minWidth}px`,
        maxWidth: `${maxWidth}px`,
      }}
    >
      {children}

      {/* 拖拽手柄 */}
      <div
        className={`absolute top-0 ${direction === 'right' ? 'right-0' : 'left-0'} w-1 h-full cursor-col-resize z-10 flex items-center justify-center`}
        onMouseDown={startResizing}
        style={{ userSelect: 'none' }}
      >
        <div className="w-0.5 h-full bg-border rounded-full hover:bg-primary transition-colors" />
      </div>
    </div>
  );
};

export default ResizablePanel;