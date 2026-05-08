# ARCHITECTURE_OPTIMIZATION_PLAN

## Goal

Refactor the demo into an Ontology Canvas codebase with clear module boundaries:

- UI rendering can be adjusted independently from graph behavior.
- Ontology data is not coupled to ReactFlow runtime objects.
- Domain/Group/Subgraph/Relation semantics are first-class models.
- High-frequency view state does not trigger persistence/history.
- Old demo code can be deleted safely after replacement paths exist.

## Current Architecture Problems

1. Domain data, ReactFlow view data, editing state, selection, history, and persistence are mixed in one graph store.
2. `Node` is a generic note model; ontology concepts are only loose `attributes`.
3. `Group` is simultaneously visual group, nesting container, conversion target, and possible domain boundary.
4. ReactFlow adapters are embedded in `GraphPageContent` and `nodeSyncUtils`, not isolated as a rendering adapter.
5. UI components directly read/write global stores.
6. Styling tokens are scattered across JSX, config files, and hardcoded numeric constants.
7. History and persistence operate on whole graph snapshots rather than explicit graph commands.

## Target Module Boundaries

Dependency direction:

```text
app
  -> features
      -> domains
          -> platform
              -> shared
```

Rules:

- `domains/ontology` must not import React or ReactFlow.
- `features/ontology-canvas` may import ReactFlow, but only through adapter modules.
- `shared/ui` must not import graph/domain modules.
- Persistence cannot subscribe to the whole UI store; it consumes explicit graph document snapshots or patches.
- Components render props; commands mutate data.

## Proposed Frontend Structure

```text
frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/
│       └── workspace/
├── domains/
│   └── ontology/
│       ├── model/
│       │   ├── graph.ts
│       │   ├── node.ts
│       │   ├── edge.ts
│       │   ├── domain.ts
│       │   └── subgraph.ts
│       ├── commands/
│       │   ├── nodeCommands.ts
│       │   ├── edgeCommands.ts
│       │   ├── domainCommands.ts
│       │   └── graphValidation.ts
│       ├── selectors/
│       │   ├── graphSelectors.ts
│       │   └── relationSelectors.ts
│       └── index.ts
├── features/
│   ├── ontology-canvas/
│   │   ├── components/
│   │   │   ├── OntologyCanvas.tsx
│   │   │   ├── ClassNodeView.tsx
│   │   │   ├── DomainNodeView.tsx
│   │   │   └── SemanticEdgeView.tsx
│   │   ├── adapters/
│   │   │   ├── reactFlowAdapter.ts
│   │   │   ├── reactFlowNodeTypes.ts
│   │   │   └── reactFlowEdgeTypes.ts
│   │   ├── state/
│   │   │   ├── graphDocumentStore.ts
│   │   │   ├── canvasViewStore.ts
│   │   │   ├── selectionStore.ts
│   │   │   └── editingStore.ts
│   │   ├── config/
│   │   │   ├── canvasTokens.ts
│   │   │   ├── nodeTokens.ts
│   │   │   └── relationStyleTokens.ts
│   │   └── index.ts
│   ├── workspace/
│   │   ├── components/
│   │   ├── state/
│   │   ├── persistence/
│   │   └── index.ts
│   └── mermaid-import/
│       ├── parser/
│       ├── converter/
│       └── index.ts
├── platform/
│   ├── storage/
│   ├── layout-engine/
│   ├── logger/
│   └── config/
├── shared/
│   ├── ui/
│   ├── hooks/
│   ├── lib/
│   └── types/
└── legacy/
    └── graph-demo/
```

`legacy/graph-demo` is optional but useful during migration. Move old ReactFlow demo components there once replacement canvas modules exist.

## Ontology Data Model

First-class model:

