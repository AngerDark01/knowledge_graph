import { Plus, Trash2 } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  OntologyFieldCategory,
  OntologyNodeType,
} from '@/domain/ontology';
import {
  buildAttributesFromItems,
  createAttributeItems,
  type AttributeItem,
} from '../model/inspector';
import {
  getOntologyNodeTypeTone,
  ontologyNodeViewTokens,
} from '../config';

export type NodeAttributeEditorMode = 'node' | 'domain';

export type NodeAttributeEditorProps = {
  attributes: Record<string, unknown>;
  mode?: NodeAttributeEditorMode;
  onChange: (attributes: Record<string, unknown>) => void;
};

type FieldEditorItem = {
  key: string;
  value: string;
  dataType: string;
  category: OntologyFieldCategory;
};

const NODE_TYPES: OntologyNodeType[] = [
  'Class',
  'Concept',
  'Function',
  'Component',
  'Information',
  'Interface',
  'Constraint',
];

const FIELD_CATEGORY_OPTIONS: Array<{
  value: OntologyFieldCategory;
  label: string;
  iconLabel: string;
}> = [
  { value: 'attribute', label: 'Field', iconLabel: 'P' },
  { value: 'behavior', label: 'Method', iconLabel: 'M' },
  { value: 'rule', label: 'Rule', iconLabel: 'R' },
  { value: 'constraint', label: 'Constraint', iconLabel: 'R' },
  { value: 'interface', label: 'Interface', iconLabel: 'I' },
];

const RESERVED_ATTRIBUTE_KEYS = new Set([
  'ontologyType',
  'ontologyNodeId',
  'ontologyDomainId',
  'nodeType',
  'kind',
]);

const DEFAULT_NEW_FIELD: FieldEditorItem = {
  key: '',
  value: '',
  dataType: 'string',
  category: 'attribute',
};

const labelStyle = {
  color: 'var(--oc-node-color-text-muted)',
  fontSize: 'var(--oc-node-meta-size)',
  fontWeight: 'var(--oc-node-weight-strong)',
  letterSpacing: 0,
  textTransform: 'uppercase',
} as const;

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const stringifyValue = (value: unknown): string => {
  if (value === undefined || value === null) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  return JSON.stringify(value);
};

const parseValue = (value: string): unknown => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
};

const normalizeNodeType = (value: unknown): OntologyNodeType => {
  if (typeof value !== 'string') {
    return 'Class';
  }

  return NODE_TYPES.find(type => type.toLowerCase() === value.trim().toLowerCase()) ?? 'Class';
};

const normalizeFieldCategory = (value: unknown): OntologyFieldCategory => {
  if (typeof value !== 'string') {
    return 'attribute';
  }

  return FIELD_CATEGORY_OPTIONS.find(option => option.value === value)?.value ?? 'attribute';
};

const inferDataType = (value: unknown): string => {
  if (Array.isArray(value)) {
    return 'array';
  }

  if (value === null) {
    return 'null';
  }

  return typeof value;
};

const hasStructuredFieldShape = (value: Record<string, unknown>): boolean => (
  'value' in value || 'dataType' in value || 'category' in value
);

const createFieldEditorItems = (
  attributes: Record<string, unknown>
): FieldEditorItem[] => (
  Object.entries(attributes)
    .filter(([key]) => !RESERVED_ATTRIBUTE_KEYS.has(key))
    .map(([key, rawValue]) => {
      const recordValue = isRecord(rawValue) && hasStructuredFieldShape(rawValue)
        ? rawValue
        : undefined;
      const value = recordValue ? recordValue.value : rawValue;

      return {
        key,
        value: stringifyValue(value),
        dataType: typeof recordValue?.dataType === 'string'
          ? recordValue.dataType
          : inferDataType(value),
        category: normalizeFieldCategory(recordValue?.category),
      };
    })
);

const buildNodeAttributes = (
  nodeType: OntologyNodeType,
  fields: FieldEditorItem[]
): Record<string, unknown> => {
  const nextAttributes: Record<string, unknown> = {
    ontologyType: nodeType,
  };

  fields.forEach((field) => {
    const key = field.key.trim();
    if (!key || RESERVED_ATTRIBUTE_KEYS.has(key)) {
      return;
    }

    nextAttributes[key] = {
      value: parseValue(field.value),
      dataType: field.dataType.trim() || 'string',
      category: field.category,
    };
  });

  return nextAttributes;
};

