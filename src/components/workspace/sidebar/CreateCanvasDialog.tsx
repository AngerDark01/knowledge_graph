'use client';

import React, { useState } from 'react';
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

interface CreateCanvasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId?: string | null;
}

export const CreateCanvasDialog: React.FC<CreateCanvasDialogProps> = ({
  open,
  onOpenChange,
  parentId = null,
}) => {
  const [name, setName] = useState('');
  const createCanvas = useWorkspaceStore((state) => state.createCanvas);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('画布名称不能为空');
      return;
    }

    try {
      const newCanvas = createCanvas(name.trim(), parentId ?? undefined);
      toast.success(`画布"${name.trim()}"创建成功`);
      setName('');
      onOpenChange(false);
    } catch (error) {
      toast.error('创建画布失败');
      console.error('Failed to create canvas:', error);
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
            <DialogTitle>
              {parentId ? '新建子画布' : '新建画布'}
            </DialogTitle>
            <DialogDescription>
              {parentId
                ? '创建一个新的子画布，用于组织相关的知识图谱。'
                : '创建一个新的根画布。'}
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
                placeholder="输入画布名称"
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              取消
            </Button>
            <Button type="submit">创建</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
