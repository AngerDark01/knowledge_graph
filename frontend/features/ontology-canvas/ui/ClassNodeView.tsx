import {
  AlertCircle,
  Ban,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Layers,
  Lock,
  MousePointer2,
  Plus,
} from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import type { OntologyFieldCategory, OntologyNodeType } from '@/domain/ontology';
import {
  getOntologyNodeTypeTone,
  ontologyNodeViewTokens,
  type OntologyNodeCssVars,
} from '../config';
import type {
  OntologyNodeViewMetric,
  OntologyNodeViewModel,
  OntologyNodeViewSectionKind,
} from '../model/view';
import {
  NodeFieldList,
  type NodeFieldChangePatch,
  type NodeFieldMoveDirection,
  type NodeFieldViewItem,
} from './NodeFieldList';
import { NodeMetricList } from './NodeMetricList';
import { NodeSection } from './NodeSection';

export type ClassNodeViewProps = {
  viewModel?: OntologyNodeViewModel;
  title?: string;
  type?: OntologyNodeType | string;
  description?: string;
  fields?: readonly NodeFieldViewItem[];
  tags?: readonly string[];
  validationError?: string;
  selected?: boolean;
  status?: 'default' | 'hovered' | 'selected' | 'readonly' | 'disabled';
  isExpanded?: boolean;
  lodMode?: 'full' | 'compact' | 'outline' | 'dot';
  collapsedSectionIds?: readonly string[];
  onToggleExpand?: () => void;
  onAddField?: (category?: OntologyFieldCategory) => void;
  onFieldDelete?: (fieldId: string) => void;
  onFieldChange?: (fieldId: string, patch: NodeFieldChangePatch) => void;
  onFieldMove?: (
    fieldId: string,
    direction: NodeFieldMoveDirection,
    orderedFieldIds: readonly string[]
  ) => void;
  onEnterSubcanvas?: () => void;
  onToggleSection?: (sectionId: OntologyNodeViewSectionKind) => void;
  tokens?: typeof ontologyNodeViewTokens;
};

const iconButtonStyle: CSSProperties = {
  alignItems: 'center',
  background: 'transparent',
  border: 'none',
  borderRadius: 'var(--oc-node-radius-inner)',
  color: 'var(--oc-node-color-text-muted)',
  cursor: 'pointer',
  display: 'inline-flex',
  height: 'var(--oc-node-icon-button-size)',
  justifyContent: 'center',
  padding: 0,
  width: 'var(--oc-node-icon-button-size)',
};

const stateBadgeConfig = {
  hovered: {
    icon: MousePointer2,
    label: 'Hover',
    tone: 'var(--oc-node-color-border-strong)',
  },
  selected: {
    icon: CheckCircle2,
    label: 'Selected',
    tone: 'var(--oc-node-color-border-strong)',
  },
  readonly: {
    icon: Lock,
    label: 'Read only',
    tone: 'var(--oc-node-color-text-muted)',
  },
  disabled: {
    icon: Ban,
    label: 'Disabled',
    tone: 'var(--oc-node-color-danger)',
  },
} as const;

const getTypeInitial = (type: string | undefined): string => {
  const value = type?.trim();
  return value ? value.slice(0, 1).toUpperCase() : 'C';
};

const createFallbackMetrics = (
  fieldCount: number
): OntologyNodeViewMetric[] => [
  {
    id: 'fields',
    label: 'Fields',
    value: fieldCount,
    iconLabel: 'P',
    tone: 'field',
  },
  {
    id: 'methods',
    label: 'Methods',
    value: 0,
    iconLabel: 'M',
    tone: 'method',
  },
  {
    id: 'children',
    label: 'Child Nodes',
    value: 0,
    iconLabel: 'S',
    tone: 'subcanvas',
  },
  {
    id: 'relationships',
    label: 'Relations',
    value: 0,
    iconLabel: 'L',
    tone: 'relationship',
  },
];

const createFallbackViewModel = (
  title: string | undefined,
  type: string | undefined,
  description: string | undefined,
  fields: readonly NodeFieldViewItem[],
  tags: readonly string[]
): OntologyNodeViewModel => ({
  id: 'fallback',
  title: title ?? 'Untitled node',
  type: type ?? 'Class',
  description,
  tags: [...tags],
  sections: [
    {
      id: 'fields',
      title: 'Fields',
      metricLabel: String(fields.length),
      emptyLabel: 'No fields yet',
      items: [...fields],
    },
  ],
  metrics: createFallbackMetrics(fields.length),
  counts: {
    fields: fields.length,
    methods: 0,
    rules: 0,
    interfaces: 0,
    relationships: 0,
    childNodes: 0,
  },
  hasSubcanvas: false,
});

