# FRONTEND_REVIEW

## Summary

Scope: core canvas container, node/edge renderers, node/edge editors, graph/workspace store slices.

Phase 0 status after 2026-04-29 optimization:
- Fixed: Critical 1、2、3 have been addressed in the current working tree.
- Still open: Critical 4、5 and all listed Major/Minor items unless separately noted.
- Validation: `npm run build` passes; project-wide lint still fails at the existing 159 errors / 96 warnings baseline.

Findings:
- Critical: 5
- Major: 9
- Minor: 5
- Main theme: UI rendering, graph domain data, view state, history, and persistence are currently coupled too tightly.

## Critical

### 1. Group update can corrupt the graph node array（Phase 0 已修复）

Status: fixed in current working tree. Historical finding kept for traceability.

- Location: `frontend/stores/graph/nodes/groupOperations.ts:95-114`
- Issue: inside `state.nodes.map(...)`, the `updates.nodeIds` branch returns `updatedNodes`, which is the entire nodes array, from a single map callback. That makes `nodes` become an array containing another array.
- Impact: graph data shape can break after group membership updates; ReactFlow rendering, save/load, layout, and traversal can fail unpredictably.
- Fix: move nodeIds synchronization outside the per-node map, or return only the updated group from the map callback.

### 2. Hide all edges cannot work with the current visibility contract（Phase 0 已修复）

Status: fixed in current working tree by adding explicit edge visibility mode.

- Location: `frontend/stores/graph/edgesSlice.ts:102-109`, `frontend/components/graph/core/GraphPageContent.tsx:149-157`
- Issue: `hideAllEdges()` sets `visibleEdgeIds` to `[]`, but the render filter treats `visibleEdgeIds.length === 0` as “show everything”.
- Impact: the “hide all” action renders all edges instead of none.
- Fix: replace `visibleEdgeIds: string[]` with `{ mode: 'all' | 'none' | 'custom'; ids: string[] }`, or use `null` for “all” and `[]` for “none”.

### 3. Deleting nodes/groups leaves orphan edges（Phase 0 已修复）

Status: fixed in current working tree for node/group deletion paths.

- Location: `frontend/stores/graph/nodes/basicOperations.ts:194-205`, `frontend/stores/graph/nodes/groupOperations.ts:123-147`
- Issue: node and group deletion only filter `nodes`; related `edges` are not removed.
- Impact: saved graph data can contain edges whose source/target no longer exists. ReactFlow and future semantic export will see invalid relationships.
- Fix: when deleting node IDs, also filter edges where `source` or `target` is in the deleted ID set.

### 4. EdgeEditor writes to global state on every form change

- Location: `frontend/components/graph/editors/EdgeEditor.tsx:31-53`
- Issue: a `useEffect` calls `updateEdge()` whenever `formData` changes. Every keystroke, slider movement, and JSON edit writes graph state, adds history, and triggers persistence.
- Impact: severe history pollution, excessive saves, and sluggish editing on larger graphs.
- Fix: keep a local draft and apply on explicit Save or debounced commit. Do not add history snapshots for every intermediate field change.

### 5. GraphPageContent subscribes to the entire graph store

- Location: `frontend/components/graph/core/GraphPageContent.tsx:59-73`
- Issue: `useGraphStore()` is called without selectors and destructures many fields/actions.
- Impact: any graph store change can re-render the whole canvas container and rerun node/edge synchronization.
- Fix: use selector-based subscriptions with shallow comparison; split graph data, selection, viewport, and editing state.

## Major

### 6. Selection changes remap all ReactFlow nodes

- Location: `frontend/components/graph/core/GraphPageContent.tsx:133-145`
- Issue: `selectedNodeId` is a dependency of the full node sync effect.
- Impact: selecting one node rebuilds every ReactFlow node object.
- Fix: keep selection in ReactFlow state or update selected flags incrementally; separate semantic node data from visual selection state.

### 7. Edge synchronization does O(edges * nodes) lookup work

- Location: `frontend/components/graph/core/GraphPageContent.tsx:148-186`
- Issue: every edge mapping performs `storeNodes.find()` for source and target.
- Impact: edge rendering cost grows quickly as graph size increases.
- Fix: build a memoized `nodeById` map or move edge adaptation into a selector/adapter cache.

### 8. Node renderers subscribe to the full graph store

- Location: `frontend/components/graph/nodes/NoteNode.tsx:17,32`, `frontend/components/graph/nodes/GroupNode.tsx:15`
- Issue: node components use `useGraphStore()` without selectors.
- Impact: every store update can wake every visible node component, which is expensive for class/UML-style nodes.
- Fix: pass node data through ReactFlow props, or use per-node selectors such as `useGraphStore(s => s.nodesById[id])`.

