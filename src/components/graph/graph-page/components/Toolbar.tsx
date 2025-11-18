import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useGraphStore } from '@/stores/graph';

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
  const { selectedNodeId, getChildNodes, layoutChildrenInGrid } = useGraphStore();

  // 计算选中节点的子节点数量
  const childCount = useMemo(() => {
    if (!selectedNodeId) return 0;
    const children = getChildNodes(selectedNodeId);
    return children.length;
  }, [selectedNodeId, getChildNodes]);

  const handleLayoutChildren = () => {
    if (selectedNodeId && childCount > 0) {
      console.log(`🎯 触发布局: 节点 ${selectedNodeId} 的 ${childCount} 个子节点`);
      layoutChildrenInGrid(selectedNodeId);
    }
  };

  return (
    <div className="mt-6 space-y-2">
      <Button className="w-full" onClick={onNodeAdd}>
        Add Node
      </Button>
      <Button className="w-full" variant="outline" onClick={onGroupAdd}>
        Add Group
      </Button>

      {/* 🆕 布局子节点按钮 */}
      <Button
        className="w-full"
        variant="outline"
        onClick={handleLayoutChildren}
        disabled={!selectedNodeId || childCount === 0}
        title={
          !selectedNodeId
            ? '请先选中一个节点或群组'
            : childCount === 0
            ? '选中的节点没有子节点'
            : `对 ${childCount} 个子节点进行网格布局`
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          />
        </svg>
        布局子节点 {childCount > 0 && `(${childCount})`}
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