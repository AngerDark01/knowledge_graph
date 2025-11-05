import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  Edge as ReactFlowEdge,
  Node as ReactFlowNode,
  BackgroundVariant,
  Panel,
  useReactFlow,
  ReactFlowInstance,
  EdgeChange,
  NodeChange,
  ConnectionMode,
} from 'reactflow';
import { Group, Node, Edge, BlockEnum } from '@/types/graph/models';
import 'reactflow/dist/style.css';

import { NoteNode, GroupNode } from '../node';
import CustomEdge from '../CustomEdge';
import NodeEditor from '../NodeEditor';
import EdgeEditor from '../EdgeEditor';
import { useGraphStore } from '@/stores/graph';
import { Button } from '@/components/ui/button';

// 导入拆分的功能模块
import { useNodeHandling } from './hooks/useNodeHandling';
import { useEdgeHandling } from './hooks/useEdgeHandling';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useViewportControls } from './hooks/useViewportControls';
import { useSelectionHandling } from './hooks/useSelectionHandling';
import { ZoomIndicator } from './components/ZoomIndicator';
import { Toolbar } from './components/Toolbar';

// 导入工具函数
import { restrictNodePositionToGroup } from './utils/groupHandling';

interface GraphPageProps {
  className?: string;
}

const GraphPageContent = ({ className }: GraphPageProps) => {
  // 使用 useMemo 确保对象引用稳定
  const nodeTypes = useMemo(() => ({
    custom: NoteNode,
    group: GroupNode,
  }), []);

  const edgeTypes = useMemo(() => ({
    default: CustomEdge,
  }), []);
  
  const reactFlowInstance = useReactFlow();
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  
  // 跟踪调整大小的状态
  const resizeTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  
  const {
    nodes,
    edges,
    updateNode,
    deleteEdge,
    selectedNodeId,
    selectedEdgeId,
    setSelectedNodeId,
    setSelectedEdgeId
  } = useGraphStore();
  
  const [zoomValue, setZoomValue] = useState<number>(1);

  // 将 store 中的 nodes 和 edges 同步到 ReactFlow 状态
  const [reactFlowNodes, setReactFlowNodes, onNodesChange] = useNodesState([]);
  const [reactFlowEdges, setReactFlowEdges, onEdgesChange] = useEdgesState([]);

  // 使用拆分的 hooks
  const { onNodeAdd, onGroupAdd, onDragOver, onDrop } = useNodeHandling();
  const { onConnect } = useEdgeHandling();
  const { onRecenter, onClear } = useViewportControls();
  const { 
    onNodeClick, 
    onEdgeClick, 
    onNodeDoubleClick 
  } = useSelectionHandling();

  // 同步 store 状态到 ReactFlow 状态
  useEffect(() => {
    const processedNodes = nodes.map((node: Node | Group) => {
      if (node.type === BlockEnum.GROUP) {
        const groupNode = node as Group;
        return {
          ...groupNode,
          type: 'group',
          style: {
            ...groupNode.style,
            width: groupNode.width || 300,
            height: groupNode.height || 200,
          },
        };
      } else {
        const nodeWithGroupId = node as Node & { groupId?: string };
        return {
          ...node,
          type: 'custom', // 将 Node 类型设置为 'custom' 以匹配 nodeTypes 定义
          ...(nodeWithGroupId.groupId && { parentId: nodeWithGroupId.groupId }),
          style: {
            ...(node as any).style,
            width: node.width || undefined,
            height: node.height || undefined,
          },
        };
      }
    });
    setReactFlowNodes(processedNodes as ReactFlowNode[]);
  }, [nodes, setReactFlowNodes]);

  useEffect(() => {
    setReactFlowEdges(edges as ReactFlowEdge[]);
  }, [edges, setReactFlowEdges]);

  // 处理键盘快捷键
  useKeyboardShortcuts(onRecenter);

  // 监听缩放变化
  useEffect(() => {
    if (!rfInstance) return;

    const onZoom = () => {
      if (rfInstance) {
        const currentZoom = rfInstance.getZoom();
        setZoomValue(currentZoom);
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

  // 取消选择处理
  const clearSelection = useCallback(() => {
    if (rfInstance) {
      // 取消所有节点和边的选中状态
      rfInstance.getNodes().forEach(node => {
        if (node.selected) {
          rfInstance.setNodes(n => n.map(n => n.id === node.id ? { ...n, selected: false } : n));
        }
      });
      rfInstance.getEdges().forEach(edge => {
        if (edge.selected) {
          rfInstance.setEdges(e => e.map(e => e.id === edge.id ? { ...e, selected: false } : e));
        }
      });
    }
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, [rfInstance, setSelectedNodeId, setSelectedEdgeId]);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      Object.values(resizeTimeoutRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, []);

  return (
    <div className={`flex w-full h-full ${className || ''}`}>
      {/* 侧边栏 */}
      <div className="w-80 p-4 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Knowledge Graph Editor</h2>
        
        {selectedNodeId ? (
          <NodeEditor nodeId={selectedNodeId} />
        ) : selectedEdgeId ? (
          <EdgeEditor edgeId={selectedEdgeId} />
        ) : (
          <div className="text-gray-500 text-center py-10">
            Select a node or edge to edit its properties
          </div>
        )}
        
        <Toolbar 
          onNodeAdd={onNodeAdd} 
          onGroupAdd={onGroupAdd} 
          onRecenter={onRecenter} 
          onClear={onClear} 
        />
      </div>
      
      {/* 主画布区域 */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={reactFlowNodes}
          edges={reactFlowEdges}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          attributionPosition="bottom-left"
          minZoom={0.1}
          maxZoom={2}
          elementsSelectable={true}
          multiSelectionKeyCode={['Shift']}
          selectionOnDrag={true}
          selectNodesOnDrag={true}
          onPaneClick={clearSelection}
          onEdgesChange={(changes) => {
            // 处理边的选择和删除
            changes.forEach((change: EdgeChange) => {
              if (change.type === 'select' && change.selected && change.id) {
                setSelectedEdgeId(change.id);
                setSelectedNodeId(null);
              }
              if (change.type === 'remove') {
                deleteEdge(change.id);
                if (selectedEdgeId === change.id) {
                  setSelectedEdgeId(null);
                }
              }
            });
            onEdgesChange(changes);
          }}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onNodeDragStop={(event, node) => {
            // 如果节点属于某个群组，检查节点是否超出了群组边界
            const restrictPosition = restrictNodePositionToGroup(node, nodes as (Node | Group)[]);
            
            if (restrictPosition.x !== undefined || restrictPosition.y !== undefined) {
              // 如果节点超出了边界，将其位置约束在边界内
              const constrainedPosition = {
                ...node.position,
                ...(restrictPosition.x !== undefined && { x: restrictPosition.x }),
                ...(restrictPosition.y !== undefined && { y: restrictPosition.y }),
              };

              // 更新节点位置
              updateNode(node.id, {
                position: constrainedPosition
              });
            }
          }}
          onNodesChange={(changes) => {
            console.log('📋 onNodesChange触发，变化数量:', changes.length);
            
            // 首先应用所有变化到 ReactFlow（这样 UI 立即响应）
            onNodesChange(changes);
            
            // 然后处理需要同步到 store 的变化
            changes.forEach((change: NodeChange) => {
              // 处理选择变化
              if (change.type === 'select' && change.selected && change.id) {
                setSelectedNodeId(change.id);
                setSelectedEdgeId(null);
              }
              
              // 处理删除变化
              if (change.type === 'remove') {
                console.log(`🗑️ 删除节点: ${change.id}`);
                const { deleteNode } = useGraphStore.getState();
                deleteNode(change.id);
                if (selectedNodeId === change.id) {
                  setSelectedNodeId(null);
                }
              }
              
              // 处理尺寸变化 - 使用防抖，只在调整结束后更新 store
              if (change.type === 'dimensions' && change.dimensions) {
                // 清除之前的定时器
                if (resizeTimeoutRef.current[change.id]) {
                  clearTimeout(resizeTimeoutRef.current[change.id]);
                }
                
                // 如果还在调整中（resizing = true），不立即更新 store
                if (change.resizing) {
                  console.log(`🔄 节点 ${change.id} 正在调整大小...`);
                  return;
                }
                
                // 调整结束（resizing = false），延迟更新 store
                console.log(`✅ 节点 ${change.id} 调整大小结束:`, change.dimensions);
                
                resizeTimeoutRef.current[change.id] = setTimeout(() => {
                  const { updateNode, updateGroupBoundary } = useGraphStore.getState();
                  
                  // 获取当前节点的完整状态（包括位置）
                  const currentNode = reactFlowInstance?.getNode(change.id);
                  
                  if (currentNode) {
                    // 关键：明确保留位置，只更新尺寸
                    updateNode(change.id, {
                      position: currentNode.position,
                      width: change.dimensions!.width,
                      height: change.dimensions!.height,
                    });
                    
                    // 无论节点类型，都更新边界
                    setTimeout(() => {
                      updateGroupBoundary(change.id);
                    }, 50);
                  }
                  
                  // 清理定时器引用
                  delete resizeTimeoutRef.current[change.id];
                }, 100);
              }
              
              // 处理位置变化 - 立即保存移动后的位置
              if (change.type === 'position' && change.id) {
                // 拖拽结束时（dragging: false），获取节点当前位置并保存
                if ('dragging' in change && change.dragging === false) {
                  // 获取节点当前最终位置
                  const currentNode = reactFlowInstance?.getNode(change.id);
                  
                  if (currentNode) {
                    console.log(`🎯 拖拽结束 - 节点ID: ${change.id}, 最终位置:`, currentNode.position);
                    
                    // 检查是否是群组
                    if (currentNode.type === 'group') {
                      const group = currentNode as any;
                      const groupNodes = nodes.filter((node: Node | Group): node is Node => 
                        node.type === BlockEnum.NODE && 'groupId' in node && node.groupId === group.id
                      );
                      
                      // 更新群组本身的位置
                      updateNode(change.id, {
                        position: currentNode.position
                      });
                      
                      // 同时更新群组内的节点位置
                      groupNodes.forEach((node: Node) => {
                        const currentInnerNode = reactFlowInstance?.getNode(node.id);
                        if (currentInnerNode) {
                          updateNode(node.id, {
                            position: currentInnerNode.position
                          });
                        }
                      });
                    } else {
                      // 普通节点位置变化，保存到store
                      updateNode(change.id, {
                        position: currentNode.position
                      });
                    }
                  }
                }
              }
            });
          }}
          onInit={(instance) => {
            setRfInstance(instance);
          }}
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Controls showInteractive={false} />
          <MiniMap />
          <ZoomIndicator zoomValue={zoomValue} />
        </ReactFlow>
      </div>
    </div>
  );
};

export default GraphPageContent;