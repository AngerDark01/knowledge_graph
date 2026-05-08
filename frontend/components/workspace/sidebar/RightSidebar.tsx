'use client';

import React from 'react';
import { ResizablePanel } from './ResizablePanel';
import { useGraphStore } from '@/stores/graph';
import EdgeEditor from '@/components/graph/editors/EdgeEditor';
import EdgeFilterControl from '@/components/graph/controls/EdgeFilterControl';
import HistoryControl from '@/components/graph/controls/HistoryControl';
import { Toolbar } from '@/components/graph/controls/Toolbar';
import { useNodeHandling } from '@/components/graph/core/hooks/useNodeHandling';
import { useViewportControls } from '@/components/graph/core/hooks/useViewportControls';
import { NodeInspectorBlock } from '@/features/ontology-canvas/blocks';

export const RightSidebar: React.FC = () => {
  const { onNodeAdd, onGroupAdd } = useNodeHandling();
  const { onRecenter, onClear } = useViewportControls();
  const nodes = useGraphStore((state) => state.nodes);
  const selectedNodeId = useGraphStore((state) => state.selectedNodeId);
  const selectedEdgeId = useGraphStore((state) => state.selectedEdgeId);
  const selectedNode = nodes.find(node => node.id === selectedNodeId);
  const selectedNodeVersion = selectedNode?.updatedAt instanceof Date
    ? selectedNode.updatedAt.toISOString()
    : String(selectedNode?.updatedAt ?? '');

  return (
    <ResizablePanel side="right" initialWidth={320} minWidth={250} maxWidth={600}>
      <div className="flex flex-col h-full p-4 space-y-4 overflow-y-auto">
        {/* 标题 */}
        <div className="text-lg font-semibold">Knowledge Graph Editor</div>

        {/* 边过滤控制 */}
        <div className="pt-2">
          <EdgeFilterControl />
        </div>

        {/* 属性编辑器 */}
        <div className="pt-2">
          <h3 className="text-sm font-semibold mb-2">Inspector</h3>
          {selectedNodeId ? (
            <NodeInspectorBlock
              key={`${selectedNodeId}:${selectedNodeVersion}`}
              nodeId={selectedNodeId}
            />
          ) : selectedEdgeId ? (
            <EdgeEditor edgeId={selectedEdgeId} />
          ) : (
            <div className="text-gray-500 text-center py-10">
              Select a node or edge to inspect its properties
            </div>
          )}
        </div>

        {/* 历史记录控制 */}
        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-semibold mb-2">历史记录</h3>
          <HistoryControl />
        </div>

        {/* 工具栏 */}
        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-semibold mb-2">工具栏</h3>
          <Toolbar
            onNodeAdd={onNodeAdd}
            onGroupAdd={onGroupAdd}
            onRecenter={onRecenter}
            onClear={onClear}
          />
        </div>
      </div>
    </ResizablePanel>
  );
};
