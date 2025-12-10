'use client';

import React from 'react';
import { ResizablePanel } from './ResizablePanel';
import { useWorkspaceStore } from '@/stores/workspace';

export const LeftSidebar: React.FC = () => {
  const user = useWorkspaceStore((state) => state.user);

  return (
    <ResizablePanel side="left" initialWidth={280} minWidth={200} maxWidth={500}>
      <div className="flex flex-col h-full">
        {/* 用户信息区 */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground">ID: {user.id}</p>
            </div>
          </div>
        </div>

        {/* 画布树区（占位） */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="text-sm text-muted-foreground text-center py-8">
            画布树组件将在阶段4实现
          </div>
        </div>
      </div>
    </ResizablePanel>
  );
};
