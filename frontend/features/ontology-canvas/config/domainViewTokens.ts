import type { CSSProperties } from 'react';
import type { OntologyDomainViewTone } from '../model/view';

export type OntologyDomainCssVars = CSSProperties & Record<`--${string}`, string>;

export type OntologyDomainMetricTone = {
  accent: string;
  surface: string;
  text: string;
};

export const ontologyDomainViewTokens = {
  minWidth: 280,
  minHeight: 190,
  collapsedWidth: 340,
  collapsedHeight: 210,
  expandedWidth: 520,
  expandedHeight: 360,
  compactMetricLimit: 3,
  previewItemLimit: 5,
  iconSize: 16,
  iconSizeSm: 14,
  summaryItemLimit: 3,
  metricTones: {
    node: {
      accent: '#2563eb',
      surface: '#eff6ff',
      text: '#1d4ed8',
    },
    domain: {
      accent: '#7c3aed',
      surface: '#f5f3ff',
      text: '#6d28d9',
    },
    relationship: {
      accent: '#0f766e',
      surface: '#f0fdfa',
      text: '#0f766e',
    },
    subcanvas: {
      accent: '#4f46e5',
      surface: '#eef2ff',
      text: '#4338ca',
    },
  } satisfies Record<OntologyDomainViewTone, OntologyDomainMetricTone>,
  cssVars: {
    '--oc-domain-radius': '8px',
    '--oc-domain-radius-inner': '6px',
    '--oc-domain-radius-pill': '999px',
    '--oc-domain-border-width': '1px',
    '--oc-domain-space-2xs': '3px',
    '--oc-domain-space-xs': '6px',
    '--oc-domain-space-sm': '8px',
    '--oc-domain-space-md': '12px',
    '--oc-domain-space-lg': '16px',
    '--oc-domain-accent-width': '4px',
    '--oc-domain-state-rail-width': '3px',
    '--oc-domain-icon-size': '24px',
    '--oc-domain-icon-button-size': '28px',
    '--oc-domain-metric-icon-size': '18px',
    '--oc-domain-metric-min-height': '26px',
    '--oc-domain-internal-entry-min-height': '34px',
    '--oc-domain-badge-min-width': '22px',
    '--oc-domain-title-size': '15px',
    '--oc-domain-meta-size': '11px',
    '--oc-domain-body-size': '12px',
    '--oc-domain-weight-field': '600',
    '--oc-domain-weight-strong': '700',
    '--oc-domain-weight-title': '750',
    '--oc-domain-line-height': '1.35',
    '--oc-domain-shadow': '0 14px 34px rgba(15, 23, 42, 0.08)',
    '--oc-domain-shadow-hover': '0 16px 38px rgba(37, 99, 235, 0.12)',
    '--oc-domain-shadow-selected': '0 16px 42px rgba(37, 99, 235, 0.18)',
    '--oc-domain-color-surface': 'rgba(255, 255, 255, 0.76)',
    '--oc-domain-color-surface-strong': '#ffffff',
    '--oc-domain-color-surface-muted': 'rgba(248, 250, 252, 0.84)',
    '--oc-domain-color-border': '#bfdbfe',
    '--oc-domain-color-border-strong': '#2563eb',
    '--oc-domain-color-text': '#0f172a',
    '--oc-domain-color-text-muted': '#64748b',
    '--oc-domain-color-on-accent': '#ffffff',
    '--oc-domain-color-divider': '#dbeafe',
    '--oc-domain-color-backdrop': 'rgba(239, 246, 255, 0.48)',
    '--oc-domain-color-danger': '#dc2626',
  } satisfies OntologyDomainCssVars,
} as const;
