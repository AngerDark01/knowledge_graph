import React, { useCallback, useMemo, useState } from 'react';
import { useGraphStore } from '@/stores/graph';
import { Button } from '@/components/ui/button';
import type { Edge } from '@/types/graph/models';
import {
  createEdgeInspectorSavePlan,
  createEdgeEditorDraft,
  projectOntologyEdgeToLegacyEdge,
  parseCustomPropertiesText,
  updateOntologyRelationInDocument,
  useOntologyDocumentStore,
  type EdgeDirection,
  type EdgeEditorDraft,
} from '@/features/ontology-canvas';
import { useWorkspaceStore } from '@/stores/workspace';
import { getActiveOntologyDocument } from '@/utils/workspace/canvasSync';

interface EdgeEditorProps {
  edgeId: string;
}

interface EdgeEditorFormProps {
  edge: Edge;
  updateEdge: (id: string, updates: Partial<Edge>) => void;
}

const COLOR_OPTIONS = [
  { label: '黑色', value: '#000000' },
  { label: '红色', value: '#FF0000' },
  { label: '绿色', value: '#00FF00' },
  { label: '蓝色', value: '#0000FF' },
  { label: '橙色', value: '#FFA500' },
  { label: '紫色', value: '#800080' },
  { label: '青色', value: '#00FFFF' },
];

const STROKE_WIDTH_OPTIONS = [1, 2, 3, 4, 5];

const STROKE_DASHARRAY_OPTIONS = [
  { label: '实线', value: '' },
  { label: '虚线', value: '5,5' },
  { label: '点线', value: '2,2' },
  { label: '长虚线', value: '10,5' },
];

const DIRECTION_OPTIONS: Array<{ label: string; value: EdgeDirection }> = [
  { label: '单向', value: 'unidirectional' },
  { label: '双向', value: 'bidirectional' },
  { label: '无向', value: 'undirected' },
];

const getEdgeVersion = (edge: Edge): string => (
  edge.updatedAt instanceof Date
    ? edge.updatedAt.toISOString()
    : String(edge.updatedAt ?? '')
);

