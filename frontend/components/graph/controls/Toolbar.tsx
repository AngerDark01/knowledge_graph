import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import LayoutControl from './LayoutControl';
import { useGraphStore } from '@/stores/graph';
import { BlockEnum } from '@/types/graph/models';
import { MermaidImportDialog } from '@/components/graph/import/MermaidImportDialog';

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

  // Mermaid导入对话框状态
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  return (
    <>
      <MermaidImportDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} />
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

      {/* Mermaid导入按钮 */}
      <div className="pt-2 border-t border-gray-200">
        <Button
          className="w-full"
          variant="outline"
          onClick={() => setImportDialogOpen(true)}
        >
          📥 导入 Mermaid
        </Button>
      </div>

      <Button className="w-full" variant="outline" onClick={onRecenter}>
        Recenter View
      </Button>
      <Button className="w-full text-red-500 border-red-500" variant="outline" onClick={onClear}>
        Clear All
      </Button>

      {/* 布局控制按钮 */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <LayoutControl />
      </div>
    </div>
    </>
  );
};