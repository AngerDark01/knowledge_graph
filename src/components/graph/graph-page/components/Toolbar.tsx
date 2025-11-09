import React from 'react';
import { Button } from '@/components/ui/button';
import { useGraphStore } from '@/stores/graph';

interface ToolbarProps {
  onNodeAdd: (position: { x: number; y: number }, options?: { viewMode?: 'note' | 'container'; parentId?: string }) => void;
  onGroupAdd: (position: { x: number; y: number }) => void;
  onRecenter: () => void;
  onClear: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onNodeAdd,
  onGroupAdd,
  onRecenter,
  onClear
}) => {
  const { selectedNodeId, getNodeById } = useGraphStore();

  const handleAddNode = () => {
    // 检查是否选中了容器节点
    if (selectedNodeId) {
      const selectedNode = getNodeById(selectedNodeId);
      if (selectedNode && selectedNode.viewMode === 'container') {
        // 🔥 在容器内部添加子节点
        // 传递占位符位置，实际位置会由 useNodeHandling 中的 calculateChildInitialPosition 计算
        onNodeAdd({ x: 0, y: 0 }, { parentId: selectedNodeId });
        return;
      }
    }

    // 默认在画布中心添加节点
    onNodeAdd({ x: 400, y: 300 });
  };

  const handleAddGroup = () => {
    // 默认在画布中心添加组
    onGroupAdd({ x: 400, y: 300 });
  };

  return (
    <div className="mt-6 space-y-2">
      <Button className="w-full" onClick={handleAddNode}>
        Add Node
      </Button>
      <Button className="w-full" variant="outline" onClick={handleAddGroup}>
        Add Group
      </Button>
      <Button className="w-full" variant="outline" onClick={onRecenter}>
        Recenter View
      </Button>
      <Button className="w-full text-red-500 border-red-500" variant="outline" onClick={onClear}>
        Clear All
      </Button>
    </div>
  );
};