'use client';

import { useEffect } from 'react';
import WorkspaceLayout from '@/components/workspace/WorkspaceLayout';

export default function Home() {
  useEffect(() => {
    console.log('🔄 初始化多画布工作空间');
  }, []);

  return (
    <div className="flex flex-col h-screen w-full">
      <header className="bg-gray-100 dark:bg-gray-800 p-4 border-b">
        <h1 className="text-xl font-bold">多画布知识图谱编辑器</h1>
      </header>
      <main className="flex-1">
        <WorkspaceLayout />
      </main>
    </div>
  );
}