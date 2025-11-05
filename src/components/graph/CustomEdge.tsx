import React from 'react';
import { BaseEdge, EdgeLabelRenderer, Position, getBezierPath, EdgeProps } from 'reactflow';

interface CustomEdgeData {
  label?: string;
  color?: string;
  strokeWidth?: number;
}

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  style,
}: EdgeProps<CustomEdgeData>) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // 合并默认样式和传入的自定义样式
  const edgeStyle: React.CSSProperties = {
    stroke: data?.color || style?.stroke || '#000',
    strokeWidth: data?.strokeWidth || style?.strokeWidth || 2,
    ...style
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              fontSize: '12px',
              padding: '2px 4px',
              background: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid #ddd',
              borderRadius: '3px',
              pointerEvents: 'all',
              zIndex: 3, // 确保标签在边之上，但低于节点
            }}
            className="nodrag nopan"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default CustomEdge;