const GenericAttributeEditor = ({
  attributes,
  onChange,
}: Pick<NodeAttributeEditorProps, 'attributes' | 'onChange'>) => {
  const [items, setItems] = useState<AttributeItem[]>(() => createAttributeItems(attributes));
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const commit = (nextItems: AttributeItem[]) => {
    setItems(nextItems);
    onChange(buildAttributesFromItems(nextItems));
  };

  const updateItem = (
    index: number,
    field: keyof AttributeItem,
    value: string
  ) => {
    const nextItems = items.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    ));
    commit(nextItems);
  };

  const removeItem = (index: number) => {
    commit(items.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleAddItem = () => {
    const trimmedKey = newKey.trim();
    if (!trimmedKey || items.some(item => item.key === trimmedKey)) {
      return;
    }

    commit([
      ...items,
      {
        key: trimmedKey,
        value: newValue,
      },
    ]);
    setNewKey('');
    setNewValue('');
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--oc-node-space-sm)' }}>
      <div style={labelStyle}>Metadata</div>

      <div style={{ display: 'grid', gap: 'var(--oc-node-space-xs)' }}>
        {items.length > 0 ? (
          items.map((item, index) => (
            <div
              key={`${item.key}:${index}`}
              style={{
                alignItems: 'start',
                display: 'grid',
                gap: 'var(--oc-node-space-xs)',
                gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr) auto',
              }}
            >
              <Input
                className="h-8"
                value={item.key}
                onChange={(event) => updateItem(index, 'key', event.target.value)}
                placeholder="Key"
              />
              <Input
                className="h-8"
                value={item.value}
                onChange={(event) => updateItem(index, 'value', event.target.value)}
                placeholder="Value"
              />
              <Button
                aria-label="Remove metadata"
                className="h-8 w-8 p-0"
                onClick={() => removeItem(index)}
                size="icon"
                variant="ghost"
                type="button"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        ) : (
          <div
            style={{
              alignItems: 'center',
              background: 'var(--oc-node-color-surface-muted)',
              border: 'var(--oc-node-border-width) dashed var(--oc-node-color-divider)',
              borderRadius: 'var(--oc-node-radius-inner)',
              color: 'var(--oc-node-color-text-muted)',
              display: 'flex',
              fontSize: 'var(--oc-node-meta-size)',
              minHeight: 'var(--oc-node-field-min-height)',
              padding: 'var(--oc-node-space-xs) var(--oc-node-space-sm)',
            }}
          >
            No metadata yet
          </div>
        )}
      </div>

      <div
        style={{
          alignItems: 'start',
          display: 'grid',
          gap: 'var(--oc-node-space-xs)',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr) auto',
        }}
      >
        <Input
          className="h-8"
          value={newKey}
          onChange={(event) => setNewKey(event.target.value)}
          placeholder="New key"
        />
        <Input
          className="h-8"
          value={newValue}
          onChange={(event) => setNewValue(event.target.value)}
          placeholder="New value"
        />
        <Button
          aria-label="Add metadata"
          className="h-8 px-3"
          onClick={handleAddItem}
          size="sm"
          type="button"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const NodeFieldEditor = ({
  attributes,
  onChange,
}: Pick<NodeAttributeEditorProps, 'attributes' | 'onChange'>) => {
  const initialNodeType = useMemo(
    () => normalizeNodeType(attributes.ontologyType ?? attributes.nodeType ?? attributes.kind),
    [attributes]
  );
  const [nodeType, setNodeType] = useState<OntologyNodeType>(initialNodeType);
  const [fields, setFields] = useState<FieldEditorItem[]>(() => createFieldEditorItems(attributes));
  const [newField, setNewField] = useState<FieldEditorItem>(DEFAULT_NEW_FIELD);
  const nodeTypeTone = getOntologyNodeTypeTone(nodeType);
  const rootStyle: CSSProperties & Record<`--${string}`, string> = {
    ...ontologyNodeViewTokens.cssVars,
    '--oc-node-type-accent': nodeTypeTone.accent,
    '--oc-node-type-surface': nodeTypeTone.surface,
    '--oc-node-type-text': nodeTypeTone.text,
    display: 'grid',
    gap: 'var(--oc-node-space-sm)',
  };

  const commit = (nextNodeType: OntologyNodeType, nextFields: FieldEditorItem[]) => {
    setNodeType(nextNodeType);
    setFields(nextFields);
    onChange(buildNodeAttributes(nextNodeType, nextFields));
  };

  const updateNodeType = (nextNodeType: OntologyNodeType) => {
    commit(nextNodeType, fields);
  };

  const updateField = <K extends keyof FieldEditorItem,>(
    index: number,
    field: K,
    value: FieldEditorItem[K]
  ) => {
    const nextFields = fields.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    ));
    commit(nodeType, nextFields);
  };

  const removeField = (index: number) => {
    commit(nodeType, fields.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleAddField = () => {
    const key = newField.key.trim();
    if (!key || RESERVED_ATTRIBUTE_KEYS.has(key) || fields.some(field => field.key === key)) {
      return;
    }

    commit(nodeType, [
      ...fields,
      {
        ...newField,
        key,
      },
    ]);
    setNewField(DEFAULT_NEW_FIELD);
  };

  return (
    <div
      style={rootStyle}
    >
      <div style={labelStyle}>Ontology Structure</div>

      <div style={{ display: 'grid', gap: 'var(--oc-node-space-xs)' }}>
        <div
          style={{
            color: 'var(--oc-node-color-text-muted)',
            fontSize: 'var(--oc-node-meta-size)',
          }}
        >
          Node type
        </div>
        <Select
          value={nodeType}
          onValueChange={(value) => updateNodeType(value as OntologyNodeType)}
        >
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Node type" />
          </SelectTrigger>
          <SelectContent>
            {NODE_TYPES.map(type => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div style={{ display: 'grid', gap: 'var(--oc-node-space-xs)' }}>
        {fields.length > 0 ? (
          fields.map((field, index) => {
            const categoryOption = FIELD_CATEGORY_OPTIONS.find(option => option.value === field.category);

            return (
              <div
                key={`${field.key}:${index}`}
                style={{
                  background: 'var(--oc-node-color-surface-muted)',
                  border: 'var(--oc-node-border-width) solid var(--oc-node-color-divider)',
                  borderRadius: 'var(--oc-node-radius-inner)',
                  display: 'grid',
                  gap: 'var(--oc-node-space-xs)',
                  padding: 'var(--oc-node-space-sm)',
                }}
              >
                <div
                  style={{
                    alignItems: 'center',
                    display: 'grid',
                    gap: 'var(--oc-node-space-xs)',
                    gridTemplateColumns: 'var(--oc-node-metric-icon-size) minmax(0, 1fr) auto',
                  }}
                >
                  <span
                    style={{
                      alignItems: 'center',
                      background: 'var(--oc-node-type-surface)',
                      borderRadius: 'var(--oc-node-radius-inner)',
                      color: 'var(--oc-node-type-text)',
                      display: 'inline-flex',
                      fontSize: 'var(--oc-node-meta-size)',
                      fontWeight: 'var(--oc-node-weight-strong)',
                      height: 'var(--oc-node-metric-icon-size)',
                      justifyContent: 'center',
                      width: 'var(--oc-node-metric-icon-size)',
                    }}
                  >
                    {categoryOption?.iconLabel ?? 'P'}
                  </span>
                  <Input
                    className="h-8"
                    value={field.key}
                    onChange={(event) => updateField(index, 'key', event.target.value)}
                    placeholder="Name"
                  />
                  <Button
                    aria-label="Remove field"
                    className="h-8 w-8 p-0"
                    onClick={() => removeField(index)}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gap: 'var(--oc-node-space-xs)',
                    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                  }}
                >
                  <Select
                    value={field.category}
                    onValueChange={(value) => updateField(index, 'category', value as OntologyFieldCategory)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Section" />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_CATEGORY_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    className="h-8"
                    value={field.dataType}
                    onChange={(event) => updateField(index, 'dataType', event.target.value)}
                    placeholder="Type"
                  />
                </div>
                <Input
                  className="h-8"
                  value={field.value}
                  onChange={(event) => updateField(index, 'value', event.target.value)}
                  placeholder="Value"
                />
              </div>
            );
          })
        ) : (
          <div
            style={{
              alignItems: 'center',
              background: 'var(--oc-node-color-surface-muted)',
              border: 'var(--oc-node-border-width) dashed var(--oc-node-color-divider)',
              borderRadius: 'var(--oc-node-radius-inner)',
              color: 'var(--oc-node-color-text-muted)',
              display: 'flex',
              fontSize: 'var(--oc-node-meta-size)',
              minHeight: 'var(--oc-node-field-min-height)',
              padding: 'var(--oc-node-space-xs) var(--oc-node-space-sm)',
            }}
          >
            No fields yet
          </div>
        )}
      </div>

      <div
        style={{
          background: 'var(--oc-node-color-surface-strong)',
          border: 'var(--oc-node-border-width) solid var(--oc-node-color-divider)',
          borderRadius: 'var(--oc-node-radius-inner)',
          display: 'grid',
          gap: 'var(--oc-node-space-xs)',
          padding: 'var(--oc-node-space-sm)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gap: 'var(--oc-node-space-xs)',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          }}
        >
          <Input
            className="h-8"
            value={newField.key}
            onChange={(event) => setNewField(field => ({ ...field, key: event.target.value }))}
            placeholder="New field"
          />
          <Input
            className="h-8"
            value={newField.dataType}
            onChange={(event) => setNewField(field => ({ ...field, dataType: event.target.value }))}
            placeholder="Type"
          />
        </div>
        <div
          style={{
            display: 'grid',
            gap: 'var(--oc-node-space-xs)',
            gridTemplateColumns: 'minmax(0, 1fr) auto',
          }}
        >
          <Select
            value={newField.category}
            onValueChange={(value) => setNewField(field => ({
              ...field,
              category: value as OntologyFieldCategory,
            }))}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Section" />
            </SelectTrigger>
            <SelectContent>
              {FIELD_CATEGORY_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            aria-label="Add field"
            className="h-8 px-3"
            onClick={handleAddField}
            size="sm"
            type="button"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Input
          className="h-8"
          value={newField.value}
          onChange={(event) => setNewField(field => ({ ...field, value: event.target.value }))}
          placeholder="Value"
        />
      </div>
    </div>
  );
};

export const NodeAttributeEditor = ({
  attributes,
  mode = 'node',
  onChange,
}: NodeAttributeEditorProps) => {
  if (mode === 'domain') {
    return (
      <GenericAttributeEditor
        attributes={attributes}
        onChange={onChange}
      />
    );
  }

  return (
    <NodeFieldEditor
      attributes={attributes}
      onChange={onChange}
    />
  );
};