const createNodeCssVars = (
  type: string | undefined,
  tokens: typeof ontologyNodeViewTokens
): OntologyNodeCssVars => {
  const tone = getOntologyNodeTypeTone(type);

  return {
    ...tokens.cssVars,
    '--oc-node-type-accent': tone.accent,
    '--oc-node-type-surface': tone.surface,
    '--oc-node-type-text': tone.text,
  };
};

const getDefaultFieldCategoryForSection = (
  sectionId: OntologyNodeViewSectionKind
): OntologyFieldCategory | undefined => {
  if (sectionId === 'fields') {
    return 'attribute';
  }

  if (sectionId === 'methods') {
    return 'behavior';
  }

  if (sectionId === 'rules') {
    return 'rule';
  }

  if (sectionId === 'interfaces') {
    return 'interface';
  }

  return undefined;
};

const getSectionAddActionLabel = (
  sectionId: OntologyNodeViewSectionKind
): string => {
  if (sectionId === 'methods') {
    return 'Add method';
  }

  if (sectionId === 'rules') {
    return 'Add rule';
  }

  if (sectionId === 'interfaces') {
    return 'Add interface';
  }

  return 'Add field';
};

const getStateAccent = (status: ClassNodeViewProps['status']): string => {
  if (status === 'disabled') {
    return 'var(--oc-node-color-danger)';
  }

  if (status === 'readonly') {
    return 'var(--oc-node-color-text-muted)';
  }

  return 'var(--oc-node-color-border-strong)';
};

const createSectionSummary = (
  sectionItems: readonly NodeFieldViewItem[],
  emptyLabel: string,
  hiddenItemCount: number,
  tokens: typeof ontologyNodeViewTokens
): string => {
  if (sectionItems.length === 0) {
    return emptyLabel;
  }

  const names = sectionItems
    .slice(0, tokens.sectionSummaryItemLimit)
    .map(item => item.name)
    .join(', ');

  if (hiddenItemCount > 0) {
    return `${sectionItems.length} total · ${hiddenItemCount} hidden · ${names}`;
  }

  return `${sectionItems.length} total · ${names}`;
};

