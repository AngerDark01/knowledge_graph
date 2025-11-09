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
import { Group, Node, BaseNode } from '@/types/graph/models';
import 'reactflow/dist/style.css';

import SmartNode from '../node';
import CustomEdge from '../CustomEdge';
import CrossGroupEdge from '../CrossGroupEdge';
import NodeEditor from '../NodeEditor';
import EdgeEditor from '../EdgeEditor';
import EdgeFilterControl from '../EdgeFilterControl';
import HistoryControl from '../HistoryControl';
import { useGraphStore } from '@/stores/graph';

import { useNodeHandling } from './hooks/useNodeHandling';
import { useEdgeHandling } from './hooks/useEdgeHandling';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useViewportControls } from './hooks/useViewportControls';
import { ZoomIndicator } from './components/ZoomIndicator';
import { Toolbar } from './components/Toolbar';
import { filterVisibleNodes } from '@/utils/graph/nodeVisibility';

interface GraphPageProps {
  className?: string;
}

// 群组内边距常量
const GROUP_PADDING = { 
  top: 70,
  left: 20, 
  right: 20, 
  bottom: 20 
};

const NODE_VISUAL_PADDING = 4;

// 安全数值验证
const safeNumber = (value: any, defaultValue: number = 0): number => {
  const num = Number(value);
  return typeof num === 'number' && !isNaN(num) && isFinite(num) ? num : defaultValue;
};

