import React, { useCallback, useEffect, useState, useMemo, useRef, memo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  useReactFlow,
  ReactFlowInstance,
  EdgeChange,
  NodeChange,
  ConnectionMode,
  Node as ReactFlowNode,
  Edge as ReactFlowEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { NoteNode, GroupNode } from '../nodes';
import CustomEdge from '../edges/CustomEdge';
import CrossGroupEdge from '../edges/CrossGroupEdge';
import { useGraphStore } from '@/stores/graph';
import { useWorkspaceStore } from '@/stores/workspace';

import { useNodeHandling } from './hooks/useNodeHandling';
import { useEdgeHandling } from './hooks/useEdgeHandling';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useViewportControls } from './hooks/useViewportControls';
import { ZoomIndicator } from '../controls/ZoomIndicator';
import { EdgeOptimizer } from '@/services/layout/algorithms/EdgeOptimizer';
import { EDGE_OPTIMIZATION_CONFIG } from '@/config/graph.config';
import {
  commitDomainDrag,
  commitDomainResize,
  commitNodeDrag,
  commitNodeResize,
  createResizeCommitGate,
  getCustomExpandedSizeToPersist,
  projectOntologyDocumentToReactFlowEdges,
  projectOntologyDocumentToReactFlowNodes,
  projectOntologyDocumentToLegacyGraphEdges,
  projectOntologyDocumentToLegacyGraphNodes,
  resolveReactFlowLodMode,
  resolveReactFlowNodePersistedPosition,
  useOntologyDocumentStore,
  type OntologyDocumentState,
  type OntologyInteractionPatch,
  type ReactFlowViewportBounds,
} from '@/features/ontology-canvas';
import { ontologyNodeViewTokens } from '@/features/ontology-canvas/config';
import { getActiveOntologyDocument } from '@/utils/workspace/canvasSync';

interface GraphPageProps {
  className?: string;
}

type ReactFlowViewportSnapshot = {
  x: number;
  y: number;
  zoom: number;
};

const VIEWPORT_CULLING_NODE_THRESHOLD = 80;
const VIEWPORT_CULLING_PADDING = 800;

