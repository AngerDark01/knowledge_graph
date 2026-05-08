import type { CSSProperties } from 'react';
import type { OntologyNodeType } from '@/domain/ontology';
import type { OntologyNodeViewTone } from '../model/view';

export type OntologyNodeCssVars = CSSProperties & Record<`--${string}`, string>;

export type OntologyNodeTypeTone = {
  accent: string;
  surface: string;
  text: string;
};

export type OntologyNodeMetricTone = {
  accent: string;
  surface: string;
  text: string;
};

export const ontologyNodeViewTokens = {
  minWidth: 300,
  minHeight: 240,
  collapsedWidth: 350,
  collapsedHeight: 280,
  expandedWidth: 600,
  expandedHeight: 450,
  collapsedFieldLimit: 3,
  expandedFieldLimit: 8,
  collapsedSectionLimit: 2,
  expandedSectionLimit: 5,
  compactMetricLimit: 4,
  iconButtonSize: 28,
  iconSize: 16,
  iconSizeSm: 15,
  nodeTypeIconSize: 24,
  metricIconSize: 18,
  sectionSummaryItemLimit: 3,
  lodDisplayDimensions: {
    full: null,
    compact: {
      width: 220,
      height: 150,
    },
    outline: {
      width: 160,
      height: 58,
    },
    dot: {
      width: 36,
      height: 36,
    },
  },
  metricTones: {
    field: {
      accent: '#2563eb',
      surface: '#eff6ff',
      text: '#1d4ed8',
    },
    method: {
      accent: '#16a34a',
      surface: '#f0fdf4',
      text: '#15803d',
    },
    rule: {
      accent: '#dc2626',
      surface: '#fef2f2',
      text: '#b91c1c',
    },
    interface: {
      accent: '#0f766e',
      surface: '#f0fdfa',
      text: '#0f766e',
    },
    relationship: {
      accent: '#4f46e5',
      surface: '#eef2ff',
      text: '#4338ca',
    },
    subcanvas: {
      accent: '#7c3aed',
      surface: '#f5f3ff',
      text: '#6d28d9',
    },
  } satisfies Record<OntologyNodeViewTone, OntologyNodeMetricTone>,
  cssVars: {
    '--oc-node-radius': '8px',
    '--oc-node-radius-inner': '6px',
    '--oc-node-radius-pill': '999px',
    '--oc-node-border-width': '1px',
    '--oc-node-space-2xs': '3px',
    '--oc-node-space-xs': '6px',
    '--oc-node-space-sm': '8px',
    '--oc-node-space-md': '12px',
    '--oc-node-space-lg': '16px',
    '--oc-node-accent-height': '3px',
    '--oc-node-state-rail-width': '3px',
    '--oc-node-dot-size': '10px',
    '--oc-node-outline-stripe-width': '6px',
    '--oc-node-icon-button-size': '28px',
    '--oc-node-type-icon-size': '24px',
    '--oc-node-metric-icon-size': '18px',
    '--oc-node-field-min-height': '28px',
    '--oc-node-field-type-width': '72px',
    '--oc-node-field-category-width': '86px',
    '--oc-node-field-actions-width': '72px',
    '--oc-node-field-input-min-height': '22px',
    '--oc-node-field-action-size': '22px',
    '--oc-node-section-summary-min-height': '24px',
    '--oc-node-internal-entry-min-height': '32px',
    '--oc-node-metric-min-height': '24px',
    '--oc-node-badge-min-width': '22px',
    '--oc-node-title-size': '15px',
    '--oc-node-meta-size': '11px',
    '--oc-node-body-size': '12px',
    '--oc-node-field-size': '12px',
    '--oc-node-weight-field': '600',
    '--oc-node-weight-strong': '700',
    '--oc-node-weight-title': '750',
    '--oc-node-line-height': '1.35',
    '--oc-node-shadow': '0 10px 24px rgba(15, 23, 42, 0.08)',
    '--oc-node-shadow-hover': '0 12px 28px rgba(37, 99, 235, 0.12)',
    '--oc-node-shadow-selected': '0 12px 30px rgba(37, 99, 235, 0.18)',
    '--oc-node-color-surface': '#ffffff',
    '--oc-node-color-surface-strong': '#ffffff',
    '--oc-node-color-surface-muted': '#f8fafc',
    '--oc-node-color-border': '#cbd5e1',
    '--oc-node-color-border-strong': '#2563eb',
    '--oc-node-color-text': '#0f172a',
    '--oc-node-color-text-muted': '#64748b',
    '--oc-node-color-on-accent': '#ffffff',
    '--oc-node-color-divider': '#e2e8f0',
    '--oc-node-color-danger': '#dc2626',
    '--oc-node-color-warning': '#d97706',
  } satisfies OntologyNodeCssVars,
} as const;

const ontologyNodeTypeTones: Record<OntologyNodeType, OntologyNodeTypeTone> = {
  Class: {
    accent: '#2563eb',
    surface: '#eff6ff',
    text: '#1d4ed8',
  },
  Concept: {
    accent: '#0891b2',
    surface: '#ecfeff',
    text: '#0e7490',
  },
  Function: {
    accent: '#16a34a',
    surface: '#f0fdf4',
    text: '#15803d',
  },
  Component: {
    accent: '#7c3aed',
    surface: '#f5f3ff',
    text: '#6d28d9',
  },
  Information: {
    accent: '#ea580c',
    surface: '#fff7ed',
    text: '#c2410c',
  },
  Interface: {
    accent: '#0f766e',
    surface: '#f0fdfa',
    text: '#0f766e',
  },
  Constraint: {
    accent: '#be123c',
    surface: '#fff1f2',
    text: '#be123c',
  },
};

export const getOntologyNodeTypeTone = (
  type: OntologyNodeType | string | undefined
): OntologyNodeTypeTone => {
  if (type && type in ontologyNodeTypeTones) {
    return ontologyNodeTypeTones[type as OntologyNodeType];
  }

  return ontologyNodeTypeTones.Class;
};