const GraphPageContent = ({ className }: GraphPageProps) => {
  const nodeTypes = useMemo(() => ({
    custom: SmartNode,
    group: SmartNode,
  }), []);

  const edgeTypes = useMemo(() => ({
    default: CustomEdge,
    crossGroup: CrossGroupEdge,
  }), []);
  
  const reactFlowInstance = useReactFlow();
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  
  const resizeTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  
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
  } = useGraphStore();
  
  const [zoomValue, setZoomValue] = useState<number>(1);
  const [reactFlowNodes, setReactFlowNodes, onNodesChange] = useNodesState([]);
  const [reactFlowEdges, setReactFlowEdges, onEdgesChange] = useEdgesState([]);
  const isDraggingRef = useRef<boolean>(false);
  const lastDraggedNodeRef = useRef<string | null>(null);

  const { onNodeAdd, onGroupAdd, onDragOver, onDrop } = useNodeHandling();
  const { onConnect } = useEdgeHandling();
  const { onRecenter, onClear } = useViewportControls();
  useKeyboardShortcuts(onRecenter, rfInstance);

  // 同步store到ReactFlow
  useEffect(() => {
    // 如果正在拖拽，跳过同步以避免覆盖用户操作
    if (isDraggingRef.current) {
      console.log('⏸️ 拖拽中，跳过同步');
      return;
    }

    // 🔥 核心功能：递归过滤隐藏的节点
    // 只有展开的容器的子节点才会显示，支持嵌套容器
    const visibleNodes = filterVisibleNodes(storeNodes);

    const processedNodes = visibleNodes.map((node: BaseNode) => {
      // 在新架构中，使用 viewMode 判断节点类型
      const isContainer = node.viewMode === 'container';

      // ReactFlow 需要区分 'group' 和 'custom' 类型
      const reactFlowType = isContainer ? 'group' : 'custom';

      return {
        ...node,
        id: node.id,
        type: reactFlowType,
        position: {
          x: safeNumber(node.position.x),
          y: safeNumber(node.position.y),
        },
        selected: node.id === selectedNodeId,
        draggable: true,
        style: {
          ...node.style,
          width: safeNumber(node.width, isContainer ? 300 : 350),
          height: safeNumber(node.height, isContainer ? 200 : 280),
        },
        data: {
          ...node.data,
          title: node.title,
          content: node.content,
          summary: node.summary,
          tags: node.tags,
          attributes: node.attributes,
          validationError: node.validationError,
        },
      };
    });

    console.log(`🔄 同步节点到ReactFlow: ${processedNodes.length}/${storeNodes.length} (已过滤隐藏节点)`);
    setReactFlowNodes(processedNodes as ReactFlowNode[]);
  }, [storeNodes, selectedNodeId, setReactFlowNodes]);

  // 同步边
  useEffect(() => {
    // 获取可见节点的ID集合，用于过滤边
    const visibleNodes = filterVisibleNodes(storeNodes);
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));

    const processedEdges = edges
      .filter(edge => visibleEdgeIds.length === 0 || visibleEdgeIds.includes(edge.id)) // 根据可见性过滤
      .filter(edge => {
        // 🔥 新增：只显示源节点和目标节点都可见的边
        return visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target);
      })
      .map(edge => {
        // TODO: 简化版本 - 需要进一步重构以支持跨群组边的检测
        const sourceNode = storeNodes.find(n => n.id === edge.source) as BaseNode | undefined;
        const targetNode = storeNodes.find(n => n.id === edge.target) as BaseNode | undefined;

        // 检查是否在同一个父节点内
        const isInSameGroup = sourceNode && targetNode &&
                              sourceNode.parentId &&
                              targetNode.parentId &&
                              sourceNode.parentId === targetNode.parentId;

        // 检查是否为跨父节点的边
        const isCrossGroup = sourceNode && targetNode &&
                             sourceNode.parentId &&
                             targetNode.parentId &&
                             sourceNode.parentId !== targetNode.parentId;

        // 设置边类型
        const edgeType = isCrossGroup ? 'crossGroup' : 'default';

        return {
          ...edge,
          selected: edge.id === selectedEdgeId,
          type: edgeType, // 设置边类型
          zIndex: isInSameGroup ? 100 : undefined, // 确保群组内的边显示在群组之上
        };
      });
    setReactFlowEdges(processedEdges as ReactFlowEdge[]);
  }, [edges, selectedEdgeId, setReactFlowEdges, storeNodes, visibleEdgeIds]);

  // 监听缩放
  useEffect(() => {
    if (!rfInstance) {
      // 即使在条件不满足时也保持相同的hook调用顺序
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
  }, [rfInstance]);

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

  // 拖拽结束
  const onNodeDragStop = useCallback((event: React.MouseEvent, node: ReactFlowNode) => {
    console.log('🎯 拖拽结束:', node.id);

    const currentNode = reactFlowInstance?.getNode(node.id);
    if (!currentNode) {
      isDraggingRef.current = false;
      return;
    }

    const safePosition = {
      x: safeNumber(currentNode.position.x),
      y: safeNumber(currentNode.position.y)
    };

    console.log('💾 最终保存位置:', safePosition);

    // 更新节点位置（所有节点统一处理）
    updateNodePosition(node.id, safePosition);

    // 延迟重置拖拽状态，确保更新完成
    setTimeout(() => {
      isDraggingRef.current = false;
      lastDraggedNodeRef.current = null;
    }, 100);
  }, [reactFlowInstance, updateNodePosition]);

  // MiniMap 节点颜色
  const nodeColor = useCallback((node: ReactFlowNode) => {
    return node.type === 'group' ? '#e0e7ff' : '#93c5fd';
  }, []);

  // 清理定时器
  useEffect(() => {
    return () => {
      Object.values(resizeTimeoutRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
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
            changes.forEach((change: EdgeChange) => {
              if (change.type === 'remove') {
                deleteEdge(change.id);
                if (selectedEdgeId === change.id) {
                  setSelectedEdgeId(null);
                }
              }
            });
          }}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onNodesChange={(changes) => {
            onNodesChange(changes);
            
            changes.forEach((change: NodeChange) => {
              if (change.type === 'remove') {
                deleteNode(change.id);
                if (selectedNodeId === change.id) {
                  setSelectedNodeId(null);
                }
              }
              
              if (change.type === 'dimensions' && change.dimensions && !change.resizing) {
                if (resizeTimeoutRef.current[change.id]) {
                  clearTimeout(resizeTimeoutRef.current[change.id]);
                }
                
                resizeTimeoutRef.current[change.id] = setTimeout(() => {
                  const currentNode = reactFlowInstance?.getNode(change.id);
                  
                  if (currentNode) {
                    const newWidth = safeNumber(change.dimensions!.width, 350);
                    const newHeight = safeNumber(change.dimensions!.height, 280);

                    // 🔧 同时更新 width/height 和 style,确保 ReactFlow 正确渲染
                    updateNode(change.id, {
                      width: newWidth,
                      height: newHeight,
                      style: {
                        ...(currentNode.style || {}),
                        width: newWidth,
                        height: newHeight,
                      }
                    });

                    // 新架构：不再需要手动更新边界，父子关系会自动处理
                  }
                  
                  delete resizeTimeoutRef.current[change.id];
                }, 100);
              }
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