'use client';

import React, { useState } from 'react';
import { useWorkspaceStore } from '@/stores/workspace';
import { CanvasTreeItem } from './CanvasTreeItem';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateCanvasDialog } from './CreateCanvasDialog';

export const CanvasTree: React.FC = () => {
  const canvasTree = useWorkspaceStore((state) => state.canvasTree);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <div className="space-y-1">
      {/* 画布树 */}
      {canvasTree.map((node) => (
        <CanvasTreeItem key={node.id} node={node} level={0} />
      ))}

      {/* 创建根画布按钮 */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-sm"
        onClick={() => setCreateDialogOpen(true)}
      >
        <Plus className="w-4 h-4 mr-2" />
        新建画布
      </Button>

      {/* 创建画布对话框 */}
      <CreateCanvasDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        parentId={null}
      />
    </div>
  );
};
