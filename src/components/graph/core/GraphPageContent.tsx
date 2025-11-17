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
    handleGroupMove,
    updateGroupBoundary,
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
      return;
    }

    const processedNodes = syncStoreToReactFlowNodes(storeNodes, selectedNodeId);
    setReactFlowNodes(processedNodes as ReactFlowNode[]);
  }, [storeNodes, selectedNodeId, setReactFlowNodes]);

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
    isDraggingRef.current = true;
    lastDraggedNodeRef.current = node.id;
  }, []);

  // 拖拽结束
  const onNodeDragStop = useCallback((event: React.MouseEvent, node: ReactFlowNode) => {
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
        }
      }

      handleGroupMove(node.id, absolutePosition);

      // 🔧 如果是嵌套群组，更新父群组边界
      if (storeGroup.groupId) {
        // ⚡ 性能优化: 使用 requestAnimationFrame 延迟执行，避免阻塞主线程
        requestAnimationFrame(() => {
          updateGroupBoundary(storeGroup.groupId!);
        });
      }

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
          absolutePosition = {
            x: Number(currentNode.position.x) + Number(parentGroup.position.x),
            y: Number(currentNode.position.y) + Number(parentGroup.position.y)
          };
        }
      }

      // 先更新位置
      updateNodePosition(node.id, absolutePosition);

      // 如果节点属于群组，更新群组边界
      if (storeNode.groupId) {
        // ⚡ 性能优化: 使用 requestAnimationFrame 延迟执行
        requestAnimationFrame(() => {
          updateGroupBoundary(storeNode.groupId!);
        });
      }

      // ⚡ 性能优化: 使用 requestAnimationFrame 延迟重置状态
      requestAnimationFrame(() => {
        isDraggingRef.current = false;
        lastDraggedNodeRef.current = null;
      });
    }
  }, [reactFlowInstance, storeNodes, handleGroupMove, updateNodePosition, updateGroupBoundary]);

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

                      setTimeout(() => {
                        updateGroupBoundary(change.id);

                        // 🔧 如果是嵌套群组，同时更新父群组边界
                        if (storeGroup?.groupId) {
                          setTimeout(() => {
                            console.log('📐 调整大小后更新父群组边界:', storeGroup.groupId);
                            updateGroupBoundary(storeGroup.groupId!);
                          }, 50);
                        }
                      }, 50);
                    }
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