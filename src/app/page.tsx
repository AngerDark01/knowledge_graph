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
    // 初始化工作空间
    const initWorkspace = async () => {
      try {
        console.log('🔧 正在加载工作空间...');

        // 尝试从文件加载工作空间数据
        const response = await fetch('/api/workspace/load');

        if (response.ok) {
          const data = await response.json();
          const { workspace } = data;

          console.log('📂 从文件加载工作空间:', workspace);

          // 设置用户
          setUser({
            id: workspace.userId,
            name: '默认用户',
            createdAt: new Date(),
          });

          // 初始化工作空间
          initializeWorkspace(
            workspace.canvases,
            workspace.canvasTree,
            workspace.currentCanvasId
          );

          // 加载当前画布数据到 graphStore
          const { loadCanvasData } = await import('@/utils/workspace/canvasSync');
          loadCanvasData(workspace.currentCanvasId);

          console.log('✅ 工作空间加载成功');
        } else {
          // 文件不存在或加载失败，使用默认数据
          console.log('📝 使用默认工作空间');
          initDefaultWorkspace();
        }
      } catch (error) {
        console.error('❌ 加载工作空间失败，使用默认数据:', error);
        initDefaultWorkspace();
      }
    };

    // 初始化默认工作空间（降级方案）
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

        console.log('✅ 默认工作空间初始化完成');
      } catch (error) {
        console.error('❌ 工作空间初始化失败:', error);
      }
    };

    initWorkspace();
  }, [initializeWorkspace, setUser]);

  // 根据功能开关返回不同的布局
  if (!USE_NEW_LAYOUT) {
    return <LegacyLayout />;
  }

  return <WorkspaceLayout />;
}
