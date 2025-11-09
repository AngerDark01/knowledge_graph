import React, { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, Position, getBezierPath, EdgeProps, MarkerType } from 'reactflow';

interface CustomEdgeData {
  label?: string;
  color?: string;
  strokeWidth?: number;
  isCrossGroup?: boolean;        // 是否为跨群关系
  strokeDasharray?: string;      // 虚线样式
  // 关系属性
  weight?: number;               // 关系权重
  strength?: number;             // 关系强度
  direction?: 'unidirectional' | 'bidirectional' | 'undirected'; // 方向性
  // 自定义属性
  customProperties?: Record<string, any>;
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

  // 确定是否为跨群关系
  const isCrossGroup = data?.isCrossGroup;

  // 根据权重和强度调整边的样式
  const weight = data?.weight ?? 1;
  const strength = data?.strength ?? 1;
  
  // 基础线宽，跨群关系默认为2px，群内关系默认为1px
  const baseStrokeWidth = isCrossGroup ? 2 : 1;
  // 根据权重调整线宽，权重越大线越宽
  const calculatedStrokeWidth = baseStrokeWidth * (1 + (weight - 1) * 0.2);
  
  // 根据强度调整颜色透明度，强度越高越不透明
  const baseColor = data?.color || (isCrossGroup ? '#FFA500' : '#000');
  let strokeColor = baseColor;
  if (strength < 1) {
    // 如果强度小于1，添加透明度
    const opacity = Math.max(0.2, Math.min(1, strength));
    if (baseColor.startsWith('#')) {
      // 将十六进制颜色转换为RGBA
      const hex = baseColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      strokeColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
    } else {
      // 如果已经是RGBA格式，调整透明度
      strokeColor = baseColor.replace(/[\d.]+\)$/, `${opacity})`);
    }
  }

  // 根据方向性设置marker
  let edgeMarkerEnd: string | { type: MarkerType; color: string; width: number; height: number } | undefined = markerEnd;
  let edgeMarkerStart: { type: MarkerType; color: string; width: number; height: number } | undefined;
  
  if (data?.direction === 'bidirectional') {
    // 双向箭头
    edgeMarkerEnd = {
      type: MarkerType.Arrow,
      color: strokeColor,
      width: 20,
      height: 20,
    };
    edgeMarkerStart = {
      type: MarkerType.Arrow,
      color: strokeColor,
      width: 20,
      height: 20,
    };
  } else if (data?.direction === 'unidirectional') {
    // 单向箭头（从源到目标）
    edgeMarkerEnd = {
      type: MarkerType.Arrow,
      color: strokeColor,
      width: 20,
      height: 20,
    };
  } else {
    // 无向关系，无箭头
    edgeMarkerEnd = undefined;
    edgeMarkerStart = undefined;
  }

  // 合并默认样式和传入的自定义样式
  const edgeStyle: React.CSSProperties = {
    stroke: strokeColor,
    strokeWidth: data?.strokeWidth || calculatedStrokeWidth,
    strokeDasharray: data?.strokeDasharray || (isCrossGroup ? '5,5' : undefined),
    ...style
  };

  // 确定标签背景色
  const labelBackground = isCrossGroup ? 'white' : 'rgba(255, 255, 255, 0.8)';

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={edgeMarkerEnd as any}
        markerStart={edgeMarkerStart as any}
        style={edgeStyle}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              fontSize: '12px',
              padding: '2px 4px',
              background: labelBackground,
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

export default memo(CustomEdge);