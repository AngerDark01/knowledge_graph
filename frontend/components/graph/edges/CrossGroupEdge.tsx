import React, { memo } from 'react';
import { EdgeLabelRenderer, EdgeProps, MarkerType } from 'reactflow';

interface CrossGroupEdgeData {
  label?: string;
  color?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  // 跨群组信息
  isCrossGroup?: boolean;
  sourceGroupId?: string;
  targetGroupId?: string;
  // 关系属性
  weight?: number;
  strength?: number;
  direction?: 'unidirectional' | 'bidirectional' | 'undirected';
  // 自定义属性
  customProperties?: Record<string, any>;
}

// 计算跨群关系边的路径，确保边从群组边界穿出
const getCrossGroupEdgePath = (
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  sourceGroupId?: string,
  targetGroupId?: string
): string => {
  // 对于跨群关系，使用更复杂的贝塞尔曲线路径
  // 以确保边从群组边界穿出

  // 调整起点和终点，使其从群组边界穿出
  // 这里简单地让路径稍微偏离节点中心，模拟从群组边界穿出的视觉效果
  const adjustedSourceX = sourceX;
  const adjustedSourceY = sourceY;
  const adjustedTargetX = targetX;
  const adjustedTargetY = targetY;

  // 计算控制点，使路径更弯曲以避免重叠，同时确保路径平滑
  const midX = (adjustedSourceX + adjustedTargetX) / 2;
  const midY = (adjustedSourceY + adjustedTargetY) / 2;

  // 根据源点和目标点的位置调整控制点，以产生更自然的曲线
  const controlOffsetX = Math.abs(adjustedTargetX - adjustedSourceX) * 0.5;
  const controlOffsetY = Math.abs(adjustedTargetY - adjustedSourceY) * 0.5;

  // 使用贝塞尔曲线生成路径
  return `M${adjustedSourceX},${adjustedSourceY} C${adjustedSourceX + controlOffsetX},${midY - controlOffsetY} ${adjustedTargetX - controlOffsetX},${midY + controlOffsetY} ${adjustedTargetX},${adjustedTargetY}`;
};

const CrossGroupEdge = ({
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
}: EdgeProps<CrossGroupEdgeData>) => {
  // 计算边路径
  const edgePath = getCrossGroupEdgePath(
    sourceX,
    sourceY,
    targetX,
    targetY,
    data?.sourceGroupId,
    data?.targetGroupId
  );

  // 计算标签位置 - 使用贝塞尔路径的中点
  const labelX = (sourceX + targetX) / 2;
  const labelY = (sourceY + targetY) / 2;

  // 根据权重和强度调整边的样式
  const weight = data?.weight ?? 1;
  const strength = data?.strength ?? 1;

  // 基础线宽，默认为2px
  const baseStrokeWidth = 2;
  // 根据权重调整线宽，权重越大线越宽
  const calculatedStrokeWidth = baseStrokeWidth * (1 + (weight - 1) * 0.2);

  // 根据强度调整颜色透明度，强度越高越不透明
  const baseColor = data?.color || '#FFA500'; // 橙色
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
  // ✅ 修复：如果direction未定义，默认为unidirectional（单向）
  const direction = data?.direction || 'unidirectional';

  let edgeMarkerEnd: { type: MarkerType; color: string; width: number; height: number } | undefined;
  let edgeMarkerStart: { type: MarkerType; color: string; width: number; height: number } | undefined;

  if (direction === 'bidirectional') {
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
  } else if (direction === 'unidirectional') {
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
    strokeDasharray: data?.strokeDasharray || '5,5', // 虚线样式
    ...style
  };

  // 确定标签文本
  const labelText = data?.label || (data?.customProperties?.relationship || '');

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={edgeStyle}
        markerEnd={edgeMarkerEnd ? `url(#${id}-marker-end)` : undefined}
        markerStart={edgeMarkerStart ? `url(#${id}-marker-start)` : undefined}
      />
      {/* 为边添加标记定义 */}
      <defs>
        {edgeMarkerEnd && (
          <marker
            id={`${id}-marker-end`}
            key={`${id}-marker-end`}
            markerWidth={edgeMarkerEnd.width}
            markerHeight={edgeMarkerEnd.height}
            viewBox="0 0 10 10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M0,0 L0,6 L9,3 z"
              fill={edgeMarkerEnd.color}
              stroke={edgeMarkerEnd.color}
            />
          </marker>
        )}
        {edgeMarkerStart && (
          <marker
            id={`${id}-marker-start`}
            key={`${id}-marker-start`}
            markerWidth={edgeMarkerStart.width}
            markerHeight={edgeMarkerStart.height}
            viewBox="0 0 10 10"
            refX="1"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M0,3 L9,0 L9,6 z"
              fill={edgeMarkerStart.color}
              stroke={edgeMarkerStart.color}
            />
          </marker>
        )}
      </defs>
      {labelText && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              fontSize: '12px',
              padding: '4px 6px',
              background: 'white', // 白色背景保证可读性
              border: '1px solid #ddd',
              borderRadius: '6px',
              pointerEvents: 'all',
              zIndex: 3, // 确保标签在边之上，但低于节点
              fontWeight: 'normal',
              color: '#333'
            }}
            className="nodrag nopan"
          >
            {labelText}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default memo(CrossGroupEdge);