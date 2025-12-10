'use client';

import React from 'react';
import { LeftSidebar } from './sidebar/LeftSidebar';
import { RightSidebar } from './sidebar/RightSidebar';
import GraphPage from '@/components/graph/core';

export const WorkspaceLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* 左侧边栏 */}
      <LeftSidebar />

      {/* 中间画布区域 */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <header className="bg-gray-100 dark:bg-gray-800 p-4 border-b flex-shrink-0">
          <h1 className="text-xl font-bold">Knowledge Graph Editor</h1>
        </header>
        <main className="flex-1 overflow-hidden">
          <GraphPage />
        </main>
      </div>

      {/* 右侧边栏 */}
      <RightSidebar />
    </div>
  );
};
