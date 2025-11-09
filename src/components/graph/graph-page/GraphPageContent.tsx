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

import { NoteNode, GroupNode } from '../node';
import CustomEdge from '../CustomEdge';
import CrossGroupEdge from '../CrossGroupEdge';
import NodeEditor from '../NodeEditor';
import EdgeEditor from '../EdgeEditor';
import EdgeFilterControl from '../EdgeFilterControl';
import HistoryControl from '../HistoryControl';
import { useGraphStore } from '@/stores/graph';
import { GraphConfig } from '@/config/graph.config';
import { findCommonAncestor } from '@/utils/graph/nesting';

import { useNodeHandling } from './hooks/useNodeHandling';
import { useEdgeHandling } from './hooks/useEdgeHandling';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useViewportControls } from './hooks/useViewportControls';
import { ZoomIndicator } from './components/ZoomIndicator';
import { Toolbar } from './components/Toolbar';

interface GraphPageProps {
  className?: string;
}

// 使用配置文件中的常量
const GROUP_PADDING = GraphConfig.groupPadding;
const NODE_VISUAL_PADDING = GraphConfig.nodeVisualPadding;

// 安全数值验证
const safeNumber = (value: any, defaultValue: number = 0): number => {
  const num = Number(value);
  return typeof num === 'number' && !isNaN(num) && isFinite(num) ? num : defaultValue;
};

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

  // 转换为相对坐标
  const convertToRelativePosition = useCallback((node: Node | Group, parentGroup?: Group) => {
    if (!parentGroup) return node.position;
    
    return {
      x: safeNumber(node.position.x) - safeNumber(parentGroup.position.x),
      y: safeNumber(node.position.y) - safeNumber(parentGroup.position.y)
    };
  }, [safeNumber]);

  // 转换为绝对坐标
  const convertToAbsolutePosition = useCallback((relativePos: { x: number; y: number }, parentGroup: Group) => {
    return {
      x: safeNumber(relativePos.x) + safeNumber(parentGroup.position.x),
      y: safeNumber(relativePos.y) + safeNumber(parentGroup.position.y)
    };
  }, [safeNumber]);

  // 同步store到ReactFlow
  useEffect(() => {
    // 如果正在拖拽，跳过同步以避免覆盖用户操作
    if (isDraggingRef.current) {
      console.log('⏸️ 拖拽中，跳过同步');
      return;
    }

    const processedNodes = storeNodes.map((node: Node | Group) => {
      const isGroup = node.type === BlockEnum.GROUP;
      
      if (isGroup) {
        const groupNode = node as Group;

        // ✅ 支持嵌套群组：如果群组有 groupId，需要设置 parentId
        const parentGroup = groupNode.groupId
          ? storeNodes.find(n => n.id === groupNode.groupId) as Group
          : undefined;

        const safeGroupPosition = {
          x: safeNumber(groupNode.position.x),
          y: safeNumber(groupNode.position.y),
        };

        // 如果在父群组内，使用相对坐标
        const position = parentGroup
          ? convertToRelativePosition({ ...groupNode, position: safeGroupPosition }, parentGroup)
          : safeGroupPosition;

        const finalPosition = {
          x: safeNumber(position.x),
          y: safeNumber(position.y),
        };

        return {
          ...groupNode,
          id: groupNode.id,
          type: 'group',
          position: finalPosition,
          selected: node.id === selectedNodeId,
          draggable: true,
          ...(groupNode.groupId && {
            parentId: groupNode.groupId,
            extent: 'parent' as const,
            expandParent: true,
          }),
          style: {
            ...groupNode.style,
            width: safeNumber(groupNode.width, GraphConfig.nodeSize.group.default.width),
            height: safeNumber(groupNode.height, GraphConfig.nodeSize.group.default.height),
          },
          data: {
            ...groupNode.data,
            title: groupNode.title,
            content: groupNode.content,
            summary: groupNode.summary,
            tags: groupNode.tags,
            attributes: groupNode.attributes,
            validationError: groupNode.validationError,
          },
        };
      } else {
        const regularNode = node as Node & { groupId?: string };
        const parentGroup = regularNode.groupId 
          ? storeNodes.find(n => n.id === regularNode.groupId) as Group
          : undefined;
        
        const safeNodePosition = {
          x: safeNumber(regularNode.position.x),
          y: safeNumber(regularNode.position.y),
        };
        
        // 如果在群组内，使用相对坐标
        const position = parentGroup
          ? convertToRelativePosition({ ...regularNode, position: safeNodePosition }, parentGroup)
          : safeNodePosition;
        
        const finalPosition = {
          x: safeNumber(position.x),
          y: safeNumber(position.y),
        };
        
        return {
          ...regularNode,
          id: regularNode.id,
          type: 'custom',
          position: finalPosition,
          selected: node.id === selectedNodeId,
          draggable: true,
          ...(regularNode.groupId && { 
            parentId: regularNode.groupId,
            extent: 'parent' as const,
            expandParent: true,
          }),
          style: {
            ...(regularNode as any).style,
            width: safeNumber(regularNode.width, GraphConfig.nodeSize.note.collapsed.width),
            height: safeNumber(regularNode.height, GraphConfig.nodeSize.note.collapsed.height),
          },
          data: {
            ...regularNode.data,
            title: regularNode.title,
            content: regularNode.content,
            summary: regularNode.summary,
            tags: regularNode.tags,
            attributes: regularNode.attributes,
            validationError: regularNode.validationError,
          },
        };
      }
    });
    
    console.log('🔄 同步节点到ReactFlow:', processedNodes.length);
    setReactFlowNodes(processedNodes as ReactFlowNode[]);
  }, [storeNodes, selectedNodeId, setReactFlowNodes, convertToRelativePosition]);

  // 同步边
  useEffect(() => {
    const processedEdges = edges
      .filter(edge => visibleEdgeIds.length === 0 || visibleEdgeIds.includes(edge.id)) // 根据可见性过滤
      .map(edge => {
        // 检查边的源节点和目标节点
        const sourceNode = storeNodes.find(n => n.id === edge.source) as Node | Group | undefined;
        const targetNode = storeNodes.find(n => n.id === edge.target) as Node | Group | undefined;

        // ✅ 增强的跨群组检测：支持嵌套群组
        let isCrossGroup = false;
        let isInSameGroup = false;

        if (sourceNode && targetNode) {
          const sourceHasGroup = 'groupId' in sourceNode && sourceNode.groupId;
          const targetHasGroup = 'groupId' in targetNode && targetNode.groupId;

          if (sourceHasGroup && targetHasGroup) {
            // 两个节点都在群组内
            isInSameGroup = sourceNode.groupId === targetNode.groupId;
            isCrossGroup = !isInSameGroup;
          } else if (sourceHasGroup || targetHasGroup) {
            // 一个在群组内，一个在群组外
            isCrossGroup = true;
            isInSameGroup = false;
          }
        }

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

    if (currentNode.type === 'group') {
      const storeGroup = storeNodes.find(n => n.id === node.id) as Group;

      let absolutePosition = {
        x: safeNumber(currentNode.position.x),
        y: safeNumber(currentNode.position.y)
      };

      // ✅ 如果群组在父群组内，转换为绝对坐标
      if (storeGroup && storeGroup.groupId) {
        const parentGroup = storeNodes.find(n => n.id === storeGroup.groupId) as Group;
        if (parentGroup) {
          absolutePosition = convertToAbsolutePosition(currentNode.position, parentGroup);
          console.log('📍 群组 相对→绝对:', currentNode.position, '→', absolutePosition);
          console.log('  父群组位置:', parentGroup.position);
        }
      }

      handleGroupMove(node.id, absolutePosition);

      // ✅ 如果群组属于父群组，更新父群组边界
      if (storeGroup && storeGroup.groupId) {
        updateGroupBoundary(storeGroup.groupId);
      }

      isDraggingRef.current = false;
    } else {
      const storeNode = storeNodes.find(n => n.id === node.id) as Node;
      if (!storeNode) {
        isDraggingRef.current = false;
        return;
      }

      let absolutePosition = {
        x: safeNumber(currentNode.position.x),
        y: safeNumber(currentNode.position.y)
      };
      
      if (storeNode.groupId) {
        const parentGroup = storeNodes.find(n => n.id === storeNode.groupId) as Group;
        if (parentGroup) {
          absolutePosition = convertToAbsolutePosition(currentNode.position, parentGroup);
          console.log('📍 相对→绝对:', currentNode.position, '→', absolutePosition);
          console.log('  父群组位置:', parentGroup.position);
        }
      }
      
      console.log('💾 最终保存位置:', absolutePosition);
      
      // 先更新位置
      updateNodePosition(node.id, absolutePosition);
      
      // 如果节点属于群组，更新群组边界
      if (storeNode.groupId) {
        updateGroupBoundary(storeNode.groupId!);
      }
      
      // 延迟重置拖拽状态，确保更新完成
      setTimeout(() => {
        isDraggingRef.current = false;
        lastDraggedNodeRef.current = null;
      }, 100);
    }
  }, [reactFlowInstance, storeNodes, handleGroupMove, updateNodePosition, updateGroupBoundary, convertToAbsolutePosition]);

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
                    const defaultSize = currentNode.type === 'group'
                      ? GraphConfig.nodeSize.group.default
                      : GraphConfig.nodeSize.note.collapsed;
                    const newWidth = safeNumber(change.dimensions!.width, defaultSize.width);
                    const newHeight = safeNumber(change.dimensions!.height, defaultSize.height);
                    
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
                    
                    if (currentNode.type === 'group') {
                      setTimeout(() => {
                        updateGroupBoundary(change.id);
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