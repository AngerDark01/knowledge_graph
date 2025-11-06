import { useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import { useGraphStore } from '@/stores/graph';
import { Node, Group, BlockEnum } from '@/types/graph/models';

// 群组内边距常量 - 标题高度约40px，所以顶部需要更多空间
const GROUP_PADDING = { 
  top: 70,    // 增加顶部边距，避免与标题重叠
  left: 20, 
  right: 20, 
  bottom: 20 
};

// 安全的数值验证和默认值函数
const safeNumber = (value: any, defaultValue: number = 0): number => {
  const num = Number(value);
  return typeof num === 'number' && !isNaN(num) && isFinite(num) ? num : defaultValue;
};

// 🆕 根据节点类型获取默认尺寸
const getDefaultNodeSize = (nodeType: BlockEnum) => {
  if (nodeType === BlockEnum.NODE) {
    // NoteNode 的初始尺寸
    return { width: 350, height: 280 };
  } else if (nodeType === BlockEnum.GROUP) {
    return { width: 300, height: 200 };
  }
  return { width: 150, height: 100 };
};

export const useNodeHandling = () => {
  const reactFlowInstance = useReactFlow();
  const { 
    nodes, 
    addNode, 
    setSelectedNodeId, 
    selectedNodeId,
    updateGroupBoundary 
  } = useGraphStore();
  
  const onNodeAdd = useCallback(() => {
    console.log('➕ 创建新节点，当前选中:', selectedNodeId);
    
    // 检查当前是否有选中的群组
    const selectedGroup = nodes.find((n: Node | Group) => 
      n.id === selectedNodeId && n.type === BlockEnum.GROUP
    ) as Group;
    
    let position;
    let groupId;
    
    // 🆕 获取正确的节点尺寸
    const defaultSize = getDefaultNodeSize(BlockEnum.NODE);
    
    if (selectedGroup) {
      console.log('📦 在选中的群组内创建节点:', selectedGroup.id);
      
      // 确保群组位置有效，使用安全的数值转换
      const safeGroupPosition = {
        x: safeNumber(selectedGroup.position?.x, 0),
        y: safeNumber(selectedGroup.position?.y, 0)
      };
      
      // 确保群组尺寸有效
      const safeGroupWidth = safeNumber(selectedGroup.width, 300);
      const safeGroupHeight = safeNumber(selectedGroup.height, 200);
      
      console.log('  📍 群组安全位置:', safeGroupPosition);
      console.log('  📏 群组安全尺寸:', { width: safeGroupWidth, height: safeGroupHeight });
      
      // 计算群组内当前已有节点的数量
      const existingNodesInGroup = nodes.filter((n: Node | Group) => 
        n.type === BlockEnum.NODE && (n as Node).groupId === selectedGroup.id
      );
      
      // 使用网格布局避免节点重叠
      const nodesPerRow = 2; // 🔧 从3改为2,因为节点变大了
      const nodeIndex = existingNodesInGroup.length;
      const row = Math.floor(nodeIndex / nodesPerRow);
      const col = nodeIndex % nodesPerRow;
      
      const nodeSpacingX = 380; // 🔧 节点宽度(350) + 间距(30)
      const nodeSpacingY = 310; // 🔧 节点高度(280) + 间距(30)
      
      // 计算节点在群组内的相对位置
      const relativeX = GROUP_PADDING.left + (col * nodeSpacingX);
      const relativeY = GROUP_PADDING.top + (row * nodeSpacingY);
      
      // 计算绝对位置：群组位置 + 相对位置
      position = {
        x: safeNumber(safeGroupPosition.x + relativeX, relativeX),
        y: safeNumber(safeGroupPosition.y + relativeY, relativeY)
      };
      
      // 确保节点不会超出群组边界
      const maxX = safeGroupPosition.x + safeGroupWidth - GROUP_PADDING.right - defaultSize.width;
      const maxY = safeGroupPosition.y + safeGroupHeight - GROUP_PADDING.bottom - defaultSize.height;
      
      // 如果超出边界，约束到边界内
      position.x = Math.max(
        safeGroupPosition.x + GROUP_PADDING.left,
        Math.min(position.x, maxX)
      );
      position.y = Math.max(
        safeGroupPosition.y + GROUP_PADDING.top,
        Math.min(position.y, maxY)
      );
      
      // 最后的安全检查
      position.x = safeNumber(position.x, safeGroupPosition.x + GROUP_PADDING.left);
      position.y = safeNumber(position.y, safeGroupPosition.y + GROUP_PADDING.top);
      
      groupId = selectedGroup.id;
      
      console.log('  📍 新节点位置（绝对坐标）:', position);
      console.log('  📊 群组内已有节点数:', existingNodesInGroup.length);
      console.log('  🎯 相对位置:', { x: relativeX, y: relativeY });
    } else {
      // 没有选中群组时，在当前视图中心创建节点
      try {
        const viewPort = reactFlowInstance?.getViewport();
        const center = reactFlowInstance?.screenToFlowPosition({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2
        });
        
        position = {
          x: safeNumber(center?.x, safeNumber(viewPort?.x, 0) + 200),
          y: safeNumber(center?.y, safeNumber(viewPort?.y, 0) + 100)
        };
      } catch (error) {
        console.error('计算视图中心位置失败:', error);
        position = { x: 200, y: 100 };
      }
      
      console.log('  📍 新节点位置（画布中心）:', position);
    }
    
    // 最终验证位置有效性
    if (!position || isNaN(position.x) || isNaN(position.y)) {
      console.error('❌ 位置计算错误，使用默认值');
      position = { x: 100, y: 100 };
    }
    
    // 获取当前节点数量用于标题
    const nodeCount = nodes.filter((n: Node | Group) => 
      n.type === BlockEnum.NODE
    ).length;
    
    // 创建新节点
    const newNode: Node = {
      id: `node_${Date.now()}`,
      type: BlockEnum.NODE,
      position: {
        x: safeNumber(position.x),
        y: safeNumber(position.y)
      },
      data: { 
        title: `Node ${nodeCount + 1}`, 
        content: 'Double click to edit',
        isExpanded: false, // 🆕 默认收缩状态
      },
      title: `Node ${nodeCount + 1}`,
      content: 'Double click to edit',
      width: defaultSize.width,   // 🔧 使用正确的尺寸 350
      height: defaultSize.height, // 🔧 使用正确的尺寸 280
      createdAt: new Date(),
      updatedAt: new Date(),
      ...(groupId && { groupId }) // 如果有群组ID，添加groupId属性
    };
    
    console.log('✅ 创建节点:', newNode);
    
    // 添加节点到store
    addNode(newNode);
    setSelectedNodeId(newNode.id);
    
    // 如果节点属于群组，延迟更新群组边界以确保节点被包含
    if (groupId) {
      setTimeout(() => {
        console.log('📐 更新群组边界:', groupId);
        updateGroupBoundary(groupId);
      }, 100);
    }
  }, [addNode, nodes, selectedNodeId, setSelectedNodeId, reactFlowInstance, updateGroupBoundary]);

  // 添加群组的处理函数
  const onGroupAdd = useCallback(() => {
    console.log('➕ 创建新群组');
    
    try {
      // 在当前视图中心创建群组
      const viewPort = reactFlowInstance?.getViewport();
      const center = reactFlowInstance?.screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      });
      
      let position = {
        x: safeNumber(center?.x, safeNumber(viewPort?.x, 0) + 200),
        y: safeNumber(center?.y, safeNumber(viewPort?.y, 0) + 100)
      };
      
      const groupCount = nodes.filter((n: Node | Group) => 
        n.type === BlockEnum.GROUP
      ).length;
      
      const newGroup: Group = {
        id: `group_${Date.now()}`,
        type: BlockEnum.GROUP,
        position: {
          x: safeNumber(position.x),
          y: safeNumber(position.y)
        },
        data: { 
          title: `Group ${groupCount + 1}`, 
          content: 'Select this group and click "Add Node" to add nodes inside' 
        },
        title: `Group ${groupCount + 1}`,
        content: 'Select this group and click "Add Node" to add nodes inside',
        collapsed: false,
        nodeIds: [],
        boundary: { minX: 0, minY: 0, maxX: 300, maxY: 200 },
        createdAt: new Date(),
        updatedAt: new Date(),
        width: 300,
        height: 200,
      };
      
      console.log('✅ 创建群组:', newGroup);
      
      addNode(newGroup);
      setSelectedNodeId(newGroup.id);
    } catch (error) {
      console.error('创建群组失败:', error);
    }
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

      try {
        let position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        // 确保位置坐标有效
        position = {
          x: safeNumber(position?.x, 0),
          y: safeNumber(position?.y, 0)
        };

        // 🆕 获取正确的节点尺寸
        const defaultSize = getDefaultNodeSize(BlockEnum.NODE);

        const newNode: Node = {
          id: `node_${Date.now()}`,
          type: BlockEnum.NODE,
          position,
          data: { 
            title: `New Node`, 
            content: 'Double click to edit',
            isExpanded: false, // 🆕 默认收缩状态
          },
          title: 'New Node',
          content: 'Double click to edit',
          width: defaultSize.width,   // 🔧 使用正确的尺寸 350
          height: defaultSize.height, // 🔧 使用正确的尺寸 280
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        addNode(newNode);
        setSelectedNodeId(newNode.id);
      } catch (error) {
        console.error('放置节点失败:', error);
      }
    },
    [reactFlowInstance, addNode, setSelectedNodeId]
  );

  return {
    onNodeAdd,
    onGroupAdd,
    onDragOver,
    onDrop
  };
};
