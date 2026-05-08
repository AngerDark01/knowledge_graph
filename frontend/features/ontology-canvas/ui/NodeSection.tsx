import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { ontologyNodeViewTokens } from '../config';

type NodeSectionProps = {
  title: string;
  meta?: string;
  children: ReactNode;
  actionLabel?: string;
  collapsedSummary?: ReactNode;
  collapsed?: boolean;
  collapsible?: boolean;
  iconSize?: number;
  onAction?: () => void;
  onToggleCollapsed?: () => void;
};

export const NodeSection = ({
  title,
  meta,
  children,
  actionLabel,
  collapsedSummary,
  collapsed = false,
  collapsible = false,
  iconSize = ontologyNodeViewTokens.iconSizeSm,
  onAction,
  onToggleCollapsed,
}: NodeSectionProps) => {
  const ToggleIcon = collapsed ? ChevronRight : ChevronDown;

  return (
    <section
      style={{
        display: 'grid',
        gap: 'var(--oc-node-space-xs)',
      }}
    >
      <div
        style={{
          alignItems: 'center',
          color: 'var(--oc-node-color-text-muted)',
          display: 'flex',
          fontSize: 'var(--oc-node-meta-size)',
          justifyContent: 'space-between',
          lineHeight: 'var(--oc-node-line-height)',
        }}
      >
        {collapsible ? (
          <button
            aria-expanded={!collapsed}
            className="nodrag"
            onClick={(event) => {
              event.stopPropagation();
              onToggleCollapsed?.();
            }}
            onMouseDown={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            style={{
              alignItems: 'center',
              background: 'transparent',
              border: 'none',
              borderRadius: 'var(--oc-node-radius-inner)',
              color: 'inherit',
              cursor: 'pointer',
              display: 'inline-flex',
              font: 'inherit',
              gap: 'var(--oc-node-space-2xs)',
              minWidth: 0,
              padding: 0,
            }}
            title={collapsed ? `Expand ${title}` : `Collapse ${title}`}
            type="button"
          >
            <ToggleIcon size={iconSize} />
            <span>{title}</span>
          </button>
        ) : (
          <span>{title}</span>
        )}
        <span
          style={{
            alignItems: 'center',
            display: 'inline-flex',
            gap: 'var(--oc-node-space-2xs)',
          }}
        >
          {meta ? <span>{meta}</span> : null}
          {onAction ? (
            <button
              aria-label={actionLabel ?? `Add ${title}`}
              className="nodrag"
              onClick={(event) => {
                event.stopPropagation();
                onAction();
              }}
              onMouseDown={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
              style={{
                alignItems: 'center',
                background: 'var(--oc-node-color-surface-strong)',
                border: 'var(--oc-node-border-width) solid var(--oc-node-color-divider)',
                borderRadius: 'var(--oc-node-radius-inner)',
                color: 'var(--oc-node-color-text-muted)',
                cursor: 'pointer',
                display: 'inline-flex',
                height: 'var(--oc-node-field-action-size)',
                justifyContent: 'center',
                padding: 0,
                width: 'var(--oc-node-field-action-size)',
              }}
              title={actionLabel ?? `Add ${title}`}
              type="button"
            >
              <Plus size={iconSize} />
            </button>
          ) : null}
        </span>
      </div>
      {collapsed ? collapsedSummary ?? null : children}
    </section>
  );
};
