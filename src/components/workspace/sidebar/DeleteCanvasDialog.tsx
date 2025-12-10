'use client';

import React, { useMemo } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useWorkspaceStore } from '@/stores/workspace';
import { toast } from 'sonner';

interface DeleteCanvasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canvasId: string | null;
}

export const DeleteCanvasDialog: React.FC<DeleteCanvasDialogProps> = ({
  open,
  onOpenChange,
  canvasId,
}) => {
  const canvases = useWorkspaceStore((state) => state.canvases);
  const deleteCanvas = useWorkspaceStore((state) => state.deleteCanvas);
  const currentCanvasId = useWorkspaceStore((state) => state.currentCanvasId);
  const switchCanvas = useWorkspaceStore((state) => state.switchCanvas);

  const canvasInfo = useMemo(() => {
    if (!canvasId) return null;

    const canvas = canvases.find((c) => c.id === canvasId);
    if (!canvas) return null;

    // Count all descendant canvases recursively
    const countDescendants = (id: string): number => {
      const children = canvases.filter((c) => c.parentId === id);
      return children.reduce((count, child) => {
        return count + 1 + countDescendants(child.id);
      }, 0);
    };

    return {
      name: canvas.name,
      childCount: countDescendants(canvasId),
      isCurrentCanvas: canvasId === currentCanvasId,
    };
  }, [canvasId, canvases, currentCanvasId]);

  const handleDelete = () => {
    if (!canvasId) {
      toast.error('未选择画布');
      return;
    }

    // Check if this is the last canvas
    if (canvases.length === 1) {
      toast.error('无法删除最后一个画布');
      onOpenChange(false);
      return;
    }

    try {
      // If deleting current canvas, switch to another one first
      if (canvasInfo?.isCurrentCanvas) {
        const otherCanvas = canvases.find((c) => c.id !== canvasId);
        if (otherCanvas) {
          // Import switchToCanvas dynamically to save current data
          import('@/utils/workspace/canvasSync').then(({ switchToCanvas }) => {
            switchToCanvas(otherCanvas.id);
          });
        }
      }

      deleteCanvas(canvasId);

      const deletedCount = 1 + (canvasInfo?.childCount || 0);
      toast.success(
        deletedCount > 1
          ? `已删除"${canvasInfo?.name}"及其${canvasInfo?.childCount}个子画布`
          : `已删除"${canvasInfo?.name}"`
      );

      onOpenChange(false);
    } catch (error) {
      toast.error('删除画布失败');
      console.error('Failed to delete canvas:', error);
    }
  };

  if (!canvasInfo) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除画布</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              你确定要删除画布 <strong>"{canvasInfo.name}"</strong> 吗？
            </p>
            {canvasInfo.childCount > 0 && (
              <p className="text-destructive font-medium">
                ⚠️ 此操作将同时删除 {canvasInfo.childCount} 个子画布及其所有数据。
              </p>
            )}
            <p className="text-muted-foreground text-sm">
              此操作不可撤销，所有画布中的节点和边将永久丢失。
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
