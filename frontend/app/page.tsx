'use client';

import { useEffect, useState } from 'react';
import { WorkspaceLayout } from '@/components/workspace/WorkspaceLayout';
import { useWorkspaceStore } from '@/stores/workspace';
import { DEFAULT_USER, DEFAULT_CANVAS } from '@/types/workspace/models';
import { LoadingOverlay } from '@/components/ui/loading-spinner';
import { loadWorkspaceStorage } from '@/data-layer/workspace';
import { loadCanvasData } from '@/utils/workspace/canvasSync';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const initializeWorkspace = useWorkspaceStore((state) => state.initializeWorkspace);
  const setUser = useWorkspaceStore((state) => state.setUser);

  useEffect(() => {
    // 初始化工作空间
    const initWorkspace = async () => {
      try {
        const storageData = await loadWorkspaceStorage();

        if (storageData) {
          const { workspace } = storageData;

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

          loadCanvasData(workspace.currentCanvasId);
        } else {
          // 文件不存在或加载失败，使用默认数据
          initDefaultWorkspace();
        }
      } catch (error) {
        console.error('❌ 加载工作空间失败，使用默认数据:', error);
        initDefaultWorkspace();
      } finally {
        setIsLoading(false);
      }
    };

    // 初始化默认工作空间（降级方案）
    const initDefaultWorkspace = () => {
      try {
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
        loadCanvasData(DEFAULT_CANVAS.id);
      } catch (error) {
        console.error('❌ 工作空间初始化失败:', error);
      }
    };

    initWorkspace();
  }, [initializeWorkspace, setUser]);

  // 显示加载状态
  if (isLoading) {
    return <LoadingOverlay message="正在加载工作空间..." />;
  }

  return <WorkspaceLayout />;
}
