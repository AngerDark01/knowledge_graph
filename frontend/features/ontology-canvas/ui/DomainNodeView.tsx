import {
  AlertCircle,
  Ban,
  Boxes,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Layers,
  Lock,
  LogIn,
  MousePointer2,
  Network,
} from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import {
  ontologyDomainViewTokens,
  type OntologyDomainCssVars,
  type OntologyDomainMetricTone,
} from '../config';
import type {
  OntologyDomainViewMetric,
  OntologyDomainViewModel,
  OntologyDomainViewTone,
} from '../model/view';

export type DomainNodeViewProps = {
  viewModel?: OntologyDomainViewModel;
  title?: string;
  collapsed?: boolean;
  validationError?: string;
  selected?: boolean;
  status?: 'default' | 'hovered' | 'selected' | 'readonly' | 'disabled';
  lodMode?: 'full' | 'compact' | 'outline' | 'dot';
  onEnterInternalSpace?: () => void;
  onToggleCollapsed?: () => void;
  tokens?: typeof ontologyDomainViewTokens;
};

const createFallbackViewModel = (
  title: string | undefined,
  collapsed: boolean
): OntologyDomainViewModel => ({
  id: 'fallback',
  title: title ?? 'Domain',
  typeLabel: 'Domain',
  collapsed,
  counts: {
    childNodes: 0,
    childDomains: 0,
    relationships: 0,
  },
  metrics: [
    {
      id: 'childNodes',
      label: 'Nodes',
      value: 0,
      iconLabel: 'N',
      tone: 'node',
    },
    {
      id: 'childDomains',
      label: 'Domains',
      value: 0,
      iconLabel: 'D',
      tone: 'domain',
    },
    {
      id: 'relationships',
      label: 'Relations',
      value: 0,
      iconLabel: 'L',
      tone: 'relationship',
    },
  ],
  previewItems: [],
  hasInternalSpace: true,
  internalSpaceLabel: 'Internal space',
});

const getToneStyle = (
  tone: OntologyDomainViewTone,
  tokens: typeof ontologyDomainViewTokens
): CSSProperties => {
  const toneTokens: OntologyDomainMetricTone =
    tokens.metricTones[tone] ?? tokens.metricTones.domain;

  return {
    '--oc-domain-metric-accent': toneTokens.accent,
    '--oc-domain-metric-surface': toneTokens.surface,
    '--oc-domain-metric-text': toneTokens.text,
  } as CSSProperties;
};

const getStateAccent = (status: DomainNodeViewProps['status']): string => {
  if (status === 'disabled') {
    return 'var(--oc-domain-color-danger)';
  }

  if (status === 'readonly') {
    return 'var(--oc-domain-color-text-muted)';
  }

  return 'var(--oc-domain-color-border-strong)';
};

const createContainedSummary = (
  model: OntologyDomainViewModel,
  totalChildren: number,
  tokens: typeof ontologyDomainViewTokens
): string => {
  if (totalChildren === 0 && model.counts.relationships === 0) {
    return 'Empty internal space';
  }

  const previewNames = model.previewItems
    .slice(0, tokens.summaryItemLimit)
    .map(item => item.title)
    .join(', ');
  const base = `${totalChildren} items · ${model.counts.relationships} relations`;

  return previewNames.length > 0 ? `${base} · ${previewNames}` : base;
};

