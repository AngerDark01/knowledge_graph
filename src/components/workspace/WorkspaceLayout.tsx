'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useWorkspaceStore } from '@/stores/workspace';
import { useGraphStore } from '@/stores/graph';
import { GraphPageContent } from '@/components/graph/core';

// 动态导入，避免服务端渲染问题
const LeftSidebar = dynamic(() => import('./LeftSidebar'), { ssr: false });
const RightSidebar = dynamic(() => import('./RightSidebar'), { ssr: false });
const ResizablePanel = dynamic(() => import('./ResizablePanel'), { ssr: false });

interface WorkspaceLayoutProps {
  className?: string;
}

const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({ className }) => {
  const [leftPanelWidth, setLeftPanelWidth] = useState(320); // 默认左侧面板宽度
  const [rightPanelWidth, setRightPanelWidth] = useState(320); // 默认右侧面板宽度

  const { isLoaded, loadWorkspace } = useWorkspaceStore();
  const { initializeGraphData } = useGraphStore();

  // 初始化工作空间数据
  useEffect(() => {
    const initializeWorkspace = async () => {
      if (!isLoaded) {
        const workspace = await loadWorkspace();
        if (workspace) {
          // 初始化工作空间状态
          useWorkspaceStore.getState().initializeWorkspace(
            workspace.canvases,
            workspace.canvasTree,
            workspace.currentCanvasId
          );

          // 获取当前画布的数据并初始化图状态
          const currentCanvas = workspace.canvases.find(c => c.id === workspace.currentCanvasId);
          if (currentCanvas) {
            initializeGraphData(
              currentCanvas.graphData.nodes,
              currentCanvas.graphData.edges,
              currentCanvas.viewportState
            );
          }
        } else {
          // 如果没有加载到工作区数据，则使用默认数据
          initializeGraphData([], [], { x: 0, y: 0, zoom: 1 });
        }
      }
    };

    initializeWorkspace();
  }, [isLoaded, loadWorkspace, initializeGraphData]);

  return (
    <div className={`flex h-screen w-full bg-background ${className || ''}`}>
      {/* 左侧面板 - 画布树和用户信息 */}
      <ResizablePanel
        width={leftPanelWidth}
        minWidth={200}
        maxWidth={500}
        onResize={setLeftPanelWidth}
        direction="right"
        className="border-r border-border bg-muted/40"
      >
        <LeftSidebar />
      </ResizablePanel>

      {/* 中间主内容区域 - 图编辑器 */}
      <div className="flex-1 relative overflow-hidden">
        <GraphPageContent />
      </div>

      {/* 右侧面板 - 节点编辑器和控制 */}
      <ResizablePanel
        width={rightPanelWidth}
        minWidth={200}
        maxWidth={500}
        onResize={setRightPanelWidth}
        direction="left"
        className="border-l border-border bg-muted/40"
      >
        <RightSidebar />
      </ResizablePanel>
    </div>
  );
};

export default WorkspaceLayout;