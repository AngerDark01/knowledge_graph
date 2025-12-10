import React from 'react';
import { useWorkspaceStore } from '@/stores/workspace';
import CanvasTreeItem from './CanvasTreeItem';

const CanvasTree: React.FC = () => {
  const { canvasTree, currentCanvasId } = useWorkspaceStore();

  return (
    <div className="space-y-1">
      {canvasTree.map((node) => (
        <CanvasTreeItem
          key={node.id}
          node={node}
          currentCanvasId={currentCanvasId}
        />
      ))}
    </div>
  );
};

export default CanvasTree;