```ts
export type OntologyGraph = {
  id: string
  name: string
  nodes: Record<string, OntologyNode>
  edges: Record<string, OntologyEdge>
  domains: Record<string, OntologyDomain>
  subgraphs: Record<string, OntologySubgraph>
  schemaVersion: number
}

export type OntologyNode = {
  id: string
  name: string
  kind: 'Class' | 'Concept' | 'Function' | 'Component' | 'Interface'
  fields: OntologyField[]
  constraints: OntologyConstraint[]
  domainId?: string
  subgraphId?: string
}

export type OntologyEdge = {
  id: string
  sourceId: string
  targetId: string
  predicate: string
  direction: 'forward' | 'both' | 'none'
  domain?: string
  range?: string
  metadata?: Record<string, unknown>
}

export type OntologyViewState = {
  nodeViews: Record<string, NodeView>
  domainViews: Record<string, DomainView>
  viewport: { x: number; y: number; zoom: number }
  lod: 'full' | 'compact' | 'outline' | 'dot'
}
```

Important split:

- `OntologyGraph` is semantic data.
- `OntologyViewState` is canvas/UI data.
- ReactFlow nodes/edges are derived adapter output, never the source of truth.

## State Architecture

Split current `useGraphStore` into four stores:

```text
graphDocumentStore
  semantic graph data only

canvasViewStore
  viewport, zoom, LOD, visible bounds, node positions/sizes

selectionStore
  selectedNodeIds, selectedEdgeIds, hoverId

editingStore
  drafts, inline edit state, dialogs, pending command state
```

Persistence subscribes only to:

```text
graphDocumentStore.graph
canvasViewStore.persistedViewState
workspaceStore.currentCanvasId
```

It must not subscribe to hover, selection, transient form drafts, or every drag frame.

## Command Layer

Replace direct `updateNode()` / `updateEdge()` calls with commands:

```text
createClassNode
updateNodeFields
moveNodeToDomain
deleteNodeAndIncidentEdges
createSemanticRelation
updateRelationPredicate
collapseDomain
expandDomain
linkNodeToSubgraph
```

Each command returns:

```ts
type GraphCommandResult = {
  graph: OntologyGraph
  view?: Partial<OntologyViewState>
  historyEntry?: HistoryEntry
  warnings?: string[]
}
```

This makes history, persistence, validation, and UI refresh explicit.

## UI Configuration

Create token modules instead of hardcoded component values:

```ts
export const nodeTokens = {
  classNode: {
    width: 320,
    minHeight: 180,
    headerHeight: 36,
    fieldRowHeight: 24,
    padding: 12,
    radius: 6,
    fontSize: {
      title: 14,
      body: 12,
    },
  },
  domainNode: {
    minWidth: 360,
    minHeight: 240,
    headerHeight: 32,
    padding: 20,
  },
}
```

Component rule:

- View components receive tokens via props or context.
- Tailwind classes handle layout primitives.
- Numeric dimensions come from token/config files.
- Semantic colors come from relation/domain style maps.

## Rendering Adapter

ReactFlow adapter responsibility:

```text
OntologyGraph + OntologyViewState
  -> ReactFlowNode[]
  -> ReactFlowEdge[]
```

Adapter must provide:

- `nodeById` map.
- `visibleNodeIds` based on viewport and Domain collapse.
- LOD projection.
- edge filtering with explicit visibility mode.
- stable object caching for unchanged nodes.

ReactFlow component receives already adapted nodes/edges. It should not know how ontology relationships are stored.

## Performance Design

Minimum first pass:

- Add `onlyRenderVisibleElements` to ReactFlow after validating behavior.
- Use store selectors instead of whole-store subscriptions.
- Replace full edge source/target lookup with `nodeById`.
- Add LOD levels:
  - full: title, type, fields, constraints.
  - compact: title, type, field count.
  - outline: colored box and label.
  - dot: point/cluster marker.
- Pause persistence during drag and inline editing.
- Remove render-path console logs.

Larger pass:

- Adapter result cache keyed by graph revision + view revision.
- Command history instead of full graph snapshots.
- Layout in Web Worker or explicit async task.

