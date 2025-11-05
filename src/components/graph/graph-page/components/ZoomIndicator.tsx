import React from 'react';
import { Panel } from 'reactflow';

interface ZoomIndicatorProps {
  zoomValue: number;
}

export const ZoomIndicator: React.FC<ZoomIndicatorProps> = ({ zoomValue }) => {
  return (
    <Panel position="bottom-right" className="bg-white/80 dark:bg-gray-800/80 p-2 rounded-md">
      <div className="text-sm font-mono">
        {(zoomValue * 100).toFixed(0)}%
      </div>
    </Panel>
  );
};