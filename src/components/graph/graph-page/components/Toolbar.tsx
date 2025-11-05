import React from 'react';
import { Button } from '@/components/ui/button';

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
  return (
    <div className="mt-6 space-y-2">
      <Button className="w-full" onClick={onNodeAdd}>
        Add Node
      </Button>
      <Button className="w-full" variant="outline" onClick={onGroupAdd}>
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