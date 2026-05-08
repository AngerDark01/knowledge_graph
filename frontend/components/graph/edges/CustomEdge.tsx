import React, { memo, useCallback } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, EdgeProps, MarkerType } from 'reactflow';
import { useGraphStore } from '@/stores/graph';
import {
  projectOntologyEdgeToLegacyEdge,
  updateOntologyRelationInDocument,
  useOntologyDocumentStore,
} from '@/features/ontology-canvas';
import { useWorkspaceStore } from '@/stores/workspace';
import { getActiveOntologyDocument } from '@/utils/workspace/canvasSync';

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
  customProperties?: Record<string, unknown>;
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
  style,
}: EdgeProps<CustomEdgeData>) => {
  const { updateEdge } = useGraphStore();
  const currentCanvasId = useWorkspaceStore(state => state.currentCanvasId);
  const applyOntologyCommandResult = useOntologyDocumentStore(state => state.applyCommandResult);
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
    strokeDasharray: data?.strokeDasharray || (isCrossGroup ? '5,5' : undefined),
    ...style
  };

  // 确定标签背景色
  const labelBackground = isCrossGroup ? 'white' : 'rgba(255, 255, 255, 0.8)';

  // 确定标签文本
  const relationshipLabel = typeof data?.customProperties?.relationship === 'string'
    ? data.customProperties.relationship
    : '';
  const labelText = data?.label || relationshipLabel;

  // 状态管理 - 使用局部状态处理双击编辑
  const [isEditing, setIsEditing] = React.useState(false);
  const [labelValue, setLabelValue] = React.useState(labelText || '');

  // 监听来自GraphPageContent的双击事件
  React.useEffect(() => {
    const handleEdgeDoubleClick = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail.edgeId === id) {
        setIsEditing(true);
      }
    };

    window.addEventListener('edgeDoubleClick', handleEdgeDoubleClick);
    return () => {
      window.removeEventListener('edgeDoubleClick', handleEdgeDoubleClick);
    };
  }, [id]);

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabelValue(e.target.value);
  };

  const handleBlur = useCallback(() => {
    const updatedData = {
      ...data,
      customProperties: {
        ...(data?.customProperties || {}),
        relation: labelValue,
        relationship: labelValue
      }
    };
    const document = getActiveOntologyDocument({
      canvasId: currentCanvasId || 'current-canvas',
      fallbackName: 'Current Canvas',
    });
    const relationResult = updateOntologyRelationInDocument(document, {
      edgeId: id,
      relation: labelValue,
      direction: data?.direction,
      metadata: {
        source: 'ontology-inline-edge-label',
      },
    });

    if (!relationResult.changed) {
      console.warn('内联关系标签保存失败:', relationResult.warnings);
      setIsEditing(false);
      return;
    }

    applyOntologyCommandResult(relationResult, {
      canvasId: currentCanvasId,
      reason: 'inline-edge-label',
    });

    const projectedEdge = projectOntologyEdgeToLegacyEdge(relationResult.document, id, {
      data: updatedData,
    });

    if (!projectedEdge) {
      console.warn('内联关系标签保存后投影失败:', id);
      setIsEditing(false);
      return;
    }

    updateEdge(id, projectedEdge);
    setIsEditing(false);
  }, [applyOntologyCommandResult, currentCanvasId, id, data, labelValue, updateEdge]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setLabelValue(labelText || ''); // 恢复原始值
      setIsEditing(false);
    }
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={edgeMarkerEnd ? `url(#${id}-marker-end)` : undefined}
        markerStart={edgeMarkerStart ? `url(#${id}-marker-start)` : undefined}
        style={edgeStyle}
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
      {(labelText || isEditing) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              fontSize: '12px',
              padding: isEditing ? '0' : '4px 6px',
              background: isEditing ? 'transparent' : labelBackground,
              border: isEditing ? 'none' : '1px solid #ddd',
              borderRadius: isEditing ? '0' : '6px',
              pointerEvents: 'all',
              zIndex: 3, // 确保标签在边之上，但低于节点
              fontWeight: 'normal',
              color: '#333',
            }}
            className="nodrag nopan"
          >
            {isEditing ? (
              <input
                type="text"
                value={labelValue}
                onChange={handleLabelChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                autoFocus
                style={{
                  padding: '4px 6px',
                  border: '1px solid #3b82f6',
                  borderRadius: '4px',
                  fontSize: '12px',
                  background: '#fff',
                  outline: 'none',
                  minWidth: '100px',
                  width: 'auto',
                }}
                onClick={(e) => e.stopPropagation()}
                onDoubleClick={(e) => e.stopPropagation()} // 防止双击事件冒泡
              />
            ) : (
              labelText
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default memo(CustomEdge);
