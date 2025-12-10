'use client';

import React, { useState } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { CreateCanvasDialog } from './CreateCanvasDialog';
import { RenameCanvasDialog } from './RenameCanvasDialog';
import { DeleteCanvasDialog } from './DeleteCanvasDialog';

interface CanvasContextMenuProps {
  canvasId: string;
  children: React.ReactNode;
}

export const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({
  canvasId,
  children,
}) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleCreateChild = () => {
    setCreateDialogOpen(true);
  };

  const handleRename = () => {
    setRenameDialogOpen(true);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem onClick={handleCreateChild}>
            <Plus className="w-4 h-4 mr-2" />
            新建子画布
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={handleRename}>
            <Edit2 className="w-4 h-4 mr-2" />
            重命名
          </ContextMenuItem>
          <ContextMenuItem onClick={handleDelete} className="text-destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            删除
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Dialogs */}
      <CreateCanvasDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        parentId={canvasId}
      />
      <RenameCanvasDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        canvasId={canvasId}
      />
      <DeleteCanvasDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        canvasId={canvasId}
      />
    </>
  );
};
