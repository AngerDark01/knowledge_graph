import React from 'react';
import { Button } from '@/components/ui/button';
import { useGraphStore } from '@/stores/graph';
import { BlockEnum } from '@/types/graph/models';

interface ToolbarProps {
  onNodeAdd: () => void;
  onGroupAdd: () => void;
  onRecenter: () => void;
  onClear: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onNodeAdd,
  onGroupAdd,
  onRecenter,
  onClear
}) => {
  // 🔧 获取当前选中的节点信息
  const { selectedNodeId, nodes } = useGraphStore();
  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const isGroupSelected = selectedNode?.type === BlockEnum.GROUP;

  return (
    <div className="mt-6 space-y-2">
      {/* 显示当前上下文提示 */}
      {isGroupSelected && (
        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200 mb-2">
          📦 Group selected: Adding items inside
        </div>
      )}

      <Button className="w-full" onClick={onNodeAdd}>
        {isGroupSelected ? 'Add Node (Inside Group)' : 'Add Node'}
      </Button>
      <Button className="w-full" variant="outline" onClick={onGroupAdd}>
        {isGroupSelected ? 'Add Nested Group' : 'Add Group'}
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