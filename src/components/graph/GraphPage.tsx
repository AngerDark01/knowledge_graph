'use client';

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  BackgroundVariant,
  Panel,
  useReactFlow,
  ReactFlowInstance,
  EdgeRemoveChange,
  NodeChange,
  NodeDragHandler,
  NodeMouseHandler,
  EdgeMouseHandler,
  EdgeChange,
  ConnectionMode,
  ReactFlowJsonObject,
} from 'reactflow';
import { Group } from '@/types/graph/models';
import 'reactflow/dist/style.css';

import CustomNode from '@/components/graph/CustomNode';
import CustomEdge from '@/components/graph/CustomEdge';
import CustomGroup from '@/components/graph/CustomGroup';
import NodeEditor from '@/components/graph/NodeEditor';
import EdgeEditor from '@/components/graph/EdgeEditor';
import { useGraphStore } from '@/stores/graph';
import { Button } from '@/components/ui/button';

// 定义节点和边类型映射 - 在组件外部定义以避免重复创建
const nodeTypes = {
  custom: CustomNode,
  group: CustomGroup,
};

const edgeTypes = {
  default: CustomEdge,
};



interface GraphPageProps {
  className?: string;
}

const GraphPageContent = ({ className }: GraphPageProps) => {
  const reactFlowInstance = useReactFlow();
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [zoomValue, setZoomValue] = useState<number>(1);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  
  const {
    nodes,
    edges,
    addNode,
    addEdge,
    deleteEdge,
    updateNode,
  } = useGraphStore();

  // 将 store 中的 nodes 和 edges 同步到 ReactFlow 状态
  const [reactFlowNodes, setReactFlowNodes, onNodesChange] = useNodesState([]);
  const [reactFlowEdges, setReactFlowEdges, onEdgesChange] = useEdgesState([]);

  // 添加节点的处理函数
  const onNodeAdd = useCallback(() => {
    // 如果当前有选中的群组，将节点添加到该群组中
    const selectedGroup = nodes.find(n => n.id === selectedNodeId && n.type === 'group') as Group;
    
    let position;
    let groupId;
    
    if (selectedGroup) {
      // 如果有选中的群组，将节点放在群组内部的随机位置
      const groupBoundary = {
        minX: selectedGroup.position.x + 20,
        minY: selectedGroup.position.y + 50, // 为标题留出空间
        maxX: selectedGroup.position.x + (selectedGroup.width || 300) - 170, // 考虑节点宽度
        maxY: selectedGroup.position.y + (selectedGroup.height || 200) - 120  // 考虑节点高度
      };
      
      // 确保边界有效
      if (groupBoundary.maxX > groupBoundary.minX && groupBoundary.maxY > groupBoundary.minY) {
        position = {
          x: groupBoundary.minX + Math.random() * (groupBoundary.maxX - groupBoundary.minX),
          y: groupBoundary.minY + Math.random() * (groupBoundary.maxY - groupBoundary.minY)
        };
        groupId = selectedGroup.id;
      } else {
        // 如果群组边界无效，使用默认位置
        position = { x: Math.random() * 400, y: Math.random() * 400 };
      }
    } else {
      // 没有选中群组时，使用默认位置
      position = { x: Math.random() * 400, y: Math.random() * 400 };
    }
    
    const newNode = {
      id: `node_${Date.now()}`,
      type: 'custom',
      position,
      data: { 
        title: `Node ${reactFlowNodes.length + 1}`, 
        content: 'Double click to edit' 
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      ...(groupId && { groupId, parentId: groupId }), // 设置群组ID和parentId
    } as const;
    
    addNode(newNode);
  }, [addNode, reactFlowNodes.length, nodes, selectedNodeId]);

  // 添加群组的处理函数
  const onGroupAdd = useCallback(() => {
    const newGroup = {
      id: `group_${Date.now()}`,
      type: 'group',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { 
        title: `Group ${nodes.filter(n => n.type === 'group').length + 1}`, 
        content: 'Drag nodes here to add them to the group' 
      },
      title: `Group ${nodes.filter(n => n.type === 'group').length + 1}`,
      content: 'Drag nodes here to add them to the group',
      collapsed: false,
      nodeIds: [],
      boundary: { minX: 0, minY: 0, maxX: 300, maxY: 200 },
      createdAt: new Date(),
      updatedAt: new Date(),
    } as const;
    
    addNode(newGroup);
  }, [addNode, nodes]);

  // 处理连接
  const onConnect = useCallback(
    (params: Connection) => {
      // 验证连接：避免自连接和重复连接
      if (params.source === params.target) {
        console.log("Self-connection is not allowed");
        return;
      }
      
      // 检查是否已存在相同的连接
      const duplicate = edges.some((edge: Edge) => 
        edge.source === params.source && 
        edge.target === params.target
      );
      
      if (duplicate) {
        console.log("Duplicate connection is not allowed");
        return;
      }

      const newEdge = {
        id: `edge_${Date.now()}`,
        ...params,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addEdge(newEdge);
    },
    [addEdge, edges]
  );

  // 处理节点拖拽
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // 处理节点放置
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `node_${Date.now()}`,
        type: 'custom',
        position,
        data: { 
          title: `New Node`, 
          content: 'Double click to edit' 
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as const;

      addNode(newNode);
    },
    [reactFlowInstance, addNode]
  );

  // 处理节点移动到群组内部
  const onNodeMove = useCallback((nodeId: string, groupId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    const group = nodes.find(n => n.id === groupId) as Group;
    
    if (node && group) {
      // 检查节点是否已经在该群组中，避免重复添加
      if (node.groupId === groupId) {
        console.log(`Node ${nodeId} is already in group ${groupId}`);
        return;
      }
      
      // 将节点添加到群组
      const { addNodeToGroup, updateGroupBoundary } = useGraphStore.getState();
      addNodeToGroup(nodeId, groupId);
      
      // 确保节点在群组边界内
      const groupBoundary = {
        minX: group.position.x,
        minY: group.position.y,
        maxX: group.position.x + (group.width || 300),
        maxY: group.position.y + (group.height || 200)
      };

      // 考虑节点尺寸，这里假设节点大小为固定值
      const nodeWidth = 150; // 节点宽度的估算值
      const nodeHeight = 100; // 节点高度的估算值

      // 如果节点位置超出了群组边界，将其约束在边界内
      const constrainedPosition = {
        x: Math.max(
          groupBoundary.minX,
          Math.min(node.position.x, groupBoundary.maxX - nodeWidth)
        ),
        y: Math.max(
          groupBoundary.minY,
          Math.min(node.position.y, groupBoundary.maxY - nodeHeight)
        )
      };

      // 更新节点位置
      if (constrainedPosition.x !== node.position.x || constrainedPosition.y !== node.position.y) {
        const { updateNode } = useGraphStore.getState();
        updateNode(nodeId, {
          position: constrainedPosition
        });
      }
      
      // 更新群组边界
      setTimeout(() => {
        updateGroupBoundary(groupId);
      }, 0);
    }
  }, [nodes]);

  // 处理节点从群组移出
  const onNodeRemoveFromGroup = useCallback((nodeId: string) => {
    // 将节点从群组中移出
    const { removeNodeFromGroup } = useGraphStore.getState();
    removeNodeFromGroup(nodeId);
  }, []);

  // 检查节点位置是否在群组边界内
  const isPositionInGroupBoundary = useCallback((position: { x: number; y: number }, groupId: string) => {
    const group = nodes.find(n => n.id === groupId) as Group;
    if (!group) return false;

    const groupBoundary = {
      minX: group.position.x,
      minY: group.position.y,
      maxX: group.position.x + (group.width || 300),
      maxY: group.position.y + (group.height || 200)
    };

    // 考虑节点尺寸，这里假设节点大小为固定值
    const nodeWidth = 150; // 节点宽度的估算值
    const nodeHeight = 100; // 节点高度的估算值

    return (
      position.x >= groupBoundary.minX &&
      position.x + nodeWidth <= groupBoundary.maxX &&
      position.y >= groupBoundary.minY &&
      position.y + nodeHeight <= groupBoundary.maxY
    );
  }, [nodes]);

  // 处理群组子节点拖拽限制，参考Dify的实现
  const restrictNodePositionToGroup = useCallback((node: Node) => {
    // 如果节点属于某个群组，检查边界约束
    if (node.parentId) { // 使用parentId而不是groupId
      // 获取群组信息
      const group = nodes.find(n => n.id === node.parentId) as Group;
      if (group) {
        // 群组的内边距，参考Dify的ITERATION_PADDING
        const padding = { top: 10, left: 10, right: 10, bottom: 10 };

        const restrictPosition: { x?: number; y?: number } = { x: undefined, y: undefined };

        // 检查边界约束
        if (node.position.y < padding.top) {
          restrictPosition.y = padding.top;
        }
        if (node.position.x < padding.left) {
          restrictPosition.x = padding.left;
        }
        if (node.position.x + (node.width || 150) > (group.width || 300) - padding.right) {
          restrictPosition.x = (group.width || 300) - padding.right - (node.width || 150);
        }
        if (node.position.y + (node.height || 100) > (group.height || 200) - padding.bottom) {
          restrictPosition.y = (group.height || 200) - padding.bottom - (node.height || 100);
        }

        return restrictPosition;
      }
    }
    return { x: undefined, y: undefined };
  }, [nodes]);

  // 处理群组拖拽，同步移动内部节点
  const onGroupDrag = useCallback((event: React.MouseEvent, group: Group) => {
    // 获取群组内的所有节点
    const groupNodes = nodes.filter(node => node.groupId === group.id);
    
    // 计算群组移动的偏移量
    const offsetX = group.position.x - (group as any).computedPosition?.x || 0;
    const offsetY = group.position.y - (group as any).computedPosition?.y || 0;

    // 更新群组内所有节点的位置
    groupNodes.forEach(node => {
      const { updateNode } = useGraphStore.getState();
      updateNode(node.id, {
        position: {
          x: node.position.x + offsetX,
          y: node.position.y + offsetY
        }
      });
    });
    
    // 更新群组的计算位置
    (group as any).computedPosition = { ...group.position };
  }, [nodes]);

  // 同步 store 状态到 ReactFlow 状态，处理群组-节点关系
  useEffect(() => {
    // 将群组的nodeIds转换为parentId形式
    const processedNodes = nodes.map(node => {
      if (node.type === 'group') {
        // 群组节点本身
        return {
          ...node,
          type: 'group',
        };
      } else {
        // 普通节点，如果属于某个群组，设置parentId
        return {
          ...node,
          parentId: node.groupId,
        };
      }
    });
    setReactFlowNodes(processedNodes as Node[]);
  }, [nodes, setReactFlowNodes]);

  useEffect(() => {
    setReactFlowEdges(edges as Edge[]);
  }, [edges, setReactFlowEdges]);

  // 复位视图
  const onRecenter = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView();
    }
  }, [reactFlowInstance]);

  // 清除画布
  const onClear = useCallback(() => {
    // 清除所有节点和边
    // 注意：实际应用中可能需要添加确认对话框
    const { getNodes, getEdges, deleteNode, deleteEdge } = useGraphStore.getState();
    getNodes().forEach((node: Node | Group) => deleteNode(node.id));
    getEdges().forEach((edge: Edge) => deleteEdge(edge.id));
  }, []);

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

  // 处理键盘快捷键
  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '0':
            e.preventDefault();
            onRecenter();
            break;
          case '+':
          case '=':
            e.preventDefault();
            if (reactFlowInstance) {
              reactFlowInstance.zoomIn();
            }
            break;
          case '-':
            e.preventDefault();
            if (reactFlowInstance) {
              reactFlowInstance.zoomOut();
            }
            break;
        }
      }

      // Delete 键删除选中的节点或边
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (reactFlowInstance) {
          // 删除选中的节点
          const selectedNodes = reactFlowInstance.getNodes().filter((node: Node) => node.selected);
          selectedNodes.forEach((node: Node) => {
            // 需要同时删除关联的边
            const { getEdges, deleteEdge } = useGraphStore.getState();
            getEdges().forEach((edge: Edge) => {
              if (edge.source === node.id || edge.target === node.id) {
                deleteEdge(edge.id);
              }
            });
            // 删除节点
            const { deleteNode } = useGraphStore.getState();
            deleteNode(node.id);
          });
          
          // 删除选中的边
          const selectedEdges = reactFlowInstance.getEdges().filter((edge: Edge) => edge.selected);
          selectedEdges.forEach((edge: Edge) => {
            deleteEdge(edge.id);
          });
        }
      }
    };

    window.addEventListener('keydown', keyHandler);
    return () => window.removeEventListener('keydown', keyHandler);
  }, [onRecenter]);

  // 处理节点选择
  const onNodeClick = useCallback((e: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null); // 取消边的选择
  }, []);

  // 处理节点双击
  const onNodeDoubleClick = useCallback((e: React.MouseEvent, node: Node) => {
    // 设置为选中状态以便编辑
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null); // 取消边的选择
  }, []);

  // 处理边选择
  const onEdgeClick = useCallback((e: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null); // 取消节点的选择
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
        
        <div className="mt-6 space-y-2">
          <Button className="w-full" onClick={onNodeAdd}>
            Add Node
          </Button>
          <Button className="w-full" variant="outline" onClick={onGroupAdd}>
            Add Group
          </Button>
          <Button className="w-full" variant="outline" onClick={onRecenter}>
            Recenter View
          </Button>
          <Button className="w-full text-red-500 border-red-500" variant="outline" onClick={onClear}>
            Clear All
          </Button>
        </div>
      </div>
      
      {/* 主画布区域 */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={reactFlowNodes}
          edges={reactFlowEdges}
          onNodesChange={(changes) => {
            // 处理节点选择变化
            changes.forEach((change: NodeChange) => {
              if (change.type === 'select' && change.selected && change.id) {
                setSelectedNodeId(change.id);
                setSelectedEdgeId(null); // 取消边的选择
              }
            });
            
            onNodesChange(changes);
          }}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onEdgeClick={onEdgeClick}
          fitView
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          attributionPosition="bottom-left"
          minZoom={0.1}
          maxZoom={2}
          elementsSelectable={true}
          multiSelectionKeyCode={['Shift']}
          onEdgesChange={(changes) => {
            // 处理边的选择和删除
            changes.forEach((change: EdgeChange) => {
              if (change.type === 'select' && change.selected && change.id) {
                setSelectedEdgeId(change.id);
                setSelectedNodeId(null); // 取消节点的选择
              }
              if (change.type === 'remove') {
                deleteEdge(change.id);
                if (selectedEdgeId === change.id) {
                  setSelectedEdgeId(null); // 清除已删除边的选择状态
                }
              }
            });
            onEdgesChange(changes);
          }}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onNodeDragStop={(event, node) => {
            // 如果节点属于某个群组，检查节点是否超出了群组边界
            const restrictPosition = restrictNodePositionToGroup(node);
            
            if (restrictPosition.x !== undefined || restrictPosition.y !== undefined) {
              // 如果节点超出了边界，将其位置约束在边界内
              const constrainedPosition = {
                ...node.position,
                ...(restrictPosition.x !== undefined && { x: restrictPosition.x }),
                ...(restrictPosition.y !== undefined && { y: restrictPosition.y }),
              };

              // 更新节点位置
              const { updateNode } = useGraphStore.getState();
              updateNode(node.id, {
                position: constrainedPosition
              });
            }
          }}
          onNodeDrag={(event, node) => {
            // 处理节点拖拽边界约束
            const restrictPosition = restrictNodePositionToGroup(node);
            
            // 如果需要限制位置，这里可以给用户视觉反馈
            if (restrictPosition.x !== undefined || restrictPosition.y !== undefined) {
              // 可以添加一些视觉反馈提示节点超出边界
            }
          }}
          onNodesChange={(changes) => {
            // 处理节点选择变化
            changes.forEach((change: NodeChange) => {
              if (change.type === 'select' && change.selected && change.id) {
                setSelectedNodeId(change.id);
                setSelectedEdgeId(null); // 取消边的选择
              }
            });
            
            // 应用原有的节点变化
            onNodesChange(changes);
            
            // 处理节点位置变化，实现群组同步移动
            changes.forEach((change: NodeChange) => {
              if (change.type === 'position' && change.position && change.node) {
                if (change.node.type === 'group') {
                  // 如果移动的是群组，同步移动其内部的节点
                  const group = change.node as Group;
                  const groupNodes = nodes.filter(node => node.groupId === group.id);
                  
                  // 计算群组移动的偏移量
                  const previousPosition = change?.previousPosition || group.position;
                  const offsetX = change.position.x - previousPosition.x;
                  const offsetY = change.position.y - previousPosition.y;

                  // 更新群组内所有节点的位置，保持相对位置关系
                  groupNodes.forEach(node => {
                    const { updateNode } = useGraphStore.getState();
                    updateNode(node.id, {
                      position: {
                        x: node.position.x + offsetX,
                        y: node.position.y + offsetY
                      }
                    });
                  });
                }
              }
            });
          }}
          onInit={(instance) => {
            setRfInstance(instance);
            setTimeout(() => {
              if (reactFlowInstance) {
                reactFlowInstance.fitView();
              }
            }, 0);
          }}
          fitView
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          attributionPosition="bottom-left"
          minZoom={0.1}
          maxZoom={2}
          elementsSelectable={true}
          multiSelectionKeyCode={['Shift']}
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Controls showInteractive={false} />
          <MiniMap />
          {/* 缩放比例指示器 */}
          <Panel position="bottom-right" className="bg-white/80 dark:bg-gray-800/80 p-2 rounded-md">
            <div className="text-sm font-mono">
              {(zoomValue * 100).toFixed(0)}%
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};

const GraphPage = ({ className }: GraphPageProps) => {
  return (
    <ReactFlowProvider>
      <GraphPageContent className={className} />
    </ReactFlowProvider>
  );
};

export default GraphPage;