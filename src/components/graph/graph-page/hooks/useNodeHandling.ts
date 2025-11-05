import { useCallback, useState } from 'react';
import { useReactFlow } from 'reactflow';
import { useGraphStore } from '@/stores/graph';
import { Node, Group, BlockEnum } from '@/types/graph/models';

export const useNodeHandling = () => {
  const reactFlowInstance = useReactFlow();
  const { nodes, addNode, setSelectedNodeId } = useGraphStore();
  
  const onNodeAdd = useCallback(() => {
    // 如果当前有选中的群组，将节点添加到该群组中
    const selectedGroup = nodes.find((n: Node | Group) => n.id === useGraphStore.getState().selectedNodeId && n.type === BlockEnum.GROUP) as Group;
    
    let position;
    let groupId;
    
    if (selectedGroup) {
      // 如果有选中的群组，将节点放在群组内部的固定位置（左上角偏移）
      const groupBoundary = {
        minX: selectedGroup.position.x + 20,
        minY: selectedGroup.position.y + 50, // 为标题留出空间
        maxX: selectedGroup.position.x + (selectedGroup.width || 300) - 170, // 考虑节点宽度
        maxY: selectedGroup.position.y + (selectedGroup.height || 200) - 120  // 考虑节点高度
      };
      
      // 确保边界有效
      if (groupBoundary.maxX > groupBoundary.minX && groupBoundary.maxY > groupBoundary.minY) {
        position = {
          x: groupBoundary.minX + 20, // 固定偏移，而不是随机位置
          y: groupBoundary.minY + 20  // 固定偏移，而不是随机位置
        };
        groupId = selectedGroup.id;
      } else {
        // 如果群组边界无效，使用默认位置
        position = { x: selectedGroup.position.x + 50, y: selectedGroup.position.y + 50 };
      }
    } else {
      // 没有选中群组时，在当前视图中心偏移处创建节点
      const viewPort = reactFlowInstance?.getViewport();
      position = {
        x: viewPort ? viewPort.x + 200 : 100, // 相对于视图的位置，而不是完全随机
        y: viewPort ? viewPort.y + 100 : 100  // 相对于视图的位置，而不是完全随机
      };
    }
    
    // 获取当前节点数量用于标题，但不作为依赖项
    const nodeCount = nodes.filter((n: Node | Group) => n.type === BlockEnum.NODE).length;
    
    const newNode: Node = {
      id: `node_${Date.now()}`,
      type: BlockEnum.NODE,
      position, // 使用计算好的位置
      data: { 
        title: `Node ${nodeCount + 1}`, 
        content: 'Double click to edit' 
      },
      title: `Node ${nodeCount + 1}`, // 必需字段
      content: 'Double click to edit', // 必需字段
      groupId: groupId,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...(groupId && { groupId, parentId: groupId }), // 设置群组ID和parentId
    };
    
    addNode(newNode);
    setSelectedNodeId(newNode.id);
  }, [addNode, nodes, setSelectedNodeId, reactFlowInstance]);

  // 添加群组的处理函数
  const onGroupAdd = useCallback(() => {
    // 在当前视图中心偏移处创建群组
    const viewPort = reactFlowInstance?.getViewport();
    const newGroup: Group = {
      id: `group_${Date.now()}`,
      type: BlockEnum.GROUP,
      position: {
        x: viewPort ? viewPort.x + 200 : 100, // 相对于视图的位置
        y: viewPort ? viewPort.y + 100 : 100
      },
      data: { 
        title: `Group ${(nodes as (Node | Group)[]).filter((n: Node | Group) => n.type === BlockEnum.GROUP).length + 1}`, 
        content: 'Drag nodes here to add them to the group' 
      },
      title: `Group ${(nodes as (Node | Group)[]).filter((n: Node | Group) => n.type === BlockEnum.GROUP).length + 1}`,
      content: 'Drag nodes here to add them to the group',
      collapsed: false,
      nodeIds: [],
      boundary: { minX: 0, minY: 0, maxX: 300, maxY: 200 },
      createdAt: new Date(),
      updatedAt: new Date(),
      // 关键：必须设置初始尺寸
      width: 300,
      height: 200,
    };
    
    addNode(newGroup);
    setSelectedNodeId(newGroup.id);
  }, [addNode, nodes, setSelectedNodeId, reactFlowInstance]);

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

      const newNode: Node = {
        id: `node_${Date.now()}`,
        type: BlockEnum.NODE,
        position,
        data: { 
          title: `New Node`, 
          content: 'Double click to edit' 
        },
        title: 'New Node',
        content: 'Double click to edit',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addNode(newNode);
      setSelectedNodeId(newNode.id);
    },
    [reactFlowInstance, addNode, setSelectedNodeId]
  );

  // 处理节点移动到群组内部
  const onNodeMove = useCallback((nodeId: string, groupId: string) => {
    const node = nodes.find((n: Node | Group): n is Node => n.id === nodeId && n.type === BlockEnum.NODE);
    const group = nodes.find((n: Node | Group) => n.id === groupId) as Group;
    
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

  return {
    onNodeAdd,
    onGroupAdd,
    onDragOver,
    onDrop,
    onNodeMove,
    onNodeRemoveFromGroup
  };
};