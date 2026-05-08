import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import {
  useCallback,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import type { OntologyFieldCategory } from '@/domain/ontology';
import {
  ontologyNodeViewTokens,
  type OntologyNodeMetricTone,
} from '../config';
import type {
  OntologyNodeViewItem,
  OntologyNodeViewTone,
} from '../model/view';

export type NodeFieldViewItem = OntologyNodeViewItem;
export type NodeFieldEditableCategory = OntologyFieldCategory;
export type NodeFieldMoveDirection = 'up' | 'down';
export type NodeFieldChangePatch = Partial<Pick<
  NodeFieldViewItem,
  'name' | 'value' | 'dataType'
>> & {
  category?: NodeFieldEditableCategory;
};

type NodeFieldListProps = {
  fields: readonly NodeFieldViewItem[];
  editable?: boolean;
  onFieldDelete?: (fieldId: string) => void;
  onFieldChange?: (fieldId: string, patch: NodeFieldChangePatch) => void;
  onFieldMove?: (
    fieldId: string,
    direction: NodeFieldMoveDirection,
    orderedFieldIds: readonly string[]
  ) => void;
  tokens?: typeof ontologyNodeViewTokens;
};

type NodeFieldRowProps = {
  canMoveDown: boolean;
  canMoveUp: boolean;
  field: NodeFieldViewItem;
  editable: boolean;
  onFieldDelete?: (fieldId: string) => void;
  onFieldChange?: (fieldId: string, patch: NodeFieldChangePatch) => void;
  onFieldMove?: (fieldId: string, direction: NodeFieldMoveDirection) => void;
  tokens: typeof ontologyNodeViewTokens;
};

const CATEGORY_OPTIONS: {
  label: string;
  value: NodeFieldEditableCategory;
}[] = [
  { label: 'Field', value: 'attribute' },
  { label: 'Method', value: 'behavior' },
  { label: 'Rule', value: 'rule' },
  { label: 'Constraint', value: 'constraint' },
  { label: 'Interface', value: 'interface' },
];

const getToneStyle = (
  tone: OntologyNodeViewTone,
  tokens: typeof ontologyNodeViewTokens
): CSSProperties => {
  const toneTokens: OntologyNodeMetricTone = tokens.metricTones[tone] ?? tokens.metricTones.field;

  return {
    '--oc-node-field-accent': toneTokens.accent,
    '--oc-node-field-surface': toneTokens.surface,
    '--oc-node-field-text': toneTokens.text,
  } as CSSProperties;
};

const normalizeOptionalDraftText = (value: string): string | undefined => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const stopCanvasInteraction = (event: { stopPropagation: () => void }) => {
  event.stopPropagation();
};

const inputStyle: CSSProperties = {
  background: 'transparent',
  border: 'none',
  borderRadius: 'var(--oc-node-radius-inner)',
  color: 'inherit',
  font: 'inherit',
  lineHeight: 'var(--oc-node-line-height)',
  minHeight: 'var(--oc-node-field-input-min-height)',
  minWidth: 0,
  outline: 'none',
  padding: 0,
  width: '100%',
};

const selectStyle: CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  background: 'var(--oc-node-color-surface-strong)',
  border: 'var(--oc-node-border-width) solid var(--oc-node-color-divider)',
  color: 'var(--oc-node-color-text-muted)',
  fontSize: 'var(--oc-node-meta-size)',
  padding: '0 var(--oc-node-space-xs)',
};

const fieldActionButtonStyle: CSSProperties = {
  alignItems: 'center',
  background: 'transparent',
  border: 'none',
  borderRadius: 'var(--oc-node-radius-inner)',
  color: 'var(--oc-node-color-text-muted)',
  cursor: 'pointer',
  display: 'inline-flex',
  height: 'var(--oc-node-field-action-size)',
  justifyContent: 'center',
  padding: 0,
  width: 'var(--oc-node-field-action-size)',
};

const getFieldCategory = (
  field: NodeFieldViewItem
): NodeFieldEditableCategory => {
  if (
    field.category === 'behavior' ||
    field.category === 'rule' ||
    field.category === 'constraint' ||
    field.category === 'interface'
  ) {
    return field.category;
  }

  return 'attribute';
};

