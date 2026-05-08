import { useCallback } from 'react';
import type { DragEvent } from 'react';
import { useReactFlow } from 'reactflow';
import { NODE_SIZES, PADDING_CONFIG } from '@/config/graph.config';
import {
  createOntologyClassNodeInDocument,
  createOntologyDomainInDocument,
  isLegacyOntologyClassDisplay,
  isLegacyOntologyDomainDisplay,
  projectOntologyDomainToLegacyGroup,
  projectOntologyNodeToLegacyNode,
  useOntologyDocumentStore,
  type LegacyOntologyDisplayNode,
} from '@/features/ontology-canvas';
import { useGraphStore } from '@/stores/graph';
import { useWorkspaceStore } from '@/stores/workspace';
import { getActiveOntologyDocument } from '@/utils/workspace/canvasSync';

const GROUP_PADDING = PADDING_CONFIG.GROUP_PADDING;
const ONTOLOGY_DOCUMENT_NAME = 'Current Canvas';

type Position = { x: number; y: number };
type Size = { width: number; height: number };

const CLASS_NODE_SIZE: Size = {
  width: NODE_SIZES.NOTE.DEFAULT_WIDTH,
  height: NODE_SIZES.NOTE.DEFAULT_HEIGHT,
};

const DOMAIN_SIZE: Size = {
  width: NODE_SIZES.GROUP.DEFAULT_WIDTH,
  height: NODE_SIZES.GROUP.DEFAULT_HEIGHT,
};

const safeNumber = (value: unknown, defaultValue = 0): number => {
  const num = Number(value);
  return Number.isFinite(num) ? num : defaultValue;
};

const createElementId = (prefix: 'class' | 'domain'): string =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

const getViewportCenterPosition = (
  reactFlowInstance: ReturnType<typeof useReactFlow>
): Position => {
  try {
    const viewPort = reactFlowInstance?.getViewport();
    const center = reactFlowInstance?.screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });

    return {
      x: safeNumber(center?.x, safeNumber(viewPort?.x, 0) + 200),
      y: safeNumber(center?.y, safeNumber(viewPort?.y, 0) + 100),
    };
  } catch (error) {
    console.error('计算视图中心位置失败:', error);
    return { x: 200, y: 100 };
  }
};

const clampPositionToDomain = (
  position: Position,
  domain: LegacyOntologyDisplayNode,
  size: Size
): Position => {
  const domainPosition = {
    x: safeNumber(domain.position?.x, 0),
    y: safeNumber(domain.position?.y, 0),
  };
  const domainWidth = safeNumber(domain.width, DOMAIN_SIZE.width);
  const domainHeight = safeNumber(domain.height, DOMAIN_SIZE.height);

  const maxX = domainPosition.x + domainWidth - GROUP_PADDING.right - size.width;
  const maxY = domainPosition.y + domainHeight - GROUP_PADDING.bottom - size.height;

  return {
    x: Math.max(
      domainPosition.x + GROUP_PADDING.left,
      Math.min(safeNumber(position.x, domainPosition.x + GROUP_PADDING.left), maxX)
    ),
    y: Math.max(
      domainPosition.y + GROUP_PADDING.top,
      Math.min(safeNumber(position.y, domainPosition.y + GROUP_PADDING.top), maxY)
    ),
  };
};

const getGridPositionInDomain = (
  domain: LegacyOntologyDisplayNode,
  itemIndex: number,
  itemSize: Size,
  spacing: Size
): Position => {
  const domainPosition = {
    x: safeNumber(domain.position?.x, 0),
    y: safeNumber(domain.position?.y, 0),
  };
  const columnCount = 2;
  const row = Math.floor(itemIndex / columnCount);
  const column = itemIndex % columnCount;

  return clampPositionToDomain(
    {
      x: domainPosition.x + GROUP_PADDING.left + column * spacing.width,
      y: domainPosition.y + GROUP_PADDING.top + row * spacing.height,
    },
    domain,
    itemSize
  );
};

const isPositionInsideDomain = (position: Position, domain: LegacyOntologyDisplayNode): boolean => {
  const x = safeNumber(domain.position?.x, 0);
  const y = safeNumber(domain.position?.y, 0);
  const width = safeNumber(domain.width, DOMAIN_SIZE.width);
  const height = safeNumber(domain.height, DOMAIN_SIZE.height);

  return position.x >= x &&
    position.x <= x + width &&
    position.y >= y &&
    position.y <= y + height;
};

