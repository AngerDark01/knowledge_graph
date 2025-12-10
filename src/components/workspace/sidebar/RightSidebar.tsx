'use client';

import React from 'react';
import { ResizablePanel } from './ResizablePanel';
import { useGraphStore } from '@/stores/graph';

export const RightSidebar: React.FC = () => {
  // 使用 optional chaining 安全访问 nodes
  const nodes = useGraphStore((state) => state.nodes || []);
  const selectedNodeIds = nodes.filter(n => n.selected).map(n => n.id);

  return (
    <ResizablePanel side="right" initialWidth={320} minWidth={250} maxWidth={600}>
      <div className="flex flex-col h-full p-4 space-y-4 overflow-y-auto">
        <div className="text-sm text-muted-foreground">
          <h3 className="font-semibold mb-2">属性面板</h3>
          {selectedNodeIds.length > 0 ? (
            <div>
              <p className="mb-2">已选中 {selectedNodeIds.length} 个节点</p>
              <p className="text-xs">节点编辑器将在后续阶段集成</p>
            </div>
          ) : (
            <p>请选择节点或边来编辑属性</p>
          )}
        </div>

        {/* 布局控制占位 */}
        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-semibold mb-2">布局控制</h3>
          <p className="text-xs text-muted-foreground">布局控制将在后续阶段迁移</p>
        </div>
      </div>
    </ResizablePanel>
  );
};
