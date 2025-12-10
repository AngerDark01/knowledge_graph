'use client';

import { useEffect } from 'react';
import { WorkspaceLayout } from '@/components/workspace/WorkspaceLayout';
import { useWorkspaceStore } from '@/stores/workspace';
import { DEFAULT_USER, DEFAULT_CANVAS } from '@/types/workspace/models';

// 旧版本布局（用于回退）
import GraphPage from '@/components/graph/core';

// 功能开关：是否启用新布局
const USE_NEW_LAYOUT = process.env.NEXT_PUBLIC_USE_NEW_LAYOUT !== 'false'; // 默认启用

function LegacyLayout() {
  return (
    <div className="flex flex-col h-screen w-full">
      <header className="bg-gray-100 dark:bg-gray-800 p-4 border-b">
        <h1 className="text-xl font-bold">Knowledge Graph Editor (Legacy)</h1>
      </header>
      <main className="flex-1">
        <GraphPage />
      </main>
    </div>
  );
}

export default function Home() {
  const initializeWorkspace = useWorkspaceStore((state) => state.initializeWorkspace);
  const setUser = useWorkspaceStore((state) => state.setUser);

  useEffect(() => {
    // 初始化工作空间（使用默认数据）
    // TODO: 在阶段7将从文件加载数据
    const initDefaultWorkspace = () => {
      try {
        console.log('🔧 初始化默认工作空间...');

        // 设置默认用户
        setUser(DEFAULT_USER);

        // 初始化默认画布
        initializeWorkspace(
          [DEFAULT_CANVAS],
          [
            {
              id: DEFAULT_CANVAS.id,
              name: DEFAULT_CANVAS.name,
              isCollapsed: false,
              children: [],
            },
          ],
          DEFAULT_CANVAS.id
        );

        console.log('✅ 工作空间初始化完成');
      } catch (error) {
        console.error('❌ 工作空间初始化失败:', error);
      }
    };

    initDefaultWorkspace();
  }, [initializeWorkspace, setUser]);

  // 根据功能开关返回不同的布局
  if (!USE_NEW_LAYOUT) {
    return <LegacyLayout />;
  }

  return <WorkspaceLayout />;
}