### 9. UI controls rely on `title` instead of accessible names

- Location: `frontend/components/graph/nodes/NoteNode.tsx:132-190`, `frontend/components/graph/nodes/GroupNode.tsx:106-118`, `frontend/components/graph/editors/EdgeEditor.tsx:115-121`
- Issue: icon-only buttons and color swatches use `title`, but no `aria-label`.
- Impact: assistive technologies may announce generic “button” controls.
- Fix: add `aria-label` to icon buttons and swatches, and use `aria-pressed` for selected toggles.

### 10. Inline edit inputs have no labels

- Location: `frontend/components/graph/nodes/NoteNode.tsx:102-116`, `frontend/components/graph/nodes/GroupNode.tsx:85-93`, `frontend/components/graph/edges/CustomEdge.tsx:238-257`
- Issue: inline title/edge label inputs lack `aria-label` or associated labels.
- Impact: screen reader users cannot identify the purpose of the control.
- Fix: add `aria-label="Node title"`, `aria-label="Group title"`, and `aria-label="Relation label"`.

### 11. EdgeEditor labels are not associated with form controls

- Location: `frontend/components/graph/editors/EdgeEditor.tsx:100-227`
- Issue: `<label>` elements do not use `htmlFor`, and controls lack IDs.
- Impact: clicking labels does not focus controls; screen reader relationships are weaker.
- Fix: add stable IDs and `htmlFor`, or use shared form field components.

### 12. GroupNode logs during render

- Location: `frontend/components/graph/nodes/GroupNode.tsx:20-30`
- Issue: render path runs `console.log` in a try/catch.
- Impact: noisy logs and measurable overhead when many groups render.
- Fix: remove render logs or gate them behind a debug flag.

### 13. NodeEditor changes groupId without updating group membership

- Location: `frontend/components/graph/editors/NodeEditor.tsx:56-69`, `frontend/components/graph/editors/NodeEditor.tsx:83-88`
- Issue: editor writes `node.groupId` directly via `updateNode()`, bypassing `addNodeToGroup()` / `removeNodeFromGroup()`.
- Impact: `Group.nodeIds` can become stale, breaking descendants, layout, and boundary calculations.
- Fix: route group changes through dedicated graph commands that update both sides of the relation.

### 14. CustomEdge uses one window event listener per edge

- Location: `frontend/components/graph/edges/CustomEdge.tsx:125-138`, `frontend/components/graph/core/GraphPageContent.tsx:232-240`
- Issue: edge double click is implemented by dispatching a global `window` event, and every edge listens for it.
- Impact: listener count scales with edge count and bypasses React data flow.
- Fix: manage editing edge ID in graph UI state, or use ReactFlow edge event handlers directly.

## Minor

### 15. Unused imports and constants in GraphPageContent

- Location: `frontend/components/graph/core/GraphPageContent.tsx:17,23-26,34,43`
- Issue: several imports/constants are unused.
- Fix: remove unused imports and enforce lint in CI.

### 16. Hardcoded node/editor dimensions are scattered

- Location: `frontend/components/graph/nodes/NoteNode.tsx:41-47,92-94,263-265`, `frontend/components/graph/nodes/BaseNode.tsx:99-100`
- Issue: node sizes and layout constants live in components.
- Fix: move sizing to `ui-tokens` / feature config and consume via props or CSS variables.

### 17. EdgeEditor uses `any` for form state

- Location: `frontend/components/graph/editors/EdgeEditor.tsx:12,59`
- Issue: `formData` and value updates are untyped.
- Fix: define `EdgeFormDraft` and typed field update helpers.

### 18. `button` elements omit explicit `type`

- Location: `frontend/components/graph/nodes/NoteNode.tsx:132,147,161`, `frontend/components/graph/nodes/GroupNode.tsx:106`, `frontend/components/graph/editors/EdgeEditor.tsx:115,136,151,194`
- Issue: buttons default to submit in forms.
- Fix: add `type="button"` to non-submit controls.

### 19. Manual SVG icons bypass the configured icon system

- Location: `frontend/components/graph/nodes/NoteNode.tsx:140-187`, `frontend/components/graph/nodes/GroupNode.tsx:78-116`
- Issue: project has lucide-react configured, but components manually inline SVG icons.
- Fix: use lucide icons with shared `IconButton` primitive.

## Recommended Automated Checks

- ESLint import boundary rules for `features -> shared -> app` direction.
- `eslint-plugin-jsx-a11y` for accessible names and form labels.
- TypeScript `noImplicitAny` is already covered by strict mode; add explicit rules to avoid `any` in app code.
- A small unit test suite for graph commands: delete node removes edges, group nodeIds sync, hide-all edges, canvas switch.
- React Profiler scenario for 100, 500, 1000 nodes to track render counts.