const DomainMetricList = ({
  metrics,
  limit,
  compact,
  tokens,
}: {
  metrics: readonly OntologyDomainViewMetric[];
  limit: number;
  compact: boolean;
  tokens: typeof ontologyDomainViewTokens;
}) => {
  const visibleMetrics = metrics.slice(0, limit);

  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--oc-domain-space-xs)',
        gridTemplateColumns: compact
          ? 'repeat(3, minmax(0, 1fr))'
          : 'minmax(0, 1fr)',
      }}
    >
      {visibleMetrics.map(metric => (
        <div
          key={metric.id}
          style={{
            ...getToneStyle(metric.tone, tokens),
            alignItems: 'center',
            background: 'var(--oc-domain-metric-surface)',
            border: 'var(--oc-domain-border-width) solid var(--oc-domain-color-divider)',
            borderRadius: 'var(--oc-domain-radius-inner)',
            color: 'var(--oc-domain-metric-text)',
            display: 'grid',
            gap: compact ? 'var(--oc-domain-space-xs)' : 'var(--oc-domain-space-sm)',
            gridTemplateColumns: compact
              ? 'var(--oc-domain-metric-icon-size) minmax(0, 1fr) auto'
              : 'var(--oc-domain-metric-icon-size) minmax(0, 1fr) auto',
            minHeight: 'var(--oc-domain-metric-min-height)',
            padding: compact
              ? 'var(--oc-domain-space-xs) var(--oc-domain-space-sm)'
              : 'var(--oc-domain-space-xs) var(--oc-domain-space-sm)',
          }}
          title={`${metric.label}: ${metric.value}`}
        >
          <span
            style={{
              alignItems: 'center',
              background: 'var(--oc-domain-metric-accent)',
              borderRadius: 'var(--oc-domain-radius-inner)',
              color: 'var(--oc-domain-color-on-accent)',
              display: 'inline-flex',
              fontSize: 'var(--oc-domain-meta-size)',
              fontWeight: 'var(--oc-domain-weight-strong)',
              height: 'var(--oc-domain-metric-icon-size)',
              justifyContent: 'center',
              justifySelf: 'auto',
              width: 'var(--oc-domain-metric-icon-size)',
            }}
          >
            {metric.iconLabel}
          </span>
          {compact ? (
            <>
              <span
                style={{
                  color: 'var(--oc-domain-color-text)',
                  fontSize: 'var(--oc-domain-body-size)',
                  fontWeight: 'var(--oc-domain-weight-field)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {metric.label}
              </span>
              <span
                style={{
                  color: 'var(--oc-domain-color-text)',
                  fontSize: 'var(--oc-domain-body-size)',
                  fontWeight: 'var(--oc-domain-weight-strong)',
                }}
              >
                {metric.value}
              </span>
            </>
          ) : (
            <>
              <span
                style={{
                  color: 'var(--oc-domain-color-text)',
                  fontSize: 'var(--oc-domain-body-size)',
                  fontWeight: 'var(--oc-domain-weight-field)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {metric.label}
              </span>
              <span
                style={{
                  background: 'var(--oc-domain-color-surface-strong)',
                  border: 'var(--oc-domain-border-width) solid var(--oc-domain-color-divider)',
                  borderRadius: 'var(--oc-domain-radius-pill)',
                  color: 'var(--oc-domain-color-text)',
                  fontSize: 'var(--oc-domain-meta-size)',
                  fontWeight: 'var(--oc-domain-weight-strong)',
                  minWidth: 'var(--oc-domain-badge-min-width)',
                  padding: 'var(--oc-domain-space-2xs) var(--oc-domain-space-xs)',
                  textAlign: 'center',
                }}
              >
                {metric.value}
              </span>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export const DomainNodeView = ({
  viewModel,
  title,
  collapsed = false,
  validationError,
  selected = false,
  status,
  lodMode = 'full',
  onEnterInternalSpace,
  onToggleCollapsed,
  tokens = ontologyDomainViewTokens,
}: DomainNodeViewProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const model = viewModel ?? createFallbackViewModel(title, collapsed);
  const cssVars: OntologyDomainCssVars = {
    ...tokens.cssVars,
  };
  const resolvedStatus = status ?? (selected ? 'selected' : isHovering ? 'hovered' : 'default');
  const canInteract = resolvedStatus !== 'readonly' && resolvedStatus !== 'disabled';
  const totalChildren = model.counts.childNodes + model.counts.childDomains;
  const containedSummary = createContainedSummary(model, totalChildren, tokens);
  const StateBadge = resolvedStatus === 'selected'
    ? {
        icon: CheckCircle2,
        label: 'Selected',
        tone: 'var(--oc-domain-color-border-strong)',
      }
    : resolvedStatus === 'hovered'
      ? {
          icon: MousePointer2,
          label: 'Hover',
          tone: 'var(--oc-domain-color-border-strong)',
        }
      : resolvedStatus === 'readonly'
        ? {
            icon: Lock,
            label: 'Read only',
            tone: 'var(--oc-domain-color-text-muted)',
          }
        : resolvedStatus === 'disabled'
          ? {
              icon: Ban,
              label: 'Disabled',
              tone: 'var(--oc-domain-color-danger)',
            }
          : null;
  const containerStyle: CSSProperties = {
    ...cssVars,
    background: 'var(--oc-domain-color-surface)',
    border: 'var(--oc-domain-border-width) solid',
    borderColor: resolvedStatus === 'selected' || resolvedStatus === 'hovered'
      ? 'var(--oc-domain-color-border-strong)'
      : 'var(--oc-domain-color-border)',
    borderRadius: 'var(--oc-domain-radius)',
    boxShadow: selected
      ? 'var(--oc-domain-shadow-selected)'
      : resolvedStatus === 'hovered'
        ? 'var(--oc-domain-shadow-hover)'
        : 'var(--oc-domain-shadow)',
    color: 'var(--oc-domain-color-text)',
    display: 'grid',
    gap: 'var(--oc-domain-space-md)',
    height: '100%',
    opacity: resolvedStatus === 'disabled' ? 0.6 : 1,
    overflow: 'hidden',
    padding: 'var(--oc-domain-space-md)',
    position: 'relative',
    width: '100%',
    filter: resolvedStatus === 'disabled' ? 'grayscale(0.15)' : 'none',
    cursor: resolvedStatus === 'disabled' ? 'not-allowed' : 'default',
  };
  const rootInteractionProps = {
    onMouseEnter: () => setIsHovering(true),
    onMouseLeave: () => setIsHovering(false),
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
        width: 'var(--oc-domain-state-rail-width)',
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
          justifyItems: 'center',
          padding: 'var(--oc-domain-space-sm)',
        }}
        title={`${model.title} (${model.typeLabel})`}
      >
        {stateRail}
        <span
          style={{
            alignItems: 'center',
            background: 'var(--oc-domain-color-border-strong)',
            borderRadius: 'var(--oc-domain-radius-inner)',
            color: 'var(--oc-domain-color-on-accent)',
            display: 'inline-flex',
            height: 'var(--oc-domain-icon-size)',
            justifyContent: 'center',
            width: 'var(--oc-domain-icon-size)',
          }}
        >
          <Boxes size={tokens.iconSizeSm} />
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
          gap: 'var(--oc-domain-space-sm)',
          gridTemplateColumns: 'var(--oc-domain-icon-size) minmax(0, 1fr) auto',
          padding: 'var(--oc-domain-space-sm)',
        }}
      >
        {stateRail}
        <span
          style={{
            alignItems: 'center',
            background: 'var(--oc-domain-color-border-strong)',
            borderRadius: 'var(--oc-domain-radius-inner)',
            color: 'var(--oc-domain-color-on-accent)',
            display: 'inline-flex',
            height: 'var(--oc-domain-icon-size)',
            justifyContent: 'center',
            width: 'var(--oc-domain-icon-size)',
          }}
        >
          <Boxes size={tokens.iconSizeSm} />
        </span>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 'var(--oc-domain-title-size)',
              fontWeight: 'var(--oc-domain-weight-strong)',
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
              color: 'var(--oc-domain-color-text-muted)',
              fontSize: 'var(--oc-domain-meta-size)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {model.typeLabel}
          </div>
        </div>
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            gap: 'var(--oc-domain-space-2xs)',
          }}
        >
          {StateBadge ? (
            <span
              style={{
                alignItems: 'center',
                background: 'var(--oc-domain-color-surface-strong)',
                border: 'var(--oc-domain-border-width) solid var(--oc-domain-color-divider)',
                borderRadius: 'var(--oc-domain-radius-pill)',
                color: StateBadge.tone,
                display: 'inline-flex',
                fontSize: 'var(--oc-domain-meta-size)',
                fontWeight: 'var(--oc-domain-weight-strong)',
                gap: 'var(--oc-domain-space-2xs)',
                padding: 'var(--oc-domain-space-2xs) var(--oc-domain-space-xs)',
              }}
              title={StateBadge.label}
            >
              <StateBadge.icon size={tokens.iconSizeSm} />
              <span>{StateBadge.label}</span>
            </span>
          ) : null}
          {totalChildren > 0 ? (
            <span
              style={{
                background: 'var(--oc-domain-color-surface-strong)',
                border: 'var(--oc-domain-border-width) solid var(--oc-domain-color-divider)',
                borderRadius: 'var(--oc-domain-radius-inner)',
                color: 'var(--oc-domain-color-text)',
                fontSize: 'var(--oc-domain-meta-size)',
                fontWeight: 'var(--oc-domain-weight-strong)',
                minWidth: 'var(--oc-domain-badge-min-width)',
                padding: 'var(--oc-domain-space-2xs) var(--oc-domain-space-xs)',
                textAlign: 'center',
              }}
              title="Contained items"
            >
              {totalChildren}
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
          background: 'var(--oc-domain-color-backdrop)',
          border: 'var(--oc-domain-border-width) dashed var(--oc-domain-color-border)',
          borderRadius: 'var(--oc-domain-radius-inner)',
          inset: 'var(--oc-domain-space-sm)',
          pointerEvents: 'none',
          position: 'absolute',
        }}
      />

      <div
        style={{
          alignItems: 'start',
          display: 'grid',
          gap: 'var(--oc-domain-space-sm)',
          gridTemplateColumns: 'var(--oc-domain-icon-size) minmax(0, 1fr) auto',
          position: 'relative',
        }}
      >
        <span
          style={{
            alignItems: 'center',
            background: 'var(--oc-domain-color-border-strong)',
            borderRadius: 'var(--oc-domain-radius-inner)',
            color: 'var(--oc-domain-color-on-accent)',
            display: 'inline-flex',
            height: 'var(--oc-domain-icon-size)',
            justifyContent: 'center',
            width: 'var(--oc-domain-icon-size)',
          }}
        >
          <Boxes size={tokens.iconSizeSm} />
        </span>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              color: 'var(--oc-domain-color-text-muted)',
              fontSize: 'var(--oc-domain-meta-size)',
              fontWeight: 'var(--oc-domain-weight-strong)',
              letterSpacing: 0,
              lineHeight: 'var(--oc-domain-line-height)',
              textTransform: 'uppercase',
            }}
          >
            {model.typeLabel}
          </div>
          <div
            style={{
              color: 'var(--oc-domain-color-text)',
              fontSize: 'var(--oc-domain-title-size)',
              fontWeight: 'var(--oc-domain-weight-title)',
              lineHeight: 'var(--oc-domain-line-height)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={model.title}
          >
            {model.title}
          </div>
        </div>
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            gap: 'var(--oc-domain-space-2xs)',
          }}
        >
          {StateBadge ? (
            <span
              style={{
                alignItems: 'center',
                background: 'var(--oc-domain-color-surface-strong)',
                border: 'var(--oc-domain-border-width) solid var(--oc-domain-color-divider)',
                borderRadius: 'var(--oc-domain-radius-pill)',
                color: StateBadge.tone,
                display: 'inline-flex',
                fontSize: 'var(--oc-domain-meta-size)',
                fontWeight: 'var(--oc-domain-weight-strong)',
                gap: 'var(--oc-domain-space-2xs)',
                padding: 'var(--oc-domain-space-2xs) var(--oc-domain-space-xs)',
              }}
              title={StateBadge.label}
            >
              <StateBadge.icon size={tokens.iconSizeSm} />
              <span>{StateBadge.label}</span>
            </span>
          ) : null}
          {model.collapsed ? (
            <span
              style={{
                background: 'var(--oc-domain-color-surface-strong)',
                border: 'var(--oc-domain-border-width) solid var(--oc-domain-color-divider)',
                borderRadius: 'var(--oc-domain-radius-pill)',
                color: 'var(--oc-domain-color-text-muted)',
                fontSize: 'var(--oc-domain-meta-size)',
                fontWeight: 'var(--oc-domain-weight-strong)',
                padding: 'var(--oc-domain-space-2xs) var(--oc-domain-space-xs)',
              }}
            >
              Collapsed
            </span>
          ) : null}
          {onToggleCollapsed ? (
            <button
              aria-label={model.collapsed ? 'Expand container' : 'Collapse container'}
              className="nodrag"
              disabled={!canInteract}
              onClick={(event) => {
                event.stopPropagation();
                if (canInteract) {
                  onToggleCollapsed();
                }
              }}
              onMouseDown={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
              style={{
                alignItems: 'center',
                background: 'var(--oc-domain-color-surface-strong)',
                border: 'var(--oc-domain-border-width) solid var(--oc-domain-color-divider)',
                borderRadius: 'var(--oc-domain-radius-inner)',
                color: 'var(--oc-domain-color-text-muted)',
                cursor: canInteract ? 'pointer' : 'not-allowed',
                display: 'inline-flex',
                height: 'var(--oc-domain-icon-button-size)',
                justifyContent: 'center',
                opacity: canInteract ? 1 : 0.45,
                padding: 0,
                width: 'var(--oc-domain-icon-button-size)',
              }}
              title={model.collapsed ? 'Expand container' : 'Collapse container'}
              type="button"
            >
              {model.collapsed
                ? <ChevronRight size={tokens.iconSizeSm} />
                : <ChevronDown size={tokens.iconSizeSm} />}
            </button>
          ) : null}
          {model.hasInternalSpace ? (
            <span
              aria-label="Internal space"
              style={{
                alignItems: 'center',
                background: 'var(--oc-domain-color-surface-strong)',
                border: 'var(--oc-domain-border-width) solid var(--oc-domain-color-divider)',
                borderRadius: 'var(--oc-domain-radius-inner)',
                color: 'var(--oc-domain-color-border-strong)',
                display: 'inline-flex',
                height: 'var(--oc-domain-icon-size)',
                justifyContent: 'center',
                width: 'var(--oc-domain-icon-size)',
              }}
              title={model.internalSpaceLabel}
            >
              <Layers size={tokens.iconSizeSm} />
            </span>
          ) : null}
        </div>
      </div>

      <DomainMetricList
        compact={lodMode === 'compact'}
        limit={tokens.compactMetricLimit}
        metrics={model.metrics}
        tokens={tokens}
      />

      {lodMode === 'full' && !model.collapsed ? (
        <div
          style={{
            display: 'grid',
            gap: 'var(--oc-domain-space-xs)',
            position: 'relative',
          }}
        >
          {model.previewItems.slice(0, tokens.previewItemLimit).map(item => (
            <div
              key={item.id}
              style={{
                ...getToneStyle(item.tone, tokens),
                alignItems: 'center',
                background: 'var(--oc-domain-color-surface-strong)',
                border: 'var(--oc-domain-border-width) solid var(--oc-domain-color-divider)',
                borderRadius: 'var(--oc-domain-radius-inner)',
                display: 'grid',
                gap: 'var(--oc-domain-space-xs)',
                gridTemplateColumns: 'var(--oc-domain-metric-icon-size) minmax(0, 1fr) auto',
                minHeight: 'var(--oc-domain-metric-min-height)',
                padding: 'var(--oc-domain-space-xs) var(--oc-domain-space-sm)',
              }}
            >
              <span
                style={{
                  alignItems: 'center',
                  background: 'var(--oc-domain-metric-surface)',
                  border: 'var(--oc-domain-border-width) solid var(--oc-domain-metric-accent)',
                  borderRadius: 'var(--oc-domain-radius-inner)',
                  color: 'var(--oc-domain-metric-text)',
                  display: 'inline-flex',
                  fontSize: 'var(--oc-domain-meta-size)',
                  fontWeight: 'var(--oc-domain-weight-strong)',
                  height: 'var(--oc-domain-metric-icon-size)',
                  justifyContent: 'center',
                  width: 'var(--oc-domain-metric-icon-size)',
                }}
              >
                {item.tone === 'domain' ? 'D' : 'N'}
              </span>
              <span
                style={{
                  color: 'var(--oc-domain-color-text)',
                  fontSize: 'var(--oc-domain-body-size)',
                  fontWeight: 'var(--oc-domain-weight-field)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={item.title}
              >
                {item.title}
              </span>
              <span
                style={{
                  color: 'var(--oc-domain-color-text-muted)',
                  fontSize: 'var(--oc-domain-meta-size)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.typeLabel}
              </span>
            </div>
          ))}
          {model.previewItems.length === 0 ? (
            <div
              style={{
                alignItems: 'center',
                background: 'var(--oc-domain-color-surface-strong)',
                border: 'var(--oc-domain-border-width) dashed var(--oc-domain-color-divider)',
                borderRadius: 'var(--oc-domain-radius-inner)',
                color: 'var(--oc-domain-color-text-muted)',
                display: 'flex',
                fontSize: 'var(--oc-domain-meta-size)',
                gap: 'var(--oc-domain-space-xs)',
                minHeight: 'var(--oc-domain-metric-min-height)',
                padding: 'var(--oc-domain-space-xs) var(--oc-domain-space-sm)',
              }}
            >
              <Network size={tokens.iconSizeSm} />
              <span>Empty internal space</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {lodMode === 'full' && model.collapsed ? (
        <div
          style={{
            alignItems: 'center',
            background: 'var(--oc-domain-color-surface-strong)',
            border: 'var(--oc-domain-border-width) solid var(--oc-domain-color-divider)',
            borderRadius: 'var(--oc-domain-radius-inner)',
            color: 'var(--oc-domain-color-text-muted)',
            display: 'flex',
            fontSize: 'var(--oc-domain-body-size)',
            gap: 'var(--oc-domain-space-xs)',
            padding: 'var(--oc-domain-space-sm)',
            position: 'relative',
          }}
        >
          <Layers size={tokens.iconSizeSm} />
          <span>
            {containedSummary}
          </span>
        </div>
      ) : null}

      {lodMode === 'full' && model.hasInternalSpace ? (
        <div
          className="nodrag"
          onClick={(event) => {
            event.stopPropagation();
            if (canInteract) {
              onEnterInternalSpace?.();
            }
          }}
          onKeyDown={(event) => {
            event.stopPropagation();
            if (!canInteract || !onEnterInternalSpace) {
              return;
            }

            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onEnterInternalSpace();
            }
          }}
          onMouseDown={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          role={onEnterInternalSpace && canInteract ? 'button' : undefined}
          style={{
            alignItems: 'center',
            background: 'var(--oc-domain-color-surface-strong)',
            border: 'var(--oc-domain-border-width) solid var(--oc-domain-color-divider)',
            borderRadius: 'var(--oc-domain-radius-inner)',
            color: 'var(--oc-domain-color-border-strong)',
            cursor: onEnterInternalSpace && canInteract ? 'pointer' : 'default',
            display: 'grid',
            gap: 'var(--oc-domain-space-xs)',
            gridTemplateColumns: 'var(--oc-domain-metric-icon-size) minmax(0, 1fr) auto',
            minHeight: 'var(--oc-domain-internal-entry-min-height)',
            opacity: canInteract ? 1 : 0.72,
            padding: 'var(--oc-domain-space-xs) var(--oc-domain-space-sm)',
            position: 'relative',
          }}
          tabIndex={onEnterInternalSpace && canInteract ? 0 : undefined}
          title={model.internalSpaceLabel}
        >
          <LogIn size={tokens.iconSizeSm} />
          <span
            style={{
              color: 'var(--oc-domain-color-text)',
              fontSize: 'var(--oc-domain-body-size)',
              fontWeight: 'var(--oc-domain-weight-field)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {model.internalSpaceLabel}
          </span>
          <span
            style={{
              background: 'var(--oc-domain-color-surface-muted)',
              border: 'var(--oc-domain-border-width) solid var(--oc-domain-color-divider)',
              borderRadius: 'var(--oc-domain-radius-pill)',
              color: 'var(--oc-domain-color-text-muted)',
              fontSize: 'var(--oc-domain-meta-size)',
              fontWeight: 'var(--oc-domain-weight-strong)',
              padding: 'var(--oc-domain-space-2xs) var(--oc-domain-space-xs)',
            }}
          >
            {totalChildren}
          </span>
        </div>
      ) : null}

      {lodMode === 'full' && model.description ? (
        <div
          style={{
            borderTop: 'var(--oc-domain-border-width) solid var(--oc-domain-color-divider)',
            color: 'var(--oc-domain-color-text-muted)',
            fontSize: 'var(--oc-domain-body-size)',
            lineHeight: 'var(--oc-domain-line-height)',
            overflow: 'hidden',
            paddingTop: 'var(--oc-domain-space-sm)',
            position: 'relative',
          }}
        >
          {model.description}
        </div>
      ) : null}

      {validationError ? (
        <div
          style={{
            alignItems: 'center',
            color: 'var(--oc-domain-color-danger)',
            display: 'flex',
            fontSize: 'var(--oc-domain-meta-size)',
            gap: 'var(--oc-domain-space-xs)',
            lineHeight: 'var(--oc-domain-line-height)',
            position: 'relative',
          }}
        >
          <AlertCircle size={tokens.iconSizeSm} />
          <span>{validationError}</span>
        </div>
      ) : null}
    </div>
  );
};
