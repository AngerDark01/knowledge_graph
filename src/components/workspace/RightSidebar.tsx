'use client';

import React from 'react';
import { useGraphStore } from '@/stores/graph';
import NodeEditor from '@/components/graph/editors/NodeEditor';
import EdgeEditor from '@/components/graph/editors/EdgeEditor';
import { Toolbar } from '@/components/graph/controls/Toolbar';
import HistoryControl from '@/components/graph/controls/HistoryControl';
import LayoutControl from '@/components/graph/controls/LayoutControl';

const RightSidebar: React.FC = () => {
  const { selectedNodeId, selectedEdgeId } = useGraphStore();

  return (
    <div className="flex flex-col h-full">
      {/* 工具栏区域 */}
      <div className="p-3 border-b border-border">
        <Toolbar
          onNodeAdd={() => {}}
          onGroupAdd={() => {}}
          onRecenter={() => {}}
          onClear={() => {}}
        />
      </div>

      {/* 布局控制区域 */}
      <div className="p-3 border-b border-border">
        <LayoutControl />
      </div>

      {/* 历史记录控制区域 */}
      <div className="p-3 border-b border-border">
        <HistoryControl />
      </div>

      {/* 编辑器区域 - 根据选择显示不同编辑器 */}
      <div className="flex-1 overflow-y-auto p-3">
        {selectedNodeId ? (
          <NodeEditor nodeId={selectedNodeId} />
        ) : selectedEdgeId ? (
          <EdgeEditor edgeId={selectedEdgeId} />
        ) : (
          <div className="text-center text-sm text-muted-foreground py-10">
            选择节点或边来编辑属性
          </div>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;