const findContainingDomain = (
  position: Position,
  nodes: readonly LegacyOntologyDisplayNode[]
): LegacyOntologyDisplayNode | undefined => {
  return nodes
    .filter(node => isLegacyOntologyDomainDisplay(node) && isPositionInsideDomain(position, node))
    .sort((a, b) => {
      const areaA = safeNumber(a.width, DOMAIN_SIZE.width) * safeNumber(a.height, DOMAIN_SIZE.height);
      const areaB = safeNumber(b.width, DOMAIN_SIZE.width) * safeNumber(b.height, DOMAIN_SIZE.height);
      return areaA - areaB;
    })[0];
};

const createDocumentSnapshot = (canvasId: string) => {
  return getActiveOntologyDocument({
    canvasId: canvasId || 'current-canvas',
    fallbackName: ONTOLOGY_DOCUMENT_NAME,
  });
};

const getRootSubgraphId = (
  document: ReturnType<typeof createDocumentSnapshot>
): string | undefined => {
  const rootSubgraph = Object.values(document.graph.subgraphs)
    .find(subgraph => subgraph.name.toLowerCase() === 'root');
  return rootSubgraph?.id ?? Object.keys(document.graph.subgraphs)[0];
};

export const useNodeHandling = () => {
  const reactFlowInstance = useReactFlow();
  const nodes = useGraphStore(state => state.nodes);
  const addNode = useGraphStore(state => state.addNode);
  const addNodeToGroup = useGraphStore(state => state.addNodeToGroup);
  const setSelectedNodeId = useGraphStore(state => state.setSelectedNodeId);
  const selectedNodeId = useGraphStore(state => state.selectedNodeId);
  const currentCanvasId = useWorkspaceStore(state => state.currentCanvasId);
  const applyOntologyCommandResult = useOntologyDocumentStore(state => state.applyCommandResult);

  const onNodeAdd = useCallback(() => {
    const selectedDomain = nodes.find(node =>
      node.id === selectedNodeId && isLegacyOntologyDomainDisplay(node)
    );

    const classCount = nodes.filter(isLegacyOntologyClassDisplay).length;
    const domainId = selectedDomain?.id;
    const position = selectedDomain
      ? getGridPositionInDomain(
        selectedDomain,
        nodes.filter(node =>
          isLegacyOntologyClassDisplay(node) && node.groupId === selectedDomain.id
        ).length,
        CLASS_NODE_SIZE,
        { width: CLASS_NODE_SIZE.width + 30, height: CLASS_NODE_SIZE.height + 30 }
      )
      : getViewportCenterPosition(reactFlowInstance);
    const nodeId = createElementId('class');
    const nodeName = `Class ${classCount + 1}`;
    const document = createDocumentSnapshot(currentCanvasId);
    const result = createOntologyClassNodeInDocument(document, {
      id: nodeId,
      name: nodeName,
      type: 'Class',
      description: 'Ontology class node',
      domainId,
      subgraphId: getRootSubgraphId(document),
      position,
      width: CLASS_NODE_SIZE.width,
      height: CLASS_NODE_SIZE.height,
      metadata: {
        source: 'ontology-canvas-toolbar',
      },
    });

    if (!result.changed) {
      console.warn('创建本体节点失败:', result.warnings);
      return;
    }

    applyOntologyCommandResult(result, {
      canvasId: currentCanvasId,
      reason: 'toolbar-create-class',
    });

    const displayNode = projectOntologyNodeToLegacyNode(result.document, nodeId, {
      includeMembership: false,
    });
    if (!displayNode) {
      console.error('本体节点投影到当前画布运行态失败:', nodeId);
      return;
    }

    addNode(displayNode);
    setSelectedNodeId(displayNode.id);

    if (domainId) {
      addNodeToGroup(displayNode.id, domainId);
    }
  }, [
    addNode,
    addNodeToGroup,
    applyOntologyCommandResult,
    currentCanvasId,
    nodes,
    reactFlowInstance,
    selectedNodeId,
    setSelectedNodeId,
  ]);

  const onGroupAdd = useCallback(() => {
    const selectedDomain = nodes.find(node =>
      node.id === selectedNodeId && isLegacyOntologyDomainDisplay(node)
    );

    const domainCount = nodes.filter(isLegacyOntologyDomainDisplay).length;
    const parentDomainId = selectedDomain?.id;
    const position = selectedDomain
      ? getGridPositionInDomain(
        selectedDomain,
        nodes.filter(node =>
          isLegacyOntologyDomainDisplay(node) && node.groupId === selectedDomain.id
        ).length,
        DOMAIN_SIZE,
        { width: DOMAIN_SIZE.width + 40, height: DOMAIN_SIZE.height + 40 }
      )
      : getViewportCenterPosition(reactFlowInstance);
    const domainId = createElementId('domain');
    const result = createOntologyDomainInDocument(createDocumentSnapshot(currentCanvasId), {
      id: domainId,
      name: `Domain ${domainCount + 1}`,
      parentDomainId,
      collapsed: false,
      position,
      width: DOMAIN_SIZE.width,
      height: DOMAIN_SIZE.height,
      metadata: {
        source: 'ontology-canvas-toolbar',
      },
    });

    if (!result.changed) {
      console.warn('创建本体 Domain 失败:', result.warnings);
      return;
    }

    applyOntologyCommandResult(result, {
      canvasId: currentCanvasId,
      reason: 'toolbar-create-domain',
    });

    const displayDomain = projectOntologyDomainToLegacyGroup(result.document, domainId, {
      includeMembership: false,
    });
    if (!displayDomain) {
      console.error('本体 Domain 投影到当前画布运行态失败:', domainId);
      return;
    }

    addNode(displayDomain);
    setSelectedNodeId(displayDomain.id);

    if (parentDomainId) {
      addNodeToGroup(displayDomain.id, parentDomainId);
    }
  }, [
    addNode,
    addNodeToGroup,
    applyOntologyCommandResult,
    currentCanvasId,
    nodes,
    reactFlowInstance,
    selectedNodeId,
    setSelectedNodeId,
  ]);

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) {
        return;
      }

      try {
        const rawPosition = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        const position = {
          x: safeNumber(rawPosition?.x, 0),
          y: safeNumber(rawPosition?.y, 0),
        };
        const targetDomain = findContainingDomain(position, nodes);
        const domainId = targetDomain?.id;
        const classCount = nodes.filter(isLegacyOntologyClassDisplay).length;
        const nodeId = createElementId('class');
        const document = createDocumentSnapshot(currentCanvasId);
        const result = createOntologyClassNodeInDocument(document, {
          id: nodeId,
          name: `Class ${classCount + 1}`,
          type: 'Class',
          description: 'Ontology class node',
          domainId,
          subgraphId: getRootSubgraphId(document),
          position: targetDomain
            ? clampPositionToDomain(position, targetDomain, CLASS_NODE_SIZE)
            : position,
          width: CLASS_NODE_SIZE.width,
          height: CLASS_NODE_SIZE.height,
          metadata: {
            source: 'ontology-canvas-drop',
            dragType: type,
          },
        });

        if (!result.changed) {
          console.warn('拖放创建本体节点失败:', result.warnings);
          return;
        }

        applyOntologyCommandResult(result, {
          canvasId: currentCanvasId,
          reason: 'drop-create-class',
        });

        const displayNode = projectOntologyNodeToLegacyNode(result.document, nodeId, {
          includeMembership: false,
        });
        if (!displayNode) {
          console.error('拖放本体节点投影到当前画布运行态失败:', nodeId);
          return;
        }

        addNode(displayNode);
        setSelectedNodeId(displayNode.id);

        if (domainId) {
          addNodeToGroup(displayNode.id, domainId);
        }
      } catch (error) {
        console.error('放置本体节点失败:', error);
      }
    },
    [
      addNode,
      addNodeToGroup,
      applyOntologyCommandResult,
      currentCanvasId,
      nodes,
      reactFlowInstance,
      setSelectedNodeId,
    ]
  );

  return {
    onNodeAdd,
    onGroupAdd,
    onDragOver,
    onDrop,
  };
};
