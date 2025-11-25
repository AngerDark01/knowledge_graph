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
import { Group, Node, BlockEnum } from '@/types/graph/models';
import 'reactflow/dist/style.css';

import { NoteNode, GroupNode } from '../nodes';
import CustomEdge from '../edges/CustomEdge';
import CrossGroupEdge from '../edges/CrossGroupEdge';
import NodeEditor from '../editors/NodeEditor';
import EdgeEditor from '../editors/EdgeEditor';
import EdgeFilterControl from '../controls/EdgeFilterControl';
import HistoryControl from '../controls/HistoryControl';
import { useGraphStore } from '@/stores/graph';

import { useNodeHandling } from './hooks/useNodeHandling';
import { useEdgeHandling } from './hooks/useEdgeHandling';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useViewportControls } from './hooks/useViewportControls';
import { ZoomIndicator } from '../controls/ZoomIndicator';
import { Toolbar } from '../controls/Toolbar';
import { syncStoreToReactFlowNodes } from './nodeSyncUtils';
import { EdgeOptimizer } from '@/services/layout/algorithms/EdgeOptimizer';
import { EDGE_OPTIMIZATION_CONFIG } from '@/config/graph.config';

interface GraphPageProps {
  className?: string;
}

const NODE_VISUAL_PADDING = 4;

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
  
  const {
    nodes: storeNodes,
    edges,
    visibleEdgeIds,
    updateNode,
    updateNodePosition,
    deleteNode,
    deleteEdge,
    selectedNodeId,
    selectedEdgeId,
    setSelectedNodeId,
    setSelectedEdgeId,
    handleGroupMove,
    updateGroupBoundary,
  } = useGraphStore();
  
  const [zoomValue, setZoomValue] = useState<number>(1);
  const [reactFlowNodes, setReactFlowNodes, onNodesChange] = useNodesState([]);
  const [reactFlowEdges, setReactFlowEdges, onEdgesChange] = useEdgesState([]);
  const isDraggingRef = useRef<boolean>(false);
  const lastDraggedNodeRef = useRef<string | null>(null);

  // 边优化器实例和防抖定时器
  const edgeOptimizerRef = useRef<EdgeOptimizer>(new EdgeOptimizer());
  const edgeOptimizeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { onNodeAdd, onGroupAdd, onDragOver, onDrop } = useNodeHandling();
  const { onConnect } = useEdgeHandling();
  const { onRecenter, onClear } = useViewportControls();
  useKeyboardShortcuts(onRecenter, rfInstance);

  // 边优化防抖函数：在拖拽结束后优化相关边的连接点
  const optimizeEdgesAfterDrag = useCallback((draggedNodeId: string) => {
    if (!EDGE_OPTIMIZATION_CONFIG.ENABLED) return;

    // 清除之前的定时器
    if (edgeOptimizeTimerRef.current) {
      clearTimeout(edgeOptimizeTimerRef.current);
    }

    // 设置新的定时器（防抖）
    edgeOptimizeTimerRef.current = setTimeout(() => {
      const { nodes, edges: allEdges, updateEdge } = useGraphStore.getState();

      // 找到与拖拽节点相关的边
      const affectedNodeIds = new Set([draggedNodeId]);
      const affectedEdges = allEdges.filter(
        (edge) => edge.source === draggedNodeId || edge.target === draggedNodeId
      );

      if (affectedEdges.length === 0) return;

      console.log(`🔗 优化 ${affectedEdges.length} 条受影响的边`);

      // 使用批量优化
      const optimizedEdges = edgeOptimizerRef.current.optimizeBatch(
        nodes,
        allEdges,
        affectedNodeIds
      );

      // 只更新受影响的边
      affectedEdges.forEach((edge) => {
        const optimizedEdge = optimizedEdges.find((e) => e.id === edge.id);
        if (optimizedEdge && optimizedEdge.sourceHandle && optimizedEdge.targetHandle) {
          updateEdge(edge.id, {
            sourceHandle: optimizedEdge.sourceHandle,
            targetHandle: optimizedEdge.targetHandle,
          });
        }
      });
    }, EDGE_OPTIMIZATION_CONFIG.DEBOUNCE_DELAY);
  }, []);

  // 同步store到ReactFlow
  useEffect(() => {
    // 如果正在拖拽，跳过同步以避免覆盖用户操作
    if (isDraggingRef.current) {
      console.log('⏸️ 拖拽中，跳过同步');
      return;
    }

    const processedNodes = syncStoreToReactFlowNodes(storeNodes, selectedNodeId);

    console.log('🔄 同步节点到ReactFlow:', processedNodes.length);
    setReactFlowNodes(processedNodes as ReactFlowNode[]);
  }, [storeNodes, selectedNodeId, setReactFlowNodes, isDraggingRef.current]);

  // 同步边
  useEffect(() => {
    const processedEdges = edges
      .filter(edge => {
        // ✅ 过滤掉被转换隐藏的边
        if ((edge as any)._hiddenByConversion) {
          return false;
        }
        // 根据可见性过滤
        return visibleEdgeIds.length === 0 || visibleEdgeIds.includes(edge.id);
      })
      .map(edge => {
        // 检查边的源节点和目标节点是否都在同一个群组内
        const sourceNode = storeNodes.find(n => n.id === edge.source);
        const targetNode = storeNodes.find(n => n.id === edge.target);
        
        // 如果源节点和目标节点都在同一个群组内，给边设置更高的zIndex
        const isInSameGroup = sourceNode && targetNode && 
                             sourceNode.groupId && 
                             targetNode.groupId && 
                             sourceNode.groupId === targetNode.groupId;
        
        // 确定边的类型
        const isCrossGroup = sourceNode && targetNode && 
                             sourceNode.groupId && 
                             targetNode.groupId && 
                             sourceNode.groupId !== targetNode.groupId;
        
        // 设置边类型
        const edgeType = isCrossGroup ? 'crossGroup' : 'default';
        
        return {
          ...edge,
          selected: edge.id === selectedEdgeId,
          type: edgeType, // 设置边类型
          zIndex: 1000, // 设置边的层级高于节点（默认节点zIndex为0，选中节点为1）
        };
      });
    setReactFlowEdges(processedEdges as ReactFlowEdge[]);
  }, [edges, selectedEdgeId, setReactFlowEdges, storeNodes, visibleEdgeIds]);

  // 监听缩放
  useEffect(() => {
    if (!rfInstance) {
      return;
    }

    const onZoom = () => {
      if (rfInstance) {
        setZoomValue(rfInstance.getZoom());
      }
    };

    if ('on' in rfInstance && typeof rfInstance.on === 'function') {
      rfInstance.on('zoom', onZoom);
      return () => {
        if ('off' in rfInstance && typeof rfInstance.off === 'function') {
          rfInstance.off('zoom', onZoom);
        }
      };
    }
  }, [rfInstance, setZoomValue]); // 添加 setZoomValue 依赖以确保一致性

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

  // 边点击
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: ReactFlowEdge) => {
    event.stopPropagation();
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null);
  }, [setSelectedEdgeId, setSelectedNodeId]);

  // 画布点击
  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, [setSelectedNodeId, setSelectedEdgeId]);

  // 拖拽开始
  const onNodeDragStart = useCallback((event: React.MouseEvent, node: ReactFlowNode) => {
    console.log('🚀 开始拖拽:', node.id);
    isDraggingRef.current = true;
    lastDraggedNodeRef.current = node.id;
  }, []);

  // ⚡ 优化版：拖拽结束处理（移除不必要的 setTimeout）
  const onNodeDragStop = useCallback((event: React.MouseEvent, node: ReactFlowNode) => {
    console.log('🎯 拖拽结束:', node.id);

    try {
      const currentNode = reactFlowInstance?.getNode(node.id);
      if (!currentNode) {
        isDraggingRef.current = false;
        return;
      }

      if (currentNode.type === 'group') {
        const storeGroup = storeNodes.find(n => n.id === node.id) as Group;
        if (!storeGroup) {
          isDraggingRef.current = false;
          return;
        }

        // 🔧 计算绝对位置（如果是嵌套群组）
        let absolutePosition = {
          x: Number(currentNode.position.x),
          y: Number(currentNode.position.y)
        };

        if (storeGroup.groupId) {
          const parentGroup = storeNodes.find(n => n.id === storeGroup.groupId) as Group;
          if (parentGroup) {
            absolutePosition = {
              x: Number(currentNode.position.x) + Number(parentGroup.position.x),
              y: Number(currentNode.position.y) + Number(parentGroup.position.y)
            };
            console.log('📍 群组 相对→绝对:', currentNode.position, '→', absolutePosition);
          }
        }

        handleGroupMove(node.id, absolutePosition);

        // 直接更新父群组边界（防抖已移除）
        if (storeGroup.groupId) {
          console.log('📐 更新父群组边界:', storeGroup.groupId);
          updateGroupBoundary(storeGroup.groupId!);
        }

        // ⚡ 优化边连接点
        optimizeEdgesAfterDrag(node.id);

        // ⚡ 优化：立即重置拖拽状态
        isDraggingRef.current = false;
      } else {
        const storeNode = storeNodes.find(n => n.id === node.id) as Node;
        if (!storeNode) {
          isDraggingRef.current = false;
          return;
        }

        let absolutePosition = {
          x: Number(currentNode.position.x),
          y: Number(currentNode.position.y)
        };

        if (storeNode.groupId) {
          const parentGroup = storeNodes.find(n => n.id === storeNode.groupId) as Group;
          if (parentGroup) {
            // 使用同步函数中的转换逻辑
            absolutePosition = {
              x: Number(currentNode.position.x) + Number(parentGroup.position.x),
              y: Number(currentNode.position.y) + Number(parentGroup.position.y)
            };
            console.log('📍 相对→绝对:', currentNode.position, '→', absolutePosition);
            console.log('  父群组位置:', parentGroup.position);
          }
        }

        console.log('💾 最终保存位置:', absolutePosition);

        // 先更新位置
        updateNodePosition(node.id, absolutePosition);

        // 直接更新群组边界（防抖已移除）
        if (storeNode.groupId) {
          updateGroupBoundary(storeNode.groupId!);
        }

        // ⚡ 优化边连接点
        optimizeEdgesAfterDrag(node.id);

        // ⚡ 优化：立即重置拖拽状态（不需要延迟）
        isDraggingRef.current = false;
        lastDraggedNodeRef.current = null;
      }
    } catch (error) {
      console.error('处理节点拖拽停止时出错:', error);
      // 确保无论如何都重置拖拽状态以避免问题
      isDraggingRef.current = false;
      lastDraggedNodeRef.current = null;
    }
  }, [reactFlowInstance, storeNodes, handleGroupMove, updateNodePosition, updateGroupBoundary, optimizeEdgesAfterDrag]);

  // MiniMap 节点颜色
  const nodeColor = useCallback((node: ReactFlowNode) => {
    return node.type === 'group' ? '#e0e7ff' : '#93c5fd';
  }, []);

  return (
    <div className={`flex w-full h-full ${className || ''}`}>
      <div className="w-80 p-4 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Knowledge Graph Editor</h2>
        
        <EdgeFilterControl />
        
        {selectedNodeId ? (
          <NodeEditor nodeId={selectedNodeId} />
        ) : selectedEdgeId ? (
          <EdgeEditor edgeId={selectedEdgeId} />
        ) : (
          <div className="text-gray-500 text-center py-10">
            Select a node or edge to edit its properties
          </div>
        )}
        
        <div className="space-y-4">
          <HistoryControl />
          <Toolbar 
            onNodeAdd={onNodeAdd} 
            onGroupAdd={onGroupAdd} 
            onRecenter={onRecenter} 
            onClear={onClear} 
          />
        </div>
      </div>
      
      <div className="flex-1 relative">
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
          onEdgesChange={(changes) => {
            onEdgesChange(changes);

            requestAnimationFrame(() => {
              changes.forEach((change: EdgeChange) => {
                if (change.type === 'remove') {
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
                  deleteNode(change.id);
                  if (selectedNodeId === change.id) {
                    setSelectedNodeId(null);
                  }
                }

                // 直接处理尺寸变化，移除防抖
                if (change.type === 'dimensions' && change.dimensions && !change.resizing) {
                  const currentNode = reactFlowInstance?.getNode(change.id);

                  if (currentNode) {
                    const newWidth = Number(change.dimensions!.width);
                    const newHeight = Number(change.dimensions!.height);

                    // 同时更新 width/height 和 style,确保 ReactFlow 正确渲染
                    updateNode(change.id, {
                      width: newWidth || 350,
                      height: newHeight || 280,
                      style: {
                        ...(currentNode.style || {}),
                        width: newWidth || 350,
                        height: newHeight || 280,
                      }
                    });

                    if (currentNode.type === 'group') {
                      const storeGroup = storeNodes.find(n => n.id === change.id) as Group;

                      // 直接更新边界（防抖已移除）
                      updateGroupBoundary(change.id);

                      // 直接更新父群组边界（防抖已移除）
                      if (storeGroup?.groupId) {
                        console.log('📐 调整大小后更新父群组边界:', storeGroup.groupId);
                        updateGroupBoundary(storeGroup.groupId!);
                      }
                    }
                  }
                }
              });
            });
          }}
          onInit={(instance) => {
            setRfInstance(instance);
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