## Deletion / Cleanup Candidates

Delete or move after replacement is in place:

- `frontend/app/page.legacy.tsx`
- `frontend/debug-edge-arrows.js`
- `frontend/test-api.js`
- `frontend/push-to-github.ps1`
- `frontend/push-to-github.bat`
- default public SVGs if unused: `next.svg`, `vercel.svg`, `file.svg`, `window.svg`, `globe.svg`
- duplicate lockfile after choosing npm or pnpm
- old Chinese repair notes after extracting useful decisions into ADRs

Do not delete yet:

- Mermaid import services: useful as import feature after isolation.
- Existing layout services: can move to `platform/layout-engine`.
- Workspace tree: useful for Subgraph navigation after cleanup.

## Refactor Phases

### Phase 0: Stabilize

Fix correctness blockers before big moves:

1. Fix `updateGroup({ nodeIds })` nested array bug.
2. Fix edge visibility mode.
3. Delete incident edges when deleting nodes/groups.
4. Fix Docker Compose paths.
5. Fix Tailwind/shadcn paths.
6. Pick one package manager.

### Phase 1: Define Domain Model

1. Add `domains/ontology/model/*`.
2. Add mappers from old `Node/Group/Edge` to new model.
3. Add graph validation tests.
4. Keep old UI running.

### Phase 2: Split State

1. Create `graphDocumentStore`, `canvasViewStore`, `selectionStore`, `editingStore`.
2. Move persistence to workspace feature.
3. Move history to command layer.
4. Stop saving selection/hover/form drafts.

### Phase 3: ReactFlow Adapter

1. Move `nodeSyncUtils` into `features/ontology-canvas/adapters`.
2. Add stable `nodeById`.
3. Add explicit edge visibility mode.
4. Add LOD projection.
5. Add Domain collapse projection.

### Phase 4: Component Split

1. Convert `NoteNode` to `ClassNodeView`.
2. Convert `GroupNode` to `DomainNodeView`.
3. Convert `CustomEdge` to `SemanticEdgeView`.
4. Move store writes into container/command handlers.
5. Use shared `IconButton`, `Field`, `SegmentedControl`, `ColorSwatch`.

### Phase 5: Feature Cleanup

1. Move Mermaid import into `features/mermaid-import`.
2. Move layout engine into `platform/layout-engine`.
3. Move workspace tree into `features/workspace`.
4. Move primitives into `shared/ui`.
5. Retire legacy demo files.

## ADRs

### ADR-001: Ontology Model Is Source of Truth

Status: Proposed

Decision: Store ontology graph and canvas view state separately. ReactFlow nodes/edges are derived adapter output.

Consequences:

- UI can change without rewriting semantic data.
- RDF/OWL export can read semantic graph directly.
- Adapter layer becomes responsible for ReactFlow quirks.

### ADR-002: Feature-Based Frontend Structure

Status: Proposed

Decision: Move from type-based `components/stores/services/types` to feature/domain-based modules.

Consequences:

- Related files live together.
- Import boundaries can be enforced.
- Legacy files can be moved gradually instead of rewritten all at once.

### ADR-003: Command-Based Graph Mutations

Status: Proposed

Decision: Replace arbitrary store updates with graph commands.

Consequences:

- History becomes reliable.
- Persistence can save meaningful graph changes.
- Bugs like orphan edges and stale group membership are easier to prevent.

## First Implementation Backlog

Recommended order:

1. Add tests for current bugs:
   - `hideAllEdges` hides all edges.
   - `updateGroup({ nodeIds })` keeps `nodes` flat.
   - deleting node removes incident edges.
   - moving node to group syncs both `node.groupId` and `group.nodeIds`.
2. Fix those bugs.
3. Create `domains/ontology/model`.
4. Create `features/ontology-canvas/config` tokens.
5. Introduce adapter function behind existing `GraphPageContent`.
6. Convert one node view to pure props as a pilot.