const EdgeEditorForm: React.FC<EdgeEditorFormProps> = ({ edge, updateEdge }) => {
  const [draft, setDraft] = useState<EdgeEditorDraft>(() => createEdgeEditorDraft(edge));
  const [submitError, setSubmitError] = useState<string | null>(null);
  const currentCanvasId = useWorkspaceStore(state => state.currentCanvasId);
  const applyOntologyCommandResult = useOntologyDocumentStore(state => state.applyCommandResult);

  const customPropertiesResult = useMemo(
    () => parseCustomPropertiesText(draft.customPropertiesText),
    [draft.customPropertiesText]
  );

  const handleDraftChange = useCallback(
    <K extends keyof EdgeEditorDraft,>(field: K, value: EdgeEditorDraft[K]) => {
      setDraft(previousDraft => ({
        ...previousDraft,
        [field]: value,
      }));
      setSubmitError(null);
    },
    []
  );

  const handleSave = useCallback(() => {
    if (!edge) {
      return;
    }

    const savePlan = createEdgeInspectorSavePlan(edge, draft);

    if (!savePlan.ok) {
      setSubmitError(savePlan.error);
      return;
    }

    const document = getActiveOntologyDocument({
      canvasId: currentCanvasId || 'current-canvas',
      fallbackName: 'Current Canvas',
    });
    const relationResult = updateOntologyRelationInDocument(document, {
      edgeId: savePlan.edgeId,
      relation: draft.label,
      direction: draft.direction,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      metadata: {
        source: 'ontology-edge-editor',
      },
    });

    if (!relationResult.changed) {
      setSubmitError(relationResult.warnings[0]?.message ?? '关系保存失败');
      return;
    }

    applyOntologyCommandResult(relationResult, {
      canvasId: currentCanvasId,
      reason: 'edge-editor-save',
    });

    const projectedEdge = projectOntologyEdgeToLegacyEdge(relationResult.document, savePlan.edgeId, {
      data: savePlan.update.data,
      groupId: edge.groupId,
    });

    if (!projectedEdge) {
      setSubmitError('关系保存后投影失败');
      return;
    }

    updateEdge(savePlan.edgeId, projectedEdge);
    setSubmitError(null);
  }, [applyOntologyCommandResult, currentCanvasId, draft, edge, updateEdge]);

  const handleReset = useCallback(() => {
    setDraft(createEdgeEditorDraft(edge));
    setSubmitError(null);
  }, [edge]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">边编辑器</h3>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">关系标签</label>
          <textarea
            value={draft.label}
            onChange={(e) => handleDraftChange('label', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="输入关系标签，如: 是...的...、包含、属于等"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">颜色</label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((color) => (
              <button
                type="button"
                key={color.value}
                className={`w-8 h-8 rounded-full border-2 ${draft.color === color.value ? 'border-blue-500' : 'border-gray-300'}`}
                style={{ backgroundColor: color.value }}
                onClick={() => handleDraftChange('color', color.value)}
                title={color.label}
              />
            ))}
            <input
              type="color"
              value={draft.color}
              onChange={(e) => handleDraftChange('color', e.target.value)}
              className="w-10 h-8"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">线宽</label>
          <div className="flex flex-wrap gap-2">
            {STROKE_WIDTH_OPTIONS.map((width) => (
              <button
                type="button"
                key={width}
                className={`px-3 py-1 rounded border ${draft.strokeWidth === width ? 'bg-blue-500 text-white' : 'bg-white'}`}
                onClick={() => handleDraftChange('strokeWidth', width)}
              >
                {width}px
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">线型</label>
          <div className="flex flex-wrap gap-2">
            {STROKE_DASHARRAY_OPTIONS.map((option) => (
              <button
                type="button"
                key={option.value}
                className={`px-3 py-1 rounded border ${draft.strokeDasharray === option.value ? 'bg-blue-500 text-white' : 'bg-white'}`}
                onClick={() => handleDraftChange('strokeDasharray', option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">关系权重</label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={draft.weight}
            onChange={(e) => handleDraftChange('weight', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-center text-sm">{draft.weight}</div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">关系强度</label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={draft.strength}
            onChange={(e) => handleDraftChange('strength', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-center text-sm">{draft.strength}</div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">方向性</label>
          <div className="flex flex-wrap gap-2">
            {DIRECTION_OPTIONS.map((option) => (
              <button
                type="button"
                key={option.value}
                className={`px-3 py-1 rounded border ${draft.direction === option.value ? 'bg-blue-500 text-white' : 'bg-white'}`}
                onClick={() => handleDraftChange('direction', option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">自定义属性</label>
          <textarea
            value={draft.customPropertiesText}
            onChange={(e) => handleDraftChange('customPropertiesText', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-xs font-mono"
            placeholder="输入JSON格式的自定义属性"
            rows={4}
          />
          {!customPropertiesResult.ok && (
            <div className="mt-1 text-xs text-red-600">{customPropertiesResult.error}</div>
          )}
          {submitError && (
            <div className="mt-1 text-xs text-red-600">{submitError}</div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={!customPropertiesResult.ok}
          >
            保存
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={handleReset}>
            重置
          </Button>
        </div>
      </div>
    </div>
  );
};

const EdgeEditor: React.FC<EdgeEditorProps> = ({ edgeId }) => {
  const edge = useGraphStore((state) => state.getEdgeById(edgeId));
  const updateEdge = useGraphStore((state) => state.updateEdge);

  if (!edge) {
    return <div className="text-gray-500 text-center py-10">Edge not found</div>;
  }

  return (
    <EdgeEditorForm
      key={`${edge.id}:${getEdgeVersion(edge)}`}
      edge={edge}
      updateEdge={updateEdge}
    />
  );
};

export default EdgeEditor;
