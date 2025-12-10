'use client';

import React from 'react';
import { useWorkspaceStore } from '@/stores/workspace';
import { CanvasTreeItem } from './CanvasTreeItem';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const CanvasTree: React.FC = () => {
  const canvasTree = useWorkspaceStore((state) => state.canvasTree);

  return (
    <div className="space-y-1">
      {/* 画布树 */}
      {canvasTree.map((node) => (
        <CanvasTreeItem key={node.id} node={node} level={0} />
      ))}

      {/* 创建根画布按钮（阶段6实现） */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-sm"
        disabled
        title="此功能将在阶段6实现"
      >
        <Plus className="w-4 h-4 mr-2" />
        新建画布
      </Button>
    </div>
  );
};