export const ClassNodeView = ({
  viewModel,
  title,
  type = 'Class',
  description,
  fields = [],
  tags = [],
  validationError,
  selected = false,
  status,
  isExpanded = false,
  lodMode = 'full',
  collapsedSectionIds = [],
  onToggleExpand,
  onAddField,
  onFieldDelete,
  onFieldChange,
  onFieldMove,
  onEnterSubcanvas,
  onToggleSection,
  tokens = ontologyNodeViewTokens,
}: ClassNodeViewProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const model = viewModel ?? createFallbackViewModel(
    title,
    String(type),
    description,
    fields,
    tags
  );
  const cssVars = createNodeCssVars(String(model.type), tokens);
  const typeInitial = getTypeInitial(String(model.type));
  const resolvedStatus = status ?? (selected ? 'selected' : isHovering ? 'hovered' : 'default');
  const canInteract = resolvedStatus !== 'readonly' && resolvedStatus !== 'disabled';
  const sectionLimit = isExpanded
    ? tokens.expandedSectionLimit
    : tokens.collapsedSectionLimit;
  const itemLimit = isExpanded
    ? tokens.expandedFieldLimit
    : tokens.collapsedFieldLimit;
  const visibleSections = model.sections.slice(0, sectionLimit);
  const collapsedSectionSet = new Set(collapsedSectionIds);
  const hiddenSectionCount = Math.max(0, model.sections.length - visibleSections.length);
  const StateBadge = resolvedStatus !== 'default'
    ? stateBadgeConfig[resolvedStatus as keyof typeof stateBadgeConfig]
    : undefined;
  const rootInteractionProps = {
    onMouseEnter: () => setIsHovering(true),
    onMouseLeave: () => setIsHovering(false),
  };
  const containerStyle: CSSProperties = {
    ...cssVars,
    background: 'var(--oc-node-color-surface)',
    border: 'var(--oc-node-border-width) solid',
    borderColor: resolvedStatus === 'selected' || resolvedStatus === 'hovered'
      ? 'var(--oc-node-color-border-strong)'
      : 'var(--oc-node-color-border)',
    borderRadius: 'var(--oc-node-radius)',
    boxShadow: selected
      ? 'var(--oc-node-shadow-selected)'
      : resolvedStatus === 'hovered'
        ? 'var(--oc-node-shadow-hover)'
        : 'var(--oc-node-shadow)',
    color: 'var(--oc-node-color-text)',
    display: 'grid',
    gap: 'var(--oc-node-space-md)',
    height: '100%',
    opacity: resolvedStatus === 'disabled' ? 0.6 : 1,
    overflow: 'hidden',
    padding: 'var(--oc-node-space-md)',
    position: 'relative',
    width: '100%',
    filter: resolvedStatus === 'disabled' ? 'grayscale(0.15)' : 'none',
    cursor: resolvedStatus === 'disabled' ? 'not-allowed' : 'default',
  };
  const stateRail = resolvedStatus !== 'default' ? (
    <span
      aria-hidden
      style={{
        background: getStateAccent(resolvedStatus),
        bottom: 0,
        left: 0,
        position: 'absolute',
        top: 0,
        width: 'var(--oc-node-state-rail-width)',
      }}
    />
  ) : null;

  if (lodMode === 'dot') {
    return (
      <div
        {...rootInteractionProps}
        style={{
          ...containerStyle,
          alignItems: 'center',
          gap: 0,
          justifyItems: 'center',
          padding: 'var(--oc-node-space-sm)',
        }}
        title={`${model.title} (${model.type})`}
      >
        {stateRail}
        <span
          style={{
            alignItems: 'center',
            background: 'var(--oc-node-type-accent)',
            borderRadius: 'var(--oc-node-radius-inner)',
            color: 'var(--oc-node-color-on-accent)',
            display: 'inline-flex',
            fontSize: 'var(--oc-node-meta-size)',
            fontWeight: 'var(--oc-node-weight-strong)',
            height: 'var(--oc-node-type-icon-size)',
            justifyContent: 'center',
            width: 'var(--oc-node-type-icon-size)',
          }}
        >
          {typeInitial}
        </span>
      </div>
    );
  }

  if (lodMode === 'outline') {
    return (
      <div
        {...rootInteractionProps}
        style={{
          ...containerStyle,
          alignItems: 'center',
          gap: 'var(--oc-node-space-sm)',
          gridTemplateColumns: 'var(--oc-node-type-icon-size) minmax(0, 1fr) auto',
          padding: 'var(--oc-node-space-sm)',
        }}
      >
        {stateRail}
        <span
          style={{
            alignItems: 'center',
            background: 'var(--oc-node-type-accent)',
            borderRadius: 'var(--oc-node-radius-inner)',
            color: 'var(--oc-node-color-on-accent)',
            display: 'inline-flex',
            fontSize: 'var(--oc-node-meta-size)',
            fontWeight: 'var(--oc-node-weight-strong)',
            height: 'var(--oc-node-type-icon-size)',
            justifyContent: 'center',
            width: 'var(--oc-node-type-icon-size)',
          }}
        >
          {typeInitial}
        </span>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 'var(--oc-node-title-size)',
              fontWeight: 'var(--oc-node-weight-strong)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={model.title}
          >
            {model.title}
          </div>
          <div
            style={{
              color: 'var(--oc-node-color-text-muted)',
              fontSize: 'var(--oc-node-meta-size)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {model.type}
          </div>
        </div>
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            gap: 'var(--oc-node-space-2xs)',
          }}
        >
          {StateBadge ? (
            <span
              style={{
                alignItems: 'center',
                background: 'var(--oc-node-color-surface-strong)',
                border: 'var(--oc-node-border-width) solid var(--oc-node-color-divider)',
                borderRadius: 'var(--oc-node-radius-pill)',
                color: StateBadge.tone,
                display: 'inline-flex',
                fontSize: 'var(--oc-node-meta-size)',
                fontWeight: 'var(--oc-node-weight-strong)',
                gap: 'var(--oc-node-space-2xs)',
                padding: 'var(--oc-node-space-2xs) var(--oc-node-space-xs)',
              }}
              title={StateBadge.label}
            >
              <StateBadge.icon size={tokens.iconSizeSm} />
              <span>{StateBadge.label}</span>
            </span>
          ) : null}
          {model.counts.childNodes > 0 ? (
            <span
              style={{
                background: 'var(--oc-node-type-surface)',
                borderRadius: 'var(--oc-node-radius-inner)',
                color: 'var(--oc-node-type-text)',
                fontSize: 'var(--oc-node-meta-size)',
                fontWeight: 'var(--oc-node-weight-strong)',
                minWidth: 'var(--oc-node-badge-min-width)',
                padding: 'var(--oc-node-space-2xs) var(--oc-node-space-xs)',
                textAlign: 'center',
              }}
              title="Child nodes"
            >
              {model.counts.childNodes}
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div {...rootInteractionProps} style={containerStyle}>
      {stateRail}
      <div
        style={{
          alignItems: 'start',
          display: 'grid',
          gap: 'var(--oc-node-space-sm)',
          gridTemplateColumns: 'var(--oc-node-type-icon-size) minmax(0, 1fr) auto',
        }}
      >
        <span
          style={{
            alignItems: 'center',
            background: 'var(--oc-node-type-accent)',
            borderRadius: 'var(--oc-node-radius-inner)',
            color: 'var(--oc-node-color-on-accent)',
            display: 'inline-flex',
            fontSize: 'var(--oc-node-meta-size)',
            fontWeight: 'var(--oc-node-weight-strong)',
            height: 'var(--oc-node-type-icon-size)',
            justifyContent: 'center',
            width: 'var(--oc-node-type-icon-size)',
          }}
        >
          {typeInitial}
        </span>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              color: 'var(--oc-node-type-text)',
              fontSize: 'var(--oc-node-meta-size)',
              fontWeight: 'var(--oc-node-weight-strong)',
              letterSpacing: 0,
              lineHeight: 'var(--oc-node-line-height)',
              textTransform: 'uppercase',
            }}
          >
            {model.type}
          </div>
          <div
            style={{
              color: 'var(--oc-node-color-text)',
              fontSize: 'var(--oc-node-title-size)',
              fontWeight: 'var(--oc-node-weight-title)',
              lineHeight: 'var(--oc-node-line-height)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={model.title}
          >
            {model.title}
          </div>
          {model.tags.length > 0 ? (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--oc-node-space-2xs)',
                marginTop: 'var(--oc-node-space-xs)',
              }}
            >
              {model.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  style={{
                    background: 'var(--oc-node-color-surface-muted)',
                    border: 'var(--oc-node-border-width) solid var(--oc-node-color-divider)',
                    borderRadius: 'var(--oc-node-radius-pill)',
                    color: 'var(--oc-node-color-text-muted)',
                    fontSize: 'var(--oc-node-meta-size)',
                    padding: 'var(--oc-node-space-2xs) var(--oc-node-space-xs)',
                  }}
                  title={tag}
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div
          className="nodrag"
          style={{
            alignItems: 'center',
            display: 'flex',
            gap: 'var(--oc-node-space-2xs)',
          }}
        >
          {StateBadge ? (
            <span
              style={{
                alignItems: 'center',
                background: 'var(--oc-node-color-surface-strong)',
                border: 'var(--oc-node-border-width) solid var(--oc-node-color-divider)',
                borderRadius: 'var(--oc-node-radius-pill)',
                color: StateBadge.tone,
                display: 'inline-flex',
                fontSize: 'var(--oc-node-meta-size)',
                fontWeight: 'var(--oc-node-weight-strong)',
                gap: 'var(--oc-node-space-2xs)',
                padding: 'var(--oc-node-space-2xs) var(--oc-node-space-xs)',
              }}
              title={StateBadge.label}
            >
              <StateBadge.icon size={tokens.iconSizeSm} />
              <span>{StateBadge.label}</span>
            </span>
          ) : null}
          {model.hasSubcanvas ? (
            <span
              aria-label="Has internal canvas"
              style={{
                alignItems: 'center',
                background: 'var(--oc-node-type-surface)',
                borderRadius: 'var(--oc-node-radius-inner)',
                color: 'var(--oc-node-type-text)',
                display: 'inline-flex',
                height: 'var(--oc-node-icon-button-size)',
                justifyContent: 'center',
                width: 'var(--oc-node-icon-button-size)',
              }}
              title={model.subcanvasLabel ?? 'Internal canvas'}
            >
              <Layers size={tokens.iconSizeSm} />
            </span>
          ) : null}
          {model.counts.childNodes > 0 ? (
            <span
              style={{
                background: 'var(--oc-node-type-surface)',
                borderRadius: 'var(--oc-node-radius-inner)',
                color: 'var(--oc-node-type-text)',
                fontSize: 'var(--oc-node-meta-size)',
                fontWeight: 'var(--oc-node-weight-strong)',
                minWidth: 'var(--oc-node-badge-min-width)',
                padding: 'var(--oc-node-space-2xs) var(--oc-node-space-xs)',
                textAlign: 'center',
              }}
              title="Child nodes"
            >
              {model.counts.childNodes}
            </span>
          ) : null}
          {onAddField && lodMode === 'full' && canInteract ? (
            <button
              aria-label="Add field"
              onClick={(event) => {
                event.stopPropagation();
                onAddField();
              }}
              onMouseDown={(event) => event.stopPropagation()}
              style={iconButtonStyle}
              title="Add field"
              type="button"
            >
              <Plus size={tokens.iconSizeSm} />
            </button>
          ) : null}
          {onToggleExpand ? (
            <button
              aria-label={isExpanded ? 'Collapse node' : 'Expand node'}
              onClick={(event) => {
                event.stopPropagation();
                onToggleExpand();
              }}
              onMouseDown={(event) => event.stopPropagation()}
              style={iconButtonStyle}
              title={isExpanded ? 'Collapse' : 'Expand'}
              type="button"
            >
              {isExpanded
                ? <ChevronDown size={tokens.iconSize} />
                : <ChevronRight size={tokens.iconSize} />}
            </button>
          ) : null}
        </div>
      </div>

      <div
        style={{
          background: 'var(--oc-node-type-accent)',
          borderRadius: 'var(--oc-node-radius-pill)',
          height: 'var(--oc-node-accent-height)',
        }}
      />

      {lodMode === 'compact' ? (
        <NodeMetricList
          compact
          limit={tokens.compactMetricLimit}
          metrics={model.metrics}
          tokens={tokens}
        />
      ) : (
        <>
          <NodeMetricList
            limit={tokens.compactMetricLimit}
            metrics={model.metrics}
            tokens={tokens}
          />

          {model.hasSubcanvas ? (
            <div
              className="nodrag"
              onClick={(event) => {
                event.stopPropagation();
                if (canInteract) {
                  onEnterSubcanvas?.();
                }
              }}
              onKeyDown={(event) => {
                event.stopPropagation();
                if (!canInteract || !onEnterSubcanvas) {
                  return;
                }

                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onEnterSubcanvas();
                }
              }}
              onMouseDown={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
              role={onEnterSubcanvas && canInteract ? 'button' : undefined}
              style={{
                alignItems: 'center',
                background: 'var(--oc-node-type-surface)',
                border: 'var(--oc-node-border-width) solid var(--oc-node-color-divider)',
                borderRadius: 'var(--oc-node-radius-inner)',
                color: 'var(--oc-node-type-text)',
                cursor: onEnterSubcanvas && canInteract ? 'pointer' : 'default',
                display: 'grid',
                gap: 'var(--oc-node-space-xs)',
                gridTemplateColumns: 'var(--oc-node-metric-icon-size) minmax(0, 1fr) auto',
                minHeight: 'var(--oc-node-internal-entry-min-height)',
                opacity: canInteract ? 1 : 0.72,
                padding: 'var(--oc-node-space-xs) var(--oc-node-space-sm)',
              }}
              tabIndex={onEnterSubcanvas && canInteract ? 0 : undefined}
              title={model.subcanvasLabel ?? 'Internal canvas'}
            >
              <Layers size={tokens.iconSizeSm} />
              <span
                style={{
                  fontSize: 'var(--oc-node-body-size)',
                  fontWeight: 'var(--oc-node-weight-field)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {model.subcanvasLabel ?? 'Internal canvas'}
              </span>
              <span
                style={{
                  background: 'var(--oc-node-color-surface-strong)',
                  border: 'var(--oc-node-border-width) solid var(--oc-node-color-divider)',
                  borderRadius: 'var(--oc-node-radius-pill)',
                  fontSize: 'var(--oc-node-meta-size)',
                  fontWeight: 'var(--oc-node-weight-strong)',
                  padding: 'var(--oc-node-space-2xs) var(--oc-node-space-xs)',
                }}
              >
                {model.counts.childNodes}
              </span>
            </div>
          ) : null}

          {visibleSections.map((section) => {
            const visibleItems = section.items.slice(0, itemLimit);
            const hiddenItemCount = Math.max(0, section.items.length - visibleItems.length);
            const sectionAddCategory = getDefaultFieldCategoryForSection(section.id);
            const sectionSummary = createSectionSummary(
              section.items,
              section.emptyLabel,
              hiddenItemCount,
              tokens
            );

            return (
              <NodeSection
                actionLabel={getSectionAddActionLabel(section.id)}
                collapsed={collapsedSectionSet.has(section.id)}
                collapsedSummary={(
                  <div
                    style={{
                      alignItems: 'center',
                      background: 'var(--oc-node-color-surface-muted)',
                      border: 'var(--oc-node-border-width) solid var(--oc-node-color-divider)',
                      borderRadius: 'var(--oc-node-radius-inner)',
                      color: 'var(--oc-node-color-text-muted)',
                      display: 'flex',
                      fontSize: 'var(--oc-node-meta-size)',
                      lineHeight: 'var(--oc-node-line-height)',
                      minHeight: 'var(--oc-node-section-summary-min-height)',
                      overflow: 'hidden',
                      padding: 'var(--oc-node-space-xs) var(--oc-node-space-sm)',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={sectionSummary}
                  >
                    {sectionSummary}
                  </div>
                )}
                collapsible={lodMode === 'full' && Boolean(onToggleSection)}
                iconSize={tokens.iconSizeSm}
                key={section.id}
                meta={hiddenItemCount > 0 ? `+${hiddenItemCount}` : section.metricLabel}
                onAction={lodMode === 'full' && onAddField && sectionAddCategory && canInteract
                  ? () => onAddField(sectionAddCategory)
                  : undefined}
                onToggleCollapsed={onToggleSection
                  ? () => onToggleSection(section.id)
                  : undefined}
                title={section.title}
              >
                {visibleItems.length > 0 ? (
                  <NodeFieldList
                    editable={lodMode === 'full' && canInteract}
                    fields={visibleItems}
                    onFieldDelete={onFieldDelete}
                    onFieldChange={onFieldChange}
                    onFieldMove={onFieldMove}
                    tokens={tokens}
                  />
                ) : (
                  <div
                    style={{
                      color: 'var(--oc-node-color-text-muted)',
                      fontSize: 'var(--oc-node-meta-size)',
                      lineHeight: 'var(--oc-node-line-height)',
                    }}
                  >
                    {section.emptyLabel}
                  </div>
                )}
                {hiddenItemCount > 0 ? (
                  <div
                    style={{
                      color: 'var(--oc-node-color-text-muted)',
                      fontSize: 'var(--oc-node-meta-size)',
                      lineHeight: 'var(--oc-node-line-height)',
                    }}
                  >
                    +{hiddenItemCount} hidden
                  </div>
                ) : null}
              </NodeSection>
            );
          })}

          {hiddenSectionCount > 0 ? (
            <div
              style={{
                color: 'var(--oc-node-color-text-muted)',
                fontSize: 'var(--oc-node-meta-size)',
                lineHeight: 'var(--oc-node-line-height)',
              }}
            >
              +{hiddenSectionCount} sections
            </div>
          ) : null}

          {model.description && isExpanded ? (
            <div
              style={{
                borderTop: 'var(--oc-node-border-width) solid var(--oc-node-color-divider)',
                color: 'var(--oc-node-color-text-muted)',
                fontSize: 'var(--oc-node-field-size)',
                lineHeight: 'var(--oc-node-line-height)',
                overflow: 'hidden',
                paddingTop: 'var(--oc-node-space-sm)',
              }}
            >
              {model.description}
            </div>
          ) : null}
        </>
      )}

      {validationError ? (
        <div
          style={{
            alignItems: 'center',
            color: 'var(--oc-node-color-danger)',
            display: 'flex',
            fontSize: 'var(--oc-node-meta-size)',
            gap: 'var(--oc-node-space-xs)',
            lineHeight: 'var(--oc-node-line-height)',
          }}
        >
          <AlertCircle size={tokens.iconSizeSm} />
          <span>{validationError}</span>
        </div>
      ) : null}
    </div>
  );
};
