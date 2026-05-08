import type { CSSProperties } from 'react';
import {
  ontologyNodeViewTokens,
  type OntologyNodeMetricTone,
} from '../config';
import type {
  OntologyNodeViewMetric,
  OntologyNodeViewTone,
} from '../model/view';

type NodeMetricListProps = {
  metrics: readonly OntologyNodeViewMetric[];
  limit?: number;
  tokens?: typeof ontologyNodeViewTokens;
  compact?: boolean;
};

const getToneStyle = (
  tone: OntologyNodeViewTone,
  tokens: typeof ontologyNodeViewTokens
): CSSProperties => {
  const toneTokens: OntologyNodeMetricTone = tokens.metricTones[tone] ?? tokens.metricTones.field;

  return {
    '--oc-node-metric-accent': toneTokens.accent,
    '--oc-node-metric-surface': toneTokens.surface,
    '--oc-node-metric-text': toneTokens.text,
  } as CSSProperties;
};

export const NodeMetricList = ({
  metrics,
  limit,
  tokens = ontologyNodeViewTokens,
  compact = false,
}: NodeMetricListProps) => {
  const visibleMetrics = limit ? metrics.slice(0, limit) : metrics;

  if (visibleMetrics.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--oc-node-space-xs)',
        gridTemplateColumns: compact
          ? 'repeat(2, minmax(0, 1fr))'
          : 'minmax(0, 1fr)',
      }}
    >
      {visibleMetrics.map(metric => (
        <div
          key={metric.id}
          style={{
            ...getToneStyle(metric.tone, tokens),
            alignItems: 'center',
            background: 'var(--oc-node-metric-surface)',
            border: 'var(--oc-node-border-width) solid var(--oc-node-color-divider)',
            borderRadius: 'var(--oc-node-radius-inner)',
            color: 'var(--oc-node-metric-text)',
            display: 'grid',
            gap: compact ? 'var(--oc-node-space-xs)' : 'var(--oc-node-space-sm)',
            gridTemplateColumns: compact
              ? 'var(--oc-node-metric-icon-size) minmax(0, 1fr) auto'
              : 'var(--oc-node-metric-icon-size) minmax(0, 1fr) auto',
            minHeight: 'var(--oc-node-metric-min-height)',
            padding: compact
              ? 'var(--oc-node-space-xs) var(--oc-node-space-sm)'
              : 'var(--oc-node-space-xs) var(--oc-node-space-sm)',
          }}
          title={`${metric.label}: ${metric.value}`}
        >
          <span
            style={{
              alignItems: 'center',
              background: 'var(--oc-node-metric-accent)',
              borderRadius: 'var(--oc-node-radius-inner)',
              color: 'var(--oc-node-color-on-accent)',
              display: 'inline-flex',
              fontSize: 'var(--oc-node-meta-size)',
              fontWeight: 'var(--oc-node-weight-strong)',
              height: 'var(--oc-node-metric-icon-size)',
              justifyContent: 'center',
              justifySelf: compact ? 'auto' : 'center',
              width: 'var(--oc-node-metric-icon-size)',
            }}
          >
            {metric.iconLabel}
          </span>
          {compact ? (
            <>
              <span
                style={{
                  color: 'var(--oc-node-color-text)',
                  fontSize: 'var(--oc-node-field-size)',
                  fontWeight: 'var(--oc-node-weight-field)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {metric.label}
              </span>
              <span
                style={{
                  color: 'var(--oc-node-color-text)',
                  fontSize: 'var(--oc-node-field-size)',
                  fontWeight: 'var(--oc-node-weight-strong)',
                }}
              >
                {metric.value}
              </span>
            </>
          ) : (
            <>
              <span
                style={{
                  color: 'var(--oc-node-color-text)',
                  fontSize: 'var(--oc-node-field-size)',
                  fontWeight: 'var(--oc-node-weight-field)',
                  lineHeight: 'var(--oc-node-line-height)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {metric.label}
              </span>
              <span
                style={{
                  background: 'var(--oc-node-color-surface-strong)',
                  border: 'var(--oc-node-border-width) solid var(--oc-node-color-divider)',
                  borderRadius: 'var(--oc-node-radius-pill)',
                  color: 'var(--oc-node-color-text)',
                  fontSize: 'var(--oc-node-meta-size)',
                  fontWeight: 'var(--oc-node-weight-strong)',
                  minWidth: 'var(--oc-node-badge-min-width)',
                  padding: 'var(--oc-node-space-2xs) var(--oc-node-space-xs)',
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