const NodeFieldRow = ({
  canMoveDown,
  canMoveUp,
  field,
  editable,
  onFieldDelete,
  onFieldChange,
  onFieldMove,
  tokens,
}: NodeFieldRowProps) => {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const valueInputRef = useRef<HTMLInputElement>(null);
  const dataTypeInputRef = useRef<HTMLInputElement>(null);
  const canEdit = editable && field.category !== 'relationship' && Boolean(onFieldChange);
  const canUseActions = editable && field.category !== 'relationship';

  const resetDraft = useCallback(() => {
    if (nameInputRef.current) {
      nameInputRef.current.value = field.name;
    }

    if (valueInputRef.current) {
      valueInputRef.current.value = field.value ?? '';
    }

    if (dataTypeInputRef.current) {
      dataTypeInputRef.current.value = field.dataType ?? '';
    }
  }, [field]);

  const commitDraft = useCallback(() => {
    if (!canEdit || !onFieldChange) {
      return;
    }

    const nextName = (nameInputRef.current?.value ?? field.name).trim();
    if (nextName.length === 0) {
      resetDraft();
      return;
    }

    const nextValue = normalizeOptionalDraftText(valueInputRef.current?.value ?? '');
    const nextDataType = normalizeOptionalDraftText(dataTypeInputRef.current?.value ?? '');
    const patch: NodeFieldChangePatch = {};

    if (nextName !== field.name) {
      patch.name = nextName;
    }

    if (nextValue !== field.value) {
      patch.value = nextValue;
    }

    if (nextDataType !== field.dataType) {
      patch.dataType = nextDataType;
    }

    if (Object.keys(patch).length > 0) {
      onFieldChange(field.id, patch);
    }
  }, [canEdit, field, onFieldChange, resetDraft]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    event.stopPropagation();

    if (event.key === 'Enter') {
      event.currentTarget.blur();
      return;
    }

    if (event.key === 'Escape') {
      resetDraft();
      event.currentTarget.blur();
    }
  }, [resetDraft]);

  const handleCategoryChange = useCallback((category: NodeFieldEditableCategory) => {
    if (!canEdit || !onFieldChange) {
      return;
    }

    commitDraft();
    onFieldChange(field.id, { category });
  }, [canEdit, commitDraft, field.id, onFieldChange]);

  const handleFieldMove = useCallback((direction: NodeFieldMoveDirection) => {
    commitDraft();
    onFieldMove?.(field.id, direction);
  }, [commitDraft, field.id, onFieldMove]);

  const handleFieldDelete = useCallback(() => {
    onFieldDelete?.(field.id);
  }, [field.id, onFieldDelete]);

  return (
    <div
      style={{
        ...getToneStyle(field.tone, tokens),
        alignItems: 'center',
        background: 'var(--oc-node-color-surface-muted)',
        border: 'var(--oc-node-border-width) solid var(--oc-node-color-divider)',
        borderRadius: 'var(--oc-node-radius-inner)',
        display: 'grid',
        gap: 'var(--oc-node-space-xs)',
        gridTemplateColumns: canUseActions
          ? 'var(--oc-node-metric-icon-size) minmax(0, 1fr) var(--oc-node-field-category-width) var(--oc-node-field-actions-width)'
          : 'var(--oc-node-metric-icon-size) minmax(0, 1fr) var(--oc-node-field-type-width)',
        minHeight: 'var(--oc-node-field-min-height)',
        padding: 'var(--oc-node-space-xs) var(--oc-node-space-sm)',
      }}
    >
      <span
        style={{
          alignItems: 'center',
          background: 'var(--oc-node-field-surface)',
          border: 'var(--oc-node-border-width) solid var(--oc-node-field-accent)',
          borderRadius: 'var(--oc-node-radius-inner)',
          color: 'var(--oc-node-field-text)',
          display: 'inline-flex',
          fontSize: 'var(--oc-node-meta-size)',
          fontWeight: 'var(--oc-node-weight-strong)',
          height: 'var(--oc-node-metric-icon-size)',
          justifyContent: 'center',
          width: 'var(--oc-node-metric-icon-size)',
        }}
        title={field.category}
      >
        {field.iconLabel ?? 'P'}
      </span>
      <div
        style={{
          minWidth: 0,
        }}
      >
        {canEdit ? (
          <input
            aria-label="Field name"
            className="nodrag"
            defaultValue={field.name}
            onBlur={commitDraft}
            onClick={stopCanvasInteraction}
            onKeyDown={handleKeyDown}
            onMouseDown={stopCanvasInteraction}
            onPointerDown={stopCanvasInteraction}
            ref={nameInputRef}
            spellCheck={false}
            style={{
              ...inputStyle,
              color: 'var(--oc-node-color-text)',
              fontSize: 'var(--oc-node-field-size)',
              fontWeight: 'var(--oc-node-weight-field)',
            }}
            title={field.name}
          />
        ) : (
          <div
            style={{
              color: 'var(--oc-node-color-text)',
              fontSize: 'var(--oc-node-field-size)',
              fontWeight: 'var(--oc-node-weight-field)',
              lineHeight: 'var(--oc-node-line-height)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={field.name}
          >
            {field.name}
          </div>
        )}
        {canEdit ? (
          <input
            aria-label="Field value"
            className="nodrag"
            defaultValue={field.value ?? ''}
            onBlur={commitDraft}
            onClick={stopCanvasInteraction}
            onKeyDown={handleKeyDown}
            onMouseDown={stopCanvasInteraction}
            onPointerDown={stopCanvasInteraction}
            ref={valueInputRef}
            spellCheck={false}
            style={{
              ...inputStyle,
              color: 'var(--oc-node-color-text-muted)',
              fontSize: 'var(--oc-node-meta-size)',
            }}
            title={field.value}
          />
        ) : field.value ? (
          <div
            style={{
              color: 'var(--oc-node-color-text-muted)',
              fontSize: 'var(--oc-node-meta-size)',
              lineHeight: 'var(--oc-node-line-height)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={field.value}
          >
            {field.value}
          </div>
        ) : null}
      </div>
      {canEdit ? (
        <div
          style={{
            display: 'grid',
            gap: 'var(--oc-node-space-2xs)',
            minWidth: 0,
          }}
        >
          <select
            aria-label="Field category"
            className="nodrag"
            defaultValue={getFieldCategory(field)}
            onChange={(event) => handleCategoryChange(event.target.value as NodeFieldEditableCategory)}
            onClick={stopCanvasInteraction}
            onKeyDown={handleKeyDown}
            onMouseDown={stopCanvasInteraction}
            onPointerDown={stopCanvasInteraction}
            style={selectStyle}
            title="Field category"
          >
            {CATEGORY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            aria-label="Field type"
            className="nodrag"
            defaultValue={field.dataType ?? ''}
            onBlur={commitDraft}
            onClick={stopCanvasInteraction}
            onKeyDown={handleKeyDown}
            onMouseDown={stopCanvasInteraction}
            onPointerDown={stopCanvasInteraction}
            ref={dataTypeInputRef}
            spellCheck={false}
            style={{
              ...inputStyle,
              color: 'var(--oc-node-color-text-muted)',
              fontSize: 'var(--oc-node-meta-size)',
              textAlign: 'right',
            }}
            title={field.dataType ?? field.category}
          />
        </div>
      ) : (
        <div
          style={{
            color: 'var(--oc-node-color-text-muted)',
            fontSize: 'var(--oc-node-meta-size)',
            lineHeight: 'var(--oc-node-line-height)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={field.dataType ?? field.category}
        >
          {field.dataType ?? field.category ?? ''}
        </div>
      )}
      {canUseActions ? (
        <div
          className="nodrag"
          style={{
            alignItems: 'center',
            display: 'grid',
            gap: 'var(--oc-node-space-2xs)',
            gridTemplateColumns: 'repeat(3, var(--oc-node-field-action-size))',
            justifyContent: 'end',
          }}
        >
          <button
            aria-label="Move field up"
            disabled={!canMoveUp || !onFieldMove}
            onClick={(event) => {
              event.stopPropagation();
              handleFieldMove('up');
            }}
            onMouseDown={stopCanvasInteraction}
            onPointerDown={stopCanvasInteraction}
            style={{
              ...fieldActionButtonStyle,
              cursor: canMoveUp && onFieldMove ? 'pointer' : 'not-allowed',
              opacity: canMoveUp && onFieldMove ? 1 : 0.35,
            }}
            title="Move field up"
            type="button"
          >
            <ArrowUp size={tokens.iconSizeSm} />
          </button>
          <button
            aria-label="Move field down"
            disabled={!canMoveDown || !onFieldMove}
            onClick={(event) => {
              event.stopPropagation();
              handleFieldMove('down');
            }}
            onMouseDown={stopCanvasInteraction}
            onPointerDown={stopCanvasInteraction}
            style={{
              ...fieldActionButtonStyle,
              cursor: canMoveDown && onFieldMove ? 'pointer' : 'not-allowed',
              opacity: canMoveDown && onFieldMove ? 1 : 0.35,
            }}
            title="Move field down"
            type="button"
          >
            <ArrowDown size={tokens.iconSizeSm} />
          </button>
          <button
            aria-label="Delete field"
            disabled={!onFieldDelete}
            onClick={(event) => {
              event.stopPropagation();
              handleFieldDelete();
            }}
            onMouseDown={stopCanvasInteraction}
            onPointerDown={stopCanvasInteraction}
            style={{
              ...fieldActionButtonStyle,
              color: 'var(--oc-node-color-danger)',
              cursor: onFieldDelete ? 'pointer' : 'not-allowed',
              opacity: onFieldDelete ? 1 : 0.35,
            }}
            title="Delete field"
            type="button"
          >
            <Trash2 size={tokens.iconSizeSm} />
          </button>
        </div>
      ) : null}
    </div>
  );
};

export const NodeFieldList = ({
  fields,
  editable = false,
  onFieldDelete,
  onFieldChange,
  onFieldMove,
  tokens = ontologyNodeViewTokens,
}: NodeFieldListProps) => {
  if (fields.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--oc-node-space-2xs)',
      }}
    >
      {fields.map((field, index) => (
        <NodeFieldRow
          canMoveDown={index < fields.length - 1}
          canMoveUp={index > 0}
          editable={editable}
          field={field}
          key={`${field.id}:${field.name}:${field.value ?? ''}:${field.dataType ?? ''}:${field.category ?? ''}`}
          onFieldDelete={onFieldDelete}
          onFieldChange={onFieldChange}
          onFieldMove={onFieldMove
            ? (fieldId, direction) => onFieldMove(
              fieldId,
              direction,
              fields.map(currentField => currentField.id)
            )
            : undefined}
          tokens={tokens}
        />
      ))}
    </div>
  );
};
