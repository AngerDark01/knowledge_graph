import React from 'react';
import { Button } from '@/components/ui/button';
import LayoutControl from './LayoutControl';
import { useGraphStore } from '@/stores/graph';
import { isLegacyOntologyDomainDisplay } from '@/features/ontology-canvas';

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
  const selectedNodeId = useGraphStore(state => state.selectedNodeId);
  const nodes = useGraphStore(state => state.nodes);
  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const isDomainSelected = selectedNode
    ? isLegacyOntologyDomainDisplay(selectedNode)
    : false;

  return (
    <div className="mt-6 space-y-2">
      {isDomainSelected && (
        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200 mb-2">
          Domain selected: new items will be added inside
        </div>
      )}

      <Button className="w-full" onClick={onNodeAdd}>
        {isDomainSelected ? 'Add Class Inside' : 'Add Class'}
      </Button>
      <Button className="w-full" variant="outline" onClick={onGroupAdd}>
        {isDomainSelected ? 'Add Nested Domain' : 'Add Domain'}
      </Button>

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
  );
};