const GraphPageContent = ({ className }: GraphPageProps) => {
  const nodeTypes = useMemo(() => ({
    custom: NoteNode,
    group: GroupNode,
  }), []);

  const edgeTypes = useMemo(() => ({
    default: CustomEdge,
    crossGroup: CrossGroupEdge,
  }), []);
  
  const reactFlowInstance = useReactFlow();
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  
  const edgeVisibility = useGraphStore(state => state.edgeVisibility);
  const deleteNode = useGraphStore(state => state.deleteNode);
  const deleteEdge = useGraphStore(state => state.deleteEdge);
  const selectedNodeId = useGraphStore(state => state.selectedNodeId);
  const selectedEdgeId = useGraphStore(state => state.selectedEdgeId);
  const setSelectedNodeId = useGraphStore(state => state.setSelectedNodeId);
  const setSelectedEdgeId = useGraphStore(state => state.setSelectedEdgeId);
  const currentCanvasId = useWorkspaceStore(state => state.currentCanvasId);
  const ontologyDocument = useOntologyDocumentStore(state => state.document);
  const ontologySourceCanvasId = useOntologyDocumentStore(state => state.sourceCanvasId);
  const isOntologyDocumentHydrated = useOntologyDocumentStore(state => state.hydrated);
  const replaceOntologyDocument = useOntologyDocumentStore(state => state.replaceDocument);
  const applyInteractionPatch = useOntologyDocumentStore(state => state.applyInteractionPatch);
  const updateOntologyViewport = useOntologyDocumentStore(state => state.updateViewport);
  const deleteOntologyElements = useOntologyDocumentStore(state => state.deleteElements);
  
  const [zoomValue, setZoomValue] = useState<number>(1);
  const [reactFlowNodes, setReactFlowNodes, onNodesChange] = useNodesState([]);
  const [reactFlowEdges, setReactFlowEdges, onEdgesChange] = useEdgesState([]);
  const [projectionBounds, setProjectionBounds] = useState<ReactFlowViewportBounds | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const isResizingRef = useRef<boolean>(false);
  const resizeCommitGateRef = useRef(createResizeCommitGate());
  const viewportFrameRef = useRef<number | null>(null);
  const pendingViewportRef = useRef<ReactFlowViewportSnapshot | null>(null);
  const graphContainerRef = useRef<HTMLDivElement | null>(null);

  // 边优化器实例和防抖定时器
  const edgeOptimizerRef = useRef<EdgeOptimizer>(new EdgeOptimizer());
  const edgeOptimizeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { onDragOver, onDrop } = useNodeHandling();
  const { onConnect } = useEdgeHandling();
  const { onRecenter } = useViewportControls();
  useKeyboardShortcuts(onRecenter, rfInstance);

  const lodMode = useMemo(() => resolveReactFlowLodMode(zoomValue), [zoomValue]);
  const ontologyElementCount = useMemo(() => {
    return Object.keys(ontologyDocument.graph.nodes).length +
      Object.keys(ontologyDocument.graph.domains).length;
  }, [ontologyDocument]);
  const isViewportCullingEnabled =
    ontologyElementCount > VIEWPORT_CULLING_NODE_THRESHOLD && projectionBounds !== null;

  useEffect(() => {
    if (isOntologyDocumentHydrated && ontologySourceCanvasId === currentCanvasId) {
      return;
    }

    replaceOntologyDocument(
      getActiveOntologyDocument({
        canvasId: currentCanvasId || 'current-canvas',
        fallbackName: 'Current Canvas',
      }),
      {
        canvasId: currentCanvasId,
        reason: 'graph-page-fallback-init',
      }
    );
  }, [
    currentCanvasId,
    isOntologyDocumentHydrated,
    ontologySourceCanvasId,
    replaceOntologyDocument,
  ]);

  const updateProjectionViewport = useCallback((viewport: ReactFlowViewportSnapshot) => {
    const container = graphContainerRef.current;
    if (!container || viewport.zoom <= 0) {
      setZoomValue(viewport.zoom || 1);
      return;
    }

    const rect = container.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      setZoomValue(viewport.zoom);
      return;
    }

    const nextBounds = {
      minX: Math.round((-viewport.x) / viewport.zoom),
      minY: Math.round((-viewport.y) / viewport.zoom),
      maxX: Math.round((rect.width - viewport.x) / viewport.zoom),
      maxY: Math.round((rect.height - viewport.y) / viewport.zoom),
    };

    setZoomValue(viewport.zoom);
    setProjectionBounds(previousBounds => {
      if (
        previousBounds &&
        previousBounds.minX === nextBounds.minX &&
        previousBounds.minY === nextBounds.minY &&
        previousBounds.maxX === nextBounds.maxX &&
        previousBounds.maxY === nextBounds.maxY
      ) {
        return previousBounds;
      }

      return nextBounds;
    });
  }, []);

  const scheduleProjectionViewportUpdate = useCallback((viewport: ReactFlowViewportSnapshot) => {
    pendingViewportRef.current = viewport;

    if (viewportFrameRef.current !== null) {
      return;
    }

    viewportFrameRef.current = window.requestAnimationFrame(() => {
      viewportFrameRef.current = null;
      const nextViewport = pendingViewportRef.current;
      pendingViewportRef.current = null;

      if (nextViewport) {
        updateProjectionViewport(nextViewport);
      }
    });
  }, [updateProjectionViewport]);

  useEffect(() => {
    return () => {
      if (viewportFrameRef.current !== null) {
        window.cancelAnimationFrame(viewportFrameRef.current);
      }
    };
  }, []);

  const projectedNodes = useMemo(() => {
    return projectOntologyDocumentToReactFlowNodes(ontologyDocument, {
      selectedNodeId,
      cullingEnabled: isViewportCullingEnabled,
      viewportBounds: projectionBounds,
      viewportPadding: VIEWPORT_CULLING_PADDING,
      lodMode,
    });
  }, [isViewportCullingEnabled, lodMode, ontologyDocument, projectionBounds, selectedNodeId]);

  const projectedNodeIds = useMemo(() => {
    return new Set(projectedNodes.map(node => node.id));
  }, [projectedNodes]);

  const projectedEdges = useMemo(() => {
    return projectOntologyDocumentToReactFlowEdges(ontologyDocument, {
      edgeVisibility,
      selectedEdgeId,
      visibleNodeIds: projectedNodeIds,
    });
  }, [edgeVisibility, ontologyDocument, projectedNodeIds, selectedEdgeId]);

  const syncLegacyDisplayCache = useCallback((document: OntologyDocumentState) => {
    useGraphStore.setState({
      nodes: projectOntologyDocumentToLegacyGraphNodes(document),
      edges: projectOntologyDocumentToLegacyGraphEdges(document),
    });
  }, []);

  const applyCanvasInteractionPatch = useCallback((
    patch: OntologyInteractionPatch,
    reason: string
  ): OntologyDocumentState | null => {
    const nextDocument = applyInteractionPatch(patch, {
      canvasId: currentCanvasId,
      reason,
    });

    if (nextDocument) {
      syncLegacyDisplayCache(nextDocument);
    }

    return nextDocument;
  }, [applyInteractionPatch, currentCanvasId, syncLegacyDisplayCache]);

  // 边优化防抖函数：在拖拽/resize 结束后优化相关边的连接点
  const optimizeEdgesAfterViewChange = useCallback((affectedViewIds: Iterable<string>) => {
    if (!EDGE_OPTIMIZATION_CONFIG.ENABLED) return;

    const affectedNodeIds = new Set(affectedViewIds);
    if (affectedNodeIds.size === 0) {
      return;
    }

    // 清除之前的定时器
    if (edgeOptimizeTimerRef.current) {
      clearTimeout(edgeOptimizeTimerRef.current);
    }

    // 设置新的定时器（防抖）
    edgeOptimizeTimerRef.current = setTimeout(() => {
      const { nodes, edges: allEdges } = useGraphStore.getState();

      // 找到与拖拽节点相关的边
      const affectedEdges = allEdges.filter(
        (edge) => affectedNodeIds.has(edge.source) || affectedNodeIds.has(edge.target)
      );

      if (affectedEdges.length === 0) return;

      // 使用批量优化
      const optimizedEdges = edgeOptimizerRef.current.optimizeBatch(
        nodes,
        allEdges,
        affectedNodeIds
      );

      const edgeViews: Record<string, { sourceHandle: string; targetHandle: string }> = {};

      affectedEdges.forEach((edge) => {
        const optimizedEdge = optimizedEdges.find((e) => e.id === edge.id);
        if (optimizedEdge && optimizedEdge.sourceHandle && optimizedEdge.targetHandle) {
          edgeViews[edge.id] = {
            sourceHandle: optimizedEdge.sourceHandle,
            targetHandle: optimizedEdge.targetHandle,
          };
        }
      });

      if (Object.keys(edgeViews).length > 0) {
        applyCanvasInteractionPatch({ edgeViews }, 'edge-handle-optimize');
      }
    }, EDGE_OPTIMIZATION_CONFIG.DEBOUNCE_DELAY);
  }, [applyCanvasInteractionPatch]);

  useEffect(() => {
    return () => {
      if (edgeOptimizeTimerRef.current) {
        clearTimeout(edgeOptimizeTimerRef.current);
      }
    };
  }, []);

  // 同步store到ReactFlow
  useEffect(() => {
    // 如果正在拖拽或 resize，跳过同步以避免覆盖 ReactFlow 本地交互态。
    if (isDraggingRef.current || isResizingRef.current) {
      return;
    }

    setReactFlowNodes(projectedNodes as ReactFlowNode[]);
  }, [projectedNodes, setReactFlowNodes]);

  // 同步边
  useEffect(() => {
    setReactFlowEdges(projectedEdges as ReactFlowEdge[]);
  }, [projectedEdges, setReactFlowEdges]);

  // 监听缩放
  useEffect(() => {
    if (!rfInstance) {
      return;
    }

    const onZoom = () => updateProjectionViewport(rfInstance.getViewport());

    if ('on' in rfInstance && typeof rfInstance.on === 'function') {
      rfInstance.on('zoom', onZoom);
      return () => {
        if ('off' in rfInstance && typeof rfInstance.off === 'function') {
          rfInstance.off('zoom', onZoom);
        }
      };
    }
  }, [rfInstance, updateProjectionViewport]);

  // 节点点击
  const onNodeClick = useCallback((event: React.MouseEvent, node: ReactFlowNode) => {
    event.stopPropagation();
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
  }, [setSelectedNodeId, setSelectedEdgeId]);

  // 节点双击
  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: ReactFlowNode) => {
    event.stopPropagation();
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
  }, [setSelectedNodeId, setSelectedEdgeId]);

  // 双击检测相关状态
  const [lastEdgeClickTime, setLastEdgeClickTime] = useState(0);
  const [lastClickedEdgeId, setLastClickedEdgeId] = useState<string | null>(null);

  // 边点击
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: ReactFlowEdge) => {
    event.stopPropagation();

    // 检测双击
    const now = Date.now();
    if (
      lastClickedEdgeId === edge.id &&
      now - lastEdgeClickTime < 300 // 300ms 内再次点击认为是双击
    ) {
      // 双击逻辑 - 这里我们需要一种方式来通知边组件进入编辑模式
      // 我们可以使用全局状态或事件系统
      window.dispatchEvent(new CustomEvent('edgeDoubleClick', { detail: { edgeId: edge.id } }));
      setLastEdgeClickTime(0); // 重置时间以避免三击被误认为是双击
      setLastClickedEdgeId(null);
    } else {
      // 单击逻辑
      setLastEdgeClickTime(now);
      setLastClickedEdgeId(edge.id);
      setSelectedEdgeId(edge.id);
      setSelectedNodeId(null);
    }
  }, [setSelectedEdgeId, setSelectedNodeId, lastEdgeClickTime, lastClickedEdgeId]);

  // 画布点击
  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, [setSelectedNodeId, setSelectedEdgeId]);

  // 拖拽开始
  const onNodeDragStart = useCallback(() => {
    isDraggingRef.current = true;
  }, []);

  // ⚡ 优化版：拖拽结束处理（移除不必要的 setTimeout）
  const onNodeDragStop = useCallback((_event: React.MouseEvent, node: ReactFlowNode) => {
    try {
      const currentNode = reactFlowInstance?.getNode(node.id);
      if (!currentNode) {
        isDraggingRef.current = false;
        return;
      }

      const legacyDisplayNode = projectOntologyDocumentToLegacyGraphNodes(ontologyDocument)
        .find(displayNode => displayNode.id === node.id);
      const persistedPosition = legacyDisplayNode
        ? resolveReactFlowNodePersistedPosition(
          legacyDisplayNode,
          lodMode,
          {
            x: Number(currentNode.position.x),
            y: Number(currentNode.position.y),
          }
        )
        : {
          x: Number(currentNode.position.x),
          y: Number(currentNode.position.y),
        };

      if (currentNode.type === 'group') {
        const dragPatch = commitDomainDrag(ontologyDocument, {
          domainId: node.id,
          reactFlowPosition: persistedPosition,
        });

        applyCanvasInteractionPatch(dragPatch, 'domain-drag-stop');

        // ⚡ 优化边连接点
        optimizeEdgesAfterViewChange([
          ...Object.keys(dragPatch.domainViews ?? {}),
          ...Object.keys(dragPatch.nodeViews ?? {}),
        ]);

        // ⚡ 优化：立即重置拖拽状态
        isDraggingRef.current = false;
      } else {
        const dragPatch = commitNodeDrag(ontologyDocument, {
          nodeId: node.id,
          reactFlowPosition: persistedPosition,
        });

        applyCanvasInteractionPatch(dragPatch, 'node-drag-stop');

        // ⚡ 优化边连接点
        optimizeEdgesAfterViewChange([node.id]);

        // ⚡ 优化：立即重置拖拽状态（不需要延迟）
        isDraggingRef.current = false;
      }
    } catch (error) {
      console.error('处理节点拖拽停止时出错:', error);
      // 确保无论如何都重置拖拽状态以避免问题
      isDraggingRef.current = false;
    }
  }, [
    applyCanvasInteractionPatch,
    lodMode,
    ontologyDocument,
    optimizeEdgesAfterViewChange,
    reactFlowInstance,
  ]);

  // MiniMap 节点颜色
  const nodeColor = useCallback((node: ReactFlowNode) => {
    return node.type === 'group' ? '#e0e7ff' : '#93c5fd';
  }, []);

  return (
    <div className={`flex w-full h-full ${className || ''}`}>
      <div ref={graphContainerRef} className="flex-1 relative">
        <ReactFlow
          nodes={reactFlowNodes}
          edges={reactFlowEdges}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          onNodeDragStart={onNodeDragStart}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          attributionPosition="bottom-left"
          minZoom={0.1}
          maxZoom={2}
          elementsSelectable={true}
          selectNodesOnDrag={false}
          panOnDrag={[2]} // 仅右键拖拽画布（或使用 [1, 2] 允许左键和中键）
          nodesDraggable={true}
          nodesConnectable={true}
          preventScrolling={false} // ✅ 允许节点内部滚动，配合 nowheel 类使用
          onMove={(_event, viewport) => scheduleProjectionViewportUpdate(viewport)}
          onMoveEnd={(_event, viewport) => {
            updateProjectionViewport(viewport);
            updateOntologyViewport(viewport, {
              canvasId: currentCanvasId,
              reason: 'viewport-move-end',
            });
          }}
          onEdgesChange={(changes) => {
            onEdgesChange(changes);

            requestAnimationFrame(() => {
              changes.forEach((change: EdgeChange) => {
                if (change.type === 'remove') {
                  deleteOntologyElements({
                    ids: [change.id],
                  }, {
                    canvasId: currentCanvasId,
                    reason: 'edge-remove',
                  });
                  deleteEdge(change.id);
                  if (selectedEdgeId === change.id) {
                    setSelectedEdgeId(null);
                  }
                }
              });
            });
          }}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onNodesChange={(changes) => {
            onNodesChange(changes);

            // 使用批处理来确保状态更新的一致性
            requestAnimationFrame(() => {
              changes.forEach((change: NodeChange) => {
                if (change.type === 'remove') {
                  resizeCommitGateRef.current.clear(change.id);
                  isResizingRef.current = resizeCommitGateRef.current.hasActiveResize();
                  deleteOntologyElements({
                    ids: [change.id],
                  }, {
                    canvasId: currentCanvasId,
                    reason: 'node-remove',
                  });
                  deleteNode(change.id);
                  if (selectedNodeId === change.id) {
                    setSelectedNodeId(null);
                  }
                }

                if (change.type === 'dimensions' && change.resizing) {
                  resizeCommitGateRef.current.markResizing(change.id);
                  isResizingRef.current = true;
                  return;
                }

                // resize 结束后一次性提交本体 view 尺寸。
                if (change.type === 'dimensions' && change.dimensions && !change.resizing) {
                  if (!resizeCommitGateRef.current.shouldCommitResizeEnd(change.id)) {
                    return;
                  }

                  const currentNode = reactFlowInstance?.getNode(change.id);

                  if (currentNode) {
                    isResizingRef.current = resizeCommitGateRef.current.hasActiveResize();
                    const newWidth = Number(change.dimensions!.width);
                    const newHeight = Number(change.dimensions!.height);
                    const nodeView = ontologyDocument.view.nodeViews[change.id];
                    const customExpandedSize = currentNode.type === 'group' || !nodeView
                      ? undefined
                      : getCustomExpandedSizeToPersist(
                        {
                          ...nodeView,
                          isExpanded: nodeView.expanded,
                          width: newWidth,
                          height: newHeight,
                        },
                        {
                          collapsedSize: {
                            width: ontologyNodeViewTokens.collapsedWidth,
                            height: ontologyNodeViewTokens.collapsedHeight,
                          },
                          expandedSize: {
                            width: ontologyNodeViewTokens.expandedWidth,
                            height: ontologyNodeViewTokens.expandedHeight,
                          },
                        }
                      ) ?? undefined;

                    const resizePatch = currentNode.type === 'group'
                      ? commitDomainResize(ontologyDocument, {
                        domainId: change.id,
                        width: newWidth || 350,
                        height: newHeight || 280,
                      })
                      : commitNodeResize(ontologyDocument, {
                        nodeId: change.id,
                        width: newWidth || 350,
                        height: newHeight || 280,
                        customExpandedSize,
                      });

                    applyCanvasInteractionPatch(
                      resizePatch,
                      currentNode.type === 'group' ? 'domain-resize' : 'node-resize'
                    );
                    optimizeEdgesAfterViewChange([change.id]);
                  } else {
                    isResizingRef.current = resizeCommitGateRef.current.hasActiveResize();
                  }
                }
              });
            });
          }}
          onInit={(instance) => {
            setRfInstance(instance);
            updateProjectionViewport(instance.getViewport());
            updateOntologyViewport(instance.getViewport(), {
              canvasId: currentCanvasId,
              reason: 'react-flow-init',
            });
          }}
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={nodeColor}
            maskColor="rgb(240, 240, 240, 0.6)"
            pannable
            zoomable
          />
          <ZoomIndicator zoomValue={zoomValue} />
        </ReactFlow>
      </div>
    </div>
  );
};

export default memo(GraphPageContent);
