import { z } from 'zod';

export const PERSISTED_ONTOLOGY_CANVAS_VERSION = 1;

const MetadataSchema = z.record(z.string(), z.unknown()).optional();

const OntologyFieldSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.string().optional(),
  dataType: z.string().optional(),
  category: z.enum(['attribute', 'rule', 'constraint', 'interface', 'behavior']),
}).passthrough();

const OntologyNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum([
    'Class',
    'Concept',
    'Function',
    'Component',
    'Information',
    'Interface',
    'Constraint',
  ]),
  description: z.string().optional(),
  fields: z.array(OntologyFieldSchema),
  tags: z.array(z.string()),
  domainId: z.string().optional(),
  subgraphId: z.string().optional(),
  metadata: MetadataSchema,
}).passthrough();

const OntologyEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  relation: z.string(),
  direction: z.enum(['unidirectional', 'bidirectional', 'undirected']),
  domainId: z.string().optional(),
  metadata: MetadataSchema,
}).passthrough();

const OntologyDomainSchema = z.object({
  id: z.string(),
  name: z.string(),
  nodeIds: z.array(z.string()),
  domainIds: z.array(z.string()),
  parentDomainId: z.string().optional(),
  collapsed: z.boolean(),
  metadata: MetadataSchema,
}).passthrough();

const OntologySubgraphSchema = z.object({
  id: z.string(),
  name: z.string(),
  rootNodeId: z.string().optional(),
  domainId: z.string().optional(),
  nodeIds: z.array(z.string()),
  edgeIds: z.array(z.string()),
  metadata: MetadataSchema,
}).passthrough();

const OntologyGraphSchema = z.object({
  id: z.string(),
  name: z.string(),
  schemaVersion: z.number().int().positive(),
  nodes: z.record(z.string(), OntologyNodeSchema),
  edges: z.record(z.string(), OntologyEdgeSchema),
  domains: z.record(z.string(), OntologyDomainSchema),
  subgraphs: z.record(z.string(), OntologySubgraphSchema),
  metadata: MetadataSchema,
}).passthrough();

const OntologyViewportSchema = z.object({
  x: z.number(),
  y: z.number(),
  zoom: z.number(),
});

const OntologyNodeViewSchema = z.object({
  id: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  width: z.number(),
  height: z.number(),
  expanded: z.boolean().optional(),
  customExpandedSize: z.object({
    width: z.number(),
    height: z.number(),
  }).optional(),
  collapsedSections: z.array(z.string()).optional(),
}).passthrough();

const OntologyDomainViewSchema = z.object({
  id: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  width: z.number(),
  height: z.number(),
  collapsed: z.boolean(),
}).passthrough();

const OntologyEdgeViewSchema = z.object({
  id: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  display: z.record(z.string(), z.unknown()).optional(),
}).passthrough();

const OntologyViewSchema = z.object({
  nodeViews: z.record(z.string(), OntologyNodeViewSchema),
  domainViews: z.record(z.string(), OntologyDomainViewSchema),
  edgeViews: z.record(z.string(), OntologyEdgeViewSchema),
  viewport: OntologyViewportSchema,
  lod: z.enum(['full', 'compact', 'outline', 'dot']),
  edgeVisibility: z.object({
    mode: z.enum(['all', 'none', 'custom']),
    ids: z.array(z.string()),
  }),
}).passthrough();

export const PersistedOntologyCanvasSchema = z.object({
  persistenceVersion: z.number().int().positive().default(PERSISTED_ONTOLOGY_CANVAS_VERSION),
  graph: OntologyGraphSchema,
  view: OntologyViewSchema,
  revision: z.number().int().nonnegative().default(0),
  savedAt: z.string().optional(),
}).passthrough();

export type PersistedOntologyCanvas = z.infer<typeof PersistedOntologyCanvasSchema>;

export const createEmptyPersistedOntologyCanvas = (
  id: string,
  name: string,
  savedAt: Date = new Date()
): PersistedOntologyCanvas => ({
  persistenceVersion: PERSISTED_ONTOLOGY_CANVAS_VERSION,
  graph: {
    id,
    name,
    schemaVersion: 1,
    nodes: {},
    edges: {},
    domains: {},
    subgraphs: {
      [`${id}:root`]: {
        id: `${id}:root`,
        name: 'Root',
        nodeIds: [],
        edgeIds: [],
      },
    },
    metadata: {
      source: 'ontology-canvas',
    },
  },
  view: {
    nodeViews: {},
    domainViews: {},
    edgeViews: {},
    viewport: {
      x: 0,
      y: 0,
      zoom: 1,
    },
    lod: 'full',
    edgeVisibility: {
      mode: 'all',
      ids: [],
    },
  },
  revision: 0,
  savedAt: savedAt.toISOString(),
});
