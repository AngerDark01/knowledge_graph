'use client';

import React, { useCallback, useEffect, useState } from 'react';
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

// 定义节点和边类型映射
const nodeTypes: import('reactflow').NodeTypes = {
  custom: CustomNode,
  group: CustomGroup,
};

const edgeTypes: import('reactflow').EdgeTypes = {
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
    const newNode = {
      id: `node_${Date.now()}`,
      type: 'custom',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { 
        title: `Node ${reactFlowNodes.length + 1}`, 
        content: 'Double click to edit' 
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    } as const;
    
    addNode(newNode);
  }, [addNode, reactFlowNodes.length]);

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
    // 将节点添加到群组
    const { addNodeToGroup } = useGraphStore.getState();
    addNodeToGroup(nodeId, groupId);
  }, []);

  // 处理节点从群组移出
  const onNodeRemoveFromGroup = useCallback((nodeId: string) => {
    // 将节点从群组中移出
    const { removeNodeFromGroup } = useGraphStore.getState();
    removeNodeFromGroup(nodeId);
  }, []);

  // 同步 store 状态到 ReactFlow 状态
  useEffect(() => {
    setReactFlowNodes(nodes as Node[]);
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
            // 检查节点是否被拖拽到群组内部
            const groups = nodes.filter(n => n.type === 'group') as Group[];
            for (const group of groups) {
              const groupBoundary = (group as any).boundary;
              if (
                node.position.x >= groupBoundary.minX &&
                node.position.x <= groupBoundary.maxX &&
                node.position.y >= groupBoundary.minY &&
                node.position.y <= groupBoundary.maxY
              ) {
                // 将节点添加到群组
                onNodeMove(node.id, group.id);
                break;
              }
            }
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