'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWorkspaceStore } from '@/stores/workspace';
import { toast } from 'sonner';

interface RenameCanvasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canvasId: string | null;
}

export const RenameCanvasDialog: React.FC<RenameCanvasDialogProps> = ({
  open,
  onOpenChange,
  canvasId,
}) => {
  const [name, setName] = useState('');
  const canvases = useWorkspaceStore((state) => state.canvases);
  const renameCanvas = useWorkspaceStore((state) => state.renameCanvas);

  // Load current canvas name when dialog opens
  useEffect(() => {
    if (open && canvasId) {
      const canvas = canvases.find((c) => c.id === canvasId);
      if (canvas) {
        setName(canvas.name);
      }
    }
  }, [open, canvasId, canvases]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!canvasId) {
      toast.error('未选择画布');
      return;
    }

    if (!name.trim()) {
      toast.error('画布名称不能为空');
      return;
    }

    try {
      renameCanvas(canvasId, name.trim());
      toast.success(`画布已重命名为"${name.trim()}"`);
      onOpenChange(false);
    } catch (error) {
      toast.error('重命名画布失败');
      console.error('Failed to rename canvas:', error);
    }
  };

  const handleCancel = () => {
    setName('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>重命名画布</DialogTitle>
            <DialogDescription>
              为画布输入一个新的名称。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                名称
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="输入新名称"
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              取消
            </Button>
            <Button type="submit">重命名</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
